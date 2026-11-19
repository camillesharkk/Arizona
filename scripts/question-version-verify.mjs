import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { testLoader } from "./pack-test-utils.mjs";

const load = testLoader();
const { publishQuestionEdit, publishQuestionEdits, resolveQuestionVersion, savedQuestionVersion } = load("lib/question-version.ts");
const original = { question_id: "ca-test-1", version: 1, state: "CA", is_free: true,
  question_text: "Original", option_a: "First", option_b: "Second", correct_option: "A",
  explanation: "Original explanation", effective_to: "2026-11-19" };
const patch = { question_text: "Revised", option_a: "Second", option_b: "First", correct_option: "B",
  explanation: "Revised explanation" };
const current = publishQuestionEdit(original, { version: 2, fields: patch });
assert.equal(current.version, 2);
assert.equal(current.effective_to, null);
assert.equal(current.is_free, true);
assert.equal(resolveQuestionVersion(current, 1).option_a, "First");
assert.equal(resolveQuestionVersion(current, 1).correct_option, "A");
assert.equal(resolveQuestionVersion(current, 2).correct_option, "B");
assert.equal(resolveQuestionVersion(current, 3), null);
assert.equal(savedQuestionVersion(undefined, original.question_id), 1);
assert.throws(() => publishQuestionEdit(original, { version: 3, fields: patch }));
const [retired, replacement] = publishQuestionEdits([original], {
  [original.question_id]: { version: 1, replacementId: "ca-test-2", fields: patch },
});
assert.equal(retired, original);
assert.equal(replacement.question_id, "ca-test-2");
assert.equal(replacement.replaces_question_id, retired.question_id);
assert.equal(replacement.effective_to, null);
assert.equal(replacement.is_free, retired.is_free);
assert.equal(resolveQuestionVersion(retired, 1)?.correct_option, "A");
console.log("Version resolution retains old keys and option order, and unknown versions remain unresolved.");

const { addUpdateReference, claimUpdateBatch, mergeUpdateReceipt, needsUpdatedReview, relatedUpdates } = load("lib/editorial-updates.ts");
const events = load("data/question-editorial-events.ts").editorialUpdates;
assert.ok(!events.some(row => row.questionId === "ca-029"), "Citation and wording changes do not trigger a reminder");
const event = events.find(row => row.questionId === "ca-054");
assert.ok(event?.previousVersion === 1);
const receipts = {};
assert.deepEqual([...claimUpdateBatch(receipts, [event.id, event.id], 1000)], [event.id]);
assert.deepEqual([...claimUpdateBatch(receipts, [event.id], 2000)], []);
assert.equal(receipts[event.id].shown, undefined, "A lease does not count as shown");
assert.deepEqual([...claimUpdateBatch(receipts, [event.id], 32000)], [event.id], "A failed display can be retried");
receipts[event.id] = mergeUpdateReceipt(receipts[event.id], { shown: true });
assert.equal(receipts[event.id].read, false, "Later leaves the update unread");
assert.deepEqual([...claimUpdateBatch(receipts, [event.id], 64000)], []);
assert.equal(mergeUpdateReceipt(receipts[event.id], { read: true }).read, true);
const references = new Map();
assert.equal(relatedUpdates(events, references).length, 0);
addUpdateReference(references, event.questionId, "wrong answers");
addUpdateReference(references, event.questionId, "bookmarks");
addUpdateReference(references, event.questionId, "bookmarks");
assert.equal(relatedUpdates(events, references)[0].relations.length, 2);
assert.equal(needsUpdatedReview(event, { questionVersion: 1 }), true);
assert.equal(needsUpdatedReview(event, { questionVersion: 2, lastAt: new Date().toISOString() }), false);
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "notary-version-verify-"));
process.env.NOTARY_DATA_DIR = dir;
delete process.env.DATABASE_URL;
const { fileStore } = load("lib/store/file-store.ts");
let account;
const isolated = testLoader({
  "@/lib/session": { getSession: async () => account ? { id: account.id } : null },
  "@/lib/store": { getStore: async () => fileStore },
});
const appProgress = isolated("app/api/progress/route.ts");
const updates = isolated("app/api/question-updates/route.ts");
const request = (url, body) => new Request("http://localhost" + url, {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});
try {
  account = await fileStore.createUser({ email: "editorial-verify@example.invalid", passwordHash: "isolated", name: null });
  assert.equal((await (await updates.GET()).json()).updates.length, 0);
  const post = (version, selected, attemptId = randomUUID()) => appProgress.POST(request("/api/progress/", {
    state: "CA", questionId: "ca-054", questionVersion: version, selected, attemptId,
  }));
  const attempt = randomUUID();
  assert.equal((await post(1, "A", attempt)).status, 200);
  assert.equal((await post(1, "A", attempt)).status, 200);
  await fileStore.updateReviewStat(account.id, "ca-054", { favorited: true, mastered: true });
  const changed = (await (await updates.GET()).json()).updates;
  assert.equal(changed.length, 1);
  assert.ok(changed[0].relations.includes("bookmarks") && changed[0].relations.includes("wrong answers"));
  const claim = () => updates.POST(request("/api/question-updates/", { account: account.id, claim: [event.id] }));
  const devices = await Promise.all([claim(), claim()]);
  assert.equal((await Promise.all(devices.map(res => res.json()))).flatMap(body => body.claimed).length, 1);
  const ack = () => updates.POST(request("/api/question-updates/", { account: account.id, receipts: [{ id: event.id, shown: true }] }));
  await ack();
  await ack();
  assert.equal((await (await updates.GET()).json()).receipts[event.id].read, false);
  assert.deepEqual((await (await claim()).json()).claimed, []);
  assert.equal((await post(3, "A")).status, 409);
  assert.equal((await post(2, "C")).status, 200);
  assert.equal((await post(1, "A")).status, 200);
  const stat = await fileStore.getStat(account.id, "ca-054");
  assert.equal(stat.questionVersion, 2);
  assert.equal(stat.wrongCount, 0);
  assert.equal(stat.rightCount, 1);
  assert.equal(stat.favorited, true);
  assert.equal(stat.revisionHistory[0].wrongCount, 2);
  assert.equal(stat.revisionHistory[0].lastSelected, "A");
  assert.equal(await (await updates.POST(request("/api/question-updates/", { account:"different", claim:[event.id] }))).status, 409);
  console.log("Historical saves, new mastery isolation, preserved bookmarks, association targeting, and cross-device receipts passed.");
} finally {
  fs.rmSync(dir, { recursive: true, force: true });
}
