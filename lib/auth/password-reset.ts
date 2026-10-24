import type { Store, UserRow } from "../store/types.ts";

export function normalizeAccountEmail(email: string) {
  return email.trim().toLowerCase();
}

export function verificationAfterPasswordReset(
  user: Pick<UserRow, "email" | "emailVerified" | "emailVerifiedAt">,
  sentToEmail: string | null | undefined,
  now: string
): { ok: true; emailVerified: boolean; emailVerifiedAt: string | null } | { ok: false } {
  const sent = sentToEmail ? normalizeAccountEmail(sentToEmail) : "";
  if (sent && sent !== normalizeAccountEmail(user.email)) return { ok: false };
  if (user.emailVerified) {
    return { ok: true, emailVerified: true, emailVerifiedAt: user.emailVerifiedAt };
  }
  if (sent && sent === normalizeAccountEmail(user.email)) {
    return { ok: true, emailVerified: true, emailVerifiedAt: user.emailVerifiedAt || now };
  }
  return { ok: true, emailVerified: false, emailVerifiedAt: user.emailVerifiedAt };
}

/** Consume a reset token and update the password. A matching current-email token also verifies that inbox. */
export async function completePasswordReset(
  store: Store,
  token: string,
  passwordHash: string,
  now = new Date().toISOString()
): Promise<{ ok: true; userId: string; emailVerified: boolean } | { ok: false }> {
  const row = await store.takeToken(token, "reset");
  if (!row) return { ok: false };
  const target = await store.getUserById(row.userId);
  if (!target || target.deletedAt) return { ok: false };
  const decision = verificationAfterPasswordReset(target, row.sentToEmail, now);
  if (!decision.ok) return { ok: false };
  await store.updateUser(target.id, {
    passwordHash,
    emailVerified: decision.emailVerified,
    emailVerifiedAt: decision.emailVerifiedAt,
  });
  return { ok: true, userId: target.id, emailVerified: decision.emailVerified };
}
