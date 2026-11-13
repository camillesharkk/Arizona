import type { EntitlementRow } from "./store/types.ts";
import { isSiteProProduct } from "./pro-products.ts";

function scopeMatches(row: EntitlementRow, scope?: "CT") {
  return scope === "CT" ? row.state === "CT" || row.state === "ALL" : row.state !== "CT";
}

export function accountProExpiry(rows: EntitlementRow[], now = new Date(), scope?: "CT"): Date | null {
  const active = rows.filter((row) => scopeMatches(row, scope) && row.status === "active" && isSiteProProduct(row.productCode) && new Date(row.expiresAt).getTime() > now.getTime());
  const byOrder = new Map<string, EntitlementRow>();
  for (const row of active) {
    const key = `${row.provider}:${row.providerOrderId}`;
    const prev = byOrder.get(key);
    if (!prev || new Date(row.expiresAt).getTime() > new Date(prev.expiresAt).getTime()) byOrder.set(key, row);
  }
  const groups = [...byOrder.values()];
  if (!groups.length) return null;
  if (groups.length === 1) return new Date(groups[0].expiresAt);
  let remaining = 0;
  for (const row of groups) {
    const start = new Date(row.startsAt).getTime();
    const end = new Date(row.expiresAt).getTime();
    remaining += Math.max(0, end - Math.max(start, now.getTime()));
  }
  return remaining > 0 ? new Date(now.getTime() + remaining) : null;
}

export function ctProCovers(rows: EntitlementRow[], now = new Date()) {
  return accountProCovers(rows, now, "CT");
}

export function accountProCovers(rows: EntitlementRow[], now = new Date(), scope?: "CT") {
  const expiry = accountProExpiry(rows, now, scope);
  if (!expiry || expiry.getTime() <= now.getTime()) return false;
  return rows.some((row) => {
    if (!scopeMatches(row, scope) || row.status !== "active" || !isSiteProProduct(row.productCode)) return false;
    return new Date(row.startsAt).getTime() <= now.getTime() && new Date(row.expiresAt).getTime() > now.getTime();
  });
}
