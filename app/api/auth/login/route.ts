import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { issueUserSession } from "@/lib/devices/http";
import { MAX_ACTIVE_DEVICES } from "@/lib/devices/policy";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  revokeDeviceId: z.string().uuid().optional(),
});

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
  const issued = await issueUserSession(
    {
      id: user.id,
      email: user.email,
      plan: user.plan,
      planStatus: user.planStatus,
      emailVerified: user.emailVerified,
      name: user.name,
    },
    { req, revokeDeviceId: body.data.revokeDeviceId }
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
