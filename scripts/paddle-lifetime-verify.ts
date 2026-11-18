import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { createQuote } from "../lib/commerce/service.ts";
import { ensurePaddleCheckout } from "../lib/billing/paddle-checkout.ts";
import { buildPaddleTransactionPayload, createPaddleSdk, getPaddleWebhookConfig, lifetimeCheckoutConfigured, type PaddleConfig, type PaddleTransactionsClient } from "../lib/billing/paddle.ts";
import { handlePaddleWebhook, type PaddleWebhookEventLike } from "../lib/billing/paddle-webhook.ts";
import { LIFETIME_POLICY_VERSION } from "../lib/pricing/lifetime.ts";

const productCode = "all_state_pro_lifetime";
const productId = "pro_01testlifetime000000000000";
const priceId = "pri_01testlifetime000000000000";
const providerTxn = "txn_lifetime_verify";
const config: PaddleConfig = {
  apiKey: "test-key", webhookSecret: "test-secret", environment: "sandbox",
  productId: "pro_existing_timed", lifetimeProductId: productId, lifetimePriceId: priceId,
};
const env = {
  PADDLE_API_KEY: "test", PADDLE_WEBHOOK_SECRET: "test", PADDLE_ENVIRONMENT: "sandbox",
  PADDLE_PRODUCT_ID: config.productId, PADDLE_LIFETIME_PRICE_ID: priceId, PADDLE_LIFETIME_PRODUCT_ID: productId,
};
const payload = buildPaddleTransactionPayload({
  productId, priceId, finalPriceCents: 2999, userId: "fixture",
  quoteId: "fixture-quote", productCode,
});
assert.deepEqual(payload.items, [{ priceId, quantity: 1 }]);
const parsed = getPaddleWebhookConfig(env);
assert.ok(parsed.ok);
assert.equal(parsed.config.lifetimePriceId, priceId);
const missing = getPaddleWebhookConfig({ ...env, PADDLE_LIFETIME_PRODUCT_ID: undefined });
assert.ok(missing.ok && !missing.config.lifetimePriceId);
const readyEnv = {
  ...env, MOR_PROVIDER: "paddle", LIFETIME_REFUND_POLICY_VERSION: LIFETIME_POLICY_VERSION,
  LIFETIME_CHECKOUT_ENABLED: "1",
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: "test_fixture", NEXT_PUBLIC_PADDLE_ENV: "sandbox",
};
assert.equal(lifetimeCheckoutConfigured(readyEnv), true);
assert.equal(lifetimeCheckoutConfigured({ ...readyEnv, LIFETIME_CHECKOUT_ENABLED: undefined }), false);
assert.equal(lifetimeCheckoutConfigured({ ...readyEnv, VERCEL_ENV: "production" }), false);
assert.equal(lifetimeCheckoutConfigured({ ...readyEnv, PADDLE_LIFETIME_PRICE_ID: "" }), false);
assert.equal(lifetimeCheckoutConfigured({ ...readyEnv, LIFETIME_REFUND_POLICY_VERSION: "old" }), false);
assert.equal(lifetimeCheckoutConfigured({ ...readyEnv, NEXT_PUBLIC_PADDLE_ENV: "production" }), false);

const repo = createMemoryCommerceRepo();
const now = new Date();
await repo.putUser({ id: "fixture", createdAt: now.toISOString(), emailVerifiedAt: now.toISOString() });
const quoteResult = await createQuote(repo, { userId: "fixture", applyCredit: false, policyAccepted: true, productCode, now });
assert.ok(quoteResult.ok);
const { quote } = quoteResult;
assert.equal(quote.finalPriceCents, 2999);
assert.equal(quote.policyVersion, LIFETIME_POLICY_VERSION);
assert.equal(quote.creditCents, 0);
assert.equal(quote.newcomerDiscountApplied, false);
let price = { id: priceId, productId, status: "active", type: "standard", billingCycle: null, trialPeriod: null, unitPrice: { amount: "2999", currencyCode: "USD" }, unitPriceOverrides: [] };
let creates = 0;
const sdk: PaddleTransactionsClient = {
  prices: { get: async () => price },
  transactions: {
    create: async request => {
      creates++;
      assert.deepEqual(request.items, [{ priceId, quantity: 1 }]);
      assert.equal(request.customData?.user_id, quote.userId);
      assert.equal(request.customData?.quote_id, quote.id);
      return {
        id: providerTxn, checkout: { url: "https://example.test/pay" },
        status: "draft", currencyCode: "USD", customData: request.customData,
        items: [{ quantity: 1, price: { id: priceId, productId, billingCycle: null, unitPrice: { amount: "2999", currencyCode: "USD" } } }],
      };
    },
  },
};
price = { ...price, unitPrice: { amount: "2998", currencyCode: "USD" } };
const opts = { repo, quote, config, now, sdk };
const mismatch = await ensurePaddleCheckout(opts);
assert.ok(!mismatch.ok && mismatch.error === "LIFETIME_PRODUCT_UNAVAILABLE");
assert.equal(creates, 0);
price = { ...price, unitPrice: { amount: "2999", currencyCode: "USD" } };
const opened = await ensurePaddleCheckout(opts);
assert.ok(opened.ok);
assert.equal(opened.transactionId, providerTxn);
assert.equal(creates, 1);

