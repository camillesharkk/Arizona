import type { EntitlementRow } from "./store/types.ts";
import { isLifetimeProProduct, isSiteProProduct } from "./pro-products.ts";

export function activeLifetimePro(rows: EntitlementRow[], now = new Date()) {
  return rows.find(row => row.state === "ALL" && row.status === "active" && isLifetimeProProduct(row.productCode)
    && row.expiresAt === null && Date.parse(row.startsAt) <= now.getTime()) ?? null;
}

export function hasLifetimePro(rows: EntitlementRow[], now = new Date()) {
  return activeLifetimePro(rows, now) !== null;
}

type TimedEntitlement = EntitlementRow & { expiresAt: string };

export function accountTimedProExpiry(rows: EntitlementRow[], now = new Date()): Date | null {
  const active = rows.filter((row): row is TimedEntitlement =>
    row.status === "active" && isSiteProProduct(row.productCode) && row.expiresAt !== null && Date.parse(row.expiresAt) > now.getTime());
  const byOrder = new Map<string, TimedEntitlement>();
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

export function accountProExpiry(rows: EntitlementRow[], now = new Date(), _scope?: "CT"): Date | null {
  return hasLifetimePro(rows, now) ? null : accountTimedProExpiry(rows, now);
}

export function ctProCovers(rows: EntitlementRow[], now = new Date()) {
  return accountProCovers(rows, now, "CT");
}

export function accountProCovers(rows: EntitlementRow[], now = new Date(), _scope?: "CT") {
  if (hasLifetimePro(rows, now)) return true;
  const expiry = accountTimedProExpiry(rows, now);
  if (!expiry || expiry.getTime() <= now.getTime()) return false;
  return rows.some((row) => {
    if (row.status !== "active" || !isSiteProProduct(row.productCode) || row.expiresAt === null) return false;
    return new Date(row.startsAt).getTime() <= now.getTime() && new Date(row.expiresAt).getTime() > now.getTime();
  });
}
