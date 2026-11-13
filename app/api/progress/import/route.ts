import { NextResponse } from "next/server";
import { z } from "zod";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { questionById } from "@/lib/prep-pack";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { productionStateBlocked } from "@/lib/state-release";
import { recordQuestionAnswers } from "@/lib/progress";

const schema = z.object({
  accountId: z.string().min(1),
  state: z.enum(["AZ", "CA", "HI", "NY", "PA", "LA", "CT", "NC"]),
  examId: z.string().uuid(),
  finishedAt: z.string().datetime(),
  timeZone: z.string().max(80).optional(),
  questions: z.array(z.object({
    questionId: z.string().max(80),
    questionVersion: z.number().int().positive(),
    selected: z.enum(["A", "B", "C", "D"]).optional(),
    attemptId: z.string().min(8).max(80).optional(),
  })).min(1).max(10),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid practice" }, { status: 400 });
  const input = parsed.data;
  if (input.accountId !== session.id) return NextResponse.json({ error: "Account changed" }, { status: 409 });
  if (productionStateBlocked(input.state)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  const bank = [...publishedQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions()];
  const questions = input.questions.map(answer => ({ answer, question: bank.find(question => question.question_id === answer.questionId) ?? questionById(answer.questionId) }));
  if (new Set(input.questions.map(answer => answer.questionId)).size !== questions.length || questions.some(({ question, answer }) => !question || question.state !== input.state || !question.is_free || (answer.selected && !question[`option_${answer.selected.toLowerCase()}` as "option_a" | "option_b" | "option_c" | "option_d"]))) {
    return NextResponse.json({ error: "Invalid practice questions" }, { status: 400 });
  }
  if (questions.some(({ question, answer }) => question!.version !== answer.questionVersion)) {
    return NextResponse.json({ error: "Earlier question version remains saved on this device", code: "question_updated" }, { status: 409 });
  }
  const store = await getStore();
  const result = await store.learningTransaction(session.id, async transaction => {
    const existing = (await transaction.listExams(session.id)).find(exam => exam.id === input.examId);
    if (existing) return { ok: true, duplicate: true, exam: existing };
    const plan = await transaction.getStudyPlan(session.id, input.state);
    const answered = questions.flatMap(({ question, answer }) => answer.selected ? [{
      questionId: answer.questionId, selected: answer.selected, correct: answer.selected === question!.correct_option,
      attemptId: answer.attemptId || `${input.examId}:${answer.questionId}`,
    }] : []);
    await recordQuestionAnswers({ store: transaction, userId: session.id, state: input.state, answers: answered, plan, timeZone: input.timeZone });
    const correctCount = answered.filter(answer => answer.correct).length;
    const wrongIds = answered.filter(answer => !answer.correct).map(answer => answer.questionId);
    const document = (plan?.document || {}) as Record<string, unknown>;
    const checks = (document.checks || {}) as Record<string, unknown>;
    await transaction.saveStudyPlan({ userId: session.id, state: input.state, document: {
      ...document, checks: { ...checks, [input.examId]: { wrongIds, wrong: wrongIds.length, skipped: questions.length - answered.length } },
    } });
    const exam = {
      id: input.examId, userId: session.id, mode: input.state === "AZ" ? "quick" : `${input.state.toLowerCase()}-quick`,
      score: Math.round(correctCount / questions.length * 100), correctCount, total: questions.length, at: input.finishedAt,
    };
    if (!await transaction.addExam(exam)) throw new Error("exam_conflict");
    return { ok: true, duplicate: false, exam };
  });
  return NextResponse.json(result, { headers: { "Cache-Control": "private, no-store" } });
}
