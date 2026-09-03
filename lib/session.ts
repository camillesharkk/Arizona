import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { SessionUser } from "@/lib/entitlements";

const COOKIE = "az_session";

function secret() {
  const s = process.env.AUTH_SECRET || "dev-only-change-AUTH_SECRET-before-production-32ch";
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: user.emailVerified,
    name: user.name,
    deviceSessionId: user.deviceSessionId || null,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("30d")
    .setSubject(user.id)
    .setIssuedAt()
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id || payload.sub),
      email: String(payload.email),
      plan: payload.plan === "pro" ? "pro" : "free",
      planStatus: String(payload.planStatus || "active"),
      emailVerified: Boolean(payload.emailVerified),
      name: payload.name ? String(payload.name) : null,
      deviceSessionId: payload.deviceSessionId ? String(payload.deviceSessionId) : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const user = await readSessionToken(token);
  if (!user) return null;
  if (!user.deviceSessionId) return user;
  try {
    const { getDeviceRepo } = await import("@/lib/devices");
    const { sessionIsUsable, touchIfNeeded } = await import("@/lib/devices/service");
    const repo = await getDeviceRepo();
    const row = await sessionIsUsable(repo, user.deviceSessionId);
    if (!row || row.userId !== user.id || row.revokedAt) return null;
    await touchIfNeeded(repo, user.deviceSessionId);
    return user;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: SessionUser) {
  const jar = await cookies();
  const token = await signSession(user);
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}
