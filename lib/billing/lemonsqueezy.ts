import { createHmac, timingSafeEqual } from "crypto";
import { AZ_PRO_PRODUCT_CODE, CURRENCY } from "../pricing/catalog.ts";

export const LEMON_PROVIDER = "lemon_squeezy" as const;
export const LEMON_API_CHECKOUTS = "https://api.lemonsqueezy.com/v1/checkouts";

export type LemonEnv = Record<string, string | undefined>;

export type LemonConfig = {
  apiKey: string;
  storeId: string;
  variantId: string;
  webhookSecret: string;
  testMode: boolean;
};

export type LemonConfigError = { ok: false; error: string; missing: string[] };
export type LemonConfigOk = { ok: true; config: LemonConfig };

function missingNamed(env: LemonEnv, keys: string[]) {
  return keys.filter((k) => !String(env[k] || "").trim());
}

export function lemonTestMode(env: LemonEnv = process.env) {
  return env.LEMONSQUEEZY_TEST_MODE === "true";
}

export function isLemonProvider(env: LemonEnv = process.env) {
  return (env.MOR_PROVIDER || "mock").toLowerCase() === "lemonsqueezy";
}

/** Production Lemon must stay in Test Mode this round. Live Mode is a safe failure. */
export function getLemonConfig(env: LemonEnv = process.env): LemonConfigOk | LemonConfigError {
  const missing = missingNamed(env, [
    "LEMONSQUEEZY_API_KEY",
    "LEMONSQUEEZY_STORE_ID",
    "LEMONSQUEEZY_VARIANT_ID",
    "LEMONSQUEEZY_WEBHOOK_SECRET",
  ]);
  if (missing.length) return { ok: false, error: "LEMON_CONFIG_MISSING", missing };
  if (!lemonTestMode(env)) return { ok: false, error: "LEMON_LIVE_MODE_FORBIDDEN", missing: ["LEMONSQUEEZY_TEST_MODE"] };
  const storeId = String(env.LEMONSQUEEZY_STORE_ID).trim();
  const variantId = String(env.LEMONSQUEEZY_VARIANT_ID).trim();
  if (!Number.isFinite(Number(storeId)) || !Number.isFinite(Number(variantId))) {
    return { ok: false, error: "LEMON_CONFIG_INVALID", missing: [] };
  }
  return {
    ok: true,
    config: {
      apiKey: String(env.LEMONSQUEEZY_API_KEY).trim(),
      storeId,
      variantId,
      webhookSecret: String(env.LEMONSQUEEZY_WEBHOOK_SECRET).trim(),
      testMode: true,
    },
  };
}

export function getLemonWebhookConfig(env: LemonEnv = process.env): LemonConfigOk | LemonConfigError {
  return getLemonConfig(env);
}

export function lemonLog(code: string, extra?: { event?: string; orderId?: string; quoteId?: string }) {
  console.error("[lemon]", code, extra || {});
}

export function buildLemonCheckoutPayload(opts: {
  storeId: string;
  variantId: string;
  customPriceCents: number;
  email: string;
  userId: string;
  quoteId: string;
  productCode: string;
  expiresAt: string;
  redirectUrl: string;
  testMode: boolean;
}) {
  return {
    data: {
      type: "checkouts",
      attributes: {
        custom_price: opts.customPriceCents,
        test_mode: opts.testMode,
        expires_at: opts.expiresAt,
        product_options: {
          enabled_variants: [Number(opts.variantId)],
          redirect_url: opts.redirectUrl,
        },
        checkout_options: {
          discount: false,
        },
        checkout_data: {
          email: opts.email,
          custom: {
            user_id: opts.userId,
            quote_id: opts.quoteId,
            product_code: opts.productCode,
          },
        },
      },
      relationships: {
        store: { data: { type: "stores", id: String(opts.storeId) } },
        variant: { data: { type: "variants", id: String(opts.variantId) } },
      },
    },
  };
}

export function checkoutExpiryIso(quoteExpiresAt: string) {
  return new Date(quoteExpiresAt).toISOString();
}

export function lemonRedirectUrl(site: string) {
  return `${site.replace(/\/$/, "")}/dashboard/?checkout=success`;
}

export function shouldGrantAccessFromCheckoutRedirect() {
  return false;
}

