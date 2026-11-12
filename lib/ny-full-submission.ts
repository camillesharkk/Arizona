import { questionById } from "./prep-pack";
import { accountProCovers } from "./account-pro.ts";
import { recordQuestionAnswer } from "./progress";
import { FREE_FULL_EXAMS } from "./product";
import { scorePercent } from "./quiz";
import type { Store } from "./store/types";

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
      return { ok: true, duplicate: true, exam: existing };
    }
    if (input.questions.length !== 40 || new Set(input.questions.map(answer => answer.questionId)).size !== 40) throw new Error("invalid_exam");
    const questions = input.questions.map(answer => {
      const question = questionById(answer.questionId);
      if (!question || question.state !== "NY") throw new Error("invalid_exam");
      if (question.version !== answer.questionVersion) throw new Error("question_updated");
      return { question, selected: answer.selected };
    });
    const now = new Date();
    const pro = accountProCovers(await transaction.listEntitlements(userId), now);
    if (!pro && exams.filter(exam => exam.mode === "ny-full").length >= FREE_FULL_EXAMS) throw new Error("full_trial_used");
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
      ...document, checks: { ...checks, [input.examId]: { wrong: wrongIds.length, skipped, wrongIds } },
    } });
    const exam = { id: input.examId, userId, mode: "ny-full", score: scorePercent(correctCount, 40), correctCount, total: 40, at: now.toISOString() };
    if (!await transaction.addExam(exam)) throw new Error("exam_conflict");
    return { ok: true, duplicate: false, exam };
  });
}
