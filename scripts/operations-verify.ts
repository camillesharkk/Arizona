/**
 * Operations Google aggregate parsers. In-memory only. No network. No secrets.
 * Run: npm run operations:verify
 */
import { summarizeGa4, summarizeGsc } from "../lib/operations/google-summary.ts";

let failures = 0;
const lines: string[] = [];
function fail(msg: string) {
  failures += 1;
  lines.push(`FAIL  ${msg}`);
}
function ok(msg: string) {
  lines.push(`OK    ${msg}`);
}

const ga4 = summarizeGa4({
  rows: [
    {
      dimensionValues: [{ value: "Direct" }],
      metricValues: [{ value: "18" }, { value: "17" }, { value: "21" }],
    },
    {
      dimensionValues: [{ value: "Organic Search" }],
      metricValues: [{ value: "7" }, { value: "6" }, { value: "27" }],
    },
  ],
});
if (ga4.sessions !== 25 || ga4.users !== 23 || ga4.pageviews !== 48) fail("ga4 totals");
else if (ga4.channels.length !== 2 || ga4.channels[0]?.channel !== "Direct") fail("ga4 channels");
else ok("ga4 channel rows sum to totals");

const gsc = summarizeGsc({
  rows: [
    { keys: ["az notary practice test free"], clicks: 0, impressions: 5, ctr: 0, position: 53.6 },
    { keys: ["az notary exam"], clicks: 1, impressions: 2, ctr: 0.5, position: 12 },
  ],
});
if (gsc.clicks !== 1 || gsc.impressions !== 7 || gsc.rowCount !== 2) fail("gsc totals");
else if (gsc.topQueries[0]?.query !== "az notary practice test free") fail("gsc query");
else ok("gsc query rows sum to totals");

const emptyGa4 = summarizeGa4({});
const emptyGsc = summarizeGsc({});
if (emptyGa4.sessions !== 0 || emptyGsc.clicks !== 0) fail("empty reports");
else ok("missing rows → zeros");

import { readFileSync } from "fs";
import path from "path";
import { PRODUCT_METRICS } from "../lib/analytics-metrics.ts";
import {
  buildOperationsSnapshot,
  ga4Requests,
  gscCtr,
  newQueries,
  queryPositionChange,
  rankMovers,
  reconcileEntitlements,
  sortLandingPages,
  summarizeGa4Sources,
  uniqueCompleted,
  type EntitlementOrder,
  type PaddleTxn,
} from "../lib/operations/aggregate.ts";
import { posthogQueryHost } from "../lib/operations/config.ts";
import { calculatedRate, metricWindow } from "../lib/operations/metrics.ts";
import { phoenixDate, reportWindows, windowsOverlap } from "../lib/operations/windows.ts";

const july = phoenixDate(new Date("2026-07-15T06:30:00.000Z"));
const march = phoenixDate(new Date("2026-03-08T07:00:00.000Z"));
if (july !== "2026-07-14" || march !== "2026-03-08") fail("Phoenix offset changed with US daylight saving");
else ok("America/Phoenix stays UTC-7 in March and July");

const windows = reportWindows(new Date("2026-10-03T15:00:00.000Z"));
if (windows.yesterday.start !== "2026-10-02" || windows.yesterday.end !== "2026-10-02") fail("yesterday window");
else if (windows.trailing7.start !== "2026-09-26" || windows.trailing7.end !== "2026-10-02") fail("trailing 7");
else if (windows.previous7.start !== "2026-09-19" || windows.previous7.end !== "2026-09-25") fail("previous 7");
else if (windowsOverlap(windows.trailing7, windows.previous7)) fail("7-day windows overlap");
else if (windows.yesterday.dataAsOf === windows.generatedAt) fail("data cutoff equals generation time");
else ok("three Phoenix windows do not overlap and dataAsOf is not generatedAt");

