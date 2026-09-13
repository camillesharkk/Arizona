import { Environment, Paddle, type CreateTransactionRequestBody } from "@paddle/paddle-node-sdk";
import { AZ_PRO_PRODUCT_CODE, CURRENCY } from "../pricing/catalog.ts";

export const PADDLE_PROVIDER = "paddle" as const;

export const PADDLE_PRICE_NAME = "60-Day Pro Access";
export const PADDLE_PRICE_DESCRIPTION = "Arizona Notary Exam Pro - 60-day one-time access";

export type PaddleEnvName = "sandbox" | "production";
export type PaddleEnvMap = Record<string, string | undefined>;

export type PaddleCheckoutConfig = {
  apiKey: string;
  productId: string;
  environment: PaddleEnvName;
};

export type PaddleWebhookConfig = PaddleCheckoutConfig & {
  webhookSecret: string;
};

export type PaddleConfig = PaddleWebhookConfig;

export type PaddleConfigError = { ok: false; error: string; missing: string[] };
export type PaddleCheckoutConfigOk = { ok: true; config: PaddleCheckoutConfig };
export type PaddleWebhookConfigOk = { ok: true; config: PaddleWebhookConfig };
export type PaddleConfigOk = PaddleWebhookConfigOk;

export type PaddleCustomData = {
  user_id: string;
  quote_id: string;
  product_code: string;
};

function missingNamed(env: PaddleEnvMap, keys: string[]) {
  return keys.filter((k) => !String(env[k] || "").trim());
}

export function isPaddleProvider(env: PaddleEnvMap = process.env) {
  return (env.MOR_PROVIDER || "mock").toLowerCase() === "paddle";
}

export function parsePaddleEnvironment(env: PaddleEnvMap = process.env): { ok: true; environment: PaddleEnvName } | PaddleConfigError {
  const raw = env.PADDLE_ENVIRONMENT;
  if (raw == null || !String(raw).trim()) {
    return { ok: false, error: "PADDLE_CONFIG_MISSING", missing: ["PADDLE_ENVIRONMENT"] };
  }
  const value = String(raw).trim().toLowerCase();
  if (value === "sandbox") return { ok: true, environment: "sandbox" };
  if (value === "production") return { ok: true, environment: "production" };
  return { ok: false, error: "PADDLE_ENVIRONMENT_INVALID", missing: ["PADDLE_ENVIRONMENT"] };
}

export function getPaddleCheckoutConfig(env: PaddleEnvMap = process.env): PaddleCheckoutConfigOk | PaddleConfigError {
  const missing = missingNamed(env, ["PADDLE_API_KEY", "PADDLE_PRODUCT_ID"]);
  const mode = parsePaddleEnvironment(env);
  if (!mode.ok) {
    return { ok: false, error: mode.error, missing: [...new Set([...missing, ...mode.missing])] };
  }
  if (missing.length) return { ok: false, error: "PADDLE_CONFIG_MISSING", missing };
  const productId = String(env.PADDLE_PRODUCT_ID).trim();
  if (!/^pro_/i.test(productId)) {
    return { ok: false, error: "PADDLE_CONFIG_INVALID", missing: [] };
  }
  return {
    ok: true,
    config: {
      apiKey: String(env.PADDLE_API_KEY).trim(),
      productId,
      environment: mode.environment,
    },
  };
}

export function getPaddleWebhookConfig(env: PaddleEnvMap = process.env): PaddleWebhookConfigOk | PaddleConfigError {
  const checkout = getPaddleCheckoutConfig(env);
  const secretMissing = missingNamed(env, ["PADDLE_WEBHOOK_SECRET"]);
  if (!checkout.ok) {
    return { ok: false, error: checkout.error, missing: [...new Set([...checkout.missing, ...secretMissing])] };
  }
  if (secretMissing.length) return { ok: false, error: "PADDLE_CONFIG_MISSING", missing: secretMissing };
  return {
    ok: true,
    config: {
      ...checkout.config,
      webhookSecret: String(env.PADDLE_WEBHOOK_SECRET).trim(),
    },
  };
}

