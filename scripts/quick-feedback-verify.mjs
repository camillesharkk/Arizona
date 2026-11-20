import assert from "node:assert/strict";
import { ANSWER_FEEDBACK_STREAM, readAnswerFeedback } from "../lib/answer-feedback.ts";
import { testLoader } from "./pack-test-utils.mjs";

const encoder = new TextEncoder();
const answer = { correct: false, correctOption: "B", explanation: "Review the rule § 12.", optionFeedback: {}, canonical: "A" };

async function verifyStream(saved) {
  let controller;
  const body = new ReadableStream({ start(stream) { controller = stream; } });
  const response = new Response(body, { headers: { "content-type": ANSWER_FEEDBACK_STREAM } });
  let onReveal;
  const beforeSave = new Promise((resolve) => { onReveal = resolve; });
  let finished = false;
  const result = readAnswerFeedback(response, onReveal).finally(() => { finished = true; });
  const bytes = encoder.encode(JSON.stringify(answer) + "\n");
  const sectionSign = bytes.indexOf(0xc2);
  controller.enqueue(bytes.slice(0, sectionSign + 1));
  controller.enqueue(bytes.slice(sectionSign + 1));
  assert.deepEqual(await beforeSave, answer);
  assert.equal(finished, false);
  if (saved !== undefined) controller.enqueue(encoder.encode(JSON.stringify({ saved }) + "\n"));
  controller.close();
  assert.deepEqual(await result, saved ? answer : { error: "Your answer was checked, but progress could not be saved." });
}

await verifyStream(true);
await verifyStream(false);
await verifyStream(undefined);
let previewCount = 0;
const onReveal = () => { previewCount++; };
assert.deepEqual(await readAnswerFeedback(Response.json(answer), onReveal), answer);
assert.deepEqual(await readAnswerFeedback(Response.json({ error: "Retry shortly" }, { status: 429 }), onReveal), { error: "Retry shortly" });
assert.equal(previewCount, 0);

let finishWrite;
let writes = 0;
const load = testLoader({
  "next/server": { NextResponse: Response },
  "next/headers": { cookies: async () => ({ get: () => undefined }) },
  "@/lib/durable-limit": {
    sameOrigin: () => true,
    internalTask: () => false,
    durableLimits: async (buckets) => {
      assert.equal(buckets.length, 2);
      return buckets.map(() => ({ ok: true }));
    },
  },
  "@/lib/trusted-ip": { trustedClientIp: () => "192.0.2.1" },
  "@/lib/entitlements": { hasStatePro: () => false },
  "@/lib/practice-token": {
    anonymousPracticeActor: () => "",
    readPractice: async () => ({ purpose: "sitting", sub: "test-account", state: "AZ", ids: ["test-question"], practice: true }),
    ownsPractice: (claims, userId) => claims.sub === userId,
  },
  "@/lib/practice-draw": {
    questionByBankId: () => ({ state: "AZ", is_free: true, question_id: "test-question", version: 1 }),
    prepareChoiceReveal: () => () => answer,
  },
  "@/lib/progress": {
    recordQuestionAnswer: (data) => {
      assert.equal(data.attemptId, "test-attempt");
      writes++;
      return new Promise((resolve) => { finishWrite = resolve; });
    },
  },
  "@/lib/session": { getSession: async () => ({ id: "test-account" }) },
  "@/lib/store": {},
  "@/lib/practice-trial": {},
  "@/lib/question-version": {},
}, { ReadableStream, performance });
const { POST } = load("app/api/practice/feedback/route.ts");
const response = await POST(new Request("http://localhost/api/practice/feedback/", {
  method: "POST",
  headers: { "Content-Type": "application/json", Accept: ANSWER_FEEDBACK_STREAM },
  body: JSON.stringify({ token: "fixture-token-is-long-enough", action: "one", questionId: "test-question", display: "A", attemptId: "test-attempt" }),
}));
assert.equal(response.headers.get("Content-Type"), ANSWER_FEEDBACK_STREAM);
const reader = response.body.getReader();
assert.deepEqual(JSON.parse(new TextDecoder().decode((await reader.read()).value)), answer);
assert.equal(writes, 1);
finishWrite();
assert.deepEqual(JSON.parse(new TextDecoder().decode((await reader.read()).value)), { saved: true });
assert.equal((await reader.read()).done, true);
console.log("Quick feedback: split chunks, actual handler response before write, save acknowledgement/failure/truncation, and existing JSON responses passed.");
