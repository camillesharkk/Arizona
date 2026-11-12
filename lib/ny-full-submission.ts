import { questionById } from "./prep-pack";
import { accountProCovers } from "./account-pro.ts";
import { isSiteProProduct } from "./pro-products.ts";
import type { ProUsageContext } from "./commerce/usage";
import { recordQuestionAnswer } from "./progress";
import { FREE_FULL_EXAMS } from "./product";
import { scorePercent } from "./quiz";
import type { Store } from "./store/types";

type UsageReceipt = ProUsageContext & { featureCode: "full_exam_extra" | "pro_question" };

type Answer = { questionId: string; questionVersion: number; selected?: "A" | "B" | "C" | "D" };

/** The trial grants this complete sitting's answers in the same transaction as its usage. */
export async function saveNyFullSubmission(store: Store, userId: string, input: {
  examId: string;
  questions: Answer[];
  timeZone?: string;
}) {
  return store.learningTransaction(userId, async transaction => {
    const exams = await transaction.listExams(userId);
    const existing = exams.find(exam => exam.id === input.examId);
    if (existing) {
      if (existing.mode !== "ny-full") throw new Error("invalid_exam");
      const plan = await transaction.getStudyPlan(userId, "NY");
      const document = plan?.document as { checks?: Record<string, { proUsage?: UsageReceipt }> } | undefined;
      return { ok: true, duplicate: true, exam: existing, proUsage: document?.checks?.[input.examId]?.proUsage };
    }
    if (input.questions.length !== 40 || new Set(input.questions.map(answer => answer.questionId)).size !== 40) throw new Error("invalid_exam");
    const questions = input.questions.map(answer => {
      const question = questionById(answer.questionId);
      if (!question || question.state !== "NY") throw new Error("invalid_exam");
      if (question.version !== answer.questionVersion) throw new Error("question_updated");
      return { question, selected: answer.selected };
    });
    const now = new Date();
    const entitlements = await transaction.listEntitlements(userId);
    const pro = accountProCovers(entitlements, now);
    const fullCount = exams.filter(exam => exam.mode === "ny-full").length;
    if (!pro && fullCount >= FREE_FULL_EXAMS) throw new Error("full_trial_used");
    let proUsageFeature: "full_exam_extra" | "pro_question" | undefined;
    if (pro && fullCount >= FREE_FULL_EXAMS) proUsageFeature = "full_exam_extra";
    else if (pro && questions.some(({ question, selected }) => selected && !question.is_free)) proUsageFeature = "pro_question";
    const proUsage: UsageReceipt | undefined = proUsageFeature ? {
      eventId: `ny-full:${input.examId}`, featureCode: proUsageFeature, at: now.toISOString(),
      entitlementIds: entitlements.filter(entitlement => entitlement.status === "active" && isSiteProProduct(entitlement.productCode)
        && new Date(entitlement.startsAt) <= now && new Date(entitlement.expiresAt) > now).map(entitlement => entitlement.id),
    } : undefined;
    const wrongIds: string[] = [];
    let correctCount = 0;
    let skipped = 0;
    for (const { question, selected } of questions) {
      if (!selected) {
        skipped += 1;
        continue;
      }
      const correct = selected === question.correct_option;
      if (correct) correctCount += 1;
      else wrongIds.push(question.question_id);
      await recordQuestionAnswer({
        userId, questionId: question.question_id, selected, correct,
        attemptId: `${input.examId}:${question.question_id}`, timeZone: input.timeZone, store: transaction,
      });
    }
    const plan = await transaction.getStudyPlan(userId, "NY");
    const document = (plan?.document || {}) as Record<string, unknown>;
    const checks = (document.checks || {}) as Record<string, unknown>;
    await transaction.saveStudyPlan({ userId, state: "NY", document: {
      ...document, checks: { ...checks, [input.examId]: { wrong: wrongIds.length, skipped, wrongIds, ...(proUsage ? { proUsage } : {}) } },
    } });
    const exam = { id: input.examId, userId, mode: "ny-full", score: scorePercent(correctCount, 40), correctCount, total: 40, at: now.toISOString() };
    if (!await transaction.addExam(exam)) throw new Error("exam_conflict");
    return { ok: true, duplicate: false, exam, proUsage };
  });
}
