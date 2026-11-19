import { z } from "zod";
import { isSiteProProduct, SITE_PRO_PRODUCT_CODE } from "./pro-products.ts";
export { SITE_PRO_PRODUCT_CODE } from "./pro-products.ts";

export const manualProProducts = [
  { code: SITE_PRO_PRODUCT_CODE, label: "全站限期 Pro" },
  { code: "ca_exam_pro_60d", label: "California 旧产品" },
  { code: "hi_exam_pro_60d", label: "Hawaii 旧产品" },
  { code: "in_exam_pro_60d", label: "Indiana 旧产品" },
  { code: "nc_exam_pro_60d", label: "North Carolina 旧产品" },
] as const;

export const MAX_MANUAL_PRO_DAYS = 366;
export const MAX_MANUAL_PRO_REASON = 500;

export const manualProInput = z.object({
  requestId: z.string().uuid(),
  email: z.string().trim().max(254).email().toLowerCase(),
  productCode: z.string().refine(isSiteProProduct),
  days: z.coerce.number().int().min(1).max(MAX_MANUAL_PRO_DAYS),
  reason: z.string().trim().min(1).max(MAX_MANUAL_PRO_REASON).refine(value => !/[\p{Cc}\p{Cf}]/u.test(value)),
});
export type ManualProInput = z.infer<typeof manualProInput>;
