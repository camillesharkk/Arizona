import assert from "node:assert/strict";
import { accountProCovers, accountProExpiry, hasLifetimePro } from "../lib/account-pro.ts";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { assertQuoteStillValid, completeNonRestoringRefund, confirmPaidOrder, createQuote, currentlyServingEntitlements, refundEligibility } from "../lib/commerce/service.ts";
import { LIFETIME_POLICY_VERSION } from "../lib/pricing/lifetime.ts";
import { LIFETIME_PRO_PRODUCT_CODE } from "../lib/pro-products.ts";
import { entitlementServesState, stateProCovers } from "../lib/state-pro.ts";
import type { EntitlementRow } from "../lib/store/types.ts";

const now = new Date("2026-11-18T00:00:00Z");
const at = now.toISOString();
const repo = createMemoryCommerceRepo();
await repo.putUser({ id: "member", createdAt: at, emailVerifiedAt: at });
await repo.putUser({ id: "referrer", createdAt: "2026-11-17T00:00:00Z", emailVerifiedAt: at });
await repo.insertRelationship({ id: "relationship", referredUserId: "member", referrerUserId: "referrer", referralCode: "REFERRER", createdAt: at, discountStatus: "available", discountRedeemedAt: null, discountRedeemedOrderId: null });
const quote = (productCode?: string, applyCredit = false, userId = "member") =>
  createQuote(repo, { userId, productCode, applyCredit, policyAccepted: true, now });
const makeQuote = async (productCode?: string, userId?: string) => {
  const result = await quote(productCode, false, userId);
  assert.ok(result.ok);
  return result.quote;
};
const timed = await makeQuote();
const secondTimed = await makeQuote();
const referrerQuote = await makeQuote(undefined, "referrer");
const lifetime = await makeQuote(LIFETIME_PRO_PRODUCT_CODE);
const secondLifetime = await makeQuote(LIFETIME_PRO_PRODUCT_CODE);
assert.equal(lifetime.finalPriceCents, 2999);
assert.equal(lifetime.currency, "USD");
assert.equal(lifetime.policyVersion, LIFETIME_POLICY_VERSION);
assert.equal(lifetime.refundPolicyVersion, LIFETIME_POLICY_VERSION);
assert.equal(lifetime.newcomerDiscountApplied, false);
assert.equal(lifetime.referralDiscountApplied, false);
assert.equal(lifetime.referralRelationshipId, null);
assert.equal(lifetime.creditCents, 0);
assert.equal(lifetime.creditId, null);
assert.deepEqual(await quote(LIFETIME_PRO_PRODUCT_CODE, true), { ok: false, error: "credit_unavailable" });
assert.deepEqual(await assertQuoteStillValid(repo, { ...lifetime, refundPolicyVersion: "other" }, now), { ok: false, error: "PRICE_CHANGED" });

const claim = (row: typeof lifetime, atOverride = at) => repo.claimCheckoutBinding({
  quoteId: row.id, provider: "paddle", expiresAt: row.expiresAt, now: atOverride,
});
const [firstClaim, secondClaim] = await Promise.all([claim(lifetime), claim(secondLifetime)]);
assert.equal(firstClaim.created, true);
assert.deepEqual(secondClaim, { created: false, error: "lifetime_checkout_in_progress", quoteId: lifetime.id });
assert.deepEqual(await claim(secondLifetime, "2026-11-19T00:00:00Z"), secondClaim);
await repo.completeCheckoutBinding({ quoteId: lifetime.id, providerCheckoutId: "txn_lifetime", checkoutUrl: "paddle-overlay:txn_lifetime" });
assert.deepEqual(await claim(secondLifetime), secondClaim);
assert.equal((await claim(timed)).created, true);
assert.equal((await claim(referrerQuote)).created, true);

const rows: EntitlementRow[] = [];
const grantPro = async (opts: { userId: string; provider: string; providerOrderId: string; productCode: string }) => {
  let row = rows.find(entry => entry.providerOrderId === opts.providerOrderId);
  if (!row) {
    row = { ...opts, id: opts.providerOrderId, state: "ALL", status: "active", startsAt: at,
      expiresAt: opts.productCode === LIFETIME_PRO_PRODUCT_CODE ? null : "2027-01-17T00:00:00Z",
      providerCustomerId: null, createdAt: at, updatedAt: at };
    rows.push(row);
  }
  return { entitlement: row };
};
const settle = (row: typeof lifetime, providerOrderId: string) => confirmPaidOrder(repo, {
  userId: row.userId, quoteId: row.id, provider: "paddle", providerOrderId, grantPro, now, boundFulfillment: true,
});
assert.ok((await settle(referrerQuote, "txn_referrer")).ok);
assert.ok((await settle(timed, "txn_60d")).ok);
assert.ok((await quote(LIFETIME_PRO_PRODUCT_CODE)).ok);

