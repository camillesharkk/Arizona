/**
 * AI Tutor quota / delivery gate.
 * Run: npm run ai:verify
 * In-memory only. No DeepSeek network. No production DB.
 */
import { createMemoryStore } from "../lib/store/memory-store.ts";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "../lib/product.ts";
import { deliverTutorAnswer, readAiUsage, utcAiDay } from "../lib/ai/quota.ts";
import { localTutor } from "../lib/ai/local-tutor.ts";
import {
  AI_MAX_OUTPUT_TOKENS,
  DEFAULT_AI_MODEL,
  DEEPSEEK_RESPONSES_URL,
  extractResponsesText,
  parseAiProvider,
  parseProviderDailyCap,
  requestDeepSeekTutor,
} from "../lib/ai/provider.ts";
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

  const SECRET = "sk-verify-deepseek-secret-do-not-log";
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

  function deepseekMessage(text: string) {
    return { output: [{ type: "message", content: [{ type: "output_text", text }] }] };
  }

  const extracted = extractResponsesText(deepseekMessage("Responses API extracted text."));
  if (extracted !== "Responses API extracted text.") fail("correct response extraction");
  else ok("correct response extraction");

  const mixed = extractResponsesText({
    output: [
      { type: "reasoning", content: [{ type: "output_text", text: "hidden chain of thought" }] },
      { type: "message", content: [{ type: "output_text", text: "User facing answer." }] },
    ],
  });
  if (mixed !== "User facing answer.") fail("reasoning output leaked to user");
  else ok("reasoning output is NOT returned to user");

  if (parseAiProvider({}) !== "local" || parseAiProvider({ AI_PROVIDER: "local" }) !== "local") {
    fail("unset/local AI_PROVIDER should be local");
  } else ok("AI_PROVIDER=local → localTutor");

  let localCalls = 0;
  const localTurn = await runTutorTurn({
    store: createMemoryStore(),
    userId: "local-user",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    selected: "A",
    provider: "local",
    apiKey: SECRET,
    fetch: (async () => {
      localCalls += 1;
      return jsonResponse(200, deepseekMessage("should not call"));
    }) as typeof fetch,
  });
  if (!localTurn.ok || localTurn.provider !== "grounded-fallback" || localCalls !== 0) fail("AI_PROVIDER=local still called DeepSeek");
  else ok("AI_PROVIDER=local → localTutor");

  const noKey = await runTutorTurn({
    store: createMemoryStore(),
    userId: "nokey",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    selected: "A",
    provider: "deepseek",
  });
  if (!noKey.ok || noKey.provider !== "grounded-fallback" || noKey.used !== 1) fail("deepseek + no key should fallback");
  else ok("AI_PROVIDER=deepseek + no key → grounded fallback");

  let providerUrl = "";
  let providerBody = "";
  const okTurn = await runTutorTurn({
    store: createMemoryStore(),
    userId: "ds-ok",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    selected: "B",
    provider: "deepseek",
    apiKey: SECRET,
    fetch: (async (input, init) => {
      providerUrl = String(input);
      providerBody = String(init?.body || "");
      return jsonResponse(200, deepseekMessage("DeepSeek grounded answer."));
    }) as typeof fetch,
  });
  if (!okTurn.ok || okTurn.provider !== "deepseek" || okTurn.text !== "DeepSeek grounded answer." || okTurn.used !== 1) {
    fail("valid DeepSeek response → provider=deepseek");
  } else ok("valid DeepSeek response → provider=deepseek");
  if (providerUrl !== DEEPSEEK_RESPONSES_URL) fail("endpoint must be https://api.deepseek.com/responses");
  else ok("endpoint exactly https://api.deepseek.com/responses");

  const parsedBody = JSON.parse(providerBody || "{}") as {
    model?: string;
    max_output_tokens?: number;
    instructions?: string;
    input?: string;
    stream?: boolean;
    reasoning?: { effort?: string };
  };
  if (parsedBody.model !== DEFAULT_AI_MODEL) fail(`default model should be ${DEFAULT_AI_MODEL}`);
  else ok("model default: deepseek-v4-flash");
  if (parsedBody.max_output_tokens !== AI_MAX_OUTPUT_TOKENS) fail("max output is not bounded");
  else ok("max_output_tokens: 500");
  if (parsedBody.reasoning?.effort !== "none") fail("reasoning.effort should be none");
  else ok("reasoning.effort: none");
  if (parsedBody.stream !== false) fail("stream should be false");
  const prompt = `${parsedBody.instructions || ""}\n${parsedBody.input || ""}`;
  if (!prompt.includes("Use only the supplied verified context") || !prompt.includes("Do not invent Arizona law") || !prompt.includes(tutorQ.question_text)) {
    fail("prompt missing grounding rules or question");
  } else ok("prompt contains relevant verified context");
  if (prompt.includes(sources.ars_41_317.title) || prompt.includes(sources.ars_41_317.url) || prompt.includes(sources.ars_1_244.url)) {
    fail("prompt contains unrelated full source registry");
  } else ok("prompt does not contain full unrelated source registry");
  if (prompt.includes("ds-ok") || prompt.includes("@") || prompt.includes(SECRET) || prompt.includes("password")) {
    fail("prompt contains user PII or secret");
  } else ok("no user PII");
  if (!prompt.includes("Return plain text only") || !prompt.includes("Do not use Markdown")) {
    fail("prompt missing plain-text instructions");
  } else ok("prompt requires plain text, not Markdown");

  const md = [
    "**Why C is wrong:**",
    "",
    "Arizona law does **not** *authorizes* a blanket grant.",
    "",
    "### Key takeaway",
    "",
    "Under A.R.S. § 41-269(F), keep this citation.",
    "",
    "Use `code` only if needed.",
  ].join("\n");
  const mdTurn = await runTutorTurn({
    store: createMemoryStore(),
    userId: "md-ds",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    provider: "deepseek",
    apiKey: SECRET,
    fetch: (async () => jsonResponse(200, deepseekMessage(md))) as typeof fetch,
  });
  if (
    !mdTurn.ok ||
    mdTurn.text.includes("**") ||
    mdTurn.text.includes("*") ||
    mdTurn.text.includes("###") ||
    mdTurn.text.includes("`")
  ) {
    fail("DeepSeek markdown leaked to client");
  } else ok("DeepSeek markdown-like response → client text has no Markdown emphasis");
  if (!mdTurn.ok || !mdTurn.text.includes("A.R.S. § 41-269(F)")) fail("A.R.S. citation was stripped");
  else ok("A.R.S. § citation is preserved");
  if (!mdTurn.ok || !mdTurn.text.includes("\n")) fail("paragraph line breaks were flattened");
  else ok("paragraph line breaks are preserved");

  const similarTurn = await runTutorTurn({
    store: createMemoryStore(),
    userId: "md-sim",
    limit: AI_LIMIT_FREE,
    mode: "similar",
    question: tutorQ,
    provider: "deepseek",
    apiKey: SECRET,
    fetch: (async () => jsonResponse(200, deepseekMessage("**Similar question:**\n\nA signer appears.\n\n*Explanation*"))) as typeof fetch,
  });
  if (!similarTurn.ok || /[*#`]/.test(similarTurn.text)) fail("Similar question still has Markdown markers");
  else ok("Similar question contains no Markdown markers");

  const fbQ = {
    ...tutorQ,
    explanation: "**Why B is correct:**\n\nUnder A.R.S. § 41-253, personal appearance is required.\n\n*Note*",
  };
  const fbTurn = await runTutorTurn({
    store: createMemoryStore(),
    userId: "md-fb",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: fbQ,
    provider: "local",
  });
  if (!fbTurn.ok || /[*#`]/.test(fbTurn.text) || !fbTurn.text.includes("A.R.S. § 41-253") || !fbTurn.text.includes("\n")) {
    fail("grounded fallback skipped normalization");
  } else ok("grounded fallback also goes through normalization");

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
      provider: "deepseek",
      apiKey: SECRET,
      timeoutMs: 80,
      fetch: fetchImpl,
    });
    if (!r.ok || r.provider !== "grounded-fallback" || r.used !== 1) fail(`${label} → fallback`);
    else ok(`${label} → fallback`);
    return r;
  }

  await fallbackCase("network error", (async () => {
    throw new Error("ECONNRESET");
  }) as typeof fetch);
  await fallbackCase("DeepSeek 429", (async () => jsonResponse(429, { error: "rate" })) as typeof fetch);
  await fallbackCase("DeepSeek 500", (async () => jsonResponse(500, { error: "boom" })) as typeof fetch);
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
    provider: "deepseek",
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

  if (parseProviderDailyCap({}) !== null || parseProviderDailyCap({ AI_PROVIDER_DAILY_CAP: "" }) !== null) {
    fail("unset provider cap should stay disabled");
  } else ok("unset AI_PROVIDER_DAILY_CAP keeps existing local behavior");
  if (parseProviderDailyCap({ AI_PROVIDER_DAILY_CAP: "100" }) !== 100) fail("AI_PROVIDER_DAILY_CAP=100");
  else ok("configured AI_PROVIDER_DAILY_CAP is honored");

  const capStore = createMemoryStore();
  let capCalls = 0;
  const cap1 = await runTutorTurn({
    store: capStore,
    userId: "cap-a",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    provider: "deepseek",
    apiKey: SECRET,
    providerDailyCap: 1,
    fetch: (async () => {
      capCalls += 1;
      return jsonResponse(200, deepseekMessage("first deepseek"));
    }) as typeof fetch,
  });
  const cap2 = await runTutorTurn({
    store: capStore,
    userId: "cap-b",
    limit: AI_LIMIT_FREE,
    mode: "explain",
    question: tutorQ,
    provider: "deepseek",
    apiKey: SECRET,
    providerDailyCap: 1,
    fetch: (async () => {
      capCalls += 1;
      return jsonResponse(200, deepseekMessage("should not run"));
    }) as typeof fetch,
  });
  if (!cap1.ok || cap1.provider !== "deepseek" || !cap2.ok || cap2.provider !== "grounded-fallback" || capCalls !== 1) {
    fail("provider cap reached still called DeepSeek");
  } else ok("provider cap reached → no external DeepSeek call → localTutor");

  const snapshot = JSON.stringify({ okTurn, failedThenOk, noKey, cap1, cap2, capturedLogs });
  if (snapshot.includes(SECRET) || capturedLogs.some((l) => l.includes(SECRET))) fail("secret appeared in response/log snapshot");
  else ok("no secret appears in response/log snapshot");

  if (AI_LIMIT_FREE !== 75) fail("Free limit remains 75");
  else ok("Free limit remains 75");
  if (AI_LIMIT_PRO !== 300) fail("Pro limit remains 300");
  else ok("Pro limit remains 300");

  const direct = await requestDeepSeekTutor({
    apiKey: SECRET,
    instructions: "x",
    input: "y",
    fetch: (async () => jsonResponse(200, { output: [] })) as typeof fetch,
  });
  if (direct.ok) fail("empty DeepSeek text should be invalid/empty");
  else ok("empty response → fallback");
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
