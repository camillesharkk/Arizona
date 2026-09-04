import { randomUUID } from "crypto";
import type {
  ClockUser,
  CommerceOrderRow,
  PricingQuoteRow,
  PromotionKind,
  PromotionRedemptionRow,
  ProUsageEventRow,
  ReferralCodeRow,
  ReferralCreditRow,
  ReferralCreditDebtRow,
  ReferralRelationshipRow,
  ReferralRewardRow,
  ProviderCheckoutBinding,
  RefundRequestRow,
} from "./types.ts";

export type CommerceRepo = {
  getUser(id: string): Promise<ClockUser | null>;
  putUser(user: ClockUser): Promise<void>;

  getCodeByUser(userId: string): Promise<ReferralCodeRow | null>;
  getCode(code: string): Promise<ReferralCodeRow | null>;
  insertCode(row: ReferralCodeRow): Promise<void>;
  disableReferralCode(userId: string, at: string): Promise<boolean>;

  getRelationshipByReferred(referredUserId: string): Promise<ReferralRelationshipRow | null>;
  insertRelationship(row: ReferralRelationshipRow): Promise<{ ok: true } | { ok: false; error: "already_bound" }>;
  markReferralDiscountRedeemed(referredUserId: string, orderId: string, at: string): Promise<boolean>;

  hasPromotionRedemption(userId: string, kind: PromotionKind): Promise<boolean>;
  insertPromotionRedemption(row: PromotionRedemptionRow): Promise<boolean>;

  listCredits(userId: string): Promise<ReferralCreditRow[]>;
  getCredit(id: string): Promise<ReferralCreditRow | null>;
  insertCredit(row: ReferralCreditRow): Promise<void>;
  setCreditAvailable(creditId: string, at: string): Promise<boolean>;
  reversePendingCredit(creditId: string, at: string): Promise<boolean>;
  reserveCredits(opts: {
    userId: string;
    creditIds: string[];
    quoteId: string;
    until: string;
    at: string;
  }): Promise<boolean>;
  reserveCredit(opts: {
    userId: string;
    creditId: string;
    quoteId: string;
    until: string;
    at: string;
  }): Promise<boolean>;
  releaseCreditsForQuote(quoteId: string): Promise<void>;
  releaseCreditReservation(creditId: string, quoteId: string): Promise<void>;
  listCreditsForQuote(quoteId: string): Promise<ReferralCreditRow[]>;
  expireReservations(nowIso: string): Promise<void>;
  redeemReservedCredits(opts: { quoteId: string; orderId: string; at: string }): Promise<boolean>;
  redeemReservedCredit(opts: { creditId: string; quoteId: string; orderId: string; at: string }): Promise<boolean>;
  restoreRedeemedCreditsForOrder(opts: { orderId: string; at: string }): Promise<number>;
  restoreRedeemedCredit(opts: { creditId: string; orderId: string; at: string }): Promise<boolean>;
  markCreditReversedAfterRedemption(creditId: string, at: string): Promise<boolean>;

  insertReward(row: ReferralRewardRow): Promise<boolean>;
  getReward(id: string): Promise<ReferralRewardRow | null>;
  getRewardByReferred(referredUserId: string): Promise<ReferralRewardRow | null>;
  getRewardByOrder(orderId: string): Promise<ReferralRewardRow | null>;
  listRewardsForReferrer(referrerUserId: string): Promise<ReferralRewardRow[]>;
  listPendingRewards(): Promise<ReferralRewardRow[]>;
  setRewardAvailable(id: string, creditId: string, at: string): Promise<void>;
  setRewardCanceled(id: string, at: string): Promise<void>;
  setRewardReversed(id: string, at: string): Promise<void>;
  attachRewardCredit(rewardId: string, creditId: string): Promise<void>;

  insertQuote(row: PricingQuoteRow): Promise<void>;
  getQuote(id: string): Promise<PricingQuoteRow | null>;
  consumeQuote(id: string, providerOrderId: string, at: string): Promise<boolean>;
  expireQuote(id: string): Promise<void>;

  insertOrder(row: CommerceOrderRow): Promise<void>;
  getOrder(id: string): Promise<CommerceOrderRow | null>;
  getOrderByProvider(provider: string, providerOrderId: string): Promise<CommerceOrderRow | null>;
  listOrders(userId: string): Promise<CommerceOrderRow[]>;
  markOrderRefunded(id: string, reason: CommerceOrderRow["refundReason"], at: string): Promise<void>;
  hasQualifyingPaidOrder(userId: string): Promise<boolean>;

  insertCreditDebt(row: ReferralCreditDebtRow): Promise<boolean>;
  getDebtBySourceCredit(sourceCreditId: string): Promise<ReferralCreditDebtRow | null>;
  listOpenDebts(userId: string): Promise<ReferralCreditDebtRow[]>;
  applyDebtOffset(opts: { debtId: string; cents: number }): Promise<void>;

  insertUsage(row: ProUsageEventRow): Promise<boolean>;
  listUsageForEntitlement(entitlementId: string): Promise<ProUsageEventRow[]>;
  listUsageForUser(userId: string): Promise<ProUsageEventRow[]>;

  insertRefundRequest(row: RefundRequestRow): Promise<void>;
  listRefundRequests(userId: string): Promise<RefundRequestRow[]>;
  completeRefundRequest(id: string, at: string): Promise<void>;

  getCheckoutBinding(quoteId: string): Promise<ProviderCheckoutBinding | null>;
  claimCheckoutBinding(opts: {
    quoteId: string;
    provider: string;
    expiresAt: string;
    now: string;
  }): Promise<{ created: boolean; binding: ProviderCheckoutBinding }>;
  completeCheckoutBinding(opts: {
    quoteId: string;
    providerCheckoutId: string;
    checkoutUrl: string;
  }): Promise<ProviderCheckoutBinding | null>;
  releaseCheckoutClaim(quoteId: string): Promise<void>;
};

