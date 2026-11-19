import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { durableLimit, internalTask, sameOrigin } from "@/lib/durable-limit";
import { trustedClientIp } from "@/lib/trusted-ip";
import { canAccessQuestion, hasStatePro } from "@/lib/entitlements";
import { ANON_COOKIE, readPractice, signPractice } from "@/lib/practice-token";
import { questionByBankId, revealChoice } from "@/lib/practice-draw";
import { recordQuestionAnswer } from "@/lib/progress";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store" };
const letter = z.enum(["A", "B", "C", "D"]);
const schema = z.object({
  token: z.string().min(20).max(8000),
  action: z.enum(["one", "grade"]).default("one"),
  questionId: z.string().max(80).optional(),
  display: letter.optional(),
  answers: z.array(z.object({ questionId: z.string().max(80), display: letter.optional() })).max(80).optional(),
  attemptId: z.string().min(8).max(80).optional(),
  review: z.boolean().optional(),
  timeZone: z.string().max(80).optional(),
});

const revealActor = { limit: 90, windowMs: 10 * 60_000 };
const revealIp = { limit: 800, windowMs: 10 * 60_000 };

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "This answer check was rejected." }, { status: 403, headers: privateHeaders });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
  const claims = await readPractice(body.data.token);
  if (!claims || claims.purpose !== "sitting") return NextResponse.json({ error: "This practice set has expired. Reload it." }, { status: 403, headers: privateHeaders });
  const session = await getSession();
  const anon = (await cookies()).get(ANON_COOKIE)?.value || "";
  if (claims.sub !== session?.id && claims.sub !== anon) return NextResponse.json({ error: "This practice set belongs to another session." }, { status: 403, headers: privateHeaders });
  const isPro = Boolean(session && await hasStatePro(session.id, claims.state));
  if (!internalTask(req)) {
    const actorCap = await durableLimit(`reveal:${claims.sub}`, revealActor.limit, revealActor.windowMs);
    const ipCap = await durableLimit(`reveal-ip:${trustedClientIp(req)}`, revealIp.limit, revealIp.windowMs);
    const hit = !actorCap.ok ? actorCap : !ipCap.ok ? ipCap : null;
    if (hit) {
      console.info(JSON.stringify({ event: "reveal_limited", retryAfter: hit.retryAfter }));
      return NextResponse.json({ error: "Too many answers were checked. Your place in this set is saved. Retry shortly." }, { status: 429, headers: { ...privateHeaders, "Retry-After": String(hit.retryAfter) } });
    }
  }
  const questions = claims.ids.flatMap((id) => {
    const question = questionByBankId(id);
    return question && question.state === claims.state ? [question] : [];
  });
  if (questions.length !== claims.ids.length) return NextResponse.json({ error: "Question updated; reload before answering" }, { status: 409, headers: privateHeaders });
  const locked = questions.some((question) => !question.is_free && !isPro);
  if (locked && !claims.revealed) return NextResponse.json({ error: "Pro access is required to reopen this saved set. Your stored result is preserved." }, { status: 402, headers: privateHeaders });
  if (body.data.action === "grade") {
    const rows = (body.data.answers || []).map((answer) => {
      if (!claims.ids.includes(answer.questionId)) return null;
      if (!answer.display) return { questionId: answer.questionId, correct: false, skipped: true };
      const revealed = revealChoice(questions, claims.seed, claims.pv, answer.questionId, answer.display);
      return revealed ? { questionId: answer.questionId, ...revealed, skipped: false } : null;
    });
    if (rows.some((row) => !row)) return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
    const token = await signPractice({ ...claims, revealed: true });
    return NextResponse.json({ token, results: rows }, { headers: privateHeaders });
  }
  if (!claims.practice && !claims.revealed) return NextResponse.json({ error: "The explanation opens after you submit this set." }, { status: 403, headers: privateHeaders });
  if (!body.data.questionId || !body.data.display || !claims.ids.includes(body.data.questionId)) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
  }
  const revealed = revealChoice(questions, claims.seed, claims.pv, body.data.questionId, body.data.display);
  if (!revealed) return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
  const question = questionByBankId(body.data.questionId);
  if (session && question && await canAccessQuestion(session.id, question)) {
    await recordQuestionAnswer({
      userId: session.id,
      questionId: question.question_id,
      selected: revealed.canonical,
      correct: revealed.correct,
      review: body.data.review,
      attemptId: body.data.attemptId,
      timeZone: body.data.timeZone,
    });
  }
  return NextResponse.json({
    correct: revealed.correct,
    correctOption: revealed.correctOption,
    explanation: revealed.explanation,
    optionFeedback: revealed.optionFeedback,
    canonical: revealed.canonical,
  }, { headers: privateHeaders });
}
