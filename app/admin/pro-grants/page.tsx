import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { manualProProducts, MAX_MANUAL_PRO_DAYS, MAX_MANUAL_PRO_REASON } from "@/lib/manual-pro-input";
import { listManualProGrants } from "@/lib/manual-pro";
import { operationsAccess } from "@/lib/operations/report-view";
import { paths } from "@/lib/paths";
import { PRO_DURATION_DAYS } from "@/lib/product";
import { getSession } from "@/lib/session";
import styles from "../operations/report.module.css";
import { GrantForm } from "./grant-form";

const path = "/admin/pro-grants/";
const formatter = new Intl.DateTimeFormat("zh-CN", {
  timeZone: "Asia/Shanghai", dateStyle: "medium", timeStyle: "medium",
});

export const metadata: Metadata = { title: "授予或延长 Pro", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function grantTime(iso: string | null) {
  return iso ? <time dateTime={iso}>{formatter.format(new Date(iso))}</time> : "无";
}

export default async function ManualProAdmin() {
  const session = await getSession();
  const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
  if (access === "anonymous") redirect(paths.login + "?next=" + encodeURIComponent(path));
  if (access !== "ok") return <main className={styles.page} lang="zh-CN"><h1>403</h1><p>无权查看 Pro 授权后台。</p></main>;

  let receipts: Awaited<ReturnType<typeof listManualProGrants>> | null = null;
  try {
    receipts = await listManualProGrants();
  } catch {
    // The retry view covers database and migration unavailability.
  }

  return (
    <main className={styles.page} lang="zh-CN" style={{ overflowWrap: "anywhere" }}>
      <header>
        <p><Link href="/admin/operations/">返回运营后台</Link></p>
        <h1>授予或延长 Pro</h1>
        <p>手动授权只更新权益和审计记录。</p>
      </header>
      {receipts === null ? <p role="alert">授权后台暂时不可用。 <Link href={path}>重试</Link></p> : (
        <>
          <section className={styles.panel}>
            <p className="notice">旧产品保留历史州标记。当前有效的限期 Pro 按全站规则判定。</p>
            <GrantForm requestId={randomUUID()} products={manualProProducts} defaultDays={PRO_DURATION_DAYS} maxDays={MAX_MANUAL_PRO_DAYS} maxReason={MAX_MANUAL_PRO_REASON} />
          </section>
          <section className={styles.panel} aria-labelledby="manual-pro-history">
            <h2 id="manual-pro-history">最近授权记录（北京时间）</h2>
            {receipts.length ? (
              <ul>
                {receipts.map(receipt => (
                  <li key={receipt.requestId}>
                    <p><b>{receipt.email ?? receipt.userId}</b> · {receipt.productCode} · {receipt.state} · {receipt.days} 天</p>
                    <p>原到期时间 {grantTime(receipt.previousExpiresAt)}<br />
                      生效时间 {grantTime(receipt.startsAt)}<br />
                      新到期时间 {grantTime(receipt.expiresAt)}</p>
                    <p>操作时间 {grantTime(receipt.createdAt)} · {receipt.actorKind === "administrator" ? "管理员" : "数据库运维"} {receipt.actorId}</p>
                    <p>原因 {receipt.reason}</p>
                  </li>
                ))}
              </ul>
            ) : <p>暂无手动授权记录。</p>}
          </section>
        </>
      )}
    </main>
  );
}
