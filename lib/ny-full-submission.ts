import { serverStateQuestions } from '../data/full-state-server';
import { isFreeState } from './free-state-catalog';
import { shuffle } from './answer-sequence';
import { packFor } from "./prep-pack";
import { publishedQuestions } from "../data/questions";
import { publishedCaQuestions } from "../data/ca-questions";
import { publishedHiQuestions } from "../data/hi-questions";
import { examConfig } from "../data/exam-config";
import { CA_EXAM } from "./ca-site";
import { HI_EXAM } from "./hi-site";
import { pickCaFullExam } from "./ca-exam";
import { pickHiFullExam } from "./hi-exam";
import type { StateCode } from "./types";
import { accountProCovers, ctProCovers } from "./account-pro.ts";
import { stateProCovers, NC_PRO_PRODUCT, entitlementServesState } from "./state-pro.ts";
import { serverQuestionById as questionById } from "./server-questions";
import { indianaEntitlement } from "./entitlements";
import { requireIndianaSitting } from "./indiana-sitting";
import { isSiteProProduct } from "./pro-products.ts";
import type { ProUsageContext } from "./commerce/usage";
import { applyStreak, recordQuestionAnswer } from "./progress";
import { FREE_FULL_EXAMS } from "./product";
import { pickFullExam, scorePercent } from "./quiz";
import type { QuestionStat, Store } from "./store/types";

type UsageReceipt = ProUsageContext & { featureCode: "full_exam_extra" | "pro_question" };

type Answer = { questionId: string; questionVersion: number; selected?: "A" | "B" | "C" | "D"; attemptId?: string };

/** The trial grants this complete sitting's answers in the same transaction as its usage. */
type FullSubmission = {
  examId: string;
  questions: Answer[];
  timeZone?: string;
  seed?: number;
  unscoredIds?: string[];
  finishedAt?: string;
  guestSitting?: import("./indiana-sitting").IndianaSitting;
};

export function saveNyFullSubmission(store: Store, userId: string, input: FullSubmission) {
  return savePackFullSubmission(store, userId, { ...input, state: "NY" });
}

