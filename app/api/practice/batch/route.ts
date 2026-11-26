import { randomBytes, randomInt, randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { LIVE_STATES } from "@/lib/ca-site";
import { durableLimit, internalTask, sameOrigin } from "@/lib/durable-limit";
import { trustedClientIp } from "@/lib/trusted-ip";
import { ensureIndianaGuest, indianaGuestSitting } from "@/lib/indiana-guest";
import { indianaSittingQuestions, startIndianaSitting, type IndianaSitting } from "@/lib/indiana-sitting";
import { hasStatePro } from "@/lib/entitlements";
import { ANON_COOKIE, anonymousPracticeActor, ownsPractice, practiceGuestSubject, readPractice, signPractice } from "@/lib/practice-token";
import { fullTrialAvailable } from "@/lib/practice-trial";
import { clientQuestions, drawPractice, questionByBankId, topicPage } from "@/lib/practice-draw";
import { diagnosticCandidates, pickDiagnosticQuestions } from "@/lib/diagnostic";
import { resolveQuestionVersion } from "@/lib/question-version";
import { productionStateBlocked } from "@/lib/state-release";
import { packFor } from "@/lib/prep-pack";
import { resultOffer } from "@/lib/practice-result";
import { eligibleExamPool } from "@/lib/quiz";
import { caQuestionCounts } from "@/data/ca-questions";
import { hiQuestionCounts } from "@/data/hi-questions";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import type { Question, StateCode } from "@/lib/types";

export const dynamic = "force-dynamic";

const privateHeaders = { "Cache-Control": "private, no-store" };
const schema = z.object({
  state: z.enum(LIVE_STATES),
  mode: z.string().max(40).optional(),
  kind: z.enum(["exam", "topic"]).default("exam"),
  practice: z.boolean().optional(),
  focusArea: z.string().max(80).optional(),
  seed: z.number().int().min(0).max(1_000_000_000).optional(),
  questionIds: z.array(z.string().max(80)).max(80).optional(),
  missedIds: z.array(z.string().max(80)).max(40).optional(),
  presetIds: z.array(z.string().max(80)).max(40).optional(),
  deliveryToken: z.string().max(8000).optional(),
  token: z.string().max(8000).optional(),
  restoreExamId: z.string().uuid().optional(),
  restoreQuickVersions: z.array(z.number().int().positive()).length(10).optional(),
  topic: z.string().max(80).optional(),
  difficulty: z.string().max(20).optional(),
  filter: z.string().max(40).optional(),
  offset: z.number().int().min(0).max(500).optional(),
  wrongIds: z.array(z.string().max(80)).max(80).optional(),
  unansweredIds: z.array(z.string().max(80)).max(200).optional(),
  presentationVersion: z.number().int().min(1).max(3).optional(),
});

const newActor = { limit: 12, windowMs: 10 * 60_000 };
const newIp = { limit: 150, windowMs: 10 * 60_000 };
const resumeActor = { limit: 120, windowMs: 60_000 };

const azPool = eligibleExamPool();
const classicCounts = {
  AZ: { published: azPool.length, free: azPool.filter(question => question.is_free).length },
  CA: caQuestionCounts(),
  HI: hiQuestionCounts(),
};

function practiceOffer(state: StateCode, isPro: boolean) {
  const pack = packFor(state);
  if (pack) return resultOffer({
    purchaseEnabled: pack.available && pack.purchaseEnabled !== false && !pack.freeLaunch,
    isPro,
    counts: pack.counts(),
  });
  const counts = classicCounts[state as keyof typeof classicCounts];
  return counts ? resultOffer({ purchaseEnabled: true, isPro, counts: {
    ...counts, pro: counts.published - counts.free,
  } }) : null;
}

function limited(result: { ok: boolean; retryAfter: number }, message: string) {
  if (result.ok) return null;
  console.info(JSON.stringify({ event: "practice_limited", retryAfter: result.retryAfter }));
  return NextResponse.json({ error: message }, { status: 429, headers: { ...privateHeaders, "Retry-After": String(result.retryAfter) } });
}

async function actorId(sessionId?: string) {
  const jar = await cookies();
  let anon = anonymousPracticeActor(jar.get(ANON_COOKIE)?.value);
  if (!anon) {
    anon = randomBytes(24).toString("base64url");
    jar.set(ANON_COOKIE, anon, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 180,
    });
  }
  return { id: sessionId || practiceGuestSubject(anon), anon };
}

