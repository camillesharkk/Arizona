import { PRODUCT_METRICS } from "../analytics-metrics.ts";
import { AZ_PRO_PRODUCT_CODE } from "../pricing/catalog.ts";
import { PRO_DURATION_DAYS } from "../product.ts";
import {
  calculatedAverage,
  calculatedRate,
  metricWindow,
  positionChange,
  rawMetric,
  type CalculatedMetric,
  type RawMetric,
  type SourceStatus,
} from "./metrics.ts";
import { containsInstant, type ReportWindow, type ReportWindows } from "./windows.ts";

export const FUNNEL_EVENTS = [
  "landing_view",
  "practice_view",
  "exam_start",
  "exam_complete",
  "register_view",
  "sign_up",
  "pricing_view",
  "checkout_open",
] as const;

export const CORE_PAGES = [
  "/arizona-notary-practice-test/",
  "/pricing/",
  "/register/",
  "/arizona-notary-study-guide/",
  "/arizona-notary-exam-questions/",
  "/dashboard/",
] as const;

export const FOCUS_QUERIES = [
  "Arizona notary exam",
  "Arizona notary practice test",
  "Arizona notary exam questions",
  "Arizona notary study guide",
  "AZ notary exam practice test",
] as const;

export const UNAVAILABLE_FROM_API = "UNAVAILABLE_FROM_API";

export type SourceState = {
  status: SourceStatus;
  warning: string | null;
};

export type EventTotals = { events: number; users: number; sessions: number };

export type Ga4SourceRow = { source: string; medium: string; sessions: number; activeUsers: number };

export type Ga4LandingRow = { page: string; sessions: number };

export type Ga4Engagement = {
  sessions: number;
  activeUsers: number;
  engagedSessions: number | null;
  engagementDurationSeconds: number | null;
};

export type GscRow = { key: string; clicks: number; impressions: number; ctr: number | null; position: number | null };

export type GscTotals = { clicks: number; impressions: number; ctr: number | null; position: number | null };

export type PaddleTxn = { id: string; status: string; grossMinor: number | null; currency: string | null; createdAt?: string };

export type EntitlementOrder = {
  providerOrderId: string;
  productCode: string | null;
  entitlementId: string | null;
  state: string | null;
  startsAt: string | null;
  expiresAt: string | null;
  paidAt?: string | null;
};

const POSTHOG_RATES = new Set(["payment_success_rate", "entitlement_grant_rate"]);

export function sessionsFor(totals: Record<string, EventTotals> | null, event: string) {
  if (!totals) return null;
  return totals[event]?.sessions ?? 0;
}

export function ga4Requests(window: ReportWindow) {
  const dateRanges = [{ startDate: window.start, endDate: window.end }];
  return {
    sources: {
      dateRanges,
      dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }],
    },
    landing: {
      dateRanges,
      dimensions: [{ name: "landingPage" }],
      metrics: [{ name: "sessions" }],
      orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
      limit: 50,
    },
    organic: {
      dateRanges,
      dimensions: [] as { name: string }[],
      metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "engagedSessions" }, { name: "userEngagementDuration" }],
      dimensionFilter: {
        filter: { fieldName: "sessionMedium", stringFilter: { matchType: "EXACT", value: "organic" } },
      },
    },
  };
}

export function gscRequest(window: ReportWindow, dimensions?: string[]) {
  return {
    startDate: window.start,
    endDate: window.end,
    rowLimit: dimensions ? 500 : 1,
    ...(dimensions ? { dimensions } : {}),
  };
}

export function parseGa4SourceReport(json: unknown): Ga4SourceRow[] {
  const report = json as { rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> };
  return (report.rows || []).map((row) => ({
    source: row.dimensionValues?.[0]?.value || "",
    medium: row.dimensionValues?.[1]?.value || "",
    activeUsers: Number(row.metricValues?.[0]?.value || 0),
    sessions: Number(row.metricValues?.[1]?.value || 0),
  }));
}

export function parseGa4LandingReport(json: unknown): Ga4LandingRow[] {
  const report = json as { rows?: Array<{ dimensionValues?: Array<{ value?: string }>; metricValues?: Array<{ value?: string }> }> };
  return (report.rows || []).map((row) => ({
    page: row.dimensionValues?.[0]?.value || "",
    sessions: Number(row.metricValues?.[0]?.value || 0),
  }));
}

