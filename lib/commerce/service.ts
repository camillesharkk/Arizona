import { randomUUID } from "crypto";
import {
  AZ_PRO_PRODUCT_CODE,
  CURRENCY,
  LIST_PRICE_CENTS,
  NEWCOMER_HOURS,
  POLICY_VERSION,
  PROMOTION_POLICY_VERSION,
  QUOTE_TTL_MS,
  REFERRAL_CREDIT_CENTS,
  REFUND_HOURS,
  REFUND_POLICY_VERSION,
  REWARD_HOLD_HOURS,
  STANDARD_PRICE_CENTS,
} from "../pricing/catalog.ts";
import { calculatePrice, type PriceBreakdown } from "../pricing/engine.ts";
import { addHours } from "../pricing/money.ts";
import { generateReferralCode, isReferralCodeFormat, normalizeReferralCode } from "./codes.ts";
import type { CommerceRepo } from "./repo.ts";
import type {
  CommerceOrderRow,
  PricingQuoteRow,
  RefundReason,
} from "./types.ts";

export type GrantProFn = (opts: {
  userId: string;
  provider: "mock" | "lemon_squeezy";
  providerOrderId: string;
}) => Promise<{ entitlement: { id: string } }>;

export type ActiveEntitlement = { id: string; startsAt: string; expiresAt: string };

export type ListActiveEntitlementsFn = (userId: string) => Promise<ActiveEntitlement[]>;

export type RefundEntitlementFn = (opts: {
  userId: string;
  provider: string;
  providerOrderId: string;
}) => Promise<void>;

export function newcomerWindow(createdAt: string): { expiresAt: Date; hours: number } {
  const expiresAt = addHours(createdAt, NEWCOMER_HOURS);
  return { expiresAt, hours: NEWCOMER_HOURS };
}

export function isNewcomerEligible(opts: {
  createdAt: string;
  redeemed: boolean;
  now: Date;
}): boolean {
  if (opts.redeemed) return false;
  return opts.now.getTime() < addHours(opts.createdAt, NEWCOMER_HOURS).getTime();
}

export async function ensureReferralCode(repo: CommerceRepo, userId: string, now = new Date()) {
  const existing = await repo.getCodeByUser(userId);
  if (existing) return existing;
  for (let i = 0; i < 8; i++) {
    const code = generateReferralCode();
    if (await repo.getCode(code)) continue;
    const row = { userId, code, createdAt: now.toISOString() };
    try {
      await repo.insertCode(row);
      return row;
    } catch {
      continue;
    }
  }
  throw new Error("referral_code_failed");
}

export async function validateReferralCode(repo: CommerceRepo, raw: string) {
  const code = normalizeReferralCode(raw);
  if (!isReferralCodeFormat(code)) return { valid: false as const };
  const row = await repo.getCode(code);
  if (!row) return { valid: false as const };
  return { valid: true as const, code: row.code };
}

export async function bindReferral(
  repo: CommerceRepo,
  opts: { referredUserId: string; code: string; now?: Date }
): Promise<{ ok: true; code: string } | { ok: false; error: string }> {
  const now = opts.now ?? new Date();
  const code = normalizeReferralCode(opts.code);
  if (!code) return { ok: false, error: "invalid_code" };
  if (!isReferralCodeFormat(code)) return { ok: false, error: "invalid_code" };
  const existing = await repo.getRelationshipByReferred(opts.referredUserId);
  if (existing) return { ok: false, error: "already_bound" };
  const found = await repo.getCode(code);
  if (!found) return { ok: false, error: "invalid_code" };
  if (found.userId === opts.referredUserId) return { ok: false, error: "self_referral" };
  const referrer = await repo.getUser(found.userId);
  const referred = await repo.getUser(opts.referredUserId);
  if (!referrer || !referred) return { ok: false, error: "invalid_code" };
  if (new Date(referrer.createdAt).getTime() >= new Date(referred.createdAt).getTime()) {
    return { ok: false, error: "self_referral" };
  }
  const inserted = await repo.insertRelationship({
    id: randomUUID(),
    referredUserId: opts.referredUserId,
    referrerUserId: found.userId,
    referralCode: found.code,
    createdAt: now.toISOString(),
    discountStatus: "available",
    discountRedeemedAt: null,
    discountRedeemedOrderId: null,
  });
  if (!inserted.ok) return { ok: false, error: "already_bound" };
  return { ok: true, code: found.code };
}

