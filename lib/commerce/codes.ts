import { randomBytes } from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function generateReferralCode(): string {
  const bytes = randomBytes(8);
  let out = "AZ";
  for (let i = 0; i < 8; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}

export function isReferralCodeFormat(code: string): boolean {
  const n = normalizeReferralCode(code);
  return /^AZ[A-Z0-9]{8}$/.test(n);
}