type Mem = {
  users: ClockUser[];
  codes: ReferralCodeRow[];
  relationships: ReferralRelationshipRow[];
  redemptions: PromotionRedemptionRow[];
  credits: ReferralCreditRow[];
  rewards: ReferralRewardRow[];
  quotes: PricingQuoteRow[];
  orders: CommerceOrderRow[];
  usage: ProUsageEventRow[];
  refunds: RefundRequestRow[];
  debts: ReferralCreditDebtRow[];
  checkoutBindings: ProviderCheckoutBinding[];
};

function empty(): Mem {
  return {
    users: [],
    codes: [],
    relationships: [],
    redemptions: [],
    credits: [],
    rewards: [],
    quotes: [],
    orders: [],
    usage: [],
    refunds: [],
    debts: [],
    checkoutBindings: [],
  };
}

function hydrate(raw?: Record<string, unknown> | Mem): Mem {
  const base = empty();
  if (!raw) return base;
  return {
    users: Array.isArray(raw.users)
      ? (raw.users as ClockUser[]).map((u) => ({
          ...u,
          emailVerifiedAt: u.emailVerifiedAt ?? null,
        }))
      : [],
    codes: Array.isArray(raw.codes)
      ? (raw.codes as ReferralCodeRow[]).map((c) => ({ ...c, disabledAt: c.disabledAt ?? null }))
      : [],
    relationships: Array.isArray(raw.relationships) ? (raw.relationships as Mem["relationships"]) : [],
    redemptions: Array.isArray(raw.redemptions) ? (raw.redemptions as Mem["redemptions"]) : [],
    credits: Array.isArray(raw.credits)
      ? (raw.credits as ReferralCreditRow[]).map((c) => ({
          ...c,
          reversedAfterRedemption: Boolean(c.reversedAfterRedemption),
        }))
      : [],
    rewards: Array.isArray(raw.rewards) ? (raw.rewards as Mem["rewards"]) : [],
    quotes: Array.isArray(raw.quotes)
      ? (raw.quotes as PricingQuoteRow[]).map((q) => ({
          ...q,
          creditIds: q.creditIds?.length ? q.creditIds : q.creditId ? [q.creditId] : [],
        }))
      : [],
    orders: Array.isArray(raw.orders)
      ? (raw.orders as CommerceOrderRow[]).map((o) => ({
          ...o,
          creditIds: o.creditIds?.length ? o.creditIds : o.creditId ? [o.creditId] : [],
        }))
      : [],
    usage: Array.isArray(raw.usage) ? (raw.usage as Mem["usage"]) : [],
    refunds: Array.isArray(raw.refunds) ? (raw.refunds as Mem["refunds"]) : [],
    debts: Array.isArray(raw.debts) ? (raw.debts as Mem["debts"]) : [],
    checkoutBindings: Array.isArray((raw as Mem).checkoutBindings)
      ? ((raw as Mem).checkoutBindings as ProviderCheckoutBinding[])
      : [],
  };
}

