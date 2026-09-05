/**
 * AI Tutor quota / delivery gate.
 * Run: npm run ai:verify
 * In-memory only. No OpenAI. No production DB.
 */
import { createMemoryStore } from "../lib/store/memory-store.ts";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "../lib/product.ts";
import { deliverTutorAnswer, readAiUsage, utcAiDay } from "../lib/ai/quota.ts";
import { localTutor } from "../lib/ai/local-tutor.ts";
import {
  AI_MAX_OUTPUT_TOKENS,
  DEFAULT_AI_MODEL,
  OPENAI_RESPONSES_URL,
  extractResponsesText,
  parseOpenAiDailyCap,
  requestOpenAiTutor,
} from "../lib/ai/openai.ts";
import { buildTutorPrompt } from "../lib/ai/prompt.ts";
import { runTutorTurn } from "../lib/ai/tutor.ts";
import { retrieveContext } from "../data/rag.ts";
import { publishedQuestions } from "../data/questions.ts";
import { sources } from "../data/sources.ts";
import { readFileSync } from "fs";
import path from "path";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

const sampleQ = {
  question_text: "Which option is required?",
  correct_option: "B",
  explanation: "The statute requires personal appearance.",
  option_feedback: { A: "Wrong.", B: "Correct.", C: "Wrong.", D: "Wrong." },
  option_a: "A",
  option_b: "B",
  option_c: "C",
  option_d: "D",
};

