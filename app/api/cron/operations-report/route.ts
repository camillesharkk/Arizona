import { NextResponse } from "next/server";
import { collectAndStoreDailyOperationsReports } from "@/lib/operations/daily-report";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await collectAndStoreDailyOperationsReports();
    if (!result.summary.ok) {
      console.error("[cron:operations-report] summary store failed");
    }
    if (!result.paddle.ok) console.error("[cron:operations-report] paddle source failed");
    if (!result.google.ok && !("skipped" in result.google && result.google.skipped)) {
      console.error("[cron:operations-report] google source failed");
    }
    return NextResponse.json(result, {
      status: result.summary.ok ? 200 : 500,
      headers: { "Cache-Control": "private, no-store, max-age=0" },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "unknown";
    console.error("[cron:operations-report] job failed", code);
    return NextResponse.json({ error: "Operations report job failed" }, { status: 500 });
  }
}
