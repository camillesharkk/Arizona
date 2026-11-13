import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testLoader } from "./pack-test-utils.mjs";

// Exercise the public handlers with isolated learning storage and a commerce spy.
process.env.AI_PROVIDER = "local";
process.env.VERCEL_ENV = "production";
let store;
let session;
const usage = [];
const load = testLoader({
  "@/lib/store": { getStore: async () => store },
  "@/lib/session": { getSession: async () => session },
  "@/lib/commerce/usage": {
    recordProUsage: async (userId, featureCode, event, state) => {
      usage.push({ userId, featureCode, event, state });
      return { recorded: true };
    },
  },
  "next/headers": { cookies: async () => ({ get: () => undefined }) },
});
store = load("lib/store/memory-store.ts").createMemoryStore();
const user = await store.createUser({
  email: `${randomUUID()}@example.invalid`, passwordHash: "isolated", name: null,
});
session = { id: user.id };
const rights = load("lib/entitlements.ts");
const grant = await rights.grantStatePro60d({
  userId: user.id, state: "IN", provider: "mock", providerOrderId: randomUUID(),
});
assert.equal(grant.entitlement.productCode, "az_exam_pro_60d");
assert.equal(grant.entitlement.state, "ALL");

function request(path, body) {
  return new Request(`http://localhost${path}`, {
    method: "POST", headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}
async function expectSuccess(response) {
  assert.equal(response.status, 200, await response.clone().text());
  return response.json();
}
function expectUsage(featureCode) {
  assert.equal(usage.length, 1, `${featureCode} records one usage call`);
  assert.equal(usage[0].userId, user.id);
  assert.equal(usage[0].featureCode, featureCode);
  assert.equal(usage[0].state, "IN");
  return usage[0];
}

const bank = load("data/in-questions.ts").publishedInQuestions();
const paid = bank.find(question => !question.is_free);
const free = bank.find(question => question.is_free);
assert.ok(paid && free);
const progress = load("app/api/progress/route.ts");
const answer = question => ({
  state: "IN", questionId: question.question_id, questionVersion: question.version,
  selected: question.correct_option, attemptId: randomUUID(),
});
await expectSuccess(await progress.POST(request("/api/progress/", answer(free))));
assert.equal(usage.length, 0, "A free question does not consume Pro usage");
await expectSuccess(await progress.POST(request("/api/progress/", answer(paid))));
expectUsage("pro_question");
console.log("PASS Indiana paid answers record shared Pro usage while free answers do not");

const full = load("app/api/indiana/sitting/route.ts");
async function startAndSubmit() {
  const sitting = await expectSuccess(await full.POST(request("/api/indiana/sitting/", {
    action: "start", accountId: user.id, examId: randomUUID(),
  })));
  const submission = {
    action: "submit", accountId: user.id, examId: sitting.examId,
    questions: sitting.questions.map(question => ({
      questionId: question.question_id, questionVersion: question.version,
      selected: question.correct_option,
    })),
  };
  const result = await expectSuccess(await full.POST(request("/api/indiana/sitting/", submission)));
  return { submission, result };
}
await startAndSubmit();
usage.length = 0;
const second = await startAndSubmit();
const receipt = expectUsage("full_exam_extra").event;
assert.equal(receipt.eventId, `in-full:${second.result.exam.id}`);
assert.deepEqual(Array.from(receipt.entitlementIds), [grant.entitlement.id]);
assert.equal((await store.listExams(user.id)).filter(exam => exam.mode === "in-full").length, 2);
usage.length = 0;
const retried = await expectSuccess(await full.POST(request("/api/indiana/sitting/", second.submission)));
assert.equal(retried.duplicate, true);
assert.equal(expectUsage("full_exam_extra").event.eventId, receipt.eventId);
assert.equal((await store.listExams(user.id)).filter(exam => exam.mode === "in-full").length, 2);
console.log("PASS Indiana extra full exams record the shared entitlement and retain one receipt on retry");

usage.length = 0;
const day = load("lib/ai/quota.ts").utcAiDay();
for (let index = 0; index < rights.AI_LIMIT_FREE - 1; index += 1) await store.bumpAi(user.id, day);
const tutor = load("app/api/ai/tutor/route.ts");
const tutorInput = {
  state: "IN", questionId: free.question_id, questionVersion: free.version, mode: "explain",
};
const lastFree = await expectSuccess(await tutor.POST(request("/api/ai/tutor/", tutorInput)));
assert.equal(lastFree.used, rights.AI_LIMIT_FREE);
assert.equal(usage.length, 0, "The last free Tutor request does not consume Pro usage");
const firstPro = await expectSuccess(await tutor.POST(request("/api/ai/tutor/", tutorInput)));
assert.equal(firstPro.used, rights.AI_LIMIT_FREE + 1);
expectUsage("ai_tutor_pro_quota");
console.log("PASS Indiana Tutor requests record Pro usage only after the free allowance");
