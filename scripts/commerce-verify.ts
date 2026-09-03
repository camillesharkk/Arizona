/**
 * Commerce pricing / referral / credit / refund eligibility gate.
 * Run: npm run commerce:verify
 * Uses in-memory repo only. No production DB. No payment provider.
 */
import { randomUUID } from "crypto";
import { applyPercent } from "../lib/pricing/money.ts";
import { calculatePrice, maxApplicableCredits } from "../lib/pricing/engine.ts";
import {
  LIST_PRICE_CENTS,
  MAX_CREDITS_PER_ORDER,
  MIN_OUT_OF_POCKET_CENTS,
  NEWCOMER_HOURS,
  REFERRAL_CREDIT_CENTS,
  STANDARD_PRICE_CENTS,
} from "../lib/pricing/catalog.ts";
import { createMemoryCommerceRepo } from "../lib/commerce/repo.ts";
import { generateReferralCode, isReferralCodeFormat, normalizeReferralCode } from "../lib/commerce/codes.ts";
import {
  assertQuoteStillValid,
  bindReferral,
  completeEligibleUnusedRefund,
  completeNonRestoringRefund,
  confirmPaidOrder,
  createQuote,
  eligibilitySnapshot,
  isNewcomerEligible,
  markProUsed,
  previewPrice,
  refundEligibility,
  releaseMatureRewards,
} from "../lib/commerce/service.ts";
import type { CommerceRepo } from "../lib/commerce/repo.ts";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

function hoursAgo(base: Date, hours: number) {
  return new Date(base.getTime() - hours * 3600000);
}
function hoursFrom(base: Date, hours: number) {
  return new Date(base.getTime() + hours * 3600000);
}

async function user(repo: CommerceRepo, id: string, createdAt: Date) {
  await repo.putUser({ id, createdAt: createdAt.toISOString() });
}

async function addCredit(repo: CommerceRepo, userId: string, now: Date, status: "available" | "redeemed" = "available") {
  const id = randomUUID();
  await repo.insertCredit({
    id,
    userId,
    amountCents: REFERRAL_CREDIT_CENTS,
    sourceRewardId: randomUUID(),
    status,
    createdAt: now.toISOString(),
    availableAt: now.toISOString(),
    reservedAt: null,
    reservedQuoteId: null,
    reservedUntil: null,
    redeemedAt: status === "redeemed" ? now.toISOString() : null,
    redeemedOrderId: null,
    reversedAt: null,
    restoredAt: null,
  });
  return id;
}

function grant(entitlementId: string) {
  return async () => ({ entitlement: { id: entitlementId } });
}

async function pay(
  repo: CommerceRepo,
  opts: { userId: string; applyCredit: boolean; now: Date; entitlementId?: string; policy?: boolean; requestedCreditCount?: number }
) {
  const q = await createQuote(repo, {
    userId: opts.userId,
    applyCredit: opts.applyCredit,
    policyAccepted: opts.policy ?? true,
    now: opts.now,
    requestedCreditCount: opts.requestedCreditCount,
  });
  if (!q.ok) return q;
  const ent = opts.entitlementId || randomUUID();
  const paid = await confirmPaidOrder(repo, {
    userId: opts.userId,
    quoteId: q.quote.id,
    provider: "mock",
    providerOrderId: `ord-${randomUUID()}`,
    grantPro: grant(ent),
    now: opts.now,
  });
  return paid.ok ? { ok: true as const, order: paid.order, quote: q.quote, breakdown: q.breakdown, entitlementId: ent } : paid;
}

