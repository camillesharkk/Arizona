/** How a PostHog window may be used in business metrics. Unknown stays null. */

export const REPORT_SCHEMA_VERSION = 2;

export type CaptureState = "query_failed" | "unverified" | "before_coverage" | "zero_match" | "measured";

export type EventCount = { events: number | null; users: number | null; sessions: number | null };

export function posthogRegionName(host: string) {
  const value = host.toLowerCase();
  if (value.includes("eu.")) return "eu" as const;
  if (value.includes("us.")) return "us" as const;
  return "other" as const;
}

/** Real visitor totals omit controlled probes and labeled admin acceptance. */
export function posthogBusinessFilter() {
  return "(isNull(properties.ops_probe) OR toString(properties.ops_probe) != '1') AND (isNull(properties.ops_acceptance) OR toString(properties.ops_acceptance) != '1') AND (isNull(properties.traffic_type) OR toString(properties.traffic_type) != 'internal')";
}

export function posthogProbeFilter() {
  return "toString(properties.ops_probe) = '1'";
}

export function posthogAcceptanceFilter() {
  return "toString(properties.ops_acceptance) = '1' AND (isNull(properties.ops_probe) OR toString(properties.ops_probe) != '1')";
}

export function historicalCaptureCopy(state: string | null) {
  if (state === "query_failed") return "历史窗口查询失败";
  if (state === "before_coverage") return "历史窗口在覆盖起点之前";
  if (state === "zero_match") return "历史窗口已覆盖，这一周期没有业务事件";
  if (state === "measured") return "历史窗口已有业务事件";
  if (state === "unverified") return "历史窗口还没有业务事件，这不是实时探测的结果";
  return "历史窗口还没有记录";
}

export function classifyPosthogWindow(input: {
  httpOk: boolean;
  rowCount: number;
  windowEndIso: string;
  coverageStartIso: string | null;
}): CaptureState {
  if (!input.httpOk) return "query_failed";
  if (input.rowCount > 0) return "measured";
  if (!input.coverageStartIso) return "unverified";
  if (input.windowEndIso <= input.coverageStartIso) return "before_coverage";
  return "zero_match";
}

export function countOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

/** Missing events stay null until the query is measured or a verified empty window. */
export function observedCount(
  state: CaptureState | null,
  totals: Record<string, Partial<EventCount>> | null | undefined,
  event: string,
  field: "events" | "sessions"
) {
  if (state === "query_failed" || state === "unverified" || state === "before_coverage") return null;
  const value = totals?.[event]?.[field];
  if (typeof value === "number") return value;
  if (state === "measured" || state === "zero_match") return 0;
  return null;
}

export function historyTotals(value: unknown): Record<string, Partial<EventCount>> | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  if ("totals" in row || "state" in row) {
    const totals = row.totals;
    if (!totals || typeof totals !== "object") return {};
    return totals as Record<string, Partial<EventCount>>;
  }
  return row as Record<string, Partial<EventCount>>;
}

/** Legacy snapshots stored an empty query as {} and then wrote calculated zeros. */
export function scrubInventedPosthogZero(value: number | null, historyWindow: unknown) {
  if (value !== 0) return value;
  if (!historyWindow || typeof historyWindow !== "object") return value;
  const row = historyWindow as Record<string, unknown>;
  const state = typeof row.state === "string" ? row.state : null;
  if (state === "query_failed" || state === "unverified" || state === "before_coverage") return null;
  const totals = historyTotals(historyWindow);
  if (!state && totals && Object.keys(totals).length === 0) return null;
  return value;
}

/** ClickHouse max(timestamp) is 1970-01-01 when the match set is empty. That is not an event time. */
export function recordedEventTime(value: unknown, count: number | null) {
  if (count == null || count <= 0) return null;
  const text = String(value ?? "").trim();
  if (!text || text.startsWith("1970-01-01")) return null;
  return text;
}

export function reportWriterEnvironment(vercelEnv: string | undefined) {
  if (vercelEnv === "production") return "production";
  if (vercelEnv === "preview") return "preview";
  return "local";
}
