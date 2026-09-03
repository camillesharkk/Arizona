import { createHmac } from "crypto";

export type AccountDeletionTombstone = {
  emailHmac: string;
  deletedAt: string;
  newcomerUsedOrIneligible: boolean;
  referralDiscountUsedOrIneligible: boolean;
  hadPaidOrder: boolean;
};

export class TombstoneSecretError extends Error {
  constructor() {
    super("Account tombstone secret is not configured");
    this.name = "TombstoneSecretError";
  }
}

function tombstoneSecret() {
  const secret = (process.env.ACCOUNT_TOMBSTONE_SECRET || "").trim();
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[tombstone] ACCOUNT_TOMBSTONE_SECRET is not configured");
    }
    throw new TombstoneSecretError();
  }
  return secret;
}

export function emailTombstoneHash(email: string) {
  return createHmac("sha256", tombstoneSecret()).update(email.trim().toLowerCase()).digest("hex");
}
