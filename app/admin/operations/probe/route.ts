import { NextResponse } from "next/server";
import { queryLiveProbe } from "@/lib/operations/summary-fetch";
import { operationsAccess } from "@/lib/operations/report-view";
import { getSession } from "@/lib/session";

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
  const result = await queryLiveProbe(since);
  const back = new URL("/admin/operations/", req.url);
  back.searchParams.set("liveProbe", "1");
  if (!result.ok) {
    back.searchParams.set("probeError", result.errorType || "query_failed");
    return NextResponse.redirect(back, 303);
  }
  back.searchParams.set("probeTotal", String(result.total ?? 0));
  if (result.lastEventAt) back.searchParams.set("probeLast", result.lastEventAt);
  if (result.businessOverlap != null) back.searchParams.set("probeOverlap", String(result.businessOverlap));
  const names = result.events.map((row) => `${row.event}:${row.count}`).join(",");
  if (names) back.searchParams.set("probeEvents", names);
  return NextResponse.redirect(back, 303);
}
