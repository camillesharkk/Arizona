import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { newToken, resetUrl, sendMail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(`forgot:${clientIp(req)}`, 6, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = z.object({ email: z.string().email() }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const store = await getStore();
  const user = await store.getUserByEmail(body.data.email.trim().toLowerCase());
  if (user) {
    const token = newToken();
    await store.putToken({ token, type: "reset", userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString() });
    const mail = await sendMail(user.email, "Reset your Arizona Exam password", `<p><a href="${resetUrl(token)}">Reset password</a></p>`);
    return NextResponse.json({ ok: true, mockedEmail: mail.mocked, resetToken: mail.mocked ? token : undefined });
  }
  return NextResponse.json({ ok: true });
}
