import "server-only";

import { getPgSql } from "@/lib/store/pg-store";
import { selectSummaryReport, type StoredSummary } from "./report-view.ts";

function day(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  const text = String(value || "");
  return text.slice(0, 10);
}

export async function readOperationsHistory(date: string | null) {
  if (!process.env.DATABASE_URL) return { ok: false as const, reason: "database_unconfigured" };
  try {
    const sql = getPgSql();
    const rows = await sql`
      select to_char(report_date, 'YYYY-MM-DD') as report_date,
             generated_at,
             data_as_of,
             snapshot
      from operations_daily_reports
      where source = 'summary'
      order by report_date desc
      limit 60
    `;
    const stored: StoredSummary[] = rows.map((row) => ({
      reportDate: day(row.report_date),
      generatedAt: row.generated_at ? new Date(row.generated_at as string | Date).toISOString() : "",
      dataAsOf: row.data_as_of ? new Date(row.data_as_of as string | Date).toISOString() : "",
      snapshot: row.snapshot,
    }));
    return { ok: true as const, dates: stored.map((row) => row.reportDate), report: selectSummaryReport(stored, date) };
  } catch {
    return { ok: false as const, reason: "report_read_failed" };
  }
}