function loadIds(ids: string[], state: StateCode, isPro: boolean, versions?: number[]) {
  const questions: Question[] = [];
  for (const [index, id] of ids.entries()) {
    const current = questionByBankId(id);
    const question = versions ? resolveQuestionVersion(current, versions[index]) : current;
    if (!question || question.state !== state || (!isPro && !question.is_free)) return null;
    questions.push(question);
  }
  return questions;
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "This practice request was rejected." }, { status: 403, headers: privateHeaders });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid practice request" }, { status: 400, headers: privateHeaders });
  if (productionStateBlocked(body.data.state)) return NextResponse.json({ error: "State not available" }, { status: 404, headers: privateHeaders });
  const session = await getSession();
  const actor = await actorId(session?.id);
  const isPro = Boolean(session && await hasStatePro(session.id, body.data.state));
  const bypass = internalTask(req);
  let prior = body.data.token ? await readPractice(body.data.token) : null;
  if (body.data.restoreExamId && body.data.mode === "full" &&
      (!prior?.revealed || prior.fullTrialId !== body.data.restoreExamId)) {
    const store = await getStore();
    const guest = practiceGuestSubject(actor.anon);
    const receipt = await store.getGuestExam(`practice-full:${actor.id}`, body.data.state);
    const match = receipt?.examId === body.data.restoreExamId ? receipt :
      session ? await store.getGuestExam(`practice-full:${guest}`, body.data.state) : null;
    if (match?.examId === body.data.restoreExamId) {
      const saved = match.sitting as typeof prior;
      if (saved?.fullTrialId === match.examId && saved.state === body.data.state && ownsPractice(saved, session?.id, actor.anon)) {
        prior = { ...saved, revealed: true };
      }
    }
  }
  const claimed = prior?.purpose === "sitting" && prior.state === body.data.state && ownsPractice(prior, session?.id, actor.anon) ? prior : null;
  try {
    if (body.data.kind === "topic") {
      if (!bypass) {
        const cap = await durableLimit(`topic:${actor.id}`, newActor.limit, newActor.windowMs);
        const ipCap = await durableLimit(`topic-ip:${trustedClientIp(req)}`, newIp.limit, newIp.windowMs);
        const stop = limited(cap, "Too many question pages were opened. Your place is saved. Retry shortly.") || limited(ipCap, "Too many question pages were opened from this network. Retry shortly.");
        if (stop) return stop;
      }
      const seed = body.data.seed ?? randomInt(1_000_000_000);
      const page = topicPage({
        state: body.data.state,
        topic: body.data.topic,
        difficulty: body.data.difficulty,
        filter: body.data.filter,
        offset: body.data.offset || 0,
        limit: 15,
        seed,
        isPro,
        wrongIds: body.data.wrongIds,
        unansweredIds: body.data.unansweredIds,
      });
      const token = page.questions.length ? await signPractice({
        sub: actor.id, state: body.data.state, ids: page.questions.map((question) => question.question_id),
        seed, pv: 2, practice: true, revealed: false, purpose: "sitting",
        versions: page.questions.map((question) => question.version),
      }) : "";
      return NextResponse.json({
        token,
        seed,
        questions: clientQuestions(page.questions, seed, 2, false),
        total: page.total,
        nextOffset: page.nextOffset,
        freeCount: page.freeCount,
        topicCount: page.topicCount,
        pro: isPro,
      }, { headers: privateHeaders });
    }
    let seed = body.data.seed ?? randomInt(1_000_000_000);
    let questions: Question[] | null = null;
    let unscoredIds: string[] = [];
    let examId: string | undefined;
    let fullTrialId: string | undefined;
    let resume = false;
    if (claimed) {
      questions = loadIds(claimed.ids, body.data.state, isPro || claimed.revealed || Boolean(claimed.fullTrialId), claimed.versions);
      if (!questions) return NextResponse.json({ error: "Pro access is required to reopen this saved set. Your stored result is preserved." }, { status: 402, headers: privateHeaders });
      seed = claimed.seed;
      unscoredIds = claimed.unscoredIds || [];
      fullTrialId = claimed.fullTrialId;
      examId = fullTrialId;
      resume = true;
    }
    if (!questions && body.data.presetIds?.length && body.data.deliveryToken) {
      const delivery = await readPractice(body.data.deliveryToken);
      const allowed = new Set(delivery?.ids || []);
      if (delivery && delivery.purpose === "delivery" && delivery.state === body.data.state && ownsPractice(delivery, session?.id, actor.anon) && body.data.presetIds.every((id) => allowed.has(id))) {
        questions = loadIds(body.data.presetIds, body.data.state, isPro);
        if (!questions) return NextResponse.json({ error: "Pro access is required to reopen this saved set. Your stored result is preserved." }, { status: 402, headers: privateHeaders });
      }
    }
    if (!bypass && !resume && !questions) {
      const cap = await durableLimit(`sit:${actor.id}`, newActor.limit, newActor.windowMs);
      const ipCap = await durableLimit(`sit-ip:${trustedClientIp(req)}`, newIp.limit, newIp.windowMs);
      const stop = limited(cap, "Too many practice sets were opened. Your saved answers are still on this device. Retry shortly.") || limited(ipCap, "Too many practice sets were opened from this network. Your saved answers are still on this device. Retry shortly.");
      if (stop) return stop;
    } else if (!bypass) {
      const cap = await durableLimit(`resume:${actor.id}`, resumeActor.limit, resumeActor.windowMs);
      const stop = limited(cap, "This practice set is being restored too often. Your saved answers are still on this device. Retry shortly.");
      if (stop) return stop;
    }
    if (!questions && body.data.mode === "quick" && body.data.restoreQuickVersions) {
      const ids = body.data.questionIds || [];
      questions = ids.length === 10 && new Set(ids).size === 10 && body.data.seed != null
        ? loadIds(ids, body.data.state, isPro, body.data.restoreQuickVersions) : null;
      if (!questions) return NextResponse.json({ error: "Feedback for this saved practice is unavailable." }, { status: 409, headers: privateHeaders });
    }
    if (!questions && body.data.state === "IN" && body.data.mode === "full") {
      const store = await getStore();
      if (session) {
        const sitting = await startIndianaSitting(store, session.id);
        examId = sitting.examId;
        seed = sitting.seed;
        questions = indianaSittingQuestions(sitting);
      } else {
        const guest = await ensureIndianaGuest();
        const sitting = indianaGuestSitting(guest);
        const saved = await store.reserveGuestExam({ owner: guest.owner, state: "IN", examId: sitting.examId, sitting });
        if (saved.result) return NextResponse.json({ error: "The free Indiana full practice is already used" }, { status: 402, headers: privateHeaders });
        const row = saved.sitting as IndianaSitting;
        examId = row.examId;
        seed = row.seed;
        questions = indianaSittingQuestions(row);
      }
    }
    if (!questions && body.data.mode === "diagnostic") {
      if (body.data.state !== "AZ") return NextResponse.json({ error: "This practice set is not available." }, { status: 400, headers: privateHeaders });
      const picked = pickDiagnosticQuestions(diagnosticCandidates("AZ"), 10, seed, "AZ");
      if (picked.length !== 10) return NextResponse.json({ error: "This practice set is not available." }, { status: 400, headers: privateHeaders });
      questions = picked;
    }
    if (!questions) {
      const full = body.data.mode === "full" && !body.data.focusArea;
      if (full && !isPro && !await fullTrialAvailable(body.data.state, actor.id, session?.id)) {
        return NextResponse.json({ error: "The free full practice for this state is already used." }, { status: 402, headers: privateHeaders });
      }
      const drawn = drawPractice({
        state: body.data.state,
        mode: body.data.mode || "quick",
        seed,
        isPro,
        focusArea: body.data.focusArea,
        missedIds: body.data.missedIds,
        practice: body.data.practice,
      });
      if ("error" in drawn) return NextResponse.json({ error: "This practice set is not available." }, { status: 400, headers: privateHeaders });
      const same = body.data.questionIds?.length && drawn.questions.map((question) => question.question_id).join("|") === body.data.questionIds.join("|");
      questions = drawn.questions;
      if (full && !isPro && questions.length) {
        fullTrialId = randomUUID();
        examId = fullTrialId;
      }
      unscoredIds = drawn.unscoredIds;
      seed = drawn.seed;
      resume = Boolean(same);
    }
    if (!questions.length) return NextResponse.json({ token: "", seed, questions: [], unscoredIds, pro: isPro, examId }, { headers: privateHeaders });
    if (questions.length > 80) return NextResponse.json({ error: "This practice set is not available." }, { status: 400, headers: privateHeaders });
    const revealed = Boolean(claimed?.revealed);
    const pv = claimed?.pv || body.data.presentationVersion || 2;
    const token = await signPractice({
      sub: claimed && fullTrialId ? claimed.sub : actor.id,
      state: body.data.state,
      ids: questions.map((question) => question.question_id),
      seed,
      pv,
      practice: claimed?.practice ?? (body.data.mode !== "full" && Boolean(body.data.practice)),
      revealed,
      purpose: "sitting",
      fullTrialId,
      unscoredIds,
      versions: questions.map((question) => question.version),
    });
    return NextResponse.json({
      token,
      seed,
      presentationVersion: pv,
      questionIds: questions.map((question) => question.question_id),
      unscoredIds,
      questions: clientQuestions(questions, seed, pv, revealed),
      revealed,
      pro: isPro,
      resultOffer: practiceOffer(body.data.state, isPro),
      examId,
    }, { headers: privateHeaders });
  } catch (error) {
    const code = error instanceof Error ? error.message : "";
    if (code === "full_trial_used") return NextResponse.json({ error: "The free full practice for this state is already used" }, { status: 402, headers: privateHeaders });
    if (code === "pro_required") return NextResponse.json({ error: "Pro access is required to reopen this saved set. Your stored result is preserved." }, { status: 402, headers: privateHeaders });
    if (code === "question_updated") return NextResponse.json({ error: "Question updated; reload before answering" }, { status: 409, headers: privateHeaders });
    throw error;
  }
}
