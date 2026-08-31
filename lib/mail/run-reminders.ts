import "server-only";
import { getStore } from "@/lib/store";
import type { EmailType, UserRow } from "@/lib/store/types";
import { sendMail } from "@/lib/email";
import { canUseAdvancedAnalytics } from "@/lib/entitlements";
import { readinessScore } from "@/lib/stats";
import {
  arizonaToday,
  daysBetween,
  isoWeekPeriodKey,
  isArizonaMonday,
  studiedRecently,
} from "./arizona-time";
import { overallAccuracy, weeklyReport } from "./study-stats";
import { dailyEmailHtml, examEmailHtml, weeklyEmailHtml } from "./templates";

export const DAILY_SUBJECT = "Keep your Arizona Notary prep streak going";
export const WEEKLY_SUBJECT = "Your Arizona Notary prep week in review";

const EXAM_OFFSETS = [7, 3, 1] as const;

function dailyCap() {
  const n = Number(process.env.EMAIL_CRON_DAILY_CAP || "25");
  if (!Number.isFinite(n) || n < 1) return 25;
  return Math.min(Math.floor(n), 100);
}

export type ReminderJobResult = {
  ok: true;
  arizonaDate: string;
  sent: number;
  failed: number;
  skipped: number;
  duplicates: number;
  capped: boolean;
  cap: number;
  testEmail: string | null;
};

type Planned = {
  user: UserRow;
  type: EmailType;
  periodKey: string;
  subject: string;
  html: string;
};

function examSubject(days: number) {
  if (days === 1) return "Your Arizona notary exam is tomorrow";
  return `Your Arizona notary exam is in ${days} days`;
}

async function planForUser(
  user: UserRow,
  opts: { force: boolean; test: boolean }
): Promise<Planned[]> {
  const store = await getStore();
  const today = arizonaToday();
  const out: Planned[] = [];
  const wantDaily = opts.force || user.emailDaily;
  const wantWeekly = opts.force || user.emailWeekly;
  const wantExam = opts.force || user.emailExam;

  const [stats, exams] = wantDaily || wantWeekly ? await Promise.all([store.listStats(user.id), store.listExams(user.id)]) : [[], []];

  if (wantDaily) {
    const recently = studiedRecently(user, today);
    if (!opts.force && recently) {
      // Active today / last 24h — skip nag mail
    } else {
      const acc = overallAccuracy(stats);
      const lastStudy = user.lastStudyAt?.slice(0, 10) || user.lastStudyDate || "not yet";
      out.push({
        user,
        type: "daily",
        periodKey: opts.test && opts.force ? `test:daily:${today}` : `daily:${today}`,
        subject: DAILY_SUBJECT,
        html: dailyEmailHtml({
          name: user.name,
          streak: user.streakDays,
          accuracy: acc.accuracy,
          lastStudy,
        }),
      });
    }
  }

  if (wantWeekly && (opts.force || isArizonaMonday())) {
    const report = weeklyReport(stats, exams, today);
    const sessionUser = {
      id: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
      name: user.name,
    };
    const readiness = canUseAdvancedAnalytics(sessionUser) ? readinessScore(stats, exams) : null;
    out.push({
      user,
      type: "weekly",
      periodKey: opts.test && opts.force ? `test:weekly:${today}` : isoWeekPeriodKey(today),
      subject: WEEKLY_SUBJECT,
      html: weeklyEmailHtml({
        name: user.name,
        questions: report.current.questionsPracticed,
        correct: report.current.correct,
        wrong: report.current.wrong,
        accuracy: report.current.accuracy,
        tests: report.testsThisWeek,
        weakest: report.current.weakest?.label || null,
        strongest: report.current.strongest?.label || null,
        streak: user.streakDays,
        readiness,
        prevAccuracy: report.previous.questionsPracticed ? report.previous.accuracy : null,
      }),
    });
  }

  if (wantExam) {
    if (opts.force) {
      out.push({
        user,
        type: "exam",
        periodKey: `test:exam:${today}`,
        subject: examSubject(user.examDate ? Math.max(1, daysBetween(today, user.examDate) || 7) : 7),
        html: examEmailHtml({
          name: user.name,
          days: user.examDate && (EXAM_OFFSETS as readonly number[]).includes(daysBetween(today, user.examDate))
            ? daysBetween(today, user.examDate)
            : 7,
          examDate: user.examDate || "set your date on the account page",
        }),
      });
    } else if (user.examDate) {
      const days = daysBetween(today, user.examDate);
      if ((EXAM_OFFSETS as readonly number[]).includes(days)) {
        out.push({
          user,
          type: "exam",
          periodKey: `exam:${days}d:${user.examDate}`,
          subject: examSubject(days),
          html: examEmailHtml({ name: user.name, days, examDate: user.examDate }),
        });
      }
    }
  }

  return out;
}

export async function runStudyReminders(opts: { testEmail?: string; force?: boolean } = {}): Promise<ReminderJobResult> {
  const store = await getStore();
  const cap = dailyCap();
  const today = arizonaToday();
  const testEmail = opts.testEmail?.trim().toLowerCase() || null;
  const force = Boolean(opts.force && testEmail);

  let users: UserRow[];
  if (testEmail) {
    const one = await store.getUserByEmail(testEmail);
    users = one ? [one] : [];
  } else {
    users = await store.listMailUsers();
  }

  const planned: Planned[] = [];
  let skipped = 0;
  for (const user of users) {
    if (!user.emailVerified) {
      skipped += 1;
      continue;
    }
    const items = await planForUser(user, { force, test: Boolean(testEmail) });
    if (!items.length) skipped += 1;
    planned.push(...items);
  }

  let sent = 0;
  let failed = 0;
  let duplicates = 0;
  let capped = false;

  const queue: Planned[] = [];
  for (const item of planned) {
    if (queue.length >= cap) {
      capped = true;
      break;
    }
    const claimed = await store.claimEmailSend(item.user.id, item.type, item.periodKey);
    if (!claimed) {
      duplicates += 1;
      continue;
    }
    queue.push(item);
  }

  for (let i = 0; i < queue.length; i += 5) {
    const chunk = queue.slice(i, i + 5);
    const results = await Promise.all(
      chunk.map(async (item) => {
        const mail = await sendMail(item.user.email, item.subject, item.html);
        return { item, mail };
      })
    );
    for (const { item, mail } of results) {
      if (!mail.ok) {
        failed += 1;
        await store.finalizeEmailSend(item.user.id, item.type, item.periodKey, { status: "failed" });
        console.error("[cron:reminders] send failed", { type: item.type, user: item.user.id });
        continue;
      }
      await store.finalizeEmailSend(item.user.id, item.type, item.periodKey, {
        status: "sent",
        messageId: mail.messageId || null,
      });
      sent += 1;
    }
  }

  console.info("[cron:reminders] done", {
    arizonaDate: today,
    sent,
    failed,
    skipped,
    duplicates,
    capped,
    testEmail: testEmail ? "set" : null,
  });

  return { ok: true, arizonaDate: today, sent, failed, skipped, duplicates, capped, cap, testEmail };
}
