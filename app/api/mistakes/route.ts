import { NextResponse } from "next/server";
import { z } from "zod";
import { compareMistakes, isDue } from "@/lib/review-schedule";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { QuestionStat } from "@/lib/store/types";

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = z
    .object({ questionId: z.string(), mastered: z.boolean().optional(), favorited: z.boolean().optional(), remove: z.boolean().optional() })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });
  const store = await getStore();
  const stat = await store.getStat(session.id, body.data.questionId);
  if (!stat) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (body.data.remove) {
    await store.upsertStat({
      ...stat,
      userId: session.id,
      wrongCount: 0,
      lastCorrect: true,
      mastered: true,
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
    .filter((s) => s.state === "AZ" && s.bank === "arizona-notary-exam" && s.wrongCount > 0 && !s.mastered)
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
