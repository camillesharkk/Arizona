import { isCaliforniaPath } from "@/lib/ca-site";
import { isHawaiiPath } from "@/lib/hi-site";
import { isComingSoonPath } from "@/lib/states";

export const STATE_COOKIE = "np_state";
export type LiveCode = "AZ" | "CA" | "HI";

const sharedPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/account", "/dashboard", "/contact", "/legal"];

/** State implied by the URL. Shared pages and coming-soon pages do not imply one. */
export function pathState(pathname: string): LiveCode | null {
  const path = (pathname.split("?")[0] || "/").split("#")[0] || "/";
  if (path === "/" || isComingSoonPath(path)) return null;
  if (path.startsWith("/api") || path.startsWith("/admin")) return null;
  if (isCaliforniaPath(path)) return "CA";
  if (isHawaiiPath(path)) return "HI";
  if (sharedPaths.some((item) => path === item || path.startsWith(`${item}/`))) return null;
  return "AZ";
}

export function parseStateCookie(value: string | undefined | null): LiveCode | null {
  return value === "AZ" || value === "CA" || value === "HI" ? value : null;
}

/** A state page wins. Otherwise use the saved choice. */
export function resolveState(pathname: string, saved: LiveCode | null): LiveCode | null {
  return pathState(pathname) ?? saved;
}

export function writeStateCookie(state: LiveCode) {
  if (typeof document === "undefined") return;
  document.cookie = `${STATE_COOKIE}=${state}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
