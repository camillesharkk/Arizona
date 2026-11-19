import { hasLifetimePro } from "@/lib/account-pro";
import { nextProWindow } from "@/lib/entitlements";
import { isSiteProProduct, SITE_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import type { EntitlementRow } from "@/lib/store/types";

type GrantErrorCode = "lifetime" | "product" | "account" | "request" | "unavailable";

export class ManualProGrantError extends Error {
  constructor(public readonly code: GrantErrorCode) {
    super(code);
  }
}

export function manualProWindow(rows: EntitlementRow[], productCode: string, days: number, now: Date) {
  if (!isSiteProProduct(productCode)) throw new ManualProGrantError("product");
  if (hasLifetimePro(rows, now)) throw new ManualProGrantError("lifetime");

  const timed = rows.filter(row => isSiteProProduct(row.productCode) && row.expiresAt)
    .sort((a, b) => Date.parse(b.expiresAt!) - Date.parse(a.expiresAt!));
  const sameProduct = timed.find(row => row.productCode === productCode);
  if (!sameProduct && productCode !== SITE_PRO_PRODUCT_CODE) throw new ManualProGrantError("product");

  // Join contiguous active windows. A future row beyond a gap cannot serve the user today.
  let coveredUntil = now.getTime();
  const windows = timed.filter(row => row.status === "active")
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  for (const row of windows) {
    if (Date.parse(row.startsAt) > coveredUntil) break;
    coveredUntil = Math.max(coveredUntil, Date.parse(row.expiresAt!));
  }
  const latestActive = coveredUntil > now.getTime() ? new Date(coveredUntil) : null;
  const historical = timed.find(row => Date.parse(row.startsAt) <= now.getTime())?.expiresAt;
  const previousExpiresAt = latestActive?.toISOString() ?? (historical ? new Date(historical).toISOString() : null);
  const window = nextProWindow(latestActive, now, days);
  return {
    previousExpiresAt,
    state: sameProduct?.state ?? "ALL",
    startsAt: window.startsAt.toISOString(),
    expiresAt: window.expiresAt.toISOString(),
  };
}
