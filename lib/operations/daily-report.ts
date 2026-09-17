import "server-only";

import { buildPaddleOperationsReport, reportRange } from "@/lib/billing/paddle-report";
import { getPgSql } from "@/lib/store/pg-store";

const REPORT_TIME_ZONE = "Asia/Shanghai";

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

export async function collectAndStorePaddleDailyReport(now = new Date()) {
  const reportDate = previousShanghaiDate(now);
  const report = await buildPaddleOperationsReport(reportRange(reportDate, reportDate));
  const sql = getPgSql();
  const completedTransactions = report.transactions.byStatus.completed || 0;

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
      'paddle',
      ${reportDate},
      ${report.range.timeZone},
      ${report.generatedAt},
      ${report.environment},
      ${report.transactions.created},
      ${sql.json(report.transactions.byStatus)},
      ${completedTransactions},
      ${sql.json(report.transactions.completedGross)},
      ${report.refunds.approved},
      ${sql.json(report.refunds.amount)},
      ${sql.json(report.privacy)},
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

  return {
    ok: true,
    source: "paddle" as const,
    reportDate,
    generatedAt: report.generatedAt,
    transactionsCreated: report.transactions.created,
    completedTransactions,
    approvedRefunds: report.refunds.approved,
  };
}
