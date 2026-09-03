import { createHmac } from "crypto";

export type AccountDeletionTombstone = {
  emailHmac: string;
  deletedAt: string;
  newcomerUsedOrIneligible: boolean;
  referralDiscountUsedOrIneligible: boolean;
  hadPaidOrder: boolean;
};

function tombstoneSecret() {
  return process.env.AUTH_SECRET || "dev-only-change-AUTH_SECRET-before-production-32ch";
}

export function emailHmac(email: string) {
  return createHmac("sha256", tombstoneSecret()).update(email.trim().toLowerCase()).digest("hex");
}
