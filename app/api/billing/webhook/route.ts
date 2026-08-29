import { NextResponse } from "next/server";
import { applyBillingEvent, parsePaddleLike, verifyMorSignature } from "@/lib/billing";

export async function POST(req: Request) {
  const raw = await req.text();
  const sig = req.headers.get("x-mor-signature") || req.headers.get("paddle-signature") || req.headers.get("x-signature");
  if (!verifyMorSignature(raw, sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }
  let body: Record<string, unknown> = {};
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const event = parsePaddleLike(body);
  if (!event) return NextResponse.json({ ok: true, ignored: true });
  const result = await applyBillingEvent(event);
  return NextResponse.json(result);
}
