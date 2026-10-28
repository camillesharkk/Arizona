/** Regression checks for wrong-answer mutations. Run with Node's strip-types support. */
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import ts from "typescript";
import { createMemoryStore } from "../lib/store/memory-store.ts";
import type { QuestionStat } from "../lib/store/types.ts";

const store = createMemoryStore();
let user: { id: string } | null = { id: "owner" };
let failWrites = false;
const require = createRequire(import.meta.url);
const source = fs.readFileSync(new URL("../app/api/mistakes/route.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const routeModule = { exports: {} as Record<string, (request?: Request) => Promise<Response>> };
const routeRequire = (id: string) => {
  if (id === "next/server") return { NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) } };
  if (id === "@/lib/session") return { getSession: async () => user };
  if (id === "@/lib/store") return { getStore: async () => ({ ...store,
    updateReviewStat: async (...args: Parameters<typeof store.updateReviewStat>) => {
      if (failWrites) throw new Error("simulated database failure");
      return store.updateReviewStat(...args);
    },
  }) };
  // Save-for-review and GET scheduling are outside these action regression checks.
  if (id.startsWith("@/")) return {};
  return require(id);
};
new Function("require", "module", "exports", compiled)(routeRequire, routeModule, routeModule.exports);
const post = async (body: unknown) => routeModule.exports.POST(new Request("http://localhost/api/mistakes/", {
  method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
}));
const stat: QuestionStat = {
  userId: "owner", questionId: "q1", topic: "identification", bank: "arizona-notary-exam", chapter: "id", state: "AZ",
  firstCorrect: false, lastCorrect: false, wrongCount: 3, rightCount: 2, reviewCount: 1, consecutiveCorrect: 0,
  reviewStage: 0, reviewPlan: "v2", lastWrongAt: null, lastReviewedAt: null, nextReviewAt: "2026-10-28T00:00:00Z",
  firstAt: null, lastAt: null, lastSelected: "A", lastCorrectOption: "B", mastered: false, favorited: false, savedForReview: true,
};
await store.upsertStat({ ...stat });
await store.upsertStat({ ...stat, userId: "other" });
assert.equal((await post({ questionId: "q1", favorited: true })).status, 200);
assert.equal((await store.getStat("owner", "q1"))?.favorited, true);
assert.equal((await store.getStat("other", "q1"))?.favorited, false);
assert.equal((await post({ questionId: "q1", favorited: false })).status, 200);
assert.equal((await store.getStat("owner", "q1"))?.favorited, false);
assert.equal((await post({ questionId: "q1", mastered: true })).status, 200);
let result = await store.getStat("owner", "q1");
assert.equal(result?.mastered, true);
assert.equal(result?.nextReviewAt, null);
assert.equal(result?.wrongCount, 3);
assert.equal(result?.lastSelected, "A");
assert.equal(result?.lastCorrect, false);
await store.upsertStat({ ...stat, favorited: true });
const removed = await post({ questionId: "q1", remove: true });
assert.equal(removed.status, 200);
const removedData = await removed.json();
assert.equal("userId" in removedData.stat, false);
result = await store.getStat("owner", "q1");
assert.equal(result?.wrongCount, 0);
assert.equal(result?.savedForReview, false);
assert.equal(result?.favorited, false);
assert.equal(result?.mastered, true);
assert.equal(result?.rightCount, 2);
assert.equal(result?.lastCorrect, false);
assert.equal((await store.getStat("other", "q1"))?.wrongCount, 3);
assert.equal((await post({ questionId: "missing", favorited: true })).status, 404);
assert.equal((await post({ questionId: "q1" })).status, 400);
assert.equal((await post({ questionId: "q1", mastered: "yes" })).status, 400);
user = null;
assert.equal((await post({ questionId: "q1", remove: true })).status, 401);
user = { id: "owner" };
failWrites = true;
const originalError = console.error;
console.error = () => undefined;
try {
  const failed = await post({ questionId: "q1", favorited: true });
  assert.equal(failed.status, 500);
  assert.match((await failed.json()).error, /try again/i);
} finally {
  console.error = originalError;
}
console.log("Wrong-answer mutations: favorite/unfavorite, master, remove, ownership, history, auth, and failure checks passed.");