const rejectedRepo = createMemoryCommerceRepo();
await rejectedRepo.putUser({ id: "price-drift", createdAt: now.toISOString(), emailVerifiedAt: now.toISOString() });
const rejectedQuote = await createQuote(rejectedRepo, {
  userId: "price-drift", applyCredit: false, policyAccepted: true, productCode, now,
});
assert.ok(rejectedQuote.ok);
let invalidCreates = 0;
const wrongSubtotal = {
  id: "txn_lifetime_wrong_subtotal", status: "draft", currencyCode: "USD",
  customData: { user_id: "price-drift", quote_id: rejectedQuote.quote.id, product_code: productCode },
  items: [{ quantity: 1, price: { id: priceId, productId, billingCycle: null, unitPrice: { amount: "2999", currencyCode: "USD" } } }],
  details: { lineItems: [{ priceId, quantity: 1, product: { id: productId }, totals: { subtotal: "3999" } }] },
};
const rejectedSdk: PaddleTransactionsClient = {
  prices: sdk.prices,
  transactions: {
    create: async () => { invalidCreates++; return wrongSubtotal; },
    get: async () => wrongSubtotal,
  },
};
const wrong = await ensurePaddleCheckout({ repo: rejectedRepo, quote: rejectedQuote.quote, config, now, sdk: rejectedSdk });
assert.ok(!wrong.ok, "The fresh provider transaction with an unexpected subtotal must never open");
assert.equal((await rejectedRepo.getCheckoutBinding(rejectedQuote.quote.id))?.status, "creating");
assert.equal((await rejectedRepo.getCheckoutBinding(rejectedQuote.quote.id))?.providerCheckoutId, wrongSubtotal.id);
const later = new Date(now.getTime() + 61_000);
const retryResult = await createQuote(rejectedRepo, {
  userId: "price-drift", applyCredit: false, policyAccepted: true, productCode, now: later,
});
assert.ok(retryResult.ok);
const retryWrong = await ensurePaddleCheckout({
  repo: rejectedRepo, quote: retryResult.quote, config, now: later, sdk: rejectedSdk,
});
assert.ok(!retryWrong.ok, "A mismatched provider transaction must fence replacement until it is canceled");
assert.equal(invalidCreates, 1);

rejectedSdk.transactions.get = async () => ({ ...wrongSubtotal, status: "canceled" });
rejectedSdk.transactions.create = async request => ({
  ...wrongSubtotal, id: "txn_lifetime_replacement", customData: request.customData, details: null,
});
const resumedAfterCancellation = await ensurePaddleCheckout({
  repo: rejectedRepo, quote: retryResult.quote, config, now: later, sdk: rejectedSdk,
});
assert.ok(resumedAfterCancellation.ok);
assert.equal(resumedAfterCancellation.transactionId, "txn_lifetime_replacement");

const staleRepo = createMemoryCommerceRepo();
const claimTime = new Date(now.getTime() - 24 * 60 * 60_000);
await staleRepo.putUser({ id: "stale", createdAt: claimTime.toISOString(), emailVerifiedAt: claimTime.toISOString() });
const beforeTimeout = await createQuote(staleRepo, {
  userId: "stale", applyCredit: false, policyAccepted: true, productCode, now: claimTime,
});
const afterTimeout = await createQuote(staleRepo, {
  userId: "stale", applyCredit: false, policyAccepted: true, productCode, now,
});
assert.ok(beforeTimeout.ok && afterTimeout.ok);
const oldQuote = beforeTimeout.quote;
const oldClaim = { quoteId: oldQuote.id, provider: "paddle", expiresAt: oldQuote.expiresAt, now: claimTime.toISOString() };
assert.ok((await staleRepo.claimCheckoutBinding(oldClaim)).created);
const staleSdk: PaddleTransactionsClient = {
  prices: sdk.prices,
  transactions: {
    create: async request => ({
      ...wrongSubtotal, id: "txn_lifetime_after_timeout", customData: request.customData, details: null,
    }),
    list: async query => {
      const windowEnd = Date.parse(query?.["createdAt[LTE]"] || "");
      assert.ok(windowEnd < now.getTime() - 60_000, "Recovery must query the claim's creation window");
      return [];
    },
  },
};
const afterStale = await ensurePaddleCheckout({ repo: staleRepo, quote: afterTimeout.quote, now, config, sdk: staleSdk });
assert.ok(afterStale.ok);

