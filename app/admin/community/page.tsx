import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { CommunityAdminInput } from "@/lib/community-admin-input";
import { communityDiscussionPath } from "@/lib/community-links";
import { communityModeration, COMMUNITY_ADMIN_PAGE_SIZE } from "@/lib/community-moderation";
import { operationsAccess } from "@/lib/operations/report-view";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";
import styles from "../operations/report.module.css";
import { ModerationForm } from "./moderation-form";

const admin = "/admin/community/";
const views = { content: "帖子和回复", review: "待审核", reports: "举报", history: "处理记录" } as const;
const statusLabels = { published: "已发布", pending: "待审核", hidden: "已隐藏" };
const reportLabels: Record<string, string> = {
  spam: "刷帖",
  harassment: "骚扰",
  scam: "可疑链接或诈骗",
  other: "其他",
};
const actionLabels: Record<CommunityAdminInput["action"], string> = {
  hide: "隐藏", restore: "恢复公开", approve: "通过审核", reject: "审核不通过",
  warn: "警告", ban: "社区封禁", unban: "解除封禁", "resolve-report": "处理举报",
};
const formatTime = new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
const uuid = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

type View = keyof typeof views;
type Params = { view?: string; page?: string; post?: string };

export const metadata: Metadata = { title: "社区管理", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

function adminHref(view: View, page = 0, post?: string) {
  const query = new URLSearchParams({ view });
  if (page) query.set("page", String(page + 1));
  if (post) query.set("post", post);
  return `${admin}?${query}`;
}

function Empty({ view }: { view: View }) {
  return <p className="notice">暂无{views[view]}。</p>;
}

function time(value: Date) {
  return <time dateTime={value.toISOString()}>{formatTime.format(value)} UTC</time>;
}

function stateText(value: Record<string, unknown>) {
  if ("status" in value) return statusLabels[value.status as keyof typeof statusLabels] ?? "未知状态";
  if ("banned" in value) return value.banned ? "已封禁" : "可参与";
  if ("warned" in value) return value.warned ? "本次警告已记录" : "本次警告未记录";
  if ("resolved" in value) return value.resolved ? "已处理" : "未处理";
  return "无";
}

async function Content({ view, page, id }: { view: View; page: number; id: string | null }) {
  const store = communityModeration();
  if (id) {
    const post = await store.post(id);
    if (!post) return <p className="notice">未找到该内容。</p>;
    const restorable = !post.thread_id || post.root_live;
    const choices: CommunityAdminInput["action"][] = [
      ...post.moderation_status === "pending" ? (restorable ? ["approve", "reject"] as const : ["reject"] as const)
        : post.moderation_status === "published" ? ["hide"] as const : restorable ? ["restore"] as const : [],
      "warn", post.banned ? "unban" : "ban",
    ];
    return (
      <article className={styles.card}>
        <h2>{post.title || (post.parent_id ? "回复" : "洞察评论")}</h2>
        <p>{post.nickname || "社区成员"} · {time(post.created_at)} · {post.deleted_at || post.author_deleted ? "已删除" : statusLabels[post.moderation_status]}</p>
        <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{post.body}</p>
        <p>内容 ID <code>{post.id}</code></p>
        <p>作者 ID <code>{post.user_id}</code> · {post.banned ? "社区权限已封禁" : "可参与社区"}</p>
        {!restorable && <p className="notice">所属帖子当前不可见。先恢复或批准所属帖子，再公开此回复。</p>}
        {post.root_live && post.moderation_status === "published" && !post.deleted_at && !post.author_deleted && (
          <p><Link href={communityDiscussionPath(post.insight_id, post.thread_id ?? post.id).replace(/#.*$/, `#community-message-${post.id}`)}>查看公开讨论</Link></p>
        )}
        {!post.author_deleted && (post.deleted_at
          ? (post.banned && <ModerationForm id={post.id} choices={["unban"]} />)
          : <ModerationForm id={post.id} choices={[choices[0], ...choices.slice(1)]} />)}
      </article>
    );
  }

  let more: boolean;
  let list: ReactNode;
  if (view === "reports") {
    const rows = await store.reports(page);
    more = rows.length > COMMUNITY_ADMIN_PAGE_SIZE;
    list = !rows.length ? <Empty view={view} /> : (
      <ul className="grid" role="list">
        {rows.slice(0, COMMUNITY_ADMIN_PAGE_SIZE).map((report) => (
          <li key={report.id} className={styles.card}>
            <h3>{reportLabels[report.reason] ?? report.reason}</h3>
            <p>{time(report.created_at)} · {report.resolved_at ? "已处理" : "未处理"}</p>
            {report.note && <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{report.note}</p>}
            <p>举报者 ID <code>{report.reporter_id ?? "已删除账户"}</code></p>
            <p><Link href={adminHref(view, page, report.post_id)}>查看被举报内容</Link></p>
            {!report.resolved_at && <ModerationForm id={report.id} choices={["resolve-report"]} />}
          </li>
        ))}
      </ul>
    );
  } else if (view === "history") {
    const rows = await store.history(page);
    more = rows.length > COMMUNITY_ADMIN_PAGE_SIZE;
    list = !rows.length ? <Empty view={view} /> : (
      <ol className="grid" role="list">
        {rows.slice(0, COMMUNITY_ADMIN_PAGE_SIZE).map((entry) => (
          <li key={entry.id} className={styles.card}>
            <h3>{actionLabels[entry.action] ?? entry.action} · 记录 {entry.id}</h3>
            <p>{time(entry.created_at)} · {stateText(entry.before_state)} → {stateText(entry.after_state)}</p>
            <p style={{ whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{entry.reason}</p>
            <p>操作者 ID <code>{entry.actor_id}</code> · 目标账号 ID <code>{entry.target_user_id}</code></p>
            {entry.post_id && <p><Link href={adminHref(view, page, entry.post_id)}>目标内容 {entry.post_id}</Link></p>}
            {entry.report_id && <p>举报 ID <code>{entry.report_id}</code></p>}
          </li>
        ))}
      </ol>
    );
  } else {
    const rows = await store.posts(view, page);
    more = rows.length > COMMUNITY_ADMIN_PAGE_SIZE;
    list = !rows.length ? <Empty view={view} /> : (
      <ul className="grid" role="list">
        {rows.slice(0, COMMUNITY_ADMIN_PAGE_SIZE).map((post) => (
          <li key={post.id} className={styles.card}>
            <h3><Link href={adminHref(view, page, post.id)}>{post.title || (post.parent_id ? "查看回复" : "查看洞察评论")}</Link></h3>
            <p>{post.nickname || "社区成员"} · {time(post.created_at)} · {statusLabels[post.moderation_status]}</p>
            <p style={{ overflowWrap: "anywhere" }}>{post.body.length > 150 ? `${post.body.slice(0, 150)}…` : post.body}</p>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      {list}
      {(page > 0 || more) && (
        <nav className="row" aria-label="社区管理分页">
          {page > 0 && <Link className="btn btn-ghost" href={adminHref(view, page - 1)}>上一页</Link>}
          {more && <Link className="btn btn-ghost" href={adminHref(view, page + 1)}>下一页</Link>}
        </nav>
      )}
    </>
  );
}

export default async function CommunityAdmin({ searchParams }: { searchParams: Promise<Params> }) {
  const session = await getSession();
  const access = operationsAccess(session?.email, process.env.OPERATIONS_ADMIN_EMAILS);
  if (access === "anonymous") redirect(`${paths.login}?next=${encodeURIComponent(admin)}`);
  if (access !== "ok") return <main className={styles.page} lang="zh-CN" style={{ overflowWrap: "anywhere" }}><h1>403</h1><p>无权查看社区管理。</p></main>;

  const params = await searchParams;
  const view = params.view && Object.hasOwn(views, params.view) ? params.view as View : "content";
  const page = typeof params.page === "string" && /^\d{1,4}$/.test(params.page) ? Math.max(0, Number(params.page) - 1) : 0;
  const id = typeof params.post === "string" && uuid.test(params.post) ? params.post : null;

  let content;
  try {
    content = await Content({ view, page, id });
  } catch {
    content = <p className="notice" role="alert">社区管理暂时不可用。<Link href={adminHref(view, page, id ?? undefined)}>重新加载</Link></p>;
  }
  return (
    <main className={styles.page} lang="zh-CN" style={{ overflowWrap: "anywhere" }}>
      <header>
        <p><Link href="/admin/operations/">返回运营后台</Link></p>
        <h1>社区管理</h1>
      </header>
      <nav className="row" aria-label="社区管理分区">
        {Object.entries(views).map(([key, label]) => (
          <Link className="btn btn-ghost" key={key} href={adminHref(key as View)} aria-current={key === view ? "page" : undefined}>{label}</Link>
        ))}
      </nav>
      <section aria-labelledby="community-admin-heading">
        <h2 id="community-admin-heading">{id ? "内容详情" : views[view]}</h2>
        {id && <p><Link href={adminHref(view, page)}>返回{views[view]}</Link></p>}
        {content}
      </section>
    </main>
  );
}
