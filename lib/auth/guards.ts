import type { UserRow } from "../store/types.ts";

export function isDeletedUser(user: Pick<UserRow, "deletedAt"> | null | undefined) {
  return Boolean(user?.deletedAt);
}

export function authBlockReason(
  user: Pick<UserRow, "emailVerified" | "deletedAt"> | null | undefined
): "deleted" | "unverified" | null {
  if (!user || isDeletedUser(user)) return "deleted";
  if (!user.emailVerified) return "unverified";
  return null;
}

export function maskEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  return `${local.slice(0, 1)}***${domain}`;
}
