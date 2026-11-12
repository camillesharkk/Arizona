import { packFor, questionById, type PrepCode } from "./prep-pack";
import { accountProCovers } from "./account-pro.ts";
import { isSiteProProduct } from "./pro-products.ts";
import type { ProUsageContext } from "./commerce/usage";
import { recordQuestionAnswer } from "./progress";
import { FREE_FULL_EXAMS } from "./product";
import { scorePercent } from "./quiz";
import type { QuestionStat, Store } from "./store/types";

type UsageReceipt = ProUsageContext & { featureCode: "full_exam_extra" | "pro_question" };

type Answer = { questionId: string; questionVersion: number; selected?: "A" | "B" | "C" | "D" };

/** The trial grants this complete sitting's answers in the same transaction as its usage. */
type FullSubmission = {
  examId: string;
  questions: Answer[];
  timeZone?: string;
  seed?: number;
  unscoredIds?: string[];
};

export function saveNyFullSubmission(store: Store, userId: string, input: FullSubmission) {
  return savePackFullSubmission(store, userId, { ...input, state: "NY" });
}

export async function savePackFullSubmission(store: Store, userId: string, input: FullSubmission & { state: PrepCode }) {
  const state = input.state;
  const pack = packFor(state);
  if (!pack) throw new Error("invalid_exam");
  const mode = `${state.toLowerCase()}-full`;
  return store.learningTransaction(userId, async transaction => {
    const exams = await transaction.listExams(userId);
    const existing = exams.find(exam => exam.id === input.examId);
    if (existing) {
      if (existing.mode !== mode) throw new Error("invalid_exam");
      const plan = await transaction.getStudyPlan(userId, state);
      const document = plan?.document as { checks?: Record<string, { proUsage?: UsageReceipt }> } | undefined;
      return { ok: true, duplicate: true, exam: existing, proUsage: document?.checks?.[input.examId]?.proUsage };
    }
    if (input.questions.length !== pack.fullCount || new Set(input.questions.map(answer => answer.questionId)).size !== pack.fullCount) throw new Error("invalid_exam");
    const draw = state !== "NY" && Number.isSafeInteger(input.seed) ? pack.pickFull(input.seed!) : null;
    const matchesDraw = Boolean(draw && draw.questions.every((question, index) => question.question_id === input.questions[index]?.questionId));
    if (state === "LA" && !matchesDraw) throw new Error("invalid_exam");
    // A bank expansion must not redraw a saved PA sitting. A legacy sitting may
    // supply its persisted unscored identities, but every quota is checked here.
    const unscored = new Set(state === "PA" && !matchesDraw ? input.unscoredIds || [] : draw?.unscoredIds || []);
    const questions = input.questions.map(answer => {
      const question = questionById(answer.questionId);
      if (!question || question.state !== state) throw new Error("invalid_exam");
      if (question.version !== answer.questionVersion) throw new Error("question_updated");
      if (answer.selected && !question[`option_${answer.selected.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"]) throw new Error("invalid_exam");
      return { question, selected: answer.selected };
    });
    if (state === "PA") {
      const ids = new Set(questions.map(({ question }) => question.question_id));
      if (unscored.size !== 5 || [...unscored].some(id => !ids.has(id))) throw new Error("invalid_exam");
      for (const [area, scored, pretest] of [["obtaining",4,1],["performing",18,3],["compliance",3,1]] as const) {
        if (questions.filter(({ question }) => question.exam_area === area && !unscored.has(question.question_id)).length !== scored ||
            questions.filter(({ question }) => question.exam_area === area && unscored.has(question.question_id)).length !== pretest) throw new Error("invalid_exam");
      }
    }
    const now = new Date();
    const entitlements = await transaction.listEntitlements(userId);
    const pro = accountProCovers(entitlements, now);
    const fullCount = exams.filter(exam => exam.mode === mode).length;
    if (!pro && fullCount >= FREE_FULL_EXAMS) throw new Error("full_trial_used");
    let proUsageFeature: "full_exam_extra" | "pro_question" | undefined;
    if (pro && fullCount >= FREE_FULL_EXAMS) proUsageFeature = "full_exam_extra";
    else if (pro && questions.some(({ question, selected }) => selected && !question.is_free)) proUsageFeature = "pro_question";
    const proUsage: UsageReceipt | undefined = proUsageFeature ? {
      eventId: `${mode}:${input.examId}`, featureCode: proUsageFeature, at: now.toISOString(),
      entitlementIds: entitlements.filter(entitlement => entitlement.status === "active" && isSiteProProduct(entitlement.productCode)
        && new Date(entitlement.startsAt) <= now && new Date(entitlement.expiresAt) > now).map(entitlement => entitlement.id),
    } : undefined;
    const wrongIds: string[] = [];
    let correctCount = 0;
    let skipped = 0;
    // The user lock covers this entire sitting. Reuse these immutable reads rather
    // than rereading the same plan and user for every answer over the network.
    const plan = await transaction.getStudyPlan(userId, state);
    let user = await transaction.getUserById(userId);
    let userPatch: Parameters<Store["updateUser"]>[1] | undefined;
    const answerStore: Store = Object.assign(Object.create(transaction) as Store, {
      getStudyPlan: async (id: string, code: string) => id === userId && code === state ? plan : transaction.getStudyPlan(id, code),
      getUserById: async (id: string) => id === userId ? user : transaction.getUserById(id),
      updateUser: async (id: string, patch: Parameters<Store["updateUser"]>[1]) => {
        if (id !== userId || !user) return transaction.updateUser(id, patch);
        userPatch = { ...userPatch, ...patch };
        user = { ...user, ...patch };
        return user;
      },
    });
    const pendingStats: QuestionStat[] = [];
    if (transaction.claimAttempts && transaction.getStats && transaction.upsertStats) {
      const attempts = questions.filter(({ selected }) => selected).map(({ question }) => ({
        attemptId: `${input.examId}:${question.question_id}`, questionId: question.question_id,
      }));
      const fresh = new Set(await transaction.claimAttempts(userId, attempts));
      const stats = new Map((await transaction.getStats(userId, attempts.map(attempt => attempt.questionId)))
        .map(stat => [stat.questionId, stat]));
      // Keep the shared answer/revision/review logic while batching database I/O
      // under this sitting's existing account lock and rollback boundary.
      answerStore.claimAttempt = async (_id, attemptId) => fresh.has(attemptId);
      answerStore.getStat = async (_id, questionId) => stats.get(questionId) ?? null;
      answerStore.upsertStat = async stat => {
        stats.set(stat.questionId, stat);
        pendingStats.push(stat);
        return stat;
      };
    }
    for (const { question, selected } of questions) {
      if (!selected) {
        skipped += 1;
        continue;
      }
      const correct = selected === question.correct_option;
      if (correct) { if (!unscored.has(question.question_id)) correctCount += 1; }
      else wrongIds.push(question.question_id);
      await recordQuestionAnswer({
        userId, questionId: question.question_id, selected, correct,
        attemptId: `${input.examId}:${question.question_id}`, timeZone: input.timeZone, store: answerStore,
      });
    }
    if (pendingStats.length) await transaction.upsertStats!(pendingStats);
    if (userPatch) await transaction.updateUser(userId, userPatch);
    const document = (plan?.document || {}) as Record<string, unknown>;
    const checks = (document.checks || {}) as Record<string, unknown>;
    await transaction.saveStudyPlan({ userId, state, document: {
      ...document, checks: { ...checks, [input.examId]: { wrong: wrongIds.length, skipped, wrongIds, unscoredIds: [...unscored], ...(proUsage ? { proUsage } : {}) } },
    } });
    const total = questions.length - unscored.size;
    const exam = { id: input.examId, userId, mode, score: scorePercent(correctCount, total), correctCount, total, at: now.toISOString() };
    if (!await transaction.addExam(exam)) throw new Error("exam_conflict");
    return { ok: true, duplicate: false, exam, proUsage };
  });
}