export async function eligibilitySnapshot(
  repo: CommerceRepo,
  userId: string,
  now = new Date()
) {
  await repo.expireReservations(now.toISOString());
  await releaseMatureRewards(repo, now);
  const user = await repo.getUser(userId);
  if (!user) throw new Error("user_not_found");
  const newcomerRedeemed = await repo.hasPromotionRedemption(userId, "newcomer");
  const newcomer = isNewcomerEligible({ createdAt: user.createdAt, redeemed: newcomerRedeemed, now });
  const rel = await repo.getRelationshipByReferred(userId);
  const referralDiscountEligible = Boolean(rel && rel.discountStatus === "available");
  const credits = await repo.listCredits(userId);
  const availableCredits = credits.filter((c) => c.status === "available");
  return {
    user,
    newcomerEligible: newcomer,
    newcomerExpiresAt: newcomer ? addHours(user.createdAt, NEWCOMER_HOURS).toISOString() : null,
    newcomerRedeemed,
    referralDiscountEligible,
    relationship: rel,
    availableCreditCount: availableCredits.length,
    availableCredits,
  };
}

export async function previewPrice(
  repo: CommerceRepo,
  userId: string,
  applyCredit: boolean,
  now = new Date(),
  requestedCreditCount?: number
) {
  const snap = await eligibilitySnapshot(repo, userId, now);
  return {
    snap,
    breakdown: calculatePrice({
      newcomerEligible: snap.newcomerEligible,
      newcomerExpiresAt: snap.newcomerExpiresAt,
      referralDiscountEligible: snap.referralDiscountEligible,
      applyCredit,
      availableCreditCount: snap.availableCreditCount,
      requestedCreditCount,
    }),
  };
}

export async function createQuote(
  repo: CommerceRepo,
  opts: { userId: string; applyCredit: boolean; policyAccepted: boolean; now?: Date; requestedCreditCount?: number }
): Promise<{ ok: true; quote: PricingQuoteRow; breakdown: PriceBreakdown } | { ok: false; error: string }> {
  const now = opts.now ?? new Date();
  if (!opts.policyAccepted) return { ok: false, error: "policy_required" };
  const { snap, breakdown } = await previewPrice(repo, opts.userId, opts.applyCredit, now, opts.requestedCreditCount);
  if (opts.applyCredit && !breakdown.creditApplied) {
    return { ok: false, error: "credit_unavailable" };
  }
  let creditIds: string[] = [];
  let expires = new Date(now.getTime() + QUOTE_TTL_MS);
  if (breakdown.newcomerApplied && snap.newcomerExpiresAt) {
    const promoEnd = new Date(snap.newcomerExpiresAt);
    if (promoEnd.getTime() < expires.getTime()) expires = promoEnd;
  }
  if (expires.getTime() <= now.getTime()) return { ok: false, error: "PRICE_CHANGED" };

  if (breakdown.creditsAppliedCount > 0) {
    creditIds = snap.availableCredits.slice(0, breakdown.creditsAppliedCount).map((c) => c.id);
    if (creditIds.length !== breakdown.creditsAppliedCount) return { ok: false, error: "credit_unavailable" };
  }

  const quote: PricingQuoteRow = {
    id: randomUUID(),
    userId: opts.userId,
    productCode: AZ_PRO_PRODUCT_CODE,
    currency: CURRENCY,
    listPriceCents: breakdown.listPriceCents,
    standardPriceCents: breakdown.standardPriceCents,
    baseAppliedPriceCents: breakdown.baseAppliedPriceCents,
    newcomerDiscountApplied: breakdown.newcomerApplied,
    newcomerDiscountCents: breakdown.newcomerDiscountCents,
    referralDiscountApplied: breakdown.referralApplied,
    referralDiscountCents: breakdown.referralDiscountCents,
    creditId: creditIds[0] ?? null,
    creditIds,
    creditCents: breakdown.creditCents,
    subtotalCents: breakdown.subtotalBeforeCreditCents,
    finalPriceCents: breakdown.finalPriceCents,
    newcomerExpiresAt: snap.newcomerExpiresAt,
    referralRelationshipId: snap.relationship?.id ?? null,
    policyVersion: POLICY_VERSION,
    refundPolicyVersion: REFUND_POLICY_VERSION,
    promotionPolicyVersion: PROMOTION_POLICY_VERSION,
    policyAcceptedAt: now.toISOString(),
    status: "open",
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    consumedAt: null,
    providerOrderId: null,
  };

  if (creditIds.length) {
    const reserved = await repo.reserveCredits({
      userId: opts.userId,
      creditIds,
      quoteId: quote.id,
      until: quote.expiresAt,
      at: now.toISOString(),
    });
    if (!reserved) return { ok: false, error: "credit_unavailable" };
  }

  await repo.insertQuote(quote);
  return { ok: true, quote, breakdown };
}

