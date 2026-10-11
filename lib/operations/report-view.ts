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

export const FUNNEL_NOTE =
  "PostHog 按事件分别计数，查询没有要求同一次会话先发生上一步、再发生下一步。相邻数字相除只是事件数量比。";

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
  if (!row || typeof row.sessions !== "number") return null;
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
        index === 0 || step.source !== "PostHog" || all[index - 1].source !== "PostHog"
          ? null
          : calculatedRate({
              name: `${step.label} 事件数量比`,
              formula: "事件数量比 = 这一事件的去重会话数 ÷ 上一事件的去重会话数 × 100%。两次计数互不要求同一会话。",
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

export type BriefItem = {
  title: string;
  kind: "事实" | "推测" | "待验证";
  evidence: string;
  meaning: string;
  check: string;
  limit: string;
};

export function operationsBrief(input: {
  productionState: string | null;
  completed: number | null;
  matched: number | null;
  posthogStatus: string | undefined;
  yesterdayClicks: number | null;
  trailingClicks: number | null;
  practiceSessions: number | null;
  practiceVariants: string[];
  smallSampleName: string | null;
  smallSampleSize: number | null;
}): BriefItem[] {
  const items: BriefItem[] = [];
  if (input.completed != null && input.completed > 0 && input.matched != null && input.matched !== input.completed) {
    items.push({
      title: "有成交还没对上 Pro",
      kind: "事实",
      evidence: `近 7 日 Paddle 成交 ${input.completed} 笔，Neon 核对通过 ${input.matched} 笔。`,
      meaning: "钱已经记下，但对应的 60 天 Pro 没有全部对上。这和浏览步骤的人数变化无关。",
      check: "按订单逐笔看收款和站内权益是否是同一笔。不要新建一笔订单，也不要让用户再付一次。",
      limit: "两边用订单号核对，不是同一次浏览的前后步骤。",
    });
  }
  if (input.productionState && input.productionState.toUpperCase() !== "READY") {
    items.push({
      title: "线上版本不是就绪状态",
      kind: "事实",
      evidence: `Vercel Production 状态是 ${input.productionState}。`,
      meaning: "当前对外版本没有处于就绪。先看部署，不要从这份日报推断收款或搜索出了问题。",
      check: "打开 Vercel 看最近一次 Production 部署停在哪一步。",
      limit: "这里只有最近部署列表里的状态，没有运行日志。",
    });
  }
  const canonical = "/arizona-notary-practice-test/";
  const distinct = [...new Set(input.practiceVariants)];
  if (input.practiceSessions != null && distinct.some((path) => path !== canonical)) {
    items.push({
      title: "练习页被记成了两种地址",
      kind: "事实",
      evidence: `入口列表中的写法是 ${distinct.join("、")}，合并后是 ${input.practiceSessions} 次入口访问次数。`,
      meaning: "带不带末尾斜杠、或带了查询参数，都是同一个练习页。旧的对照把对不上的地址写成 0。",
      check: "看入口页图表里的合并结果。不要把 0 理解成没人打开练习页。",
      limit: "这是近 7 日作为入口的次数，不是该页的全部浏览，也不是昨日。",
    });
  }
  if (input.posthogStatus === "unavailable" || input.posthogStatus === "partial") {
    items.push({
      title: "行为记录还不完整",
      kind: "待验证",
      evidence: `PostHog 状态是 ${input.posthogStatus || "未返回"}。`,
      meaning: "日报没有拿到完整的答题、注册或结账事件。不能据此说访客没有这些行为。",
      check: "在 PostHog 里看事件是从哪一天开始出现的，以及项目号是否就是现在这个站。",
      limit: "接入之前的访问不会留下这些事件。缺少记录不能当成当时无人操作。",
    });
  }
  if (input.yesterdayClicks === 0 && (input.trailingClicks || 0) > 0) {
    items.push({
      title: "昨日搜索点击还是空的",
      kind: "待验证",
      evidence: `昨日点击 ${input.yesterdayClicks}，近 7 日点击 ${input.trailingClicks}。`,
      meaning: "这符合 Search Console 晚到，不能据此判断搜索标题或排名已经变差。",
      check: "过一两天再看同一个报告日是否补上点击。在补上之前不要改标题或页面。",
      limit: "昨日为 0 且近 7 日大于 0 时，只说明这一天的搜索数还没到齐。",
    });
  }
  if (input.smallSampleName && input.smallSampleSize != null) {
    items.push({
      title: `${input.smallSampleName}的样本还小`,
      kind: "推测",
      evidence: `${input.smallSampleName}的分母是 ${input.smallSampleSize}。`,
      meaning: "人数少时，比率上下跳动不代表页面或收款突然变了。",
      check: "核对这个事件是否每次操作都会发出，并看分母具体是哪种访问。",
      limit: "样本小于 30 时，不要据此改价格、搜索标题或收款方式。",
    });
  }
  return items.slice(0, 3);
}

export function metricPlainLanguage(metric: CalculatedMetric) {
  const meanings: Record<string, string> = {
    答题开始率: "打开练习和开始答题是两次独立计数。相除得到事件数量比，查询没有同一会话的先后顺序。",
    答题完成率: "开始答题和完成答题是两次独立计数。相除得到事件数量比，查询没有同一会话的先后顺序。",
    注册页转化率: "打开注册和完成注册是两次独立计数。相除得到事件数量比，查询没有同一会话的先后顺序。",
    "Pricing 访问率": "开始答题和打开价格页是两次独立计数。相除得到事件数量比，查询没有同一会话的先后顺序。",
    "Checkout 打开率": "打开价格页和打开结账是两次独立计数。相除得到事件数量比，查询没有同一会话的先后顺序。",
    支付成功率: "用来对照结账打开次数和实际成交笔数，两边不是同一次浏览。",
    权益发放成功率: "用来对照成交笔数和已经对上的 Pro，两边不是同一次浏览。",
    "Direct session share": "全部访问里，有多少是直接打开网站。",
    "google / organic session share": "全部访问里，有多少来自 Google 自然搜索。",
    "bing / organic session share": "全部访问里，有多少来自 Bing 自然搜索。",
    "Organic engagement rate": "自然搜索带来的访问里，有多少被 GA4 记为有互动。",
    "Organic average engagement time": "自然搜索访问平均互动了多久，单位是秒。",
    "Search Console CTR": "搜索结果被看到以后，有多少次被人点进来。",
    "Search Console average position change": "近 7 日平均名次比前 7 日高还是低。名次数字越小越好。",
  };
  const meaning = metric.name.startsWith("Landing ")
    ? "这个地址作为入口的次数，占全部访问的比例。"
    : meanings[metric.name] || `比较「${metric.numerator.label}」和「${metric.denominator.label}」。`;
  const den = metric.denominator.value;
  const state =
    metric.sourceStatus === "delayed"
      ? "数据延迟"
      : metric.sourceStatus === "unavailable" || metric.sourceStatus === "partial"
        ? "缺少数据"
        : den === 0
          ? "分母为 0，无法计算"
          : metric.value == null
            ? "未返回"
            : metric.formattedValue;
  const independentEventRatio = ["答题开始率", "答题完成率", "注册页转化率", "Pricing 访问率", "Checkout 打开率"].includes(
    metric.name
  );
  const kindNote = independentEventRatio
    ? "这是事件数量比：两个事件各自的会话数相除。它不是严格顺序下的比率。"
    : metric.name.includes("position")
    ? "正数表示排名变好，因为名次数字变小。这不是百分比，也不是百分点。"
    : metric.name.includes("变化率")
      ? "这是百分比变化：（现在减之前）再除以前。它不是两个比率相减得到的百分点。"
      : metric.name.includes("绝对变化")
        ? "这是两个数量相减，单位和原来的数量一样。"
        : metric.formattedValue.endsWith("%")
          ? "这是一个比率，单位是百分比。"
          : "";
  return { meaning, state, kindNote };
}
