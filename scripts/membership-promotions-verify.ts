import assert from "node:assert/strict";
import { ensurePaddleCheckout } from "../lib/billing/paddle-checkout.ts";
import type { PaddleTransactionsClient } from "../lib/billing/paddle.ts";
import type { PricingQuoteRow } from "../lib/commerce/types.ts";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { calculatePrice } from "../lib/pricing/engine.ts";
import { createQuote, confirmPaidOrder, eligibilitySnapshot, isNewcomerEligible, completeEligibleUnusedRefund } from "../lib/commerce/service.ts";

const now = new Date("2026-11-18T10:00:00Z");
const eligibility = { newcomerEligible: true, newcomerExpiresAt: null, referralDiscountEligible: true, applyCredit: false, availableCreditCount: 0 };
assert.equal(calculatePrice(eligibility).finalPriceCents, 1799);
const futurePlan = { listPriceCents: 2999, standardPriceCents: 2999, protectedGuaranteeCents: 1000 };
assert.equal(calculatePrice({ ...eligibility, referralDiscountEligible: false }, futurePlan).finalPriceCents, 2799);
assert.equal(calculatePrice(eligibility, futurePlan).finalPriceCents, 2619);
assert.ok(calculatePrice({ ...eligibility, applyCredit: true, availableCreditCount: 99 }, { listPriceCents: 1299, standardPriceCents: 1299, protectedGuaranteeCents: 1000 }).finalPriceCents >= 1000);
assert.throws(() => calculatePrice(eligibility, { standardPriceCents: 2999, listPriceCents: 2999, protectedGuaranteeCents: 3000 }));
for (const verified of [null, "invalid", new Date(now.getTime() + 1).toISOString()]) assert.equal(isNewcomerEligible({ emailVerifiedAt: verified, now, redeemed: false }), false);
assert.equal(isNewcomerEligible({ emailVerifiedAt: now.toISOString(), now, redeemed: false }), true);
const start = new Date(now.getTime() - 72 * 3600000);
assert.equal(isNewcomerEligible({ emailVerifiedAt: start.toISOString(), now, redeemed: false }), false);
assert.equal(isNewcomerEligible({ emailVerifiedAt: new Date(start.getTime() + 1).toISOString(), now, redeemed: false }), true);

const repo = createMemoryCommerceRepo();
await repo.putUser({ id: "member", createdAt: start.toISOString(), emailVerifiedAt: now.toISOString() });
await repo.insertRelationship({ id: "ref", referredUserId: "member", referrerUserId: "older", referralCode: "AZ-OLD123", createdAt: start.toISOString(), discountStatus: "available", discountRedeemedAt: null, discountRedeemedOrderId: null });
const quote = async (productCode = "az_exam_pro_60d") => {
  const result = await createQuote(repo, { userId: "member", productCode, applyCredit: false, policyAccepted: true, now });
  assert.equal(result.ok, true);
  return result.quote;
};
for (const code of ["az_exam_pro_60d", "ca_exam_pro_60d", "hi_exam_pro_60d", "in_exam_pro_60d", "nc_exam_pro_60d"]) {
  assert.equal((await quote(code)).finalPriceCents, 1799);
}
assert.equal((await eligibilitySnapshot(repo, "member", now)).newcomerEligible, true);
assert.equal((await eligibilitySnapshot(repo, "member", now)).referralDiscountEligible, true);
const first = await quote();
const second = await quote("ca_exam_pro_60d");
const claim = (row: PricingQuoteRow) => repo.claimCheckoutBinding({ quoteId: row.id, provider: "paddle", expiresAt: row.expiresAt, now: now.toISOString() });
const claims = await Promise.all([claim(first), claim(second)]);
assert.equal(claims.filter(result => result.created).length, 1);
assert.equal(claims.filter(result => "error" in result && result.error === "promotion_checkout_in_progress").length, 1);
assert.equal((await eligibilitySnapshot(repo, "member", now)).newcomerEligible, true);
await repo.releaseCheckoutClaim(first.id);
await repo.releaseCheckoutClaim(second.id);
let failed = false;
try {
  await confirmPaidOrder(repo, { userId: "member", quoteId: (await quote()).id, provider: "mock", providerOrderId: "failed-order", now, grantPro: async () => { throw new Error("failed payment grant"); } });
} catch { failed = true; }
assert.equal(failed, true);
assert.equal((await eligibilitySnapshot(repo, "member", now)).newcomerEligible, true);
const paidQuote = await quote("nc_exam_pro_60d");
const paid = await confirmPaidOrder(repo, { userId: "member", quoteId: paidQuote.id, provider: "mock", providerOrderId: "paid-order", now, grantPro: async () => ({ entitlement: { id: "entitlement" } }) });
assert.equal(paid.ok, true);
assert.equal((await eligibilitySnapshot(repo, "member", now)).newcomerEligible, false);
assert.equal((await quote()).finalPriceCents, 2221);
await completeEligibleUnusedRefund(repo, { userId: "member", orderId: paid.order.id, now, refundEntitlement: async () => {} });
assert.equal((await eligibilitySnapshot(repo, "member", now)).newcomerEligible, false);
assert.equal((await eligibilitySnapshot(repo, "member", now)).referralDiscountEligible, false);
assert.equal((await quote("in_exam_pro_60d")).finalPriceCents, 2221);
// Successful order flags close the crash window before redemption bookkeeping completes.
repo.snapshot().redemptions.length = 0;
repo.snapshot().relationships[0].discountStatus = "available";
assert.equal((await eligibilitySnapshot(repo, "member", now)).newcomerEligible, false);
assert.equal((await eligibilitySnapshot(repo, "member", now)).referralDiscountEligible, false);
const staleClaim = await claim(second);
assert.equal("error" in staleClaim && staleClaim.error, "PRICE_CHANGED");

