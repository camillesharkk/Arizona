/**
 * GA4 helper gate. In-memory only. No network. No production secrets.
 * Run: npm run analytics:verify
 */
import { readFileSync, readdirSync, statSync } from "fs";
import path from "path";
import {
  anonymousDistinctId,
  checkoutStartParams,
  claimEventSend,
  dispatchAnalyticsEvent,
  examCompleteParams,
  examStartParams,
  fulfillmentAnalyticsEvents,
  gaScriptSrc,
  hasRememberedPurchase,
  identifyUser,
  isSafeDistinctId,
  isSensitiveAnalyticsPath,
  pageViewKey,
  parseClarityProjectId,
  parseGaMeasurementId,
  parsePosthogProjectKey,
  pickLatestPaidOrder,
  rememberPurchase,
  resetAnalyticsDedupe,
  resetIdentity,
  sanitizeEventParams,
  shouldLoadClarity,
  shouldLoadGa,
  trackAnalyticsEvent,
  trackEvent,
  viewEventForPath,
} from "../lib/analytics.ts";
import { readPosthogQueryConfig } from "../lib/analytics-server.ts";
import { PRODUCT_METRICS, ratePercent } from "../lib/analytics-metrics.ts";

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

resetAnalyticsDedupe();
let analyticsThrew = false;
try {
  trackAnalyticsEvent("sign_up", { email: "a@b.com", password: "secret", plan: "free" });
} catch {
  analyticsThrew = true;
}
if (analyticsThrew) fail("trackAnalyticsEvent threw");
else ok("trackAnalyticsEvent 失败时不影响调用方");

const isolated = new Map<string, number>();
let gaCalls = 0;
let phCalls = 0;
const gaDown = dispatchAnalyticsEvent(
  "exam_start",
  examStartParams({ mode: "quick", practice: true, questionCount: 10, plan: "free" }),
  {
    ga: () => {
      gaCalls += 1;
      throw new Error("ga down");
    },
    posthog: () => {
      phCalls += 1;
    },
  },
  { store: isolated, now: 1_000 }
);
if (gaDown.ga !== "failed" || gaDown.posthog !== "sent" || phCalls !== 1) fail("PostHog stopped when GA failed");
else ok("GA4 失败时 PostHog 仍发送");

const phDown = dispatchAnalyticsEvent(
  "pricing_view",
  { page_path: "/pricing/" },
  {
    ga: () => {
      gaCalls += 1;
    },
    posthog: () => {
      throw new Error("posthog down");
    },
  },
  { store: isolated, now: 2_000 }
);
if (phDown.ga !== "sent" || phDown.posthog !== "failed") fail("GA stopped when PostHog failed");
else ok("PostHog 失败时 GA4 仍发送");

const bothDown = dispatchAnalyticsEvent(
  "register_view",
  { page_path: "/register/" },
  {
    ga: () => {
      throw new Error("ga");
    },
    posthog: () => {
      throw new Error("ph");
    },
  },
  { store: isolated, now: 3_000 }
);
if (bothDown.ga !== "failed" || bothDown.posthog !== "failed") fail("dual failure was not isolated");
else ok("GA4 与 PostHog 都失败时调用仍返回");

const dupStore = new Map<string, number>();
const firstView = dispatchAnalyticsEvent("landing_view", { page_path: "/arizona-notary-exam/" }, { ga() {}, posthog() {} }, { store: dupStore, now: 10 });
const secondView = dispatchAnalyticsEvent("landing_view", { page_path: "/arizona-notary-exam/" }, { ga() {}, posthog() {} }, { store: dupStore, now: 11 });
if (firstView.duplicate || !secondView.duplicate) fail("same page event was sent twice");
else ok("同一页面事件不重复发送");

const anonStore = {
  value: "",
  getItem: () => anonStore.value,
  setItem: (_k: string, v: string) => {
    anonStore.value = v;
  },
};
const anon = anonymousDistinctId(anonStore);
if (!isSafeDistinctId(anon) || anon.includes("@") || /[A-Z]{2,}/.test(anon) && anon.includes(".")) fail("anonymous id looks like PII");
else ok("anonymous ID 不含邮箱或姓名");