export async function abandonQuote(repo: CommerceRepo, quoteId: string) {
  await repo.releaseCreditsForQuote(quoteId);
  await repo.expireQuote(quoteId);
}

export async function assertQuoteStillValid(
  repo: CommerceRepo,
  quote: PricingQuoteRow,
  now = new Date()
): Promise<{ ok: true; breakdown: PriceBreakdown } | { ok: false; error: "PRICE_CHANGED" | "expired" }> {
  if (quote.status !== "open") return { ok: false, error: "expired" };
  if (quote.policyVersion !== POLICY_VERSION || quote.promotionPolicyVersion !== PROMOTION_POLICY_VERSION) {
    return { ok: false, error: "PRICE_CHANGED" };
  }
  if (new Date(quote.expiresAt).getTime() <= now.getTime()) {
    await repo.expireQuote(quote.id);
    await repo.releaseCreditsForQuote(quote.id);
    return { ok: false, error: "expired" };
  }
  const snap = await eligibilitySnapshot(repo, quote.userId, now);
  const quoteCreditIds = quote.creditIds?.length ? quote.creditIds : quote.creditId ? [quote.creditId] : [];
  const held = quoteCreditIds.length ? await repo.listCreditsForQuote(quote.id) : [];
  const creditHeld =
    quoteCreditIds.length === 0 ||
    (held.length === quoteCreditIds.length &&
      held.every(
        (c) =>
          c.userId === quote.userId &&
          c.status === "reserved" &&
          c.reservedQuoteId === quote.id &&
          quoteCreditIds.includes(c.id)
      ));
  if (!creditHeld) return { ok: false, error: "PRICE_CHANGED" };
  const breakdown = calculatePrice({
    newcomerEligible: snap.newcomerEligible,
    newcomerExpiresAt: snap.newcomerExpiresAt,
    referralDiscountEligible: snap.referralDiscountEligible,
    applyCredit: quoteCreditIds.length > 0,
    availableCreditCount: Math.max(snap.availableCreditCount, quoteCreditIds.length),
    requestedCreditCount: quoteCreditIds.length,
  });
  if (
    breakdown.newcomerApplied !== quote.newcomerDiscountApplied ||
    breakdown.referralApplied !== quote.referralDiscountApplied ||
    breakdown.creditsAppliedCount !== quoteCreditIds.length ||
    breakdown.finalPriceCents !== quote.finalPriceCents
  ) {
    return { ok: false, error: "PRICE_CHANGED" };
  }
  return { ok: true, breakdown };
}

