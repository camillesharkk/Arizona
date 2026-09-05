/**
 * GA4 helper gate. In-memory only. No network. No production secrets.
 * Run: npm run analytics:verify
 */
import { readFileSync } from "fs";
import path from "path";
import {
  checkoutStartParams,
  gaScriptSrc,
  hasRememberedPurchase,
  pageViewKey,
  parseGaMeasurementId,
  pickLatestPaidOrder,
  rememberPurchase,
  sanitizeEventParams,
  shouldLoadGa,
  trackEvent,
} from "../lib/analytics.ts";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

if (parseGaMeasurementId("") || parseGaMeasurementId("  ") || parseGaMeasurementId("UA-123")) fail("invalid/missing id should be rejected");
else ok("no measurement id → GA not configured");

const sampleId = "G-ABC12XYZ";
if (parseGaMeasurementId(sampleId) !== "G-ABC12XYZ") fail("valid G- id should parse");
else ok("valid Measurement ID is accepted");

if (shouldLoadGa({ nodeEnv: "production", measurementId: "", hostname: "arizonanotaryprep.com" })) {
  fail("empty id still loaded GA");
} else ok("no measurement id → 不加载 GA");

if (!shouldLoadGa({ nodeEnv: "production", measurementId: sampleId, hostname: "arizonanotaryprep.com" })) {
  fail("production + id should load");
} else ok("production + measurement id → GA script 配置正确");

if (gaScriptSrc(sampleId) !== `https://www.googletagmanager.com/gtag/js?id=${sampleId}`) {
  fail("gtag script src incorrect");
} else ok("gtag script uses official googletagmanager URL");

if (shouldLoadGa({ nodeEnv: "development", measurementId: sampleId, hostname: "localhost" })) {
  fail("dev still sends GA");
} else ok("localhost/dev → 不发正式 GA");

if (shouldLoadGa({ nodeEnv: "production", measurementId: sampleId, hostname: "localhost" })) {
  fail("production localhost still sends GA");
} else ok("production localhost hostname is blocked");

let threw = false;
try {
  trackEvent("sign_up", { email: "a@b.com", userId: "u1" });
} catch {
  threw = true;
}
if (threw) fail("trackEvent threw without gtag");
else ok("trackEvent 在 window/gtag 不存在时安全 no-op");

const dirty = sanitizeEventParams({
  email: "user@example.com",
  userId: "abc",
  quoteId: "q-1",
  question: "full question text here",
  plan: "free",
  mode: "explain",
});
if (!dirty || "email" in dirty || "userId" in dirty || "quoteId" in dirty || "question" in dirty) {
  fail("PII keys were not stripped");
} else if (dirty.plan !== "free" || dirty.mode !== "explain") fail("safe params were stripped");
else ok("event 参数不含 PII");

const checkout = checkoutStartParams({
  finalPriceCents: 1799,
  newcomerApplied: true,
  referralApplied: true,
  creditApplied: false,
});
if (!checkout || checkout.currency !== "USD" || checkout.value !== 17.99 || checkout.discount_type !== "newcomer+referral") {
  fail("checkout_start params incorrect");
} else if ("quoteId" in checkout || "userId" in checkout || "email" in checkout) {
  fail("checkout_start leaked ids");
} else ok("checkout_start 不包含 userId/email/quoteId");

const tutor = sanitizeEventParams({
  provider: "deepseek",
  plan: "pro",
  mode: "why-wrong",
  question: "A signer presents a severely damaged ID...",
});
if (!tutor || "question" in tutor || tutor.provider !== "deepseek") fail("ai_tutor_use leaked question text");
else ok("ai_tutor_use 不包含题目全文");

const first = pageViewKey("/pricing/", "");
const again = pageViewKey("/pricing/", "");
const withQuery = pageViewKey("/dashboard/", "checkout=success");
if (first !== "/pricing/" || first !== again) fail("page_view key unstable");
else if (withQuery !== "/dashboard/?checkout=success") fail("query string not handled");
else ok("page_view 不明显重复 + query string 可处理");

const mem = new Map<string, string>();
const storage = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => {
    mem.set(k, v);
  },
};
const orderId = "11111111-2222-4333-8444-555555555555";
if (hasRememberedPurchase(orderId, storage)) fail("new order already remembered");
rememberPurchase(orderId, storage);
if (!hasRememberedPurchase(orderId, storage)) fail("purchase remember failed");
else ok("purchase 有 idempotency/去重逻辑");

const latest = pickLatestPaidOrder([
  { orderId: "old", status: "paid", paidAt: "2026-01-01T00:00:00.000Z", amountCents: 2221 },
  { orderId: "new", status: "paid", paidAt: "2026-09-05T00:00:00.000Z", amountCents: 1799 },
  { orderId: "pending", status: "open", paidAt: "2026-09-06T00:00:00.000Z", amountCents: 1 },
]);
if (latest?.orderId !== "new") fail("latest paid order pick failed");
else ok("purchase uses latest server-confirmed paid order");

const layout = readFileSync(path.join(process.cwd(), "app/layout.tsx"), "utf8");
if (!layout.includes("GoogleAnalytics") || !layout.includes("AnalyticsPageViews")) fail("root layout missing GA");
else ok("GA loads from root layout only");
if (layout.includes("G-") && /G-[A-Z0-9]{6,}/.test(layout)) fail("hardcoded Measurement ID in layout");
else ok("no hardcoded G- Measurement ID");

console.log(lines.join("\n"));
if (failures) {
  console.error(`\nanalytics:verify failed (${failures})`);
  process.exit(1);
}
console.log("\nanalytics:verify passed");