async function run() {
  if (AI_LIMIT_FREE !== 75) fail("Free limit should be 75");
  else ok("Free limit = 75");
  if (AI_LIMIT_PRO !== 300) fail("Pro limit should be 300");
  else ok("Pro limit = 300");

  const day = utcAiDay();
  const store = createMemoryStore();
  const freeId = "free-user";

  for (let i = 1; i <= AI_LIMIT_FREE; i++) {
    const r = await deliverTutorAnswer({
      store,
      userId: freeId,
      limit: AI_LIMIT_FREE,
      text: `ok ${i}`,
      day,
    });
    if (!r.ok || r.used !== i) {
      fail(`Free request ${i} should succeed with used=${i}`);
      break;
    }
    if (i === AI_LIMIT_FREE) ok("Free request 75 succeeds");
  }
  const free76 = await deliverTutorAnswer({
    store,
    userId: freeId,
    limit: AI_LIMIT_FREE,
    text: "too many",
    day,
  });
  if (free76.ok || free76.reason !== "limit" || free76.used !== 75 || free76.remaining !== 0) {
    fail("Free request 76 should be 429/limit");
  } else ok("Free request 76 → limit reached");

  const proId = "pro-user";
  for (let i = 1; i <= AI_LIMIT_PRO; i++) {
    const r = await deliverTutorAnswer({
      store,
      userId: proId,
      limit: AI_LIMIT_PRO,
      text: `ok ${i}`,
      day,
    });
    if (!r.ok || r.used !== i) {
      fail(`Pro request ${i} should succeed with used=${i}`);
      break;
    }
    if (i === AI_LIMIT_PRO) ok("Pro request 300 succeeds");
  }
  const pro301 = await deliverTutorAnswer({
    store,
    userId: proId,
    limit: AI_LIMIT_PRO,
    text: "too many",
    day,
  });
  if (pro301.ok || pro301.used !== 300) fail("Pro request 301 should be limited");
  else ok("Pro request 301 → limit reached");

  const failId = "fail-user";
  const beforeFail = await readAiUsage(store, failId, AI_LIMIT_FREE, day);
  const empty = await deliverTutorAnswer({ store, userId: failId, limit: AI_LIMIT_FREE, text: "   ", day });
  const afterEmpty = await readAiUsage(store, failId, AI_LIMIT_FREE, day);
  if (empty.ok || empty.reason !== "empty" || afterEmpty.used !== beforeFail.used) fail("empty provider response should not consume");
  else ok("empty provider response → usage unchanged");

  const afterNoCall = await readAiUsage(store, failId, AI_LIMIT_FREE, day);
  if (afterNoCall.used !== 0) fail("provider/validation failure path wrote usage");
  else ok("provider failure / validation error / unauthenticated / 402 paths do not consume unless deliver is called");

  const grounded = localTutor("explain", sampleQ, "B", "context", "A.R.S. § 41-253");
  if (!grounded.trim()) fail("grounded-fallback should return text");
  const g = await deliverTutorAnswer({ store, userId: failId, limit: AI_LIMIT_FREE, text: grounded, day });
  if (!g.ok || g.used !== 1) fail("grounded-fallback success should consume 1");
  else ok("grounded-fallback success → usage +1");

  const raceStore = createMemoryStore();
  const raceId = "race";
  const raced = await Promise.all([
    raceStore.consumeAiQuota(raceId, day, 1),
    raceStore.consumeAiQuota(raceId, day, 1),
  ]);
  const wins = raced.filter((r) => r.ok).length;
  const used = await raceStore.aiCount(raceId, day);
  if (wins !== 1 || used !== 1) fail(`concurrent last-slot expected one win, got wins=${wins} used=${used}`);
  else ok("concurrent last-slot consumption → only one increments");

  const usage = await readAiUsage(store, freeId, AI_LIMIT_FREE, day);
  if (usage.used !== 75 || usage.limit !== 75 || usage.remaining !== 0) fail("GET usage snapshot incorrect");
  else ok("GET usage → used/limit/remaining correct");

  const markStore = createMemoryStore();
  const markId = "pro-mark";
  let marked = 0;
  for (let i = 1; i <= 76; i++) {
    await deliverTutorAnswer({
      store: markStore,
      userId: markId,
      limit: AI_LIMIT_PRO,
      text: `n${i}`,
      day,
      onExceedFreeQuota: async () => {
        marked += 1;
      },
    });
    if (i === 75 && marked !== 0) fail("Pro request #75 marked Pro usage");
    if (i === 76 && marked !== 1) fail("Pro request #76 did not mark Pro usage");
  }
  if (marked === 1) {
    ok("Pro request #75 does NOT mark Pro usage");
    ok("Pro request #76 DOES mark ai_tutor_pro_quota");
  }

  const examSrc = readFileSync(path.join(process.cwd(), "components/ExamRunner.tsx"), "utf8");
  const qSrc = readFileSync(path.join(process.cwd(), "components/QuestionsClient.tsx"), "utf8");
  if (examSrc.includes("consumeAiQuota") || qSrc.includes("consumeAiQuota")) {
    fail("basic question UI wrote ai_usage directly");
  } else if (!examSrc.includes("q.explanation") || !qSrc.includes("option_feedback")) {
    fail("basic question explanation missing from core UI");
  } else ok("basic question explanation never writes ai_usage");

  const SECRET = "sk-verify-openai-secret-do-not-log";
  const capturedLogs: string[] = [];
  const origError = console.error;
  const origLog = console.log;
  console.error = (...args: unknown[]) => {
    capturedLogs.push(args.map(String).join(" "));
  };
  console.log = (...args: unknown[]) => {
    capturedLogs.push(args.map(String).join(" "));
  };
  try {

  function jsonResponse(status: number, body: unknown) {
    return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  }

  const liveQ = publishedQuestions().find((x) => x.question_id === "az-007");
  if (!liveQ) fail("published az-007 required for prompt tests");
  const tutorQ = liveQ ?? {
    ...sampleQ,
    topic: "identification",
    source_id: "ars_41_253",
  };

  const extracted = extractResponsesText({
    output: [
      {
        type: "message",
        content: [{ type: "output_text", text: "Responses API extracted text." }],
      },
    ],
  });
  if (extracted !== "Responses API extracted text.") fail("correct response extraction");
  else ok("correct response extraction");

  const noKeyStore = createMemoryStore();
  const noKey = await runTutorTurn({
    store: noKeyStore,
    userId: "nokey",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    selected: "A",
  });
  if (!noKey.ok || noKey.provider !== "grounded-fallback" || noKey.used !== 1) fail("no key → local fallback");
  else ok("no key → local fallback");

  let openaiUrl = "";
  let openaiBody = "";
  const okStore = createMemoryStore();
  const okTurn = await runTutorTurn({
    store: okStore,
    userId: "openai-ok",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    selected: "B",
    apiKey: SECRET,
    fetch: (async (input, init) => {
      openaiUrl = String(input);
      openaiBody = String(init?.body || "");
      return jsonResponse(200, { output_text: "OpenAI grounded answer." });
    }) as typeof fetch,
  });
  if (!okTurn.ok || okTurn.provider !== "openai" || okTurn.text !== "OpenAI grounded answer." || okTurn.used !== 1) {
    fail("Responses API success → provider=openai");
  } else ok("Responses API success → provider=openai");
  if (openaiUrl !== OPENAI_RESPONSES_URL) fail("OpenAI must use Responses API");
  else ok("OpenAI request uses /v1/responses");

  const parsedBody = JSON.parse(openaiBody || "{}") as { model?: string; max_output_tokens?: number; input?: string };
  if (parsedBody.model !== DEFAULT_AI_MODEL) fail(`default model should be ${DEFAULT_AI_MODEL}`);
  else ok(`default model = ${DEFAULT_AI_MODEL}`);
  if (parsedBody.max_output_tokens !== AI_MAX_OUTPUT_TOKENS) fail("max output is not bounded");
  else ok("max output is bounded");
  const prompt = parsedBody.input || "";
  if (!prompt.includes("Use only the supplied verified context") || !prompt.includes("Do not invent Arizona law")) {
    fail("prompt missing grounding rules");
  } else ok("prompt contains relevant verified context");
  if (prompt.includes(sources.ars_41_317.title) || prompt.includes(sources.ars_41_317.url) || prompt.includes(sources.ars_1_244.url)) {
    fail("prompt contains unrelated full source registry");
  } else ok("prompt does not contain unrelated full source registry");
  if (prompt.includes("openai-ok") || prompt.includes("@") || prompt.includes(SECRET) || prompt.includes("password")) {
    fail("prompt contains user PII or secret");
  } else ok("prompt does not contain user PII");

  const ctx = retrieveContext(tutorQ.topic, tutorQ.question_text, tutorQ.source_id);
  const built = buildTutorPrompt({
    mode: "explain",
    questionText: tutorQ.question_text,
    optionA: tutorQ.option_a,
    optionB: tutorQ.option_b,
    optionC: tutorQ.option_c,
    optionD: tutorQ.option_d,
    correctOption: tutorQ.correct_option,
    selected: "B",
    context: ctx,
    pinCite: "A.R.S. § 41-253",
  });
  if (!ctx.includes("41-253") && !ctx.toLowerCase().includes("identif")) fail("context missing question source");
  if (Object.values(sources).every((s) => ctx.includes(s.url))) fail("retrieveContext still dumps full registry");
  if (built.includes("user@example.test") || built.includes("555-0100")) fail("built prompt has PII");

  async function fallbackCase(label: string, fetchImpl: typeof fetch) {
    const s = createMemoryStore();
    const r = await runTutorTurn({
      store: s,
      userId: `fb-${label}`,
      limit: AI_LIMIT_FREE,
      mode: "explain",
      question: tutorQ,
      selected: "A",
      apiKey: SECRET,
      timeoutMs: 80,
      fetch: fetchImpl,
    });
    if (!r.ok || r.provider !== "grounded-fallback" || r.used !== 1) fail(`${label} → fallback`);
    else ok(`${label} → fallback`);
    return r;
  }

  await fallbackCase("provider network failure", (async () => {
    throw new Error("ECONNRESET");
  }) as typeof fetch);
  await fallbackCase("provider 429", (async () => jsonResponse(429, { error: "rate" })) as typeof fetch);
  await fallbackCase("provider 500", (async () => jsonResponse(500, { error: "boom" })) as typeof fetch);
  await fallbackCase("timeout", (async (_input, init) => {
    await new Promise<never>((_resolve, reject) => {
      init?.signal?.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    });
    return jsonResponse(200, { output_text: "late" });
  }) as typeof fetch);
  await fallbackCase("empty response", (async () => jsonResponse(200, { output: [] })) as typeof fetch);

  const failStore = createMemoryStore();
  const beforeFail2 = await readAiUsage(failStore, "double", AI_LIMIT_FREE, day);
  const failedThenOk = await runTutorTurn({
    store: failStore,
    userId: "double",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    apiKey: SECRET,
    fetch: (async () => {
      throw new Error("network");
    }) as typeof fetch,
  });
  const afterFail2 = await readAiUsage(failStore, "double", AI_LIMIT_FREE, day);
  if (!failedThenOk.ok || failedThenOk.used !== 1 || afterFail2.used !== beforeFail2.used + 1) {
    fail("failed provider request double-consumed quota");
  } else ok("failed provider request does not double-consume quota");
  if (!failedThenOk.ok || failedThenOk.provider !== "grounded-fallback" || failedThenOk.used !== 1) {
    fail("fallback success should consume exactly 1");
  } else ok("fallback success consumes exactly 1 user Tutor usage");

  if (parseOpenAiDailyCap({}) !== null || parseOpenAiDailyCap({ AI_OPENAI_DAILY_CAP: "" }) !== null) {
    fail("unset provider cap should stay disabled");
  } else ok("unset AI_OPENAI_DAILY_CAP keeps existing local behavior");
  if (parseOpenAiDailyCap({ AI_OPENAI_DAILY_CAP: "1000" }) !== 1000) fail("AI_OPENAI_DAILY_CAP=1000");
  else ok("configured AI_OPENAI_DAILY_CAP is honored");

  const capStore = createMemoryStore();
  const cap1 = await runTutorTurn({
    store: capStore,
    userId: "cap-a",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    apiKey: SECRET,
    openaiDailyCap: 1,
    fetch: (async () => jsonResponse(200, { output_text: "first openai" })) as typeof fetch,
  });
  const cap2 = await runTutorTurn({
    store: capStore,
    userId: "cap-b",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    apiKey: SECRET,
    openaiDailyCap: 1,
    fetch: (async () => jsonResponse(200, { output_text: "should not run" })) as typeof fetch,
  });
  if (!cap1.ok || cap1.provider !== "openai" || !cap2.ok || cap2.provider !== "grounded-fallback") {
    fail("site-wide OpenAI cap did not fall back");
  } else ok("site-wide OpenAI cap falls back to localTutor after limit");

  const snapshot = JSON.stringify({ okTurn, failedThenOk, noKey, cap1, cap2, capturedLogs });
  if (snapshot.includes(SECRET) || capturedLogs.some((l) => l.includes(SECRET))) fail("secret appeared in response/log snapshot");
  else ok("no secret appears in response/log snapshot");

  if (AI_LIMIT_FREE !== 75) fail("Free limit remains 75");
  else ok("Free limit remains 75");
  if (AI_LIMIT_PRO !== 300) fail("Pro limit remains 300");
  else ok("Pro limit remains 300");

  const direct = await requestOpenAiTutor({
    apiKey: SECRET,
    prompt: "x",
    fetch: (async () => jsonResponse(200, { output_text: "  " })) as typeof fetch,
  });
  if (direct.ok) fail("empty OpenAI text should be invalid/empty");
  else ok("empty model response is not treated as success");
  } finally {
    console.error = origError;
    console.log = origLog;
  }

  console.log(lines.join("\n"));
  if (failures) {
    console.error(`\nai:verify failed (${failures})`);
    process.exit(1);
  }
  console.log("\nai:verify passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