const fenceRepo = createMemoryCommerceRepo();
assert.ok((await fenceRepo.claimCheckoutBinding(oldClaim)).created);
assert.equal(await fenceRepo.releaseCheckoutClaim(oldQuote.id, oldClaim.now), true);
const newClaim = { ...oldClaim, now: later.toISOString() };
assert.ok((await fenceRepo.claimCheckoutBinding(newClaim)).created);
assert.equal(await fenceRepo.releaseCheckoutClaim(oldQuote.id, oldClaim.now), false);
assert.equal(await fenceRepo.completeCheckoutBinding({
  quoteId: oldQuote.id, providerCheckoutId: "txn_lifetime_late_old", checkoutUrl: "paddle-overlay:txn_lifetime_late_old",
  expectedCreatedAt: oldClaim.now,
}), null);
assert.equal((await fenceRepo.getCheckoutBinding(oldQuote.id))?.createdAt, newClaim.now);

const grants = new Set<string>();
let revokes = 0;
const paid: PaddleWebhookEventLike = {
  eventType: "transaction.completed",
  data: {
    id: providerTxn, status: "completed", currencyCode: "USD",
    customData: { user_id: quote.userId, quote_id: quote.id, product_code: productCode },
    items: [{ quantity: 1, price: { id: priceId, productId, billingCycle: null, unitPrice: { amount: "2999", currencyCode: "USD" } } }],
    details: { lineItems: [{ priceId, quantity: 1, product: { id: productId } }] },
  },
};
const event = (value: PaddleWebhookEventLike) => handlePaddleWebhook({
  repo, config, event: value,
  grantPro: async grant => {
    assert.equal(grant.productCode, productCode);
    // The production store uses a unique (provider, provider order) entitlement.
    grants.add(grant.providerOrderId);
    return { entitlement: { id: "lifetime-entitlement" } };
  },
  refundEntitlement: async () => { ++revokes; },
});
const wrongPrice = structuredClone(paid);
wrongPrice.data!.items![0].price!.id = "pri_wrong";
assert.equal((await event(wrongPrice)).body.error, "price_id_mismatch");
const wrongQty = structuredClone(paid);
wrongQty.data!.items![0].quantity = 2;
assert.equal((await event(wrongQty)).body.error, "quantity_mismatch");
const wrongCurrency = structuredClone(paid);
wrongCurrency.data!.currencyCode = "EUR";
assert.equal((await event(wrongCurrency)).body.error, "currency_mismatch");
const wrongAccount = structuredClone(paid);
wrongAccount.data!.customData!.user_id = "different-user";
assert.equal((await event(wrongAccount)).body.error, "user_mismatch");
const waiting = structuredClone(paid);
waiting.data!.status = "paid";
assert.equal((await event(waiting)).body.ignored, true);
assert.equal(grants.size, 0);
sdk.transactions.get = async () => waiting.data!;
const resumed = await ensurePaddleCheckout(opts);
assert.ok(resumed.ok && resumed.paymentPending && resumed.transactionId === providerTxn);
assert.equal(creates, 1);
const raw = JSON.stringify({
  event_type: "transaction.completed", notification_id: "ntf_fixture", event_id: "evt_fixture", occurred_at: now.toISOString(),
  data: {
    id: providerTxn, status: "completed", currency_code: "USD", custom_data: paid.data!.customData,
    items: [{ quantity: 1, price: {
      id: priceId, product_id: productId, billing_cycle: null, quantity: { minimum: 1, maximum: 1 },
      unit_price: { amount: "2999", currency_code: "USD" },
    } }],
    payments: [],
    details: { tax_rates_used: [], line_items: [{ price_id: priceId, quantity: 1, product: { id: productId } }], totals: { total: "3249", tax: "250" } },
  },
});
const timestamp = String(Math.floor(Date.now() / 1000));
const signature = "ts=" + timestamp + ";h1=" + createHmac("sha256", config.webhookSecret).update(timestamp + ":" + raw).digest("hex");
const hooks = createPaddleSdk(config).webhooks;
await assert.rejects(() => hooks.unmarshal(raw, "invalid-secret", signature));
const signed = await hooks.unmarshal(raw, config.webhookSecret, signature) as PaddleWebhookEventLike;
for (const result of await Promise.all([event(signed), event(paid), event(paid)])) assert.equal(result.status, 200);
assert.equal(grants.size, 1);
assert.equal((await repo.listOrders("fixture")).length, 1);
const adjustment: PaddleWebhookEventLike = {
  eventType: "adjustment.updated",
  data: { id: "adj_guarantee", transactionId: providerTxn, action: "refund", status: "approved", type: "partial", currencyCode: "USD", totals: { subtotal: "1000" } },
};
assert.equal((await event(adjustment)).status, 200);
assert.equal((await repo.getOrderByProvider("paddle", providerTxn))?.status, "paid");
assert.equal(revokes, 0);
adjustment.data = { ...adjustment.data, id: "adj_full", type: "full", totals: { subtotal: "2999" } };
assert.equal((await event(adjustment)).status, 200);
assert.equal((await event(adjustment)).status, 200);
assert.equal((await repo.getOrderByProvider("paddle", providerTxn))?.status, "refunded");
assert.equal(revokes, 1);

