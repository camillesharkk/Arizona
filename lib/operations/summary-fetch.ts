import "server-only";

import type { Adjustment, Transaction } from "@paddle/paddle-node-sdk";
import { createPaddleSdk, getPaddleCheckoutConfig } from "@/lib/billing/paddle";
import { googleApiPost } from "@/lib/operations/google";
import { getPgSql } from "@/lib/store/pg-store";
import {
  FUNNEL_EVENTS,
  ga4Requests,
  gscRequest,
  parseGa4Engagement,
  parseGa4LandingReport,
  parseGa4SourceReport,
  parseGscRows,
  parseGscTotals,
  type EntitlementOrder,
  type EventTotals,
  type PaddleTxn,
  type SourceState,
} from "./aggregate.ts";
import { reportConfig } from "./config.ts";
import type { ReportWindow, ReportWindows } from "./windows.ts";

type Totals = Record<string, EventTotals>;

function unavailable(warning: string): SourceState {
  return { status: "unavailable", warning };
}

function hogqlTime(iso: string) {
  return iso.slice(0, 19).replace("T", " ");
}

function posthogSql(window: ReportWindow) {
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const start = hogqlTime(window.startIso);
  const end = hogqlTime(window.endIso);
  return `
    SELECT event, count() AS events, count(DISTINCT person_id) AS users, count(DISTINCT properties.$session_id) AS sessions
    FROM events
    WHERE timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
      AND event IN (${events})
    GROUP BY event
    LIMIT 100
  `;
}

function readPosthog(json: unknown): Totals {
  const body = json as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || ["event", "events", "users", "sessions"];
  const totals: Totals = {};
  for (const row of body.results || []) {
    const record = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
    const event = String(record.event || "");
    if (!event) continue;
    totals[event] = {
      events: Number(record.events || 0),
      users: Number(record.users || 0),
      sessions: Number(record.sessions || 0),
    };
  }
  return totals;
}

async function posthogTotals(window: ReportWindow): Promise<{ ok: true; totals: Totals } | { ok: false }> {
  const cfg = reportConfig();
  if (!cfg.posthogKey || !cfg.posthogProjectId) return { ok: false };
  const res = await fetch(`${cfg.posthogHost}/api/projects/${encodeURIComponent(cfg.posthogProjectId)}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.posthogKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      query: { kind: "HogQLQuery", query: posthogSql(window) },
      name: "operations funnel totals",
    }),
  });
  if (!res.ok) return { ok: false };
  return { ok: true, totals: readPosthog(await res.json()) };
}

async function posthogBreakdown(window: ReportWindow) {
  const cfg = reportConfig();
  if (!cfg.posthogKey || !cfg.posthogProjectId) return null;
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const start = hogqlTime(window.startIso);
  const end = hogqlTime(window.endIso);
  const query = `
    SELECT event,
      toString(properties.state) AS state,
      toString(properties.mode) AS mode,
      toString(properties.plan) AS plan,
      toString(properties.product_code) AS product_code,
      count() AS events,
      count(DISTINCT person_id) AS users,
      count(DISTINCT properties.$session_id) AS sessions
    FROM events
    WHERE timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
      AND event IN (${events})
    GROUP BY event, state, mode, plan, product_code
    LIMIT 500
  `;
  const res = await fetch(`${cfg.posthogHost}/api/projects/${encodeURIComponent(cfg.posthogProjectId)}/query/`, {
    method: "POST",
    headers: { Authorization: `Bearer ${cfg.posthogKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query }, name: "operations funnel breakdown" }),
  });
  if (!res.ok) return null;
  const body = (await res.json()) as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || [];
  return (body.results || []).map((row) => Object.fromEntries(columns.map((column, index) => [column, row[index]])));
}

async function ga4Json(propertyId: string, body: unknown) {
  return googleApiPost(`https://analyticsdata.googleapis.com/v1beta/properties/${encodeURIComponent(propertyId)}:runReport`, body);
}

