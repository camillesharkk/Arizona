import postgres from "postgres";
import { randomUUID } from "crypto";
import type { ExamRow, QuestionStat, Store, UserRow } from "./types";

let client: ReturnType<typeof postgres> | null = null;

function db() {
  if (!client) {
    client = postgres(process.env.DATABASE_URL as string, {
      max: 1,
      ssl: process.env.DATABASE_URL?.includes("localhost") ? false : "require",
    });
  }
  return client;
}

let schemaReady = false;

async function assertSchema() {
  if (schemaReady) return;
  const sql = db();
  try {
    const rows = await sql`select id from schema_migrations where id = '001_init' limit 1`;
    if (!rows[0]) throw new Error("missing");
  } catch {
    throw new Error("Postgres schema is missing. Set DATABASE_URL and run: npm run db:migrate");
  }
  schemaReady = true;
}

function iso(v: unknown) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString();
  return String(v);
}

function dayStr(v: unknown) {
  if (v == null) return null;
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return String(v).slice(0, 10);
}

function mapUser(r: Record<string, unknown>): UserRow {
  return {
    id: String(r.id),
    email: String(r.email),
    passwordHash: String(r.password_hash),
    name: r.name ? String(r.name) : null,
    emailVerified: Boolean(r.email_verified),
    plan: r.plan === "pro" ? "pro" : "free",
    planStatus: String(r.plan_status),
    planExpiresAt: iso(r.plan_expires_at),
    billingCustomerId: r.billing_customer_id ? String(r.billing_customer_id) : null,
    billingSubscriptionId: r.billing_subscription_id ? String(r.billing_subscription_id) : null,
    emailDaily: Boolean(r.email_daily),
    emailWeekly: Boolean(r.email_weekly),
    emailExam: Boolean(r.email_exam),
    createdAt: iso(r.created_at) as string,
    lastLoginAt: iso(r.last_login_at),
    lastStudyAt: iso(r.last_study_at),
    streakDays: Number(r.streak_days || 0),
    lastStudyDate: dayStr(r.last_study_date),
    bestScore: r.best_score == null ? null : Number(r.best_score),
  };
}

function mapStat(r: Record<string, unknown>): QuestionStat {
  return {
    userId: String(r.user_id),
    questionId: String(r.question_id),
    topic: String(r.topic),
    bank: String(r.bank),
    chapter: String(r.chapter),
    firstCorrect: r.first_correct == null ? null : Boolean(r.first_correct),
    lastCorrect: r.last_correct == null ? null : Boolean(r.last_correct),
    wrongCount: Number(r.wrong_count),
    rightCount: Number(r.right_count),
    lastSelected: r.last_selected ? String(r.last_selected) : null,
    lastCorrectOption: r.last_correct_option ? String(r.last_correct_option) : null,
    firstAt: iso(r.first_at),
    lastAt: iso(r.last_at),
    mastered: Boolean(r.mastered),
    favorited: Boolean(r.favorited),
  };
}

