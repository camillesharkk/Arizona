import { paths } from "./paths.ts";

export const GA_MEASUREMENT_ID_ENV = "NEXT_PUBLIC_GA_MEASUREMENT_ID";
export const GA_SCRIPT_ORIGIN = "https://www.googletagmanager.com/gtag/js";
export const PRO_ITEM_ID = "az_exam_pro_60d";
export const PRO_ITEM_NAME = "Arizona Notary Exam Prep Pro — 60-Day Access";
export const ANALYTICS_STATE = "AZ";
export const ANALYTICS_SITE = "arizona_notary_prep";
export const POSTHOG_US_HOST = "https://us.i.posthog.com";
export const ANALYTICS_DEDUPE_MS = 2000;

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
  "answer",
  "answer_text",
  "answertext",
  "correct_option",
  "explanation",
  "paypal",
  "lemon",
  "deepseek",
  "apikey",
  "api_key",
  "authorization",
  "cookie",
  "secret",
  "card",
  "cvv",
  "cvc",
  "customer",
  "address",
]);

export function analyticsDebugEnabled(raw?: string | null) {
  const value = String(raw ?? process.env.NEXT_PUBLIC_ANALYTICS_DEBUG ?? "").trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export function parseGaMeasurementId(raw?: string | null) {
  const id = String(raw ?? "").trim();
  if (!/^G-[A-Z0-9]+$/i.test(id)) return null;
  return id.toUpperCase();
}

export function gaScriptSrc(measurementId: string) {
  return `${GA_SCRIPT_ORIGIN}?id=${measurementId}`;
}

export function shouldLoadGa(opts?: {
  nodeEnv?: string;
  measurementId?: string | null;
  hostname?: string | null;
  debug?: boolean;
}) {
  const debug = typeof opts?.debug === "boolean" ? opts.debug : analyticsDebugEnabled();
  const nodeEnv = opts?.nodeEnv ?? process.env.NODE_ENV;
  if (nodeEnv !== "production" && !debug) return false;
  const id = parseGaMeasurementId(opts?.measurementId ?? process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
  if (!id) return false;
  const host = String(opts?.hostname ?? "").toLowerCase();
  if ((host === "localhost" || host === "127.0.0.1") && !debug) return false;
  return true;
}

export function parsePosthogProjectKey(raw?: string | null) {
  const key = String(raw ?? "").trim();
  if (!key || key.startsWith("phx_") || key.length < 8) return null;
  return key;
}

export function parsePosthogHost(raw?: string | null) {
  const host = String(raw ?? "").trim().replace(/\/$/, "");
  if (!host) return POSTHOG_US_HOST;
  if (!/^https:\/\/[a-z0-9.-]+$/i.test(host)) return null;
  return host;
}

export function parseClarityProjectId(raw?: string | null) {
  const id = String(raw ?? "").trim();
  if (!/^[a-z0-9]{4,32}$/i.test(id)) return null;
  return id;
}

export function shouldSendProductAnalytics(opts?: { nodeEnv?: string; hostname?: string | null; debug?: boolean }) {
  const debug = typeof opts?.debug === "boolean" ? opts.debug : analyticsDebugEnabled();
  const nodeEnv = opts?.nodeEnv ?? process.env.NODE_ENV;
  const host = String(
    opts?.hostname ?? (typeof window !== "undefined" ? window.location.hostname : "")
  ).toLowerCase();
  if (nodeEnv !== "production" && !debug) return false;
  if ((host === "localhost" || host === "127.0.0.1") && !debug) return false;
  return true;
}

export function shouldLoadClarity(opts?: {
  nodeEnv?: string;
  projectId?: string | null;
  hostname?: string | null;
  debug?: boolean;
}) {
  const id = parseClarityProjectId(opts?.projectId ?? process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID);
  if (!id) return false;
  return shouldSendProductAnalytics(opts);
}

export function isSensitiveAnalyticsPath(pathname: string) {
  const path = String(pathname || "").toLowerCase().replace(/\/+$/, "") || "/";
  const prefixes = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/dashboard",
    "/account",
    "/pricing",
    "/contact",
  ];
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export function pageViewKey(pathname: string, search = "") {
  const query = search.replace(/^\?/, "");
  return query ? `${pathname}?${query}` : pathname;
}

export function viewEventForPath(pathname: string): "landing_view" | "practice_view" | "register_view" | null {
  const bare = String(pathname || "").split("?")[0];
  const path = bare.endsWith("/") ? bare : `${bare}/`;
  if (path === paths.home || path === "/") return "landing_view";
  if (path === paths.practice || path === paths.practiceFree) return "practice_view";
  if (path === paths.register) return "register_view";
  return null;
}

export function sanitizeEventParams(params?: Record<string, unknown>) {
  if (!params) return undefined;
  const out: Record<string, string | number | boolean> = {};
  for (const [rawKey, value] of Object.entries(params)) {
    const key = rawKey.trim();
    const normalized = key.toLowerCase().replace(/-/g, "_");
    if (!key || BLOCKED_PARAM_KEYS.has(normalized)) continue;
    if (/(email|password|token|secret|phone|answer_text)/.test(normalized)) continue;
    if (value == null) continue;
    if (typeof value === "string") {
      const text = value.trim();
      if (!text || text.includes("@")) continue;
      if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(text)) continue;
      out[key] = text.slice(0, 120);
      continue;
    }
    if (typeof value === "number" && Number.isFinite(value)) out[key] = value;
    if (typeof value === "boolean") out[key] = value;
  }
  return out;
}

export function applyCommonParams(params?: Record<string, string | number | boolean>) {
  const out: Record<string, string | number | boolean> = {
    state: ANALYTICS_STATE,
    site: ANALYTICS_SITE,
  };
  if (typeof window !== "undefined" && window.location?.pathname) {
    out.page_path = window.location.pathname;
  }
  Object.assign(out, readAttribution(), params || {});
  return out;
}

function readAttribution() {
  if (typeof window === "undefined") return {};
  try {
    const url = new URL(window.location.href);
    const stored = JSON.parse(window.sessionStorage.getItem("az_attr") || "{}") as {
      landing_page?: string;
      source?: string;
      medium?: string;
    };
    const source = cleanAttr(stored.source || url.searchParams.get("utm_source") || "");
    const medium = cleanAttr(stored.medium || url.searchParams.get("utm_medium") || "");
    const landing = cleanAttr(stored.landing_page || window.location.pathname);
    window.sessionStorage.setItem(
      "az_attr",
      JSON.stringify({ landing_page: landing, source, medium })
    );
    const out: Record<string, string> = {};
    if (landing) out.landing_page = landing;
    if (source) out.source = source;
    if (medium) out.medium = medium;
    return out;
  } catch {
    return {};
  }
}

function cleanAttr(value: string) {
  const text = String(value || "").trim();
  if (!text || text.includes("@")) return "";
  return text.slice(0, 120);
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

export function isInternalUserId(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(id || "").trim());
}

export function isSafeDistinctId(id: string) {
  const value = String(id || "").trim();
  if (!isInternalUserId(value)) return false;
  if (value.includes("@")) return false;
  return true;
}

export function createAnonymousId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return "00000000-0000-4000-8000-000000000000";
}

