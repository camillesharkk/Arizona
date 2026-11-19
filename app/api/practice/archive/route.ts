import { NextResponse } from "next/server";
import { guestAttemptFromSitting } from "@/lib/guest-sitting-attempt";
import { sameOrigin } from "@/lib/durable-limit";
import { ANON_COOKIE, readPractice } from "@/lib/practice-token";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import type { Sitting } from "@/lib/sitting";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "This archive was rejected." }, { status: 403 });
  const body = await req.json().catch(() => null) as Sitting | null;
  if (!body?.practiceToken || !body.examId) return NextResponse.json({ error: "Nothing to archive" }, { status: 404 });
  const claims = await readPractice(body.practiceToken);
  const session = await getSession();
  const anon = (await cookies()).get(ANON_COOKIE)?.value || "";
  if (!claims || claims.purpose !== "sitting" || claims.ids.join("|") !== (body.questionIds || []).join("|") || (claims.sub !== session?.id && claims.sub !== anon)) {
    return NextResponse.json({ error: "This practice set has expired. Reload it." }, { status: 403 });
  }
  const attempt = guestAttemptFromSitting(body);
  if (!attempt) return NextResponse.json({ error: "Nothing to archive" }, { status: 404 });
  return NextResponse.json(attempt, { headers: { "Cache-Control": "private, no-store" } });
}
