import { NextResponse } from "next/server";
import { queryLiveBusiness, queryLiveProbe } from "@/lib/operations/summary-fetch";
import { operationsAccess } from "@/lib/operations/report-view";
import { getSession } from "@/lib/session";
import { instantInClosedReports, phoenixReportDate } from "@/lib/operations/windows";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await getSession();
  const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
  if (access !== "ok") {
    return NextResponse.json({ error: access === "anonymous" ? "sign_in_required" : "forbidden" }, { status: access === "anonymous" ? 401 : 403 });
  }
  if (process.env.VERCEL_ENV !== "production") {
    return NextResponse.json({ error: "production_only" }, { status: 403 });
  }

  const since = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
  const [probe, business] = await Promise.all([queryLiveProbe(since), queryLiveBusiness(since)]);
  const back = new URL("/admin/operations/", req.url);
  back.searchParams.set("liveProbe", "1");
  if (!probe.ok) back.searchParams.set("probeError", probe.errorType || "query_failed");
  else {
    back.searchParams.set("probeTotal", String(probe.total ?? 0));
    if (probe.lastEventAt) back.searchParams.set("probeLast", probe.lastEventAt);
    if (probe.businessOverlap != null) back.searchParams.set("probeOverlap", String(probe.businessOverlap));
    const names = probe.events.map((row) => `${row.event}:${row.count}`).join(",");
    if (names) back.searchParams.set("probeEvents", names);
  }
  if (!business.ok) back.searchParams.set("businessError", business.errorType || "query_failed");
  else {
    back.searchParams.set("businessTotal", String(business.total ?? 0));
    back.searchParams.set("acceptanceTotal", String(business.acceptanceTotal ?? 0));
    const names = business.events.filter((row) => row.acceptance > 0).map((row) => `${row.event}:${row.acceptance}`).join(",");
    if (names) back.searchParams.set("acceptanceEvents", names);
    const marker = business.acceptanceLast || business.lastEventAt;
    if (marker) {
      back.searchParams.set("businessLast", marker);
      const reportDate = phoenixReportDate(marker);
      if (reportDate) back.searchParams.set("reportDate", reportDate);
      back.searchParams.set("inHistory", instantInClosedReports(marker) ? "1" : "0");
    }
  }
  return NextResponse.redirect(back, 303);
}
