import type { CommerceRepo } from "./repo.ts";
import type {
  ClockUser,
  CommerceOrderRow,
  PricingQuoteRow,
  PromotionKind,
  PromotionRedemptionRow,
  ProUsageEventRow,
  ReferralCodeRow,
  ReferralCreditRow,
  ReferralRelationshipRow,
  ReferralRewardRow,
  RefundRequestRow,
} from "./types.ts";

function iso(v: unknown) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function bool(v: unknown) {
  return Boolean(v);
}

function num(v: unknown) {
  return Number(v);
}

function mapCode(r: Record<string, unknown>): ReferralCodeRow {
  return { userId: String(r.user_id), code: String(r.code), createdAt: iso(r.created_at) as string };
}

function mapRel(r: Record<string, unknown>): ReferralRelationshipRow {
  return {
    id: String(r.id),
    referredUserId: String(r.referred_user_id),
    referrerUserId: String(r.referrer_user_id),
    referralCode: String(r.referral_code),
    createdAt: iso(r.created_at) as string,
    discountStatus: r.discount_status === "redeemed" ? "redeemed" : "available",
    discountRedeemedAt: iso(r.discount_redeemed_at),
    discountRedeemedOrderId: r.discount_redeemed_order_id ? String(r.discount_redeemed_order_id) : null,
  };
}

function mapCredit(r: Record<string, unknown>): ReferralCreditRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    amountCents: num(r.amount_cents),
    sourceRewardId: String(r.source_reward_id),
    status: String(r.status) as ReferralCreditRow["status"],
    createdAt: iso(r.created_at) as string,
    availableAt: iso(r.available_at),
    reservedAt: iso(r.reserved_at),
    reservedQuoteId: r.reserved_quote_id ? String(r.reserved_quote_id) : null,
    reservedUntil: iso(r.reserved_until),
    redeemedAt: iso(r.redeemed_at),
    redeemedOrderId: r.redeemed_order_id ? String(r.redeemed_order_id) : null,
    reversedAt: iso(r.reversed_at),
    restoredAt: iso(r.restored_at),
  };
}

function mapReward(r: Record<string, unknown>): ReferralRewardRow {
  return {
    id: String(r.id),
    referrerUserId: String(r.referrer_user_id),
    referredUserId: String(r.referred_user_id),
    sourceOrderId: String(r.source_order_id),
    status: String(r.status) as ReferralRewardRow["status"],
    createdAt: iso(r.created_at) as string,
    availableAt: iso(r.available_at),
    canceledAt: iso(r.canceled_at),
    creditId: r.credit_id ? String(r.credit_id) : null,
  };
}

function mapQuote(r: Record<string, unknown>): PricingQuoteRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    productCode: String(r.product_code),
    currency: String(r.currency),
    listPriceCents: num(r.list_price_cents),
    standardPriceCents: num(r.standard_price_cents),
    baseAppliedPriceCents: num(r.base_applied_price_cents),
    newcomerDiscountApplied: bool(r.newcomer_discount_applied),
    newcomerDiscountCents: num(r.newcomer_discount_cents),
    referralDiscountApplied: bool(r.referral_discount_applied),
    referralDiscountCents: num(r.referral_discount_cents),
    creditId: r.credit_id ? String(r.credit_id) : null,
    creditCents: num(r.credit_cents),
    subtotalCents: num(r.subtotal_cents),
    finalPriceCents: num(r.final_price_cents),
    newcomerExpiresAt: iso(r.newcomer_expires_at),
    referralRelationshipId: r.referral_relationship_id ? String(r.referral_relationship_id) : null,
    policyVersion: String(r.policy_version),
    refundPolicyVersion: String(r.refund_policy_version),
    promotionPolicyVersion: String(r.promotion_policy_version),
    policyAcceptedAt: iso(r.policy_accepted_at),
    status: String(r.status) as PricingQuoteRow["status"],
    createdAt: iso(r.created_at) as string,
    expiresAt: iso(r.expires_at) as string,
    consumedAt: iso(r.consumed_at),
    providerOrderId: r.provider_order_id ? String(r.provider_order_id) : null,
  };
}