export function parseGa4Engagement(json: unknown): Ga4Engagement {
  const report = json as { rows?: Array<{ metricValues?: Array<{ value?: string }> }> };
  const values = report.rows?.[0]?.metricValues || [];
  const sessions = Number(values[1]?.value || 0);
  const engaged = values[2]?.value == null ? null : Number(values[2].value);
  const duration = values[3]?.value == null ? null : Number(values[3].value);
  return {
    activeUsers: Number(values[0]?.value || 0),
    sessions,
    engagedSessions: Number.isFinite(engaged) ? engaged : null,
    engagementDurationSeconds: Number.isFinite(duration) ? duration : null,
  };
}

export function parseGscRows(json: unknown): { rows: GscRow[]; truncated: boolean } {
  const report = json as {
    rows?: Array<{ keys?: string[]; clicks?: number; impressions?: number; ctr?: number; position?: number }>;
  };
  const rows = (report.rows || []).map((row) => ({
    key: row.keys?.[0] || "",
    clicks: row.clicks ?? 0,
    impressions: row.impressions ?? 0,
    ctr: row.impressions ? (row.clicks ?? 0) / row.impressions : null,
    position: row.position ?? null,
  }));
  return { rows, truncated: rows.length >= 500 };
}

export function parseGscTotals(json: unknown): GscTotals {
  const report = json as { rows?: Array<{ clicks?: number; impressions?: number; ctr?: number; position?: number }> };
  const row = report.rows?.[0];
  if (!row) return { clicks: 0, impressions: 0, ctr: null, position: null };
  const impressions = row.impressions ?? 0;
  return {
    clicks: row.clicks ?? 0,
    impressions,
    ctr: impressions > 0 ? (row.clicks ?? 0) / impressions : null,
    position: row.position ?? null,
  };
}

export function summarizeGa4Sources(rows: Ga4SourceRow[]) {
  const sessions = rows.reduce((sum, row) => sum + row.sessions, 0);
  const activeUsers = rows.reduce((sum, row) => sum + row.activeUsers, 0);
  const pick = (pred: (row: Ga4SourceRow) => boolean) => rows.filter(pred).reduce((sum, row) => sum + row.sessions, 0);
  return {
    sessions,
    activeUsers,
    direct: pick((row) => row.source.toLowerCase() === "(direct)"),
    googleOrganic: pick((row) => row.source.toLowerCase() === "google" && row.medium.toLowerCase() === "organic"),
    bingOrganic: pick((row) => row.source.toLowerCase() === "bing" && row.medium.toLowerCase() === "organic"),
    organic: pick((row) => row.medium.toLowerCase() === "organic"),
    rows: [...rows].sort((a, b) => b.sessions - a.sessions),
  };
}

export function sortLandingPages(rows: Ga4LandingRow[]) {
  return [...rows].sort((a, b) => b.sessions - a.sessions || a.page.localeCompare(b.page));
}

export function gscCtr(clicks: number | null, impressions: number | null) {
  if (clicks == null || impressions == null || impressions <= 0) return null;
  return clicks / impressions;
}

export function queryPositionChange(previous: number | null, trailing: number | null) {
  if (previous == null || trailing == null) return null;
  return previous - trailing;
}

export function newQueries(input: {
  previous: GscRow[];
  trailing: GscRow[];
  previousPartial: boolean;
}) {
  const prev = new Map(input.previous.map((row) => [row.key.toLowerCase(), row]));
  const found: GscRow[] = [];
  for (const row of input.trailing) {
    if (row.impressions <= 0) continue;
    const earlier = prev.get(row.key.toLowerCase());
    if (earlier) {
      if (earlier.impressions === 0) found.push(row);
      continue;
    }
    if (!input.previousPartial) found.push(row);
  }
  return found;
}

