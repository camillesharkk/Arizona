import { NextResponse } from "next/server";
import { z } from "zod";
import { publishedQuestions } from "@/data/questions";
import { savedReviewStat } from "@/lib/review-save";
import { compareMistakes, DEFAULT_STUDY_TIME_ZONE, isDue } from "@/lib/review-schedule";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { QuestionStat } from "@/lib/store/types";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = z
    .object({
      questionId: z.string(),
      mastered: z.boolean().optional(),
      favorited: z.boolean().optional(),
      remove: z.boolean().optional(),
      saveForReview: z.boolean().optional(),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const store = await getStore();
  if (typeof body.data.saveForReview === "boolean") {
    const question = publishedQuestions().find((item) => item.question_id === body.data.questionId);
    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const stat = await store.getStat(session.id, body.data.questionId);
    const plan = await store.getStudyPlan(session.id, "AZ");
    const timeZone = (plan?.document as { settings?: { timeZone?: string } } | undefined)?.settings?.timeZone || DEFAULT_STUDY_TIME_ZONE;
    const next = savedReviewStat(stat, question, {
      userId: session.id,
      save: body.data.saveForReview,
      now: new Date().toISOString(),
      timeZone,
    });
    if (!next) return NextResponse.json({ error: "Not found" }, { status: 404 });
    await store.upsertStat(next);
    return NextResponse.json({ ok: true, savedForReview: Boolean(next.savedForReview) });
  }
  const stat = await store.getStat(session.id, body.data.questionId);
  if (!stat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.data.remove) {
    await store.upsertStat({
      ...stat,
      userId: session.id,
      wrongCount: 0,
      lastCorrect: true,
      mastered: true,
      savedForReview: false,
      nextReviewAt: null,
    });
    return NextResponse.json({ ok: true });
  }
  await store.upsertStat({
    ...stat,
    userId: session.id,
    mastered: body.data.mastered ?? stat.mastered,
    favorited: body.data.favorited ?? stat.favorited,
  });
  return NextResponse.json({ ok: true });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const store = await getStore();
  const stats = await store.listStats(session.id);
  const now = Date.now();
  const mistakes = stats
    .filter((s) => s.state === "AZ" && s.bank === "arizona-notary-exam" && !s.mastered && (s.wrongCount > 0 || s.savedForReview))
    .sort((a, b) => compareMistakes(a, b, now));
  return NextResponse.json({
    mistakes: mistakes.map(toClientStat),
    dueCount: mistakes.filter((s) => isDue(s, now)).length,
    truncated: false,
    favorites: stats.filter((s) => s.favorited).map(toClientStat),
  });
}

function toClientStat(s: QuestionStat) {
  const { userId: _owner, ...rest } = s;
  return rest;
}
