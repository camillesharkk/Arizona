import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession, clearSessionCookie } from "@/lib/session";
import { getStore } from "@/lib/store";
import { getCommerceRepo } from "@/lib/commerce";
import { getDeviceRepo } from "@/lib/devices";
import { confirmAndDeleteAccount } from "@/lib/auth/deletion";
import { refreshPlanCache } from "@/lib/entitlements";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  password: z.string().min(8),
  confirmation: z.string(),
  userId: z.string().optional(),
});

export async function POST(req: Request) {
  const limited = rateLimit(`acct-del:${clientIp(req)}`, 6, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "Password and DELETE confirmation are required." }, { status: 400 });
  }
  const store = await getStore();
  const commerce = await getCommerceRepo();
  const devices = await getDeviceRepo();
  const result = await confirmAndDeleteAccount({
    store,
    commerce,
    devices,
    sessionUserId: session.id,
    password: body.data.password,
    confirmation: body.data.confirmation,
    requestedUserId: body.data.userId,
  });
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });
  try {
    await refreshPlanCache(session.id);
  } catch {
    /* cache is best-effort after deletion */
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