export function getPaddleConfig(env: PaddleEnvMap = process.env): PaddleConfigOk | PaddleConfigError {
  return getPaddleWebhookConfig(env);
}

export function paddleSdkEnvironment(environment: PaddleEnvName) {
  return environment === "production" ? Environment.production : Environment.sandbox;
}

export function createPaddleSdk(config: Pick<PaddleCheckoutConfig, "apiKey" | "environment">): Paddle {
  return new Paddle(config.apiKey, { environment: paddleSdkEnvironment(config.environment) });
}

export function paddleLog(code: string, extra?: { event?: string; orderId?: string; quoteId?: string }) {
  console.error("[paddle]", code, extra || {});
}

export function isPositiveCents(value: number) {
  return Number.isInteger(value) && value > 0;
}

export function paddleUnitAmount(finalPriceCents: number) {
  return String(finalPriceCents);
}

export function paddleUnitPriceMatchesQuote(amount: string | null | undefined, finalPriceCents: number) {
  return amount === paddleUnitAmount(finalPriceCents);
}

export function isPaddleTransactionId(id: string) {
  return /^txn_[a-z0-9]+/i.test(id);
}

export const PADDLE_CREATING_SAFE_WINDOW_MS = 60_000;
export const PADDLE_RECONCILE_LOOKBACK_MS = 2 * 60 * 1000;
export const PADDLE_RECONCILE_MAX_RESULTS = 500;
export const PADDLE_RECONCILE_PER_PAGE = 50;

export type PaddleTxnSnapshot = {
  id?: string;
  status?: string;
  currencyCode?: string;
  discountId?: string | null;
  customData?: Record<string, unknown> | null;
  items?: Array<{
    quantity?: number;
    price?: {
      productId?: string | null;
      unitPrice?: { amount?: string | null; currencyCode?: string | null } | null;
      billingCycle?: unknown;
    } | null;
  }> | null;
  details?: {
    totals?: { discount?: string | null } | null;
    lineItems?: Array<{
      quantity?: number;
      product?: { id?: string | null } | null;
      totals?: { discount?: string | null } | null;
    }> | null;
  } | null;
  checkout?: { url?: string | null } | null;
  createdAt?: string;
};

export function readPaddleCustom(data: { customData?: Record<string, unknown> | null }) {
  const raw = data.customData && typeof data.customData === "object" ? data.customData : {};
  return {
    user_id: String(raw.user_id || "").trim(),
    quote_id: String(raw.quote_id || "").trim(),
    product_code: String(raw.product_code || "").trim(),
  };
}

function discountAmount(value: string | null | undefined) {
  if (value == null || value === "") return "0";
  return String(value);
}

export function hasUnauthorizedPaddleDiscount(txn: PaddleTxnSnapshot) {
  if (txn.discountId) return true;
  if (discountAmount(txn.details?.totals?.discount) !== "0") return true;
  const lines = txn.details?.lineItems || [];
  return lines.some((line) => discountAmount(line.totals?.discount) !== "0");
}