const ANON_KEY = "az_anon_id";

export function anonymousDistinctId(storage: Pick<Storage, "getItem" | "setItem">) {
  const existing = String(storage.getItem(ANON_KEY) || "");
  if (isSafeDistinctId(existing)) return existing;
  const next = createAnonymousId();
  storage.setItem(ANON_KEY, next);
  return next;
}

export type IdentityState = { distinctId: string; identifiedUserId: string | null };

export function identifyUser(state: IdentityState, userId: string): IdentityState {
  if (!isInternalUserId(userId)) return state;
  return { distinctId: userId, identifiedUserId: userId };
}

export function resetIdentity(state: IdentityState, nextAnonymousId: string): IdentityState {
  const distinctId = isSafeDistinctId(nextAnonymousId) ? nextAnonymousId : createAnonymousId();
  return { distinctId, identifiedUserId: null };
}

export function examAnalyticsMode(mode: string, practice?: boolean): "quick10" | "full45" | "practice" {
  if (mode === "quick") return "quick10";
  if (mode === "full" && !practice) return "full45";
  return "practice";
}

export function examStartParams(input: {
  mode: string;
  practice?: boolean;
  questionCount: number;
  plan: "free" | "pro";
}) {
  return {
    mode: examAnalyticsMode(input.mode, input.practice),
    question_count: input.questionCount,
    plan: input.plan,
    state: ANALYTICS_STATE,
  };
}

