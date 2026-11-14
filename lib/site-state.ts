import { isCaliforniaPath } from "@/lib/ca-site";
import { isHawaiiPath } from "@/lib/hi-site";
import { isComingSoonPath } from "@/lib/states";
import type { StateCode } from "@/lib/types";

export const STATE_COOKIE = "np_state";
export type LiveCode = StateCode;

import { freeStateCatalog } from "./free-state-catalog";

const sharedPaths = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/account", "/dashboard", "/contact", "/legal"];

/** State implied by the URL. Shared pages and coming-soon pages do not imply one. */
export function pathState(pathname: string): LiveCode | null {
  const path = (pathname.split("?")[0] || "/").split("#")[0] || "/";
  const free = freeStateCatalog.find(([, , slug]) => path === `/${slug}` || path.startsWith(`/${slug}/`));
  if (free) return free[0];
  if (path === "/indiana" || path.startsWith("/indiana/") || path.startsWith("/preview/indiana")) return "IN";
  if (path === "/" || (isComingSoonPath(path) && !path.startsWith("/north-carolina"))) return null;
  if (path.startsWith("/api") || path.startsWith("/admin")) return null;
  if (isCaliforniaPath(path)) return "CA";
  if (isHawaiiPath(path)) return "HI";
  if (path.startsWith("/preview/new-york") || path.startsWith("/new-york/") || path === "/new-york") return "NY";
  if (path.startsWith("/preview/pennsylvania") || path.startsWith("/pennsylvania/") || path === "/pennsylvania") return "PA";
  if (path.startsWith("/connecticut/") || path === "/connecticut") return "CT";
  if (path.startsWith("/preview/louisiana") || path.startsWith("/louisiana/") || path === "/louisiana") return "LA";
  if (path.startsWith("/preview/north-carolina") || path.startsWith("/north-carolina/") || path === "/north-carolina") return "NC";
  if (sharedPaths.some((item) => path === item || path.startsWith(`${item}/`))) return null;
  return "AZ";
}

const CODES = new Set<LiveCode>(["AZ", "CA", "HI", "NY", "PA", "LA", "CT", "NC", "IN", "AR", "CO", "IL", "ME", "MD", "MO", "MT", "NE", "NV", "NJ", "NM", "OH", "OR", "UT", "VT", "WI", "WY"]);

export function parseStateCookie(value: string | undefined | null): LiveCode | null {
  return value && CODES.has(value as LiveCode) ? (value as LiveCode) : null;
}

/** A state page wins. Otherwise use the saved choice. */
export function resolveState(pathname: string, saved: LiveCode | null): LiveCode | null {
  return pathState(pathname) ?? saved;
}

export function writeStateCookie(state: LiveCode) {
  if (typeof document === "undefined") return;
  document.cookie = `${STATE_COOKIE}=${state}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
