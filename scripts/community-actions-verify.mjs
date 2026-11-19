import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testLoader } from "./pack-test-utils.mjs";

process.env.DATABASE_URL = "test-loader-placeholder";
let actor = null;
let result = { ok: true, status: "published", threadId: randomUUID() };
let calls = [];
const { publishDiscussion, saveCommunityNickname, reportDiscussion } = testLoader({
  "@/lib/session": { getSession: async () => actor },
  "@/data/community-insights": { communityInsights: [] },
  "@/lib/community-store": { communityStore: () => ({
    publish: async input => { calls.push(input); return result; },
    setNickname: async (...args) => { calls.push(args); },
    report: async (...args) => { calls.push(args); return "reported"; },
  }) },
  "next/cache": { revalidatePath: () => {} },
})("app/community-insights/actions.ts");

function form(values) {
  const data = new FormData();
  for (const [key, value] of Object.entries(values)) data.set(key, value);
  return data;
}
const id = randomUUID();
const message = form({ id, title: "Study plan", body: "I disagree with this suggestion", userId: "forged-admin" });
const nickname = form({ nickname: "Quiet Quill" });
const report = form({ id, reason: "scam", note: "Looks like impersonation", reporterId: "forged-account" });
assert.match((await publishDiscussion({ message: "" }, message)).message, /sign in/i);
assert.match(await saveCommunityNickname("", nickname), /sign in/i);
assert.match((await reportDiscussion({ message: "" }, report)).message, /sign in/i);
assert.equal(calls.length, 0);

actor = { id: "actual-member" };
assert.equal((await publishDiscussion({ message: "" }, message)).status, "published");
assert.equal(calls.at(-1).userId, actor.id);
result = { ...result, status: "pending" };
const pending = await publishDiscussion({ message: "" }, message);
assert.equal(pending.status, "pending");
assert.equal(pending.href, undefined);
result = { ok: false, code: "rate", retryAfterSeconds: 1 };
const cooldown = await publishDiscussion({ message: "" }, message);
assert.equal(cooldown.retryAfterSeconds, 1);
assert.equal(cooldown.message, "Posting limit reached. Try again in 1 second.");
assert.equal(cooldown.status, undefined);
assert.equal(cooldown.href, undefined);
assert.equal(await saveCommunityNickname("", nickname), "");
assert.deepEqual(calls.at(-1), [actor.id, "Quiet Quill"]);
assert.match(await saveCommunityNickname("", form({ nickname: "member@example.test" })), /nickname/i);
assert.equal((await reportDiscussion({ message: "" }, report)).ok, true);
assert.deepEqual(calls.at(-1), [id, actor.id, "scam", "Looks like impersonation"]);
const before = calls.length;
assert.notEqual((await reportDiscussion({ message: "" }, form({ id, reason: "unknown" }))).ok, true);
assert.equal(calls.length, before);

console.log("Community actions verify login before storage, derive actor from session, validate input, and separate pending from public.");
