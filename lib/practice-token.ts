import { createHash } from "node:crypto";
import { SignJWT, jwtVerify } from "jose";

export const ANON_COOKIE = "np_actor";

export function anonymousPracticeActor(value?: string) {
  // Existing guest IDs are 24 random bytes encoded as base64url. Account IDs are UUIDs.
  return value && /^[A-Za-z0-9_-]{32}$/.test(value) ? value : "";
}

export function practiceGuestSubject(anon: string) {
  return anon ? `guest:${createHash("sha256").update(anon).digest("base64url")}` : "";
}

export function ownsPractice(claims: PracticeClaims, accountId: string | undefined, anon: string) {
  return Boolean(claims.sub && (claims.sub === accountId ||
    (anon && (claims.sub === practiceGuestSubject(anon) || (!claims.versions && claims.sub === anon)))));
}

export type PracticeClaims = {
  sub: string;
  state: string;
  ids: string[];
  seed: number;
  pv: number;
  practice: boolean;
  revealed: boolean;
  purpose: "sitting" | "delivery";
  fullTrialId?: string;
  unscoredIds?: string[];
  versions?: number[];
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
      fullTrialId: typeof payload.fullTrialId === "string" ? payload.fullTrialId : undefined,
      unscoredIds: Array.isArray(payload.unscoredIds) ? payload.unscoredIds.filter((id): id is string => typeof id === "string" && ids.includes(id)) : undefined,
      versions: Array.isArray(payload.versions) && payload.versions.length === ids.length && payload.versions.every((version) => Number.isInteger(version) && version > 0) ? payload.versions : undefined,
    };
  } catch {
    return null;
  }
}
