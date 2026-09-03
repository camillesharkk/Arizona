import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { allowDevEmailTokens } from "@/lib/email";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getCommerceRepo } from "@/lib/commerce";
import { registerAccount } from "@/lib/auth/register";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().max(80).optional(),
  referralCode: z.string().max(16).optional(),
});

export async function POST(req: Request) {
  const limited = rateLimit(`reg:${clientIp(req)}`, 8, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = schema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 400 });
  const store = await getStore();
  const commerce = await getCommerceRepo();
  const result = await registerAccount({
    store,
    commerce,
    email: body.data.email,
    password: body.data.password,
    name: body.data.name,
    referralCode: body.data.referralCode,
  });
  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.error,
        code: result.code,
        ...(result.accountCreated ? { accountCreated: true } : {}),
        ...(result.emailMasked ? { emailMasked: result.emailMasked } : {}),
      },
      { status: result.status }
    );
  }
  return NextResponse.json({
    ok: true,
    code: result.code,
    emailMasked: result.emailMasked,
    ...(allowDevEmailTokens() ? { mockedEmail: true, verifyToken: result.token } : {}),
  });
}