async function secondPayment(txnId: string) {
  const result = await createQuote(repo, { userId: "fixture", applyCredit: false, policyAccepted: true, productCode });
  assert.ok(result.ok);
  const next = result.quote;
  assert.ok((await repo.claimCheckoutBinding({
    quoteId: next.id, provider: "paddle", expiresAt: next.expiresAt, now: next.createdAt,
  })).created);
  await repo.completeCheckoutBinding({ quoteId: next.id, providerCheckoutId: txnId, checkoutUrl: `paddle-overlay:${txnId}` });
  const callback = structuredClone(paid);
  callback.data!.id = txnId;
  callback.data!.customData!.quote_id = next.id;
  return callback;
}

const earlyTxn = "txn_lifetime_early";
const earlyPayment = await secondPayment(earlyTxn);
const early = { ...adjustment, data: { ...adjustment.data, transactionId: earlyTxn } };
assert.equal((await event(early)).body.refundPending, true);
assert.equal((await event(earlyPayment)).body.refunded, true);
assert.equal((await repo.getOrderByProvider("paddle", earlyTxn))?.status, "refunded");
assert.equal((await repo.getOrderByProvider("paddle", earlyTxn))?.entitlementId, null);
assert.equal(grants.has(earlyTxn), false);
assert.equal(revokes, 1);

const earlyDisputedTxn = "txn_lifetime_early_dispute";
const earlyDisputed = await secondPayment(earlyDisputedTxn);
assert.equal((await event({
  eventType: "adjustment.created",
  data: { ...early.data, transactionId: earlyDisputedTxn, action: "chargeback" },
})).body.refundPending, true);
assert.equal((await event(earlyDisputed)).body.refunded, true);
assert.equal((await repo.getOrderByProvider("paddle", earlyDisputedTxn))?.refundReason, "chargeback");
assert.equal(grants.has(earlyDisputedTxn), false);

const disputedTxn = "txn_lifetime_disputed";
assert.equal((await event(await secondPayment(disputedTxn))).status, 200);
const chargeback: PaddleWebhookEventLike = {
  eventType: "adjustment.created", data: {
    id: "adj_chargeback", transactionId: disputedTxn, action: "chargeback", status: "approved", type: "full",
  },
};
assert.equal((await event(chargeback)).status, 200);
assert.equal((await repo.getOrderByProvider("paddle", disputedTxn))?.refundReason, "chargeback");
chargeback.data!.action = "chargeback_reverse";
assert.equal((await event(chargeback)).body.manualReview, true);
assert.equal((await repo.getOrderByProvider("paddle", disputedTxn))?.status, "refunded");

const fullLineTxn = "txn_lifetime_full_line";
assert.equal((await event(await secondPayment(fullLineTxn))).status, 200);
assert.equal((await event({
  eventType: "adjustment.updated",
  data: { ...adjustment.data, transactionId: fullLineTxn, type: "partial", items: [{ type: "full" }] },
})).body.refunded, true);
assert.equal((await repo.getOrderByProvider("paddle", fullLineTxn))?.status, "refunded");
console.log("Lifetime Paddle: catalog price, signed completed event, payment pending, idempotence, partial/full/early refund, and chargeback");
