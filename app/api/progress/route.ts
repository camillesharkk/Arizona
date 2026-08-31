import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { canAccessQuestion } from "@/lib/entitlements";
import { publishedQuestions } from "@/data/questions";
import { recordExam, recordQuestionAnswer } from "@/lib/progress";
import { getStore } from "@/lib/store";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";

const answerSchema = z.object({
  questionId: z.string(),
  selected: z.enum(["A", "B", "C", "D"]),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.kind === "exam") {
    const exam = z
      .object({ mode: z.string(), score: z.number(), correctCount: z.number(), total: z.number() })
      .safeParse(body);
    if (!exam.success) return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    await recordExam({ ...exam.data, userId: session.id });
    return NextResponse.json({ ok: true });
  }
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  const q = publishedQuestions().find((x) => x.question_id === parsed.data.questionId);
  if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  if (!canAccessQuestion(session, q)) return NextResponse.json({ error: "Pro required" }, { status: 402 });
  const correct = parsed.data.selected === q.correct_option;
  const stat = await recordQuestionAnswer({
    userId: session.id,
    questionId: q.question_id,
    selected: parsed.data.selected,
    correct,
  });
  return NextResponse.json({ ok: true, correct, stat: toClientStat(stat) });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const store = await getStore();
  const [stats, exams, user] = await Promise.all([
    store.listStats(session.id),
    store.listExams(session.id),
    store.getUserById(session.id),
  ]);
  return NextResponse.json({
    stats: stats.map(toClientStat),
    exams: exams.map(toClientExam),
    user: user ? toClientUser(user) : null,
  });
}

function toClientUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    plan: user.plan,
    planStatus: user.planStatus,
    planExpiresAt: user.planExpiresAt,
    emailDaily: user.emailDaily,
    emailWeekly: user.emailWeekly,
    emailExam: user.emailExam,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastStudyAt: user.lastStudyAt,
    streakDays: user.streakDays,
    lastStudyDate: user.lastStudyDate,
    bestScore: user.bestScore,
  };
}

function toClientStat(stat: QuestionStat) {
  const { userId: _owner, ...rest } = stat;
  return rest;
}

function toClientExam(exam: ExamRow) {
  const { userId: _owner, ...rest } = exam;
  return rest;
}
