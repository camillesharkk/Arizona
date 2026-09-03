import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { allowDevEmailTokens } from "@/lib/email";
import { clientIp } from "@/lib/rate-limit";
import { resendVerification } from "@/lib/auth/resend";

const schema = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  const store = await getStore();
  const result = await resendVerification({
    store,
    email: body.data.email,
    ip: clientIp(req),
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({
    ok: true,
    ...(allowDevEmailTokens() && result.sent ? { mockedEmail: true, verifyToken: result.token } : {}),
  });
}
