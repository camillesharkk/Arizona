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
import { reportConfig, posthogQueryHost } from "./config.ts";
import {
  classifyPosthogWindow,
  countOrNull,
  posthogBusinessFilter,
  recordedEventTime,
  posthogRegionName,
  type CaptureState,
} from "./observation.ts";
import type { ReportWindow, ReportWindows } from "./windows.ts";

type Totals = Record<string, EventTotals>;

function unavailable(warning: string): SourceState {
  return { status: "unavailable", warning };
}

function hogqlTime(iso: string) {
  return iso.slice(0, 19).replace("T", " ");
}

type PosthogQuery = {
  ok: boolean;
  httpStatus: number | null;
  errorType: string | null;
  rowCount: number;
  lastEventAt: string | null;
  totals: Totals;
};

function posthogSql(window: ReportWindow) {
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const start = hogqlTime(window.startIso);
  const end = hogqlTime(window.endIso);
  return `
    SELECT event, count() AS events, count(DISTINCT person_id) AS users, count(DISTINCT properties.$session_id) AS sessions, max(timestamp) AS last_at
    FROM events
    WHERE timestamp >= toDateTime('${start}')
      AND timestamp < toDateTime('${end}')
      AND event IN (${events})
      AND ${posthogBusinessFilter()}
    GROUP BY event
    LIMIT 100
  `;
}

function readPosthog(json: unknown): { totals: Totals; lastEventAt: string | null } {
  const body = json as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || ["event", "events", "users", "sessions", "last_at"];
  const totals: Totals = {};
  let lastEventAt: string | null = null;
  for (const row of body.results || []) {
    const record = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
    const event = String(record.event || "");
    if (!event) continue;
    const events = countOrNull(record.events);
    const users = countOrNull(record.users);
    const sessions = countOrNull(record.sessions);
    if (events == null || users == null || sessions == null) continue;
    totals[event] = { events, users, sessions };
    const last = record.last_at == null ? null : String(record.last_at);
    if (last && (!lastEventAt || last > lastEventAt)) lastEventAt = last;
  }
  return { totals, lastEventAt };
}