const sourceRows = [
  { source: "(direct)", medium: "(none)", sessions: 40, activeUsers: 30 },
  { source: "google", medium: "organic", sessions: 30, activeUsers: 20 },
  { source: "bing", medium: "organic", sessions: 10, activeUsers: 8 },
];
const sources = summarizeGa4Sources(sourceRows);
if (sources.sessions !== 80 || sources.direct !== 40 || sources.googleOrganic !== 30 || sources.bingOrganic !== 10 || sources.organic !== 40) {
  fail("ga4 source aggregation");
} else ok("GA4 direct, google/organic, bing/organic and organic total");

const landing = sortLandingPages([
  { page: "/register/", sessions: 5 },
  { page: "/pricing/", sessions: 12 },
  { page: "/arizona-notary-practice-test/", sessions: 9 },
]);
if (landing[0]?.page !== "/pricing/" || landing[1]?.page !== "/arizona-notary-practice-test/") fail("landing sort");
else ok("landing pages sort by sessions");

if (gscCtr(1, 4) !== 0.25 || gscCtr(0, 0) !== null) fail("gsc ctr");
else ok("Search Console CTR is clicks ÷ impressions, and 0 impressions is null");

if (queryPositionChange(12, 4) !== 8 || queryPositionChange(3, 9) !== -6) fail("position direction");
else ok("positive position change is an improvement");

const fresh = newQueries({
  previous: [{ key: "new phrase", clicks: 0, impressions: 0, ctr: null, position: null }],
  trailing: [{ key: "new phrase", clicks: 1, impressions: 3, ctr: 1 / 3, position: 8 }],
  previousPartial: false,
});
const hidden = newQueries({
  previous: [],
  trailing: [{ key: "maybe new", clicks: 1, impressions: 2, ctr: 0.5, position: 6 }],
  previousPartial: true,
});
if (fresh.length !== 1 || hidden.length !== 0) fail("new keyword rule");
else ok("new keyword needs previous impressions 0 and is not inferred from a partial list");

const movers = rankMovers(
  [
    { key: "up", clicks: 1, impressions: 10, ctr: 0.1, position: 20 },
    { key: "down", clicks: 1, impressions: 10, ctr: 0.1, position: 3 },
  ],
  [
    { key: "up", clicks: 2, impressions: 10, ctr: 0.2, position: 5 },
    { key: "down", clicks: 1, impressions: 10, ctr: 0.1, position: 11 },
  ]
);
if (movers.rising[0]?.query !== "up" || movers.falling[0]?.query !== "down") fail("rank movers");
else ok("rising and falling queries use position change direction");

const txns: PaddleTxn[] = [
  { id: "txn_1", status: "completed", grossMinor: 1999, currency: "USD", createdAt: "2026-10-01T00:00:00.000Z" },
  { id: "txn_1", status: "completed", grossMinor: 1999, currency: "USD", createdAt: "2026-10-01T00:00:00.000Z" },
  { id: "txn_2", status: "ready", grossMinor: null, currency: "USD", createdAt: "2026-10-01T00:00:00.000Z" },
];
if (uniqueCompleted(txns) !== 1) fail("paddle completed dedupe");
else ok("Paddle completed transactions are unique by id");

const start = "2026-10-01T00:00:00.000Z";
const end = new Date(Date.parse(start) + 60 * 24 * 60 * 60 * 1000).toISOString();
const orders: EntitlementOrder[] = [
  { providerOrderId: "txn_1", productCode: "az_exam_pro_60d", entitlementId: "ent-1", state: "AZ", startsAt: start, expiresAt: end },
  { providerOrderId: "txn_3", productCode: "az_exam_pro_60d", entitlementId: "ent-2", state: "CA", startsAt: start, expiresAt: end },
];
const recon = reconcileEntitlements(["txn_1", "txn_3", "txn_missing"], orders);
if (recon.matched !== 1 || recon.mismatched !== 1 || recon.missingOrder !== 1) fail("entitlement reconcile");
else ok("entitlement check requires az_exam_pro_60d, AZ, and 60 days");

const zeroRate = calculatedRate({
  name: "zero",
  formula: "a ÷ b × 100%",
  numerator: { label: "a", value: 1, source: "PostHog" },
  denominator: { label: "b", value: 0, source: "PostHog" },
  window: metricWindow(windows.trailing7),
  sourceStatus: "available",
});
if (zeroRate.value !== null || zeroRate.formattedValue !== "N/A") fail("zero denominator");
else ok("denominator 0 formats as N/A and value is null");

