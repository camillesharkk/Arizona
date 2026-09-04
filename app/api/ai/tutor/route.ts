import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { aiDailyLimit, canAccessQuestion, hasArizonaPro } from "@/lib/entitlements";
import { publishedQuestions } from "@/data/questions";
import { getSource } from "@/data/sources";
import { retrieveContext } from "@/data/rag";
import { getStore } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { recordProUsage } from "@/lib/commerce/usage";
import { deliverTutorAnswer, readAiUsage, utcAiDay } from "@/lib/ai/quota";
import { localTutor } from "@/lib/ai/local-tutor";

function usagePayload(plan: "free" | "pro", used: number, limit: number, remaining: number) {
  return { plan, used, limit, remaining };
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const store = await getStore();
  const plan = (await hasArizonaPro(session.id)) ? "pro" : "free";
  const limit = await aiDailyLimit(session.id);
  const usage = await readAiUsage(store, session.id, limit);
  return NextResponse.json(usagePayload(plan, usage.used, usage.limit, usage.remaining));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const ipLimit = rateLimit(`ai:${clientIp(req)}`, 20, 60_000);
  if (!ipLimit.ok) return NextResponse.json({ error: "Rate limited" }, { status: 429 });
  const body = z
    .object({
      questionId: z.string(),
      selected: z.string().optional(),
      mode: z.enum(["explain", "why-correct", "why-wrong", "beginner", "similar"]),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const q = publishedQuestions().find((x) => x.question_id === body.data.questionId);
  if (!q) return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  if (!(await canAccessQuestion(session.id, q))) return NextResponse.json({ error: "Pro required" }, { status: 402 });
  const store = await getStore();
  const day = utcAiDay();
  const plan = (await hasArizonaPro(session.id)) ? "pro" : "free";
  const limit = await aiDailyLimit(session.id);
  const before = await readAiUsage(store, session.id, limit, day);
  if (before.used >= limit) {
    return NextResponse.json(
      { error: "Daily AI limit reached", ...usagePayload(plan, before.used, limit, 0) },
      { status: 429 }
    );
  }
  const src = getSource(q.source_id);
  const context = retrieveContext(q.topic, q.question_text);
  const key = process.env.AI_API_KEY;
  let text = "";
  let provider: "grounded-fallback" | "openai" = "grounded-fallback";
  if (!key) {
    text = localTutor(body.data.mode, q, body.data.selected, context, src.reference);
  } else {
    try {
      const prompt = `You are Arizona notary exam tutor. Use only this context. If unknown, say to verify on SOS.\nContext:\n${context}\nQuestion: ${q.question_text}\nCorrect: ${q.correct_option}. ${q.explanation}\nUser selected: ${body.data.selected || "n/a"}\nMode: ${body.data.mode}`;
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
        }),
      });
      if (!res.ok) {
        return NextResponse.json({ error: "AI provider error", ...usagePayload(plan, before.used, limit, before.remaining) }, { status: 502 });
      }
      const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      text = json.choices?.[0]?.message?.content || "";
      provider = "openai";
    } catch {
      return NextResponse.json({ error: "AI provider error", ...usagePayload(plan, before.used, limit, before.remaining) }, { status: 502 });
    }
  }
  const delivered = await deliverTutorAnswer({
    store,
    userId: session.id,
    limit,
    text,
    day,
    onExceedFreeQuota: async () => {
      await recordProUsage(session.id, "ai_tutor_pro_quota");
    },
  });
  if (!delivered.ok && delivered.reason === "empty") {
    return NextResponse.json({ error: "Empty provider response", ...usagePayload(plan, delivered.used, limit, delivered.remaining) }, { status: 502 });
  }
  if (!delivered.ok) {
    return NextResponse.json(
      { error: "Daily AI limit reached", ...usagePayload(plan, delivered.used, limit, 0) },
      { status: 429 }
    );
  }
  return NextResponse.json({
    text,
    provider,
    ...usagePayload(plan, delivered.used, delivered.limit, delivered.remaining),
  });
}
