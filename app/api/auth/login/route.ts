import { NextResponse } from "next/server";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { clientIp } from "@/lib/rate-limit";
import { issueUserSession } from "@/lib/devices/http";
import { MAX_ACTIVE_DEVICES } from "@/lib/devices/policy";
import { checkLoginCredentials } from "@/lib/auth/login";
import { consumeLoginAttempt } from "@/lib/auth/login-policy";
import { operationsAccess } from "@/lib/operations/report-view";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  revokeDeviceId: z.string().uuid().optional(),
});

export async function POST(req: Request) {
  const raw = await req.json().catch(() => null);
  const body = schema.safeParse(raw);
  const email = body.success ? body.data.email : "";
  const limited = consumeLoginAttempt(email, clientIp(req), process.env.OPERATIONS_ADMIN_EMAILS);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  if (!body.success) return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
  const admin = operationsAccess(body.data.email, process.env.OPERATIONS_ADMIN_EMAILS) === "ok";
  const store = await getStore();
  const checked = await checkLoginCredentials(store, body.data.email, body.data.password);
  if (!checked.ok) {
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
    { req, revokeDeviceId: body.data.revokeDeviceId, skipDeviceLimits: admin }
  );
  if (!issued.ok && issued.error === "DEVICE_LIMIT_REACHED") {
    return NextResponse.json(
      {
        error: "DEVICE_LIMIT_REACHED",
        code: "DEVICE_LIMIT_REACHED",
        devices: issued.devices,
        maxActiveDevices: MAX_ACTIVE_DEVICES,
        message: `Your account can be active on up to ${MAX_ACTIVE_DEVICES} devices at a time.`,
      },
      { status: 403 }
    );
  }
  if (!issued.ok && issued.error === "TOO_MANY_DEVICE_CHANGES") {
    return NextResponse.json(
      {
        error: "TOO_MANY_DEVICE_CHANGES",
        code: "TOO_MANY_DEVICE_CHANGES",
        message:
          "For account security, too many new devices have been activated recently. Please try again later or contact support.",
      },
      { status: 403 }
    );
  }
  return NextResponse.json({ ok: true });
}
