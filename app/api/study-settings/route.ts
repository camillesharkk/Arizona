import { NextResponse } from "next/server";
import { z } from "zod";
import { dailyStudyView, saveStudySettings, type StudyState } from "@/lib/daily-study";
import { getStore } from "@/lib/store";
import { productionStateBlocked } from "@/lib/state-release";
import { getSession } from "@/lib/session";

const schema = z.object({
  mode: z.enum(["recommended", "custom"]).optional(),
  targetDate: z.string().optional(),
  weekdays: z.array(z.number().int()).optional(),
  newCards: z.number().int().nullable().optional(),
  newQuestions: z.number().int().nullable().optional(),
  reviewTarget: z.number().int().nullable().optional(),
  timeZone: z.string().optional(),
  restore: z.boolean().optional(),
});

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const url = new URL(req.url);
  const timeZone = url.searchParams.get("timeZone") || undefined;
  const requested = url.searchParams.get("state");
  if (productionStateBlocked(requested)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  if (requested && !["AZ", "CA", "HI", "NY", "PA", "LA"].includes(requested)) return NextResponse.json({ error: "Unknown state" }, { status: 400 });
  const state: StudyState = requested === "CA" || requested === "HI" || requested === "NY" || requested === "PA" || requested === "LA" ? requested : "AZ";
  const read = () => dailyStudyView(session.id, timeZone, undefined, state);
  return NextResponse.json(state === "NY" ? await (await getStore()).learningTransaction(session.id, read) : await read());
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const requested = new URL(req.url).searchParams.get("state");
  if (productionStateBlocked(requested)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  if (requested && !["AZ", "CA", "HI", "NY", "PA", "LA"].includes(requested)) return NextResponse.json({ error: "Unknown state" }, { status: 400 });
  const state: StudyState = requested === "CA" || requested === "HI" || requested === "NY" || requested === "PA" || requested === "LA" ? requested : "AZ";
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const update = async () => {
    await saveStudySettings(session.id, body.data, body.data.timeZone, state);
    return NextResponse.json(await dailyStudyView(session.id, body.data.timeZone, undefined, state));
  };
  try {
    return state === "NY" ? await (await getStore()).learningTransaction(session.id, update) : await update();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
