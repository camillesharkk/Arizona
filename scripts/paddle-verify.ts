/**
 * Paddle Billing Sandbox checkout + webhook gate.
 * Run: npm run paddle:verify
 * In-memory only. Mock Paddle Transactions API. No live Paddle network. No production DB.
 */
import { randomUUID } from "crypto";
import { createMemoryCommerceRepo, type CommerceRepo } from "../lib/commerce/repo.ts";
import { bindReferral, createQuote } from "../lib/commerce/service.ts";
import type { GrantProFn } from "../lib/commerce/service.ts";
import {
  PADDLE_PRICE_DESCRIPTION,
  PADDLE_PRICE_NAME,
  PADDLE_PROVIDER,
  buildPaddleTransactionPayload,
  getPaddleCheckoutConfig,
  getPaddleConfig,
  getPaddleWebhookConfig,
  isPaddleProvider,
  parsePaddleEnvironment,
  paddleSdkEnvironment,
  paddleUnitAmount,
  shouldGrantAccessFromPaddleCheckoutCompleted,
  type PaddleConfig,
  type PaddleTransactionsClient,
} from "../lib/billing/paddle.ts";
import { ensurePaddleCheckout } from "../lib/billing/paddle-checkout.ts";
import { handlePaddleWebhook, type PaddleWebhookEventLike } from "../lib/billing/paddle-webhook.ts";
import { PADDLE_OVERLAY_SETTINGS, paddleSuccessPath } from "../lib/billing/paddle-public.ts";
import { REFERRAL_CREDIT_CENTS } from "../lib/pricing/catalog.ts";
import { Environment } from "@paddle/paddle-node-sdk";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

const PRODUCT = "pro_01paddleverifyproduct";
const cfg: PaddleConfig = {
  apiKey: "paddle-verify-api-key",
  webhookSecret: "paddle-verify-webhook-secret",
  productId: PRODUCT,
  environment: "sandbox",
};

function hoursAgo(base: Date, hours: number) {
  return new Date(base.getTime() - hours * 3600000);
}

async function putUser(repo: CommerceRepo, id: string, createdAt: Date, emailVerifiedAt: Date | null = createdAt) {
  await repo.putUser({
    id,
    createdAt: createdAt.toISOString(),
    emailVerifiedAt: emailVerifiedAt ? emailVerifiedAt.toISOString() : null,
  });
}

async function addCredit(repo: CommerceRepo, userId: string, now: Date) {
  const id = randomUUID();
  await repo.insertCredit({
    id,
    userId,
    amountCents: REFERRAL_CREDIT_CENTS,
    sourceRewardId: randomUUID(),
    status: "available",
    createdAt: now.toISOString(),
    availableAt: now.toISOString(),
    reservedAt: null,
    reservedQuoteId: null,
    reservedUntil: null,
    redeemedAt: null,
    redeemedOrderId: null,
    reversedAt: null,
    restoredAt: null,
    reversedAfterRedemption: false,
  });
  return id;
}

function grantTracker() {
  const grants: string[] = [];
  const grantPro: GrantProFn = async (opts) => {
    grants.push(`${opts.provider}:${opts.providerOrderId}:${opts.userId}`);
    return { entitlement: { id: randomUUID() } };
  };
  return { grants, grantPro };
}

function mockSdk(counter: { n: number; payloads: unknown[] }): PaddleTransactionsClient {
  return {
    transactions: {
      create: async (payload) => {
        counter.n += 1;
        counter.payloads.push(payload);
        return { id: `txn_verify${counter.n}abcdefgh`, checkout: { url: null } };
      },
    },
  };
}

function completedEvent(opts: {
  transactionId: string;
  userId: string;
  quoteId: string;
  amount: number;
  status?: string;
  eventType?: string;
  notificationId?: string;
  productId?: string;
  quantity?: number;
  discountId?: string | null;
  discount?: string;
  currency?: string;
  productCode?: string;
  billingCycle?: { interval: string; frequency: number } | null;
}): PaddleWebhookEventLike {
  return {
    eventType: opts.eventType ?? "transaction.completed",
    notificationId: opts.notificationId ?? "ntf_verify1",
    eventId: "evt_should_never_be_provider_order",
    data: {
      id: opts.transactionId,
      status: opts.status ?? "completed",
      currencyCode: opts.currency ?? "USD",
      discountId: opts.discountId ?? null,
      customData: {
        user_id: opts.userId,
        quote_id: opts.quoteId,
        product_code: opts.productCode ?? "az_exam_pro_60d",
      },
      items: [
        {
          quantity: opts.quantity ?? 1,
          price: {
            productId: opts.productId ?? PRODUCT,
            unitPrice: { amount: paddleUnitAmount(opts.amount), currencyCode: "USD" },
            billingCycle: opts.billingCycle ?? null,
          },
        },
      ],
      details: {
        totals: { discount: opts.discount ?? "0", subtotal: paddleUnitAmount(opts.amount) },
        lineItems: [
          {
            quantity: opts.quantity ?? 1,
            product: { id: opts.productId ?? PRODUCT },
            totals: { discount: opts.discount ?? "0", subtotal: paddleUnitAmount(opts.amount) },
          },
        ],
      },
    },
  };
}

