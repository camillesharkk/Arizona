import "server-only";

import { buildPaddleOperationsReport, reportRange } from "@/lib/billing/paddle-report";
import { buildOperationsSnapshot } from "@/lib/operations/aggregate";
import { fetchGoogleOperationsReport } from "@/lib/operations/google";
import { loadSummaryParts } from "@/lib/operations/summary-fetch";
import { reportWindows } from "@/lib/operations/windows";
import { getPgSql } from "@/lib/store/pg-store";

const REPORT_TIME_ZONE = "Asia/Shanghai";

type OperationsSource = "paddle" | "ga4" | "gsc";

function dateInTimeZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function previousShanghaiDate(now = new Date()) {
  return dateInTimeZone(new Date(now.getTime() - 24 * 60 * 60 * 1000), REPORT_TIME_ZONE);
}

function shanghaiWeekStart(reportDate: string) {
  const startMs = Date.parse(`${reportDate}T00:00:00+08:00`) - 6 * 24 * 60 * 60 * 1000;
  return dateInTimeZone(new Date(startMs), REPORT_TIME_ZONE);
}

const googlePrivacy = {
  includesCustomerDetails: false,
  includesTransactionIds: false,
  includesUserIds: false,
};

async function upsertOperationsReport(row: {
  source: OperationsSource;
  reportDate: string;
  timeZone: string;
  generatedAt: string;
  sourceEnvironment: string;
  transactionsCreated: number;
  transactionStatusCounts: unknown;
  completedTransactions: number;
  completedGross: unknown;
  approvedRefunds: number;
  approvedRefundAmount: unknown;
  privacy: unknown;
}) {
  const sql = getPgSql();
  await sql`
    insert into operations_daily_reports (
      source,
      report_date,
      time_zone,
      generated_at,
      source_environment,
      transactions_created,
      transaction_status_counts,
      completed_transactions,
      completed_gross,
      approved_refunds,
      approved_refund_amount,
      privacy,
      updated_at
    ) values (
      ${row.source},
      ${row.reportDate},
      ${row.timeZone},
      ${row.generatedAt},
      ${row.sourceEnvironment},
      ${row.transactionsCreated},
      ${sql.json(JSON.parse(JSON.stringify(row.transactionStatusCounts)))},
      ${row.completedTransactions},
      ${sql.json(JSON.parse(JSON.stringify(row.completedGross)))},
      ${row.approvedRefunds},
      ${sql.json(JSON.parse(JSON.stringify(row.approvedRefundAmount)))},
      ${sql.json(JSON.parse(JSON.stringify(row.privacy)))},
      now()
    )
    on conflict (source, report_date) do update set
      time_zone = excluded.time_zone,
      generated_at = excluded.generated_at,
      source_environment = excluded.source_environment,
      transactions_created = excluded.transactions_created,
      transaction_status_counts = excluded.transaction_status_counts,
      completed_transactions = excluded.completed_transactions,
      completed_gross = excluded.completed_gross,
      approved_refunds = excluded.approved_refunds,
      approved_refund_amount = excluded.approved_refund_amount,
      privacy = excluded.privacy,
      updated_at = now()
  `;
}

export async function collectAndStorePaddleDailyReport(now = new Date()) {
  const reportDate = previousShanghaiDate(now);
  const report = await buildPaddleOperationsReport(reportRange(reportDate, reportDate));
  const completedTransactions = report.transactions.byStatus.completed || 0;

  await upsertOperationsReport({
    source: "paddle",
    reportDate,
    timeZone: report.range.timeZone,
    generatedAt: report.generatedAt,
    sourceEnvironment: report.environment,
    transactionsCreated: report.transactions.created,
    transactionStatusCounts: report.transactions.byStatus,
    completedTransactions,
    completedGross: report.transactions.completedGross,
    approvedRefunds: report.refunds.approved,
    approvedRefundAmount: report.refunds.amount,
    privacy: report.privacy,
  });

  return {
    ok: true as const,
    source: "paddle" as const,
    reportDate,
    generatedAt: report.generatedAt,
    transactionsCreated: report.transactions.created,
    completedTransactions,
    approvedRefunds: report.refunds.approved,
  };
}