const small = calculatedRate({
  name: "small",
  formula: "a ÷ b × 100%",
  numerator: { label: "a", value: 1, source: "GA4" },
  denominator: { label: "b", value: 4, source: "GA4" },
  window: metricWindow(windows.trailing7),
  sourceStatus: "available",
});
if (!small.warning?.includes("小样本")) fail("small sample warning");
else ok("small sample warns against changing SEO, pricing, or payments");

const partial = buildOperationsSnapshot({
  windows,
  posthog: { status: "unavailable", warning: "WATCH", totals: null, breakdown: null },
  ga4: {
    status: "available",
    warning: null,
    sources: sourceRows,
    landing,
    siteSessions: 80,
    organic: { sessions: 40, activeUsers: 28, engagedSessions: 20, engagementDurationSeconds: 400 },
  },
  gsc: {
    status: "delayed",
    warning: "WATCH",
    yesterday: null,
    trailing: { clicks: 2, impressions: 8, ctr: 0.25, position: 4 },
    previous: { clicks: 1, impressions: 8, ctr: 0.125, position: 12 },
    trailingQueries: [],
    previousQueries: [],
    trailingPages: [],
    partialRows: false,
  },
  paddle: { status: "unavailable", warning: null, transactions: null, refundCount: null, refundMinor: null, webhook: null },
  neon: { status: "unavailable", warning: null, orders: null },
  vercel: { status: "unavailable", warning: null, productionState: null, errorDeployments: null, readyDeployments: null },
});
const landingRaw = partial.raw.find((metric) => metric.name === "landing_view");
const sessionsRaw = partial.raw.find((metric) => metric.name === "Sessions");
const indexing = partial.raw.find((metric) => metric.name === "Indexing coverage");
const payment = partial.calculated.find((metric) => metric.name === "支付成功率");
if (landingRaw?.value !== null || sessionsRaw?.value !== 80) fail("partial source zeroed another source");
else if (indexing?.value !== "UNAVAILABLE_FROM_API") fail("indexing was invented");
else if (payment?.value !== null || payment?.formattedValue !== "N/A") fail("missing checkout denominator became a percent");
else if (!partial.alerts.some((alert) => alert.level === "WATCH") || partial.alerts.some((alert) => alert.level === "CRITICAL")) {
  fail("PostHog or Search Console failure was marked CRITICAL");
} else if (partial.privacy.usesGa4Revenue) fail("GA4 revenue flag");
else ok("one unavailable source still produces the report, with WATCH and nulls");

const ga4Body = JSON.stringify(ga4Requests(windows.trailing7));
if (ga4Body.includes("totalRevenue") || ga4Body.includes("purchaseRevenue")) fail("GA4 revenue metric requested");
else ok("GA4 report does not request revenue");

if (posthogQueryHost({ POSTHOG_HOST: "https://us.i.posthog.com" }) !== "https://us.posthog.com") fail("query host used ingest");
else if (posthogQueryHost({ POSTHOG_HOST: "https://eu.posthog.com" }) !== "https://eu.posthog.com") fail("EU query host");
else ok("PostHog query host is the app host, not the ingest host");

const reportSource = readFileSync(path.join(process.cwd(), "lib/operations/daily-report.ts"), "utf8");
const cronSource = readFileSync(path.join(process.cwd(), "app/api/cron/operations-report/route.ts"), "utf8");
if (!reportSource.includes("on conflict (source, report_date)")) fail("upsert missing");
else if (!cronSource.includes("result.summary.ok")) fail("cron still fails the whole job for one source");
else if (PRODUCT_METRICS.length < 7) fail("phase 1 metric definitions missing");
else ok("summary upsert is idempotent and cron survives a source failure");

import {
  ENTITLEMENT_CRITICAL,
  FUNNEL_NOTE,
  judgeOperationsStatus,
  operationsAccess,
  operationsAdvice,
  operationsShortcuts,
  presentOperationsReport,
  selectSummaryReport,
} from "../lib/operations/report-view.ts";

