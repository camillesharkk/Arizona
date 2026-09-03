import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getDeviceRepo } from "@/lib/devices";
import {
  listActivePublicDevices,
  revokeOwnDevice,
  signOutOtherDevices,
} from "@/lib/devices/service";
import { MAX_ACTIVE_DEVICES } from "@/lib/devices/policy";
import { PERSONAL_USE_NOTICE } from "@/lib/pricing/copy";

const postSchema = z.object({
  action: z.enum(["revoke", "sign-out-others"]),
  deviceId: z.string().uuid().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const repo = await getDeviceRepo();
  const devices = await listActivePublicDevices(repo, session.id, new Date(), session.deviceSessionId);
  return NextResponse.json({
    devices,
    activeCount: devices.length,
    maxActiveDevices: MAX_ACTIVE_DEVICES,
    currentDeviceId: session.deviceSessionId || null,
    notice: PERSONAL_USE_NOTICE,
  });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  const body = postSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const repo = await getDeviceRepo();
  if (body.data.action === "revoke") {
    if (!body.data.deviceId) return NextResponse.json({ error: "device_required" }, { status: 400 });
    const ok = await revokeOwnDevice(repo, { userId: session.id, deviceId: body.data.deviceId });
    if (!ok) return NextResponse.json({ error: "device_not_found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  }
  if (!session.deviceSessionId) {
    return NextResponse.json({ error: "device_required" }, { status: 400 });
  }
  await signOutOtherDevices(repo, { userId: session.id, keepDeviceId: session.deviceSessionId });
  return NextResponse.json({ ok: true });
}
