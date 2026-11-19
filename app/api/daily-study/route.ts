import { NextResponse } from "next/server";
import { z } from "zod";
import { addVisibleTime, dailyStudyView, markDailyCard, studyMore, type StudyState } from "@/lib/daily-study";
import { caDailyView } from "@/lib/ca-daily";
import { getStore } from "@/lib/store";
import { getSession } from "@/lib/session";
import { isFreeState } from "@/lib/free-state-catalog";
import { LIVE_STATES } from "@/lib/ca-site";
import { productionStateBlocked } from "@/lib/state-release";
import { signPractice } from "@/lib/practice-token";

async function deliver(sessionId: string, state: string, view: { practiceQuestionIds?: string[]; reviewQuestionIds?: string[] }) {
  const ids = [...(view.practiceQuestionIds || []), ...(view.reviewQuestionIds || [])].filter((id, index, all) => all.indexOf(id) === index).slice(0, 80);
  const deliveryToken = ids.length
    ? await signPractice({ sub: sessionId, state: state || "AZ", ids, seed: 0, pv: 2, practice: true, revealed: false, purpose: "delivery" })
    : "";
  return NextResponse.json({ ...view, deliveryToken }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  if (productionStateBlocked(state)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  if (isFreeState(state) || state === "NY" || state === "PA" || state === "LA" || state === "CT" || state === "NC" || state === "IN") return deliver(session.id, state || "AZ", await (await getStore()).learningTransaction(session.id, () => dailyStudyView(session.id, url.searchParams.get("timeZone") || undefined, undefined, state as StudyState)));
  if (state === "CA") return deliver(session.id, "CA", await caDailyView(session.id, url.searchParams.get("timeZone") || undefined));
  if (state === "HI") return deliver(session.id, "HI", await dailyStudyView(session.id, url.searchParams.get("timeZone") || undefined, undefined, state));
  if (state && state !== "AZ") return NextResponse.json({ error: "Unknown state" }, { status: 400 });
  const timeZone = url.searchParams.get("timeZone") || undefined;
  return deliver(session.id, "AZ", await dailyStudyView(session.id, timeZone));
}

const bodySchema = z.object({
  action: z.enum(["studied", "remembered", "need-review", "visible", "more"]),
  cardId: z.string().optional(),
  attemptId: z.string().min(8).max(80),
  seconds: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = bodySchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const requested = new URL(req.url).searchParams.get("state");
  if (productionStateBlocked(requested)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  const state: StudyState = isFreeState(requested) ? requested : requested === "CA" || requested === "HI" || requested === "NY" || requested === "PA" || requested === "LA" || requested === "CT" || requested === "NC" || requested === "IN" ? requested : "AZ";
  const update = async () => {
    if (body.data.action === "visible") {
      await addVisibleTime(session.id, body.data.seconds || 0, body.data.attemptId, state);
    } else if (body.data.action === "more") {
      await studyMore(session.id, state);
    } else if (body.data.cardId) {
      await markDailyCard(session.id, { cardId: body.data.cardId, action: body.data.action, attemptId: body.data.attemptId }, state);
    } else {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
    const timeZone = new URL(req.url).searchParams.get("timeZone") || undefined;
    return deliver(session.id, state, await dailyStudyView(session.id, timeZone, undefined, state));
  };
  try {
    return (isFreeState(state) || ["NY", "PA", "LA", "CT", "NC", "IN"].includes(state)) ? await (await getStore()).learningTransaction(session.id, update) : await update();
  } catch (error) {
    const message = error instanceof Error && error.message === "not_allowed" ? "That card is not in your plan." : "Could not save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
