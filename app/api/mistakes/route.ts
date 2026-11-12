import { NextResponse } from "next/server";
import { z } from "zod";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { questionById } from "@/lib/prep-pack";
import { savedReviewStat } from "@/lib/review-save";
import { localDate } from "@/lib/calendar";
import { compareMistakes, DEFAULT_STUDY_TIME_ZONE, isDue } from "@/lib/review-schedule";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { productionStateBlocked } from "@/lib/state-release";
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
  if (productionStateBlocked(body.data.questionId.split("-")[0].toUpperCase())) return NextResponse.json({ error: "State not available" }, { status: 404 });
  const store = await getStore();
  const update = async () => {
    if (typeof body.data.saveForReview === "boolean") {
      const question = [...publishedQuestions(), ...publishedCaQuestions(), ...publishedHiQuestions(), questionById(body.data.questionId)].find((item) => item && item.question_id === body.data.questionId);
      if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const stat = await store.getStat(session.id, body.data.questionId);
      const planState = question.state;
      const plan = await store.getStudyPlan(session.id, planState);
      const timeZone = (plan?.document as { settings?: { timeZone?: string } } | undefined)?.settings?.timeZone || DEFAULT_STUDY_TIME_ZONE;
      const next = savedReviewStat(stat, question, {
        userId: session.id,
        save: body.data.saveForReview,
        now: new Date().toISOString(),
        timeZone,
      });
      if (!next) return NextResponse.json({ error: "Not found" }, { status: 404 });
      await store.upsertStat(next);
      return NextResponse.json({ ok: true, savedForReview: Boolean(next.savedForReview), nextReviewAt: next.nextReviewAt });
    }
    if (body.data.mastered === undefined && body.data.favorited === undefined && !body.data.remove) {
      return NextResponse.json({ error: "Choose an action" }, { status: 400 });
    }
    const patch = body.data.remove
      ? { wrongCount: 0, mastered: true, favorited: false, savedForReview: false, nextReviewAt: null }
      : {
          ...(body.data.mastered !== undefined ? { mastered: body.data.mastered, ...(body.data.mastered ? { nextReviewAt: null } : {}) } : {}),
          ...(body.data.favorited !== undefined ? { favorited: body.data.favorited } : {}),
        };
    try {
      const stat = await store.updateReviewStat(session.id, body.data.questionId, patch);
      if (!stat) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ ok: true, stat: toClientStat(stat) });
    } catch (error) {
      console.error("Could not update wrong-answer record", error);
      return NextResponse.json({ error: "Could not update this question. Please try again." }, { status: 500 });
    }
  };
  return /^(ny|pa|la)-/.test(body.data.questionId) ? store.learningTransaction(session.id, update) : update();
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const url = new URL(req.url);
  const requested = url.searchParams.get("state");
  if (productionStateBlocked(requested)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  const state = requested === "CA" || requested === "HI" || requested === "NY" || requested === "PA" || requested === "LA" ? requested : "AZ";
  const zone = url.searchParams.get("timeZone");
  const timeZone = zone && zone.length < 80 ? zone : DEFAULT_STUDY_TIME_ZONE;
  const bank = state === "CA" ? "california-notary-exam" : state === "HI" ? "hawaii-notary-exam" : state === "NY" ? "new-york-notary-exam" : state === "PA" ? "pennsylvania-notary-exam" : state === "LA" ? "louisiana-notary-exam" : "arizona-notary-exam";
  const store = await getStore();
  const stats = await store.listStats(session.id);
  const now = Date.now();
  const mistakes = stats
    .filter((s) => s.state === state && s.bank === bank && !s.mastered && (s.wrongCount > 0 || s.savedForReview))
    .sort((a, b) => compareMistakes(a, b, now));
  return NextResponse.json({
    state,
    accountId: session.id,
    studyDay: localDate(new Date().toISOString(), timeZone),
    mistakes: mistakes.map(toClientStat),
    dueCount: mistakes.filter((s) => isDue(s, now)).length,
    truncated: false,
    favorites: stats.filter((s) => s.state === state && s.favorited).map(toClientStat),
  }, { headers: { "Cache-Control": "private, no-store" } });
}

function toClientStat(s: QuestionStat) {
  const { userId: _owner, ...rest } = s;
  return rest;
}
