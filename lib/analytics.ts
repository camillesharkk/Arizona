export const GA_MEASUREMENT_ID_ENV = "NEXT_PUBLIC_GA_MEASUREMENT_ID";
export const GA_SCRIPT_ORIGIN = "https://www.googletagmanager.com/gtag/js";
export const PRO_ITEM_ID = "az_exam_pro_60d";
export const PRO_ITEM_NAME = "Arizona Notary Exam Prep Pro — 60-Day Access";

const BLOCKED_PARAM_KEYS = new Set([
  "email",
  "phone",
  "name",
  "password",
  "token",
  "jwt",
  "session",
  "userid",
  "user_id",
  "quoteid",
  "quote_id",
  "question",
  "question_text",
  "questiontext",
  "paypal",
  "lemon",
  "deepseek",
  "apikey",
  "api_key",
]);

export function parseGaMeasurementId(raw?: string | null) {
  const id = String(raw ?? "").trim();
  if (!/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id.toUpperCase();
}

export function gaScriptSrc(measurementId: string) {
  return `${GA_SCRIPT_ORIGIN}?id=${measurementId}`;
}

export function shouldLoadGa(opts?: { nodeEnv?: string; measurementId?: string | null; hostname?: string | null }) {
  const nodeEnv = opts?.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv !== "production") return false;
  const id = parseGaMeasurementId(opts?.measurementId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  if (!id) return false;
  const host = String(opts?.hostname ?? "").toLowerCase();
  if (host === "localhost" || host === "127.0.0.1") return false;
  return true;
}

export function pageViewKey(pathname: string, search = "") {
  const query = search.replace(/^\?/, "");
  return query ? `${pathname}?${query}` : pathname;
}

export function sanitizeEventParams(params?: Record<string, unknown>) {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [rawKey, value] of Object.entries(params)) {
    const key = rawKey.trim();
    if (!key || BLOCKED_PARAM_KEYS.has(key.toLowerCase().replace(/-/g, "_"))) continue;
    if (value == null) continue;
    if (typeof value === "string") {
      if (value.includes("@") || key.toLowerCase().includes("email")) continue;
      out[key] = value.slice(0, 120);
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

export function discountTypeFromBreakdown(b?: {
  newcomerApplied?: boolean;
  referralApplied?: boolean;
  creditApplied?: boolean;
} | null) {
  if (!b) return "standard";
  const parts: string[] = [];
  if (b.newcomerApplied) parts.push("newcomer");
  if (b.referralApplied) parts.push("referral");
  if (b.creditApplied) parts.push("credit");
  return parts.join("+") || "standard";
}

export function checkoutStartParams(b?: {
  finalPriceCents?: number;
  newcomerApplied?: boolean;
  referralApplied?: boolean;
  creditApplied?: boolean;
} | null) {
  const value = typeof b?.finalPriceCents === "number" ? Number((b.finalPriceCents / 100).toFixed(2)) : undefined;
  return sanitizeEventParams({
    value,
    currency: "USD",
    quote_type: PRO_ITEM_ID,
    discount_type: discountTypeFromBreakdown(b),
  });
}

export function purchaseStorageKey(orderId: string) {
  return `az-ga4-purchase:${orderId}`;
}

export function hasRememberedPurchase(orderId: string, storage?: Pick<Storage, "getItem"> | null) {
  const id = String(orderId || "").trim();
  if (!id) return true;
  try {
    return Boolean(storage?.getItem(purchaseStorageKey(id)));
  } catch {
    return true;
  }
}

export function rememberPurchase(orderId: string, storage?: Pick<Storage, "setItem"> | null) {
  const id = String(orderId || "").trim();
  if (!id) return;
  try {
    storage?.setItem(purchaseStorageKey(id), "1");
  } catch {
    /* ignore quota */
  }
}

export function pickLatestPaidOrder(orders: { orderId?: string; status?: string; amountCents?: number; paidAt?: string }[]) {
  const paid = orders.filter((o) => o.status === "paid" && String(o.orderId || "").trim());
  paid.sort((a, b) => String(b.paidAt || "").localeCompare(String(a.paidAt || "")));
  return paid[0] ?? null;
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (!shouldLoadGa({ hostname: window.location.hostname })) return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  const event = String(name || "").trim();
  if (!event) return;
  gtag("event", event, sanitizeEventParams(params) || {});
}

export function trackPageView(path: string) {
  trackEvent("page_view", { page_path: path, page_location: typeof window !== "undefined" ? `${window.location.origin}${path}` : path });
}

export function trackPurchase(opts: { transactionId: string; valueCents: number }) {
  if (typeof window === "undefined") return;
  if (!shouldLoadGa({ hostname: window.location.hostname })) return;
  if (typeof window.gtag !== "function") return;
  const transaction_id = String(opts.transactionId || "").trim();
  if (!transaction_id || transaction_id.includes("@")) return;
  window.gtag("event", "purchase", {
    transaction_id,
    value: Number((opts.valueCents / 100).toFixed(2)),
    currency: "USD",
    items: [{ item_id: PRO_ITEM_ID, item_name: PRO_ITEM_NAME }],
  });
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
