import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { paths } from "@/lib/paths";
import { readOperationsHistory } from "@/lib/operations/read-report";
import { CORE_PAGES, coalesceLandingPages, matchLandingPage } from "@/lib/operations/aggregate";
import {
  FUNNEL_NOTE,
  metricPlainLanguage,
  operationsAccess,
  operationsBrief,
  operationsShortcuts,
  presentOperationsReport,
} from "@/lib/operations/report-view";
import type { CalculatedMetric } from "@/lib/operations/metrics";
import { historicalCaptureCopy } from "@/lib/operations/observation";
import { BarChart, TrendChart } from "./charts";
import styles from "./report.module.css";

export const metadata: Metadata = {
  title: "运营日报",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

const SOURCE_LABEL: Record<string, string> = {
  available: "已读到",
  partial: "不完整",
  delayed: "有延迟",
  unavailable: "没读到",
};

const STAGE_LABEL: Record<string, string> = {
  landing_view: "打开首页",
  practice_view: "打开练习",
  exam_start: "开始答题",
  exam_complete: "完成答题",
  register_view: "打开注册",
  sign_up: "完成注册",
  pricing_view: "打开价格页",
  checkout_open: "打开结账",
};

function phoenixClock(iso: string) {
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "未返回";
  return `${new Intl.DateTimeFormat("zh-CN", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(time))}（凤凰城）`;
}

function phoenixDay(ymd: string) {
  const time = Date.parse(`${ymd}T12:00:00-07:00`);
  if (!Number.isFinite(time)) return ymd || "未返回";
  return `${new Intl.DateTimeFormat("zh-CN", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(time))}（凤凰城）`;
}

function rawNumber(raw: unknown[], name: string) {
  const row = raw.find((item) => item && typeof item === "object" && (item as { name?: string }).name === name) as
    | { value?: unknown }
    | undefined;
  return typeof row?.value === "number" ? row.value : null;
}

function positiveCoreSessions(ga4: Record<string, unknown> | null, page: string) {
  const rows = ga4 && Array.isArray(ga4.corePages) ? ga4.corePages : [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const item = row as { page?: unknown; sessions?: unknown };
    if (item.page === page && typeof item.sessions === "number" && item.sessions > 0) return item.sessions;
  }
  return null;
}

function countText(value: number | null) {
  return value == null ? "未返回" : String(value);
}

function probeCount(diagnostics: Record<string, unknown> | null) {
  const probe = diagnostics?.probe;
  if (!probe || typeof probe !== "object") return "未返回";
  const count = (probe as { rowCount?: unknown }).rowCount;
  return typeof count === "number" ? String(count) : "未返回";
}

function probeLast(diagnostics: Record<string, unknown> | null) {
  const probe = diagnostics?.probe;
  if (!probe || typeof probe !== "object") return "";
  const count = (probe as { rowCount?: unknown }).rowCount;
  const last = (probe as { lastEventAt?: unknown }).lastEventAt;
  if (count === 0 || typeof last !== "string" || last.startsWith("1970-01-01")) return "";
  return last;
}

const EVENT_RATIO_TITLE: Record<string, string> = {
  答题开始率: "开始答题的事件数量比",
  答题完成率: "完成答题的事件数量比",
  注册页转化率: "完成注册的事件数量比",
  "Pricing 访问率": "打开价格页的事件数量比",
  "Checkout 打开率": "打开结账的事件数量比",
};

function MetricBlock({ metric }: { metric: CalculatedMetric }) {
  const text = metricPlainLanguage(metric);
  return (
    <article className={styles.metric}>
      <h3>{EVENT_RATIO_TITLE[metric.name] || metric.name}</h3>
      <p>
        <strong>{text.state}</strong>
      </p>
      <p>{text.meaning}</p>
      {text.kindNote ? <p>{text.kindNote}</p> : null}
      <p className={styles.source}>
        {metric.numerator.source} · {metric.window.start} 至 {metric.window.end} · 凤凰城
        {metric.warning ? ` · ${metric.warning}` : ""}
      </p>
      <details>
        <summary>公式和限制</summary>
        <p>公式：{metric.formula}</p>
        <p>
          分子：{metric.numerator.label} = {metric.numerator.value ?? "未返回"}（{metric.numerator.source}）
        </p>
        <p>
          分母：{metric.denominator.label} = {metric.denominator.value ?? "未返回"}（{metric.denominator.source}）
        </p>
        <p>代入：{metric.calculation}</p>
        <p>
          周期：{metric.window.start} 至 {metric.window.end}，时区凤凰城。样本量按分母计为 {metric.sampleSize ?? "未返回"}。
        </p>
        {metric.denominator.value === 0 ? <p className={styles.warning}>分母为 0，所以没有比率。</p> : null}
        {metric.denominator.value == null ? <p>分母没有返回。这是缺少数据，不是分母为 0。</p> : null}
        {metric.sourceStatus === "delayed" ? <p>来源标记为延迟，先不要把空值当成经营变差。</p> : null}
      </details>
    </article>
  );
}

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    window?: string;
    liveProbe?: string;
    probeError?: string;
    probeTotal?: string;
    probeLast?: string;
    probeEvents?: string;
    acceptanceError?: string;
    acceptanceTotal?: string;
    acceptanceEvents?: string;
    acceptanceLast?: string;
    visitorError?: string;
    visitorTotal?: string;
    visitorEvents?: string;
    visitorLast?: string;
    queryStart?: string;
    queryEnd?: string;
    reportDate?: string;
    inHistory?: string;
  }>;
}) {
  const session = await getSession();
  const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
  if (access === "anonymous") redirect(paths.login);
  if (access !== "ok") {
    return (
      <main className={styles.page}>
        <h1>403</h1>
        <p>无权查看运营日报。</p>
      </main>
    );
  }

  const params = await searchParams;
  const requested = typeof params.date === "string" ? params.date : null;
  const history = await readOperationsHistory(requested);
  const shortcuts = operationsShortcuts(process.env);
  if (!history.ok || !history.report) {
    return (
      <main className={styles.page}>
        <h1>运营日报</h1>
        <p>{history.ok ? "这一天还没有正式环境的汇总日报。" : "日报暂时读不出来。确认数据库迁移已经应用到当前库。"}</p>
        {history.ok && history.previewIsolated > 0 ? (
          <p>已隔离 {history.previewIsolated} 条 Preview 汇总。这些记录还在库里，不删除，也不当作正式报告。</p>
        ) : null}
        <details>
          <summary>外部后台</summary>
          <nav className={styles.links}>
            {shortcuts.map((link) => (
              <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
                {link.label}
              </a>
            ))}
          </nav>
        </details>
      </main>
    );
  }

  const report = history.report;
  const view = presentOperationsReport(report.snapshot);
  const active = params.window === "yesterday" || params.window === "previous7" ? params.window : "trailing7";
  const periodLabel = active === "yesterday" ? "昨日" : active === "previous7" ? "前 7 日" : "近 7 日";
  const link = (date: string | null, window = active) => {
    const query = new URLSearchParams();
    if (date) query.set("date", date);
    query.set("window", window);
    return `/admin/operations/?${query.toString()}`;
  };
  const landingRows = Array.isArray(view.ga4?.landing) ? (view.ga4.landing as { page: string; sessions: number }[]) : null;
  const landing = landingRows ? coalesceLandingPages(landingRows) : null;
  const practice = matchLandingPage(landingRows, "/arizona-notary-practice-test/");
  const sessions = rawNumber(view.raw, "Sessions");
  const direct = rawNumber(view.raw, "Direct sessions");
  const google = rawNumber(view.raw, "google / organic sessions");
  const bing = rawNumber(view.raw, "bing / organic sessions");
  const other =
    sessions != null && direct != null && google != null && bing != null ? sessions - direct - google - bing : null;
  const examStart = view.calculated.find((metric) => metric.name === "答题开始率");
  const paddleRecord = view.paddle && typeof view.paddle === "object" ? view.paddle : null;
  const entitlement = paddleRecord && "entitlement" in paddleRecord && paddleRecord.entitlement && typeof paddleRecord.entitlement === "object"
    ? (paddleRecord.entitlement as { matched?: unknown })
    : null;
  const gross = typeof paddleRecord?.grossMinor === "number" ? paddleRecord.grossMinor : null;
  const completed = typeof paddleRecord?.completed === "number" ? paddleRecord.completed : null;
  const matched = typeof entitlement?.matched === "number" ? entitlement.matched : null;
  const paddleEnvironment = typeof paddleRecord?.environment === "string" ? paddleRecord.environment : null;
  const diagnostics = view.diagnostics;
  const small = view.calculated.find((metric) => String(metric.warning || "").includes("小样本"));
  const gscTotals = (view.gsc?.totals || {}) as Record<string, { clicks?: number | null; impressions?: number | null; position?: number | null } | null>;
  const seo = gscTotals[active];
  const brief = operationsBrief({
    productionState: typeof view.vercel?.productionState === "string" ? view.vercel.productionState : null,
    completed,
    matched,
    posthogStatus: view.sources.posthog,
    yesterdayClicks: typeof gscTotals.yesterday?.clicks === "number" ? gscTotals.yesterday.clicks : null,
    trailingClicks: typeof gscTotals.trailing7?.clicks === "number" ? gscTotals.trailing7.clicks : null,
    practiceSessions: practice.sessions,
    practiceVariants: practice.variants,
    smallSampleName: small?.name || null,
    smallSampleSize: small?.sampleSize ?? null,
  });
  const stages = view.steps.filter((step) => step.source === "PostHog");
  const sessionPoints = history.series.filter((point) => point.sessions != null) as { reportDate: string; sessions: number }[];
  const explained = view.calculated.filter((metric) => !metric.name.startsWith("Landing "));

  return (
    <main className={styles.page}>
      <header>
        <h1>运营日报</h1>
        <p className={styles.times}>报告日 {phoenixDay(report.reportDate)}。报告时区是美洲/凤凰城，全年 UTC-7。</p>
        <p className={styles.times}>生成时间 {phoenixClock(report.generatedAt || view.generatedAt)}。数据截止 {phoenixClock(report.dataAsOf || view.dataAsOf)}，不含该时刻之后。</p>
        <p className={styles.chips}>
          {Object.entries(view.sources).map(([source, status]) => (
            <span key={source}>
              {source} {SOURCE_LABEL[status] || status}
            </span>
          ))}
        </p>
      </header>

      <section className={styles.cards} aria-label="关键指标">
        <article className={styles.card}>
          <span>近 7 日成交额</span>
          <strong>{gross == null ? "未返回" : `${(gross / 100).toFixed(2)} USD`}</strong>
          <small>只算 Paddle 成交。不是昨日，也不用来自 GA4。</small>
        </article>
        <article className={styles.card}>
          <span>近 7 日全站访问次数</span>
          <strong>{countText(sessions)}</strong>
          <small>全站 GA4 会话。不是某个页面的入口访问次数。</small>
        </article>
        <article className={styles.card}>
          <span>近 7 日答题开始的事件数量比</span>
          <strong>{examStart ? metricPlainLanguage(examStart).state : "未返回"}</strong>
          <small>打开练习和开始答题各自计数后相除。没有同一会话的先后顺序。</small>
        </article>
        <article className={styles.card}>
          <span>近 7 日完成订单</span>
          <strong>{completed === 0 ? "0" : countText(completed)}</strong>
          <small>
            {completed === 0
              ? "查询成功，这一周期没有成交。无订单待核对。"
              : `Paddle 成交笔数。权益核对是 ${countText(matched)}，单独看，不接在浏览步骤后面。`}
          </small>
        </article>
      </section>

      <section className={styles.section}>
        <h2>经营结论</h2>
        {brief.length ? (
          <div className={styles.briefs}>
            {brief.map((item) => (
              <article key={item.title} className={styles.brief}>
                <p className={styles.kind}>{item.kind}</p>
                <h3>{item.title}</h3>
                <p>证据：{item.evidence}</p>
                <p>含义：{item.meaning}</p>
                <p>建议检查：{item.check}</p>
                <p className={styles.fine}>限制：{item.limit}</p>
              </article>
            ))}
          </div>
        ) : (
          <p>这次没有足够证据写出优先建议。</p>
        )}
      </section>

      <nav className={styles.nav} aria-label="报告日期">
        {history.dates[0] ? <a href={link(history.dates[0])}>最新一份</a> : null}
        {history.dates[1] ? <a href={link(history.dates[1])}>上一份</a> : null}
        <a href={link(report.reportDate, "yesterday")} className={active === "yesterday" ? styles.current : undefined}>
          搜索看昨日
        </a>
        <a href={link(report.reportDate, "trailing7")} className={active === "trailing7" ? styles.current : undefined}>
          搜索看近 7 日
        </a>
        <a href={link(report.reportDate, "previous7")} className={active === "previous7" ? styles.current : undefined}>
          搜索看前 7 日
        </a>
      </nav>
      <p className={styles.period}>这三个按钮只切换搜索数字。访问、入口页和答题仍是近 7 日，不会被显示成昨日。</p>
      <form method="get">
        <label>
          按报告日读取
          <input type="date" name="date" defaultValue={report.reportDate} />
        </label>
        <input type="hidden" name="window" value={active} />
        <button type="submit">读取</button>
      </form>

      <section className={styles.section}>
        <h2>流量来源</h2>
        <p className={styles.period}>近 7 日，GA4。占比的分母是全站访问次数。</p>
        <BarChart
          total={sessions}
          rows={[
            { label: "直接访问", value: direct },
            { label: "Google 自然搜索", value: google },
            { label: "Bing 自然搜索", value: bing },
            ...(other != null && other >= 0 ? [{ label: "其他来源", value: other }] : []),
          ]}
        />
      </section>

      <section className={styles.section}>
        <h2>入口访问次数</h2>
        <p className={styles.period}>近 7 日，GA4 的 landingPage 入口会话。这是入口访问次数，不是页面总访问。不带斜杠、带斜杠和带查询参数的同一路径已合并，相同记录不重复计数。占比的分母是全站访问次数。</p>
        {practice.reason === "merged" ? (
          <p className={styles.fine}>练习页在原始记录里写成了 {practice.variants.join("、")}，合并后是 {practice.sessions} 次入口访问次数。</p>
        ) : null}
        {landing ? (
          <BarChart total={sessions} rows={landing.map((row) => ({ label: row.page, value: row.sessions }))} />
        ) : (
          <p>入口页没有返回。</p>
        )}
        <h3>重点页面的入口访问次数</h3>
        <p className={styles.fine}>已保存的入口名单有上限。名单里没有这一页时显示无法确定，不是 0。返回行数少于上限，也不能据此把名单当成完整名单。只有这一行明确写成 0，才显示 0。</p>
        <ul className={styles.bars}>
          {CORE_PAGES.map((page) => {
            const matched = matchLandingPage(landingRows, page);
            const fromLongerList = matched.sessions == null ? positiveCoreSessions(view.ga4, page) : null;
            const entrySessions = matched.sessions != null ? matched.sessions : fromLongerList;
            return (
              <li key={page}>
                {page}：{entrySessions == null ? "无法确定" : `${entrySessions} 次入口访问次数`}
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.section}>
        <h2>行为阶段</h2>
        <p className={styles.period}>近 7 日，每个数字是该事件自己的计数。{FUNNEL_NOTE}</p>
        <p className={styles.fine}>PostHog 刚接入时，接入前没有事件不能解释成当时没有人答题。查询结果里没有该事件时显示未返回，不显示 0。</p>
        <BarChart total={null} rows={stages.map((step) => ({ label: STAGE_LABEL[step.event] || step.label, value: step.trailing7 }))} />
        <div className={styles.compare}>
          {stages.map((step, index) => {
            const prior = index > 0 ? stages[index - 1] : null;
            const rate =
              !prior || step.trailing7 == null || prior.trailing7 == null
                ? "上一步或这一步没有记录，事件数量比无法确定"
                : prior.trailing7 === 0
                  ? "上一步为 0，事件数量比无法计算"
                  : `${((step.trailing7 / prior.trailing7) * 100).toFixed(1)}%`;
            return (
              <div key={step.event}>
                <strong>{STAGE_LABEL[step.event] || step.label}</strong>
                <p>近 7 日 {countText(step.trailing7)}</p>
                <p className={styles.fine}>
                  昨日 {countText(step.yesterday)} · 前 7 日 {countText(step.previous7)}
                </p>
                <p className={styles.fine}>{index === 0 ? "没有上一步，不计算事件数量比。" : `与上一步的事件数量比：${rate}`}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.section}>
        <h2>收款与权益</h2>
        <p className={styles.period}>近 7 日。和上面的浏览步骤分开，因为对不上同一个人。</p>
        <div className={styles.compare}>
          <div>
            <strong>成交</strong>
            <p>{countText(completed)} 笔</p>
            <p className={styles.fine}>昨日 {countText(view.steps.find((step) => step.event === "paddle_completed")?.yesterday ?? null)}</p>
          </div>
          <div>
            <strong>成交额</strong>
            <p>{gross == null ? "未返回" : `${(gross / 100).toFixed(2)} USD`}</p>
          </div>
          <div>
            <strong>权益核对</strong>
            <p>{completed === 0 ? "无订单待核对" : countText(matched)}</p>
            <p className={styles.fine}>前 7 日成交 {countText(view.steps.find((step) => step.event === "paddle_completed")?.previous7 ?? null)}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>搜索</h2>
        <p className={styles.period}>当前显示{periodLabel}。名次数字越小越好；名次差为正表示排名变好。</p>
        <p>
          点击 {seo?.clicks ?? "未返回"}，展示 {seo?.impressions ?? "未返回"}，平均名次 {seo?.position ?? "未返回"}
        </p>
        <div className={styles.compare}>
          <div>
            <strong>昨日点击</strong>
            <p>{countText(typeof gscTotals.yesterday?.clicks === "number" ? gscTotals.yesterday.clicks : null)}</p>
          </div>
          <div>
            <strong>近 7 日点击</strong>
            <p>{countText(typeof gscTotals.trailing7?.clicks === "number" ? gscTotals.trailing7.clicks : null)}</p>
          </div>
          <div>
            <strong>前 7 日点击</strong>
            <p>{countText(typeof gscTotals.previous7?.clicks === "number" ? gscTotals.previous7.clicks : null)}</p>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>已保存的报告序列</h2>
        {sessionPoints.length >= 2 ? (
          <>
            <p className={styles.period}>每个点是那一份日报里的近 7 日访问次数，不是把一个 7 日合计拆成每天。</p>
            <TrendChart points={sessionPoints.map((point) => ({ label: point.reportDate, value: point.sessions }))} />
          </>
        ) : (
          <p>目前没有两份以上带访问次数的日报，所以不画趋势线。上面的昨日、近 7 日、前 7 日是周期对比。</p>
        )}
      </section>

      <section className={styles.section}>
        <h2>采集诊断</h2>
        <p className={styles.period}>实时探测、管理员验收和真实访客分开查询。验收带 ops_acceptance=1，单独列出，不计入真实访客转化。2026-10-10 的历史日报不回填。</p>
        <p>代码版本 {view.gitSha || "未记录"}，结构版本 {view.schemaVersion ?? "旧报告，还没有结构版本"}。</p>
        <p>
          PostHog 接口 {diagnostics && diagnostics.apiReachable === true ? "可访问" : diagnostics && diagnostics.apiReachable === false ? "没有访问成功" : "未记录"}
          {diagnostics?.regionMatch === false ? "。浏览器上报区域和查询区域不一致。" : ""}
        </p>
        <p>历史覆盖：{historicalCaptureCopy(typeof diagnostics?.captureState === "string" ? diagnostics.captureState : null)}。这份日报不回填截止时间之后的操作。</p>
        {params.liveProbe === "1" ? (
          <>
            <p>查询区间：{params.queryStart || "未返回"} 至 {params.queryEnd || "未返回"}，不含结束时刻。</p>
            <p>探测事件：{params.probeError ? "查询没有成功。" : `${params.probeTotal || "0"} 次。${params.probeLast ? `最后时间 ${params.probeLast}。` : "尚无探测事件。"}` }{params.probeEvents ? `分项：${params.probeEvents}。` : ""}这些事件带 ops_probe=1，不计入真实访客。</p>
            <p>管理员验收：{params.acceptanceError ? "查询没有成功。" : `${params.acceptanceTotal || "0"} 次。${params.acceptanceLast ? `最后时间 ${params.acceptanceLast}。` : "这个区间没有验收事件。"}` }{params.acceptanceEvents ? `分项：${params.acceptanceEvents}。` : ""}{params.reportDate ? `所属报告日是凤凰城 ${params.reportDate}。` : ""}这是管理员验收，不是真实用户转化。{params.inHistory === "0" ? "当前这份历史日报不会写入这些事件。" : params.inHistory === "1" ? "该时刻已经落在当前已关闭的日报窗口内。" : ""}</p>
            <p>真实访客：{params.visitorError ? "查询没有成功。" : `${params.visitorTotal || "0"} 次。${params.visitorLast ? `最后时间 ${params.visitorLast}。` : ""}` }{params.visitorEvents ? `分项：${params.visitorEvents}。` : ""}已排除探测和管理员验收。</p>
          </>
        ) : (
          <p>还没有做这次检查。检查探测会查询覆盖 2026-10-11 17:17 UTC 验收时刻的区间，并在结果里写明实际起止时间。</p>
        )}
        <p className={styles.fine}>
          项目 {typeof diagnostics?.projectId === "string" ? diagnostics.projectId : "未记录"}
          {typeof diagnostics?.queryRegion === "string" ? `，查询区域 ${diagnostics.queryRegion}` : ""}
          {typeof diagnostics?.ingestRegion === "string" ? `，上报区域 ${diagnostics.ingestRegion}` : ""}
          {typeof diagnostics?.coverageStart === "string" ? `，业务事件覆盖起点 ${diagnostics.coverageStart}` : "，还没有确认到业务事件覆盖起点"}
        </p>
        <p className={styles.fine}>
          探测事件 {probeCount(diagnostics)} 次。
          {probeLast(diagnostics) ? `最后时间 ${probeLast(diagnostics)}。` : "尚无探测事件。"}
          探测时间晚于本报告截止时间的，不会算进这份历史日报。
        </p>
        {paddleEnvironment ? <p className={styles.fine}>收款环境：{paddleEnvironment === "production" ? "正式" : paddleEnvironment}。</p> : null}
        <form method="post" action="/admin/operations/recollect">
          <input type="hidden" name="date" value={report.reportDate} />
          <button type="submit">重新采集</button>
        </form>
        <form method="post" action="/admin/operations/probe">
          <button type="submit">检查探测</button>
        </form>
        <p className={styles.fine}>刷新本页只读取已保存的正式报告。重新采集会再查一次数据源。检查探测只做上面的三次查询，不改这份日报。两者都只在正式环境对管理员开放。</p>
      </section>

      <section className={styles.section}>
        <h2>指标怎么读</h2>
        {explained.map((metric) => (
          <MetricBlock key={metric.name} metric={metric} />
        ))}
      </section>

      <details className={styles.section}>
        <summary>数据源、外链和口径</summary>
        <ul>
          {Object.entries(view.sources).map(([source, status]) => (
            <li key={source}>
              {source}：{SOURCE_LABEL[status] || status}
            </li>
          ))}
        </ul>
        <p className={styles.fine}>访问和入口页只存了近 7 日。行为阶段另有昨日和前 7 日的事件次数。搜索三个周期都有合计，没有逐日拆分。</p>
        <nav className={styles.links}>
          {shortcuts.map((item) => (
            <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
              {item.label}
            </a>
          ))}
        </nav>
      </details>
    </main>
  );
}
