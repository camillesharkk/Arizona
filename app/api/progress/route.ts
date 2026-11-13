import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { canAccessQuestion, getArizonaEntitlement } from "@/lib/entitlements";
import { recordProUsage } from "@/lib/commerce/usage";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { packFor, questionById } from "@/lib/prep-pack";
import { saveCaExamCheck } from "@/lib/ca-daily";
import { recordExam, recordQuestionAnswer } from "@/lib/progress";
import { getStore } from "@/lib/store";
import { productionStateBlocked } from "@/lib/state-release";
import { savePackFullSubmission } from "@/lib/ny-full-submission";
import type { ExamRow, QuestionStat, UserRow } from "@/lib/store/types";

const answerSchema = z.object({
  questionId: z.string(),
  questionVersion: z.number().int().positive().optional(),
  selected: z.enum(["A", "B", "C", "D"]),
  attemptId: z.string().min(8).max(80).optional(),
  review: z.boolean().optional(),
  state: z.enum(["AZ", "CA", "HI", "NY", "PA", "LA"]).optional(),
  timeZone: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (body?.kind === "ny-full" || body?.kind === "pack-full") {
    const state = body.kind === "ny-full" ? "NY" : body.state;
    if (state !== "AZ" && state !== "CA" && state !== "HI" && !packFor(state)) return NextResponse.json({ error: "Invalid state" }, { status: 400 });
    if (productionStateBlocked(state)) return NextResponse.json({ error: "State not available" }, { status: 404 });
    const full = z.object({
      examId: z.string().uuid(),
      questions: z.array(z.object({ questionId: z.string(), questionVersion: z.number().int().positive(), selected: z.enum(["A", "B", "C", "D"]).optional(), attemptId: z.string().min(8).max(80).optional() })).min(1).max(80),
      seed: z.number().int().min(0).max(1000000000).optional(),
      unscoredIds: z.array(z.string()).max(5).optional(),
      timeZone: z.string().max(80).optional(),
      accountId: z.string().min(1).optional(),
      finishedAt: z.string().datetime().optional(),
    }).safeParse(body);
    if (!full.success) return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    if (full.data.accountId && full.data.accountId !== session.id) return NextResponse.json({ error: "Account changed" }, { status: 409 });
    try {
      const { proUsage, ...result } = await savePackFullSubmission(await getStore(), session.id, { ...full.data, state });
      // Commerce uses its existing client after the learning transaction has committed.
      if (proUsage) await recordProUsage(session.id, proUsage.featureCode, proUsage);
      return NextResponse.json(result);
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "full_trial_used") return NextResponse.json({ error: "The free full practice for this state is already used" }, { status: 402 });
      if (code === "question_updated") return NextResponse.json({ error: "Question updated; reload before answering", code }, { status: 409 });
      if (code === "legacy_attempts_required") return NextResponse.json({ error: "Restore the original saved sitting to finish saving this earlier practice", code }, { status: 409 });
      if (code === "invalid_exam") return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
      throw error;
    }
  }
  if (body?.kind === "exam") {
    const exam = z
      .object({
        mode: z.string(),
        score: z.number(),
        correctCount: z.number(),
        total: z.number(),
        examId: z.string().uuid().optional(),
        state: z.enum(["AZ", "CA", "HI", "NY", "PA", "LA"]).optional(),
        wrongIds: z.array(z.string().max(80)).max(80).optional(),
        skipped: z.number().int().min(0).max(80).optional(),
        timeZone: z.string().max(80).optional(),
      })
      .safeParse(body);
    if (!exam.success) return NextResponse.json({ error: "Invalid exam" }, { status: 400 });
    if (productionStateBlocked(exam.data.state) || productionStateBlocked(exam.data.mode.split("-")[0].toUpperCase())) return NextResponse.json({ error: "State not available" }, { status: 404 });
    const store = await getStore();
    const california = exam.data.state === "CA";
    const hawaii = exam.data.state === "HI";
    const packState = exam.data.state === "NY" || exam.data.state === "PA" || exam.data.state === "LA" ? exam.data.state : null;
    if (exam.data.mode === "full" || exam.data.mode.endsWith("-full")) {
      return NextResponse.json({ error: "Submit the complete sitting for server grading" }, { status: 400 });
    }
    if ((california || hawaii || packState) && exam.data.examId && exam.data.wrongIds) {
      await saveCaExamCheck(session.id, exam.data.examId, {
        wrongIds: exam.data.wrongIds,
        skipped: exam.data.skipped ?? 0,
      }, packState || (hawaii ? "HI" : "CA"));
    }
    if (exam.data.examId) {
      const existing = (await store.listExams(session.id)).some((row) => row.id === exam.data.examId);
      if (existing) return NextResponse.json({ ok: true, duplicate: true });
    }
    const inserted = await recordExam({
      mode: california ? `ca-${exam.data.mode}` : hawaii ? `hi-${exam.data.mode}` : packState ? `${packState.toLowerCase()}-${exam.data.mode}` : exam.data.mode,
      score: exam.data.score,
      correctCount: exam.data.correctCount,
      total: exam.data.total,
      examId: exam.data.examId,
      userId: session.id,
      updateBest: !california && !hawaii && !packState,
    });
    if (!inserted) return NextResponse.json({ ok: true, duplicate: true });
    return NextResponse.json({ ok: true });
  }
  const parsed = answerSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400 });
  const q = [...publishedQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions(), questionById(parsed.data.questionId)].find((x) => x && x.question_id === parsed.data.questionId);
  if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  if (productionStateBlocked(q.state)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  if ((q.state === "NY" || q.state === "PA" || q.state === "LA") && (parsed.data.questionVersion ?? 1) !== q.version) {
    return NextResponse.json({ error: "Question updated; reload before answering", code: "question_updated" }, { status: 409 });
  }
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
  const [stats, exams, user, entitlement] = await Promise.all([
    store.listStats(session.id),
    store.listExams(session.id),
    store.getUserById(session.id),
    getArizonaEntitlement(session.id),
  ]);
  const arizonaPro = Boolean(entitlement);
  return NextResponse.json({
    stats: stats.map(toClientStat),
    exams: exams.map(toClientExam),
    user: user ? toClientUser(user, arizonaPro, entitlement?.expiresAt ?? user.planExpiresAt) : null,
    arizonaPro,
    californiaPro: arizonaPro,
    hawaiiPro: arizonaPro,
    advancedAnalytics: arizonaPro,
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
