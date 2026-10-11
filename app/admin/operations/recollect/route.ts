import { NextResponse } from "next/server";
import { collectAndStoreSummaryReport } from "@/lib/operations/daily-report";
import { operationsAccess } from "@/lib/operations/report-view";
import { getPgSql } from "@/lib/store/pg-store";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const LOCK_KEY = 481516234;

export async function POST(req: Request) {
  const session = await getSession();
  const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
  if (access !== "ok") {
    return NextResponse.json({ error: access === "anonymous" ? "sign_in_required" : "forbidden" }, { status: access === "anonymous" ? 401 : 403 });
  }
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ error: "production_only" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  const requested = String(form?.get("date") || "");
  const sql = getPgSql();
  const locked = await sql`select pg_try_advisory_lock(${LOCK_KEY}) as locked`;
  if (!locked[0] || locked[0].locked !== true) {
    return NextResponse.json({ error: "already_running" }, { status: 409 });
  }
  try {
    const recent = await sql`
      select snapshot
      from operations_daily_reports
      where source = 'summary'
        and source_environment = 'production'
        and (${requested} = '' or to_char(report_date, 'YYYY-MM-DD') = ${requested})
      order by report_date desc
      limit 1
    `;
    const prior = recent[0]?.snapshot;
    const priorAudit = Array.isArray((prior as { audit?: unknown } | undefined)?.audit) ? (prior as { audit: unknown[] }).audit : [];
    const audit = priorAudit.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const row = item as { at?: unknown; action?: unknown; result?: unknown; reportDate?: unknown; gitSha?: unknown };
      return [{
        at: typeof row.at === "string" ? row.at : "",
        action: typeof row.action === "string" ? row.action : "recollect",
        result: typeof row.result === "string" ? row.result : "",
        reportDate: typeof row.reportDate === "string" ? row.reportDate : null,
        gitSha: typeof row.gitSha === "string" ? row.gitSha : null,
      }];
    });
    const last = audit.at(-1);
    if (last?.result === "running" && last.at && Date.now() - Date.parse(last.at) < 2 * 60 * 1000) {
      return NextResponse.json({ error: "already_running" }, { status: 409 });
    }
    const entry = {
      at: new Date().toISOString(),
      action: "recollect",
      result: "ok",
      reportDate: requested || null,
      gitSha: process.env.VERCEL_GIT_COMMIT_SHA || null,
    };
    const result = await collectAndStoreSummaryReport();
    await sql`
      update operations_daily_reports
      set snapshot = snapshot || ${sql.json({ audit: [...audit.slice(-20), entry] })}
      where source = 'summary'
        and source_environment = 'production'
        and report_date = ${result.reportDate}
    `;
    const back = new URL("/admin/operations/", req.url);
    back.searchParams.set("date", result.reportDate);
    back.searchParams.set("collected", "1");
    return NextResponse.redirect(back, 303);
  } finally {
    await sql`select pg_advisory_unlock(${LOCK_KEY})`;
  }
}