let identity = { distinctId: anon, identifiedUserId: null as string | null };
const userId = "11111111-2222-4333-8444-555555555555";
identity = identifyUser(identity, "person@example.com");
if (identity.identifiedUserId) fail("email was accepted as distinct id");
identity = identifyUser(identity, userId);
if (identity.identifiedUserId !== userId || identity.distinctId !== userId) fail("identify did not use internal user id");
const nextAnon = anonymousDistinctId({
  getItem: () => "",
  setItem: () => undefined,
});
identity = resetIdentity(identity, nextAnon);
if (identity.identifiedUserId || identity.distinctId === userId) fail("reset kept the previous user");
else ok("identify 使用内部用户 ID，reset 后不再关联上一个用户");

const leaked = sanitizeEventParams({
  password: "hunter2",
  token: "abc.def.ghi",
  answer: "The notary must...",
  question_text: "Which statement is correct?",
  question_count: 10,
  plan: "free",
});
if (!leaked || "password" in leaked || "token" in leaked || "answer" in leaked || "question_text" in leaked || leaked.question_count !== 10) {
  fail("sensitive exam or auth fields were kept");
} else ok("事件参数过滤密码、Token 和题目答案正文");

const quick = examStartParams({ mode: "quick", practice: true, questionCount: 10, plan: "free" });
const full = examStartParams({ mode: "full", practice: false, questionCount: 45, plan: "pro" });
const practice = examCompleteParams({
  mode: "weak",
  practice: true,
  questionCount: 5,
  answeredCount: 4,
  score: 80,
  passed: true,
  plan: "free",
  durationSeconds: 42,
});
if (quick.mode !== "quick10" || quick.question_count !== 10 || quick.plan !== "free") fail("Quick 10 params");
else if (full.mode !== "full45" || full.question_count !== 45 || full.plan !== "pro") fail("Full 45 params");
else if (practice.mode !== "practice" || practice.answered_count !== 4 || practice.duration_seconds !== 42 || "question" in practice) {
  fail("Practice params");
} else ok("Quick 10、Full 45、Practice 参数正确");

const granted = fulfillmentAnalyticsEvents({ duplicate: false, orderConfirmed: true, entitlementId: "ent-1" });
const missing = fulfillmentAnalyticsEvents({ duplicate: false, orderConfirmed: false, entitlementFailed: true });
const replay = fulfillmentAnalyticsEvents({ duplicate: true, orderConfirmed: true, entitlementId: "ent-1" });
if (granted.join(",") !== "purchase_completed,entitlement_granted") fail("paid order events");
else if (missing.join(",") !== "entitlement_missing" || missing.includes("purchase_completed")) fail("entitlement_missing mixed with purchase");
else if (replay.length) fail("duplicate webhook would emit again");
else if (!claimEventSend("checkout_click", { product_code: "az_exam_pro_60d" }, { store: dupStore, now: 20 })) fail("checkout_click was dropped");
else if (!claimEventSend("checkout_open", { product_code: "az_exam_pro_60d" }, { store: dupStore, now: 20 })) fail("checkout_open was treated as checkout_click");
else ok("Checkout 各步骤语义分开，purchase 以确认订单为准");

if (parsePosthogProjectKey("phx_personal_secret")) fail("personal key accepted as project key");
else ok("phx_ personal key 不能当作客户端项目 key");

const queryCfg = readPosthogQueryConfig({ POSTHOG_PERSONAL_API_KEY: "phx_test", POSTHOG_PROJECT_ID: "123" });
if (!queryCfg.configured || queryCfg.personalApiKey !== "phx_test") fail("query config missing");
else ok("服务端查询配置与客户端采集配置分离");

