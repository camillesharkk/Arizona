import { SignJWT, jwtVerify } from "jose";
import type { SessionUser } from "@/lib/entitlements";

export const SESSION_COOKIE = "az_session";
export const SESSION_AUTH_VERSION = 1;

function secret() {
  const s = process.env.AUTH_SECRET || "dev-only-change-AUTH_SECRET-before-production-32ch";
  return new TextEncoder().encode(s);
}

export async function signSession(user: SessionUser) {
  if (!user.deviceSessionId) {
    throw new Error("device_session_required");
  }
  return new SignJWT({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: user.emailVerified,
    name: user.name,
    deviceSessionId: user.deviceSessionId,
    sv: SESSION_AUTH_VERSION,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}

export async function readSessionToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const deviceSessionId = payload.deviceSessionId ? String(payload.deviceSessionId) : "";
    const sv = Number(payload.sv || 0);
    if (!deviceSessionId || sv !== SESSION_AUTH_VERSION) return null;
    return {
      id: String(payload.id || payload.sub),
      email: String(payload.email),
      plan: payload.plan === "pro" ? "pro" : "free",
      planStatus: String(payload.planStatus || "active"),
      emailVerified: Boolean(payload.emailVerified),
      name: payload.name ? String(payload.name) : null,
      deviceSessionId,
    };
  } catch {
    return null;
  }
}

export async function signLegacySession(user: Omit<SessionUser, "deviceSessionId">) {
  return new SignJWT({
    id: user.id,
    email: user.email,
    plan: user.plan,
    planStatus: user.planStatus,
    emailVerified: user.emailVerified,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret());
}
