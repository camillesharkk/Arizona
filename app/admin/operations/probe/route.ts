import { NextResponse } from "next/server";
import { queryLiveCohort } from "@/lib/operations/summary-fetch";
import { posthogAcceptanceFilter, posthogBusinessFilter, posthogProbeFilter } from "@/lib/operations/observation";
import { operationsAccess } from "@/lib/operations/report-view";
import { getSession } from "@/lib/session";
import { instantInClosedReports, liveCheckWindow, phoenixReportDate } from "@/lib/operations/windows";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

function writeCohort(back: URL, prefix: string, result: Awaited<ReturnType<typeof queryLiveCohort>>) {
  if (!result.ok) {
    back.searchParams.set(`${prefix}Error`, result.errorType || "query_failed");
    return;
  }
  back.searchParams.set(`${prefix}Total`, String(result.total ?? 0));
  if (result.lastEventAt) back.searchParams.set(`${prefix}Last`, result.lastEventAt);
  const names = result.events.map((row) => `${row.event}:${row.count}`).join(",");
  if (names) back.searchParams.set(`${prefix}Events`, names);
}

export async function POST(req: Request) {
  const session = await getSession();
  const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
  if (access !== "ok") {
    return NextResponse.json({ error: access === "anonymous" ? "sign_in_required" : "forbidden" }, { status: access === "anonymous" ? 401 : 403 });
  }
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ error: "production_only" }, { status: 403 });
  }

  const window = liveCheckWindow();
  const [probe, acceptance, visitors] = await Promise.all([
    queryLiveCohort(window.startIso, window.endIso, posthogProbeFilter(), "operations live probe"),
    queryLiveCohort(window.startIso, window.endIso, posthogAcceptanceFilter(), "operations live acceptance"),
    queryLiveCohort(window.startIso, window.endIso, posthogBusinessFilter(), "operations live visitors"),
  ]);
  const back = new URL("/admin/operations/", req.url);
  back.searchParams.set("liveProbe", "1");
  back.searchParams.set("queryStart", window.startIso);
  back.searchParams.set("queryEnd", window.endIso);
  writeCohort(back, "probe", probe);
  writeCohort(back, "acceptance", acceptance);
  writeCohort(back, "visitor", visitors);
  if (acceptance.ok && acceptance.lastEventAt) {
    const reportDate = phoenixReportDate(acceptance.lastEventAt);
    if (reportDate) back.searchParams.set("reportDate", reportDate);
    back.searchParams.set("inHistory", instantInClosedReports(acceptance.lastEventAt) ? "1" : "0");
  }
  return NextResponse.redirect(back, 303);
}
