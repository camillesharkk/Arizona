import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { randomUUID } from "node:crypto";
import ts from "typescript";
const native = createRequire(import.meta.url);
const cache = new Map();
let store;
let repo;
let user;
function load(file) {
  file = path.resolve(file);
  if (!path.extname(file)) file += ".ts";
  if (file === path.resolve("lib/commerce/index.ts")) return { getCommerceRepo: async () => repo };
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const require = name => {
    if (name === "server-only") return {};
    if (name === "@/lib/store") return { getStore: async () => store };
    if (name === "@/lib/session") return { getSession: async () => user };
    if (name.startsWith("@/")) return load(name.slice(2));
    if (name.startsWith(".")) return load(path.resolve(path.dirname(file), name));
    return native(name);
  };
  const source = ts.transpileModule(fs.readFileSync(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { module, exports: module.exports, require, process, console, Date, Math, structuredClone });
  return module.exports;
}
store = load("lib/store/memory-store.ts").createMemoryStore();
repo = load("lib/commerce/repo.ts").createMemoryCommerceRepo();
const { POST } = load("app/api/progress/route.ts");
const bank = load("data/ny-content.ts").publishedNyQuestions();
const questions = bank.slice(0, 40).map(q => ({ questionId: q.question_id, questionVersion: q.version, selected: q.correct_option }));
const submit = (examId = randomUUID(), answers = questions) => POST(new Request("http://localhost/api/progress/", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ kind: "ny-full", examId, questions: answers }) }));
async function account(pro = false) {
  user = await store.createUser({ email: randomUUID() + "@example.invalid", passwordHash: "isolated", name: null });
  if (pro) await store.insertEntitlement({ userId: user.id, productCode: "az_exam_pro_60d", state: "ALL", status: "active", startsAt: new Date(Date.now() - 10000).toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString(), provider: "mock", providerOrderId: randomUUID(), providerCustomerId: null });
}
const previous = process.env.VERCEL_ENV;
process.env.VERCEL_ENV = "production";
try {
  await account();
  assert.equal((await submit()).status, 200);
  assert.equal((await repo.listUsageForUser(user.id)).length, 0, "Free trial never counts as paid use");
  await account(true);
  const id = randomUUID();
  assert.equal((await submit(id)).status, 200);
  let usage = await repo.listUsageForUser(user.id);
  assert.equal(usage.length, 1, "ALL-state Pro full submission records paid use");
  assert.equal(usage[0].featureCode, "pro_question");
  assert.equal(usage[0].orderId, null, "A simulated entitlement without an order remains valid");
  assert.equal((await (await submit(id)).json()).duplicate, true);
  assert.equal((await repo.listUsageForUser(user.id)).length, 1);
  await account(true);
  await store.addExam({ id: randomUUID(), userId: user.id, mode: "ny-full", score: 0, correctCount: 0, total: 40, at: new Date().toISOString() });
  assert.equal((await submit(randomUUID(), questions.map(({ selected, ...question }) => question))).status, 200);
  usage = await repo.listUsageForUser(user.id);
  assert.equal(usage.length, 1);
  assert.equal(usage[0].featureCode, "full_exam_extra");
  await account(true);
  const recoveryId = randomUUID();
  const originalEntitlement = (await store.listEntitlements(user.id))[0];
  const insertUsage = repo.insertUsage.bind(repo);
  let failMarker = true;
  repo.insertUsage = async row => {
    if (failMarker) { failMarker = false; throw new Error("injected usage delivery failure"); }
    return insertUsage(row);
  };
  await assert.rejects(submit(recoveryId), /injected usage delivery failure/);
  assert.equal((await store.listExams(user.id)).length, 1, "The full submission committed before the marker failed");
  assert.equal((await repo.listUsageForUser(user.id)).length, 0);
  const receipt = (await store.getStudyPlan(user.id, "NY")).document.checks[recoveryId].proUsage;
  assert.ok(receipt, "The committed full has a retryable usage receipt");
  await load("lib/ca-daily.ts").saveCaExamCheck(user.id, randomUUID(), { wrongIds: [], skipped: 0 }, "NY");
  assert.equal((await store.getStudyPlan(user.id, "NY")).document.checks[recoveryId].proUsage.eventId, receipt.eventId, "A later Quick snapshot preserves the retry receipt");
  await store.setEntitlementStatus(user.id, originalEntitlement.provider, originalEntitlement.providerOrderId, "expired");
  const newer = await store.insertEntitlement({ userId: user.id, productCode: "az_exam_pro_60d", state: "ALL", status: "active", startsAt: new Date(Date.now() - 1000).toISOString(), expiresAt: new Date(Date.now() + 172800000).toISOString(), provider: "mock", providerOrderId: randomUUID(), providerCustomerId: null });
  assert.equal((await (await submit(recoveryId)).json()).duplicate, true);
  usage = await repo.listUsageForUser(user.id);
  assert.equal(usage.length, 1, "A duplicate repairs the failed usage marker");
  assert.equal(usage[0].entitlementId, originalEntitlement.id);
  assert.equal(usage[0].at, receipt.at);
  assert.equal(usage[0].id, receipt.eventId + ":" + originalEntitlement.id);
  assert.equal((await repo.listUsageForEntitlement(newer.id)).length, 0, "An old retry never marks a new entitlement");
  assert.equal((await (await submit(recoveryId)).json()).duplicate, true);
  assert.equal((await repo.listUsageForUser(user.id)).length, 1);
  repo.insertUsage = insertUsage;
  await account(true);
  const transaction = store.learningTransaction.bind(store);
  store.learningTransaction = (owner, action) => transaction(owner, async scoped => {
    let count = 0;
    const failing = Object.create(scoped);
    failing.upsertStat = async stat => { if (++count === 7) throw new Error("injected full rollback"); return scoped.upsertStat(stat); };
    return action(failing);
  });
  await assert.rejects(submit(), /injected full rollback/);
  store.learningTransaction = transaction;
  assert.equal((await repo.listUsageForUser(user.id)).length, 0, "Rolled-back full submission never records use");
  assert.equal((await store.listExams(user.id)).length, 0);
  assert.equal((await store.listStats(user.id)).length, 0);
  assert.equal(await store.getStudyPlan(user.id, "NY"), null);
  console.log("NY full usage passed: free trial unmarked, ALL-state Pro paid/extra features, duplicate idempotence, no-order entitlement, rollback boundary and failed-marker replay restricted to original entitlements.");
} finally { if (previous === undefined) delete process.env.VERCEL_ENV; else process.env.VERCEL_ENV = previous; }
