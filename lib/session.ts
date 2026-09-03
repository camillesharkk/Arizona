import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/entitlements";
import { SESSION_COOKIE, readSessionToken, signSession } from "@/lib/session-token";
import { evaluateBoundSession, touchIfNeeded } from "@/lib/devices/service";

export { signSession, readSessionToken, SESSION_COOKIE, SESSION_AUTH_VERSION } from "@/lib/session-token";

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const user = await readSessionToken(token);
  if (!user) {
    jar.delete(SESSION_COOKIE);
    return null;
  }
  try {
    const { getDeviceRepo } = await import("@/lib/devices");
    const repo = await getDeviceRepo();
    const bound = await evaluateBoundSession(repo, user);
    if (!bound.ok) {
      jar.delete(SESSION_COOKIE);
      return null;
    }
    await touchIfNeeded(repo, user.deviceSessionId!);
    const { getStore } = await import("@/lib/store");
    const store = await getStore();
    const row = await store.getUserById(user.id);
    if (!row || row.deletedAt || !row.emailVerified) {
      jar.delete(SESSION_COOKIE);
      return null;
    }
    return user;
  } catch {
    jar.delete(SESSION_COOKIE);
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  if (!user.deviceSessionId) {
    throw new Error("device_session_required");
  }
  const jar = await cookies();
  const token = await signSession(user);
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}
