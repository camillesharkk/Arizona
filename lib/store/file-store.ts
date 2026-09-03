import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { EmailType, EntitlementRow, EntitlementStatus, ExamRow, QuestionStat, Store, TokenRow, UserRow } from "./types";

type FileDb = {
  users: UserRow[];
  tokens: TokenRow[];
  stats: QuestionStat[];
  exams: ExamRow[];
  ai: { userId: string; day: string; n: number }[];
  webhooks: string[];
  emailLogs: { userId: string; emailType: EmailType; periodKey: string; status: string; messageId?: string | null }[];
  entitlements: EntitlementRow[];
};

const empty = (): FileDb => ({
  users: [],
  tokens: [],
  stats: [],
  exams: [],
  ai: [],
  webhooks: [],
  emailLogs: [],
  entitlements: [],
});

const filePath = () => path.join(process.cwd(), ".data", "store.json");
let queue: Promise<void> = Promise.resolve();

async function load(): Promise<FileDb> {
  try {
    const raw = await readFile(filePath(), "utf8");
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

async function save(db: FileDb) {
  await mkdir(path.dirname(filePath()), { recursive: true });
  await writeFile(filePath(), JSON.stringify(db, null, 2));
}

function mutate<T>(fn: (db: FileDb) => Promise<T> | T): Promise<T> {
  const run = queue.then(async () => {
    const db = await load();
    const result = await fn(db);
    await save(db);
    return result;
  });
  queue = run.then(() => undefined).catch(() => undefined);
  return run;
}

function freshUser(email: string, passwordHash: string, name: string | null): UserRow {
  return {
    id: randomUUID(),
    email,
    passwordHash,
    name,
    emailVerified: false,
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

export const fileStore: Store = {
  async getUserByEmail(email) {
    const db = await load();
    return db.users.find((u) => u.email === email) ?? null;
  },
  async getUserById(id) {
    const db = await load();
    return db.users.find((u) => u.id === id) ?? null;
  },
  createUser(data) {
    return mutate((db) => {
      if (db.users.some((u) => u.email === data.email)) throw new Error("email_taken");
      const user = freshUser(data.email, data.passwordHash, data.name);
      db.users.push(user);
      return user;
    });
  },
  updateUser(id, patch) {
    return mutate((db) => {
      const i = db.users.findIndex((u) => u.id === id);
      if (i < 0) throw new Error("not_found");
      db.users[i] = { ...db.users[i], ...patch, id };
      return db.users[i];
    });
  },
  putToken(row) {
    return mutate((db) => {
      db.tokens = db.tokens.filter((t) => !(t.userId === row.userId && t.type === row.type));
      db.tokens.push(row);
    });
  },
  takeToken(token, type) {
    return mutate((db) => {
      const i = db.tokens.findIndex((t) => t.token === token && t.type === type);
      if (i < 0) return null;
      const row = db.tokens[i];
      db.tokens.splice(i, 1);
      if (new Date(row.expiresAt) < new Date()) return null;
      return row;
    });
  },
  upsertStat(stat) {
    return mutate((db) => {
      const i = db.stats.findIndex((s) => s.userId === stat.userId && s.questionId === stat.questionId);
      if (i < 0) db.stats.push(stat);
      else db.stats[i] = { ...stat, userId: db.stats[i].userId };
      return stat;
    });
  },
  async getStat(userId, questionId) {
    const db = await load();
    return db.stats.find((s) => s.userId === userId && s.questionId === questionId) ?? null;
  },
  async listStats(userId) {
    const db = await load();
    return db.stats.filter((s) => s.userId === userId);
  },
  addExam(row) {
    return mutate((db) => {
      db.exams.push(row);
    });
  },
  async listExams(userId) {
    const db = await load();
    return db.exams.filter((e) => e.userId === userId).sort((a, b) => b.at.localeCompare(a.at));
  },
  async aiCount(userId, day) {
    const db = await load();
    return db.ai.find((a) => a.userId === userId && a.day === day)?.n ?? 0;
  },
  bumpAi(userId, day) {
    return mutate((db) => {
      const row = db.ai.find((a) => a.userId === userId && a.day === day);
      if (!row) {
        db.ai.push({ userId, day, n: 1 });
        return 1;
      }
      row.n += 1;
      return row.n;
    });
  },
  seenWebhook(id, provider) {
    return mutate((db) => {
      const key = `${provider}:${id}`;
      if (db.webhooks.includes(key)) return true;
      db.webhooks.push(key);
      return false;
    });
  },
  async listMailUsers() {
    const db = await load();
    return db.users.filter((u) => u.emailVerified && (u.emailDaily || u.emailWeekly || u.emailExam));
  },
  claimEmailSend(userId, emailType, periodKey) {
    return mutate((db) => {
      const exists = db.emailLogs.some(
        (l) => l.userId === userId && l.emailType === emailType && l.periodKey === periodKey
      );
      if (exists) return false;
      db.emailLogs.push({ userId, emailType, periodKey, status: "sending" });
      return true;
    });
  },
  finalizeEmailSend(userId, emailType, periodKey, result) {
    return mutate((db) => {
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
    });
  },
  async getArizonaEntitlement(userId) {
    const db = await load();
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
    const db = await load();
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
    const db = await load();
    const times = db.entitlements
      .filter((e) => e.userId === userId && e.state === "AZ" && e.status === "active")
      .map((e) => new Date(e.expiresAt).getTime());
    if (!times.length) return null;
    return new Date(Math.max(...times));
  },
  async getEntitlementByProviderOrder(provider, providerOrderId) {
    const db = await load();
    return db.entitlements.find((e) => e.provider === provider && e.providerOrderId === providerOrderId) ?? null;
  },
  insertEntitlement(row) {
    return mutate((db) => {
      const dup = db.entitlements.find(
        (e) => e.provider === row.provider && e.providerOrderId === row.providerOrderId
      );
      if (dup) return dup;
      const now = new Date().toISOString();
      const next: EntitlementRow = {
        ...row,
        id: randomUUID(),
        createdAt: now,
        updatedAt: now,
      };
      db.entitlements.push(next);
      return next;
    });
  },
  setEntitlementStatus(userId, provider, providerOrderId, status: EntitlementStatus) {
    return mutate((db) => {
      const e = db.entitlements.find(
        (x) => x.userId === userId && x.provider === provider && x.providerOrderId === providerOrderId
      );
      if (e) {
        e.status = status;
        e.updatedAt = new Date().toISOString();
      }
    });
  },
};
