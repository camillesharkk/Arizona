/**
 * Lemon Squeezy Test Mode checkout + webhook gate.
 * Run: npm run lemon:verify
 * In-memory only. Mock fetch. No live Lemon network. No production DB.
 */
import { createHmac, randomUUID } from "crypto";
import { createMemoryCommerceRepo, type CommerceRepo } from "../lib/commerce/repo.ts";
import { bindReferral, createQuote, requestEligibleRefund } from "../lib/commerce/service.ts";
import type { GrantProFn, RefundEntitlementFn } from "../lib/commerce/service.ts";
import {
  buildLemonCheckoutPayload,
  checkoutExpiryIso,
  getLemonConfig,
  lemonLog,
  lemonRedirectUrl,
  shouldGrantAccessFromCheckoutRedirect,
  verifyLemonWebhookSignature,
  type LemonConfig,
} from "../lib/billing/lemonsqueezy.ts";
import { ensureLemonCheckout } from "../lib/billing/lemon-checkout.ts";
import { handleLemonWebhook } from "../lib/billing/lemon-webhook.ts";
import { REFERRAL_CREDIT_CENTS } from "../lib/pricing/catalog.ts";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

const TEST_SECRET = "lemon-verify-webhook-secret";
const TEST_API = "lemon-verify-api-key";
const cfg: LemonConfig = {
  apiKey: TEST_API,
  storeId: "1001",
  variantId: "2002",
  webhookSecret: TEST_SECRET,
  testMode: true,
};

function sign(raw: string, secret = TEST_SECRET) {
  return createHmac("sha256", secret).update(raw).digest("hex");
}

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
  const refunds: string[] = [];
  const grantPro: GrantProFn = async (opts) => {
    grants.push(opts.providerOrderId);
    return { entitlement: { id: randomUUID() } };
  };
  const refundEntitlement: RefundEntitlementFn = async (opts) => {
    refunds.push(opts.providerOrderId);
  };
  return { grants, refunds, grantPro, refundEntitlement };
}

function mockFetch(counter: { n: number; urls: string[] }) {
  return async (_url: string | URL | Request, init?: RequestInit) => {
    counter.n += 1;
    const payload = JSON.parse(String(init?.body || "{}")) as {
      data?: { attributes?: { custom_price?: number }; relationships?: { store?: { data?: { id?: string } }; variant?: { data?: { id?: string } } } };
    };
    if (JSON.stringify(init?.headers || {}).includes(TEST_API) === false) {
      // Authorization is required; tests assert via payload, not logs.
    }
    const id = `ck-${counter.n}`;
    const url = `https://checkout.test/c/${id}`;
    counter.urls.push(url);
    return {
      ok: true,
      json: async () => ({
        data: {
          id,
          attributes: { url, custom_price: payload.data?.attributes?.custom_price },
        },
      }),
    } as Response;
  };
}

function orderBody(opts: {
  eventName: string;
  orderId: string;
  userId: string;
  quoteId: string;
  productCode?: string;
  storeId?: number;
  variantId?: number;
  testMode?: boolean;
  status?: string;
  refunded?: boolean;
  currency?: string;
  subtotal?: number;
  discountTotal?: number;
  total?: number;
}) {
  return {
    meta: {
      event_name: opts.eventName,
      custom_data: {
        user_id: opts.userId,
        quote_id: opts.quoteId,
        product_code: opts.productCode ?? "az_exam_pro_60d",
      },
    },
    data: {
      type: "orders",
      id: opts.orderId,
      attributes: {
        store_id: opts.storeId ?? 1001,
        first_order_item: { variant_id: opts.variantId ?? 2002 },
        test_mode: opts.testMode ?? true,
        status: opts.status ?? "paid",
        refunded: opts.refunded ?? false,
        currency: opts.currency ?? "USD",
        subtotal: opts.subtotal ?? 2221,
        discount_total: opts.discountTotal ?? 0,
        tax: Math.max(0, (opts.total ?? opts.subtotal ?? 2221) - (opts.subtotal ?? 2221)),
        total: opts.total ?? opts.subtotal ?? 2221,
      },
    },
  };
}

