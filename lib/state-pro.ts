import { isSiteProProduct } from "./pro-products.ts";
import { accountProCovers, accountProExpiry } from "./account-pro.ts";
import type { EntitlementRow } from "./store/types.ts";

export const NC_PRO_PRODUCT = "nc_exam_pro_60d";

export function stateProRows(rows: EntitlementRow[], state: string) {
  return state === "NC" ? rows.filter(row => row.state === "NC" && row.productCode === NC_PRO_PRODUCT) : rows;
}

export function stateProExpiry(rows: EntitlementRow[], state: string, now = new Date()) {
  if (state !== "NC") return accountProExpiry(rows, now);
  const windows = stateProRows(rows, state)
    .filter(row => row.status === "active" && new Date(row.expiresAt) > now)
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt));
  let expiry = now.getTime();
  for (const row of windows) {
    if (Date.parse(row.startsAt) <= expiry) expiry = Math.max(expiry, Date.parse(row.expiresAt));
  }
  return expiry > now.getTime() ? new Date(expiry) : null;
}

export function stateProCovers(rows: EntitlementRow[], state: string, now = new Date()) {
  return state === "NC" ? Boolean(stateProExpiry(rows, state, now)) : accountProCovers(rows, now);
}

export function clientStatePro(user: { ncPro?: boolean; connecticutPro?: boolean; indianaPro?: boolean; arizonaPro?: boolean; californiaPro?: boolean; hawaiiPro?: boolean; plan?: string } | null | undefined, state: string) {
  if (state === "IN") return Boolean(user?.indianaPro);
  if (state === "CT") return Boolean(user?.connecticutPro);
  if (state === "NC") return Boolean(user?.ncPro);
  return Boolean(user?.arizonaPro || user?.californiaPro || user?.hawaiiPro || user?.plan === "pro");
}

/** Apply the same product/state scope to usage attribution as to authorization. */
export function entitlementServesState(row: EntitlementRow, state: string) {
 if(state==='NC')return row.state==='NC' && row.productCode===NC_PRO_PRODUCT;
 if(state==='IN')return row.state==='IN' && row.productCode==='in_exam_pro_60d';
 if(state==='CT')return (row.state==='CT' || row.state==='ALL') && isSiteProProduct(row.productCode);
 return row.state!=='CT' && isSiteProProduct(row.productCode);
}
