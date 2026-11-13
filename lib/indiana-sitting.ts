import "server-only";
import { randomInt, randomUUID } from "node:crypto";
import { pickInFullExam, publishedInQuestions } from "@/data/in-questions";
import { indianaEntitlement } from "@/lib/entitlements";
import type { Store } from "@/lib/store/types";

// Keep reservations separate from the normalizable Daily Study document.
export const IN_SITTING_STATE = "IN_FULL";
export type IndianaSitting = {
  examId: string;
  seed: number;
  questionIds: string[];
  questionVersions: Record<string, number>;
  pro: boolean;
  startedAt: string;
};
type SittingDocument = { trialUsed?: boolean; sitting?: IndianaSitting };
export type IndianaAnswer = { questionId: string; questionVersion: number; selected?: "A" | "B" | "C" | "D" };

export function newIndianaSitting(pro: boolean, examId: string = randomUUID(), seed = randomInt(0, 1000000001), startedAt = new Date().toISOString()): IndianaSitting {
  const draw = pickInFullExam(seed, pro);
  if (!draw || draw.questions.length !== 30 || new Set(draw.questions.map(question => question.question_id)).size !== 30) throw new Error("invalid_exam");
  if (!pro && draw.questions.some(question => !question.is_free)) throw new Error("invalid_exam");
  return { examId, seed, questionIds: draw.questions.map(question => question.question_id),
    questionVersions: Object.fromEntries(draw.questions.map(question => [question.question_id, question.version])),
    pro, startedAt };
}

export function indianaSittingQuestions(sitting: IndianaSitting) {
  const bank = new Map(publishedInQuestions().map(question => [question.question_id, question]));
  return sitting.questionIds.map(id => {
    const question = bank.get(id);
    if (!question || question.state !== "IN" || question.version !== sitting.questionVersions[id]) throw new Error("question_updated");
    if (!sitting.pro && !question.is_free) throw new Error("pro_required");
    return question;
  });
}

export function validateIndianaAnswers(sitting: IndianaSitting, answers: IndianaAnswer[]) {
  if (answers.length !== 30 || sitting.questionIds.length !== 30 || new Set(answers.map(answer => answer.questionId)).size !== 30 || answers.some((answer, index) => answer.questionId !== sitting.questionIds[index])) throw new Error("invalid_exam");
  const questions = indianaSittingQuestions(sitting);
  for (let index = 0; index < answers.length; index++) {
    const answer = answers[index], question = questions[index];
    if (answer.questionVersion !== question.version) throw new Error("question_updated");
    if (answer.selected && !question[`option_${answer.selected.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"]) throw new Error("invalid_exam");
    if (!sitting.pro && !question.is_free) throw new Error("invalid_exam");
  }
  return questions;
}

export async function readIndianaSitting(store: Store, userId: string) {
  return ((await store.getStudyPlan(userId, IN_SITTING_STATE))?.document as SittingDocument | undefined)?.sitting ?? null;
}

export async function startIndianaSitting(store: Store, userId: string, examId?: string) {
  return store.learningTransaction(userId, async transaction => {
    const document = (await transaction.getStudyPlan(userId, IN_SITTING_STATE))?.document as SittingDocument | undefined;
    const exams = await transaction.listExams(userId);
    const pro = Boolean(indianaEntitlement(await transaction.listEntitlements(userId)));
    const active = document?.sitting;
    if (active && !exams.some(exam => exam.id === active.examId)) {
      if (active.pro && !pro) throw new Error("pro_required");
      indianaSittingQuestions(active);
      return active;
    }
    if (!pro && (document?.trialUsed || exams.some(exam => exam.mode === "in-full"))) throw new Error("full_trial_used");
    const sitting = newIndianaSitting(pro, examId);
    await transaction.saveStudyPlan({ userId, state: IN_SITTING_STATE, document: { ...document, trialUsed: document?.trialUsed || !pro, sitting } });
    return sitting;
  });
}

/** Called inside the same account lock and rollback boundary as grading. */
export async function requireIndianaSitting(store: Store, userId: string, examId: string, answers: IndianaAnswer[], pro: boolean) {
  const sitting = await readIndianaSitting(store, userId);
  if (!sitting || sitting.examId !== examId) throw new Error("invalid_exam");
  if (sitting.pro && !pro) throw new Error("pro_required");
  validateIndianaAnswers(sitting, answers);
  return sitting;
}
