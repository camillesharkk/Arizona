import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { canAccessQuestion, canTakeFullExam, canUseAdvancedAnalytics, hasArizonaPro, fullExamCount, getArizonaEntitlement } from "@/lib/entitlements";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { recordProUsage } from "@/lib/commerce/usage";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { saveCaExamCheck } from "@/lib/ca-daily";
import { recordExam, recordQuestionAnswer } from "@/lib/progress";
import { getStore } from "@/lib/store";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";

const answerSchema = z.object({
  questionId: z.string(),
  selected: z.enum(["A", "B", "C", "D"]),
  attemptId: z.string().min(8).max(80).optional(),
  review: z.boolean().optional(),
  state: z.enum(["AZ", "CA"]).optional(),
  timeZone: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.kind === "exam") {
    const exam = z
      .object({
        mode: z.string(),
        score: z.number(),
        correctCount: z.number(),
        total: z.number(),
        examId: z.string().uuid().optional(),
        state: z.enum(["AZ", "CA"]).optional(),
        wrongIds: z.array(z.string().max(80)).max(45).optional(),
        skipped: z.number().int().min(0).max(45).optional(),
        timeZone: z.string().max(80).optional(),
      })
      .safeParse(body);
    if (!exam.success) return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    const store = await getStore();
    const california = exam.data.state === "CA";
    if (california && exam.data.examId && exam.data.wrongIds) {
      await saveCaExamCheck(session.id, exam.data.examId, {
        wrongIds: exam.data.wrongIds,
        skipped: exam.data.skipped ?? 0,
      });
    }
    if (exam.data.examId) {
      const existing = (await store.listExams(session.id)).some((row) => row.id === exam.data.examId);
      if (existing) return NextResponse.json({ ok: true, duplicate: true });
    }
    if (!california && exam.data.mode === "full" && !(await canTakeFullExam(session.id))) {
      return NextResponse.json({ error: "Pro required for additional full exams" }, { status: 402 });
    }
    const priorFull = !california && exam.data.mode === "full" ? await fullExamCount(session.id) : 0;
    const inserted = await recordExam({
      mode: california ? `ca-${exam.data.mode}` : exam.data.mode,
      score: exam.data.score,
      correctCount: exam.data.correctCount,
      total: exam.data.total,
      examId: exam.data.examId,
      userId: session.id,
      updateBest: !california,
    });
    if (!inserted) return NextResponse.json({ ok: true, duplicate: true });
    if (exam.data.mode === "full" && priorFull >= FREE_FULL_EXAMS) {
      await recordProUsage(session.id, "full_exam_extra");
    }
    return NextResponse.json({ ok: true });
  }
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  const q = [...publishedQuestions(), ...publishedCaQuestions()].find((x) => x.question_id === parsed.data.questionId);
  if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  if (parsed.data.state ? parsed.data.state !== q.state : q.state !== "AZ") {
    return NextResponse.json({ error: "Question is not in this state" }, { status: 400 });
  }
  if (!(await canAccessQuestion(session.id, q))) return NextResponse.json({ error: "Pro required" }, { status: 402 });
  const correct = parsed.data.selected === q.correct_option;
  const stat = await recordQuestionAnswer({
    userId: session.id,
    questionId: q.question_id,
    selected: parsed.data.selected,
    correct,
    review: parsed.data.review,
    attemptId: parsed.data.attemptId,
    timeZone: parsed.data.timeZone,
  });
  if (!stat) return NextResponse.json({ ok: true, duplicate: true, correct });
  if (!q.is_free) {
    await recordProUsage(session.id, "pro_question");
  }
  return NextResponse.json({ ok: true, correct, stat: toClientStat(stat) });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const store = await getStore();
  const [stats, exams, user, arizonaPro, entitlement] = await Promise.all([
    store.listStats(session.id),
    store.listExams(session.id),
    store.getUserById(session.id),
    hasArizonaPro(session.id),
    getArizonaEntitlement(session.id),
  ]);
  const advanced = await canUseAdvancedAnalytics(session.id);
  return NextResponse.json({
    stats: stats.map(toClientStat),
    exams: exams.map(toClientExam),
    user: user ? toClientUser(user, arizonaPro, entitlement?.expiresAt ?? user.planExpiresAt) : null,
    arizonaPro,
    advancedAnalytics: advanced,
  });
}

function toClientUser(user: UserRow, arizonaPro: boolean, planExpiresAt: string | null) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: user.emailVerified,
    plan: arizonaPro ? "pro" : "free",
    planStatus: user.planStatus,
    planExpiresAt,
    emailDaily: user.emailDaily,
    emailWeekly: user.emailWeekly,
    emailExam: user.emailExam,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    lastStudyAt: user.lastStudyAt,
    streakDays: user.streakDays,
    lastStudyDate: user.lastStudyDate,
    bestScore: user.bestScore,
    examDate: user.examDate,
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