export async function confirmPaidOrder(
  repo: CommerceRepo,
  opts: {
    userId: string;
    quoteId: string;
    provider: "mock" | "lemon_squeezy";
    providerOrderId: string;
    grantPro: GrantProFn;
    now?: Date;
  }
): Promise<{ ok: true; order: CommerceOrderRow; duplicate?: boolean } | { ok: false; error: string }> {
  const now = opts.now ?? new Date();
  const existing = await repo.getOrderByProvider(opts.provider, opts.providerOrderId);
  if (existing) return { ok: true, order: existing, duplicate: true };

  const quote = await repo.getQuote(opts.quoteId);
  if (!quote || quote.userId !== opts.userId) return { ok: false, error: "quote_not_found" };
  const valid = await assertQuoteStillValid(repo, quote, now);
  if (!valid.ok) return { ok: false, error: valid.error };

  const consumed = await repo.consumeQuote(quote.id, opts.providerOrderId, now.toISOString());
  if (!consumed) return { ok: false, error: "quote_consumed" };

  const granted = await opts.grantPro({
    userId: opts.userId,
    provider: opts.provider,
    providerOrderId: opts.providerOrderId,
  });

  const order: CommerceOrderRow = {
    id: randomUUID(),
    userId: opts.userId,
    productCode: quote.productCode,
    quoteId: quote.id,
    entitlementId: granted.entitlement.id,
    status: "paid",
    paidAt: now.toISOString(),
    amountCents: quote.finalPriceCents,
    currency: quote.currency,
    provider: opts.provider,
    providerOrderId: opts.providerOrderId,
    newcomerApplied: quote.newcomerDiscountApplied,
    referralDiscountApplied: quote.referralDiscountApplied,
    creditId: quote.creditId,
    creditIds: quote.creditIds?.length ? quote.creditIds : quote.creditId ? [quote.creditId] : [],
    creditCents: quote.creditCents,
    policyVersion: quote.policyVersion,
    policyAcceptedAt: quote.policyAcceptedAt,
    refundedAt: null,
    refundReason: null,
    createdAt: now.toISOString(),
  };
  await repo.insertOrder(order);

  if (quote.newcomerDiscountApplied) {
    await repo.insertPromotionRedemption({
      id: randomUUID(),
      userId: opts.userId,
      kind: "newcomer",
      orderId: order.id,
      redeemedAt: now.toISOString(),
    });
  }
  if (quote.referralDiscountApplied) {
    await repo.insertPromotionRedemption({
      id: randomUUID(),
      userId: opts.userId,
      kind: "referral_discount",
      orderId: order.id,
      redeemedAt: now.toISOString(),
    });
    await repo.markReferralDiscountRedeemed(opts.userId, order.id, now.toISOString());
  }
  const quoteCreditIds = quote.creditIds?.length ? quote.creditIds : quote.creditId ? [quote.creditId] : [];
  if (quoteCreditIds.length) {
    const redeemed = await repo.redeemReservedCredits({
      quoteId: quote.id,
      orderId: order.id,
      at: now.toISOString(),
    });
    if (!redeemed) return { ok: false, error: "credit_redeem_failed" };
  }

  await maybeCreateReferralReward(repo, { referredUserId: opts.userId, order, now });
  return { ok: true, order };
}

async function maybeCreateReferralReward(
  repo: CommerceRepo,
  opts: { referredUserId: string; order: CommerceOrderRow; now: Date }
) {
  const rel = await repo.getRelationshipByReferred(opts.referredUserId);
  if (!rel) return;
  const qualified = await repo.hasQualifyingPaidOrder(rel.referrerUserId);
  if (!qualified) return;
  const prior = await repo.listOrders(opts.referredUserId);
  const paid = prior.filter((o) => o.status === "paid" || o.id === opts.order.id);
  const firstPaid = paid.sort((a, b) => a.paidAt.localeCompare(b.paidAt))[0];
  if (!firstPaid || firstPaid.id !== opts.order.id) return;

  const rewardId = randomUUID();
  const creditId = randomUUID();
  const inserted = await repo.insertReward({
    id: rewardId,
    referrerUserId: rel.referrerUserId,
    referredUserId: opts.referredUserId,
    sourceOrderId: opts.order.id,
    status: "pending",
    createdAt: opts.now.toISOString(),
    availableAt: null,
    canceledAt: null,
    creditId,
  });
  if (!inserted) return;
  await repo.insertCredit({
    id: creditId,
    userId: rel.referrerUserId,
    amountCents: REFERRAL_CREDIT_CENTS,
    sourceRewardId: rewardId,
    status: "pending",
    createdAt: opts.now.toISOString(),
    availableAt: null,
    reservedAt: null,
    reservedQuoteId: null,
    reservedUntil: null,
    redeemedAt: null,
    redeemedOrderId: null,
    reversedAt: null,
    restoredAt: null,
    reversedAfterRedemption: false,
  });
}

export function currentlyServingEntitlements(ents: ActiveEntitlement[], now = new Date()) {
  const t = now.getTime();
  return ents.filter((e) => new Date(e.startsAt).getTime() <= t && new Date(e.expiresAt).getTime() > t);
}

