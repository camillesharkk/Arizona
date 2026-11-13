import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { aiDailyLimit, canAccessQuestion, hasStatePro } from "@/lib/entitlements";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedHiQuestions } from "@/data/hi-questions";
import { getStore } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { recordProUsage } from "@/lib/commerce/usage";
import { readAiUsage, utcAiDay } from "@/lib/ai/quota";
import { parseAiProvider, parseProviderDailyCap } from "@/lib/ai/provider";
import { runTutorTurn, tutorOptionOrder } from "@/lib/ai/tutor";
import { questionById } from "@/lib/prep-pack";
import { currentQuestionVersion } from "@/lib/question-revisions";
import { productionStateBlocked } from "@/lib/state-release";

function usagePayload(plan: "free" | "pro", used: number, limit: number, remaining: number) {
  return { plan, used, limit, remaining };
}

export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (productionStateBlocked(new URL(req.url).searchParams.get("state"))) return NextResponse.json({ error: "State not available" }, { status: 404 });
  const store = await getStore();
  const state = new URL(req.url).searchParams.get("state") || "AZ";
  const plan = (await hasStatePro(session.id, state)) ? "pro" : "free";
  const limit = await aiDailyLimit(session.id, state);
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
      questionVersion: z.number().int().positive().optional(),
      state: z.enum(["AZ", "CA", "HI", "NY", "PA", "LA", "CT", "NC"]).optional(),
      options: z.array(z.string()).length(4).optional(),
      selected: z.enum(["A", "B", "C", "D"]).optional(),
      mode: z.enum(["explain", "why-correct", "why-wrong", "beginner", "similar"]),
    })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const stored = publishedQuestions().find((x) => x.question_id === body.data.questionId)
    || publishedCaQuestions().find((x) => x.question_id === body.data.questionId)
    || publishedHiQuestions().find((x) => x.question_id === body.data.questionId)
    || questionById(body.data.questionId);
  if (!stored) return NextResponse.json({ error: "Unknown question" }, { status: 404 });
  if (productionStateBlocked(stored.state)) return NextResponse.json({ error: "State not available" }, { status: 404 });
  if (body.data.state && body.data.state !== stored.state) return NextResponse.json({ error: "Question state mismatch" }, { status: 400 });
  if ((body.data.questionVersion ?? 1) !== currentQuestionVersion(stored.question_id)) return NextResponse.json({ error: "Refresh this question to use its current version" }, { status: 409 });
  const q = tutorOptionOrder(stored, body.data.options);
  if (!q) return NextResponse.json({ error: "Question options mismatch" }, { status: 400 });
  if (!(await canAccessQuestion(session.id, q))) return NextResponse.json({ error: "Pro required" }, { status: 402 });
  const store = await getStore();
  const day = utcAiDay();
  const plan = (await hasStatePro(session.id, stored.state)) ? "pro" : "free";
  const limit = await aiDailyLimit(session.id, stored.state);
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
      await recordProUsage(session.id, "ai_tutor_pro_quota", undefined, state);
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
    fallbackReason: delivered.fallbackReason,
    ...usagePayload(plan, delivered.used, delivered.limit, delivered.remaining),
  });
}
