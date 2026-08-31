import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { setSessionCookie } from "@/lib/session";
import {
  allowDevEmailTokens,
  newToken,
  sendMail,
  verificationEmailHtml,
  VERIFY_SUBJECT,
  verifyUrl,
} from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(80).optional(),
});

export async function POST(req: Request) {
  const limited = rateLimit(`reg:${clientIp(req)}`, 8, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  const email = body.data.email.trim().toLowerCase();
  const store = await getStore();
  if (await store.getUserByEmail(email)) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
  const passwordHash = await bcrypt.hash(body.data.password, 12);
  const user = await store.createUser({ email, passwordHash, name: body.data.name || null });
  const token = newToken();
  await store.putToken({ token, type: "verify", userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString() });
  const mail = await sendMail(email, VERIFY_SUBJECT, verificationEmailHtml(verifyUrl(token)));
  if (!mail.ok) {
    return NextResponse.json({ error: mail.error }, { status: 502 });
  }
  await setSessionCookie({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: user.emailVerified,
    name: user.name,
  });
  return NextResponse.json({
    ok: true,
    ...(allowDevEmailTokens() ? { mockedEmail: true, verifyToken: token } : {}),
  });
}