async function gscJson(siteUrl: string, body: unknown) {
  return googleApiPost(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`,
    body
  );
}

function inWindow(iso: string, window: ReportWindow) {
  return iso >= window.startIso && iso < window.endIso;
}

async function paddleWindow(windows: ReportWindows) {
  const config = getPaddleCheckoutConfig();
  if (!config.ok) return { state: unavailable("PADDLE_NOT_CONFIGURED"), transactions: null as PaddleTxn[] | null, refundCount: null, refundMinor: null, webhook: null };
  try {
    const paddle = createPaddleSdk(config.config);
    const transactions: PaddleTxn[] = [];
    const listed = paddle.transactions.list({
      "createdAt[GTE]": windows.previous7.startIso,
      "createdAt[LT]": windows.yesterday.endIso,
      perPage: 200,
      orderBy: "created_at[DESC]",
    });
    for await (const transaction of listed) {
      const item = transaction as Transaction;
      transactions.push({
        id: item.id,
        status: item.status,
        grossMinor: item.details?.totals?.grandTotal && /^-?\d+$/.test(item.details.totals.grandTotal) ? Number(item.details.totals.grandTotal) : null,
        currency: item.currencyCode || null,
        createdAt: item.createdAt,
      });
    }
    let refundCount = 0;
    let refundMinor = 0;
    let scanned = 0;
    const adjustments = paddle.adjustments.list({ perPage: 100, orderBy: "created_at[DESC]" });
    for await (const adjustment of adjustments) {
      const item = adjustment as Adjustment;
      scanned += 1;
      if (inWindow(item.createdAt, windows.trailing7) && item.action === "refund" && item.status === "approved") {
        refundCount += 1;
        if (item.totals?.total && /^-?\d+$/.test(item.totals.total)) refundMinor += Number(item.totals.total);
      }
      if (item.createdAt < windows.trailing7.startIso || scanned >= 500) break;
    }
    const webhook = { delivered: 0, failed: 0, needsRetry: 0, notAttempted: 0 };
    let notes = 0;
    const notifications = paddle.notifications.list({
      perPage: 50,
      from: windows.trailing7.startIso,
      to: windows.trailing7.endIso,
    });
    for await (const notification of notifications) {
      notes += 1;
      if (notification.type !== "transaction.completed") continue;
      if (notification.status === "delivered") webhook.delivered += 1;
      else if (notification.status === "failed") webhook.failed += 1;
      else if (notification.status === "needs_retry") webhook.needsRetry += 1;
      else webhook.notAttempted += 1;
      if (notes >= 200) break;
    }
    return { state: { status: "available" as const, warning: null }, transactions, refundCount, refundMinor, webhook };
  } catch {
    return { state: unavailable("PADDLE_API_FAILED"), transactions: null, refundCount: null, refundMinor: null, webhook: null };
  }
}

async function neonOrders(windows: ReportWindows): Promise<{ state: SourceState; orders: EntitlementOrder[] | null }> {
  if (!process.env.DATABASE_URL) return { state: unavailable("DATABASE_URL_MISSING"), orders: null };
  try {
    const sql = getPgSql();
    const rows = (await sql`
      select o.provider_order_id, o.product_code, o.entitlement_id, e.state, e.starts_at, e.expires_at, o.paid_at
      from commerce_orders o
      left join entitlements e on e.id = o.entitlement_id
      where o.provider = 'paddle'
        and o.paid_at >= ${windows.previous7.startIso}
        and o.paid_at < ${windows.yesterday.endIso}
    `) as unknown as {
      provider_order_id: string;
      product_code: string | null;
      entitlement_id: string | null;
      state: string | null;
      starts_at: Date | string | null;
      expires_at: Date | string | null;
      paid_at: Date | string | null;
    }[];
    return {
      state: { status: "available", warning: null },
      orders: rows.map((row) => ({
        providerOrderId: String(row.provider_order_id),
        productCode: row.product_code,
        entitlementId: row.entitlement_id,
        state: row.state,
        startsAt: row.starts_at ? new Date(row.starts_at).toISOString() : null,
        expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : null,
        paidAt: row.paid_at ? new Date(row.paid_at).toISOString() : null,
      })),
    };
  } catch {
    return { state: unavailable("NEON_QUERY_FAILED"), orders: null };
  }
}

async function vercelStatus(windows: ReportWindows) {
  const cfg = reportConfig();
  if (!cfg.vercelToken || !cfg.vercelProjectId) return { state: unavailable("VERCEL_NOT_CONFIGURED"), productionState: null, errorDeployments: null, readyDeployments: null };
  try {
    const url = new URL("https://api.vercel.com/v7/deployments");
    url.searchParams.set("projectId", cfg.vercelProjectId);
    url.searchParams.set("target", "production");
    url.searchParams.set("limit", "20");
    if (cfg.vercelTeamId) url.searchParams.set("teamId", cfg.vercelTeamId);
    const res = await fetch(url, { headers: { Authorization: `Bearer ${cfg.vercelToken}` } });
    if (!res.ok) return { state: unavailable("VERCEL_API_FAILED"), productionState: null, errorDeployments: null, readyDeployments: null };
    const json = (await res.json()) as { deployments?: { state?: string; created?: number; target?: string }[] };
    const rows = json.deployments || [];
    const inTrailing = rows.filter((row) => {
      const created = row.created ? new Date(row.created).toISOString() : "";
      return created && inWindow(created, windows.trailing7);
    });
    return {
      state: { status: "available" as const, warning: null },
      productionState: rows[0]?.state || null,
      errorDeployments: inTrailing.filter((row) => row.state === "ERROR").length,
      readyDeployments: inTrailing.filter((row) => row.state === "READY").length,
    };
  } catch {
    return { state: unavailable("VERCEL_API_FAILED"), productionState: null, errorDeployments: null, readyDeployments: null };
  }
}

export async function loadSummaryParts(windows: ReportWindows) {
  const cfg = reportConfig();
  const [posthogSettled, ga4Sources, ga4Landing, ga4Organic, gscYesterday, gscTrailing, gscPrevious, gscQueries, gscPrevQueries, gscPages, paddle, neon, vercel] =
    await Promise.all([
      Promise.all([posthogTotals(windows.yesterday), posthogTotals(windows.trailing7), posthogTotals(windows.previous7)]).catch(() => null),
      ga4Json(cfg.ga4PropertyId, ga4Requests(windows.trailing7).sources).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      ga4Json(cfg.ga4PropertyId, ga4Requests(windows.trailing7).landing).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      ga4Json(cfg.ga4PropertyId, ga4Requests(windows.trailing7).organic).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      gscJson(cfg.gscSiteUrl, gscRequest(windows.yesterday)).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      gscJson(cfg.gscSiteUrl, gscRequest(windows.trailing7)).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      gscJson(cfg.gscSiteUrl, gscRequest(windows.previous7)).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      gscJson(cfg.gscSiteUrl, gscRequest(windows.trailing7, ["query"])).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      gscJson(cfg.gscSiteUrl, gscRequest(windows.previous7, ["query"])).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      gscJson(cfg.gscSiteUrl, gscRequest(windows.trailing7, ["page"])).catch(() => ({ ok: false as const, error: "GOOGLE_API_FAILED" })),
      paddleWindow(windows),
      neonOrders(windows),
      vercelStatus(windows),
    ]);

  const posthogOk = Boolean(posthogSettled && posthogSettled[1]?.ok);
  const posthog: {
    status: "available" | "partial" | "unavailable";
    warning: string | null;
    totals: Record<string, { events: number; users: number; sessions: number }> | null;
    breakdown: Record<string, unknown>[] | null;
  } = posthogOk
    ? {
        status: posthogSettled?.every((item) => item.ok) ? "available" : "partial",
        warning: posthogSettled?.every((item) => item.ok) ? null : "WATCH",
        totals: posthogSettled?.[1]?.ok ? posthogSettled[1].totals : null,
        breakdown: null,
      }
    : { status: "unavailable", warning: "POSTHOG_UNAVAILABLE", totals: null, breakdown: null };
  if (posthog.status !== "unavailable") {
    const breakdown = await posthogBreakdown(windows.trailing7).catch(() => null);
    posthog.breakdown = breakdown;
    if (!breakdown) {
      posthog.status = "partial";
      posthog.warning = "WATCH";
    }
  }

  const ga4Ok = ga4Sources.ok && ga4Landing.ok && ga4Organic.ok;
  const ga4 = ga4Ok
    ? {
        status: "available" as const,
        warning: null,
        sources: parseGa4SourceReport(ga4Sources.json),
        landing: parseGa4LandingReport(ga4Landing.json),
        siteSessions: parseGa4SourceReport(ga4Sources.json).reduce((sum, row) => sum + row.sessions, 0),
        organic: parseGa4Engagement(ga4Organic.json),
      }
    : { ...unavailable(ga4Sources.ok === false ? ga4Sources.error : "GA4_UNAVAILABLE"), sources: null, landing: null, siteSessions: null, organic: null };

  const gscOk = gscTrailing.ok && gscPrevious.ok;
  const yesterdayEmpty = gscYesterday.ok && parseGscTotals(gscYesterday.json).impressions === 0 && parseGscTotals(gscYesterday.json).clicks === 0;
  const trailingHasData = gscTrailing.ok && parseGscTotals(gscTrailing.json).impressions > 0;
  const delayed = Boolean(gscOk && yesterdayEmpty && trailingHasData);
  const queryRows = gscQueries.ok ? parseGscRows(gscQueries.json) : null;
  const prevQueryRows = gscPrevQueries.ok ? parseGscRows(gscPrevQueries.json) : null;
  const gsc = gscOk
    ? {
        status: (delayed ? "delayed" : "available") as "delayed" | "available",
        warning: delayed ? "WATCH" : null,
        yesterday: delayed || !gscYesterday.ok ? null : parseGscTotals(gscYesterday.json),
        trailing: parseGscTotals(gscTrailing.json),
        previous: parseGscTotals(gscPrevious.json),
        trailingQueries: queryRows?.rows ?? null,
        previousQueries: prevQueryRows?.rows ?? null,
        trailingPages: gscPages.ok ? parseGscRows(gscPages.json).rows : null,
        partialRows: Boolean(queryRows?.truncated || prevQueryRows?.truncated),
      }
    : {
        ...unavailable("SEARCH_CONSOLE_UNAVAILABLE"),
        yesterday: null,
        trailing: null,
        previous: null,
        trailingQueries: null,
        previousQueries: null,
        trailingPages: null,
        partialRows: false,
      };

  return {
    posthog,
    ga4,
    gsc,
    paddle: {
      ...paddle.state,
      transactions: paddle.transactions,
      refundCount: paddle.refundCount,
      refundMinor: paddle.refundMinor,
      webhook: paddle.webhook,
    },
    neon: { status: neon.state.status, warning: neon.state.warning, orders: neon.orders },
    vercel: {
      status: vercel.state.status,
      warning: vercel.state.warning,
      productionState: vercel.productionState,
      errorDeployments: vercel.errorDeployments,
      readyDeployments: vercel.readyDeployments,
    },
    history: {
      posthog: {
        yesterday: posthogSettled?.[0]?.ok ? posthogSettled[0].totals : null,
        trailing7: posthogSettled?.[1]?.ok ? posthogSettled[1].totals : null,
        previous7: posthogSettled?.[2]?.ok ? posthogSettled[2].totals : null,
      },
    },
  };
}
