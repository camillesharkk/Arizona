import { randomBytes } from "crypto";
import type { Store } from "../store/types.ts";

export type MailSender = (
  to: string,
  subject: string,
  html: string,
  opts?: { replyTo?: string }
) => Promise<{ ok: true; mocked: boolean; messageId?: string } | { ok: false; error: string }>;

export const VERIFY_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function newVerifyToken() {
  return randomBytes(32).toString("hex");
}

export async function issueVerificationEmail(
  store: Store,
  opts: { userId: string; email: string; send?: MailSender; now?: Date }
) {
  const now = opts.now ?? new Date();
  const token = newVerifyToken();
  await store.putToken({
    token,
    type: "verify",
    userId: opts.userId,
    expiresAt: new Date(now.getTime() + VERIFY_TOKEN_TTL_MS).toISOString(),
  });
  let send = opts.send;
  let subject = "Verify your Arizona Notary Prep account";
  let html = "Verify your email.";
  if (!send) {
    const emailLib = await import("../email.ts");
    send = emailLib.sendMail;
    subject = emailLib.VERIFY_SUBJECT;
    html = emailLib.verificationEmailHtml(emailLib.verifyUrl(token));
  }
  const mail = await send(opts.email, subject, html);
  return { mail, token };
}