export function rankMovers(previous: GscRow[], trailing: GscRow[]) {
  const prev = new Map(previous.map((row) => [row.key.toLowerCase(), row]));
  const movers = trailing.flatMap((row) => {
    const earlier = prev.get(row.key.toLowerCase());
    const change = queryPositionChange(earlier?.position ?? null, row.position);
    if (change == null || earlier == null) return [];
    return [{ query: row.key, change, trailingPosition: row.position, previousPosition: earlier.position }];
  });
  const rising = [...movers].filter((row) => row.change > 0).sort((a, b) => b.change - a.change).slice(0, 10);
  const falling = [...movers].filter((row) => row.change < 0).sort((a, b) => a.change - b.change).slice(0, 10);
  return { rising, falling };
}

export function uniqueCompleted(transactions: PaddleTxn[]) {
  return new Set(transactions.filter((txn) => txn.status === "completed" && txn.id).map((txn) => txn.id)).size;
}

export function grossCompletedMinor(transactions: PaddleTxn[]) {
  const seen = new Set<string>();
  let minor = 0;
  let currency: string | null = null;
  for (const txn of transactions) {
    if (txn.status !== "completed" || !txn.id || seen.has(txn.id)) continue;
    seen.add(txn.id);
    if (txn.grossMinor == null) return { minor: null as number | null, currency };
    minor += txn.grossMinor;
    currency = currency || txn.currency;
  }
  return { minor, currency };
}

export function reconcileEntitlements(completedIds: string[], orders: EntitlementOrder[]) {
  const ids = [...new Set(completedIds.filter(Boolean))];
  let matched = 0;
  let missingOrder = 0;
  let mismatched = 0;
  for (const id of ids) {
    const order = orders.find((item) => item.providerOrderId === id);
    if (!order) {
      missingOrder += 1;
      continue;
    }
    const days =
      order.startsAt && order.expiresAt ? (Date.parse(order.expiresAt) - Date.parse(order.startsAt)) / (24 * 60 * 60 * 1000) : null;
    const durationOk = days != null && Math.abs(days - PRO_DURATION_DAYS) < 0.01;
    const ok = order.productCode === AZ_PRO_PRODUCT_CODE && order.state === "AZ" && Boolean(order.entitlementId) && durationOk;
    if (ok) matched += 1;
    else mismatched += 1;
  }
  return { completed: ids.length, matched, missingOrder, mismatched };
}

function num(value: number | null | undefined) {
  return value == null ? null : value;
}

function posthogRates(window: ReportWindow, totals: Record<string, EventTotals> | null, status: SourceStatus, warning: string | null) {
  const view = metricWindow(window);
  return PRODUCT_METRICS.filter((metric) => !POSTHOG_RATES.has(metric.id)).map((metric) =>
    calculatedRate({
      name: metric.nameZh,
      formula: metric.formula,
      numerator: { label: metric.numeratorEvent, value: sessionsFor(totals, metric.numeratorEvent), source: "PostHog" },
      denominator: { label: metric.denominatorEvent, value: sessionsFor(totals, metric.denominatorEvent), source: "PostHog" },
      window: view,
      sourceStatus: status,
      warning,
    })
  );
}

