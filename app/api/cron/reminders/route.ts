import { NextResponse } from "next/server";
import { z } from "zod";
import { runStudyReminders } from "@/lib/mail/run-reminders";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function authorized(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return req.headers.get("authorization") === `Bearer ${secret}`;
}

async function handle(req: Request) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = new URL(req.url);
  const testRaw = url.searchParams.get("testEmail");
  const testEmail = testRaw ? testRaw.trim().toLowerCase() : undefined;
  if (testEmail && !z.string().email().safeParse(testEmail).success) {
    return NextResponse.json({ error: "Invalid testEmail" }, { status: 400 });
  }
  const force = url.searchParams.get("force") === "1";
  if (force && !testEmail) {
    return NextResponse.json({ error: "force requires testEmail" }, { status: 400 });
  }
  try {
    const result = await runStudyReminders({ testEmail, force });
    return NextResponse.json(result);
  } catch {
    console.error("[cron:reminders] job failed");
    return NextResponse.json({ error: "Reminder job failed" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  return handle(req);
}

export async function POST(req: Request) {
  return handle(req);
}
