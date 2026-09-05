import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { aiDailyLimit, canAccessQuestion, hasArizonaPro } from "@/lib/entitlements";
import { publishedQuestions } from "@/data/questions";
import { getStore } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { recordProUsage } from "@/lib/commerce/usage";
import { readAiUsage, utcAiDay } from "@/lib/ai/quota";
import { parseAiProvider, parseProviderDailyCap } from "@/lib/ai/provider";
import { runTutorTurn } from "@/lib/ai/tutor";

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
  const delivered = await runTutorTurn({
    store,
    userId: session.id,
    limit,
    day,
    mode: body.data.mode,
    question: q,
    selected: body.data.selected,
    provider: parseAiProvider(),
    apiKey: process.env.DEEPSEEK_API_KEY,
    model: process.env.AI_MODEL,
    providerDailyCap: parseProviderDailyCap(),
    onExceedFreeQuota: async () => {
      await recordProUsage(session.id, "ai_tutor_pro_quota");
    },
  });
  if (!delivered.ok && delivered.reason === "empty") {
    return NextResponse.json({ error: "Could not explain this question", ...usagePayload(plan, delivered.used, limit, delivered.remaining) }, { status: 502 });
  }
  if (!delivered.ok) {
    return NextResponse.json(
      { error: "Daily AI limit reached", ...usagePayload(plan, delivered.used, limit, 0) },
      { status: 429 }
    );
  }
  return NextResponse.json({
    text: delivered.text,
    provider: delivered.provider,
    ...usagePayload(plan, delivered.used, delivered.limit, delivered.remaining),
  });
}