export function buildOperationsSnapshot(input: {
  windows: ReportWindows;
  posthog: SourceState & { totals: Record<string, EventTotals> | null; breakdown: unknown[] | null };
  ga4: SourceState & {
    sources: Ga4SourceRow[] | null;
    landing: Ga4LandingRow[] | null;
    siteSessions: number | null;
    organic: Ga4Engagement | null;
  };
  gsc: SourceState & {
    yesterday: GscTotals | null;
    trailing: GscTotals | null;
    previous: GscTotals | null;
    trailingQueries: GscRow[] | null;
    previousQueries: GscRow[] | null;
    trailingPages: GscRow[] | null;
    partialRows: boolean;
  };
  paddle: SourceState & {
    transactions: PaddleTxn[] | null;
    refundCount: number | null;
    refundMinor: number | null;
    webhook: { delivered: number; failed: number; needsRetry: number; notAttempted: number } | null;
  };
  neon: SourceState & { orders: EntitlementOrder[] | null };
  vercel: SourceState & { productionState: string | null; errorDeployments: number | null; readyDeployments: number | null };
}) {
  const trailing = input.windows.trailing7;
  const view = metricWindow(trailing);
  const ga4Status = input.ga4.status;
  const sources = input.ga4.sources ? summarizeGa4Sources(input.ga4.sources) : null;
  const siteSessions = input.ga4.siteSessions ?? sources?.sessions ?? null;
  const landing = input.ga4.landing ? sortLandingPages(input.ga4.landing) : null;
  const hasTxnDates = (input.paddle.transactions || []).some((txn) => txn.createdAt);
  const txnsIn = (window: ReportWindow, includeUndated: boolean) =>
    (input.paddle.transactions || []).filter((txn) => {
      if (!txn.createdAt) return includeUndated;
      return containsInstant(txn.createdAt, window);
    });
  const trailingTx = input.paddle.transactions ? txnsIn(input.windows.trailing7, !hasTxnDates) : null;
  const paddleIds = trailingTx
    ? [...new Set(trailingTx.filter((txn) => txn.status === "completed").map((txn) => txn.id))]
    : null;
  const completedIdsFor = (window: ReportWindow) => {
    if (!input.paddle.transactions || !hasTxnDates) return null;
    return [...new Set(txnsIn(window, false).filter((txn) => txn.status === "completed" && txn.id).map((txn) => txn.id))];
  };
  const completed = paddleIds ? paddleIds.length : null;
  const incomplete = trailingTx
    ? new Set(trailingTx.filter((txn) => txn.status !== "completed" && txn.status !== "canceled").map((txn) => txn.id)).size
    : null;
  const gross = trailingTx ? grossCompletedMinor(trailingTx) : { minor: null, currency: null };
  const entitlement = paddleIds && input.neon.orders && input.neon.status === "available" && input.paddle.status === "available"
    ? reconcileEntitlements(paddleIds, input.neon.orders)
    : null;
  const crossPayment = input.posthog.status === "available" && input.paddle.status === "available" ? "available" : "unavailable";
  const crossGrant = input.paddle.status === "available" && input.neon.status === "available" ? "available" : "unavailable";
  const gscCompare = input.gsc.trailing && input.gsc.previous && input.gsc.status !== "unavailable" ? "available" : input.gsc.status;
  const movers = input.gsc.trailingQueries && input.gsc.previousQueries
    ? rankMovers(input.gsc.previousQueries, input.gsc.trailingQueries)
    : { rising: [], falling: [] };
  const fresh = input.gsc.trailingQueries && input.gsc.previousQueries
    ? newQueries({
        previous: input.gsc.previousQueries,
        trailing: input.gsc.trailingQueries,
        previousPartial: input.gsc.partialRows,
      })
    : [];

  const raw: RawMetric[] = [
    ...FUNNEL_EVENTS.map((event) =>
      rawMetric({
        name: event,
        value: input.posthog.totals ? (input.posthog.totals[event]?.events ?? 0) : null,
        unit: "events",
        source: "PostHog",
        window: view,
        freshness: null,
        sourceStatus: input.posthog.status,
      })
    ),
    rawMetric({
      name: "Active users",
      value: sources ? sources.activeUsers : null,
      unit: "users",
      source: "GA4",
      window: view,
      freshness: null,
      sourceStatus: ga4Status,
    }),
    rawMetric({
      name: "Sessions",
      value: num(siteSessions),
      unit: "sessions",
      source: "GA4",
      window: view,
      freshness: null,
      sourceStatus: ga4Status,
    }),
    rawMetric({
      name: "Direct sessions",
      value: sources ? sources.direct : null,
      unit: "sessions",
      source: "GA4",
      window: view,
      freshness: null,
      sourceStatus: ga4Status,
    }),
    rawMetric({
      name: "google / organic sessions",
      value: sources ? sources.googleOrganic : null,
      unit: "sessions",
      source: "GA4",
      window: view,
      freshness: null,
      sourceStatus: ga4Status,
    }),
    rawMetric({
      name: "bing / organic sessions",
      value: sources ? sources.bingOrganic : null,
      unit: "sessions",
      source: "GA4",
      window: view,
      freshness: null,
      sourceStatus: ga4Status,
    }),
    rawMetric({
      name: "Organic Search sessions",
      value: sources ? sources.organic : null,
      unit: "sessions",
      source: "GA4",
      window: view,
      freshness: null,
      sourceStatus: ga4Status,
    }),
    rawMetric({
      name: "Search Console clicks",
      value: input.gsc.trailing ? input.gsc.trailing.clicks : null,
      unit: "clicks",
      source: "Search Console",
      window: view,
      freshness: input.gsc.status === "delayed" ? "Search Console data is delayed" : null,
      sourceStatus: input.gsc.status,
    }),
    rawMetric({
      name: "Search Console impressions",
      value: input.gsc.trailing ? input.gsc.trailing.impressions : null,
      unit: "impressions",
      source: "Search Console",
      window: view,
      freshness: input.gsc.status === "delayed" ? "Search Console data is delayed" : null,
      sourceStatus: input.gsc.status,
    }),
    rawMetric({
      name: "Indexing coverage",
      value: UNAVAILABLE_FROM_API,
      unit: "pages",
      source: "Search Console",
      window: view,
      freshness: null,
      sourceStatus: "unavailable",
    }),
    rawMetric({
      name: "Paddle completed transactions",
      value: completed,
      unit: "transactions",
      source: "Paddle",
      window: view,
      freshness: null,
      sourceStatus: input.paddle.status,
    }),
    rawMetric({
      name: "Paddle gross sales",
      value: gross.minor == null ? null : (gross.minor / 100).toFixed(2),
      unit: gross.currency || "USD",
      source: "Paddle",
      window: view,
      freshness: null,
      sourceStatus: input.paddle.status,
    }),
    rawMetric({
      name: "Paddle refunds",
      value: input.paddle.refundCount,
      unit: "refunds",
      source: "Paddle",
      window: view,
      freshness: null,
      sourceStatus: input.paddle.status,
    }),
    rawMetric({
      name: "Paddle failed or incomplete",
      value: incomplete,
      unit: "transactions",
      source: "Paddle",
      window: view,
      freshness: null,
      sourceStatus: input.paddle.status,
    }),
    rawMetric({
      name: "Paddle available balance",
      value: UNAVAILABLE_FROM_API,
      unit: "USD",
      source: "Paddle",
      window: view,
      freshness: "Paddle Billing has no synchronous available-balance field. The balance report type is deprecated.",
      sourceStatus: "unavailable",
    }),
    rawMetric({
      name: "Paddle pending balance",
      value: UNAVAILABLE_FROM_API,
      unit: "USD",
      source: "Paddle",
      window: view,
      freshness: "Paddle Billing has no synchronous pending-balance field. payout_reconciliation is an async CSV and is not downloaded here.",
      sourceStatus: "unavailable",
    }),
    rawMetric({
      name: "Vercel production state",
      value: input.vercel.productionState,
      unit: "state",
      source: "Vercel",
      window: view,
      freshness: null,
      sourceStatus: input.vercel.status,
    }),
    rawMetric({
      name: "Vercel runtime log stream",
      value: UNAVAILABLE_FROM_API,
      unit: "logs",
      source: "Vercel",
      window: view,
      freshness: "GET /v1/projects/{projectId}/deployments/{deploymentId}/runtime-logs is a live stream, not a bounded daily aggregate.",
      sourceStatus: "unavailable",
    }),
  ];

  const calculated: CalculatedMetric[] = [
    ...posthogRates(trailing, input.posthog.totals, input.posthog.status, input.posthog.warning),
    calculatedRate({
      name: "Direct session share",
      formula: "该来源 Sessions ÷ 全部 Sessions × 100%",
      numerator: { label: "Direct sessions", value: sources ? sources.direct : null, source: "GA4" },
      denominator: { label: "All sessions", value: num(siteSessions), source: "GA4" },
      window: view,
      sourceStatus: ga4Status,
      warning: input.ga4.warning,
    }),
    calculatedRate({
      name: "google / organic session share",
      formula: "该来源 Sessions ÷ 全部 Sessions × 100%",
      numerator: { label: "google / organic sessions", value: sources ? sources.googleOrganic : null, source: "GA4" },
      denominator: { label: "All sessions", value: num(siteSessions), source: "GA4" },
      window: view,
      sourceStatus: ga4Status,
    }),
    calculatedRate({
      name: "bing / organic session share",
      formula: "该来源 Sessions ÷ 全部 Sessions × 100%",
      numerator: { label: "bing / organic sessions", value: sources ? sources.bingOrganic : null, source: "GA4" },
      denominator: { label: "All sessions", value: num(siteSessions), source: "GA4" },
      window: view,
      sourceStatus: ga4Status,
    }),
    calculatedRate({
      name: "Organic engagement rate",
      formula: "Organic engagedSessions ÷ Organic sessions × 100%",
      numerator: {
        label: "Organic engagedSessions",
        value: input.ga4.organic?.engagedSessions ?? null,
        source: "GA4",
      },
      denominator: { label: "Organic sessions", value: input.ga4.organic ? input.ga4.organic.sessions : null, source: "GA4" },
      window: view,
      sourceStatus: ga4Status,
    }),
    calculatedAverage({
      name: "Organic average engagement time",
      formula: "Organic userEngagementDuration ÷ Organic sessions",
      numerator: {
        label: "Organic user engagement duration",
        value: input.ga4.organic?.engagementDurationSeconds ?? null,
        source: "GA4",
      },
      denominator: { label: "Organic sessions", value: input.ga4.organic ? input.ga4.organic.sessions : null, source: "GA4" },
      window: view,
      sourceStatus: ga4Status,
      unit: "seconds",
    }),
    calculatedRate({
      name: "Search Console CTR",
      formula: "Clicks ÷ Impressions × 100%",
      numerator: { label: "Clicks", value: input.gsc.trailing?.clicks ?? null, source: "Search Console" },
      denominator: { label: "Impressions", value: input.gsc.trailing?.impressions ?? null, source: "Search Console" },
      window: view,
      sourceStatus: input.gsc.status === "unavailable" ? "unavailable" : input.gsc.status,
      warning: input.gsc.status === "delayed" ? "WATCH：Search Console 延迟，不是故障。" : input.gsc.warning,
    }),
    calculatedRate({
      name: "支付成功率",
      formula: "Paddle Completed unique transactions ÷ PostHog Checkout Open unique checkouts × 100%",
      numerator: { label: "Paddle completed unique transactions", value: completed, source: "Paddle" },
      denominator: { label: "checkout_open unique sessions", value: sessionsFor(input.posthog.totals, "checkout_open"), source: "PostHog" },
      window: view,
      sourceStatus: crossPayment,
      warning:
        "前端漏斗为 Session 漏斗；付款和权益步骤为跨数据源趋势核对，不代表严格同一 Session 顺序。" +
        (crossPayment === "unavailable" ? " WATCH：跨数据源缺少 PostHog 或 Paddle，不标为支付 CRITICAL。" : ""),
    }),
    calculatedRate({
      name: "权益发放成功率",
      formula: "Entitlement Granted unique orders ÷ Paddle Completed unique transactions × 100%",
      numerator: { label: "Matched Neon orders", value: entitlement ? entitlement.matched : null, source: "Neon" },
      denominator: { label: "Paddle completed unique transactions", value: completed, source: "Paddle" },
      window: view,
      sourceStatus: crossGrant,
      warning:
        "前端漏斗为 Session 漏斗；付款和权益步骤为跨数据源趋势核对，不代表严格同一 Session 顺序。" +
        (entitlement && entitlement.completed > 0 && entitlement.matched !== entitlement.completed
          ? " CRITICAL：已完成的 Paddle 交易与 Neon 订单或 60 天 AZ 权益不一致。"
          : ""),
    }),
    positionChange({
      name: "Search Console average position change",
      previous: input.gsc.previous?.position ?? null,
      trailing: input.gsc.trailing?.position ?? null,
      window: view,
      sourceStatus: gscCompare === "delayed" ? "delayed" : gscCompare,
      warning: input.gsc.status === "delayed" ? "WATCH：Search Console 延迟，不是故障。" : input.gsc.warning,
    }),
  ];

  const landingShares = (landing || []).slice(0, 10).map((row) =>
    calculatedRate({
      name: `Landing ${row.page}`,
      formula: "该 Landing Page Sessions ÷ 全站 Sessions × 100%",
      numerator: { label: row.page, value: row.sessions, source: "GA4" },
      denominator: { label: "All sessions", value: num(siteSessions), source: "GA4" },
      window: view,
      sourceStatus: ga4Status,
    })
  );

  const alerts: { level: "WATCH" | "CRITICAL"; message: string }[] = [];
  if (input.posthog.status === "unavailable") alerts.push({ level: "WATCH", message: "PostHog unavailable" });
  if (input.gsc.status === "delayed" || input.gsc.status === "unavailable") {
    alerts.push({ level: "WATCH", message: "Search Console delayed or unavailable" });
  }
  if (entitlement && entitlement.completed > 0 && entitlement.matched !== entitlement.completed) {
    alerts.push({ level: "CRITICAL", message: "Paddle completed transactions do not match Neon entitlements" });
  }

  return {
    generatedAt: input.windows.generatedAt,
    dataAsOf: input.windows.yesterday.dataAsOf,
    timezone: "America/Phoenix" as const,
    windows: input.windows,
    posthog: {
      breakdown: input.posthog.breakdown,
    },
    sources: {
      posthog: input.posthog.status,
      ga4: input.ga4.status,
      searchConsole: input.gsc.status,
      paddle: input.paddle.status,
      neon: input.neon.status,
      vercel: input.vercel.status,
    },
    alerts,
    raw,
    calculated: [...calculated, ...landingShares],
    ga4: {
      landing: landing?.slice(0, 10) ?? null,
      corePages: CORE_PAGES.map((page) => {
        const found = landing?.find((row) => row.page === page);
        const complete = landing != null && landing.length < 50;
        return {
          page,
          sessions: !landing ? null : found ? found.sessions : complete ? 0 : null,
        };
      }),
    },
    gsc: {
      totals: {
        yesterday: input.gsc.yesterday,
        trailing7: input.gsc.trailing,
        previous7: input.gsc.previous,
      },
      topQueries: (input.gsc.trailingQueries || []).slice().sort((a, b) => b.clicks - a.clicks).slice(0, 10),
      topPages: (input.gsc.trailingPages || []).slice().sort((a, b) => b.clicks - a.clicks).slice(0, 10),
      rising: movers.rising,
      falling: movers.falling,
      newQueries: fresh.map((row) => row.key),
      focus: FOCUS_QUERIES.map((query) => {
        const row = (input.gsc.trailingQueries || []).find((item) => item.key.toLowerCase() === query.toLowerCase());
        const earlier = (input.gsc.previousQueries || []).find((item) => item.key.toLowerCase() === query.toLowerCase());
        return {
          query,
          clicks: row ? row.clicks : null,
          impressions: row ? row.impressions : null,
          positionChange: queryPositionChange(earlier?.position ?? null, row?.position ?? null),
        };
      }),
    },
    funnelCounts: {
      yesterday: {
        paddleCompleted: completedIdsFor(input.windows.yesterday)?.length ?? null,
        entitlementGranted:
          input.neon.orders && completedIdsFor(input.windows.yesterday)
            ? reconcileEntitlements(completedIdsFor(input.windows.yesterday) || [], input.neon.orders).matched
            : null,
      },
      trailing7: {
        paddleCompleted: completed,
        entitlementGranted: entitlement ? entitlement.matched : null,
      },
      previous7: {
        paddleCompleted: completedIdsFor(input.windows.previous7)?.length ?? null,
        entitlementGranted:
          input.neon.orders && completedIdsFor(input.windows.previous7)
            ? reconcileEntitlements(completedIdsFor(input.windows.previous7) || [], input.neon.orders).matched
            : null,
      },
    },
    paddle: {
      completed,
      incomplete,
      grossMinor: gross.minor,
      refundCount: input.paddle.refundCount,
      refundMinor: input.paddle.refundMinor,
      webhook: input.paddle.webhook,
      entitlement,
    },
    vercel: {
      productionState: input.vercel.productionState,
      errorDeployments: input.vercel.errorDeployments,
      readyDeployments: input.vercel.readyDeployments,
    },
    privacy: {
      includesCustomerDetails: false,
      includesTransactionIds: false,
      includesUserIds: false,
      includesCredentials: false,
      usesGa4Revenue: false,
    },
  };
}