if (shouldLoadClarity({ nodeEnv: "production", projectId: "", hostname: "arizonanotaryprep.com" })) fail("empty Clarity id loaded");
else if (!shouldLoadClarity({ nodeEnv: "production", projectId: "abcd1234", hostname: "arizonanotaryprep.com" })) fail("Clarity id did not load in production");
else if (shouldLoadClarity({ nodeEnv: "development", projectId: "abcd1234", hostname: "localhost", debug: false })) fail("Clarity loaded in dev");
else ok("Clarity 未配置或开发环境不加载");

if (!isSensitiveAnalyticsPath("/login/") || !isSensitiveAnalyticsPath("/account/billing/") || !isSensitiveAnalyticsPath("/pricing/") || !isSensitiveAnalyticsPath("/dashboard/")) {
  fail("sensitive routes were not detected");
} else if (isSensitiveAnalyticsPath("/arizona-notary-practice-test/")) fail("practice page treated as sensitive");
else ok("登录、Account、Dashboard、Checkout 页面会遮盖或停止录像");

if (viewEventForPath("/arizona-notary-exam/") !== "landing_view" || viewEventForPath("/register/") !== "register_view") {
  fail("view event mapping");
} else ok("landing / register 视图事件映射正确");

if (ratePercent(1, 0).value !== "N/A" || ratePercent(0, 0).value !== "N/A") fail("zero denominator returned a percent");
else if (ratePercent(0, 4).value !== "0.0%") fail("zero numerator should stay 0% when denominator exists");
else if (PRODUCT_METRICS.length < 7) fail("metric definitions incomplete");
else ok("分母为 0 时返回 N/A");

function walk(dir: string, hit: string[]) {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === ".next" || name === ".worktrees") continue;
    const full = path.join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, hit);
    else if (/\.(ts|tsx|js|mjs)$/.test(name)) hit.push(full);
  }
}
const files: string[] = [];
walk(process.cwd(), files);
const personalKeyHits = files.filter((file) => {
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");
  if (
    rel === "lib/analytics-server.ts" ||
    rel === "lib/operations/config.ts" ||
    rel === "scripts/analytics-verify.ts" ||
    rel === "scripts/operations-verify.ts"
  ) {
    return false;
  }
  if (rel.startsWith("docs/")) return false;
  return readFileSync(file, "utf8").includes("POSTHOG_PERSONAL_API_KEY");
});
if (personalKeyHits.length) fail(`personal API key referenced outside server config: ${personalKeyHits.join(", ")}`);
else ok("客户端代码不能读取 Personal API Key");

const claritySrc = readFileSync(path.join(process.cwd(), "components/MicrosoftClarity.tsx"), "utf8");
const authSrc = readFileSync(path.join(process.cwd(), "components/AuthForm.tsx"), "utf8");
const checkoutSrc = readFileSync(path.join(process.cwd(), "components/CheckoutButton.tsx"), "utf8");
const passwordSrc = readFileSync(path.join(process.cwd(), "components/PasswordField.tsx"), "utf8");
const paddleSrc = readFileSync(path.join(process.cwd(), "lib/billing/paddle-browser.ts"), "utf8");
if (!claritySrc.includes("return null") || !claritySrc.includes("clarity-mask") || !claritySrc.includes('clarity?.("stop")') || !claritySrc.includes("isSensitiveAnalyticsPath")) {
  fail("Clarity mask or unload guard missing");
} else if (!authSrc.includes("clarity-mask") || !checkoutSrc.includes("clarity-mask") || !passwordSrc.includes("clarity-mask")) {
  fail("sensitive fields are not marked for masking");
} else if (!paddleSrc.includes('event?.name !== "checkout.loaded"') || paddleSrc.includes("console.")) {
  fail("checkout_open is not tied to Paddle loaded, or Paddle data is logged");
} else ok("敏感页面和字段有遮盖，checkout_open 来自 Paddle loaded");

if (parseClarityProjectId("bad id") || parseClarityProjectId("")) fail("clarity parser");
else ok("Clarity project id 只接受安全字符");

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