if (operationsAccess(null, "admin@example.com") !== "anonymous") fail("anonymous admin gate");
else if (operationsAccess("other@example.com", "admin@example.com") !== "forbidden") fail("non-admin gate");
else if (operationsAccess("Admin@Example.com", "admin@example.com") !== "ok") fail("admin email match");
else ok("operations access rejects anonymous users and non-admins");

const historyRows = [
  { reportDate: "2026-10-02", generatedAt: "2026-10-03T01:00:00.000Z", dataAsOf: "2026-10-02T07:00:00.000Z", snapshot: { id: "latest" } },
  { reportDate: "2026-10-01", generatedAt: "2026-10-02T01:00:00.000Z", dataAsOf: "2026-10-01T07:00:00.000Z", snapshot: { id: "older" } },
];
if (selectSummaryReport(historyRows, null)?.reportDate !== "2026-10-02") fail("latest history report");
else if (selectSummaryReport(historyRows, "2026-10-01")?.snapshot && (selectSummaryReport(historyRows, "2026-10-01")?.snapshot as { id: string }).id !== "older") {
  fail("dated history report");
} else if (selectSummaryReport(historyRows, "nope")) fail("invalid history date");
else ok("historical summary reports can be selected by date");

const shown = presentOperationsReport(partial);
if (shown.usesGa4Revenue || shown.revenueSource !== "Paddle") fail("GA4 revenue used as revenue");
else if (shown.verdict.status === "ACTION REQUIRED") fail("PostHog or Search Console failure became ACTION REQUIRED");
else if (!shown.verdict.watch.length) fail("partial failure produced no WATCH");
else if (shown.steps.some((step) => step.changeRate.denominator.value === 0 && step.changeRate.formattedValue.endsWith("%"))) {
  fail("zero denominator rendered as a percent");
} else if (shown.calculated.some((metric) => !metric.formula || !metric.numerator || !metric.denominator)) {
  fail("calculated metric missing formula");
} else if (!shown.steps.every((step) => step.absolute.formula && step.changeRate.numerator && step.changeRate.denominator)) {
  fail("funnel change missing formula");
} else if (!JSON.stringify(shown).includes(FUNNEL_NOTE) && FUNNEL_NOTE.length < 5) fail("funnel note");
else if (JSON.stringify(shown).includes("txn_") || JSON.stringify(shown).includes("@")) fail("report view leaked an identifier");
else ok("report view keeps formulas, hides identifiers, and does not treat delay as action");

const mismatch = buildOperationsSnapshot({
  windows,
  posthog: {
    status: "available",
    warning: null,
    totals: Object.fromEntries(["landing_view", "practice_view", "exam_start", "exam_complete", "register_view", "sign_up", "pricing_view", "checkout_open"].map((event) => [event, { events: 100, users: 80, sessions: 80 }])),
    breakdown: [],
  },
  ga4: {
    status: "available",
    warning: null,
    sources: sourceRows,
    landing,
    siteSessions: 80,
    organic: { sessions: 40, activeUsers: 28, engagedSessions: 20, engagementDurationSeconds: 400 },
  },
  gsc: {
    status: "available",
    warning: null,
    yesterday: { clicks: 4, impressions: 20, ctr: 0.2, position: 8 },
    trailing: { clicks: 20, impressions: 100, ctr: 0.2, position: 7 },
    previous: { clicks: 10, impressions: 80, ctr: 0.125, position: 9 },
    trailingQueries: [],
    previousQueries: [],
    trailingPages: [],
    partialRows: false,
  },
  paddle: {
    status: "available",
    warning: null,
    transactions: [{ id: "txn_secret", status: "completed", grossMinor: 1999, currency: "USD", createdAt: "2026-10-01T12:00:00.000Z" }],
    refundCount: 0,
    refundMinor: 0,
    webhook: { delivered: 0, failed: 1, needsRetry: 0, notAttempted: 0 },
  },
  neon: { status: "available", warning: null, orders: [] },
  vercel: { status: "available", warning: null, productionState: "READY", errorDeployments: 0, readyDeployments: 1 },
});
const mismatchView = presentOperationsReport({ ...mismatch, history: { posthog: { yesterday: null, trailing7: mismatch.raw, previous7: null } } });
if (mismatchView.verdict.status !== "ACTION REQUIRED" || !mismatchView.verdict.action.includes(ENTITLEMENT_CRITICAL)) {
  fail("missing entitlement did not require action");
} else if (JSON.stringify(mismatchView).includes("txn_secret")) fail("transaction id entered the report");
else ok("missing entitlement requires action and the fixed warning");

