import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { allowDevEmailTokens, newToken, resetEmailHtml, RESET_SUBJECT, resetUrl, sendMail } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export async function POST(req: Request) {
  const limited = rateLimit(`forgot:${clientIp(req)}`, 6, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = z.object({ email: z.string().email() }).safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const store = await getStore();
  const user = await store.getUserByEmail(body.data.email.trim().toLowerCase());
  if (user && !user.deletedAt) {
    const token = newToken();
    await store.putToken({ token, type: "reset", userId: user.id, expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString() });
    const mail = await sendMail(user.email, RESET_SUBJECT, resetEmailHtml(resetUrl(token)));
    if (!mail.ok) {
      return NextResponse.json({ error: mail.error }, { status: 502 });
    }
    return NextResponse.json({
      ok: true,
      ...(allowDevEmailTokens() ? { mockedEmail: true, resetToken: token } : {}),
    });
  }
  return NextResponse.json({ ok: true });
}
