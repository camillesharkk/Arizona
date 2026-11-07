import { AZ_PRO_PRODUCT_CODE } from "./pricing/catalog.ts";

export const PRO_PRODUCTS = {
  AZ: { code: AZ_PRO_PRODUCT_CODE, paddleEnv: "PADDLE_PRODUCT_ID", label: "Arizona" },
  CA: { code: "ca_exam_pro_60d", paddleEnv: "PADDLE_PRODUCT_ID_CA", label: "California" },
  HI: { code: "hi_exam_pro_60d", paddleEnv: "PADDLE_PRODUCT_ID_HI", label: "Hawaii" },
} as const;

export type ProState = keyof typeof PRO_PRODUCTS;
export const PRO_PRODUCT_CODES = [PRO_PRODUCTS.AZ.code, PRO_PRODUCTS.CA.code, PRO_PRODUCTS.HI.code] as const;

export function proStateForCode(code: string): ProState | null {
  const found = (Object.keys(PRO_PRODUCTS) as ProState[]).find((state) => PRO_PRODUCTS[state].code === code);
  return found ?? null;
}

/** Catalog product id (pro_...). Missing or non-product values stay unset. */
export function paddleProductIdFor(state: ProState, env: NodeJS.ProcessEnv = process.env): string | null {
  const id = String(env[PRO_PRODUCTS[state].paddleEnv] || "").trim();
  return id.startsWith("pro_") ? id : null;
}
