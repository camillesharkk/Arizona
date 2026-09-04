import { randomUUID } from "crypto";
import type {
  AccountDeletionTombstone,
  EmailType,
  EntitlementRow,
  EntitlementStatus,
  ExamRow,
  QuestionStat,
  Store,
  TokenRow,
  UserRow,
} from "./types.ts";

type Mem = {
  users: UserRow[];
  tokens: TokenRow[];
  stats: QuestionStat[];
  exams: ExamRow[];
  ai: { userId: string; day: string; n: number }[];
  webhooks: string[];
  emailLogs: { userId: string; emailType: EmailType; periodKey: string; status: string; messageId?: string | null }[];
  entitlements: EntitlementRow[];
  tombstones: AccountDeletionTombstone[];
};

function empty(): Mem {
  return {
    users: [],
    tokens: [],
    stats: [],
    exams: [],
    ai: [],
    webhooks: [],
    emailLogs: [],
    entitlements: [],
    tombstones: [],
  };
}

const locks = new Map<string, Promise<void>>();

async function withLock<T>(key: string, fn: () => T | Promise<T>): Promise<T> {
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

function freshUser(email: string, passwordHash: string, name: string | null): UserRow {
  return {
    id: randomUUID(),
    email,
    passwordHash,
    name,
    emailVerified: false,
    emailVerifiedAt: null,
    deletedAt: null,
    plan: "free",
    planStatus: "active",
    planExpiresAt: null,
    billingCustomerId: null,
    billingSubscriptionId: null,
    emailDaily: false,
    emailWeekly: false,
    emailExam: false,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
    lastStudyAt: null,
    streakDays: 0,
    lastStudyDate: null,
    bestScore: null,
    examDate: null,
  };
}

export function createMemoryStore(): Store {
  const db = empty();
  return {
    async getUserByEmail(email) {
      return db.users.find((u) => u.email === email && !u.deletedAt) ?? null;
    },
    async getUserById(id) {
      return db.users.find((u) => u.id === id) ?? null;
    },
    async createUser(data) {
      if (db.users.some((u) => u.email === data.email && !u.deletedAt)) throw new Error("email_taken");
      const user = freshUser(data.email, data.passwordHash, data.name);
      db.users.push(user);
      return user;
    },
    async updateUser(id, patch) {
      const i = db.users.findIndex((u) => u.id === id);
      if (i < 0) throw new Error("not_found");
      db.users[i] = { ...db.users[i], ...patch, id };
      return db.users[i];
    },
    async putToken(row) {
      db.tokens = db.tokens.filter((t) => !(t.userId === row.userId && t.type === row.type));
      db.tokens.push(row);
    },
    async takeToken(token, type) {
      const i = db.tokens.findIndex((t) => t.token === token && t.type === type);
      if (i < 0) return null;
      const row = db.tokens[i];
      db.tokens.splice(i, 1);
      if (new Date(row.expiresAt) < new Date()) return null;
      return row;
    },
    async upsertStat(stat) {
      const i = db.stats.findIndex((s) => s.userId === stat.userId && s.questionId === stat.questionId);
      if (i < 0) db.stats.push(stat);
      else db.stats[i] = { ...stat, userId: db.stats[i].userId };
      return stat;
    },
    async getStat(userId, questionId) {
      return db.stats.find((s) => s.userId === userId && s.questionId === questionId) ?? null;
    },
    async listStats(userId) {
      return db.stats.filter((s) => s.userId === userId);
    },
    async addExam(row) {
      db.exams.push(row);
    },
    async listExams(userId) {
      return db.exams.filter((e) => e.userId === userId);
    },
    async aiCount(userId, day) {
      return db.ai.find((a) => a.userId === userId && a.day === day)?.n ?? 0;
    },
    async bumpAi(userId, day) {
      const row = db.ai.find((a) => a.userId === userId && a.day === day);
      if (!row) {
        db.ai.push({ userId, day, n: 1 });
        return 1;
      }
      row.n += 1;
      return row.n;
    },
    async consumeAiQuota(userId, day, limit) {
      return withLock(`ai:${userId}:${day}`, () => {
        const row = db.ai.find((a) => a.userId === userId && a.day === day);
        const used = row?.n ?? 0;
        if (used >= limit) return { ok: false, used, limit, remaining: 0 };
        if (!row) {
          db.ai.push({ userId, day, n: 1 });
          return { ok: true, used: 1, limit, remaining: Math.max(0, limit - 1) };
        }
        row.n += 1;
        return { ok: true, used: row.n, limit, remaining: Math.max(0, limit - row.n) };
      });
    },
    async seenWebhook(id, provider) {
      const key = `${provider}:${id}`;
      if (db.webhooks.includes(key)) return true;
      db.webhooks.push(key);
      return false;
    },
    async listMailUsers() {
      return db.users.filter((u) => !u.deletedAt && u.emailVerified && (u.emailDaily || u.emailWeekly || u.emailExam));
    },
    async claimEmailSend(userId, emailType, periodKey) {
      if (db.emailLogs.some((l) => l.userId === userId && l.emailType === emailType && l.periodKey === periodKey)) {
        return false;
      }
      db.emailLogs.push({ userId, emailType, periodKey, status: "sending" });
      return true;
    },
    async finalizeEmailSend(userId, emailType, periodKey, result) {
      const i = db.emailLogs.findIndex(
        (l) => l.userId === userId && l.emailType === emailType && l.periodKey === periodKey
      );
      if (i < 0) return;
      if (result.status === "failed") {
        db.emailLogs.splice(i, 1);
        return;
      }
      db.emailLogs[i].status = "sent";
      db.emailLogs[i].messageId = result.messageId || null;
    },
    async getArizonaEntitlement(userId) {
      const now = Date.now();
      return (
        db.entitlements.find(
          (e) =>
            e.userId === userId &&
            e.state === "AZ" &&
            e.status === "active" &&
            new Date(e.startsAt).getTime() <= now &&
            new Date(e.expiresAt).getTime() > now
        ) ?? null
      );
    },
    async listActiveArizonaEntitlements(userId) {
      const now = Date.now();
      return db.entitlements.filter(
        (e) =>
          e.userId === userId &&
          e.state === "AZ" &&
          e.status === "active" &&
          new Date(e.startsAt).getTime() <= now &&
          new Date(e.expiresAt).getTime() > now
      );
    },
    async getLatestArizonaExpiry(userId) {
      const times = db.entitlements
        .filter((e) => e.userId === userId && e.state === "AZ" && e.status === "active")
        .map((e) => new Date(e.expiresAt).getTime());
      if (!times.length) return null;
      return new Date(Math.max(...times));
    },
    async getEntitlementByProviderOrder(provider, providerOrderId) {
      return db.entitlements.find((e) => e.provider === provider && e.providerOrderId === providerOrderId) ?? null;
    },
    async insertEntitlement(row) {
      const dup = db.entitlements.find((e) => e.provider === row.provider && e.providerOrderId === row.providerOrderId);
      if (dup) return dup;
      const now = new Date().toISOString();
      const next: EntitlementRow = { ...row, id: randomUUID(), createdAt: now, updatedAt: now };
      db.entitlements.push(next);
      return next;
    },
    async setEntitlementStatus(userId, provider, providerOrderId, status: EntitlementStatus) {
      const e = db.entitlements.find(
        (x) => x.userId === userId && x.provider === provider && x.providerOrderId === providerOrderId
      );
      if (e) {
        e.status = status;
        e.updatedAt = new Date().toISOString();
      }
    },
    async revokeActiveArizonaEntitlements(userId) {
      const at = new Date().toISOString();
      let n = 0;
      for (const e of db.entitlements) {
        if (e.userId === userId && e.state === "AZ" && e.status === "active") {
          e.status = "revoked";
          e.updatedAt = at;
          n += 1;
        }
      }
      return n;
    },
    async deleteTokensForUser(userId, type) {
      db.tokens = db.tokens.filter((t) => t.userId !== userId || (type && t.type !== type));
    },
    async clearLearningData(userId) {
      db.stats = db.stats.filter((s) => s.userId !== userId);
      db.exams = db.exams.filter((e) => e.userId !== userId);
      db.ai = db.ai.filter((a) => a.userId !== userId);
      db.emailLogs = db.emailLogs.filter((l) => l.userId !== userId);
    },
    async getTombstone(emailHmac) {
      return db.tombstones.find((t) => t.emailHmac === emailHmac) ?? null;
    },
    async upsertTombstone(row) {
      const i = db.tombstones.findIndex((t) => t.emailHmac === row.emailHmac);
      if (i < 0) db.tombstones.push(row);
      else {
        db.tombstones[i] = {
          ...row,
          newcomerUsedOrIneligible: true,
          referralDiscountUsedOrIneligible:
            db.tombstones[i].referralDiscountUsedOrIneligible || row.referralDiscountUsedOrIneligible,
          hadPaidOrder: db.tombstones[i].hadPaidOrder || row.hadPaidOrder,
        };
      }
    },
  };
}
