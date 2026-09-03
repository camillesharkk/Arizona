import { NextResponse } from "next/server";
import { getSession, clearSessionCookie } from "@/lib/session";
import { getDeviceRepo } from "@/lib/devices";
import { signOutCurrent } from "@/lib/devices/service";

export async function POST() {
  const session = await getSession();
  if (session?.deviceSessionId) {
    const repo = await getDeviceRepo();
    await signOutCurrent(repo, { userId: session.id, deviceSessionId: session.deviceSessionId });
  }
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