export async function createLemonCheckout(
  config: LemonConfig,
  payload: ReturnType<typeof buildLemonCheckoutPayload>,
  fetchFn: typeof fetch = fetch
): Promise<{ ok: true; id: string; url: string } | { ok: false; error: string; status?: number }> {
  let res: Response;
  try {
    res = await fetchFn(LEMON_API_CHECKOUTS, {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    lemonLog("lemon_checkout_network");
    return { ok: false, error: "LEMON_CHECKOUT_NETWORK" };
  }
  if (!res.ok) {
    lemonLog("lemon_checkout_http", { event: String(res.status) });
    return { ok: false, error: "LEMON_CHECKOUT_HTTP", status: res.status };
  }
  let json: { data?: { id?: string; attributes?: { url?: string } } };
  try {
    json = (await res.json()) as { data?: { id?: string; attributes?: { url?: string } } };
  } catch {
    return { ok: false, error: "LEMON_CHECKOUT_INVALID_RESPONSE" };
  }
  const id = json.data?.id;
  const url = json.data?.attributes?.url;
  if (!id || !url) return { ok: false, error: "LEMON_CHECKOUT_INVALID_RESPONSE" };
  return { ok: true, id: String(id), url: String(url) };
}

export function verifyLemonWebhookSignature(raw: string, header: string | null, secret: string) {
  if (!secret || !header) return false;
  const digest = createHmac("sha256", secret).update(raw).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(header.trim());
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export type LemonCustomData = {
  user_id?: string;
  quote_id?: string;
  product_code?: string;
};

export type LemonOrderFields = {
  eventName: string;
  orderId: string;
  storeId: number;
  variantId: number | null;
  testMode: boolean;
  status: string;
  refunded: boolean;
  currency: string;
  subtotal: number;
  discountTotal: number;
  total: number;
  custom: LemonCustomData;
};

export function resolveLemonEventName(headerName: string | null, bodyEventName: unknown): { ok: true; eventName: string } | { ok: false; error: string } {
  const header = headerName ? String(headerName).trim() : "";
  const body = typeof bodyEventName === "string" ? bodyEventName.trim() : "";
  if (header && body && header !== body) return { ok: false, error: "EVENT_NAME_MISMATCH" };
  const eventName = header || body;
  if (!eventName) return { ok: false, error: "EVENT_NAME_MISSING" };
  return { ok: true, eventName };
}

export function parseLemonOrderEvent(body: unknown, eventName: string): { ok: true; order: LemonOrderFields } | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "INVALID_JSON" };
  const root = body as { meta?: { custom_data?: unknown }; data?: unknown };
  const data = root.data as
    | {
        id?: unknown;
        type?: unknown;
        attributes?: Record<string, unknown> & { first_order_item?: { variant_id?: unknown } };
      }
    | undefined;
  if (!data || data.type !== "orders") return { ok: false, error: "NOT_ORDER" };
  const attrs = data.attributes || {};
  const customRaw = root.meta?.custom_data;
  const custom: LemonCustomData =
    customRaw && typeof customRaw === "object"
      ? {
          user_id: String((customRaw as LemonCustomData).user_id || "") || undefined,
          quote_id: String((customRaw as LemonCustomData).quote_id || "") || undefined,
          product_code: String((customRaw as LemonCustomData).product_code || "") || undefined,
        }
      : {};
  return {
    ok: true,
    order: {
      eventName,
      orderId: String(data.id || ""),
      storeId: Number(attrs.store_id),
      variantId: attrs.first_order_item?.variant_id == null ? null : Number(attrs.first_order_item.variant_id),
      testMode: Boolean(attrs.test_mode),
      status: String(attrs.status || ""),
      refunded: attrs.refunded === true || String(attrs.status || "") === "refunded",
      currency: String(attrs.currency || ""),
      subtotal: Number(attrs.subtotal),
      discountTotal: Number(attrs.discount_total),
      total: Number(attrs.total),
      custom,
    },
  };
}

export function lemonProductAmountMatchesQuote(order: LemonOrderFields, finalPriceCents: number) {
  return Number.isFinite(order.subtotal) && order.subtotal === finalPriceCents;
}

export function expectedLemonCurrency() {
  return CURRENCY;
}

export function expectedLemonProductCode() {
  return AZ_PRO_PRODUCT_CODE;
}
