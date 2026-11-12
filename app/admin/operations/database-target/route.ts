import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { operationsAccess } from "@/lib/operations/report-view";
import { getPgSql } from "@/lib/store/pg-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const headers = { "Cache-Control": "private, no-store, max-age=0", Vary: "Cookie" };

export async function GET() {
  try {
    const session = await getSession();
    const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
    if (access !== "ok") {
      return NextResponse.json({ error: "access_denied" }, { status: access === "anonymous" ? 401 : 403, headers });
    }
    const target = new URL(process.env.DATABASE_URL || "");
    if (!["postgres:", "postgresql:"].includes(target.protocol)) throw new Error("invalid_target");
    const rows = await getPgSql().begin("read only", async sql => sql`select current_database() as database`);
    return NextResponse.json({
      deployment: process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_URL || null,
      sha: process.env.VERCEL_GIT_COMMIT_SHA || null,
      hostname: target.hostname,
      database: rows[0].database,
    }, { headers });
  } catch {
    return NextResponse.json({ error: "diagnostic_unavailable" }, { status: 503, headers });
  }
}
