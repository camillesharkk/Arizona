import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { recordProUsage } from "@/lib/commerce/usage";

const schema = z.object({
  featureCode: z.enum([
    "pro_question",
    "full_exam_extra",
    "ai_tutor_pro_quota",
    "flashcards_full",
    "weak_areas",
    "advanced_analytics",
  ]),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const result = await recordProUsage(session.id, body.data.featureCode);
  return NextResponse.json({ ok: true, ...result });
}
