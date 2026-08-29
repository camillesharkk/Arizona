import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    ok: true,
    note: "When DATABASE_URL and RESEND_API_KEY are set, wire this cron to list users with emailDaily/emailWeekly/emailExam and send Resend messages.",
  });
}

export async function POST(req: Request) {
  return GET(req);
}