export type MemoryCommerceRepo = CommerceRepo & { snapshot: () => Mem };

export function createMemoryCommerceRepo(raw?: Record<string, unknown> | Mem): MemoryCommerceRepo {
  const db = hydrate(raw);
  const locks = new Map<string, Promise<void>>();

  async function withLock<T>(key: string, fn: () => Promise<T> | T): Promise<T> {
    const prev = locks.get(key) ?? Promise.resolve();
    let release!: () => void;
    const next = new Promise<void>((r) => {
      release = r;
    });
    locks.set(key, prev.then(() => next));
    await prev;
    try {
      return await fn();
    } finally {
      release();
    }
  }

  const repo: CommerceRepo = {
    async getUser(id) {
      return db.users.find((u) => u.id === id) ?? null;
    },
    async putUser(user) {
      const i = db.users.findIndex((u) => u.id === user.id);
      if (i < 0) db.users.push(user);
      else db.users[i] = user;
    },
    async getCodeByUser(userId) {
      return db.codes.find((c) => c.userId === userId) ?? null;
    },
    async getCode(code) {
      return db.codes.find((c) => c.code === code) ?? null;
    },
    async insertCode(row) {
      if (db.codes.some((c) => c.code === row.code || c.userId === row.userId)) throw new Error("code_conflict");
      db.codes.push({ ...row, disabledAt: row.disabledAt ?? null });
    },
    async disableReferralCode(userId, at) {
      const c = db.codes.find((x) => x.userId === userId);
      if (!c || c.disabledAt) return false;
      c.disabledAt = at;
      return true;
    },
    async getRelationshipByReferred(referredUserId) {
      return db.relationships.find((r) => r.referredUserId === referredUserId) ?? null;
    },
    async insertRelationship(row) {
      if (db.relationships.some((r) => r.referredUserId === row.referredUserId)) return { ok: false, error: "already_bound" };
      db.relationships.push(row);
      return { ok: true };
    },
    async markReferralDiscountRedeemed(referredUserId, orderId, at) {
      const r = db.relationships.find((x) => x.referredUserId === referredUserId && x.discountStatus === "available");
      if (!r) return false;
      r.discountStatus = "redeemed";
      r.discountRedeemedAt = at;
      r.discountRedeemedOrderId = orderId;
      return true;
    },
    async hasPromotionRedemption(userId, kind) {
      return db.redemptions.some((r) => r.userId === userId && r.kind === kind);
    },
    async insertPromotionRedemption(row) {
      if (db.redemptions.some((r) => r.userId === row.userId && r.kind === row.kind)) return false;
      db.redemptions.push(row);
      return true;
    },
    async listCredits(userId) {
      return db.credits.filter((c) => c.userId === userId);
    },
    async getCredit(id) {
      return db.credits.find((c) => c.id === id) ?? null;
    },
    async insertCredit(row) {
      const next = { ...row, reversedAfterRedemption: Boolean(row.reversedAfterRedemption) };
      const i = db.credits.findIndex((c) => c.id === next.id);
      if (i >= 0) db.credits[i] = next;
      else db.credits.push(next);
    },
    async setCreditAvailable(creditId, at) {
      const c = db.credits.find((x) => x.id === creditId);
      if (!c || (c.status !== "pending" && c.status !== "reserved")) return false;
      c.status = "available";
      c.availableAt = c.availableAt || at;
      c.reservedAt = null;
      c.reservedQuoteId = null;
      c.reservedUntil = null;
      return true;
    },
    async reversePendingCredit(creditId, at) {
      const c = db.credits.find((x) => x.id === creditId);
      if (!c || (c.status !== "pending" && c.status !== "available" && c.status !== "reserved")) return false;
      c.status = "reversed";
      c.reversedAt = at;
      c.reservedAt = null;
      c.reservedQuoteId = null;
      c.reservedUntil = null;
      return true;
    },
    async reserveCredits(opts) {
      return withLock("credits:all", () => {
        const ids = [...new Set(opts.creditIds)];
        if (ids.length !== opts.creditIds.length) return false;
        const rows = ids.map((id) => db.credits.find((x) => x.id === id) ?? null);
        if (rows.some((c) => !c || c.userId !== opts.userId || c.status !== "available")) return false;
        for (const c of rows) {
          c!.status = "reserved";
          c!.reservedAt = opts.at;
          c!.reservedQuoteId = opts.quoteId;
          c!.reservedUntil = opts.until;
        }
        return true;
      });
    },
    async reserveCredit(opts) {
      return repo.reserveCredits({
        userId: opts.userId,
        creditIds: [opts.creditId],
        quoteId: opts.quoteId,
        until: opts.until,
        at: opts.at,
      });
    },
    async releaseCreditsForQuote(quoteId) {
      for (const c of db.credits) {
        if (c.reservedQuoteId === quoteId && c.status === "reserved") {
          c.status = "available";
          c.reservedAt = null;
          c.reservedQuoteId = null;
          c.reservedUntil = null;
        }
      }
    },
    async releaseCreditReservation(creditId, quoteId) {
      const c = db.credits.find((x) => x.id === creditId);
      if (!c || c.reservedQuoteId !== quoteId || c.status !== "reserved") return;
      c.status = "available";
      c.reservedAt = null;
      c.reservedQuoteId = null;
      c.reservedUntil = null;
    },
    async listCreditsForQuote(quoteId) {
      return db.credits.filter((c) => c.reservedQuoteId === quoteId);
    },
    async expireReservations(nowIso) {
      const now = new Date(nowIso).getTime();
      for (const c of db.credits) {
        if (c.status === "reserved" && c.reservedUntil && new Date(c.reservedUntil).getTime() <= now) {
          c.status = "available";
          c.reservedAt = null;
          c.reservedQuoteId = null;
          c.reservedUntil = null;
        }
      }
      for (const q of db.quotes) {
        if (q.status === "open" && new Date(q.expiresAt).getTime() <= now) q.status = "expired";
      }
    },
    async redeemReservedCredits(opts) {
      const rows = db.credits.filter((x) => x.reservedQuoteId === opts.quoteId && x.status === "reserved");
      if (!rows.length) return false;
      for (const c of rows) {
        c.status = "redeemed";
        c.redeemedAt = opts.at;
        c.redeemedOrderId = opts.orderId;
      }
      return true;
    },
    async redeemReservedCredit(opts) {
      const c = db.credits.find((x) => x.id === opts.creditId);
      if (!c || c.status !== "reserved" || c.reservedQuoteId !== opts.quoteId) return false;
      c.status = "redeemed";
      c.redeemedAt = opts.at;
      c.redeemedOrderId = opts.orderId;
      return true;
    },
    async restoreRedeemedCreditsForOrder(opts) {
      let n = 0;
      for (const c of db.credits) {
        if (c.status !== "redeemed" || c.redeemedOrderId !== opts.orderId || c.reversedAfterRedemption) continue;
        const reward = db.rewards.find((r) => r.id === c.sourceRewardId);
        if (reward?.status === "reversed") continue;
        c.status = "available";
        c.reversedAt = opts.at;
        c.restoredAt = opts.at;
        c.redeemedAt = null;
        c.redeemedOrderId = null;
        c.reservedAt = null;
        c.reservedQuoteId = null;
        c.reservedUntil = null;
        n += 1;
      }
      return n;
    },
    async restoreRedeemedCredit(opts) {
      const c = db.credits.find((x) => x.id === opts.creditId);
      if (!c || c.status !== "redeemed" || c.redeemedOrderId !== opts.orderId || c.reversedAfterRedemption) return false;
      const reward = db.rewards.find((r) => r.id === c.sourceRewardId);
      if (reward && (reward.status === "reversed" || reward.status === "canceled")) return false;
      c.status = "available";
      c.reversedAt = opts.at;
      c.restoredAt = opts.at;
      c.redeemedAt = null;
      c.redeemedOrderId = null;
      c.reservedAt = null;
      c.reservedQuoteId = null;
      c.reservedUntil = null;
      return true;
    },
    async markCreditReversedAfterRedemption(creditId, at) {
      const c = db.credits.find((x) => x.id === creditId);
      if (!c || c.status !== "redeemed") return false;
      c.reversedAfterRedemption = true;
      c.reversedAt = at;
      return true;
    },
    async insertReward(row) {
      if (db.rewards.some((r) => r.referredUserId === row.referredUserId || r.sourceOrderId === row.sourceOrderId)) {
        return false;
      }
      db.rewards.push(row);
      return true;
    },
    async getRewardByReferred(referredUserId) {
      return db.rewards.find((r) => r.referredUserId === referredUserId) ?? null;
    },
    async getReward(id) {
      return db.rewards.find((r) => r.id === id) ?? null;
    },
    async getRewardByOrder(orderId) {
      return db.rewards.find((r) => r.sourceOrderId === orderId) ?? null;
    },
    async listRewardsForReferrer(referrerUserId) {
      return db.rewards.filter((r) => r.referrerUserId === referrerUserId);
    },
    async listPendingRewards() {
      return db.rewards.filter((r) => r.status === "pending");
    },
    async setRewardAvailable(id, creditId, at) {
      const r = db.rewards.find((x) => x.id === id);
      if (!r || r.status !== "pending") return;
      r.status = "available";
      r.availableAt = at;
      r.creditId = creditId;
    },
    async setRewardCanceled(id, at) {
      const r = db.rewards.find((x) => x.id === id);
      if (!r || (r.status !== "pending" && r.status !== "available")) return;
      r.status = "canceled";
      r.canceledAt = at;
    },
    async setRewardReversed(id, at) {
      const r = db.rewards.find((x) => x.id === id);
      if (!r || r.status === "reversed") return;
      r.status = "reversed";
      r.canceledAt = at;
    },
    async attachRewardCredit(rewardId, creditId) {
      const r = db.rewards.find((x) => x.id === rewardId);
      if (r) r.creditId = creditId;
    },
    async insertQuote(row) {
      db.quotes.push(row);
    },
    async getQuote(id) {
      return db.quotes.find((q) => q.id === id) ?? null;
    },
    async consumeQuote(id, providerOrderId, at) {
      const q = db.quotes.find((x) => x.id === id);
      if (!q || q.status !== "open") return false;
      q.status = "consumed";
      q.consumedAt = at;
      q.providerOrderId = providerOrderId;
      return true;
    },
    async expireQuote(id) {
      const q = db.quotes.find((x) => x.id === id);
      if (q && q.status === "open") q.status = "expired";
    },
    async insertOrder(row) {
      db.orders.push(row);
    },
    async getOrder(id) {
      return db.orders.find((o) => o.id === id) ?? null;
    },
    async getOrderByProvider(provider, providerOrderId) {
      return db.orders.find((o) => o.provider === provider && o.providerOrderId === providerOrderId) ?? null;
    },
    async listOrders(userId) {
      return db.orders.filter((o) => o.userId === userId);
    },
    async markOrderRefunded(id, reason, at) {
      const o = db.orders.find((x) => x.id === id);
      if (!o) return;
      o.status = "refunded";
      o.refundedAt = at;
      o.refundReason = reason;
    },
    async hasQualifyingPaidOrder(userId) {
      return db.orders.some((o) => o.userId === userId && o.status === "paid");
    },
    async insertCreditDebt(row) {
      if (db.debts.some((d) => d.sourceCreditId === row.sourceCreditId)) return false;
      db.debts.push(row);
      return true;
    },
    async getDebtBySourceCredit(sourceCreditId) {
      return db.debts.find((d) => d.sourceCreditId === sourceCreditId) ?? null;
    },
    async listOpenDebts(userId) {
      return db.debts.filter((d) => d.userId === userId && d.remainingCents > 0);
    },
    async applyDebtOffset(opts) {
      const d = db.debts.find((x) => x.id === opts.debtId);
      if (!d) return;
      d.remainingCents = Math.max(0, d.remainingCents - opts.cents);
    },
    async insertUsage(row) {
      if (db.usage.some((u) => u.entitlementId === row.entitlementId)) return false;
      db.usage.push(row);
      return true;
    },
    async listUsageForEntitlement(entitlementId) {
      return db.usage.filter((u) => u.entitlementId === entitlementId);
    },
    async listUsageForUser(userId) {
      return db.usage.filter((u) => u.userId === userId);
    },
    async insertRefundRequest(row) {
      db.refunds.push(row);
    },
    async listRefundRequests(userId) {
      return db.refunds.filter((r) => r.userId === userId);
    },
    async completeRefundRequest(id, at) {
      const r = db.refunds.find((x) => x.id === id);
      if (!r) return;
      r.status = "completed";
      r.completedAt = at;
    },
    async getCheckoutBinding(quoteId) {
      return db.checkoutBindings.find((b) => b.quoteId === quoteId) ?? null;
    },
    async claimCheckoutBinding(opts) {
      return withLock(`checkout:${opts.quoteId}`, () => {
        const existing = db.checkoutBindings.find((b) => b.quoteId === opts.quoteId);
        const nowMs = new Date(opts.now).getTime();
        if (existing?.status === "ready" && existing.checkoutUrl) {
          return { created: false, binding: existing };
        }
        if (existing?.status === "creating") {
          const age = nowMs - new Date(existing.createdAt).getTime();
          if (age < 60_000) return { created: false, binding: existing };
        }
        if (existing) {
          existing.provider = opts.provider;
          existing.providerCheckoutId = null;
          existing.checkoutUrl = null;
          existing.status = "creating";
          existing.expiresAt = opts.expiresAt;
          existing.createdAt = opts.now;
          return { created: true, binding: existing };
        }
        const binding: ProviderCheckoutBinding = {
          quoteId: opts.quoteId,
          provider: opts.provider,
          providerCheckoutId: null,
          checkoutUrl: null,
          status: "creating",
          expiresAt: opts.expiresAt,
          createdAt: opts.now,
        };
        db.checkoutBindings.push(binding);
        return { created: true, binding };
      });
    },
    async completeCheckoutBinding(opts) {
      return withLock(`checkout:${opts.quoteId}`, () => {
        const row = db.checkoutBindings.find((b) => b.quoteId === opts.quoteId && b.status === "creating");
        if (!row) return null;
        row.providerCheckoutId = opts.providerCheckoutId;
        row.checkoutUrl = opts.checkoutUrl;
        row.status = "ready";
        return row;
      });
    },
    async releaseCheckoutClaim(quoteId) {
      return withLock(`checkout:${quoteId}`, () => {
        const i = db.checkoutBindings.findIndex((b) => b.quoteId === quoteId && b.status === "creating");
        if (i >= 0) db.checkoutBindings.splice(i, 1);
      });
    },
  };

  return Object.assign(repo, {
    snapshot() {
      return db;
    },
  });
}

export { randomUUID };
