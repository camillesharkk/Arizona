import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { freeMistakeCap, isPro } from "@/lib/entitlements";

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
    await store.upsertStat({ ...stat, wrongCount: 0, lastCorrect: true, mastered: true });
    return NextResponse.json({ ok: true });
  }
  await store.upsertStat({
    ...stat,
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
  const mistakes = stats.filter((s) => s.wrongCount > 0 && !s.mastered);
  const capped = isPro(session) ? mistakes : mistakes.slice(0, freeMistakeCap());
  return NextResponse.json({ mistakes: capped, truncated: mistakes.length > capped.length, favorites: stats.filter((s) => s.favorited) });
}
