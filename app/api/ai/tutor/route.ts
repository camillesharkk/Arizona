import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { aiDailyLimit, canAccessQuestion } from "@/lib/entitlements";
import { publishedQuestions } from "@/data/questions";
import { getSource } from "@/data/sources";
import { retrieveContext } from "@/data/rag";
import { getStore } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";

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
  const day = new Date().toISOString().slice(0, 10);
  const used = await store.aiCount(session.id, day);
  const limit = await aiDailyLimit(session.id);
  if (used >= limit) return NextResponse.json({ error: "Daily AI limit reached", remaining: 0 }, { status: 429 });
  await store.bumpAi(session.id, day);
  const src = getSource(q.source_id);
  const context = retrieveContext(q.topic, q.question_text);
  const key = process.env.AI_API_KEY;
  if (!key) {
    const text = localTutor(body.data.mode, q, body.data.selected, context, src.reference);
    return NextResponse.json({ text, remaining: limit - used - 1, provider: "grounded-fallback" });
  }
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
  if (!res.ok) return NextResponse.json({ error: "AI provider error" }, { status: 502 });
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return NextResponse.json({ text: json.choices?.[0]?.message?.content || "", remaining: limit - used - 1, provider: "openai" });
}

function localTutor(
  mode: string,
  q: { question_text: string; correct_option: string; explanation: string; option_feedback: Record<string, string>; option_a: string; option_b: string; option_c: string; option_d: string },
  selected: string | undefined,
  context: string,
  reference: string
) {
  if (mode === "why-correct") return `${q.explanation}\n\nOfficial reference: ${reference}\n\n${context}`;
  if (mode === "why-wrong") {
    const letter = (selected || "A") as "A" | "B" | "C" | "D";
    return `${q.option_feedback[letter]}\nCorrect is ${q.correct_option}.\n\n${context}`;
  }
  if (mode === "beginner") return `In plain language: ${q.explanation}\nThe right choice is ${q.correct_option}. Confirm ${reference} before you notarize.`;
  if (mode === "similar") return `Practice the same rule: ${q.question_text.replace("which", "what")}\nThen review ${reference}.`;
  return `${q.explanation}\n\n${context}`;
}
