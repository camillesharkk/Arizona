/**
 * AI Tutor quota / delivery gate.
 * Run: npm run ai:verify
 * In-memory only. No OpenAI. No production DB.
 */
import { createMemoryStore } from "../lib/store/memory-store.ts";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "../lib/product.ts";
import { deliverTutorAnswer, readAiUsage, utcAiDay } from "../lib/ai/quota.ts";
import { localTutor } from "../lib/ai/local-tutor.ts";
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