// Two unbound payment attempts share the same account claim before granting access.
const concurrentRepo = createMemoryCommerceRepo();
await concurrentRepo.putUser({ id: "race", createdAt: now.toISOString(), emailVerifiedAt: now.toISOString() });
const raceQuotes = await Promise.all([0, 1].map(async () => {
  const result = await createQuote(concurrentRepo, { userId: "race", applyCredit: false, policyAccepted: true, now });
  assert.equal(result.ok, true);
  return result.quote;
}));
let grants = 0;
const race = await Promise.all(raceQuotes.map((row, index) => confirmPaidOrder(concurrentRepo, { userId: "race", quoteId: row.id, provider: "mock", providerOrderId: `race-${index}`, now, grantPro: async () => { grants++; return { entitlement: { id: "one" } }; } })));
assert.equal(race.filter(result => result.ok).length, 1);
assert.equal(grants, 1);
// A fresh button click resumes the older checkout rather than trapping the account.
const recoveryRepo = createMemoryCommerceRepo();
await recoveryRepo.putUser({ id: "retry", createdAt: now.toISOString(), emailVerifiedAt: now.toISOString() });
const recoveryQuote = async () => {
  const result = await createQuote(recoveryRepo, { userId: "retry", applyCredit: false, policyAccepted: true, now });
  assert.equal(result.ok, true);
  return result.quote;
};
const oldQuote = await recoveryQuote();
const retryQuote = await recoveryQuote();
let transactionsCreated = 0;
let providerStatus = "ready";
const sdk: PaddleTransactionsClient = { transactions: {
  create: async () => ({ id: `txn_retry${++transactionsCreated}` }),
  get: async id => ({ id, status: providerStatus }),
  list: async () => [],
} };
const config = { apiKey: "fixture", productId: "pro_fixture", environment: "sandbox" as const };
const checkout = (row: PricingQuoteRow) => ensurePaddleCheckout({ repo: recoveryRepo, quote: row, config, now, sdk });
const oldCheckout = await checkout(oldQuote);
assert.equal(oldCheckout.ok, true);
const resumed = await checkout(retryQuote);
assert.equal(resumed.ok, true);
if (resumed.ok) assert.equal(resumed.quoteId, oldQuote.id);
assert.equal(transactionsCreated, 1);
providerStatus = "completed";
assert.equal((await checkout(retryQuote)).ok, true);
assert.equal(transactionsCreated, 1, "A late completed checkout cannot create a duplicate charge");
providerStatus = "canceled";
const replacement = await checkout(retryQuote);
assert.equal(replacement.ok, true);
if (replacement.ok) assert.equal(replacement.quoteId, retryQuote.id);
assert.equal(transactionsCreated, 2);
assert.equal((await recoveryRepo.getQuote(oldQuote.id))?.status, "expired");
// An old creating binding is cleared only after a provider lookup confirms no transaction.
await recoveryRepo.clearCanceledCheckout(retryQuote.id, "txn_retry2");
await recoveryRepo.claimCheckoutBinding({ quoteId: retryQuote.id, provider: "paddle", expiresAt: retryQuote.expiresAt, now: new Date(now.getTime() - 120000).toISOString() });
providerStatus = "ready";
const afterLostResponse = await checkout(await recoveryQuote());
assert.equal(afterLostResponse.ok, true);
assert.equal(transactionsCreated, 3);
console.log("membership-promotions-verify passed: all existing plans, protected guarantee, exact 72h boundaries, failed grant, global once-only use, refunds, crash recovery and concurrent claims");
