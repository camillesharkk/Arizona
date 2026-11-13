import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { Buffer } from "node:buffer";
import { cookies } from "next/headers";
import { newIndianaSitting } from "@/lib/indiana-sitting";

const COOKIE = "np_in_trial";
export type IndianaGuest = { owner: string; createdAt: string };
function signature(value: string) {
  return createHmac("sha256", process.env.AUTH_SECRET || "dev-only-indiana-trial-change-before-production").update(`indiana-trial-v1:${value}`).digest("base64url");
}
export function encodeIndianaGuest(guest: IndianaGuest) {
  const value = Buffer.from(JSON.stringify(guest)).toString("base64url");
  return `${value}.${signature(value)}`;
}
export function decodeIndianaGuest(token?: string): IndianaGuest | null {
  if (!token) return null;
  try {
    const [value, signed, extra] = token.split(".");
    const expected = Buffer.from(signature(value));
    const received = Buffer.from(signed || "");
    if (extra || received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
    const guest = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as IndianaGuest;
    return /^[a-f0-9-]{36}$/.test(guest.owner) && Number.isFinite(Date.parse(guest.createdAt)) ? guest : null;
  } catch { return null; }
}
export async function readIndianaGuest() {
  return decodeIndianaGuest((await cookies()).get(COOKIE)?.value);
}
export async function saveIndianaGuest(guest: IndianaGuest) {
  (await cookies()).set(COOKIE, encodeIndianaGuest(guest), {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 365,
  });
}
export async function ensureIndianaGuest() {
  const existing = await readIndianaGuest();
  if (existing) return existing;
  const guest = { owner: randomUUID(), createdAt: new Date().toISOString() };
  await saveIndianaGuest(guest);
  return guest;
}

/** Lost start responses reconstruct the same reservation rather than another draw. */
export function indianaGuestSitting(guest: IndianaGuest) {
  const digest = signature(`sitting:${guest.owner}`);
  const hex = Buffer.from(digest, "base64url").toString("hex");
  const examId = `${hex.slice(0,8)}-${hex.slice(8,12)}-4${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;
  const seed = Number.parseInt(hex.slice(32,40),16) % 1000000001;
  return newIndianaSitting(false, examId, seed, guest.createdAt);
}