export async function savePackFullSubmission(store: Store, userId: string, input: FullSubmission & { state: StateCode }) {
  const state = input.state;
  const pack = packFor(state);
  const classic = {
    AZ: { fullCount: examConfig.questionCount, pickFull: (seed: number) => ({ questions: pickFullExam(seed), unscoredIds: [] as string[] }) },
    CA: { fullCount: CA_EXAM.questionCount, pickFull: pickCaFullExam },
    HI: {
      fullCount: HI_EXAM.practiceQuestionCount,
      pickFull: (seed: number) => {
        const questions = pickHiFullExam(seed);
        return questions ? { questions, unscoredIds: [] as string[] } : null;
      },
    },
  };
  const config = pack || classic[state as keyof typeof classic];
  if (!config) throw new Error("invalid_exam");
  const mode = state === "AZ" ? "full" : `${state.toLowerCase()}-full`;
  return store.learningTransaction(userId, async transaction => {
    const exams = await transaction.listExams(userId);
    const savedFullCount = exams.filter(exam => exam.mode === mode).length;
    const existing = exams.find(exam => exam.id === input.examId);
    const plan = await transaction.getStudyPlan(userId, state);
    const savedDocument = plan?.document as { checks?: Record<string, { proUsage?: UsageReceipt; submissionVersion?: number }> } | undefined;
    if (existing) {
      if (existing.mode !== mode) throw new Error("invalid_exam");
      if (pack || savedDocument?.checks?.[input.examId]?.submissionVersion === 1) {
        return { ok: true, duplicate: true, exam: existing, fullExamCount: savedFullCount, proUsage: savedDocument?.checks?.[input.examId]?.proUsage };
      }
    }
    const now = new Date();
    const entitlements = await transaction.listEntitlements(userId);
    const pro = state === "IN" ? Boolean(indianaEntitlement(entitlements, now)) : state === "CT" ? ctProCovers(entitlements, now) : stateProCovers(entitlements, state, now);
    const expectedCount = pack?.fullCountFor?.(pro) ?? config.fullCount;
    if (input.questions.length !== expectedCount || new Set(input.questions.map(answer => answer.questionId)).size !== expectedCount) throw new Error("invalid_exam");
    if (state === "IN") await requireIndianaSitting(transaction, userId, input.examId, input.questions, pro, input.guestSitting);
    const draw = state !== "IN" && state !== "NY" && Number.isSafeInteger(input.seed) ? (isFreeState(state) ? { questions: shuffle(serverStateQuestions(state).filter(question => pro || question.is_free), input.seed!).slice(0, expectedCount), unscoredIds: [] } : pack ? pack.pickFull(input.seed!, pro) : classic[state as keyof typeof classic].pickFull(input.seed!)) : null;
    const matchesCurrentDraw = Boolean(draw && draw.questions.every((question, index) => question.question_id === input.questions[index]?.questionId));
    const matchesFreeDraw = isFreeState(state) && pro && Number.isSafeInteger(input.seed) &&
      shuffle(serverStateQuestions(state).filter(question => question.is_free), input.seed!).slice(0, expectedCount)
        .every((question, index) => question.question_id === input.questions[index]?.questionId);
    const matchesDraw = matchesCurrentDraw || matchesFreeDraw;
    if ((state === "LA" || state === "CT" || isFreeState(state)) && !matchesDraw) throw new Error("invalid_exam");
    // A bank expansion must not redraw a saved PA sitting. A legacy sitting may
    // supply its persisted unscored identities, but every quota is checked here.
    const splitScore = state === "PA" || state === "CA";
    const unscored = new Set(splitScore ? (matchesDraw ? draw?.unscoredIds || [] : input.unscoredIds || []) : []);
    const classicBank = new Map([...publishedQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions()].map(question => [question.question_id, question]));
    const questions = input.questions.map(answer => {
      const question = classicBank.get(answer.questionId) ?? questionById(answer.questionId);
      if (!question || question.state !== state) throw new Error("invalid_exam");
      if (question.version !== answer.questionVersion) throw new Error("question_updated");
      if (answer.selected && !question[`option_${answer.selected.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"]) throw new Error("invalid_exam");
      if (existing && answer.selected && !answer.attemptId) throw new Error("legacy_attempts_required");
      return { question, selected: answer.selected, attemptId: answer.attemptId || `${input.examId}:${question.question_id}` };
    });
    const attemptIds = questions.filter(answer => answer.selected).map(answer => answer.attemptId);
    if (new Set(attemptIds).size !== attemptIds.length) throw new Error("invalid_exam");
    if (state === "PA") {
      const ids = new Set(questions.map(({ question }) => question.question_id));
      if (unscored.size !== 5 || [...unscored].some(id => !ids.has(id))) throw new Error("invalid_exam");
      for (const [area, scored, pretest] of [["obtaining",4,1],["performing",18,3],["compliance",3,1]] as const) {
        if (questions.filter(({ question }) => question.exam_area === area && !unscored.has(question.question_id)).length !== scored ||
            questions.filter(({ question }) => question.exam_area === area && unscored.has(question.question_id)).length !== pretest) throw new Error("invalid_exam");
      }
    }
    if (state === "CA") {
      const ids = new Set(questions.map(({ question }) => question.question_id));
      if (unscored.size !== CA_EXAM.unscoredCount || [...unscored].some(id => !ids.has(id))) throw new Error("invalid_exam");
      for (const quota of CA_EXAM.quotas) {
        if (questions.filter(({ question }) => question.exam_area === quota.area && !unscored.has(question.question_id)).length !== quota.count) throw new Error("invalid_exam");
      }
    }
    if (state === "NC" && questions.some(({ question }) => !pro && !question.is_free)) throw new Error("invalid_exam");
    const fullCount = exams.filter(exam => exam.mode === mode && exam.id !== input.examId).length;
    if (!existing && !pro && fullCount >= FREE_FULL_EXAMS) throw new Error("full_trial_used");
    let proUsageFeature: "full_exam_extra" | "pro_question" | undefined;
    if (pro && fullCount >= FREE_FULL_EXAMS) proUsageFeature = "full_exam_extra";
    else if (pro && questions.some(({ question, selected }) => selected && !question.is_free)) proUsageFeature = "pro_question";
    const proUsage: UsageReceipt | undefined = proUsageFeature ? {
      eventId: `${mode}:${input.examId}`, featureCode: proUsageFeature, at: now.toISOString(),
      entitlementIds: entitlements.filter(entitlement => entitlement.status === "active" && entitlementServesState(entitlement, state)
        && new Date(entitlement.startsAt) <= now && new Date(entitlement.expiresAt) > now).map(entitlement => entitlement.id),
    } : undefined;
    const wrongIds: string[] = [];
    let correctCount = 0;
    let skipped = 0;
    // The user lock covers this entire sitting. Reuse these immutable reads rather
    // than rereading the same plan and user for every answer over the network.
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
      const attempts = questions.filter(({ selected }) => selected).map(({ question, attemptId }) => ({
        attemptId, questionId: question.question_id,
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
    for (const { question, selected, attemptId } of questions) {
      if (!selected) {
        skipped += 1;
        continue;
      }
      const correct = selected === question.correct_option;
      if (correct) { if (!unscored.has(question.question_id)) correctCount += 1; }
      else wrongIds.push(question.question_id);
      await recordQuestionAnswer({
        userId, questionId: question.question_id, selected, correct,
        attemptId, timeZone: input.timeZone, store: answerStore,
      });
    }
    const total = questions.length - unscored.size;
    const score = scorePercent(correctCount, total);
    if (existing && (existing.score !== score || existing.correctCount !== correctCount || existing.total !== total)) throw new Error("invalid_exam");
    if (pendingStats.length) await transaction.upsertStats!(pendingStats);
    if (!pack && user) {
      userPatch = { ...userPatch, ...applyStreak(user) };
      if (state === "AZ") userPatch.bestScore = Math.max(user.bestScore ?? score, score);
    }
    if (userPatch) await transaction.updateUser(userId, userPatch);
    const document = (plan?.document || {}) as Record<string, unknown>;
    const checks = (document.checks || {}) as Record<string, unknown>;
    await transaction.saveStudyPlan({ userId, state, document: {
      ...document, checks: { ...checks, [input.examId]: { wrong: wrongIds.length, skipped, wrongIds, unscoredIds: [...unscored], submissionVersion: 1, ...(proUsage ? { proUsage } : {}) } },
    } });
    const exam = existing || { id: input.examId, userId, mode, score, correctCount, total, at: input.finishedAt || now.toISOString() };
    if (!existing && !await transaction.addExam(exam)) throw new Error("exam_conflict");
    return { ok: true, duplicate: Boolean(existing), exam, fullExamCount: existing ? savedFullCount : savedFullCount + 1, proUsage };
  });
}