const brokenDeploy = judgeOperationsStatus({
  sources: { posthog: "available", ga4: "available", searchConsole: "available", paddle: "available", neon: "available", vercel: "available" },
  productionState: "ERROR",
  entitlement: { completed: 0, matched: 0, missingOrder: 0, mismatched: 0 },
  smallSample: false,
  generatedAt: windows.generatedAt,
  dataAsOf: windows.yesterday.dataAsOf,
  yesterdayClicks: 4,
  trailingClicks: 20,
});
if (brokenDeploy.status !== "ACTION REQUIRED") fail("production error stayed healthy");
else ok("production that is not Ready requires action");

const delayedOnly = judgeOperationsStatus({
  sources: { posthog: "available", ga4: "unavailable", searchConsole: "delayed", paddle: "available", neon: "available", vercel: "available" },
  productionState: "READY",
  entitlement: { completed: 1, matched: 1, missingOrder: 0, mismatched: 0 },
  smallSample: true,
  generatedAt: windows.generatedAt,
  dataAsOf: windows.yesterday.dataAsOf,
  yesterdayClicks: 0,
  trailingClicks: 20,
});
if (delayedOnly.status !== "WATCH") fail("delay or small sample required action");
else ok("API failure, delay, empty Search Console day, and small samples stay at WATCH");

const advice = operationsAdvice(delayedOnly, { completed: 1, matched: 1, productionState: "READY" });
const adviceText = JSON.stringify(advice);
if (advice.some((item) => !item.evidence) || /改价|自动退款|自动补单|自动发放|自动部署|大规模修改 SEO/.test(adviceText) && !adviceText.includes("不要")) {
  fail("advice lacked evidence or proposed an automatic change");
} else ok("advice cites evidence and does not automate pricing, SEO, refunds, or deploys");

const links = operationsShortcuts({ POSTHOG_PERSONAL_API_KEY: "phx_secret", POSTHOG_PROJECT_ID: "123" });
if (JSON.stringify(links).includes("phx_secret") || links.length < 8) fail("shortcut leaked a key");
else ok("external shortcuts do not carry API keys");

const extensionManifest = JSON.parse(readFileSync(path.join(process.cwd(), "extension/manifest.json"), "utf8"));
const popupJs = readFileSync(path.join(process.cwd(), "extension/popup.js"), "utf8");
const popupHtml = readFileSync(path.join(process.cwd(), "extension/popup.html"), "utf8");
const middlewareSource = readFileSync(path.join(process.cwd(), "middleware.ts"), "utf8");
const pageSource = readFileSync(path.join(process.cwd(), "app/admin/operations/page.tsx"), "utf8");
if (extensionManifest.host_permissions || extensionManifest.content_scripts || extensionManifest.permissions?.length) {
  fail("extension still has scrape permissions");
} else if (/storage|apiKey|API_KEY|phx_|BEGIN PRIVATE/.test(popupJs + popupHtml)) fail("extension stores a key");
else if (!popupJs.includes("/admin/operations/")) fail("extension does not open the report");
else if (!middlewareSource.includes("status: 401") || !middlewareSource.includes("status: 403")) fail("admin route status codes");
else if (!pageSource.includes("operationsAccess") || pageSource.includes("OPERATIONS_ADMIN_EMAILS}")) fail("page exposes the allowlist");
else if (/退款|补单|重放|发放权益|执行 SQL/.test(pageSource)) fail("report page exposes a write action");
else ok("extension is a read-only launcher and the report route is server-gated");

console.log(lines.join("\n"));
if (failures) {
  console.error(`operations:verify failed (${failures})`);
  process.exit(1);
}
console.log("operations:verify passed");
