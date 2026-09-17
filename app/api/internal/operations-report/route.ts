import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { buildPaddleOperationsReport, reportRange } from "@/lib/billing/paddle-report";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request) {
  const expected = process.env.OPERATIONS_REPORT_TOKEN;
  const header = req.headers.get("authorization");
  if (!expected || !header?.startsWith("Bearer ")) return false;
  const actual = header.slice("Bearer ".length);
  const expectedBytes = Buffer.from(expected);
  const actualBytes = Buffer.from(actual);
  return expectedBytes.length === actualBytes.length && timingSafeEqual(expectedBytes, actualBytes);
}

export async function GET(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const url = new URL(req.url);
    const range = reportRange(url.searchParams.get("start"), url.searchParams.get("end"));
    const report = await buildPaddleOperationsReport(range);
    return NextResponse.json(report, {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    const code = error instanceof Error ? error.message : "report_failed";
    const badRequest = code.endsWith("_invalid");
    console.error("[operations-report]", code);
    return NextResponse.json(
      { error: badRequest ? code : "Report unavailable" },
      { status: badRequest ? 400 : 503 }
    );
  }
}