export async function markProUsed(
  repo: CommerceRepo,
  opts: {
    userId: string;
    featureCode: string;
    entitlements: ActiveEntitlement[];
    now?: Date;
  }
) {
  const now = opts.now ?? new Date();
  const serving = currentlyServingEntitlements(opts.entitlements, now);
  if (!serving.length) return { recorded: false };
  let recorded = false;
  for (const ent of serving) {
    const orders = await repo.listOrders(opts.userId);
    const order = orders.find((o) => o.entitlementId === ent.id && o.status === "paid") ?? null;
    const inserted = await repo.insertUsage({
      id: randomUUID(),
      userId: opts.userId,
      entitlementId: ent.id,
      orderId: order?.id ?? null,
      featureCode: opts.featureCode,
      at: now.toISOString(),
    });
    if (inserted) {
      recorded = true;
      if (order) await releaseRewardForOrder(repo, order.id, now);
    }
  }
  return { recorded };
}

export async function releaseRewardForOrder(repo: CommerceRepo, orderId: string, now: Date) {
  const reward = await repo.getRewardByOrder(orderId);
  if (!reward || reward.status !== "pending" || !reward.creditId) return;
  const credit = await repo.getCredit(reward.creditId);
  if (credit && credit.status === "pending") {
    const open = await repo.listOpenDebts(credit.userId);
    const debt = open[0];
    if (debt && debt.remainingCents >= credit.amountCents) {
      await repo.reversePendingCredit(credit.id, now.toISOString());
      await repo.applyDebtOffset({ debtId: debt.id, cents: credit.amountCents });
      await repo.setRewardReversed(reward.id, now.toISOString());
      return;
    }
    await repo.setCreditAvailable(credit.id, now.toISOString());
  }
  await repo.setRewardAvailable(reward.id, reward.creditId, now.toISOString());
}

export const REWARD_REVERSAL_REASONS: RefundReason[] = [
  "chargeback",
  "fraud",
  "provider_initiated",
  "legal_required",
];

export async function reverseReferralForInvalidatedOrder(
  repo: CommerceRepo,
  opts: { orderId: string; now?: Date }
) {
  const now = opts.now ?? new Date();
  const at = now.toISOString();
  const reward = await repo.getRewardByOrder(opts.orderId);
  if (!reward) return { ok: true as const, changed: false };
  if (reward.status === "reversed") return { ok: true as const, changed: false, idempotent: true as const };

  if (reward.creditId) {
    const credit = await repo.getCredit(reward.creditId);
    if (credit) {
      if (credit.status === "pending" || credit.status === "available" || credit.status === "reserved") {
        if (credit.status === "reserved" && credit.reservedQuoteId) {
          await repo.releaseCreditReservation(credit.id, credit.reservedQuoteId);
        }
        await repo.reversePendingCredit(credit.id, at);
      } else if (credit.status === "redeemed") {
        const existing = await repo.getDebtBySourceCredit(credit.id);
        if (!existing) {
          await repo.markCreditReversedAfterRedemption(credit.id, at);
          await repo.insertCreditDebt({
            id: randomUUID(),
            userId: credit.userId,
            sourceCreditId: credit.id,
            sourceRewardId: reward.id,
            sourceOrderId: reward.sourceOrderId,
            amountCents: credit.amountCents,
            remainingCents: credit.amountCents,
            createdAt: at,
          });
        }
      }
    }
  }
  await repo.setRewardReversed(reward.id, at);
  return { ok: true as const, changed: true };
}

export async function releaseMatureRewards(repo: CommerceRepo, now = new Date()) {
  const pending = await repo.listPendingRewards();
  for (const reward of pending) {
    const order = await repo.getOrder(reward.sourceOrderId);
    if (!order || order.status !== "paid") continue;
    const usage = order.entitlementId ? await repo.listUsageForEntitlement(order.entitlementId) : [];
    const used = usage.length > 0;
    const mature = now.getTime() >= addHours(order.paidAt, REWARD_HOLD_HOURS).getTime();
    if (used || mature) await releaseRewardForOrder(repo, order.id, now);
  }
}

