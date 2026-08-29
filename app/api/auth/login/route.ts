import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email(), password: z.string().min(8) });

export async function POST(req: Request) {
  const limited = rateLimit(`login:${clientIp(req)}`, 12, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const store = await getStore();
  const user = await store.getUserByEmail(body.data.email.trim().toLowerCase());
  if (!user || !(await bcrypt.compare(body.data.password, user.passwordHash))) {
    return NextResponse.json({ error: "Email or password does not match" }, { status: 401 });
  }
  await store.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  await setSessionCookie({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: user.emailVerified,
    name: user.name,
  });
  return NextResponse.json({ ok: true });
}
