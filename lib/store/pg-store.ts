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

let migrated = false;

async function migrate() {
  if (migrated) return;
  const sql = db();
  await sql.unsafe(`
    create table if not exists users (
      id text primary key,
      email text unique not null,
      password_hash text not null,
      name text,
      email_verified boolean not null default false,
      plan text not null default 'free',
      plan_status text not null default 'active',
      plan_expires_at text,
      billing_customer_id text,
      billing_subscription_id text,
      email_daily boolean not null default false,
      email_weekly boolean not null default false,
      email_exam boolean not null default false,
      created_at text not null,
      last_login_at text,
      last_study_at text,
      streak_days integer not null default 0,
      last_study_date text,
      best_score integer
    );
    create table if not exists tokens (
      token text primary key,
      type text not null,
      user_id text not null,
      expires_at text not null
    );
    create table if not exists question_stats (
      user_id text not null,
      question_id text not null,
      topic text not null,
      bank text not null,
      chapter text not null,
      first_correct boolean,
      last_correct boolean,
      wrong_count integer not null default 0,
      right_count integer not null default 0,
      last_selected text,
      last_correct_option text,
      first_at text,
      last_at text,
      mastered boolean not null default false,
      favorited boolean not null default false,
      primary key (user_id, question_id)
    );
    create table if not exists exams (
      id text primary key,
      user_id text not null,
      mode text not null,
      score integer not null,
      correct_count integer not null,
      total integer not null,
      at text not null
    );
    create table if not exists ai_usage (
      user_id text not null,
      day text not null,
      n integer not null,
      primary key (user_id, day)
    );
    create table if not exists webhooks (
      id text primary key,
      provider text not null,
      at text not null
    );
  `);
  migrated = true;
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
    planExpiresAt: r.plan_expires_at ? String(r.plan_expires_at) : null,
    billingCustomerId: r.billing_customer_id ? String(r.billing_customer_id) : null,
    billingSubscriptionId: r.billing_subscription_id ? String(r.billing_subscription_id) : null,
    emailDaily: Boolean(r.email_daily),
    emailWeekly: Boolean(r.email_weekly),
    emailExam: Boolean(r.email_exam),
    createdAt: String(r.created_at),
    lastLoginAt: r.last_login_at ? String(r.last_login_at) : null,
    lastStudyAt: r.last_study_at ? String(r.last_study_at) : null,
    streakDays: Number(r.streak_days || 0),
    lastStudyDate: r.last_study_date ? String(r.last_study_date) : null,
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
    firstAt: r.first_at ? String(r.first_at) : null,
    lastAt: r.last_at ? String(r.last_at) : null,
    mastered: Boolean(r.mastered),
    favorited: Boolean(r.favorited),
  };
}

export const pgStore: Store = {
  async getUserByEmail(email) {
    await migrate();
    const rows = await db()`select * from users where email = ${email} limit 1`;
    return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
  },
  async getUserById(id) {
    await migrate();
    const rows = await db()`select * from users where id = ${id} limit 1`;
    return rows[0] ? mapUser(rows[0] as Record<string, unknown>) : null;
  },
  async createUser(data) {
    await migrate();
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
      best_score = ${next.bestScore}
      where id = ${id}`;
    return next;
  },
  async putToken(row) {
    await migrate();
    await db()`delete from tokens where user_id = ${row.userId} and type = ${row.type}`;
    await db()`insert into tokens (token, type, user_id, expires_at)
      values (${row.token}, ${row.type}, ${row.userId}, ${row.expiresAt})`;
  },
  async takeToken(token, type) {
    await migrate();
    const rows = await db()`select * from tokens where token = ${token} and type = ${type} limit 1`;
    if (!rows[0]) return null;
    await db()`delete from tokens where token = ${token}`;
    const r = rows[0] as Record<string, unknown>;
    if (new Date(String(r.expires_at)) < new Date()) return null;
    return { token, type, userId: String(r.user_id), expiresAt: String(r.expires_at) };
  },
  async upsertStat(stat) {
    await migrate();
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
      favorited = excluded.favorited`;
    return stat;
  },
  async getStat(userId, questionId) {
    await migrate();
    const rows = await db()`select * from question_stats where user_id = ${userId} and question_id = ${questionId} limit 1`;
    return rows[0] ? mapStat(rows[0] as Record<string, unknown>) : null;
  },
  async listStats(userId) {
    await migrate();
    const rows = await db()`select * from question_stats where user_id = ${userId}`;
    return rows.map((r) => mapStat(r as Record<string, unknown>));
  },
  async addExam(row: ExamRow) {
    await migrate();
    await db()`insert into exams (id, user_id, mode, score, correct_count, total, at)
      values (${row.id}, ${row.userId}, ${row.mode}, ${row.score}, ${row.correctCount}, ${row.total}, ${row.at})`;
  },
  async listExams(userId) {
    await migrate();
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
        at: String(row.at),
      };
    });
  },
  async aiCount(userId, day) {
    await migrate();
    const rows = await db()`select n from ai_usage where user_id = ${userId} and day = ${day} limit 1`;
    return rows[0] ? Number((rows[0] as { n: number }).n) : 0;
  },
  async bumpAi(userId, day) {
    await migrate();
    await db()`insert into ai_usage (user_id, day, n) values (${userId}, ${day}, 1)
      on conflict (user_id, day) do update set n = ai_usage.n + 1`;
    return this.aiCount(userId, day);
  },
  async seenWebhook(id, provider) {
    await migrate();
    const rows = await db()`select id from webhooks where id = ${id} limit 1`;
    if (rows[0]) return true;
    await db()`insert into webhooks (id, provider, at) values (${id}, ${provider}, ${new Date().toISOString()})`;
    return false;
  },
};
