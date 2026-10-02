import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { paths } from "@/lib/paths";
import { readOperationsHistory } from "@/lib/operations/read-report";
import {
  FUNNEL_NOTE,
  operationsAccess,
  operationsShortcuts,
  presentOperationsReport,
} from "@/lib/operations/report-view";
import type { CalculatedMetric } from "@/lib/operations/metrics";
import styles from "./report.module.css";

export const metadata: Metadata = {
  title: "运营日报",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function Formula({ metric }: { metric: CalculatedMetric }) {
  const zero = metric.denominator.value === 0;
  return (
    <details className={styles.calc}>
      <summary>查看计算方式</summary>
      <p>指标名称：{metric.name}</p>
      <p>公式：{metric.formula}</p>
      <p>
        分子：{metric.numerator.label} = {metric.numerator.value ?? "未知"}
        <br />
        来源：{metric.numerator.source}
      </p>
      <p>
        分母：{metric.denominator.label} = {metric.denominator.value ?? "未知"}
        <br />
        来源：{metric.denominator.source}
      </p>
      <p>代入计算：{metric.calculation}</p>
      <p>结果：{zero || metric.value == null ? "N/A" : metric.formattedValue}</p>
      {zero ? <p className={styles.na}>原因：分母为0，无法计算。</p> : null}
      <p>
        统计窗口：{metric.window.start} 至 {metric.window.end}
        <br />
        时区：{metric.window.timezone}
      </p>
      <p>数据来源：{metric.numerator.source} / {metric.denominator.source}</p>
      <p>样本量：{metric.sampleSize}</p>
      <p>数据完整性：{metric.sourceStatus}</p>
      {metric.warning ? <p className={styles.warning}>警告：{metric.warning}</p> : null}
    </details>
  );
}

function text(value: unknown) {
  if (typeof value === "number" || typeof value === "string") return String(value);
  return "未返回";
}

function rawValue(raw: unknown[], name: string) {
  const row = raw.find((item) => item && typeof item === "object" && (item as { name?: string }).name === name) as
    | { value?: unknown; source?: string; unit?: string }
    | undefined;
  if (!row || row.value == null) return "未返回";
  return `${row.value}${row.unit ? ` ${row.unit}` : ""} · ${row.source || ""}`;
}

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; window?: string }>;
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
        <p>{history.ok ? "这一天还没有汇总日报。" : "日报暂时读不出来。确认数据库迁移已经应用到当前库。"}</p>
        <nav className={styles.links}>
          {shortcuts.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noreferrer">
              {link.label}
            </a>
          ))}
        </nav>
      </main>
    );
  }

  const report = history.report;
  const view = presentOperationsReport(report.snapshot);
  const active = params.window === "yesterday" || params.window === "previous7" ? params.window : "trailing7";
  const link = (date: string | null, window = active) => {
    const query = new URLSearchParams();
    if (date) query.set("date", date);
    query.set("window", window);
    return `/admin/operations/?${query.toString()}`;
  };
  const latest = history.dates[0] || null;
  const previousReport = history.dates[1] || null;
  const gscTotals = (view.gsc?.totals || {}) as Record<string, { clicks?: number | null; impressions?: number | null; ctr?: number | null; position?: number | null } | null>;
  const seo = gscTotals[active];

  return (
    <main className={styles.page}>
      <p className={styles.status}>TODAY STATUS: {view.verdict.status}</p>
      <h1>运营日报</h1>
      <table className={styles.meta}>
        <tbody>
          <tr>
            <td>报告日期</td>
            <td>{report.reportDate}</td>
          </tr>
          <tr>
            <td>时区</td>
            <td>America/Phoenix</td>
          </tr>
          <tr>
            <td>生成时间</td>
            <td>{report.generatedAt || view.generatedAt}</td>
          </tr>
          <tr>
            <td>数据截止时间</td>
            <td>{report.dataAsOf || view.dataAsOf}</td>
          </tr>
        </tbody>
      </table>
      <table className={styles.sources}>
        <tbody>
          {Object.entries(view.sources).map(([source, status]) => (
            <tr key={source}>
              <td>{source}</td>
              <td>{status}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {view.verdict.watch.some((item) => item.includes("延迟") || item.includes("当日无数据")) ? (
        <p className={styles.note}>数据延迟：Search Console 延迟或当日无数据只记为 WATCH。</p>
      ) : null}
      {view.verdict.watch.some((item) => item.includes("小样本")) ? (
        <p className={styles.warning}>小样本提醒：只观察，不建议据此大规模修改。</p>
      ) : null}
      <nav className={styles.nav}>
        {latest ? <a href={link(latest)}>今日报告</a> : null}{" "}
        {previousReport ? <a href={link(previousReport)}>昨日报告</a> : null}{" "}
        <a href={link(report.reportDate, "yesterday")}>Yesterday</a>{" "}
        <a href={link(report.reportDate, "trailing7")}>Trailing 7 days</a>{" "}
        <a href={link(report.reportDate, "previous7")}>Previous 7 days</a>
      </nav>
      <form method="get">
        <label>
          按日期读取
          <input type="date" name="date" defaultValue={report.reportDate} />
        </label>
        <input type="hidden" name="window" value={active} />
        <button type="submit">读取历史日报</button>
      </form>
      <nav className={styles.links}>
        {shortcuts.map((item) => (
          <a key={item.label} href={item.href} target="_blank" rel="noreferrer">
            {item.label}
          </a>
        ))}
      </nav>

      <section className={styles.section}>
        <h2>1. 收入</h2>
        <p>正式收入只来自 Paddle。GA4 收入不使用。</p>
        <p>Completed：{text(view.paddle?.completed)}</p>
        <p>Gross：{typeof view.paddle?.grossMinor === "number" ? `${view.paddle.grossMinor / 100} USD` : "未返回"}</p>
        <p>Refunds：{text(view.paddle?.refundCount)}</p>
        <p>Failed/incomplete：{text(view.paddle?.incomplete)}</p>
        {view.calculated
          .filter((metric) => metric.name === "支付成功率" || metric.name === "权益发放成功率")
          .map((metric) => (
            <div key={metric.name}>
              <p>
                {metric.name}：{metric.formattedValue}
              </p>
              <Formula metric={metric} />
            </div>
          ))}
      </section>

      <section className={styles.section}>
        <h2>2. 流量</h2>
        <p>当前计算窗口是近 7 日。切换 Yesterday 或 Previous 7 days 时，GA4 流量不另造数字。</p>
        <p>Active users：{rawValue(view.raw, "Active users")}</p>
        <p>Sessions：{rawValue(view.raw, "Sessions")}</p>
        <p>Organic Search sessions：{rawValue(view.raw, "Organic Search sessions")}</p>
        {view.calculated
          .filter((metric) => metric.name === "Organic engagement rate" || metric.name === "Organic average engagement time")
          .map((metric) => (
            <div key={metric.name}>
              <p>
                {metric.name}：{metric.formattedValue}
              </p>
              <Formula metric={metric} />
            </div>
          ))}
      </section>

      <section className={styles.section}>
        <h2>3. 用户来源</h2>
        <p>Direct：{rawValue(view.raw, "Direct sessions")}</p>
        <p>google / organic：{rawValue(view.raw, "google / organic sessions")}</p>
        <p>bing / organic：{rawValue(view.raw, "bing / organic sessions")}</p>
        {view.calculated
          .filter((metric) => metric.name.includes("session share"))
          .map((metric) => (
            <div key={metric.name}>
              <p>
                {metric.name}：{metric.formattedValue}
              </p>
              <Formula metric={metric} />
            </div>
          ))}
      </section>

      <section className={styles.section}>
        <h2>4. Landing Page</h2>
        <table className={styles.table}>
          <tbody>
            {((view.ga4?.landing || []) as { page: string; sessions: number }[]).map((row) => (
              <tr key={row.page}>
                <td>{row.page}</td>
                <td>{row.sessions} sessions · GA4</td>
              </tr>
            ))}
          </tbody>
        </table>
        {view.calculated
          .filter((metric) => metric.name.startsWith("Landing "))
          .map((metric) => (
            <div key={metric.name}>
              <p>
                {metric.name}：{metric.formattedValue}
              </p>
              <Formula metric={metric} />
            </div>
          ))}
      </section>

      <section className={styles.section}>
        <h2>5. 核心漏斗</h2>
        <p className={styles.note}>{FUNNEL_NOTE}</p>
        <table className={styles.steps}>
          <thead>
            <tr>
              <th>步骤</th>
              <th>Yesterday</th>
              <th>Trailing 7 days</th>
              <th>Previous 7 days</th>
              <th>来源</th>
            </tr>
          </thead>
          <tbody>
            {view.steps.map((step) => (
              <tr key={step.label}>
                <td>
                  {step.label}
                  <p>原始数量（近 7 日）：{step.trailing7 ?? "未返回"}</p>
                  {step.conversion ? (
                    <>
                      <p>相对上一步：{step.conversion.formattedValue}</p>
                      <Formula metric={step.conversion} />
                    </>
                  ) : (
                    <p>相对上一步：N/A</p>
                  )}
                  <p>绝对变化：{step.absolute.formattedValue}</p>
                  <Formula metric={step.absolute} />
                  <p>变化率：{step.changeRate.formattedValue}</p>
                  <Formula metric={step.changeRate} />
                </td>
                <td>{step.yesterday ?? "未返回"}</td>
                <td>{step.trailing7 ?? "未返回"}</td>
                <td>{step.previous7 ?? "未返回"}</td>
                <td>{step.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>6. 核心页面</h2>
        <table className={styles.table}>
          <tbody>
            {((view.ga4?.corePages || []) as { page: string; sessions: number | null }[]).map((row) => (
              <tr key={row.page}>
                <td>{row.page}</td>
                <td>{row.sessions ?? "未返回"} sessions · GA4</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className={styles.section}>
        <h2>7. Google SEO</h2>
        <p>
          {active} clicks：{seo?.clicks ?? "未返回"}，impressions：{seo?.impressions ?? "未返回"}，position：
          {seo?.position ?? "未返回"}
        </p>
        {view.calculated
          .filter((metric) => metric.name.startsWith("Search Console"))
          .map((metric) => (
            <div key={metric.name}>
              <p>
                {metric.name}：{metric.formattedValue}
              </p>
              <Formula metric={metric} />
            </div>
          ))}
        <p>Indexing coverage：UNAVAILABLE_FROM_API</p>
      </section>

      <section className={styles.section}>
        <h2>8. 网站运行</h2>
        <p>Production：{text(view.vercel?.productionState)}</p>
        <p>窗口内 ERROR 部署：{text(view.vercel?.errorDeployments)}</p>
        <p>窗口内 READY 部署：{text(view.vercel?.readyDeployments)}</p>
        <p>运行日志：UNAVAILABLE_FROM_API。不把缺失日志当成持续 5xx。</p>
      </section>

      <section className={styles.section}>
        <h2>9. 异常</h2>
        {view.verdict.action.map((item) => (
          <p key={item} className={styles.warning}>
            {item}
          </p>
        ))}
        {view.verdict.watch.map((item) => (
          <p key={item}>{item}</p>
        ))}
        {!view.verdict.action.length && !view.verdict.watch.length ? <p>没有异常。</p> : null}
      </section>

      <section className={styles.section}>
        <h2>10. 行动建议</h2>
        {view.advice.map((item) => (
          <article key={item.evidence}>
            <p>{item.text}</p>
            <p>依据：{item.evidence}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