const concurrent = await Promise.all([settle(lifetime, "txn_lifetime"), settle(lifetime, "txn_lifetime"), settle(lifetime, "txn_lifetime")]);
assert.ok(concurrent.every(result => result.ok));
const order = await repo.getOrderByProvider("paddle", "txn_lifetime");
assert.ok(order);
assert.ok(concurrent.every(result => result.ok && result.order.id === order.id));
assert.equal((await repo.getQuote(lifetime.id))?.status, "consumed");
const memberRows = () => rows.filter(row => row.userId === "member");
const lifetimeRow = memberRows().find(row => row.id === order.entitlementId);
assert.ok(lifetimeRow);
assert.equal(lifetimeRow.expiresAt, null);
assert.equal(hasLifetimePro(memberRows(), now), true);
assert.equal(accountProExpiry(memberRows(), now), null);
assert.equal(accountProCovers(memberRows(), new Date("2100-01-01")), true);
for (const state of ["AZ", "CA", "CT", "IN", "NY", "TX", "FUTURE"]) {
  assert.equal(stateProCovers(memberRows(), state, now), true);
  assert.equal(entitlementServesState(lifetimeRow, state), true);
}
assert.deepEqual(currentlyServingEntitlements(memberRows(), now).map(row => row.id), [lifetimeRow.id]);
assert.equal((await repo.listRewardsForReferrer("referrer")).length, 1);
assert.equal(await repo.getRewardByOrder(order.id), null);
for (const product of [undefined, LIFETIME_PRO_PRODUCT_CODE]) {
  assert.deepEqual(await quote(product), { ok: false, error: "lifetime_already_owned" });
}
assert.deepEqual(await assertQuoteStillValid(repo, secondTimed, now), { ok: false, error: "lifetime_already_owned" });
assert.deepEqual(await claim(secondLifetime), { created: false, error: "lifetime_already_owned" });
assert.equal((await settle(secondTimed, "txn_60d_preexisting")).ok, true);
assert.equal((await settle(lifetime, "txn_lifetime")).ok, true);
assert.deepEqual((await refundEligibility(repo, { userId: "member", orderId: order.id, now })).eligible, false);
await repo.rememberProviderRefund("paddle", "txn_lifetime");
await repo.rememberProviderRefund("paddle", "txn_lifetime");
const restoredRepo = createMemoryCommerceRepo(repo.snapshot());
assert.equal(await restoredRepo.hasProviderRefund("paddle", "txn_lifetime"), true);
assert.equal(await restoredRepo.hasProviderRefund("mock", "txn_lifetime"), false);
const refund = await completeNonRestoringRefund(repo, { userId: "member", orderId: order.id, reason: "provider_initiated", now,
  refundEntitlement: async ({ providerOrderId }) => {
    const row = memberRows().find(entry => entry.providerOrderId === providerOrderId);
    assert.ok(row);
    row.status = "refunded";
  },
});
assert.ok(refund.ok);
assert.equal(hasLifetimePro(memberRows(), now), false);
assert.ok(accountProExpiry(memberRows(), now));
assert.ok((await quote(LIFETIME_PRO_PRODUCT_CODE)).ok);
assert.equal((await claim(secondLifetime)).created, true);
await repo.releaseCheckoutClaim(secondLifetime.id);

await repo.putUser({ id: "new-member", createdAt: at, emailVerifiedAt: at });
await repo.insertRelationship({ id: "new-relationship", referredUserId: "new-member", referrerUserId: "referrer", referralCode: "REFERRER", createdAt: at, discountStatus: "available", discountRedeemedAt: null, discountRedeemedOrderId: null });
const initialLifetime = await makeQuote(LIFETIME_PRO_PRODUCT_CODE, "new-member");
assert.equal((await claim(initialLifetime)).created, true);
const oldInsertOrder = repo.insertOrder;
repo.insertOrder = async () => { throw new Error("simulated order-write failure"); };
await assert.rejects(() => settle(initialLifetime, "txn_retried_lifetime"), /simulated order-write failure/);
assert.ok(rows.some(row => row.id === "txn_retried_lifetime"));
repo.insertOrder = oldInsertOrder;
const recovered = await settle(initialLifetime, "txn_retried_lifetime");
assert.ok(recovered.ok);
assert.equal(rows.filter(row => row.id === "txn_retried_lifetime").length, 1);
assert.equal(await repo.getRewardByOrder(recovered.order.id), null);
assert.equal((await repo.getRelationshipByReferred("new-member"))?.discountStatus, "available");
assert.equal(await repo.hasPromotionRedemption("new-member", "newcomer"), false);
assert.equal(await repo.hasPromotionRedemption("new-member", "referral_discount"), false);

console.log("Lifetime commerce domain passed.");
