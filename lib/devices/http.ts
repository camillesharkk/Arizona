import "server-only";
import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/entitlements";
import { setSessionCookie } from "@/lib/session";
import { DEVICE_COOKIE, DEVICE_COOKIE_MAX_AGE } from "./policy.ts";
import { newDeviceToken } from "./label.ts";
import { getDeviceRepo } from "./index.ts";
import { activateDevice, type ActivateResult } from "./service.ts";

function cookieOpts() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: DEVICE_COOKIE_MAX_AGE,
  };
}

export async function readDeviceTokenCookie(): Promise<string | null> {
  const jar = await cookies();
  return jar.get(DEVICE_COOKIE)?.value || null;
}

export async function writeDeviceTokenCookie(token: string) {
  const jar = await cookies();
  jar.set(DEVICE_COOKIE, token, cookieOpts());
}

export async function issueUserSession(
  user: SessionUser,
  opts: { req: Request; revokeDeviceId?: string; now?: Date }
): Promise<ActivateResult> {
  const repo = await getDeviceRepo();
  let token = await readDeviceTokenCookie();
  if (!token) {
    token = newDeviceToken();
    await writeDeviceTokenCookie(token);
  }
  const result = await activateDevice(repo, {
    userId: user.id,
    token,
    userAgent: opts.req.headers.get("user-agent"),
    revokeDeviceId: opts.revokeDeviceId,
    now: opts.now,
  });
  if (!result.ok) return result;
  await writeDeviceTokenCookie(token);
  await setSessionCookie({ ...user, deviceSessionId: result.session.id });
  return result;
}

export async function refreshUserSession(user: SessionUser, deviceSessionId?: string | null) {
  await setSessionCookie({ ...user, deviceSessionId: deviceSessionId || user.deviceSessionId || null });
}