async function run() {
  if (shouldGrantAccessFromPaddleCheckoutCompleted()) fail("Paddle.js checkout.completed must never grant Pro");
  else ok("checkout.completed cannot grant Pro");

  if (PADDLE_OVERLAY_SETTINGS.displayMode !== "overlay" || PADDLE_OVERLAY_SETTINGS.variant !== "one-page") {
    fail("overlay settings");
  } else ok("overlay is one-page overlay, discounts hidden");
  if (PADDLE_OVERLAY_SETTINGS.showAddDiscounts !== false) fail("showAddDiscounts must be false");
  if (paddleSuccessPath() !== "/dashboard/?checkout=success") fail("success path");
  else ok("success URL path is dashboard checkout=success");

  if (isPaddleProvider({ MOR_PROVIDER: "paddle" }) !== true) fail("isPaddleProvider paddle");
  else ok("MOR_PROVIDER=paddle selects Paddle");
  if (isPaddleProvider({ MOR_PROVIDER: "mock" })) fail("mock should not be paddle");
  else ok("MOR_PROVIDER=mock does not select Paddle");

  const missKey = getPaddleConfig({
    PADDLE_WEBHOOK_SECRET: "s",
    PADDLE_PRODUCT_ID: PRODUCT,
    PADDLE_ENVIRONMENT: "sandbox",
  });
  if (missKey.ok || !missKey.missing.includes("PADDLE_API_KEY")) fail("missing API key should safe-fail");
  else ok("missing API key → safe failure");

  const missEnv = getPaddleConfig({
    PADDLE_API_KEY: "k",
    PADDLE_WEBHOOK_SECRET: "s",
    PADDLE_PRODUCT_ID: PRODUCT,
    NODE_ENV: "production",
  });
  if (missEnv.ok || !missEnv.missing.includes("PADDLE_ENVIRONMENT")) fail("missing PADDLE_ENVIRONMENT must not guess from NODE_ENV");
  else ok("missing PADDLE_ENVIRONMENT → safe failure (no NODE_ENV fallback)");

  const badEnv = parsePaddleEnvironment({ PADDLE_ENVIRONMENT: "live", NODE_ENV: "production" });
  if (badEnv.ok) fail("live is not a valid PADDLE_ENVIRONMENT");
  else ok("invalid PADDLE_ENVIRONMENT=live → safe failure");

  const sandboxCfg = getPaddleConfig({
    PADDLE_API_KEY: "k",
    PADDLE_WEBHOOK_SECRET: "s",
    PADDLE_PRODUCT_ID: PRODUCT,
    PADDLE_ENVIRONMENT: "sandbox",
    NODE_ENV: "production",
  });
  if (!sandboxCfg.ok || sandboxCfg.config.environment !== "sandbox") fail("explicit sandbox ignored");
  else if (paddleSdkEnvironment("sandbox") !== Environment.sandbox) fail("sandbox SDK env");
  else ok("PADDLE_ENVIRONMENT=sandbox → Environment.sandbox (NODE_ENV ignored)");

  const prodCfg = getPaddleConfig({
    PADDLE_API_KEY: "k",
    PADDLE_WEBHOOK_SECRET: "s",
    PADDLE_PRODUCT_ID: PRODUCT,
    PADDLE_ENVIRONMENT: "production",
    NODE_ENV: "development",
  });
  if (!prodCfg.ok || prodCfg.config.environment !== "production") fail("explicit production ignored");
  else if (paddleSdkEnvironment("production") !== Environment.production) fail("production SDK env");
  else ok("PADDLE_ENVIRONMENT=production → Environment.production (NODE_ENV ignored)");

  const badProduct = getPaddleConfig({
    PADDLE_API_KEY: "k",
    PADDLE_WEBHOOK_SECRET: "s",
    PADDLE_PRODUCT_ID: "pri_price_not_allowed",
    PADDLE_ENVIRONMENT: "sandbox",
  });
  if (badProduct.ok) fail("price id must not be accepted as PADDLE_PRODUCT_ID");
  else ok("PADDLE_PRODUCT_ID must be a product id (pro_)");

  const checkoutNoSecret = getPaddleCheckoutConfig({
    PADDLE_ENVIRONMENT: "sandbox",
    PADDLE_API_KEY: "paddle-verify-api-key",
    PADDLE_PRODUCT_ID: "pro_test",
  });
  if (!checkoutNoSecret.ok) fail("checkout config must succeed without PADDLE_WEBHOOK_SECRET");
  else ok("checkout config succeeds without PADDLE_WEBHOOK_SECRET");

  const webhookNoSecret = getPaddleWebhookConfig({
    PADDLE_ENVIRONMENT: "sandbox",
    PADDLE_API_KEY: "paddle-verify-api-key",
    PADDLE_PRODUCT_ID: "pro_test",
  });
  if (webhookNoSecret.ok || !webhookNoSecret.missing.includes("PADDLE_WEBHOOK_SECRET")) {
    fail("webhook config must fail when PADDLE_WEBHOOK_SECRET is missing");
  } else ok("webhook config missing PADDLE_WEBHOOK_SECRET → safe failure");

  const checkoutMissKey = getPaddleCheckoutConfig({
    PADDLE_ENVIRONMENT: "sandbox",
    PADDLE_PRODUCT_ID: "pro_test",
  });
  if (checkoutMissKey.ok || !checkoutMissKey.missing.includes("PADDLE_API_KEY")) fail("checkout missing API key should fail");
  else ok("checkout config missing PADDLE_API_KEY → safe failure");

  const checkoutMissProduct = getPaddleCheckoutConfig({
    PADDLE_ENVIRONMENT: "sandbox",
    PADDLE_API_KEY: "paddle-verify-api-key",
  });
  if (checkoutMissProduct.ok || !checkoutMissProduct.missing.includes("PADDLE_PRODUCT_ID")) fail("checkout missing product id should fail");
  else ok("checkout config missing PADDLE_PRODUCT_ID → safe failure");

  const checkoutMissEnv = getPaddleCheckoutConfig({
    PADDLE_API_KEY: "paddle-verify-api-key",
    PADDLE_PRODUCT_ID: "pro_test",
    NODE_ENV: "production",
  });
  if (checkoutMissEnv.ok || !checkoutMissEnv.missing.includes("PADDLE_ENVIRONMENT")) fail("checkout missing environment should fail");
  else ok("checkout config missing PADDLE_ENVIRONMENT → safe failure");

  const webhookComplete = getPaddleWebhookConfig({
    PADDLE_ENVIRONMENT: "sandbox",
    PADDLE_API_KEY: "paddle-verify-api-key",
    PADDLE_PRODUCT_ID: "pro_test",
    PADDLE_WEBHOOK_SECRET: "paddle-verify-webhook-secret",
  });
  if (!webhookComplete.ok) fail("webhook config with complete fields should succeed");
  else ok("webhook config with complete fields succeeds");

  const now = new Date();
  const repo = createMemoryCommerceRepo();
  const buyer = "buyer-1";
  const referrer = "ref-1";
  await putUser(repo, referrer, hoursAgo(now, 200));
  await putUser(repo, buyer, hoursAgo(now, 2));
  await repo.insertCode({ userId: referrer, code: "AZAAAAAA11", createdAt: hoursAgo(now, 200).toISOString(), disabledAt: null });
  await bindReferral(repo, { referredUserId: buyer, code: "AZAAAAAA11", now });

  function assertPayload(label: string, cents: number, quote: { id: string; userId: string; productCode: string; finalPriceCents: number }) {
    const p = buildPaddleTransactionPayload({
      productId: PRODUCT,
      finalPriceCents: quote.finalPriceCents,
      userId: quote.userId,
      quoteId: quote.id,
      productCode: quote.productCode,
    });
    const item = p.items[0];
    if (!item || !("price" in item) || !item.price || !("productId" in item.price)) {
      fail(`${label} missing non-catalog price`);
      return p;
    }
    if ("priceId" in item && item.priceId) fail(`${label} must not use catalog priceId`);
    if (item.price.unitPrice.amount !== String(cents)) fail(`${label} amount ${item.price.unitPrice.amount} != ${cents}`);
    else ok(`${label} → unitPrice.amount ${cents}`);
    if (item.price.unitPrice.currencyCode !== "USD") fail(`${label} currency`);
    if (item.quantity !== 1) fail(`${label} quantity`);
    if (item.price.billingCycle !== null) fail(`${label} must be one-time (billingCycle null)`);
    if (item.price.productId !== PRODUCT) fail(`${label} productId`);
    if (item.price.name !== PADDLE_PRICE_NAME || item.price.description !== PADDLE_PRICE_DESCRIPTION) fail(`${label} name/description`);
    if (item.price.taxMode !== "account_setting") fail(`${label} taxMode`);
    const custom = p.customData as { user_id?: string; quote_id?: string; product_code?: string };
    if (custom.user_id !== quote.userId || custom.quote_id !== quote.id || custom.product_code !== "az_exam_pro_60d") {
      fail(`${label} customData`);
    } else ok(`${label} customData from server quote`);
    return p;
  }

  const oldRepo = createMemoryCommerceRepo();
  await putUser(oldRepo, "old", hoursAgo(now, 200), hoursAgo(now, 200));
  const oldQuote = await createQuote(oldRepo, { userId: "old", applyCredit: false, policyAccepted: true, now });
  if (!oldQuote.ok || oldQuote.quote.finalPriceCents !== 2221) fail("quote $22.21 setup");
  else assertPayload("quote $22.21", 2221, oldQuote.quote);

  const solo = createMemoryCommerceRepo();
  await putUser(solo, "new1", hoursAgo(now, 1));
  const nq = await createQuote(solo, { userId: "new1", applyCredit: false, policyAccepted: true, now });
  if (!nq.ok || nq.quote.finalPriceCents !== 1999) fail("quote $19.99 setup");
  else assertPayload("quote $19.99", 1999, nq.quote);

  const q1799 = await createQuote(repo, { userId: buyer, applyCredit: false, policyAccepted: true, now });
  if (!q1799.ok || q1799.quote.finalPriceCents !== 1799) fail("newcomer+referral quote $17.99");
  else assertPayload("newcomer + referral $17.99", 1799, q1799.quote);

  await addCredit(repo, buyer, now);
  await addCredit(repo, buyer, now);
  await addCredit(repo, buyer, now);
  const q899 = await createQuote(repo, { userId: buyer, applyCredit: true, policyAccepted: true, now });
  if (!q899.ok || q899.quote.finalPriceCents !== 899) fail("newcomer+referral+3 credits $8.99");
  else assertPayload("newcomer + referral + 3 Credits $8.99", 899, q899.quote);

  if (q899.ok && q899.quote.finalPriceCents === 1999) fail("dynamic quote must not be stuck at $19.99");
  else ok("dynamic quote is not a fixed $19.99 catalog price");

  if (!q899.ok) throw new Error("missing 899 quote");
  const created = { n: 0, payloads: [] as unknown[] };
  const first = await ensurePaddleCheckout({ repo, quote: q899.quote, config: cfg, now, sdk: mockSdk(created) });
  const second = await ensurePaddleCheckout({ repo, quote: q899.quote, config: cfg, now, sdk: mockSdk(created) });
  if (!first.ok || first.finalPriceCents !== 899 || !first.transactionId.startsWith("txn_")) fail("first paddle checkout");
  else ok("dynamic checkout uses quote.finalPriceCents and returns transactionId");
  if (created.n !== 1) fail(`repeat checkout created ${created.n} Paddle transactions`);
  else ok("same quote repeat checkout does not create a second transaction");
  if (!second.ok || !first.ok || second.transactionId !== first.transactionId) fail("second checkout should reuse transactionId");
  else ok("second checkout returns the same transactionId");

  const paidRepo = createMemoryCommerceRepo();
  const tracker = grantTracker();
  await putUser(paidRepo, "pay", hoursAgo(now, 1));
  const payQ = await createQuote(paidRepo, { userId: "pay", applyCredit: false, policyAccepted: true, now });
  if (!payQ.ok) throw new Error("pay quote");
  const txnId = "txn_completedabcdefghijk";
  const paid = await handlePaddleWebhook({
    repo: paidRepo,
    config: cfg,
    grantPro: tracker.grantPro,
    event: completedEvent({
      transactionId: txnId,
      userId: "pay",
      quoteId: payQ.quote.id,
      amount: payQ.quote.finalPriceCents,
    }),
  });
  if (paid.status !== 200 || tracker.grants.length !== 1 || !tracker.grants[0].startsWith(`paddle:${txnId}:pay`)) {
    fail("valid transaction.completed should pay once");
  } else ok("transaction.completed valid → 1 paid order / 1 entitlement");
  if (paid.recordNotificationId !== "ntf_verify1") fail("notification id recorded only after success");
  else ok("notification id is returned after successful grant (not used as providerOrderId)");
  const orders1 = await paidRepo.listOrders("pay");
  if (orders1.length !== 1 || orders1[0].providerOrderId !== txnId) fail("providerOrderId must be transaction id");
  else ok("providerOrderId is Paddle transaction id");

  const dup = await handlePaddleWebhook({
    repo: paidRepo,
    config: cfg,
    grantPro: tracker.grantPro,
    event: completedEvent({
      transactionId: txnId,
      userId: "pay",
      quoteId: payQ.quote.id,
      amount: payQ.quote.finalPriceCents,
      notificationId: "ntf_retry_other",
    }),
  });
  if (dup.status !== 200 || tracker.grants.length !== 1 || (await paidRepo.listOrders("pay")).length !== 1) {
    fail("duplicate transaction.completed not idempotent");
  } else ok("duplicate transaction.completed → idempotent (no second +60d)");

  const paidEvent = await handlePaddleWebhook({
    repo: paidRepo,
    config: cfg,
    grantPro: tracker.grantPro,
    event: completedEvent({
      transactionId: "txn_paidshouldignorexxxx",
      userId: "pay",
      quoteId: payQ.quote.id,
      amount: payQ.quote.finalPriceCents,
      eventType: "transaction.paid",
      status: "paid",
    }),
  });
  if (paidEvent.status !== 200 || paidEvent.body.ignored !== true || tracker.grants.length !== 1) {
    fail("transaction.paid must not grant");
  } else ok("transaction.paid → ignored, no grant");

  async function rejectCase(label: string, patch: Partial<Parameters<typeof completedEvent>[0]>) {
    const r = createMemoryCommerceRepo();
    const t = grantTracker();
    await putUser(r, "u", hoursAgo(now, 1));
    const q = await createQuote(r, { userId: "u", applyCredit: false, policyAccepted: true, now });
    if (!q.ok) return fail(`${label} quote`);
    const result = await handlePaddleWebhook({
      repo: r,
      config: cfg,
      grantPro: t.grantPro,
      event: completedEvent({
        transactionId: `txn_bad${label.replace(/\W/g, "").slice(0, 12)}xxxx`,
        userId: "u",
        quoteId: q.quote.id,
        amount: q.quote.finalPriceCents,
        ...patch,
      }),
    });
    if (result.status === 200 && !result.body.ignored && t.grants.length) fail(`${label} unexpectedly granted`);
    else if (t.grants.length) fail(`${label} granted`);
    else ok(`${label} rejected`);
  }

  await rejectCase("amount mismatch", { amount: 1 });
  await rejectCase("wrong product", { productId: "pro_01otherproductxxxxx" });
  await rejectCase("wrong quantity", { quantity: 2 });
  await rejectCase("paddle discount", { discountId: "dsc_01abc", discount: "100" });
  await rejectCase("subscription cycle", { billingCycle: { interval: "month", frequency: 1 } });
  await rejectCase("wrong currency", { currency: "EUR" });
  await rejectCase("wrong product code", { productCode: "other" });
  await rejectCase("status paid on completed type", { status: "paid" });

  const mismatch = createMemoryCommerceRepo();
  const mismatchTracker = grantTracker();
  await putUser(mismatch, "owner", hoursAgo(now, 1));
  await putUser(mismatch, "attacker", hoursAgo(now, 1));
  const ownerQ = await createQuote(mismatch, { userId: "owner", applyCredit: false, policyAccepted: true, now });
  if (!ownerQ.ok) fail("owner quote");
  else {
    const stolen = await handlePaddleWebhook({
      repo: mismatch,
      config: cfg,
      grantPro: mismatchTracker.grantPro,
      event: completedEvent({
        transactionId: "txn_stolenuserxxxxxxxx",
        userId: "attacker",
        quoteId: ownerQ.quote.id,
        amount: ownerQ.quote.finalPriceCents,
      }),
    });
    if (stolen.status === 200 && mismatchTracker.grants.length) fail("customData user_id mismatch granted");
    else ok("webhook user_id must match quote.userId; grant uses quote.userId only");
  }

  if (failures) {
    console.error(lines.join("\n"));
    console.error(`paddle:verify failed (${failures})`);
    process.exit(1);
  }
  console.log(lines.join("\n"));
  console.log("paddle:verify passed");
}

await run();