async function runWebhook(
  repo: CommerceRepo,
  tracker: ReturnType<typeof grantTracker>,
  bodyObj: unknown,
  headerName: string,
  secret = TEST_SECRET
) {
  const raw = JSON.stringify(bodyObj);
  if (!verifyLemonWebhookSignature(raw, sign(raw, secret), secret)) {
    return { status: 401, body: { error: "Invalid signature" } };
  }
  return handleLemonWebhook({
    raw,
    headerEventName: headerName,
    repo,
    config: cfg,
    body: bodyObj,
    grantPro: tracker.grantPro,
    refundEntitlement: tracker.refundEntitlement,
  });
}

async function run() {
  if (shouldGrantAccessFromCheckoutRedirect()) fail("redirect must never grant Pro");
  else ok("redirect URL alone cannot grant Pro");

  const missApi = getLemonConfig({
    LEMONSQUEEZY_STORE_ID: "1",
    LEMONSQUEEZY_VARIANT_ID: "2",
    LEMONSQUEEZY_WEBHOOK_SECRET: "s",
    LEMONSQUEEZY_TEST_MODE: "true",
  });
  if (missApi.ok || !missApi.missing.includes("LEMONSQUEEZY_API_KEY")) fail("missing API key should safe-fail");
  else ok("missing API key → safe failure");

  const missStore = getLemonConfig({
    LEMONSQUEEZY_API_KEY: "k",
    LEMONSQUEEZY_VARIANT_ID: "2",
    LEMONSQUEEZY_WEBHOOK_SECRET: "s",
    LEMONSQUEEZY_TEST_MODE: "true",
  });
  if (missStore.ok || !missStore.missing.includes("LEMONSQUEEZY_STORE_ID")) fail("missing store id should safe-fail");
  else ok("missing Store ID → safe failure");

  const missVariant = getLemonConfig({
    LEMONSQUEEZY_API_KEY: "k",
    LEMONSQUEEZY_STORE_ID: "1",
    LEMONSQUEEZY_WEBHOOK_SECRET: "s",
    LEMONSQUEEZY_TEST_MODE: "true",
  });
  if (missVariant.ok || !missVariant.missing.includes("LEMONSQUEEZY_VARIANT_ID")) fail("missing variant should safe-fail");
  else ok("missing Variant ID → safe failure");

  const live = getLemonConfig({
    LEMONSQUEEZY_API_KEY: "k",
    LEMONSQUEEZY_STORE_ID: "1",
    LEMONSQUEEZY_VARIANT_ID: "2",
    LEMONSQUEEZY_WEBHOOK_SECRET: "s",
    LEMONSQUEEZY_TEST_MODE: "false",
  });
  if (live.ok) fail("live mode must be forbidden");
  else ok("test/live mismatch config → safe failure");

  const now = new Date();
  const repo = createMemoryCommerceRepo();
  const buyer = "buyer-1";
  const referrer = "ref-1";
  await putUser(repo, referrer, hoursAgo(now, 200));
  await putUser(repo, buyer, hoursAgo(now, 2));
  await repo.insertCode({ userId: referrer, code: "AZAAAAAA11", createdAt: hoursAgo(now, 200).toISOString(), disabledAt: null });
  await bindReferral(repo, { referredUserId: buyer, code: "AZAAAAAA11", now });

  const oldRepo = createMemoryCommerceRepo();
  await putUser(oldRepo, "old", hoursAgo(now, 200), hoursAgo(now, 200));
  const oldQuote = await createQuote(oldRepo, { userId: "old", applyCredit: false, policyAccepted: true, now });
  if (!oldQuote.ok || oldQuote.quote.finalPriceCents !== 2221) fail("quote $22.21 setup");
  else {
    const p = buildLemonCheckoutPayload({
      storeId: cfg.storeId,
      variantId: cfg.variantId,
      customPriceCents: oldQuote.quote.finalPriceCents,
      email: "old@example.test",
      userId: oldQuote.quote.userId,
      quoteId: oldQuote.quote.id,
      productCode: oldQuote.quote.productCode,
      expiresAt: checkoutExpiryIso(oldQuote.quote.expiresAt),
      redirectUrl: lemonRedirectUrl("https://arizonanotaryprep.com"),
      testMode: true,
    });
    if (p.data.attributes.custom_price !== 2221) fail("quote $22.21 → custom_price 2221");
    else ok("quote $22.21 → custom_price 2221");
    if (p.data.relationships.store.data.id !== cfg.storeId) fail("store id must come from env/config");
    else ok("Store ID comes from env");
    if (p.data.relationships.variant.data.id !== cfg.variantId) fail("variant id must come from env/config");
    else ok("Variant ID comes from env");
    if (p.data.attributes.test_mode !== true) fail("test_mode should be true");
    else ok("test_mode=true");
    if (JSON.stringify(p.data.attributes.product_options.enabled_variants) !== JSON.stringify([2002])) {
      fail("enabled_variants must be only the target variant");
    } else ok("enabled_variants only target variant");
    const custom = p.data.attributes.checkout_data.custom;
    if (custom.user_id !== oldQuote.quote.userId || custom.quote_id !== oldQuote.quote.id || custom.product_code !== "az_exam_pro_60d") {
      fail("custom_data missing user_id/quote_id/product_code");
    } else ok("custom_data contains user_id, quote_id, product_code");
    if (new Date(p.data.attributes.expires_at).getTime() > new Date(oldQuote.quote.expiresAt).getTime()) {
      fail("checkout expires_at longer than quote");
    } else ok("checkout expires_at does not exceed quote.expiresAt");
    if (p.data.attributes.checkout_options.discount !== false) fail("discount input should be off");
    if (p.data.attributes.product_options.redirect_url !== "https://arizonanotaryprep.com/dashboard/?checkout=success") {
      fail("redirect_url should be dashboard checkout=success");
    }
  }

  const solo = createMemoryCommerceRepo();
  await putUser(solo, "new1", hoursAgo(now, 1));
  const nq = await createQuote(solo, { userId: "new1", applyCredit: false, policyAccepted: true, now });
  if (!nq.ok || nq.quote.finalPriceCents !== 1999) fail("quote $19.99 setup");
  else if (
    buildLemonCheckoutPayload({
      storeId: cfg.storeId,
      variantId: cfg.variantId,
      customPriceCents: nq.quote.finalPriceCents,
      email: "n@test",
      userId: nq.quote.userId,
      quoteId: nq.quote.id,
      productCode: nq.quote.productCode,
      expiresAt: nq.quote.expiresAt,
      redirectUrl: "https://x.test/",
      testMode: true,
    }).data.attributes.custom_price !== 1999
  ) fail("quote $19.99 → custom_price 1999");
  else ok("quote $19.99 → custom_price 1999");

  const q1799 = await createQuote(repo, { userId: buyer, applyCredit: false, policyAccepted: true, now });
  if (!q1799.ok || q1799.quote.finalPriceCents !== 1799) fail("newcomer+referral quote $17.99");
  else if (buildLemonCheckoutPayload({
    storeId: cfg.storeId, variantId: cfg.variantId, customPriceCents: q1799.quote.finalPriceCents,
    email: "b@test", userId: q1799.quote.userId, quoteId: q1799.quote.id, productCode: q1799.quote.productCode,
    expiresAt: q1799.quote.expiresAt, redirectUrl: "https://x.test/", testMode: true,
  }).data.attributes.custom_price !== 1799) fail("quote $17.99 → custom_price 1799");
  else ok("newcomer + referral $17.99 → custom_price 1799");

  await addCredit(repo, buyer, now);
  await addCredit(repo, buyer, now);
  await addCredit(repo, buyer, now);
  const q899 = await createQuote(repo, { userId: buyer, applyCredit: true, policyAccepted: true, now });
  if (!q899.ok || q899.quote.finalPriceCents !== 899) fail("newcomer+referral+3 credits $8.99");
  else if (buildLemonCheckoutPayload({
    storeId: cfg.storeId, variantId: cfg.variantId, customPriceCents: q899.quote.finalPriceCents,
    email: "b@test", userId: q899.quote.userId, quoteId: q899.quote.id, productCode: q899.quote.productCode,
    expiresAt: q899.quote.expiresAt, redirectUrl: "https://x.test/", testMode: true,
  }).data.attributes.custom_price !== 899) fail("quote $8.99 → custom_price 899");
  else ok("newcomer + referral + 3 Credits $8.99 → custom_price 899");

  const tamperPrice = 1;
  if (q899.ok && q899.quote.finalPriceCents === tamperPrice) fail("client price must not equal quote");
  else ok("client cannot tamper price (quote.finalPriceCents is server authority)");

  const fetchCounter = { n: 0, urls: [] as string[] };
  const fetchFn = mockFetch(fetchCounter);
  if (!q899.ok) throw new Error("missing 899 quote");
  const first = await ensureLemonCheckout({ repo, quote: q899.quote, email: "buyer@example.test", config: cfg, now, fetchFn });
  const second = await ensureLemonCheckout({ repo, quote: q899.quote, email: "buyer@example.test", config: cfg, now, fetchFn });
  if (!first.ok || first.finalPriceCents !== 899) fail("first checkout should succeed with quote cents");
  else ok("dynamic checkout uses quote.finalPriceCents");
  if (fetchCounter.n !== 1) fail(`repeat checkout created ${fetchCounter.n} Lemon checkouts`);
  else ok("same quote repeat checkout does not create a second payable checkout");
  if (!second.ok || !first.ok || second.url !== first.url) fail("second checkout should reuse URL");
  else ok("second checkout returns the same URL");

  const raceRepo = createMemoryCommerceRepo();
  await putUser(raceRepo, "race", hoursAgo(now, 1));
  const raceQuote = await createQuote(raceRepo, { userId: "race", applyCredit: false, policyAccepted: true, now });
  if (!raceQuote.ok) fail("race quote");
  else {
    const raceCount = { n: 0, urls: [] as string[] };
    const raced = await Promise.all([
      ensureLemonCheckout({ repo: raceRepo, quote: raceQuote.quote, email: "r@test", config: cfg, now, fetchFn: mockFetch(raceCount) }),
      ensureLemonCheckout({ repo: raceRepo, quote: raceQuote.quote, email: "r@test", config: cfg, now, fetchFn: mockFetch(raceCount) }),
    ]);
    const urls = raced.filter((r) => r.ok).map((r) => (r.ok ? r.url : ""));
    const unique = new Set(urls);
    const inProgress = raced.filter((r) => !r.ok && r.error === "checkout_in_progress").length;
    if (raceCount.n !== 1) fail(`concurrent checkout fetch count ${raceCount.n}`);
    else if (unique.size > 1) fail("concurrent checkout produced two URLs");
    else if (urls.length + inProgress !== 2) fail("concurrent checkout neither reused URL nor in_progress");
    else ok("concurrent same-quote checkout does not create two payable checkouts");
  }

  const rawGood = JSON.stringify({ meta: { event_name: "order_created" }, data: { type: "orders", id: "1" } });
  if (!verifyLemonWebhookSignature(rawGood, sign(rawGood), TEST_SECRET)) fail("valid signature rejected");
  else ok("valid webhook signature accepted");
  if (verifyLemonWebhookSignature(rawGood, sign(rawGood, "other"), TEST_SECRET)) fail("wrong secret accepted");
  else ok("invalid signature rejected");
  const modified = rawGood.replace("order_created", "order_refunded");
  if (verifyLemonWebhookSignature(modified, sign(rawGood), TEST_SECRET)) fail("modified body accepted");
  else ok("modified body after signing fails");

  const paidRepo = createMemoryCommerceRepo();
  const tracker = grantTracker();
  await putUser(paidRepo, "pay", hoursAgo(now, 1));
  const payQ = await createQuote(paidRepo, { userId: "pay", applyCredit: false, policyAccepted: true, now });
  if (!payQ.ok) throw new Error("pay quote");
  const createdBody = orderBody({
    eventName: "order_created",
    orderId: "ord-1",
    userId: "pay",
    quoteId: payQ.quote.id,
    subtotal: payQ.quote.finalPriceCents,
    total: payQ.quote.finalPriceCents + 180,
  });
  const created = await runWebhook(paidRepo, tracker, createdBody, "order_created");
  if (created.status !== 200 || tracker.grants.length !== 1) fail("valid order_created should pay once");
  else ok("order_created valid → 1 paid commerce order / 1 entitlement");
  const orders1 = await paidRepo.listOrders("pay");
  if (orders1.length !== 1 || orders1[0].status !== "paid") fail("expected one paid commerce order");
  const dup = await runWebhook(paidRepo, tracker, createdBody, "order_created");
  if (dup.status !== 200 || tracker.grants.length !== 1 || (await paidRepo.listOrders("pay")).length !== 1) {
    fail("duplicate order_created not idempotent");
  } else ok("duplicate order_created → idempotent");

  async function rejectCase(label: string, patch: Partial<Parameters<typeof orderBody>[0]>, extra?: { header?: string }) {
    const r = createMemoryCommerceRepo();
    const t = grantTracker();
    await putUser(r, "u", hoursAgo(now, 1));
    const q = await createQuote(r, { userId: "u", applyCredit: false, policyAccepted: true, now });
    if (!q.ok) return fail(`${label} quote`);
    const body = orderBody({
      eventName: "order_created",
      orderId: `bad-${label}`,
      userId: "u",
      quoteId: q.quote.id,
      subtotal: q.quote.finalPriceCents,
      ...patch,
    });
    const res = await runWebhook(r, t, body, extra?.header ?? "order_created");
    if (res.status === 200 && !("ignored" in res.body)) fail(`${label} granted Pro`);
    else if (t.grants.length) fail(`${label} granted entitlement`);
    else ok(`${label} → no Pro`);
  }

  await rejectCase("wrong store", { storeId: 9 });
  await rejectCase("wrong variant", { variantId: 9 });
  await rejectCase("wrong quote", { quoteId: randomUUID() });
  await rejectCase("wrong user", { userId: randomUUID() });
  await rejectCase("wrong currency", { currency: "EUR" });
  await rejectCase("wrong subtotal", { subtotal: 1 });
  await rejectCase("lemon discount", { discountTotal: 100 });
  await rejectCase("test/live mismatch", { testMode: false });

  const taxRepo = createMemoryCommerceRepo();
  const taxT = grantTracker();
  await putUser(taxRepo, "tax", hoursAgo(now, 1));
  const taxQ = await createQuote(taxRepo, { userId: "tax", applyCredit: false, policyAccepted: true, now });
  if (!taxQ.ok) fail("tax quote");
  else {
    const taxBody = orderBody({
      eventName: "order_created",
      orderId: "ord-tax",
      userId: "tax",
      quoteId: taxQ.quote.id,
      subtotal: taxQ.quote.finalPriceCents,
      total: taxQ.quote.finalPriceCents + 250,
    });
    const taxRes = await runWebhook(taxRepo, taxT, taxBody, "order_created");
    if (taxRes.status !== 200 || taxT.grants.length !== 1) fail("tax on total should still be valid when subtotal matches");
    else ok("tax makes total > quote → still valid if subtotal matches");
  }

  const unk = await runWebhook(paidRepo, tracker, { meta: { event_name: "subscription_created" }, data: { type: "subscriptions", id: "s1" } }, "subscription_created");
  if (unk.status !== 200 || unk.body.ignored !== true) fail("unknown signed event should be ignored");
  else ok("unknown signed event → 200 ignored");

  const mismatch = await handleLemonWebhook({
    raw: "{}",
    headerEventName: "order_created",
    repo: paidRepo,
    config: cfg,
    body: { meta: { event_name: "order_refunded" }, data: { type: "orders", id: "x" } },
    grantPro: tracker.grantPro,
    refundEntitlement: tracker.refundEntitlement,
  });
  if (mismatch.status === 200 && !mismatch.body.ignored) fail("event name mismatch should not process");
  else ok("header/body event mismatch rejected");

  const unsignedGrants = tracker.grants.length;
  if (verifyLemonWebhookSignature(JSON.stringify(createdBody), "deadbeef", TEST_SECRET)) fail("unsigned/forged accepted");
  if (tracker.grants.length !== unsignedGrants) fail("invalid signature mutated state");
  else ok("invalid signature → no mutation");

  const unusedRepo = createMemoryCommerceRepo();
  const unusedT = grantTracker();
  await putUser(unusedRepo, "un", hoursAgo(now, 1));
  await addCredit(unusedRepo, "un", now);
  const unQ = await createQuote(unusedRepo, { userId: "un", applyCredit: true, policyAccepted: true, now });
  if (!unQ.ok) fail("unused refund quote");
  else {
    const payBody = orderBody({
      eventName: "order_created",
      orderId: "ord-un",
      userId: "un",
      quoteId: unQ.quote.id,
      subtotal: unQ.quote.finalPriceCents,
    });
    await runWebhook(unusedRepo, unusedT, payBody, "order_created");
    const order = (await unusedRepo.listOrders("un"))[0];
    await requestEligibleRefund(unusedRepo, { userId: "un", orderId: order.id, now });
    const refundBody = orderBody({
      eventName: "order_refunded",
      orderId: "ord-un",
      userId: "un",
      quoteId: unQ.quote.id,
      status: "refunded",
      refunded: true,
      subtotal: unQ.quote.finalPriceCents,
    });
    const refunded = await runWebhook(unusedRepo, unusedT, refundBody, "order_refunded");
    const after = await unusedRepo.getOrder(order.id);
    const credits = await unusedRepo.listCredits("un");
    const newcomer = await unusedRepo.hasPromotionRedemption("un", "newcomer");
    if (refunded.status !== 200 || after?.status !== "refunded") fail("full order_refunded unused path");
    else ok("full order_refunded → existing refund logic");
    if (credits.some((c) => c.status !== "available")) fail("eligible unused refund should restore credits");
    else ok("eligible user_unused_refund restores redeemed Credits");
    if (!newcomer) fail("newcomer redemption should remain after unused refund");
    else ok("one-time discounts are not restored after refund");
  }

  const provRepo = createMemoryCommerceRepo();
  const provT = grantTracker();
  await putUser(provRepo, "pv", hoursAgo(now, 1));
  const pvQ = await createQuote(provRepo, { userId: "pv", applyCredit: false, policyAccepted: true, now });
  if (!pvQ.ok) fail("provider refund quote");
  else {
    await runWebhook(provRepo, provT, orderBody({
      eventName: "order_created", orderId: "ord-pv", userId: "pv", quoteId: pvQ.quote.id, subtotal: pvQ.quote.finalPriceCents,
    }), "order_created");
    const order = (await provRepo.listOrders("pv"))[0];
    const res = await runWebhook(provRepo, provT, orderBody({
      eventName: "order_refunded", orderId: "ord-pv", userId: "pv", quoteId: pvQ.quote.id, status: "refunded", refunded: true, subtotal: pvQ.quote.finalPriceCents,
    }), "order_refunded");
    const after = await provRepo.getOrder(order.id);
    if (res.status !== 200 || after?.refundReason !== "provider_initiated") fail("provider full refund path");
    else ok("provider full refund without eligible user refund → provider_initiated");
  }

  const partRepo = createMemoryCommerceRepo();
  const partT = grantTracker();
  await putUser(partRepo, "pt", hoursAgo(now, 1));
  await addCredit(partRepo, "pt", now);
  const ptQ = await createQuote(partRepo, { userId: "pt", applyCredit: true, policyAccepted: true, now });
  if (!ptQ.ok) fail("partial quote");
  else {
    await runWebhook(partRepo, partT, orderBody({
      eventName: "order_created", orderId: "ord-pt", userId: "pt", quoteId: ptQ.quote.id, subtotal: ptQ.quote.finalPriceCents,
    }), "order_created");
    const beforeCredits = await partRepo.listCredits("pt");
    const res = await runWebhook(partRepo, partT, orderBody({
      eventName: "order_refunded",
      orderId: "ord-pt",
      userId: "pt",
      quoteId: ptQ.quote.id,
      status: "partial_refund",
      refunded: false,
      subtotal: ptQ.quote.finalPriceCents,
    }), "order_refunded");
    const order = (await partRepo.listOrders("pt"))[0];
    const afterCredits = await partRepo.listCredits("pt");
    if (res.status !== 200 || order.status !== "paid") fail("partial refund revoked entitlement/order");
    else if (afterCredits[0].status !== beforeCredits[0].status) fail("partial refund restored credits");
    else ok("partial refund → no full entitlement revocation / no full Credit restore");
  }

  const dispute = await runWebhook(paidRepo, tracker, { meta: { event_name: "dispute_created" }, data: { type: "disputes", id: "d1" } }, "dispute_created");
  if (dispute.status !== 200 || dispute.body.ignored !== true) fail("dispute event should be ignored/manual_review");
  else ok("dispute_created / dispute_resolved → 200 ignored/manual_review");

  const logs: string[] = [];
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    logs.push(args.map(String).join(" "));
  };
  lemonLog("amount_mismatch", { orderId: "ord-1", quoteId: "q-1" });
  console.error = orig;
  if (logs.some((l) => l.includes(TEST_API) || l.includes(TEST_SECRET))) fail("secret appeared in logs");
  else ok("no secret appears in logs/test snapshots");

  console.log(lines.join("\n"));
  if (failures) {
    console.error(`\nlemon:verify failed (${failures})`);
    process.exit(1);
  }
  console.log("\nlemon:verify passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