export async function collectAndStoreGoogleDailyReports(now = new Date()) {
  const reportDate = previousShanghaiDate(now);
  const weekStart = shanghaiWeekStart(reportDate);
  const fetched = await fetchGoogleOperationsReport({ reportDate, weekStart });
  if (!fetched.ok) {
    return { ok: false as const, skipped: fetched.error === "GOOGLE_CREDENTIALS_MISSING", error: fetched.error, reportDate };
  }

  const generatedAt = new Date().toISOString();
  const sourceEnvironment = process.env.VERCEL_ENV || "local";
  const ga4Channels = Object.fromEntries(
    fetched.ga4.yesterday.channels.map((channel) => [channel.channel, channel.sessions])
  );

  await upsertOperationsReport({
    source: "ga4",
    reportDate,
    timeZone: REPORT_TIME_ZONE,
    generatedAt,
    sourceEnvironment,
    transactionsCreated: fetched.ga4.yesterday.sessions,
    transactionStatusCounts: ga4Channels,
    completedTransactions: fetched.ga4.yesterday.users,
    completedGross: { pageviews: fetched.ga4.yesterday.pageviews },
    approvedRefunds: 0,
    approvedRefundAmount: {},
    privacy: { ...googlePrivacy, weekStart, yesterday: fetched.ga4.yesterday, week: fetched.ga4.week },
  });

  await upsertOperationsReport({
    source: "gsc",
    reportDate,
    timeZone: REPORT_TIME_ZONE,
    generatedAt,
    sourceEnvironment,
    transactionsCreated: fetched.gsc.yesterday.clicks,
    transactionStatusCounts: { weekClicks: fetched.gsc.week.clicks, weekImpressions: fetched.gsc.week.impressions },
    completedTransactions: fetched.gsc.yesterday.impressions,
    completedGross: {},
    approvedRefunds: 0,
    approvedRefundAmount: {},
    privacy: { ...googlePrivacy, weekStart, yesterday: fetched.gsc.yesterday, week: fetched.gsc.week },
  });

  return {
    ok: true as const,
    reportDate,
    generatedAt,
    ga4: {
      sessions: fetched.ga4.yesterday.sessions,
      users: fetched.ga4.yesterday.users,
      pageviews: fetched.ga4.yesterday.pageviews,
    },
    gsc: {
      clicks: fetched.gsc.yesterday.clicks,
      impressions: fetched.gsc.yesterday.impressions,
    },
  };
}

async function upsertSummarySnapshot(row: {
  reportDate: string;
  generatedAt: string;
  dataAsOf: string;
  snapshot: unknown;
}) {
  const sql = getPgSql();
  const privacy = {
    includesCustomerDetails: false,
    includesTransactionIds: false,
    includesUserIds: false,
    includesCredentials: false,
    usesGa4Revenue: false,
  };
  await sql`
    insert into operations_daily_reports (
      source,
      report_date,
      time_zone,
      generated_at,
      data_as_of,
      source_environment,
      transactions_created,
      transaction_status_counts,
      completed_transactions,
      completed_gross,
      approved_refunds,
      approved_refund_amount,
      privacy,
      snapshot,
      updated_at
    ) values (
      'summary',
      ${row.reportDate},
      'America/Phoenix',
      ${row.generatedAt},
      ${row.dataAsOf},
      ${process.env.VERCEL_ENV || "local"},
      null,
      ${sql.json({})},
      null,
      ${sql.json({})},
      null,
      ${sql.json({})},
      ${sql.json(privacy)},
      ${sql.json(JSON.parse(JSON.stringify(row.snapshot)))},
      now()
    )
    on conflict (source, report_date) do update set
      time_zone = excluded.time_zone,
      generated_at = excluded.generated_at,
      data_as_of = excluded.data_as_of,
      source_environment = excluded.source_environment,
      privacy = excluded.privacy,
      snapshot = excluded.snapshot,
      updated_at = now()
  `;
}

export async function collectAndStoreSummaryReport(now = new Date()) {
  const windows = reportWindows(now);
  const parts = await loadSummaryParts(windows);
  const { history, ...rest } = parts;
  const snapshot = {
    ...buildOperationsSnapshot({ windows, ...rest }),
    history,
  };
  await upsertSummarySnapshot({
    reportDate: windows.yesterday.end,
    generatedAt: windows.generatedAt,
    dataAsOf: windows.yesterday.dataAsOf,
    snapshot,
  });
  return {
    ok: true as const,
    source: "summary" as const,
    reportDate: windows.yesterday.end,
    generatedAt: windows.generatedAt,
    dataAsOf: windows.yesterday.dataAsOf,
    sources: snapshot.sources,
    alerts: snapshot.alerts,
  };
}

export async function collectAndStoreDailyOperationsReports(now = new Date()) {
  const summary = await collectAndStoreSummaryReport(now)
    .then((result) => result)
    .catch(() => ({ ok: false as const, error: "summary_store_failed" }));
  const paddle = await collectAndStorePaddleDailyReport(now)
    .then((result) => result)
    .catch(() => ({
      ok: false as const,
      error: "paddle_failed",
    }));
  const google = await collectAndStoreGoogleDailyReports(now)
    .then((result) => result)
    .catch(() => ({
      ok: false as const,
      error: "google_failed",
    }));
  return { summary, paddle, google };
}
