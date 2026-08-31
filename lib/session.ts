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
    return {
      id: String(payload.id || payload.sub),
      email: String(payload.email),
      plan: payload.plan === "pro" ? "pro" : "free",
      planStatus: String(payload.planStatus || "active"),
      emailVerified: Boolean(payload.emailVerified),
      name: payload.name ? String(payload.name) : null,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  if (!token) return null;
  return readSessionToken(token);
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
