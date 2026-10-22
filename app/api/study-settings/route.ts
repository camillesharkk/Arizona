import { NextResponse } from "next/server";
import { z } from "zod";
import { dailyStudyView, saveStudySettings } from "@/lib/daily-study";
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
  const timeZone = new URL(req.url).searchParams.get("timeZone") || undefined;
  return NextResponse.json(await dailyStudyView(session.id, timeZone));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  try {
    await saveStudySettings(session.id, body.data, body.data.timeZone);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not save";
    return NextResponse.json({ error: message }, { status: 400 });
  }
  return NextResponse.json(await dailyStudyView(session.id, body.data.timeZone));
}
