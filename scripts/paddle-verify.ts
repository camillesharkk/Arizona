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
import type { PaddleTxnSnapshot } from "../lib/billing/paddle.ts";
import { reconcilePaddleCheckoutBinding } from "../lib/billing/paddle-reconcile.ts";
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

function mockSdk(
  counter: { n: number; payloads: unknown[] },
  remote: PaddleTxnSnapshot[] | (() => PaddleTxnSnapshot[]) = []
): PaddleTransactionsClient {
  return {
    transactions: {
      create: async (payload) => {
        counter.n += 1;
        counter.payloads.push(payload);
        return { id: `txn_verify${counter.n}abcdefgh`, checkout: { url: null } };
      },
      list: async function* () {
        const rows = typeof remote === "function" ? remote() : remote;
        for (const row of rows) yield row;
      },
    },
  };
}

function listedTxn(event: PaddleWebhookEventLike): PaddleTxnSnapshot {
  const data = event.data || {};
  return {
    id: data.id,
    status: data.status,
    currencyCode: data.currencyCode,
    discountId: data.discountId ?? null,
    customData: data.customData ?? null,
    items: data.items ?? null,
    details: data.details ?? null,
    checkout: { url: null },
  };
}

function orphanCreating(repo: CommerceRepo, quoteId: string, createdAt: Date) {
  const snap = (repo as { snapshot?: () => { checkoutBindings: Array<Record<string, unknown>> } }).snapshot;
  const row = snap?.().checkoutBindings.find((b) => b.quoteId === quoteId);
  if (!row) throw new Error("missing binding to orphan");
  row.status = "creating";
  row.providerCheckoutId = null;
  row.checkoutUrl = null;
  row.createdAt = createdAt.toISOString();
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
  const payCheckout = await ensurePaddleCheckout({
    repo: paidRepo,
    quote: payQ.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  if (!payCheckout.ok) throw new Error("pay checkout");
  const txnId = payCheckout.transactionId;
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

  const lateRepo = createMemoryCommerceRepo();
  const lateTracker = grantTracker();
  await putUser(lateRepo, "late", hoursAgo(now, 1));
  const lateQ = await createQuote(lateRepo, { userId: "late", applyCredit: false, policyAccepted: true, now });
  if (!lateQ.ok) throw new Error("late quote");
  const lateCheckout = await ensurePaddleCheckout({
    repo: lateRepo,
    quote: lateQ.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  if (!lateCheckout.ok) fail("late checkout setup");
  else {
    await lateRepo.expireQuote(lateQ.quote.id);
    await lateRepo.expireReservations(new Date(now.getTime() + 16 * 60 * 1000).toISOString());
    const expiredQuote = await lateRepo.getQuote(lateQ.quote.id);
    if (expiredQuote?.status !== "expired") fail("late quote should be expired before webhook");
    const latePaid = await handlePaddleWebhook({
      repo: lateRepo,
      config: cfg,
      grantPro: lateTracker.grantPro,
      event: completedEvent({
        transactionId: lateCheckout.transactionId,
        userId: "late",
        quoteId: lateQ.quote.id,
        amount: lateQ.quote.finalPriceCents,
      }),
    });
    if (
      latePaid.status !== 200 ||
      lateTracker.grants.length !== 1 ||
      !lateTracker.grants[0].startsWith(`paddle:${lateCheckout.transactionId}:late`)
    ) {
      fail("expired quote after bound checkout must still fulfill");
    } else ok("bound transaction.completed after quote TTL → still grants 60-day Pro once");
  }

  const staleRepo = createMemoryCommerceRepo();
  await putUser(staleRepo, "stale", hoursAgo(now, 1));
  const staleQ = await createQuote(staleRepo, { userId: "stale", applyCredit: false, policyAccepted: true, now });
  if (!staleQ.ok) throw new Error("stale quote");
  await staleRepo.expireQuote(staleQ.quote.id);
  const staleCheckout = await ensurePaddleCheckout({
    repo: staleRepo,
    quote: (await staleRepo.getQuote(staleQ.quote.id)) ?? staleQ.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  if (staleCheckout.ok) fail("expired quote must not create a new Paddle transaction");
  else ok("expired quote → new checkout rejected");

  const bindRepo = createMemoryCommerceRepo();
  const bindTracker = grantTracker();
  await putUser(bindRepo, "bind", hoursAgo(now, 1));
  const qA = await createQuote(bindRepo, { userId: "bind", applyCredit: false, policyAccepted: true, now });
  const qB = await createQuote(bindRepo, { userId: "bind", applyCredit: false, policyAccepted: true, now });
  if (!qA.ok || !qB.ok) throw new Error("binding quotes");
  const cA = await ensurePaddleCheckout({
    repo: bindRepo,
    quote: qA.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  const cB = await ensurePaddleCheckout({
    repo: bindRepo,
    quote: qB.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 10, payloads: [] }),
  });
  if (!cA.ok || !cB.ok) fail("binding checkout setup");
  else {
    const crossed = await handlePaddleWebhook({
      repo: bindRepo,
      config: cfg,
      grantPro: bindTracker.grantPro,
      event: completedEvent({
        transactionId: cA.transactionId,
        userId: "bind",
        quoteId: qB.quote.id,
        amount: qB.quote.finalPriceCents,
      }),
    });
    if (crossed.status === 200 || bindTracker.grants.length) fail("crossed quote/transaction binding granted");
    else ok("wrong quote / transaction binding → no grant");
  }

  const unbound = createMemoryCommerceRepo();
  const unboundTracker = grantTracker();
  await putUser(unbound, "free", hoursAgo(now, 1));
  const freeQ = await createQuote(unbound, { userId: "free", applyCredit: false, policyAccepted: true, now });
  if (!freeQ.ok) throw new Error("unbound quote");
  const unboundPaid = await handlePaddleWebhook({
    repo: unbound,
    config: cfg,
    grantPro: unboundTracker.grantPro,
    event: completedEvent({
      transactionId: "txn_neverboundabcdefgh",
      userId: "free",
      quoteId: freeQ.quote.id,
      amount: freeQ.quote.finalPriceCents,
    }),
  });
  if (unboundPaid.status === 200 || unboundTracker.grants.length) fail("unbound transaction granted");
  else ok("transaction without checkout binding → no grant");

  const creditRepo = createMemoryCommerceRepo();
  const creditTracker = grantTracker();
  await putUser(creditRepo, "cred", hoursAgo(now, 1));
  const creditId = await addCredit(creditRepo, "cred", now);
  const creditQ = await createQuote(creditRepo, { userId: "cred", applyCredit: true, policyAccepted: true, now });
  if (!creditQ.ok || !creditQ.quote.creditIds.includes(creditId)) throw new Error("credit quote");
  const creditCheckout = await ensurePaddleCheckout({
    repo: creditRepo,
    quote: creditQ.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  if (!creditCheckout.ok) fail("credit checkout setup");
  else {
    await creditRepo.expireReservations(new Date(now.getTime() + 16 * 60 * 1000).toISOString());
    const held = await creditRepo.getCredit(creditId);
    if (held?.status !== "reserved" || held.reservedQuoteId !== creditQ.quote.id) {
      fail("ready binding credit was released after quote TTL");
    } else ok("A. ready Paddle binding → credit stays reserved after quote TTL");

    const q2 = await createQuote(creditRepo, { userId: "cred", applyCredit: true, policyAccepted: true, now });
    if (q2.ok && q2.quote.creditIds.includes(creditId)) fail("Q2 reused a credit bound to a ready Paddle transaction");
    else ok("B. Q2 cannot take credit reserved by a ready Paddle transaction");

    const creditPaid = await handlePaddleWebhook({
      repo: creditRepo,
      config: cfg,
      grantPro: creditTracker.grantPro,
      event: completedEvent({
        transactionId: creditCheckout.transactionId,
        userId: "cred",
        quoteId: creditQ.quote.id,
        amount: creditQ.quote.finalPriceCents,
      }),
    });
    const redeemed = await creditRepo.getCredit(creditId);
    if (
      creditPaid.status !== 200 ||
      creditTracker.grants.length !== 1 ||
      redeemed?.status !== "redeemed" ||
      redeemed.redeemedOrderId !== (await creditRepo.listOrders("cred"))[0]?.id
    ) {
      fail("bound credit quote after TTL did not grant once and redeem credit");
    } else ok("C. Q1 TTL then transaction.completed → one 60-day Pro and credit redeemed once");

    const creditDup = await handlePaddleWebhook({
      repo: creditRepo,
      config: cfg,
      grantPro: creditTracker.grantPro,
      event: completedEvent({
        transactionId: creditCheckout.transactionId,
        userId: "cred",
        quoteId: creditQ.quote.id,
        amount: creditQ.quote.finalPriceCents,
        notificationId: "ntf_credit_dup",
      }),
    });
    if (creditDup.status !== 200 || creditTracker.grants.length !== 1 || (await creditRepo.listOrders("cred")).length !== 1) {
      fail("repeat credit transaction.completed not idempotent");
    } else ok("G. duplicate transaction.completed → still only one 60-day grant");
  }

  const stealRepo = createMemoryCommerceRepo();
  const stealTracker = grantTracker();
  await putUser(stealRepo, "steal", hoursAgo(now, 1));
  const stealCredit = await addCredit(stealRepo, "steal", now);
  const stealQ = await createQuote(stealRepo, { userId: "steal", applyCredit: true, policyAccepted: true, now });
  if (!stealQ.ok) throw new Error("steal quote");
  const stealCheckout = await ensurePaddleCheckout({
    repo: stealRepo,
    quote: stealQ.quote,
    config: cfg,
    now,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  if (!stealCheckout.ok) fail("steal checkout setup");
  else {
    await stealRepo.releaseCreditsForQuote(stealQ.quote.id);
    const otherQuote = await createQuote(stealRepo, { userId: "steal", applyCredit: true, policyAccepted: true, now });
    if (!otherQuote.ok || !otherQuote.quote.creditIds.includes(stealCredit)) fail("setup Q2 occupying stolen credit");
    else {
      const stolenPay = await handlePaddleWebhook({
        repo: stealRepo,
        config: cfg,
        grantPro: stealTracker.grantPro,
        event: completedEvent({
          transactionId: stealCheckout.transactionId,
          userId: "steal",
          quoteId: stealQ.quote.id,
          amount: stealQ.quote.finalPriceCents,
        }),
      });
      if (stealTracker.grants.length || stolenPay.status === 200) {
        fail("occupied credit webhook granted before failing");
      } else ok("D. credit reserved by another quote → old webhook does not write entitlement/order");
    }
  }

  const freeCreditRepo = createMemoryCommerceRepo();
  await putUser(freeCreditRepo, "loose", hoursAgo(now, 1));
  const looseCredit = await addCredit(freeCreditRepo, "loose", now);
  const looseQ = await createQuote(freeCreditRepo, { userId: "loose", applyCredit: true, policyAccepted: true, now });
  if (!looseQ.ok) throw new Error("loose quote");
  await freeCreditRepo.expireReservations(new Date(now.getTime() + 16 * 60 * 1000).toISOString());
  const looseAfter = await freeCreditRepo.getCredit(looseCredit);
  if (looseAfter?.status !== "available") fail("unbound expired quote should release credit");
  else ok("E. expired quote with no checkout binding → credit released");

  if (oldQuote.ok && oldQuote.quote.finalPriceCents === 2221 && nq.ok && nq.quote.finalPriceCents === 1999) {
    ok("H. no-credit $22.21 / $19.99 quote amounts unchanged");
    ok("I. no-credit ordinary order behavior unchanged");
  } else fail("H/I. no-credit standard/newcomer amounts changed");

  const reconNow = new Date(now.getTime() + 2 * 60 * 1000);
  const reconRepo = createMemoryCommerceRepo();
  await putUser(reconRepo, "recon", hoursAgo(reconNow, 1));
  const reconCredit = await addCredit(reconRepo, "recon", reconNow);
  const reconQ = await createQuote(reconRepo, { userId: "recon", applyCredit: true, policyAccepted: true, now: reconNow });
  if (!reconQ.ok) throw new Error("recon quote");
  const reconCounter = { n: 0, payloads: [] as unknown[] };
  const reconRemote: PaddleTxnSnapshot[] = [];
  const reconSdk = mockSdk(reconCounter, () => reconRemote);
  const reconCheckout = await ensurePaddleCheckout({
    repo: reconRepo,
    quote: reconQ.quote,
    config: cfg,
    now: reconNow,
    sdk: reconSdk,
  });
  if (!reconCheckout.ok) fail("A. setup checkout failed");
  else {
    reconRemote.push(
      listedTxn(
        completedEvent({
          transactionId: reconCheckout.transactionId,
          userId: "recon",
          quoteId: reconQ.quote.id,
          amount: reconQ.quote.finalPriceCents,
          status: "ready",
        })
      )
    );
    orphanCreating(reconRepo, reconQ.quote.id, new Date(reconNow.getTime() - 61_000));
    const recovered = await ensurePaddleCheckout({
      repo: reconRepo,
      quote: reconQ.quote,
      config: cfg,
      now: reconNow,
      sdk: reconSdk,
    });
    const binding = await reconRepo.getCheckoutBinding(reconQ.quote.id);
    const held = await reconRepo.getCredit(reconCredit);
    if (
      !recovered.ok ||
      recovered.transactionId !== reconCheckout.transactionId ||
      reconCounter.n !== 1 ||
      binding?.status !== "ready" ||
      binding.providerCheckoutId !== reconCheckout.transactionId ||
      held?.status !== "reserved" ||
      held.reservedQuoteId !== reconQ.quote.id
    ) {
      fail("A. stale creating did not recover the remote transaction without a second create");
    } else ok("A. reconcile recovers ready transaction and keeps credit locked");
  }

  const adoptRepo = createMemoryCommerceRepo();
  let adoptFails = 1;
  const adoptGrants: string[] = [];
  const adoptGrant: GrantProFn = async (opts) => {
    if (adoptFails > 0) {
      adoptFails -= 1;
      throw new Error("temporary_fulfillment");
    }
    adoptGrants.push(`${opts.provider}:${opts.providerOrderId}:${opts.userId}`);
    return { entitlement: { id: randomUUID() } };
  };
  await putUser(adoptRepo, "adopt", hoursAgo(reconNow, 1));
  const adoptCredit = await addCredit(adoptRepo, "adopt", reconNow);
  const adoptQ = await createQuote(adoptRepo, { userId: "adopt", applyCredit: true, policyAccepted: true, now: reconNow });
  if (!adoptQ.ok) throw new Error("adopt quote");
  const adoptCheckout = await ensurePaddleCheckout({
    repo: adoptRepo,
    quote: adoptQ.quote,
    config: cfg,
    now: reconNow,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  if (!adoptCheckout.ok) fail("B. setup checkout failed");
  else {
    orphanCreating(adoptRepo, adoptQ.quote.id, new Date(reconNow.getTime() - 61_000));
    const firstPay = await handlePaddleWebhook({
      repo: adoptRepo,
      config: cfg,
      grantPro: adoptGrant,
      event: completedEvent({
        transactionId: adoptCheckout.transactionId,
        userId: "adopt",
        quoteId: adoptQ.quote.id,
        amount: adoptQ.quote.finalPriceCents,
      }),
    });
    const afterFail = await adoptRepo.getCheckoutBinding(adoptQ.quote.id);
    const retryPay = await handlePaddleWebhook({
      repo: adoptRepo,
      config: cfg,
      grantPro: adoptGrant,
      event: completedEvent({
        transactionId: adoptCheckout.transactionId,
        userId: "adopt",
        quoteId: adoptQ.quote.id,
        amount: adoptQ.quote.finalPriceCents,
        notificationId: "ntf_adopt_retry",
      }),
    });
    const redeemed = await adoptRepo.getCredit(adoptCredit);
    if (
      firstPay.status !== 503 ||
      afterFail?.status !== "ready" ||
      afterFail.providerCheckoutId !== adoptCheckout.transactionId ||
      retryPay.status !== 200 ||
      adoptGrants.length !== 1 ||
      redeemed?.status !== "redeemed"
    ) {
      fail("B. webhook did not adopt orphan creating and fulfill once on retry");
    } else ok("B. webhook adopts creating binding, then retry fulfills once");
  }

  const emptyRepo = createMemoryCommerceRepo();
  await putUser(emptyRepo, "empty", hoursAgo(reconNow, 1));
  const emptyCredit = await addCredit(emptyRepo, "empty", reconNow);
  const emptyQ = await createQuote(emptyRepo, { userId: "empty", applyCredit: true, policyAccepted: true, now: reconNow });
  if (!emptyQ.ok) throw new Error("empty quote");
  await emptyRepo.claimCheckoutBinding({
    quoteId: emptyQ.quote.id,
    provider: PADDLE_PROVIDER,
    expiresAt: emptyQ.quote.expiresAt,
    now: new Date(reconNow.getTime() - 61_000).toISOString(),
  });
  await emptyRepo.expireQuote(emptyQ.quote.id);
  const emptyCleared = await ensurePaddleCheckout({
    repo: emptyRepo,
    quote: (await emptyRepo.getQuote(emptyQ.quote.id)) ?? emptyQ.quote,
    config: cfg,
    now: reconNow,
    sdk: mockSdk({ n: 0, payloads: [] }),
  });
  const emptyCreditAfter = await emptyRepo.getCredit(emptyCredit);
  const emptyBind = await emptyRepo.getCheckoutBinding(emptyQ.quote.id);
  if (emptyCleared.ok || emptyCreditAfter?.status !== "available" || emptyBind) {
    fail("C. expired quote with no remote transaction did not release credit");
  } else ok("C. stale creating + no remote txn + expired quote → credit available");

  const retryRepo = createMemoryCommerceRepo();
  await putUser(retryRepo, "retry", hoursAgo(reconNow, 1));
  const retryQ = await createQuote(retryRepo, { userId: "retry", applyCredit: false, policyAccepted: true, now: reconNow });
  if (!retryQ.ok) throw new Error("retry quote");
  await retryRepo.claimCheckoutBinding({
    quoteId: retryQ.quote.id,
    provider: PADDLE_PROVIDER,
    expiresAt: retryQ.quote.expiresAt,
    now: new Date(reconNow.getTime() - 61_000).toISOString(),
  });
  const retryCounter = { n: 0, payloads: [] as unknown[] };
  const retryCheckout = await ensurePaddleCheckout({
    repo: retryRepo,
    quote: retryQ.quote,
    config: cfg,
    now: reconNow,
    sdk: mockSdk(retryCounter),
  });
  if (!retryCheckout.ok || retryCounter.n !== 1) fail("D. valid quote did not safely retry create after empty reconcile");
  else ok("D. stale creating + no remote txn + valid quote → safe retry create");

  const conflictRepo = createMemoryCommerceRepo();
  await putUser(conflictRepo, "conflict", hoursAgo(reconNow, 1));
  const conflictCredit = await addCredit(conflictRepo, "conflict", reconNow);
  const conflictQ = await createQuote(conflictRepo, {
    userId: "conflict",
    applyCredit: true,
    policyAccepted: true,
    now: reconNow,
  });
  if (!conflictQ.ok) throw new Error("conflict quote");
  await conflictRepo.claimCheckoutBinding({
    quoteId: conflictQ.quote.id,
    provider: PADDLE_PROVIDER,
    expiresAt: conflictQ.quote.expiresAt,
    now: new Date(reconNow.getTime() - 61_000).toISOString(),
  });
  const twins = [
    listedTxn(
      completedEvent({
        transactionId: "txn_conflictoneabcdefgh",
        userId: "conflict",
        quoteId: conflictQ.quote.id,
        amount: conflictQ.quote.finalPriceCents,
        status: "ready",
      })
    ),
    listedTxn(
      completedEvent({
        transactionId: "txn_conflicttwoabcdefgh",
        userId: "conflict",
        quoteId: conflictQ.quote.id,
        amount: conflictQ.quote.finalPriceCents,
        status: "ready",
      })
    ),
  ];
  const conflictCounter = { n: 0, payloads: [] as unknown[] };
  const conflictCheckout = await ensurePaddleCheckout({
    repo: conflictRepo,
    quote: conflictQ.quote,
    config: cfg,
    now: reconNow,
    sdk: mockSdk(conflictCounter, twins),
  });
  const conflictHeld = await conflictRepo.getCredit(conflictCredit);
  const conflictBind = await conflictRepo.getCheckoutBinding(conflictQ.quote.id);
  if (
    conflictCheckout.ok ||
    !("error" in conflictCheckout) ||
    conflictCheckout.error !== "paddle_transaction_reconciliation_conflict" ||
    conflictCounter.n !== 0 ||
    conflictHeld?.status !== "reserved" ||
    conflictBind?.status !== "creating"
  ) {
    fail("E. two matching transactions did not fail closed");
  } else ok("E. two matching transactions → fail closed, credit stays locked");

  const wrongRemote = createMemoryCommerceRepo();
  const wrongTracker = grantTracker();
  await putUser(wrongRemote, "wrong", hoursAgo(reconNow, 1));
  const wrongQ = await createQuote(wrongRemote, { userId: "wrong", applyCredit: false, policyAccepted: true, now: reconNow });
  if (!wrongQ.ok) throw new Error("wrong quote");
  await wrongRemote.claimCheckoutBinding({
    quoteId: wrongQ.quote.id,
    provider: PADDLE_PROVIDER,
    expiresAt: wrongQ.quote.expiresAt,
    now: new Date(reconNow.getTime() - 61_000).toISOString(),
  });
  const wrongList = [
    listedTxn(
      completedEvent({
        transactionId: "txn_wrongproductabcdefgh",
        userId: "wrong",
        quoteId: wrongQ.quote.id,
        amount: wrongQ.quote.finalPriceCents,
        productId: "pro_01someoneelsesproduct",
        status: "ready",
      })
    ),
    listedTxn(
      completedEvent({
        transactionId: "txn_wronguserabcdefghxx",
        userId: "other-user",
        quoteId: wrongQ.quote.id,
        amount: wrongQ.quote.finalPriceCents,
        status: "ready",
      })
    ),
    listedTxn(
      completedEvent({
        transactionId: "txn_wrongamountabcdefgh",
        userId: "wrong",
        quoteId: wrongQ.quote.id,
        amount: wrongQ.quote.finalPriceCents + 100,
        status: "ready",
      })
    ),
  ];
  const wrongRecon = await reconcilePaddleCheckoutBinding({
    repo: wrongRemote,
    quote: wrongQ.quote,
    config: cfg,
    now: reconNow,
    sdk: mockSdk({ n: 0, payloads: [] }, wrongList),
  });
  const wrongPay = await handlePaddleWebhook({
    repo: wrongRemote,
    config: cfg,
    grantPro: wrongTracker.grantPro,
    event: completedEvent({
      transactionId: "txn_wrongamountabcdefgh",
      userId: "wrong",
      quoteId: wrongQ.quote.id,
      amount: wrongQ.quote.finalPriceCents + 100,
    }),
  });
  if (
    (wrongRecon.ok && wrongRecon.kind === "ready") ||
    wrongPay.status === 200 ||
    wrongTracker.grants.length
  ) {
    fail("G. mismatched remote transactions were adopted");
  } else ok("G. wrong product / user / amount cannot be reconciled or adopted");

  if (failures) {
    console.error(lines.join("\n"));
    console.error(`paddle:verify failed (${failures})`);
    process.exit(1);
  }
  console.log(lines.join("\n"));
  console.log("paddle:verify passed");
}

await run();