async function posthogQuery(query: string, name: string): Promise<{ ok: true; httpStatus: number; json: unknown } | PosthogQuery> {
  const cfg = reportConfig();
  if (!cfg.posthogKey || !cfg.posthogProjectId) {
    return { ok: false, httpStatus: null, errorType: "not_configured", rowCount: 0, lastEventAt: null, totals: {} };
  }
  try {
    const res = await fetch(`${cfg.posthogHost}/api/projects/${encodeURIComponent(cfg.posthogProjectId)}/query/`, {
      method: "POST",
      headers: { Authorization: `Bearer ${cfg.posthogKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query: { kind: "HogQLQuery", query }, name }),
    });
    if (!res.ok) {
      return { ok: false, httpStatus: res.status, errorType: `http_${res.status}`, rowCount: 0, lastEventAt: null, totals: {} };
    }
    return { ok: true, httpStatus: res.status, json: await res.json() };
  } catch {
    return { ok: false, httpStatus: null, errorType: "network", rowCount: 0, lastEventAt: null, totals: {} };
  }
}

async function posthogTotals(window: ReportWindow): Promise<PosthogQuery> {
  const queried = await posthogQuery(posthogSql(window), "operations funnel totals");
  if (!queried.ok || !("json" in queried)) return queried;
  const read = readPosthog(queried.json);
  return {
    ok: true,
    httpStatus: queried.httpStatus,
    errorType: null,
    rowCount: Object.keys(read.totals).length,
    lastEventAt: read.lastEventAt,
    totals: read.totals,
  };
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
      AND ${posthogBusinessFilter()}
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

async function posthogCoverage(dataAsOf: string) {
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const end = hogqlTime(dataAsOf);
  const queried = await posthogQuery(
    `
      SELECT count() AS events, min(timestamp) AS first_at, max(timestamp) AS last_at
      FROM events
      WHERE timestamp < toDateTime('${end}')
        AND event IN (${events})
        AND ${posthogBusinessFilter()}
    `,
    "operations coverage"
  );
  if (!queried.ok || !("json" in queried)) return { firstEventAt: null as string | null, eventCount: null as number | null, httpStatus: queried.httpStatus, errorType: queried.errorType };
  const body = queried.json as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || ["events", "first_at", "last_at"];
  const row = body.results?.[0];
  if (!row) return { firstEventAt: null, eventCount: 0, httpStatus: queried.httpStatus, errorType: null };
  const record = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
  const eventCount = countOrNull(record.events);
  return {
    firstEventAt: eventCount && eventCount > 0 && record.first_at ? String(record.first_at) : null,
    eventCount,
    httpStatus: queried.httpStatus,
    errorType: null,
  };
}

async function posthogProbe(generatedAt: string) {
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const end = hogqlTime(generatedAt);
  const queried = await posthogQuery(
    `
      SELECT count() AS events, max(timestamp) AS last_at
      FROM events
      WHERE timestamp < toDateTime('${end}')
        AND event IN (${events})
        AND toString(properties.ops_probe) = '1'
    `,
    "operations probe"
  );
  if (!queried.ok || !("json" in queried)) return { rowCount: null as number | null, lastEventAt: null as string | null, httpStatus: queried.httpStatus, errorType: queried.errorType };
  const body = queried.json as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || ["events", "last_at"];
  const row = body.results?.[0];
  const record = row ? Object.fromEntries(columns.map((column, index) => [column, row[index]])) : {};
  const rowCount = countOrNull(record.events);
  return {
    rowCount,
    lastEventAt: recordedEventTime(record.last_at, rowCount),
    httpStatus: queried.httpStatus,
    errorType: null,
  };
}

export async function queryLiveProbe(sinceIso: string) {
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const start = hogqlTime(sinceIso);
  const end = hogqlTime(new Date().toISOString());
  const where = `
    timestamp >= toDateTime('${start}')
    AND timestamp < toDateTime('${end}')
    AND event IN (${events})
    AND toString(properties.ops_probe) = '1'
  `;
  const queried = await posthogQuery(
    `
      SELECT event, count() AS events, max(timestamp) AS last_at
      FROM events
      WHERE ${where}
      GROUP BY event
      LIMIT 20
    `,
    "operations live probe"
  );
  const overlap = await posthogQuery(
    `
      SELECT count() AS events
      FROM events
      WHERE ${where}
        AND ${posthogBusinessFilter()}
    `,
    "operations live probe overlap"
  );
  if (!queried.ok || !("json" in queried)) {
    return { ok: false as const, httpStatus: queried.httpStatus, errorType: queried.errorType, events: [], total: null, lastEventAt: null, businessOverlap: null };
  }
  const body = queried.json as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || ["event", "events", "last_at"];
  const rows = (body.results || []).flatMap((row) => {
    const record = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
    const event = String(record.event || "");
    const count = countOrNull(record.events);
    if (!event || count == null) return [];
    return [{ event, count, lastEventAt: recordedEventTime(record.last_at, count) }];
  });
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const lastEventAt = rows.reduce<string | null>((latest, row) => {
    if (!row.lastEventAt) return latest;
    return !latest || row.lastEventAt > latest ? row.lastEventAt : latest;
  }, null);
  let businessOverlap: number | null = null;
  if (overlap.ok && "json" in overlap) {
    const overlapBody = overlap.json as { results?: unknown[][]; columns?: string[] };
    const overlapColumns = overlapBody.columns || ["events"];
    const overlapRow = overlapBody.results?.[0];
    const record = overlapRow ? Object.fromEntries(overlapColumns.map((column, index) => [column, overlapRow[index]])) : {};
    businessOverlap = countOrNull(record.events);
  }
  return { ok: true as const, httpStatus: queried.httpStatus, errorType: null, events: rows, total, lastEventAt: recordedEventTime(lastEventAt, total), businessOverlap };
}

export async function queryLiveBusiness(sinceIso: string) {
  const events = FUNNEL_EVENTS.map((event) => `'${event}'`).join(", ");
  const start = hogqlTime(sinceIso);
  const end = hogqlTime(new Date().toISOString());
  const queried = await posthogQuery(
    `
      SELECT event,
        countIf(toString(properties.ops_acceptance) = '1') AS acceptance,
        count() AS events,
        max(timestamp) AS last_at,
        maxIf(timestamp, toString(properties.ops_acceptance) = '1') AS acceptance_last
      FROM events
      WHERE timestamp >= toDateTime('${start}')
        AND timestamp < toDateTime('${end}')
        AND event IN (${events})
        AND ${posthogBusinessFilter()}
      GROUP BY event
      LIMIT 20
    `,
    "operations live business"
  );
  if (!queried.ok || !("json" in queried)) {
    return { ok: false as const, httpStatus: queried.httpStatus, errorType: queried.errorType, events: [], total: null, acceptanceTotal: null, lastEventAt: null, acceptanceLast: null };
  }
  const body = queried.json as { results?: unknown[][]; columns?: string[] };
  const columns = body.columns || ["event", "acceptance", "events", "last_at", "acceptance_last"];
  const rows = (body.results || []).flatMap((row) => {
    const record = Object.fromEntries(columns.map((column, index) => [column, row[index]]));
    const event = String(record.event || "");
    const count = countOrNull(record.events);
    const acceptance = countOrNull(record.acceptance);
    if (!event || count == null) return [];
    return [{
      event,
      count,
      acceptance: acceptance ?? 0,
      lastEventAt: recordedEventTime(record.last_at, count),
      acceptanceLast: recordedEventTime(record.acceptance_last, acceptance),
    }];
  });
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const acceptanceTotal = rows.reduce((sum, row) => sum + row.acceptance, 0);
  const latest = (field: "lastEventAt" | "acceptanceLast") => rows.reduce<string | null>((current, row) => {
    const value = row[field];
    if (!value) return current;
    return !current || value > current ? value : current;
  }, null);
  return {
    ok: true as const,
    httpStatus: queried.httpStatus,
    errorType: null,
    events: rows,
    total,
    acceptanceTotal,
    lastEventAt: recordedEventTime(latest("lastEventAt"), total),
    acceptanceLast: recordedEventTime(latest("acceptanceLast"), acceptanceTotal),
  };
}

function posthogDiagnosticWarning(query: PosthogQuery | undefined, state: CaptureState) {
  if (!query) return "POSTHOG_QUERY_MISSING";
  if (!query.ok) return query.errorType || "POSTHOG_QUERY_FAILED";
  if (state === "unverified") return `POSTHOG_HTTP_${query.httpStatus ?? "unknown"}_EMPTY_UNVERIFIED`;
  if (state === "before_coverage") return `POSTHOG_HTTP_${query.httpStatus ?? "unknown"}_BEFORE_COVERAGE`;
  if (state === "zero_match") return null;
  return null;
}

function windowDiagnostic(query: PosthogQuery | undefined, window: ReportWindow, coverageStart: string | null) {
  const state = classifyPosthogWindow({
    httpOk: Boolean(query?.ok),
    rowCount: query?.rowCount ?? 0,
    windowEndIso: window.endIso,
    coverageStartIso: coverageStart,
  });
  return {
    state,
    start: window.startIso,
    end: window.endIso,
    httpStatus: query?.httpStatus ?? null,
    errorType: query?.errorType ?? null,
    rowCount: query?.ok ? query.rowCount : null,
    lastEventAt: query?.ok ? query.lastEventAt : null,
    totals: state === "query_failed" || state === "unverified" || state === "before_coverage" ? null : query?.totals ?? null,
  };
}

function posthogDiagnostics(input: {
  windows: ReportWindows;
  settled: PosthogQuery[] | null;
  coverage: { firstEventAt: string | null; eventCount: number | null; httpStatus: number | null; errorType: string | null };
  probe: { rowCount: number | null; lastEventAt: string | null; httpStatus: number | null; errorType: string | null };
  trailingState: CaptureState;
}) {
  const cfg = reportConfig();
  const ingestHost = String(process.env.NEXT_PUBLIC_POSTHOG_HOST || "");
  const queryHost = posthogQueryHost();
  const ingestRegion = posthogRegionName(ingestHost || queryHost);
  const queryRegion = posthogRegionName(queryHost);
  return {
    projectId: cfg.posthogProjectId || null,
    queryRegion,
    ingestRegion,
    regionMatch: ingestRegion === queryRegion,
    apiReachable: Boolean(input.settled?.[1]?.ok),
    captureState: input.trailingState,
    coverageStart: input.coverage.firstEventAt,
    coverageEventCount: input.coverage.eventCount,
    coverageHttpStatus: input.coverage.httpStatus,
    coverageErrorType: input.coverage.errorType,
    probe: input.probe,
    windows: {
      yesterday: windowDiagnostic(input.settled?.[0], input.windows.yesterday, input.coverage.firstEventAt),
      trailing7: windowDiagnostic(input.settled?.[1], input.windows.trailing7, input.coverage.firstEventAt),
      previous7: windowDiagnostic(input.settled?.[2], input.windows.previous7, input.coverage.firstEventAt),
    },
  };
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
  if (!config.ok) return { state: unavailable("PADDLE_NOT_CONFIGURED"), transactions: null as PaddleTxn[] | null, refundCount: null, refundMinor: null, webhook: null, environment: null as string | null };
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
    const adjustments = paddle.adjustments.list({ perPage: 100 });
    for await (const adjustment of adjustments) {
      const item = adjustment as Adjustment;
      scanned += 1;
      if (inWindow(item.createdAt, windows.trailing7) && item.action === "refund" && item.status === "approved") {
        refundCount += 1;
        if (item.totals?.total && /^-?\d+$/.test(item.totals.total)) refundMinor += Number(item.totals.total);
      }
      if (scanned >= 500) break;
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
    return {
      state: { status: "available" as const, warning: null },
      transactions,
      refundCount,
      refundMinor,
      webhook,
      environment: config.config.environment,
    };
  } catch {
    return { state: unavailable("PADDLE_API_FAILED"), transactions: null, refundCount: null, refundMinor: null, webhook: null, environment: config.config.environment };
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

  const trailingQuery = posthogSettled?.[1];
  const coverage = await posthogCoverage(windows.yesterday.dataAsOf);
  const probe = await posthogProbe(windows.generatedAt);
  const trailingState = classifyPosthogWindow({
    httpOk: Boolean(trailingQuery?.ok),
    rowCount: trailingQuery?.rowCount ?? 0,
    windowEndIso: windows.trailing7.endIso,
    coverageStartIso: coverage.firstEventAt,
  });
  const posthogWarning = posthogDiagnosticWarning(trailingQuery, trailingState);
  const posthog: {
    status: "available" | "partial" | "unavailable";
    warning: string | null;
    totals: Record<string, { events: number; users: number; sessions: number }> | null;
    breakdown: Record<string, unknown>[] | null;
    observation: { state: CaptureState; httpStatus: number | null; errorType: string | null; rowCount: number };
  } = {
    status: trailingState === "query_failed" ? "unavailable" : trailingState === "measured" || trailingState === "zero_match" ? "available" : "partial",
    warning: posthogWarning,
    totals: trailingState === "query_failed" || trailingState === "unverified" || trailingState === "before_coverage" ? null : trailingQuery?.totals ?? null,
    breakdown: null,
    observation: {
      state: trailingState,
      httpStatus: trailingQuery?.httpStatus ?? null,
      errorType: trailingQuery?.errorType ?? null,
      rowCount: trailingQuery?.rowCount ?? 0,
    },
  };
  if (posthog.status !== "unavailable") {
    const breakdown = await posthogBreakdown(windows.trailing7).catch(() => null);
    posthog.breakdown = breakdown;
    if (!breakdown && posthog.status === "available") {
      posthog.status = "partial";
      posthog.warning = posthog.warning || "POSTHOG_BREAKDOWN_FAILED";
    }
  }
  const diagnostics = posthogDiagnostics({
    windows,
    settled: posthogSettled,
    coverage,
    probe,
    trailingState,
  });

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
      environment: paddle.environment,
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
        yesterday: diagnostics.windows.yesterday,
        trailing7: diagnostics.windows.trailing7,
        previous7: diagnostics.windows.previous7,
      },
    },
    diagnostics,
  };
}