export function examCompleteParams(input: {
  mode: string;
  practice?: boolean;
  questionCount: number;
  answeredCount: number;
  score: number;
  passed: boolean;
  plan: "free" | "pro";
  durationSeconds?: number;
}) {
  const mode = examAnalyticsMode(input.mode, input.practice);
  return {
    mode,
    question_count: input.questionCount,
    answered_count: input.answeredCount,
    score: input.score,
    ...(typeof input.durationSeconds === "number" ? { duration_seconds: input.durationSeconds } : {}),
    plan: input.plan,
    state: ANALYTICS_STATE,
    exam_type: mode,
    score_percent: input.score,
    passed: input.passed,
  };
}

export function fulfillmentAnalyticsEvents(input: {
  duplicate: boolean;
  orderConfirmed: boolean;
  entitlementId?: string | null;
  entitlementFailed?: boolean;
}) {
  if (input.entitlementFailed && !input.orderConfirmed) return ["entitlement_missing"];
  if (!input.orderConfirmed || input.duplicate) return [];
  return ["purchase_completed", input.entitlementId ? "entitlement_granted" : "entitlement_missing"];
}

const recentEvents = new Map<string, number>();

export function resetAnalyticsDedupe(store: Map<string, number> = recentEvents) {
  store.clear();
}

function dedupeKey(name: string, params: Record<string, string | number | boolean>) {
  return [name, String(params.page_path || ""), String(params.mode || ""), String(params.product_code || "")].join("|");
}

export function claimEventSend(
  name: string,
  params: Record<string, string | number | boolean>,
  opts?: { now?: number; store?: Map<string, number>; windowMs?: number }
) {
  const store = opts?.store ?? recentEvents;
  const windowMs = opts?.windowMs ?? ANALYTICS_DEDUPE_MS;
  const now = opts?.now ?? Date.now();
  const key = dedupeKey(name, params);
  const prev = store.get(key);
  if (prev != null && now - prev < windowMs) return false;
  store.set(key, now);
  return true;
}

export type AnalyticsTransport = {
  ga: (name: string, params: Record<string, string | number | boolean>) => void;
  posthog: (name: string, params: Record<string, string | number | boolean>) => void;
};

export function dispatchAnalyticsEvent(
  name: string,
  params: Record<string, unknown> | undefined,
  transport: AnalyticsTransport,
  opts?: { now?: number; store?: Map<string, number>; windowMs?: number }
) {
  const event = String(name || "").trim();
  const result = { duplicate: false, ga: "skipped" as "sent" | "failed" | "skipped", posthog: "skipped" as "sent" | "failed" | "skipped" };
  if (!event) return result;
  const safe = applyCommonParams(sanitizeEventParams(params));
  if (!claimEventSend(event, safe, opts)) {
    result.duplicate = true;
    return result;
  }
  try {
    transport.ga(event, safe);
    result.ga = "sent";
  } catch {
    result.ga = "failed";
  }
  try {
    transport.posthog(event, safe);
    result.posthog = "sent";
  } catch {
    result.posthog = "failed";
  }
  return result;
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  try {
    sendGa(name, applyCommonParams(sanitizeEventParams(params)));
  } catch {
    /* GA must not affect the page */
  }
}

export function trackPageView(path: string) {
  trackEvent("page_view", { page_path: path, page_location: typeof window !== "undefined" ? `${window.location.origin}${path}` : path });
}