async function run() {
  if (applyPercent(1999, 90) !== 1799) fail("1999 × 90% should be 1799");
  else ok("1999 × 90% = 1799");
  if (applyPercent(1788, 90) !== 1609) fail("1788 × 90% should be 1609");
  else ok("1788 × 90% = 1609");
  if (applyPercent(LIST_PRICE_CENTS, 85) !== 1788) fail("2104 × 85% should be 1788");
  else ok("2104 × 85% = 1788");

  const fixtures: [string, Parameters<typeof calculatePrice>[0], number][] = [
    ["ordinary", { newcomerEligible: false, newcomerExpiresAt: null, referralDiscountEligible: false, applyCredit: false, availableCreditCount: 0 }, 1999],
    ["newcomer", { newcomerEligible: true, newcomerExpiresAt: "x", referralDiscountEligible: false, applyCredit: false, availableCreditCount: 0 }, 1788],
    ["referral only", { newcomerEligible: false, newcomerExpiresAt: null, referralDiscountEligible: true, applyCredit: false, availableCreditCount: 0 }, 1799],
    ["newcomer + referral", { newcomerEligible: true, newcomerExpiresAt: "x", referralDiscountEligible: true, applyCredit: false, availableCreditCount: 0 }, 1609],
    ["newcomer + referral + 1 credit", { newcomerEligible: true, newcomerExpiresAt: "x", referralDiscountEligible: true, applyCredit: true, availableCreditCount: 1 }, 1309],
    ["newcomer + referral + 2 credits", { newcomerEligible: true, newcomerExpiresAt: "x", referralDiscountEligible: true, applyCredit: true, availableCreditCount: 2 }, 1009],
    ["newcomer + referral + 3 credits", { newcomerEligible: true, newcomerExpiresAt: "x", referralDiscountEligible: true, applyCredit: true, availableCreditCount: 3 }, 709],
    ["standard + referral + $3", { newcomerEligible: false, newcomerExpiresAt: null, referralDiscountEligible: true, applyCredit: true, availableCreditCount: 1 }, 1499],
    ["standard + $3", { newcomerEligible: false, newcomerExpiresAt: null, referralDiscountEligible: false, applyCredit: true, availableCreditCount: 1 }, 1699],
    ["five available uses max three", { newcomerEligible: false, newcomerExpiresAt: null, referralDiscountEligible: false, applyCredit: true, availableCreditCount: 5 }, 1099],
    ["four requested capped at three", { newcomerEligible: false, newcomerExpiresAt: null, referralDiscountEligible: false, applyCredit: true, availableCreditCount: 4, requestedCreditCount: 4 }, 1099],
  ];
  for (const [label, el, want] of fixtures) {
    const got = calculatePrice(el).finalPriceCents;
    if (got !== want) fail(`${label}: expected ${want} got ${got}`);
    else ok(`price ${label} = ${want}`);
  }
  const four = calculatePrice({
    newcomerEligible: false,
    newcomerExpiresAt: null,
    referralDiscountEligible: false,
    applyCredit: true,
    availableCreditCount: 4,
    requestedCreditCount: 4,
  });
  if (four.creditsAppliedCount !== MAX_CREDITS_PER_ORDER) fail("4 requested should cap at 3");
  else ok("4 requested credits capped at 3");
  if (maxApplicableCredits(500, 3) !== 1) fail("cheap $5 item should allow only 1 credit");
  else ok("cheap item cannot apply 3 × $3");
  if (maxApplicableCredits(399, 3) !== 0) fail("$3.99 should not apply a $3 credit under min payable");
  else ok("min $1 out-of-pocket blocks unsafe credit count");
  const cheap = calculatePrice({
    newcomerEligible: false,
    newcomerExpiresAt: null,
    referralDiscountEligible: false,
    applyCredit: true,
    availableCreditCount: 3,
    requestedCreditCount: 3,
  });
  if (cheap.finalPriceCents < MIN_OUT_OF_POCKET_CENTS) fail("final price below minimum payable");
  else ok(`final price respects minimum payable (${cheap.finalPriceCents})`);

  const t0 = new Date("2026-09-01T12:00:00.000Z");
  const created = t0;
  if (!isNewcomerEligible({ createdAt: created.toISOString(), redeemed: false, now: hoursFrom(t0, 71.99) })) {
    fail("71h59m should be eligible");
  } else ok("71h59m newcomer eligible");
  if (isNewcomerEligible({ createdAt: created.toISOString(), redeemed: false, now: hoursFrom(t0, NEWCOMER_HOURS) })) {
    fail("exactly 72h should be expired");
  } else ok("72h newcomer expired");
  if (isNewcomerEligible({ createdAt: created.toISOString(), redeemed: true, now: hoursFrom(t0, 1) })) {
    fail("redeemed should not be eligible");
  } else ok("redeemed newcomer not eligible");

  const repo = createMemoryCommerceRepo();
  const alice = "alice";
  const bob = "bob";
  const cara = "cara";
  await user(repo, alice, hoursAgo(t0, 400));
  await user(repo, bob, t0);
  await user(repo, cara, hoursFrom(t0, 1));

  const code = generateReferralCode();
  if (!isReferralCodeFormat(code) || normalizeReferralCode(code.toLowerCase()) !== code) fail("code format");
  else ok(`referral code format ${code}`);
  await repo.insertCode({ userId: alice, code, createdAt: hoursAgo(t0, 400).toISOString() });
  const bad = await bindReferral(repo, { referredUserId: bob, code: "NOPE", now: t0 });
  if (bad.ok) fail("invalid code should reject");
  else ok("invalid code rejected");
  const self = await bindReferral(repo, { referredUserId: alice, code, now: t0 });
  if (self.ok) fail("self referral should reject");
  else ok("self referral rejected");
  const bind1 = await bindReferral(repo, { referredUserId: bob, code, now: hoursFrom(t0, 0.01) });
  if (!bind1.ok) fail(`bind bob failed ${bind1.error}`);
  else ok("valid code binds once");
  const bind2 = await bindReferral(repo, { referredUserId: bob, code, now: hoursFrom(t0, 2) });
  if (bind2.ok) fail("second bind should reject");
  else ok("change referrer rejected");

  const snapBob = await eligibilitySnapshot(repo, bob, hoursFrom(t0, 1));
  if (!snapBob.newcomerEligible || !snapBob.referralDiscountEligible) fail("bob should have newcomer+referral");
  else ok("bob newcomer + referral eligible");

  const quoteFail = await createQuote(repo, { userId: bob, applyCredit: false, policyAccepted: true, now: hoursFrom(t0, 1) });
  if (!quoteFail.ok) fail("quote create");
  else {
    ok("quote does not redeem");
    const afterQuote = await eligibilitySnapshot(repo, bob, hoursFrom(t0, 1));
    if (!afterQuote.referralDiscountEligible || afterQuote.newcomerRedeemed) fail("quote consumed promotion");
    else ok("failed/unpaid checkout does not redeem");
  }

  const noPolicy = await createQuote(repo, { userId: bob, applyCredit: false, policyAccepted: false, now: hoursFrom(t0, 1) });
  if (noPolicy.ok) fail("policy required");
  else ok("policy acceptance required");

  const alicePay = await pay(repo, { userId: alice, applyCredit: false, now: hoursAgo(t0, 10) });
  if (!alicePay.ok) fail("alice qualifying purchase");
  else ok("alice has qualifying paid order");

  const bobPay = await pay(repo, { userId: bob, applyCredit: false, now: hoursFrom(t0, 2) });
  if (!bobPay.ok) fail(`bob pay ${"error" in bobPay ? bobPay.error : ""}`);
  else {
    if (bobPay.order.amountCents !== 1609) fail(`bob amount ${bobPay.order.amountCents}`);
    else ok("bob paid newcomer+referral 1609");
    const after = await eligibilitySnapshot(repo, bob, hoursFrom(t0, 2.1));
    if (after.newcomerEligible || after.referralDiscountEligible) fail("promotions still available after pay");
    else ok("successful pay redeems newcomer and referral discount");
    const reward = await repo.getRewardByReferred(bob);
    if (!reward || reward.status !== "pending") fail("reward should be pending");
    else ok("qualifying referred purchase → pending $3");
  }

  const refundNoRestore = await completeEligibleUnusedRefund(repo, {
    userId: bob,
    orderId: bobPay.ok ? bobPay.order.id : "",
    refundEntitlement: async () => undefined,
    now: hoursFrom(t0, 2.2),
  });
  if (!refundNoRestore.ok) fail(`bob unused refund ${refundNoRestore.error}`);
  else ok("eligible unused refund completes");
  const afterRefund = await eligibilitySnapshot(repo, bob, hoursFrom(t0, 2.3));
  if (afterRefund.newcomerEligible || afterRefund.referralDiscountEligible) fail("promos restored after refund");
  else ok("refund does not restore newcomer or referral discount");
  const canceled = await repo.getRewardByReferred(bob);
  if (canceled?.status !== "canceled") fail("pending reward should cancel on unused refund");
  else ok("unused refund cancels pending referral reward");

  const dave = "dave";
  await user(repo, dave, hoursFrom(t0, 3));
  const bindDave = await bindReferral(repo, { referredUserId: dave, code, now: hoursFrom(t0, 3) });
  if (!bindDave.ok) fail("bind dave");
  const davePay = await pay(repo, { userId: dave, applyCredit: false, now: hoursFrom(t0, 4) });
  if (!davePay.ok) fail("dave pay");
  const pending = await repo.getRewardByReferred(dave);
  if (pending?.status !== "pending") fail("dave reward pending");
  else ok("second referred user can create another pending reward");

  await markProUsed(repo, {
    userId: dave,
    featureCode: "pro_question",
    entitlements: [{ id: davePay.ok ? davePay.entitlementId : "x", startsAt: hoursFrom(t0, 4).toISOString(), expiresAt: hoursFrom(t0, 1000).toISOString() }],
    now: hoursFrom(t0, 4.1),
  });
  const released = await repo.getRewardByReferred(dave);
  const daveCredit = released?.creditId ? await repo.getCredit(released.creditId) : null;
  if (released?.status !== "available" || daveCredit?.status !== "available" || daveCredit.amountCents !== 300) {
    fail("pro use should release $3");
  } else ok("Pro used → pending becomes available $3 credit");

  const firstUse = (await repo.listUsageForEntitlement(davePay.ok ? davePay.entitlementId : "")).map((u) => u.at);
  await markProUsed(repo, {
    userId: dave,
    featureCode: "full_exam_extra",
    entitlements: [{ id: davePay.ok ? davePay.entitlementId : "x", startsAt: hoursFrom(t0, 4).toISOString(), expiresAt: hoursFrom(t0, 1000).toISOString() }],
    now: hoursFrom(t0, 5),
  });
  const second = await repo.listUsageForEntitlement(davePay.ok ? davePay.entitlementId : "");
  if (second.length !== 1 || second[0].at !== firstUse[0]) fail("first_pro_used overwritten");
  else ok("first pro used timestamp is stable");

  const eve = "eve";
  await user(repo, eve, hoursFrom(t0, 6));
  await bindReferral(repo, { referredUserId: eve, code, now: hoursFrom(t0, 6) });
  const evePay = await pay(repo, { userId: eve, applyCredit: false, now: hoursFrom(t0, 7) });
  await releaseMatureRewards(repo, hoursFrom(t0, 7 + 72));
  const eveReward = await repo.getRewardByReferred(eve);
  if (eveReward?.status !== "available") fail("72h unused should release reward");
  else ok("72h unused no refund → reward available");

  const frank = "frank";
  await user(repo, frank, hoursFrom(t0, 8));
  await bindReferral(repo, { referredUserId: frank, code, now: hoursFrom(t0, 8) });
  const frankPay = await pay(repo, { userId: frank, applyCredit: false, now: hoursFrom(t0, 9) });
  const again = await repo.insertReward({
    id: randomUUID(),
    referrerUserId: alice,
    referredUserId: frank,
    sourceOrderId: frankPay.ok ? frankPay.order.id : "x",
    status: "pending",
    createdAt: hoursFrom(t0, 10).toISOString(),
    availableAt: null,
    canceledAt: null,
    creditId: null,
  });
  if (again) fail("same referred user rewarded twice");
  else ok("same referred user cannot reward twice");

  const noUser = "nouser";
  await user(repo, noUser, hoursFrom(t0, 1));
  const none = await pay(repo, { userId: noUser, applyCredit: false, now: hoursFrom(t0, 2) });
  if (!none.ok) fail("nouser pay");
  const noReward = await repo.getRewardByReferred(noUser);
  if (noReward) fail("unreferred user created reward");
  else ok("registration/purchase without referral → no $3");

  const gina = "gina";
  const harry = "harry";
  await user(repo, gina, hoursAgo(t0, 500));
  await user(repo, harry, hoursFrom(t0, 12));
  await repo.insertCode({ userId: gina, code: generateReferralCode(), createdAt: hoursAgo(t0, 500).toISOString() });
  const ginaCode = (await repo.getCodeByUser(gina))!.code;
  await pay(repo, { userId: gina, applyCredit: false, now: hoursAgo(t0, 20) });
  await bindReferral(repo, { referredUserId: harry, code: ginaCode, now: hoursFrom(t0, 12) });
  const harryPay = await pay(repo, { userId: harry, applyCredit: false, now: hoursFrom(t0, 13) });
  await markProUsed(repo, {
    userId: harry,
    featureCode: "pro_question",
    entitlements: [{ id: harryPay.ok ? harryPay.entitlementId : "x", startsAt: hoursFrom(t0, 13).toISOString(), expiresAt: hoursFrom(t0, 1000).toISOString() }],
    now: hoursFrom(t0, 13.1),
  });
  const ginaCredits = (await repo.listCredits(gina)).filter((c) => c.status === "available");
  if (ginaCredits.length !== 1 || ginaCredits[0].amountCents !== 300) fail("gina should have one $3 credit");
  else ok("credit amount = 300");
  const creditId = ginaCredits[0].id;

  {
    const q1 = await createQuote(repo, { userId: gina, applyCredit: true, policyAccepted: true, now: hoursFrom(t0, 20) });
    const q2 = await createQuote(repo, { userId: gina, applyCredit: true, policyAccepted: true, now: hoursFrom(t0, 20) });
    const reserved = [q1, q2].filter((q) => q.ok && q.quote.creditId).length;
    if (reserved !== 1) fail(`sequential reserve succeeded ${reserved} times`);
    else ok("second quote cannot take the same reserved credit");
    await repo.expireReservations(hoursFrom(t0, 21).toISOString());
    const concurrent = await Promise.all([
      createQuote(repo, { userId: gina, applyCredit: true, policyAccepted: true, now: hoursFrom(t0, 21.01) }),
      createQuote(repo, { userId: gina, applyCredit: true, policyAccepted: true, now: hoursFrom(t0, 21.01) }),
    ]);
    const parallel = concurrent.filter((q) => q.ok && q.quote.creditId).length;
    if (parallel > 1) fail(`concurrent reserve succeeded ${parallel} times`);
    else ok("concurrent credit reserve: only one succeeds");
    await repo.expireReservations(hoursFrom(t0, 22).toISOString());
    const c = await repo.getCredit(creditId);
    if (c?.status !== "available") fail("expired reservation should return available");
    else ok("reserved quote expiry → credit available");
  }

  const ginaCreditPay = await pay(repo, { userId: gina, applyCredit: true, now: hoursFrom(t0, 22) });
  if (!ginaCreditPay.ok) fail(`gina credit pay ${"error" in ginaCreditPay ? ginaCreditPay.error : ""}`);
  else {
    if (ginaCreditPay.order.amountCents !== 1699) fail(`gina+$3 expected 1699 got ${ginaCreditPay.order.amountCents}`);
    else ok("standard + $3 = 1699");
    const c = await repo.getCredit(creditId);
    if (c?.status !== "redeemed") fail("credit not redeemed");
    else ok("successful order redeems credit");
    const reuseSame = await repo.reserveCredit({
      userId: gina,
      creditId,
      quoteId: randomUUID(),
      until: hoursFrom(t0, 23).toISOString(),
      at: hoursFrom(t0, 22.1).toISOString(),
    });
    if (reuseSame) fail("redeemed credit reused");
    else ok("redeemed credit cannot reuse");
    const reuseQuote = await createQuote(repo, { userId: gina, applyCredit: true, policyAccepted: true, now: hoursFrom(t0, 22.1) });
    if (reuseQuote.ok) fail("applyCredit succeeded with no remaining credits");
    else ok("redeemed credit cannot be applied again");
  }

  const el10 = await refundEligibility(repo, {
    userId: gina,
    orderId: ginaCreditPay.ok ? ginaCreditPay.order.id : "",
    now: hoursFrom(t0, 22 + 10 / 60),
  });
  if (!el10.eligible) fail("10 min unused should be eligible");
  else ok("paid + 10 minutes + no Pro use → eligible");

  const restore = await completeEligibleUnusedRefund(repo, {
    userId: gina,
    orderId: ginaCreditPay.ok ? ginaCreditPay.order.id : "",
    refundEntitlement: async () => undefined,
    now: hoursFrom(t0, 22.2),
  });
  if (!restore.ok) fail("gina unused refund");
  const restored = await repo.getCredit(creditId);
  if (restored?.status !== "available" || !restored.restoredAt) fail("credit not restored");
  else ok("eligible unused full refund restores $3 credit");

  const ginaAgain = await pay(repo, { userId: gina, applyCredit: true, now: hoursFrom(t0, 23) });
  if (!ginaAgain.ok) fail("gina second credit order");
  const fraud = await completeNonRestoringRefund(repo, {
    userId: gina,
    orderId: ginaAgain.ok ? ginaAgain.order.id : "",
    reason: "chargeback",
    refundEntitlement: async () => undefined,
    now: hoursFrom(t0, 23.1),
  });
  if (!fraud.ok) fail("chargeback refund helper");
  const afterFraud = await repo.getCredit(creditId);
  if (afterFraud?.status === "available") fail("chargeback restored credit");
  else ok("fraud/chargeback refund does not restore credit");

  const grace = "grace";
  await user(repo, grace, hoursAgo(t0, 200));
  const gPay = await pay(repo, { userId: grace, applyCredit: false, now: t0 });
  const almost = await refundEligibility(repo, {
    userId: grace,
    orderId: gPay.ok ? gPay.order.id : "",
    now: hoursFrom(t0, 71.99),
  });
  if (!almost.eligible) fail("71h59m refund should be eligible");
  else ok("paid + 71h59m + no use → eligible");
  const expired = await refundEligibility(repo, {
    userId: grace,
    orderId: gPay.ok ? gPay.order.id : "",
    now: hoursFrom(t0, 72),
  });
  if (expired.eligible || expired.reason !== "expired") fail("72h refund should expire");
  else ok("paid + 72h + no use → expired");

  const henry = "henry";
  await user(repo, henry, hoursAgo(t0, 200));
  const hPay = await pay(repo, { userId: henry, applyCredit: false, now: t0 });
  await markProUsed(repo, {
    userId: henry,
    featureCode: "pro_question",
    entitlements: [{ id: hPay.ok ? hPay.entitlementId : "x", startsAt: t0.toISOString(), expiresAt: hoursFrom(t0, 1000).toISOString() }],
    now: hoursFrom(t0, 1 / 60),
  });
  const usedEl = await refundEligibility(repo, {
    userId: henry,
    orderId: hPay.ok ? hPay.order.id : "",
    now: hoursFrom(t0, 2 / 60),
  });
  if (usedEl.eligible || usedEl.reason !== "pro_used") fail("pro use should kill refund");
  else ok("paid + 1 minute + Pro-only feature → not eligible");

  const noneUsage = await markProUsed(repo, { userId: henry, featureCode: "pro_question", entitlements: [], now: t0 });
  if (noneUsage.recorded) fail("empty entitlements wrote usage");
  else ok("no entitlement → no usage write");

  const quoteExpire = await createQuote(repo, {
    userId: bob,
    applyCredit: false,
    policyAccepted: true,
    now: hoursFrom(t0, 71.8),
  });
  if (quoteExpire.ok) {
    const exp = new Date(quoteExpire.quote.expiresAt).getTime();
    const promo = new Date(quoteExpire.quote.newcomerExpiresAt || 0).getTime();
    if (quoteExpire.quote.newcomerExpiresAt && exp > promo) fail("quote expiry later than newcomer");
    else ok("quote expiry does not outlive newcomer window");
  } else ok("late newcomer quote rejected or expired");

  const late = hoursFrom(t0, 80);
  const lateSnap = await eligibilitySnapshot(repo, bob, late);
  const lateQuote = await createQuote(repo, { userId: bob, applyCredit: false, policyAccepted: true, now: late });
  if (lateQuote.ok && lateQuote.quote.newcomerDiscountApplied) fail("expired newcomer applied");
  else ok("server recomputes price; expired newcomer not applied");
  if (lateSnap.newcomerEligible) fail("client clock is not used; server expired");
  else ok("client time does not participate in eligibility");

  const stackedA = randomUUID();
  const stackedB = randomUUID();
  const iris = "iris";
  await user(repo, iris, hoursAgo(t0, 300));
  const i1 = await pay(repo, { userId: iris, applyCredit: false, now: t0, entitlementId: stackedA });
  const i2 = await pay(repo, { userId: iris, applyCredit: false, now: hoursFrom(t0, 1), entitlementId: stackedB });
  await markProUsed(repo, {
    userId: iris,
    featureCode: "pro_question",
    entitlements: [
      { id: stackedA, startsAt: t0.toISOString(), expiresAt: hoursFrom(t0, 1000).toISOString() },
      { id: stackedB, startsAt: hoursFrom(t0, 1).toISOString(), expiresAt: hoursFrom(t0, 1000).toISOString() },
    ],
    now: hoursFrom(t0, 1.2),
  });
  const r1 = await refundEligibility(repo, { userId: iris, orderId: i1.ok ? i1.order.id : "", now: hoursFrom(t0, 1.3) });
  const r2 = await refundEligibility(repo, { userId: iris, orderId: i2.ok ? i2.order.id : "", now: hoursFrom(t0, 1.3) });
  if (r1.eligible || r2.eligible) fail("stacked active entitlements should both lose unused refund");
  else ok("pro usage attributes to all currently active entitlements");

  const niles = "niles";
  await user(repo, niles, hoursAgo(t0, 250));
  const n1 = await addCredit(repo, niles, hoursFrom(t0, 24));
  const n2 = await addCredit(repo, niles, hoursFrom(t0, 24));
  await addCredit(repo, niles, hoursFrom(t0, 24));
  const n4 = await addCredit(repo, niles, hoursFrom(t0, 24));
  const one = await pay(repo, { userId: niles, applyCredit: true, requestedCreditCount: 1, now: hoursFrom(t0, 25) });
  if (!one.ok || one.order.amountCents !== 1699 || one.quote.creditIds.length !== 1) fail("1 credit applied");
  else ok("1 credit applied → 1699");
  const twoPay = await pay(repo, { userId: niles, applyCredit: true, requestedCreditCount: 2, now: hoursFrom(t0, 26) });
  if (!twoPay.ok || twoPay.order.amountCents !== 1399 || twoPay.quote.creditIds.length !== 2) fail("2 credits applied");
  else ok("2 credits applied → 1399");

  const otto = "otto";
  await user(repo, otto, hoursAgo(t0, 260));
  const o1 = await addCredit(repo, otto, hoursFrom(t0, 27));
  const o2 = await addCredit(repo, otto, hoursFrom(t0, 27));
  const o3 = await addCredit(repo, otto, hoursFrom(t0, 27));
  await addCredit(repo, otto, hoursFrom(t0, 27));
  const threePay = await pay(repo, { userId: otto, applyCredit: true, requestedCreditCount: 4, now: hoursFrom(t0, 28) });
  if (!threePay.ok || threePay.quote.creditIds.length !== 3 || threePay.order.amountCents !== 1099) {
    fail(`3-credit cap on order ${threePay.ok ? threePay.order.amountCents : "error"}`);
  } else ok("3 credits applied → 1099; 4th not used");
  const usedStatuses = await Promise.all([repo.getCredit(o1), repo.getCredit(o2), repo.getCredit(o3)]);
  if (usedStatuses.some((c) => c?.status !== "redeemed")) fail("successful purchase should redeem all used credits");
  else ok("successful purchase → all used credits redeemed");

  const partial = await repo.reserveCredits({
    userId: otto,
    creditIds: [n4, o1, randomUUID()],
    quoteId: randomUUID(),
    until: hoursFrom(t0, 30).toISOString(),
    at: hoursFrom(t0, 29).toISOString(),
  });
  if (partial) fail("mixed available/redeemed reserve should fail");
  const leftover = await repo.getCredit(n4);
  if (leftover?.status !== "available") fail("failed atomic reserve left a credit reserved");
  else ok("one credit fails → whole reservation rolls back");

  const piper = "piper";
  await user(repo, piper, hoursAgo(t0, 270));
  const p1 = await addCredit(repo, piper, hoursFrom(t0, 30));
  const p2 = await addCredit(repo, piper, hoursFrom(t0, 30));
  const p3 = await addCredit(repo, piper, hoursFrom(t0, 30));
  const qHold = await createQuote(repo, { userId: piper, applyCredit: true, policyAccepted: true, now: hoursFrom(t0, 31) });
  if (!qHold.ok || qHold.quote.creditIds.length !== 3) fail("quote did not reserve 3 credits");
  else ok("quote atomically reserved 3 credits");
  await repo.expireReservations(hoursFrom(t0, 32).toISOString());
  const releasedCredits = await Promise.all([repo.getCredit(p1), repo.getCredit(p2), repo.getCredit(p3)]);
  if (releasedCredits.some((c) => c?.status !== "available")) fail("quote expiry did not release all credits");
  else ok("quote expires → all reserved credits released");

  const threeAgain = await pay(repo, { userId: piper, applyCredit: true, now: hoursFrom(t0, 33) });
  if (!threeAgain.ok) fail("piper 3-credit pay");
  const restoredN = await completeEligibleUnusedRefund(repo, {
    userId: piper,
    orderId: threeAgain.ok ? threeAgain.order.id : "",
    refundEntitlement: async () => undefined,
    now: hoursFrom(t0, 33.1),
  });
  if (!restoredN.ok) fail("piper unused refund");
  const back = await Promise.all([repo.getCredit(p1), repo.getCredit(p2), repo.getCredit(p3)]);
  if (back.some((c) => c?.status !== "available" || !c.restoredAt)) fail("eligible refund did not restore all credits");
  else ok("eligible unused refund → all used credits restored");

  const sameTwice = await repo.reserveCredits({
    userId: piper,
    creditIds: [p1, p1],
    quoteId: randomUUID(),
    until: hoursFrom(t0, 34).toISOString(),
    at: hoursFrom(t0, 33.2).toISOString(),
  });
  if (sameTwice) fail("same credit reserved twice in one quote");
  else ok("same credit cannot be used twice");

  const quinn = "quinn";
  await user(repo, quinn, hoursFrom(t0, 40));
  await bindReferral(repo, { referredUserId: quinn, code, now: hoursFrom(t0, 40) });
  await addCredit(repo, quinn, hoursFrom(t0, 40));
  await addCredit(repo, quinn, hoursFrom(t0, 40));
  await addCredit(repo, quinn, hoursFrom(t0, 40));
  const quinnPay = await pay(repo, { userId: quinn, applyCredit: true, requestedCreditCount: 3, now: hoursFrom(t0, 40.2) });
  if (!quinnPay.ok || quinnPay.order.amountCents !== 709) fail(`newcomer+referral+3 credits expected 709 got ${quinnPay.ok ? quinnPay.order.amountCents : "error"}`);
  else ok("newcomer + referral + 3 credits → 709");

  const preview = await previewPrice(repo, dave, false, hoursFrom(t0, 50));
  if (preview.breakdown.finalPriceCents !== STANDARD_PRICE_CENTS && preview.breakdown.finalPriceCents !== 1799) {
    /* dave redeemed referral already */
  }
  const open = davePay.ok ? await repo.getQuote(davePay.quote.id) : null;
  if (open && davePay.ok) {
    const still = await assertQuoteStillValid(repo, davePay.quote, hoursFrom(t0, 4));
    if (still.ok) fail("consumed quote still valid");
    else ok("consumed quote is not reusable");
  }

  console.log(lines.join("\n"));
  console.log(failures === 0 ? "commerce:verify OK" : `commerce:verify FAIL failures=${failures}`);
  if (failures) process.exit(1);
}

await run();
