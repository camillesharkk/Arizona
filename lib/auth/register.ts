import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import type { Store, UserRow } from "../store/types.ts";
import type { CommerceRepo } from "../commerce/repo.ts";
import { bindReferral, validateReferralCode } from "../commerce/service.ts";
import { issueVerificationEmail, type MailSender } from "./verify-mail.ts";
import { maskEmail } from "./guards.ts";
import { emailTombstoneHash, TombstoneSecretError } from "./tombstone.ts";

export type RegisterOk = {
  ok: true;
  code: "VERIFICATION_EMAIL_SENT";
  user: UserRow;
  token: string;
  emailMasked: string;
};

export type RegisterFail = {
  ok: false;
  status: number;
  code:
    | "EMAIL_ALREADY_REGISTERED"
    | "ACCOUNT_EXISTS_UNVERIFIED"
    | "VERIFICATION_EMAIL_FAILED"
    | "INVALID_REFERRAL"
    | "INVALID_INPUT"
    | "TOMBSTONE_UNAVAILABLE";
  error: string;
  accountCreated?: boolean;
  emailMasked?: string;
};

export async function registerAccount(opts: {
  store: Store;
  commerce: CommerceRepo;
  email: string;
  password: string;
  name?: string | null;
  referralCode?: string;
  send?: MailSender;
}): Promise<RegisterOk | RegisterFail> {
  const email = opts.email.trim().toLowerCase();
  const existing = await opts.store.getUserByEmail(email);
  if (existing?.emailVerified) {
    return {
      ok: false,
      status: 409,
      code: "EMAIL_ALREADY_REGISTERED",
      error: "Email already registered",
    };
  }
  if (existing && !existing.emailVerified) {
    return {
      ok: false,
      status: 409,
      code: "ACCOUNT_EXISTS_UNVERIFIED",
      error: "This account already exists but the email has not been verified.",
      emailMasked: maskEmail(email),
    };
  }

  const referralCode = opts.referralCode?.trim();
  let tombstone;
  try {
    tombstone = await opts.store.getTombstone(emailTombstoneHash(email));
  } catch (err) {
    if (err instanceof TombstoneSecretError) {
      return {
        ok: false,
        status: 503,
        code: "TOMBSTONE_UNAVAILABLE",
        error: "Could not complete registration.",
      };
    }
    throw err;
  }
  if (referralCode && !tombstone?.referralDiscountUsedOrIneligible) {
    const valid = await validateReferralCode(opts.commerce, referralCode);
    if (!valid.valid) {
      return { ok: false, status: 400, code: "INVALID_REFERRAL", error: "Invalid referral code" };
    }
  }

  const passwordHash = await bcrypt.hash(opts.password, 12);
  let user: UserRow;
  try {
    user = await opts.store.createUser({ email, passwordHash, name: opts.name || null });
  } catch {
    const raced = await opts.store.getUserByEmail(email);
    if (raced && !raced.emailVerified) {
      return {
        ok: false,
        status: 409,
        code: "ACCOUNT_EXISTS_UNVERIFIED",
        error: "This account already exists but the email has not been verified.",
        emailMasked: maskEmail(email),
      };
    }
    return { ok: false, status: 409, code: "EMAIL_ALREADY_REGISTERED", error: "Email already registered" };
  }

  await opts.commerce.putUser({
    id: user.id,
    createdAt: user.createdAt,
    emailVerifiedAt: null,
  });
  if (tombstone?.newcomerUsedOrIneligible) {
    await opts.commerce.insertPromotionRedemption({
      id: randomUUID(),
      userId: user.id,
      kind: "newcomer",
      orderId: "account_deletion",
      redeemedAt: new Date().toISOString(),
    });
  }
  if (referralCode && !tombstone?.referralDiscountUsedOrIneligible) {
    const bound = await bindReferral(opts.commerce, { referredUserId: user.id, code: referralCode });
    if (!bound.ok && bound.error !== "already_bound") {
      console.error("[register] referral bind failed");
    }
  }

  const issued = await issueVerificationEmail(opts.store, {
    userId: user.id,
    email,
    send: opts.send,
  });
  if (!issued.mail.ok) {
    return {
      ok: false,
      status: 502,
      code: "VERIFICATION_EMAIL_FAILED",
      error: "Your account was created, but we could not send the verification email.",
      accountCreated: true,
      emailMasked: maskEmail(email),
    };
  }
  return {
    ok: true,
    code: "VERIFICATION_EMAIL_SENT",
    user,
    token: issued.token,
    emailMasked: maskEmail(email),
  };
}