export function matchPaddleTransactionToQuote(
  txn: PaddleTxnSnapshot,
  quote: { id: string; userId: string; productCode: string; currency: string; finalPriceCents: number },
  productId: string
): { ok: true } | { ok: false; error: string } {
  const custom = readPaddleCustom(txn);
  if (custom.quote_id !== quote.id) return { ok: false, error: "quote_mismatch" };
  if (custom.user_id !== quote.userId) return { ok: false, error: "user_mismatch" };
  if (custom.product_code !== expectedPaddleProductCode() || custom.product_code !== quote.productCode) {
    return { ok: false, error: "product_mismatch" };
  }
  if (String(txn.currencyCode || "") !== CURRENCY || quote.currency !== CURRENCY) {
    return { ok: false, error: "currency_mismatch" };
  }
  const items = Array.isArray(txn.items) ? txn.items : [];
  if (items.length !== 1) return { ok: false, error: "item_count_mismatch" };
  const item = items[0];
  if (Number(item.quantity) !== 1) return { ok: false, error: "quantity_mismatch" };
  if (String(item.price?.productId || "") !== productId) return { ok: false, error: "product_id_mismatch" };
  if (item.price?.billingCycle) return { ok: false, error: "subscription_not_allowed" };
  if (!paddleUnitPriceMatchesQuote(item.price?.unitPrice?.amount, quote.finalPriceCents)) {
    return { ok: false, error: "amount_mismatch" };
  }
  if (item.price?.unitPrice?.currencyCode && item.price.unitPrice.currencyCode !== CURRENCY) {
    return { ok: false, error: "currency_mismatch" };
  }
  const lineItems = txn.details?.lineItems || [];
  if (lineItems.length > 1) return { ok: false, error: "item_count_mismatch" };
  const lineProductId = lineItems[0]?.product?.id ? String(lineItems[0].product.id) : "";
  if (lineProductId && lineProductId !== productId) return { ok: false, error: "product_id_mismatch" };
  if (lineItems[0] && Number(lineItems[0].quantity) !== 1) return { ok: false, error: "quantity_mismatch" };
  if (hasUnauthorizedPaddleDiscount(txn)) return { ok: false, error: "paddle_discount_not_allowed" };
  const status = String(txn.status || "").toLowerCase();
  if (status === "canceled" || status === "cancelled") return { ok: false, error: "transaction_canceled" };
  if (!isPaddleTransactionId(String(txn.id || ""))) return { ok: false, error: "transaction_id_invalid" };
  return { ok: true };
}

export function shouldGrantAccessFromPaddleCheckoutCompleted() {
  return false;
}

export function paddleRedirectPath() {
  return "/dashboard/?checkout=success";
}

export function buildPaddleTransactionPayload(opts: {
  productId: string;
  finalPriceCents: number;
  userId: string;
  quoteId: string;
  productCode: string;
}): CreateTransactionRequestBody {
  const customData: PaddleCustomData = {
    user_id: opts.userId,
    quote_id: opts.quoteId,
    product_code: opts.productCode,
  };
  return {
    items: [
      {
        quantity: 1,
        price: {
          productId: opts.productId,
          name: PADDLE_PRICE_NAME,
          description: PADDLE_PRICE_DESCRIPTION,
          unitPrice: {
            amount: paddleUnitAmount(opts.finalPriceCents),
            currencyCode: CURRENCY,
          },
          taxMode: "account_setting",
          billingCycle: null,
        },
      },
    ],
    currencyCode: CURRENCY,
    customData,
  };
}

export type PaddleListQuery = {
  after?: string;
  perPage?: number;
  createdAt?: string;
  "createdAt[LT]"?: string;
  "createdAt[GT]"?: string;
  "createdAt[LTE]"?: string;
  "createdAt[GTE]"?: string;
};

export type PaddleTransactionsClient = {
  transactions: {
    create: (payload: CreateTransactionRequestBody) => Promise<{ id: string; checkout?: { url?: string | null } | null }>;
    list?: (
      query?: PaddleListQuery
    ) => AsyncIterable<PaddleTxnSnapshot> | Iterable<PaddleTxnSnapshot> | Promise<PaddleTxnSnapshot[]>;
  };
};

export async function createPaddleTransaction(
  config: PaddleCheckoutConfig,
  payload: CreateTransactionRequestBody,
  sdk: PaddleTransactionsClient = createPaddleSdk(config)
): Promise<{ ok: true; id: string; checkoutUrl: string | null } | { ok: false; error: string }> {
  try {
    const created = await sdk.transactions.create(payload);
    const id = String(created.id || "");
    if (!isPaddleTransactionId(id)) {
      paddleLog("paddle_checkout_invalid_response");
      return { ok: false, error: "PADDLE_CHECKOUT_INVALID_RESPONSE" };
    }
    return { ok: true, id, checkoutUrl: created.checkout?.url ?? null };
  } catch (err) {
    const code = err && typeof err === "object" && "code" in err ? String((err as { code?: unknown }).code || "") : "";
    paddleLog("paddle_checkout_http", { event: code || "network" });
    return { ok: false, error: "PADDLE_CHECKOUT_HTTP" };
  }
}

export function expectedPaddleCurrency() {
  return CURRENCY;
}

export function expectedPaddleProductCode() {
  return AZ_PRO_PRODUCT_CODE;
}