function mapOrder(r: Record<string, unknown>): CommerceOrderRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    productCode: String(r.product_code),
    quoteId: String(r.quote_id),
    entitlementId: r.entitlement_id ? String(r.entitlement_id) : null,
    status: String(r.status) as CommerceOrderRow["status"],
    paidAt: iso(r.paid_at) as string,
    amountCents: num(r.amount_cents),
    currency: String(r.currency),
    provider: String(r.provider),
    providerOrderId: String(r.provider_order_id),
    newcomerApplied: bool(r.newcomer_applied),
    referralDiscountApplied: bool(r.referral_discount_applied),
    creditId: r.credit_id ? String(r.credit_id) : null,
    creditCents: num(r.credit_cents),
    policyVersion: String(r.policy_version),
    policyAcceptedAt: iso(r.policy_accepted_at),
    refundedAt: iso(r.refunded_at),
    refundReason: r.refund_reason ? (String(r.refund_reason) as CommerceOrderRow["refundReason"]) : null,
    createdAt: iso(r.created_at) as string,
  };
}

function mapUsage(r: Record<string, unknown>): ProUsageEventRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    entitlementId: String(r.entitlement_id),
    orderId: r.order_id ? String(r.order_id) : null,
    featureCode: String(r.feature_code),
    at: iso(r.at) as string,
  };
}

function mapRefund(r: Record<string, unknown>): RefundRequestRow {
  return {
    id: String(r.id),
    userId: String(r.user_id),
    orderId: String(r.order_id),
    status: String(r.status) as RefundRequestRow["status"],
    reason: String(r.reason) as RefundRequestRow["reason"],
    createdAt: iso(r.created_at) as string,
    completedAt: iso(r.completed_at),
    note: r.note ? String(r.note) : null,
  };
}

function isUniqueViolation(err: unknown) {
  const e = err as { code?: string };
  return e.code === "23505";
}

