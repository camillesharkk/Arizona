import { NextResponse } from "next/server";
import { z } from "zod";
import { addVisibleTime, dailyStudyView, markDailyCard, studyMore } from "@/lib/daily-study";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const timeZone = new URL(req.url).searchParams.get("timeZone") || undefined;
  return NextResponse.json(await dailyStudyView(session.id, timeZone));
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
  try {
    if (body.data.action === "visible") {
      await addVisibleTime(session.id, body.data.seconds || 0, body.data.attemptId);
    } else if (body.data.action === "more") {
      await studyMore(session.id);
    } else if (body.data.cardId) {
      await markDailyCard(session.id, { cardId: body.data.cardId, action: body.data.action, attemptId: body.data.attemptId });
    } else {
      return NextResponse.json({ error: "Invalid" }, { status: 400 });
    }
  } catch (error) {
    const message = error instanceof Error && error.message === "not_allowed" ? "That card is not in your plan." : "Could not save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  const timeZone = new URL(req.url).searchParams.get("timeZone") || undefined;
  return NextResponse.json(await dailyStudyView(session.id, timeZone));
}
