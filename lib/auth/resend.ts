import { rateLimit } from "../rate-limit.ts";
import type { Store } from "../store/types.ts";
import { issueVerificationEmail, type MailSender } from "./verify-mail.ts";

export const VERIFY_RESEND_COOLDOWN_MS = 60_000;
export const VERIFY_RESEND_HOUR_LIMIT = 5;
export const VERIFY_RESEND_IP_HOUR_LIMIT = 10;

export async function resendVerification(opts: {
  store: Store;
  email: string;
  ip: string;
  send?: MailSender;
}) {
  if (!rateLimit(`verify-ip:${opts.ip}`, VERIFY_RESEND_IP_HOUR_LIMIT, 60 * 60 * 1000).ok) {
    return { ok: false as const, status: 429, error: "Too many attempts" };
  }
  const email = opts.email.trim().toLowerCase();
  if (!rateLimit(`verify-email:${email}`, 1, VERIFY_RESEND_COOLDOWN_MS).ok) {
    return { ok: false as const, status: 429, error: "Please wait before requesting another email." };
  }
  if (!rateLimit(`verify-email-hour:${email}`, VERIFY_RESEND_HOUR_LIMIT, 60 * 60 * 1000).ok) {
    return { ok: false as const, status: 429, error: "Too many verification emails. Try again later." };
  }
  const user = await opts.store.getUserByEmail(email);
  if (!user || user.deletedAt || user.emailVerified) {
    return { ok: true as const, sent: false as const };
  }
  const issued = await issueVerificationEmail(opts.store, {
    userId: user.id,
    email: user.email,
    send: opts.send,
  });
  if (!issued.mail.ok) {
    return { ok: false as const, status: 502, error: issued.mail.error };
  }
  return { ok: true as const, sent: true as const, token: issued.token };
}
