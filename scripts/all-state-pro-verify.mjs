import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { testLoader } from "./pack-test-utils.mjs";

let store;
const load = testLoader({ "@/lib/store": { getStore: async () => store } });
store = load("lib/store/memory-store.ts").createMemoryStore();
const rights = load("lib/entitlements.ts");
const account = load("lib/account-pro.ts");
const stateRights = load("lib/state-pro.ts");
const states = ["AZ", "CA", "HI", "NY", "PA", "LA", "CT", "NC", "IN"];
const now = new Date();
const active = {
  id: "active", userId: "isolated", state: "ALL", productCode: "az_exam_pro_60d",
  provider: "mock", providerOrderId: "active", status: "active",
  startsAt: new Date(now.getTime() - 86400000).toISOString(),
  expiresAt: new Date(now.getTime() + 86400000).toISOString(),
};

for (const state of states) {
  assert.equal(stateRights.stateProCovers([active], state, now), true, `${state} accepts existing global Pro`);
  for (const patch of [
    { expiresAt: new Date(now.getTime() - 1).toISOString() },
    { startsAt: new Date(now.getTime() + 1).toISOString() },
    { status: "refunded" }, { status: "revoked" }, { productCode: "unrelated_product" },
  ]) {
    assert.equal(stateRights.stateProCovers([{ ...active, ...patch }], state, now), false, `${state} denies inactive or unrelated rights`);
  }
}

for (const [source, product] of [["CT", "az_exam_pro_60d"], ["IN", "in_exam_pro_60d"], ["NC", "nc_exam_pro_60d"]]) {
  const row = { ...active, state: source, productCode: product };
  for (const state of states) assert.equal(stateRights.stateProCovers([row], state, now), true, `${source} legacy grant covers ${state}`);
  assert.ok(account.accountProCovers([row], now));
}

const user = await store.createUser({ email: `${randomUUID()}@example.invalid`, passwordHash: "isolated", name: null });
const grants = [];
for (const source of ["CT", "NC", "IN"]) {
  const orderId = randomUUID();
  const receipt = await rights.grantStatePro60d({ userId: user.id, state: source, provider: "mock", providerOrderId: orderId });
  assert.equal(receipt.entitlement.state, "ALL");
  assert.equal(receipt.entitlement.productCode, "az_exam_pro_60d");
  grants.push(receipt.entitlement);
  const repeated = await rights.grantStatePro60d({ userId: user.id, state: "AZ", provider: "mock", providerOrderId: orderId });
  assert.equal(repeated.duplicate, true);
}
assert.equal(Math.round((Date.parse(grants[2].expiresAt) - Date.parse(grants[0].startsAt)) / 86400000), 180);
for (const state of states) assert.equal(await rights.hasStatePro(user.id, state), true);
console.log("Nine-state global Pro, legacy grants, inactive boundaries, one shared product, renewal stacking and retry idempotency passed");