export function createPgCommerceRepo(sql: any): CommerceRepo {
  return {
    async getUser(id) {
      const rows = await sql`select id, created_at from users where id = ${id} limit 1`;
      const r = rows[0];
      if (!r) return null;
      return { id: String(r.id), createdAt: iso(r.created_at) as string } satisfies ClockUser;
    },
    async putUser() {
      /* users live in the primary store */
    },
    async getCodeByUser(userId) {
      const rows = await sql`select * from referral_codes where user_id = ${userId} limit 1`;
      return rows[0] ? mapCode(rows[0]) : null;
    },
    async getCode(code) {
      const rows = await sql`select * from referral_codes where code = ${code} limit 1`;
      return rows[0] ? mapCode(rows[0]) : null;
    },
    async insertCode(row) {
      await sql`insert into referral_codes (user_id, code, created_at)
        values (${row.userId}, ${row.code}, ${row.createdAt})`;
    },
    async getRelationshipByReferred(referredUserId) {
      const rows = await sql`select * from referral_relationships where referred_user_id = ${referredUserId} limit 1`;
      return rows[0] ? mapRel(rows[0]) : null;
    },
    async insertRelationship(row) {
      try {
        await sql`insert into referral_relationships (
          id, referred_user_id, referrer_user_id, referral_code, created_at, discount_status
        ) values (
          ${row.id}, ${row.referredUserId}, ${row.referrerUserId}, ${row.referralCode},
          ${row.createdAt}, ${row.discountStatus}
        )`;
        return { ok: true as const };
      } catch (err) {
        if (isUniqueViolation(err)) return { ok: false as const, error: "already_bound" as const };
        throw err;
      }
    },
    async markReferralDiscountRedeemed(referredUserId, orderId, at) {
      const rows = await sql`
        update referral_relationships
        set discount_status = 'redeemed',
            discount_redeemed_at = ${at},
            discount_redeemed_order_id = ${orderId}
        where referred_user_id = ${referredUserId} and discount_status = 'available'
        returning id
      `;
      return rows.length > 0;
    },
    async hasPromotionRedemption(userId, kind) {
      const rows = await sql`select 1 from promotion_redemptions where user_id = ${userId} and kind = ${kind} limit 1`;
      return rows.length > 0;
    },
    async insertPromotionRedemption(row: PromotionRedemptionRow) {
      const inserted = await sql`
        insert into promotion_redemptions (id, user_id, kind, order_id, redeemed_at)
        values (${row.id}, ${row.userId}, ${row.kind}, ${row.orderId}, ${row.redeemedAt})
        on conflict (user_id, kind) do nothing
        returning id
      `;
      return inserted.length > 0;
    },
    async listCredits(userId) {
      const rows = await sql`select * from referral_credits where user_id = ${userId}`;
      return rows.map(mapCredit);
    },
    async getCredit(id) {
      const rows = await sql`select * from referral_credits where id = ${id} limit 1`;
      return rows[0] ? mapCredit(rows[0]) : null;
    },
    async insertCredit(row) {
      await sql`insert into referral_credits (
        id, user_id, amount_cents, source_reward_id, status, created_at, available_at,
        reserved_at, reserved_quote_id, reserved_until, redeemed_at, redeemed_order_id, reversed_at, restored_at
      ) values (
        ${row.id}, ${row.userId}, ${row.amountCents}, ${row.sourceRewardId}, ${row.status}, ${row.createdAt},
        ${row.availableAt}, ${row.reservedAt}, ${row.reservedQuoteId}, ${row.reservedUntil},
        ${row.redeemedAt}, ${row.redeemedOrderId}, ${row.reversedAt}, ${row.restoredAt}
      )
      on conflict (id) do update set
        status = excluded.status,
        available_at = excluded.available_at,
        reserved_at = excluded.reserved_at,
        reserved_quote_id = excluded.reserved_quote_id,
        reserved_until = excluded.reserved_until,
        redeemed_at = excluded.redeemed_at,
        redeemed_order_id = excluded.redeemed_order_id,
        reversed_at = excluded.reversed_at,
        restored_at = excluded.restored_at`;
    },
    async setCreditAvailable(creditId, at) {
      const rows = await sql`
        update referral_credits
        set status = 'available',
            available_at = coalesce(available_at, ${at}::timestamptz),
            reserved_at = null,
            reserved_quote_id = null,
            reserved_until = null
        where id = ${creditId} and status in ('pending', 'reserved')
        returning id
      `;
      return rows.length > 0;
    },
    async reversePendingCredit(creditId, at) {
      const rows = await sql`
        update referral_credits
        set status = 'reversed', reversed_at = ${at}
        where id = ${creditId} and status = 'pending'
        returning id
      `;
      return rows.length > 0;
    },
    async reserveCredit(opts) {
      const rows = await sql`
        update referral_credits
        set status = 'reserved',
            reserved_at = ${opts.at},
            reserved_quote_id = ${opts.quoteId},
            reserved_until = ${opts.until}
        where id = ${opts.creditId}
          and user_id = ${opts.userId}
          and status = 'available'
        returning id
      `;
      return rows.length > 0;
    },
    async releaseCreditReservation(creditId, quoteId) {
      await sql`
        update referral_credits
        set status = 'available',
            reserved_at = null,
            reserved_quote_id = null,
            reserved_until = null
        where id = ${creditId} and reserved_quote_id = ${quoteId} and status = 'reserved'
      `;
    },
    async expireReservations(nowIso) {
      await sql`
        update referral_credits
        set status = 'available',
            reserved_at = null,
            reserved_quote_id = null,
            reserved_until = null
        where status = 'reserved' and reserved_until is not null and reserved_until <= ${nowIso}::timestamptz
      `;
      await sql`
        update pricing_quotes
        set status = 'expired'
        where status = 'open' and expires_at <= ${nowIso}::timestamptz
      `;
    },
    async redeemReservedCredit(opts) {
      const rows = await sql`
        update referral_credits
        set status = 'redeemed',
            redeemed_at = ${opts.at},
            redeemed_order_id = ${opts.orderId}
        where id = ${opts.creditId} and status = 'reserved' and reserved_quote_id = ${opts.quoteId}
        returning id
      `;
      return rows.length > 0;
    },
    async restoreRedeemedCredit(opts) {
      const rows = await sql`
        update referral_credits
        set status = 'available',
            reversed_at = ${opts.at},
            restored_at = ${opts.at},
            redeemed_at = null,
            redeemed_order_id = null,
            reserved_at = null,
            reserved_quote_id = null,
            reserved_until = null
        where id = ${opts.creditId} and status = 'redeemed' and redeemed_order_id = ${opts.orderId}
        returning id
      `;
      return rows.length > 0;
    },
    async insertReward(row) {
      try {
        await sql`insert into referral_rewards (
          id, referrer_user_id, referred_user_id, source_order_id, status, created_at, available_at, canceled_at, credit_id
        ) values (
          ${row.id}, ${row.referrerUserId}, ${row.referredUserId}, ${row.sourceOrderId}, ${row.status},
          ${row.createdAt}, ${row.availableAt}, ${row.canceledAt}, ${row.creditId}
        )`;
        return true;
      } catch (err) {
        if (isUniqueViolation(err)) return false;
        throw err;
      }
    },
    async getRewardByReferred(referredUserId) {
      const rows = await sql`select * from referral_rewards where referred_user_id = ${referredUserId} limit 1`;
      return rows[0] ? mapReward(rows[0]) : null;
    },
    async getRewardByOrder(orderId) {
      const rows = await sql`select * from referral_rewards where source_order_id = ${orderId} limit 1`;
      return rows[0] ? mapReward(rows[0]) : null;
    },
    async listRewardsForReferrer(referrerUserId) {
      const rows = await sql`select * from referral_rewards where referrer_user_id = ${referrerUserId}`;
      return rows.map(mapReward);
    },
    async listPendingRewards() {
      const rows = await sql`select * from referral_rewards where status = 'pending'`;
      return rows.map(mapReward);
    },
    async setRewardAvailable(id, creditId, at) {
      await sql`
        update referral_rewards
        set status = 'available', available_at = ${at}, credit_id = ${creditId}
        where id = ${id} and status = 'pending'
      `;
    },
    async setRewardCanceled(id, at) {
      await sql`
        update referral_rewards
        set status = 'canceled', canceled_at = ${at}
        where id = ${id} and status = 'pending'
      `;
    },
    async attachRewardCredit(rewardId, creditId) {
      await sql`update referral_rewards set credit_id = ${creditId} where id = ${rewardId}`;
    },
    async insertQuote(row) {
      await sql`insert into pricing_quotes (
        id, user_id, product_code, currency, list_price_cents, standard_price_cents, base_applied_price_cents,
        newcomer_discount_applied, newcomer_discount_cents, referral_discount_applied, referral_discount_cents,
        credit_id, credit_cents, subtotal_cents, final_price_cents, newcomer_expires_at, referral_relationship_id,
        policy_version, refund_policy_version, promotion_policy_version, policy_accepted_at,
        status, created_at, expires_at, consumed_at, provider_order_id
      ) values (
        ${row.id}, ${row.userId}, ${row.productCode}, ${row.currency}, ${row.listPriceCents}, ${row.standardPriceCents},
        ${row.baseAppliedPriceCents}, ${row.newcomerDiscountApplied}, ${row.newcomerDiscountCents},
        ${row.referralDiscountApplied}, ${row.referralDiscountCents}, ${row.creditId}, ${row.creditCents},
        ${row.subtotalCents}, ${row.finalPriceCents}, ${row.newcomerExpiresAt}, ${row.referralRelationshipId},
        ${row.policyVersion}, ${row.refundPolicyVersion}, ${row.promotionPolicyVersion}, ${row.policyAcceptedAt},
        ${row.status}, ${row.createdAt}, ${row.expiresAt}, ${row.consumedAt}, ${row.providerOrderId}
      )`;
    },
    async getQuote(id) {
      const rows = await sql`select * from pricing_quotes where id = ${id} limit 1`;
      return rows[0] ? mapQuote(rows[0]) : null;
    },
    async consumeQuote(id, providerOrderId, at) {
      const rows = await sql`
        update pricing_quotes
        set status = 'consumed', consumed_at = ${at}, provider_order_id = ${providerOrderId}
        where id = ${id} and status = 'open'
        returning id
      `;
      return rows.length > 0;
    },
    async expireQuote(id) {
      await sql`update pricing_quotes set status = 'expired' where id = ${id} and status = 'open'`;
    },
    async insertOrder(row) {
      await sql`insert into commerce_orders (
        id, user_id, product_code, quote_id, entitlement_id, status, paid_at, amount_cents, currency,
        provider, provider_order_id, newcomer_applied, referral_discount_applied, credit_id, credit_cents,
        policy_version, policy_accepted_at, refunded_at, refund_reason, created_at
      ) values (
        ${row.id}, ${row.userId}, ${row.productCode}, ${row.quoteId}, ${row.entitlementId}, ${row.status},
        ${row.paidAt}, ${row.amountCents}, ${row.currency}, ${row.provider}, ${row.providerOrderId},
        ${row.newcomerApplied}, ${row.referralDiscountApplied}, ${row.creditId}, ${row.creditCents},
        ${row.policyVersion}, ${row.policyAcceptedAt}, ${row.refundedAt}, ${row.refundReason}, ${row.createdAt}
      )`;
    },
    async getOrder(id) {
      const rows = await sql`select * from commerce_orders where id = ${id} limit 1`;
      return rows[0] ? mapOrder(rows[0]) : null;
    },
    async getOrderByProvider(provider, providerOrderId) {
      const rows = await sql`select * from commerce_orders where provider = ${provider} and provider_order_id = ${providerOrderId} limit 1`;
      return rows[0] ? mapOrder(rows[0]) : null;
    },
    async listOrders(userId) {
      const rows = await sql`select * from commerce_orders where user_id = ${userId} order by paid_at desc`;
      return rows.map(mapOrder);
    },
    async markOrderRefunded(id, reason, at) {
      await sql`
        update commerce_orders
        set status = 'refunded', refunded_at = ${at}, refund_reason = ${reason}
        where id = ${id}
      `;
    },
    async hasQualifyingPaidOrder(userId) {
      const rows = await sql`select 1 from commerce_orders where user_id = ${userId} and status = 'paid' limit 1`;
      return rows.length > 0;
    },
    async insertUsage(row: ProUsageEventRow) {
      const inserted = await sql`
        insert into pro_usage_events (id, user_id, entitlement_id, order_id, feature_code, at)
        values (${row.id}, ${row.userId}, ${row.entitlementId}, ${row.orderId}, ${row.featureCode}, ${row.at})
        on conflict (entitlement_id) do nothing
        returning id
      `;
      return inserted.length > 0;
    },
    async listUsageForEntitlement(entitlementId) {
      const rows = await sql`select * from pro_usage_events where entitlement_id = ${entitlementId} order by at asc`;
      return (rows as Record<string, unknown>[]).map(mapUsage);
    },
    async listUsageForUser(userId) {
      const rows = await sql`select * from pro_usage_events where user_id = ${userId} order by at asc`;
      return (rows as Record<string, unknown>[]).map(mapUsage);
    },
    async insertRefundRequest(row: RefundRequestRow) {
      await sql`insert into refund_requests (id, user_id, order_id, status, reason, created_at, completed_at, note)
        values (${row.id}, ${row.userId}, ${row.orderId}, ${row.status}, ${row.reason}, ${row.createdAt}, ${row.completedAt}, ${row.note})`;
    },
    async listRefundRequests(userId) {
      const rows = await sql`select * from refund_requests where user_id = ${userId} order by created_at desc`;
      return (rows as Record<string, unknown>[]).map(mapRefund);
    },
    async completeRefundRequest(id, at) {
      await sql`update refund_requests set status = 'completed', completed_at = ${at} where id = ${id}`;
    },
  };
}

export type { PromotionKind };