export function trackAnalyticsEvent(name: string, params?: Record<string, unknown>) {
  try {
    dispatchAnalyticsEvent(name, params, {
      ga: (event, safe) => sendGa(event, safe),
      posthog: (event, safe) => {
        void sendPosthog(event, safe);
      },
    });
  } catch {
    /* analytics must not affect exams, auth, or checkout */
  }
}

export function trackPurchase(opts: { transactionId: string; valueCents: number }) {
  try {
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
  } catch {
    /* historical GA purchase is best-effort */
  }
}

function sendGa(name: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === "undefined") return;
  if (!shouldLoadGa({ hostname: window.location.hostname })) return;
  const gtag = window.gtag;
  if (typeof gtag !== "function") return;
  const event = String(name || "").trim();
  if (!event) return;
  gtag("event", event, params || {});
}

type PosthogLike = {
  init: (key: string, options: Record<string, unknown>) => void;
  capture: (event: string, properties?: Record<string, unknown>) => void;
  identify: (id: string, properties?: Record<string, unknown>) => void;
  reset: (resetDeviceId?: boolean) => void;
  __loaded?: boolean;
};

let posthogPromise: Promise<PosthogLike | null> | null = null;

function posthogBrowserConfig() {
  if (!shouldSendProductAnalytics({ hostname: typeof window !== "undefined" ? window.location.hostname : "" })) return null;
  const key = parsePosthogProjectKey(process.env.NEXT_PUBLIC_POSTHOG_KEY);
  const host = parsePosthogHost(process.env.NEXT_PUBLIC_POSTHOG_HOST);
  if (!key || !host) return null;
  return { key, host };
}

function loadPosthog(): Promise<PosthogLike | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  const cfg = posthogBrowserConfig();
  if (!cfg) return Promise.resolve(null);
  if (!posthogPromise) {
    posthogPromise = import("posthog-js")
      .then((mod) => {
        const posthog = mod.default as PosthogLike;
        if (!posthog.__loaded) {
          posthog.init(cfg.key, {
            api_host: cfg.host,
            autocapture: false,
            capture_pageview: false,
            capture_pageleave: false,
            disable_session_recording: true,
            person_profiles: "identified_only",
            advanced_disable_feature_flags: true,
            persistence: "localStorage+cookie",
            debug: false,
          });
        }
        return posthog;
      })
      .catch(() => null);
  }
  return posthogPromise;
}

async function sendPosthog(name: string, params: Record<string, string | number | boolean>) {
  try {
    const posthog = await loadPosthog();
    posthog?.capture(name, params);
  } catch {
    /* PostHog must not affect GA or the page */
  }
}

const IDENTIFIED_FLAG = "az_ph_user";

export async function syncAnalyticsIdentity(user: { id?: string | null; plan?: string | null } | null) {
  try {
    const id = String(user?.id || "");
    if (isInternalUserId(id)) {
      try {
        window.sessionStorage.setItem(IDENTIFIED_FLAG, id);
      } catch {
        /* ignore */
      }
      const posthog = await loadPosthog();
      posthog?.identify(id, {
        plan: user?.plan === "pro" ? "pro" : "free",
        state: ANALYTICS_STATE,
        site: ANALYTICS_SITE,
      });
      return;
    }
    let previous = "";
    try {
      previous = window.sessionStorage.getItem(IDENTIFIED_FLAG) || "";
      window.sessionStorage.removeItem(IDENTIFIED_FLAG);
    } catch {
      previous = "";
    }
    if (!previous) return;
    const posthog = await loadPosthog();
    posthog?.reset(true);
  } catch {
    /* identity must not affect auth */
  }
}

export async function resetAnalyticsUser() {
  try {
    try {
      window.sessionStorage.removeItem(IDENTIFIED_FLAG);
    } catch {
      /* ignore */
    }
    const posthog = await loadPosthog();
    posthog?.reset(true);
  } catch {
    /* logout must still proceed */
  }
}

export function pauseClarityRecording() {
  try {
    window.clarity?.("stop");
  } catch {
    /* clarity is optional */
  }
}

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}
