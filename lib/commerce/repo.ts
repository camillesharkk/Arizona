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
  ReferralRelationshipRow,
  ReferralRewardRow,
  RefundRequestRow,
} from "./types.ts";

export type CommerceRepo = {
  getUser(id: string): Promise<ClockUser | null>;
  putUser(user: ClockUser): Promise<void>;

  getCodeByUser(userId: string): Promise<ReferralCodeRow | null>;
  getCode(code: string): Promise<ReferralCodeRow | null>;
  insertCode(row: ReferralCodeRow): Promise<void>;

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
  reserveCredit(opts: {
    userId: string;
    creditId: string;
    quoteId: string;
    until: string;
    at: string;
  }): Promise<boolean>;
  releaseCreditReservation(creditId: string, quoteId: string): Promise<void>;
  expireReservations(nowIso: string): Promise<void>;
  redeemReservedCredit(opts: { creditId: string; quoteId: string; orderId: string; at: string }): Promise<boolean>;
  restoreRedeemedCredit(opts: { creditId: string; orderId: string; at: string }): Promise<boolean>;

  insertReward(row: ReferralRewardRow): Promise<boolean>;
  getRewardByReferred(referredUserId: string): Promise<ReferralRewardRow | null>;
  getRewardByOrder(orderId: string): Promise<ReferralRewardRow | null>;
  listRewardsForReferrer(referrerUserId: string): Promise<ReferralRewardRow[]>;
  listPendingRewards(): Promise<ReferralRewardRow[]>;
  setRewardAvailable(id: string, creditId: string, at: string): Promise<void>;
  setRewardCanceled(id: string, at: string): Promise<void>;
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

  insertUsage(row: ProUsageEventRow): Promise<boolean>;
  listUsageForEntitlement(entitlementId: string): Promise<ProUsageEventRow[]>;
  listUsageForUser(userId: string): Promise<ProUsageEventRow[]>;

  insertRefundRequest(row: RefundRequestRow): Promise<void>;
  listRefundRequests(userId: string): Promise<RefundRequestRow[]>;
  completeRefundRequest(id: string, at: string): Promise<void>;
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
  };
}

function hydrate(raw?: Record<string, unknown> | Mem): Mem {
  const base = empty();
  if (!raw) return base;
  return {
    users: Array.isArray(raw.users) ? (raw.users as Mem["users"]) : [],
    codes: Array.isArray(raw.codes) ? (raw.codes as Mem["codes"]) : [],
    relationships: Array.isArray(raw.relationships) ? (raw.relationships as Mem["relationships"]) : [],
    redemptions: Array.isArray(raw.redemptions) ? (raw.redemptions as Mem["redemptions"]) : [],
    credits: Array.isArray(raw.credits) ? (raw.credits as Mem["credits"]) : [],
    rewards: Array.isArray(raw.rewards) ? (raw.rewards as Mem["rewards"]) : [],
    quotes: Array.isArray(raw.quotes) ? (raw.quotes as Mem["quotes"]) : [],
    orders: Array.isArray(raw.orders) ? (raw.orders as Mem["orders"]) : [],
    usage: Array.isArray(raw.usage) ? (raw.usage as Mem["usage"]) : [],
    refunds: Array.isArray(raw.refunds) ? (raw.refunds as Mem["refunds"]) : [],
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
      db.codes.push(row);
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
      const i = db.credits.findIndex((c) => c.id === row.id);
      if (i >= 0) db.credits[i] = row;
      else db.credits.push(row);
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
      if (!c || c.status !== "pending") return false;
      c.status = "reversed";
      c.reversedAt = at;
      return true;
    },
    async reserveCredit(opts) {
      return withLock(`credit:${opts.creditId}`, () => {
        const c = db.credits.find((x) => x.id === opts.creditId);
        if (!c || c.userId !== opts.userId || c.status !== "available") return false;
        c.status = "reserved";
        c.reservedAt = opts.at;
        c.reservedQuoteId = opts.quoteId;
        c.reservedUntil = opts.until;
        return true;
      });
    },
    async releaseCreditReservation(creditId, quoteId) {
      const c = db.credits.find((x) => x.id === creditId);
      if (!c || c.reservedQuoteId !== quoteId || c.status !== "reserved") return;
      c.status = "available";
      c.reservedAt = null;
      c.reservedQuoteId = null;
      c.reservedUntil = null;
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
    async redeemReservedCredit(opts) {
      const c = db.credits.find((x) => x.id === opts.creditId);
      if (!c || c.status !== "reserved" || c.reservedQuoteId !== opts.quoteId) return false;
      c.status = "redeemed";
      c.redeemedAt = opts.at;
      c.redeemedOrderId = opts.orderId;
      return true;
    },
    async restoreRedeemedCredit(opts) {
      const c = db.credits.find((x) => x.id === opts.creditId);
      if (!c || c.status !== "redeemed" || c.redeemedOrderId !== opts.orderId) return false;
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
      if (!r || r.status !== "pending") return;
      r.status = "canceled";
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
  };

  return Object.assign(repo, {
    snapshot() {
      return db;
    },
  });
}

export { randomUUID };
