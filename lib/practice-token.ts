import { SignJWT, jwtVerify } from "jose";

export const ANON_COOKIE = "np_actor";

export type PracticeClaims = {
  sub: string;
  state: string;
  ids: string[];
  seed: number;
  pv: number;
  practice: boolean;
  revealed: boolean;
  purpose: "sitting" | "delivery";
};

function secret() {
  const value = process.env.AUTH_SECRET || "dev-only-change-AUTH_SECRET-before-production-32ch";
  return new TextEncoder().encode(value);
}

export async function signPractice(claims: PracticeClaims, ttl = "12h") {
  return new SignJWT({ ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret());
}

export async function readPractice(token: string): Promise<PracticeClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    const ids = Array.isArray(payload.ids) ? payload.ids.filter((id): id is string => typeof id === "string") : [];
    const purpose = payload.purpose === "delivery" ? "delivery" : payload.purpose === "sitting" ? "sitting" : null;
    if (!purpose || !ids.length || ids.length > 80) return null;
    return {
      sub: String(payload.sub || ""),
      state: String(payload.state || ""),
      ids,
      seed: Number(payload.seed || 0),
      pv: Number(payload.pv || 2),
      practice: Boolean(payload.practice),
      revealed: Boolean(payload.revealed),
      purpose,
    };
  } catch {
    return null;
  }
}
