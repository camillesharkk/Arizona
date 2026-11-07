import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { clientIp } from "@/lib/rate-limit";
import { issueUserSession } from "@/lib/devices/http";
import { checkLoginCredentials } from "@/lib/auth/login";
import { consumeLoginAttempt } from "@/lib/auth/login-policy";
import { operationsAccess } from "@/lib/operations/report-view";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const body = schema.safeParse(raw);
  if (!body.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const admin = operationsAccess(body.data.email, process.env.OPERATIONS_ADMIN_EMAILS) === "ok";
  const store = await getStore();
  const checked = await checkLoginCredentials(store, body.data.email, body.data.password);
  if (!checked.ok) {
    const limited = consumeLoginAttempt(body.data.email, clientIp(req), process.env.OPERATIONS_ADMIN_EMAILS);
    if (!limited.ok) {
      return NextResponse.json(
        { error: "Too many incorrect passwords from this network. The account is not locked. Wait a minute, then use the correct password." },
        { status: 429 }
      );
    }
    return NextResponse.json(
      {
        error: checked.error,
        ...(checked.code
          ? { code: checked.code, message: checked.error }
          : {}),
      },
      { status: checked.status }
    );
  }
  const user = checked.user;
  await store.updateUser(user.id, { lastLoginAt: new Date().toISOString() });
  const issued = await issueUserSession(
    {
      id: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
      name: user.name,
    },
    { req, skipDeviceLimits: admin }
  );
  if (!issued.ok) {
    return NextResponse.json({ error: "Could not start the session. Try again." }, { status: 503 });
  }
  return NextResponse.json({ ok: true });
}
