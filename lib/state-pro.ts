import { isSiteProProduct } from "./pro-products.ts";
import { accountProCovers, accountProExpiry } from "./account-pro.ts";
import type { EntitlementRow } from "./store/types.ts";

export const NC_PRO_PRODUCT = "nc_exam_pro_60d";

export function stateProRows(rows: EntitlementRow[], state: string) {
  return rows.filter(row => isSiteProProduct(row.productCode));
}

export function stateProExpiry(rows: EntitlementRow[], state: string, now = new Date()) {
  return accountProExpiry(rows, now);
}

export function stateProCovers(rows: EntitlementRow[], state: string, now = new Date()) {
  return accountProCovers(rows, now);
}

export function clientStatePro(user: { ncPro?: boolean; connecticutPro?: boolean; indianaPro?: boolean; arizonaPro?: boolean; californiaPro?: boolean; hawaiiPro?: boolean; plan?: string } | null | undefined, state: string) {
  return Boolean(user?.arizonaPro || user?.californiaPro || user?.hawaiiPro || user?.connecticutPro || user?.ncPro || user?.indianaPro || user?.plan === "pro");
}

/** Attribute usage to products that provide shared account access. */
export function entitlementServesState(row: EntitlementRow, state: string) {
  return isSiteProProduct(row.productCode);
}
