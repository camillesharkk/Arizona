import { operationsAccess } from "../operations/report-view.ts";
import { rateLimit } from "../rate-limit.ts";

export const LOGIN_ATTEMPT_LIMIT = 12;
export const LOGIN_ATTEMPT_WINDOW_MS = 60_000;

/** Admin allowlist matches skip the shared IP login bucket. The bucket itself stays for everyone else. */
export function consumeLoginAttempt(email: string, ip: string, allowlist: string | undefined) {
  if (operationsAccess(email, allowlist) === "ok") return { ok: true as const };
  return rateLimit(`login:${ip}`, LOGIN_ATTEMPT_LIMIT, LOGIN_ATTEMPT_WINDOW_MS);
}
