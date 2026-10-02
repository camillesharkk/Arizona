import { operationsSources } from "./sources.ts";
import {
  calculatedDifference,
  calculatedRate,
  metricWindow,
  type CalculatedMetric,
  type SourceStatus,
} from "./metrics.ts";
import type { ReportWindows } from "./windows.ts";

export const ENTITLEMENT_CRITICAL =
  "CRITICAL：支付已完成但Pro entitlement未确认。不要创建第二笔订单，不要让用户重复付款。";

export const FUNNEL_NOTE = "前端漏斗为 Session 漏斗；付款和权益步骤为跨数据源趋势核对，不代表严格同一 Session 顺序。";

const FUNNEL_EVENTS = [
  ["Landing Sessions", "landing_view", "PostHog"],
  ["Practice View", "practice_view", "PostHog"],
  ["Exam Start", "exam_start", "PostHog"],
  ["Exam Complete", "exam_complete", "PostHog"],
  ["Register View", "register_view", "PostHog"],
  ["Sign Up", "sign_up", "PostHog"],
  ["Pricing View", "pricing_view", "PostHog"],
  ["Checkout Open", "checkout_open", "PostHog"],
] as const;

export type ReportAccess = "anonymous" | "forbidden" | "ok";
export type TodayStatus = "HEALTHY" | "WATCH" | "ACTION REQUIRED";

