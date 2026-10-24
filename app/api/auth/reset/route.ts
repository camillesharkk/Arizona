import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getStore } from "@/lib/store";
import { getSession } from "@/lib/session";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getDeviceRepo } from "@/lib/devices";
import { revokeAllDevices, revokeOthersKeepCurrent } from "@/lib/devices/service";
import { refreshUserSession } from "@/lib/devices/http";
import { completePasswordReset } from "@/lib/auth/password-reset";

export async function POST(req: Request) {
  const limited = rateLimit(`reset:${clientIp(req)}`, 8, 60_000);
  if (!limited.ok) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
  const body = z
    .object({ token: z.string().optional(), currentPassword: z.string().optional(), password: z.string().min(8) })
    .safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  const store = await getStore();
  if (body.data.token) {
    const hash = await bcrypt.hash(body.data.password, 12);
    const reset = await completePasswordReset(store, body.data.token, hash);
    if (!reset.ok) return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    const devices = await getDeviceRepo();
    await revokeAllDevices(devices, { userId: reset.userId });
    return NextResponse.json({ ok: true });
  }
  const session = await getSession();
  if (!session || !body.data.currentPassword) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await store.getUserById(session.id);
  if (!user || !(await bcrypt.compare(body.data.currentPassword, user.passwordHash))) {
    return NextResponse.json({ error: "Current password is wrong" }, { status: 401 });
  }
  const passwordHash = await bcrypt.hash(body.data.password, 12);
  const next = await store.updateUser(user.id, { passwordHash });
  const devices = await getDeviceRepo();
  await revokeOthersKeepCurrent(devices, { userId: next.id, keepDeviceId: session.deviceSessionId });
  await refreshUserSession(
    {
      id: next.id,
      email: next.email,
      plan: next.plan,
      planStatus: next.planStatus,
      emailVerified: next.emailVerified,
      name: next.name,
    },
    session.deviceSessionId
  );
  return NextResponse.json({ ok: true });
}