export type RefundEligibility =
  | { eligible: true; remainingMs: number; order: CommerceOrderRow }
  | { eligible: false; reason: "not_found" | "already_refunded" | "expired" | "pro_used"; order?: CommerceOrderRow; usedAt?: string };

export async function refundEligibility(
  repo: CommerceRepo,
  opts: { userId: string; orderId: string; now?: Date }
): Promise<RefundEligibility> {
  const now = opts.now ?? new Date();
  const order = await repo.getOrder(opts.orderId);
  if (!order || order.userId !== opts.userId) return { eligible: false, reason: "not_found" };
  if (order.status === "refunded") return { eligible: false, reason: "already_refunded", order };
  const deadline = addHours(order.paidAt, REFUND_HOURS);
  if (now.getTime() >= deadline.getTime()) return { eligible: false, reason: "expired", order };
  if (order.entitlementId) {
    const usage = await repo.listUsageForEntitlement(order.entitlementId);
    if (usage.length) return { eligible: false, reason: "pro_used", order, usedAt: usage[0].at };
  }
  return { eligible: true, remainingMs: deadline.getTime() - now.getTime(), order };
}

export async function requestEligibleRefund(
  repo: CommerceRepo,
  opts: { userId: string; orderId: string; now?: Date }
) {
  const now = opts.now ?? new Date();
  const el = await refundEligibility(repo, opts);
  if (!el.eligible) return { ok: false as const, error: el.reason, eligibility: el };
  await repo.insertRefundRequest({
    id: randomUUID(),
    userId: opts.userId,
    orderId: opts.orderId,
    status: "pending_manual",
    reason: "user_unused_refund",
    createdAt: now.toISOString(),
    completedAt: null,
    note: "Awaiting payment-provider refund. Lemon is not connected yet.",
  });
  return { ok: true as const, eligibility: el };
}

export async function completeEligibleUnusedRefund(
  repo: CommerceRepo,
  opts: {
    userId: string;
    orderId: string;
    refundEntitlement: RefundEntitlementFn;
    now?: Date;
  }
) {
  const now = opts.now ?? new Date();
  const el = await refundEligibility(repo, { userId: opts.userId, orderId: opts.orderId, now });
  if (!el.eligible) return { ok: false as const, error: el.reason };
  const order = el.order;
  await opts.refundEntitlement({
    userId: order.userId,
    provider: order.provider,
    providerOrderId: order.providerOrderId,
  });
  await repo.markOrderRefunded(order.id, "user_unused_refund", now.toISOString());
  await repo.restoreRedeemedCreditsForOrder({ orderId: order.id, at: now.toISOString() });
  const reward = await repo.getRewardByOrder(order.id);
  if (reward && reward.status === "pending") {
    await repo.setRewardCanceled(reward.id, now.toISOString());
    if (reward.creditId) await repo.reversePendingCredit(reward.creditId, now.toISOString());
  }
  return { ok: true as const, order };
}

export async function completeNonRestoringRefund(
  repo: CommerceRepo,
  opts: {
    userId: string;
    orderId: string;
    reason: Exclude<RefundReason, "user_unused_refund">;
    refundEntitlement: RefundEntitlementFn;
    now?: Date;
  }
) {
  const now = opts.now ?? new Date();
  const order = await repo.getOrder(opts.orderId);
  if (!order || order.userId !== opts.userId) return { ok: false as const, error: "not_found" };
  if (order.status === "refunded") return { ok: false as const, error: "already_refunded" };
  await opts.refundEntitlement({
    userId: order.userId,
    provider: order.provider,
    providerOrderId: order.providerOrderId,
  });
  await repo.markOrderRefunded(order.id, opts.reason, now.toISOString());
  if (REWARD_REVERSAL_REASONS.includes(opts.reason)) {
    await reverseReferralForInvalidatedOrder(repo, { orderId: order.id, now });
  } else {
    const reward = await repo.getRewardByOrder(order.id);
    if (reward && reward.status === "pending") {
      await repo.setRewardCanceled(reward.id, now.toISOString());
      if (reward.creditId) await repo.reversePendingCredit(reward.creditId, now.toISOString());
    }
  }
  return { ok: true as const, order };
}

export { LIST_PRICE_CENTS, STANDARD_PRICE_CENTS };