export function operationsAccess(email: string | null | undefined, allowlist: string | undefined): ReportAccess {
  if (!email?.trim()) return "anonymous";
  const allowed = new Set(
    String(allowlist || "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean)
  );
  return allowed.has(email.trim().toLowerCase()) ? "ok" : "forbidden";
}

export type StoredSummary = {
  reportDate: string;
  generatedAt: string;
  dataAsOf: string;
  snapshot: unknown;
};

export function selectSummaryReport(rows: StoredSummary[], date: string | null) {
  const sorted = [...rows].sort((a, b) => b.reportDate.localeCompare(a.reportDate));
  if (!date) return sorted[0] || null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  return sorted.find((row) => row.reportDate === date) || null;
}

export function operationsShortcuts(env: Record<string, string | undefined> = {}) {
  const host =
    env.POSTHOG_HOST && env.POSTHOG_HOST.startsWith("https://") && !env.POSTHOG_HOST.includes(".i.posthog.com")
      ? env.POSTHOG_HOST.replace(/\/$/, "")
      : "https://us.posthog.com";
  const project = String(env.POSTHOG_PROJECT_ID || "").trim();
  const clarity = String(env.NEXT_PUBLIC_CLARITY_PROJECT_ID || "").trim();
  const posthogBase = project ? `${host}/project/${encodeURIComponent(project)}` : host;
  const clarityBase = clarity
    ? `https://clarity.microsoft.com/projects/view/${encodeURIComponent(clarity)}`
    : "https://clarity.microsoft.com/";
  return [
    { label: "打开 PostHog 漏斗", href: project ? `${posthogBase}/insights` : posthogBase },
    { label: "打开 PostHog 路径分析", href: project ? `${posthogBase}/insights` : posthogBase },
    { label: "打开 Clarity 热力图", href: clarity ? `${clarityBase}/heatmaps` : clarityBase },
    { label: "打开 Clarity 访问录像", href: clarity ? `${clarityBase}/recordings` : clarityBase },
    { label: "打开 GA4", href: `https://analytics.google.com/analytics/web/#/p${operationsSources.ga4.propertyId}` },
    {
      label: "打开 Search Console",
      href: `https://search.google.com/search-console?resource_id=${encodeURIComponent(operationsSources.searchConsole.siteUrl)}`,
    },
    { label: "打开 Paddle", href: "https://vendors.paddle.com/" },
    { label: "打开 Vercel", href: operationsSources.vercel.dashboardUrl },
  ];
}

type EntitlementCheck = { completed: number; matched: number; missingOrder: number; mismatched: number };

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function num(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function judgeOperationsStatus(input: {
  sources: Record<string, string>;
  productionState: string | null;
  entitlement: EntitlementCheck | null;
  smallSample: boolean;
  generatedAt: string;
  dataAsOf: string;
  yesterdayClicks: number | null;
  trailingClicks: number | null;
}) {
  const action: string[] = [];
  const watch: string[] = [];
  if (input.productionState && input.productionState.toUpperCase() !== "READY") {
    action.push(`Production 状态是 ${input.productionState}，不是 Ready。`);
  }
  if (input.entitlement && input.entitlement.completed > 0 && input.entitlement.matched !== input.entitlement.completed) {
    action.push(ENTITLEMENT_CRITICAL);
  }
  for (const [source, status] of Object.entries(input.sources)) {
    if (status === "unavailable" || status === "partial" || status === "delayed") {
      watch.push(`${source} 状态为 ${status}。`);
    }
  }
  if (!input.productionState) watch.push("Vercel Production 状态未知。日志流不完整，只记为 WATCH。");
  if (input.smallSample) watch.push("小样本：只观察，不建议据此大规模修改。");
  const age = Date.parse(input.generatedAt) - Date.parse(input.dataAsOf);
  if (Number.isFinite(age) && age > 36 * 60 * 60 * 1000) watch.push("数据截止时间距生成时间超过 36 小时。");
  if (input.yesterdayClicks === 0 && (input.trailingClicks || 0) > 0) {
    watch.push("Search Console 当日无数据。这只触发 WATCH，不触发 ACTION REQUIRED。");
  }
  const status: TodayStatus = action.length ? "ACTION REQUIRED" : watch.length ? "WATCH" : "HEALTHY";
  return { status, action, watch };
}

export function operationsAdvice(verdict: { action: string[]; watch: string[] }, evidence: { completed: number | null; matched: number | null; productionState: string | null }) {
  const items: { text: string; evidence: string }[] = [];
  if (verdict.action.some((item) => item.includes("entitlement"))) {
    items.push({
      text: "人工核对这笔已完成支付和 Pro entitlement。不要创建第二笔订单，不要让用户重复付款，不要自动补单或自动发放权益。",
      evidence: `Paddle Completed ${evidence.completed ?? "未知"}，Neon 核对通过 ${evidence.matched ?? "未知"}。`,
    });
  }
  if (verdict.action.some((item) => item.startsWith("Production"))) {
    items.push({
      text: "人工查看 Vercel Production 部署。不要从日报自动部署。",
      evidence: `当前 Production 状态：${evidence.productionState || "未知"}。`,
    });
  }
  for (const reason of verdict.watch) {
    items.push({
      text: reason.includes("小样本")
        ? "只观察。不要因为单日小样本修改价格、SEO 或支付。"
        : "只观察该数据缺口。不要因为单日波动大规模修改 SEO，也不要自动退款或补单。",
      evidence: reason,
    });
  }
  if (!items.length) {
    items.push({
      text: "无需操作。",
      evidence: "没有需要处理的支付、权益或 Production 异常。",
    });
  }
  return items;
}

function asStatus(value: string | undefined): SourceStatus {
  if (value === "available" || value === "partial" || value === "delayed" || value === "unavailable") return value;
  return "unavailable";
}

function posthogCount(snapshot: Record<string, unknown>, key: "yesterday" | "trailing7" | "previous7", event: string) {
  const history = record(record(snapshot.history)?.posthog)?.[key];
  const totals = record(history);
  if (!totals) return null;
  const row = record(totals[event]);
  if (!row) return 0;
  return num(row.sessions);
}

export function presentOperationsReport(snapshot: unknown) {
  const root = record(snapshot) || {};
  const sources = (record(root.sources) || {}) as Record<string, string>;
  const windows = record(root.windows) as ReportWindows | null;
  const view = windows?.trailing7 ? metricWindow(windows.trailing7) : { start: "", end: "", timezone: "America/Phoenix" as const };
  const funnelCounts = record(root.funnelCounts);
  const paddle = record(root.paddle);
  const entitlement = record(paddle?.entitlement) as EntitlementCheck | null;
  const vercel = record(root.vercel);
  const gsc = record(root.gsc);
  const gscTotals = record(gsc?.totals);
  const calculated = Array.isArray(root.calculated) ? (root.calculated as CalculatedMetric[]) : [];
  const raw = Array.isArray(root.raw) ? root.raw : [];
  const smallSample = calculated.some((metric) => String(metric.warning || "").includes("小样本"));
  const yesterdayClicks = num(record(gscTotals?.yesterday)?.clicks);
  const trailingClicks = num(record(gscTotals?.trailing7)?.clicks);
  const verdict = judgeOperationsStatus({
    sources,
    productionState: typeof vercel?.productionState === "string" ? vercel.productionState : null,
    entitlement: entitlement && typeof entitlement.completed === "number" ? entitlement : null,
    smallSample,
    generatedAt: String(root.generatedAt || ""),
    dataAsOf: String(root.dataAsOf || ""),
    yesterdayClicks,
    trailingClicks,
  });
  const counts = (key: "yesterday" | "trailing7" | "previous7", event: string) => {
    if (event === "paddle_completed") return num(record(funnelCounts?.[key])?.paddleCompleted);
    if (event === "entitlement_granted") return num(record(funnelCounts?.[key])?.entitlementGranted);
    return posthogCount(root, key, event);
  };
  const steps = [
    ...FUNNEL_EVENTS.map(([label, event, source]) => ({ label, event, source })),
    { label: "Paddle Completed", event: "paddle_completed", source: "Paddle" },
    { label: "Entitlement Granted", event: "entitlement_granted", source: "Neon" },
  ].map((step, index, all) => {
    const trailing = counts("trailing7", step.event);
    const previous = counts("previous7", step.event);
    const yesterday = counts("yesterday", step.event);
    const prior = index > 0 ? counts("trailing7", all[index - 1].event) : null;
    const status = asStatus(step.source === "PostHog" ? sources.posthog : step.source === "Paddle" ? sources.paddle : sources.neon);
    return {
      ...step,
      yesterday,
      trailing7: trailing,
      previous7: previous,
      conversion:
        index === 0
          ? null
          : calculatedRate({
              name: `${step.label} 相对上一步`,
              formula: `${step.label} ÷ 上一步 × 100%`,
              numerator: { label: step.label, value: trailing, source: step.source },
              denominator: { label: all[index - 1].label, value: prior, source: all[index - 1].source },
              window: view,
              sourceStatus: status,
            }),
      absolute: calculatedDifference({
        name: `${step.label} 绝对变化`,
        current: { label: "近 7 日", value: trailing, source: step.source },
        baseline: { label: "前 7 日", value: previous, source: step.source },
        window: view,
        sourceStatus: status,
      }),
      changeRate: calculatedRate({
        name: `${step.label} 变化率`,
        formula: "变化率 =（当前值 - 对比值）÷ 对比值 × 100%",
        numerator: {
          label: "当前值 - 对比值",
          value: trailing == null || previous == null ? null : trailing - previous,
          source: step.source,
        },
        denominator: { label: "前 7 日", value: previous, source: step.source },
        window: view,
        sourceStatus: status,
      }),
    };
  });
  return {
    generatedAt: String(root.generatedAt || ""),
    dataAsOf: String(root.dataAsOf || ""),
    timezone: "America/Phoenix",
    windows,
    sources,
    verdict,
    advice: operationsAdvice(verdict, {
      completed: entitlement ? num(entitlement.completed) : null,
      matched: entitlement ? num(entitlement.matched) : null,
      productionState: typeof vercel?.productionState === "string" ? vercel.productionState : null,
    }),
    raw,
    calculated,
    steps,
    ga4: record(root.ga4),
    gsc,
    paddle,
    vercel,
    privacy: record(root.privacy),
    revenueSource: "Paddle",
    usesGa4Revenue: record(root.privacy)?.usesGa4Revenue === true,
  };
}
