import { AZ_PRO_PRODUCT_CODE } from "./pricing/catalog.ts";

/** The live catalog product. One purchase covers every available state. */
export const SITE_PRO_PRODUCT_CODE = AZ_PRO_PRODUCT_CODE;

const HISTORICAL_PRO_CODES = new Set([
  SITE_PRO_PRODUCT_CODE,
  "ca_exam_pro_60d",
  "hi_exam_pro_60d",
  "in_exam_pro_60d",
  "nc_exam_pro_60d",
]);

export function isSiteProProduct(code: string) {
  return HISTORICAL_PRO_CODES.has(code);
}
