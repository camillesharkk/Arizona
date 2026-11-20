import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { durableLimits, internalTask, sameOrigin } from "@/lib/durable-limit";
import { trustedClientIp } from "@/lib/trusted-ip";
import { hasStatePro } from "@/lib/entitlements";
import { ANON_COOKIE, anonymousPracticeActor, ownsPractice, readPractice, signPractice } from "@/lib/practice-token";
import { prepareChoiceReveal, questionByBankId } from "@/lib/practice-draw";
import { recordQuestionAnswer } from "@/lib/progress";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { fullTrialAvailable } from "@/lib/practice-trial";
import { resolveQuestionVersion } from "@/lib/question-version";
import { ANSWER_FEEDBACK_STREAM } from "@/lib/answer-feedback";

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
  const start = performance.now();
  if (!sameOrigin(req)) return NextResponse.json({ error: "This answer check was rejected." }, { status: 403, headers: privateHeaders });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
  const claims = await readPractice(body.data.token);
  if (!claims || claims.purpose !== "sitting") return NextResponse.json({ error: "This practice set has expired. Reload it." }, { status: 403, headers: privateHeaders });
  const session = await getSession();
  const anon = anonymousPracticeActor((await cookies()).get(ANON_COOKIE)?.value);
  if (!ownsPractice(claims, session?.id, anon)) return NextResponse.json({ error: "This practice set belongs to another session." }, { status: 403, headers: privateHeaders });
  const authenticated = performance.now();
  if (!internalTask(req)) {
    const caps = await durableLimits([
      { key: `reveal:${claims.sub}`, ...revealActor },
      { key: `reveal-ip:${trustedClientIp(req)}`, ...revealIp },
    ]);
    const hit = caps.find((cap) => !cap.ok);
    if (hit) {
      console.info(JSON.stringify({ event: "reveal_limited", retryAfter: hit.retryAfter }));
      return NextResponse.json({ error: "Too many answers were checked. Your place in this set is saved. Retry shortly." }, { status: 429, headers: { ...privateHeaders, "Retry-After": String(hit.retryAfter) } });
    }
  }
  const limited = performance.now();
  const questions = claims.ids.flatMap((id, index) => {
    const current = questionByBankId(id);
    const question = claims.versions ? resolveQuestionVersion(current, claims.versions[index]) : current;
    return question && question.state === claims.state ? [question] : [];
  });
  if (questions.length !== claims.ids.length) return NextResponse.json({ error: "Question updated; reload before answering" }, { status: 409, headers: privateHeaders });
  const hasProQuestions = questions.some((question) => !question.is_free);
  const needsPro = hasProQuestions || (body.data.action === "grade" && Boolean(claims.fullTrialId));
  const isPro = Boolean(session && needsPro && await hasStatePro(session.id, claims.state));
  const locked = hasProQuestions && !isPro;
  if (locked && !claims.revealed && (body.data.action !== "grade" || !claims.fullTrialId)) return NextResponse.json({ error: "Pro access is required to reopen this saved set. Your stored result is preserved." }, { status: 402, headers: privateHeaders });
  if (body.data.action === "grade") {
    const answers = body.data.answers || [];
    const ids = new Set(answers.map((answer) => answer.questionId));
    if (answers.length !== claims.ids.length || ids.size !== claims.ids.length || claims.ids.some((id) => !ids.has(id))) {
      return NextResponse.json({ error: "Submit every question in this set, including skipped questions." }, { status: 400, headers: privateHeaders });
    }
    const reveal = prepareChoiceReveal(questions, claims.seed, claims.pv);
    const rows = answers.map((answer) => {
      if (!answer.display) return { questionId: answer.questionId, correct: false, skipped: true };
      const revealed = reveal(answer.questionId, answer.display);
      return revealed ? { questionId: answer.questionId, ...revealed, skipped: false } : null;
    });
    if (rows.some((row) => !row)) return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
    if (claims.fullTrialId && !isPro) {
      const store = await getStore();
      const owner = `practice-full:${claims.sub}`;
      const used = await store.getGuestExam(owner, claims.state);
      const accountId = claims.sub === session?.id ? session.id : undefined;
      const receipt = used ?? (await fullTrialAvailable(claims.state, claims.sub, accountId)
        ? await store.reserveGuestExam({ owner, state: claims.state, examId: claims.fullTrialId, sitting: claims })
        : await store.getGuestExam(owner, claims.state));
      if (receipt?.examId !== claims.fullTrialId) {
        return NextResponse.json({ error: "The free full practice for this state is already used." }, { status: 402, headers: privateHeaders });
      }
    }
    const token = await signPractice({ ...claims, revealed: true });
    return NextResponse.json({ token, results: rows }, { headers: privateHeaders });
  }
  if (!claims.practice && !claims.revealed) return NextResponse.json({ error: "The explanation opens after you submit this set." }, { status: 403, headers: privateHeaders });
  if (!body.data.questionId || !body.data.display || !claims.ids.includes(body.data.questionId)) {
    return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
  }
  const reveal = prepareChoiceReveal(questions, claims.seed, claims.pv);
  const revealed = reveal(body.data.questionId, body.data.display);
  if (!revealed) return NextResponse.json({ error: "Invalid answer" }, { status: 400, headers: privateHeaders });
  const graded = performance.now();
  const feedback = {
    correct: revealed.correct,
    correctOption: revealed.correctOption,
    explanation: revealed.explanation,
    optionFeedback: revealed.optionFeedback,
    canonical: revealed.canonical,
  };
  const timings = `auth;dur=${Math.round(authenticated - start)}, limit;dur=${Math.round(limited - authenticated)}, grade;dur=${Math.round(graded - limited)}`;
  const question = questions.find((item) => item.question_id === body.data.questionId);
  if (session && question && (question.is_free || isPro)) {
    const save = () => recordQuestionAnswer({
      userId: session.id,
      questionId: question.question_id,
      questionVersion: question.version,
      selected: revealed.canonical,
      correct: revealed.correct,
      review: body.data.review,
      attemptId: body.data.attemptId,
      timeZone: body.data.timeZone,
    });
    if (body.data.attemptId && req.headers.get("accept") === ANSWER_FEEDBACK_STREAM) {
      const encoder = new TextEncoder();
      let cancelled = false;
      const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
          controller.enqueue(encoder.encode(JSON.stringify(feedback) + "\n"));
          const saved = await save().then(() => true, () => {
            console.error("Quick practice answer progress could not be saved.");
            return false;
          });
          if (cancelled) return;
          controller.enqueue(encoder.encode(JSON.stringify({ saved }) + "\n"));
          controller.close();
        },
        cancel() {
          cancelled = true;
        },
      });
      return new Response(stream, { headers: {
        "Cache-Control": "private, no-store, no-transform",
        "Content-Type": ANSWER_FEEDBACK_STREAM,
        "Server-Timing": timings,
      } });
    }
    await save();
  }
  return NextResponse.json(feedback, { headers: {
    ...privateHeaders,
    "Server-Timing": `${timings}, save;dur=${Math.round(performance.now() - graded)}`,
  } });
}