export const pgStore: Store = {
  async getUserByEmail(email) {
    await assertSchema();
    const rows = await db()`select * from users where email = ${email} limit 1`;
    return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
  },
  async getUserById(id) {
    await assertSchema();
    const rows = await db()`select * from users where id = ${id} limit 1`;
    return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
  },
  async createUser(data) {
    await assertSchema();
    const id = randomUUID();
    const createdAt = new Date().toISOString();
    await db()`insert into users (id, email, password_hash, name, created_at)
      values (${id}, ${data.email}, ${data.passwordHash}, ${data.name}, ${createdAt})`;
    return (await this.getUserById(id))!;
  },
  async updateUser(id, patch) {
    const cur = await this.getUserById(id);
    if (!cur) throw new Error("not_found");
    const next = { ...cur, ...patch, id };
    await db()`update users set
      email = ${next.email},
      password_hash = ${next.passwordHash},
      name = ${next.name},
      email_verified = ${next.emailVerified},
      plan = ${next.plan},
      plan_status = ${next.planStatus},
      plan_expires_at = ${next.planExpiresAt},
      billing_customer_id = ${next.billingCustomerId},
      billing_subscription_id = ${next.billingSubscriptionId},
      email_daily = ${next.emailDaily},
      email_weekly = ${next.emailWeekly},
      email_exam = ${next.emailExam},
      last_login_at = ${next.lastLoginAt},
      last_study_at = ${next.lastStudyAt},
      streak_days = ${next.streakDays},
      last_study_date = ${next.lastStudyDate},
      best_score = ${next.bestScore},
      updated_at = ${new Date().toISOString()}
      where id = ${id}`;
    return next;
  },
  async putToken(row) {
    await assertSchema();
    await db()`delete from tokens where user_id = ${row.userId} and type = ${row.type}`;
    await db()`insert into tokens (token, type, user_id, expires_at)
      values (${row.token}, ${row.type}, ${row.userId}, ${row.expiresAt})`;
  },
  async takeToken(token, type) {
    await assertSchema();
    const rows = await db()`select * from tokens where token = ${token} and type = ${type} limit 1`;
    if (!rows[0]) return null;
    await db()`delete from tokens where token = ${token}`;
    const r = rows[0] as Record<string, unknown>;
    if (new Date(String(iso(r.expires_at))) < new Date()) return null;
    return { token, type, userId: String(r.user_id), expiresAt: iso(r.expires_at) as string };
  },
  async upsertStat(stat) {
    await assertSchema();
    await db()`insert into question_stats (
      user_id, question_id, topic, bank, chapter, first_correct, last_correct, wrong_count, right_count,
      last_selected, last_correct_option, first_at, last_at, mastered, favorited
    ) values (
      ${stat.userId}, ${stat.questionId}, ${stat.topic}, ${stat.bank}, ${stat.chapter},
      ${stat.firstCorrect}, ${stat.lastCorrect}, ${stat.wrongCount}, ${stat.rightCount},
      ${stat.lastSelected}, ${stat.lastCorrectOption}, ${stat.firstAt}, ${stat.lastAt}, ${stat.mastered}, ${stat.favorited}
    ) on conflict (user_id, question_id) do update set
      last_correct = excluded.last_correct,
      wrong_count = excluded.wrong_count,
      right_count = excluded.right_count,
      last_selected = excluded.last_selected,
      last_correct_option = excluded.last_correct_option,
      last_at = excluded.last_at,
      mastered = excluded.mastered,
      favorited = excluded.favorited,
      updated_at = now()
      where question_stats.user_id = excluded.user_id`;
    return stat;
  },
  async getStat(userId, questionId) {
    await assertSchema();
    const rows = await db()`select * from question_stats where user_id = ${userId} and question_id = ${questionId} limit 1`;
    return rows[0] ? mapStat(rows[0] as Record<string, unknown>) : null;
  },
  async listStats(userId) {
    await assertSchema();
    const rows = await db()`select * from question_stats where user_id = ${userId}`;
    return rows.map((r) => mapStat(r as Record<string, unknown>));
  },
  async addExam(row: ExamRow) {
    await assertSchema();
    await db()`insert into exams (id, user_id, mode, score, correct_count, total, at)
      values (${row.id}, ${row.userId}, ${row.mode}, ${row.score}, ${row.correctCount}, ${row.total}, ${row.at})`;
  },
  async listExams(userId) {
    await assertSchema();
    const rows = await db()`select * from exams where user_id = ${userId} order by at desc`;
    return rows.map((r) => {
      const row = r as Record<string, unknown>;
      return {
        id: String(row.id),
        userId: String(row.user_id),
        mode: String(row.mode),
        score: Number(row.score),
        correctCount: Number(row.correct_count),
        total: Number(row.total),
        at: iso(row.at) as string,
      };
    });
  },
  async aiCount(userId, day) {
    await assertSchema();
    const rows = await db()`select n from ai_usage where user_id = ${userId} and day = ${day} limit 1`;
    return rows[0] ? Number((rows[0] as { n: number }).n) : 0;
  },
  async bumpAi(userId, day) {
    await assertSchema();
    await db()`insert into ai_usage (user_id, day, n) values (${userId}, ${day}, 1)
      on conflict (user_id, day) do update set n = ai_usage.n + 1, updated_at = now()
      where ai_usage.user_id = excluded.user_id`;
    return this.aiCount(userId, day);
  },
  async seenWebhook(id, provider) {
    await assertSchema();
    const inserted = await db()`
      insert into webhooks (id, provider, at)
      values (${id}, ${provider}, ${new Date().toISOString()})
      on conflict (provider, id) do nothing
      returning id
    `;
    return inserted.length === 0;
  },
};
