import { NextResponse } from "next/server";
import { publishedInQuestions } from "@/data/in-questions";
import { getSession } from "@/lib/session";
import { getIndianaEntitlement } from "@/lib/entitlements";
import { ensureIndianaGuest } from "@/lib/indiana-guest";
import { productionStateBlocked } from "@/lib/state-release";

export async function GET() {
  if (productionStateBlocked("IN")) return NextResponse.json({ error: "State not available" }, { status: 404 });
  const session = await getSession();
  const pro = Boolean(await getIndianaEntitlement(session?.id));
  if (!session) await ensureIndianaGuest();
  return NextResponse.json({ questions: publishedInQuestions().filter(question => pro || question.is_free), pro }, { headers: { "Cache-Control": "private, no-store" } });
}
