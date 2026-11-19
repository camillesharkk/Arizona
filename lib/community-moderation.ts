import "server-only";
import { getPgSql } from "@/lib/store/pg-store";
import type { CommunityAdminInput } from "@/lib/community-admin-input";

export const COMMUNITY_ADMIN_PAGE_SIZE = 25;

type Status = "published" | "pending" | "hidden";
type PostRow = {
  id: string;
  user_id: string;
  insight_id: string | null;
  thread_id: string | null;
  parent_id: string | null;
  title: string | null;
  body: string;
  created_at: Date;
  deleted_at: Date | null;
  moderation_status: Status;
  nickname: string | null;
  banned: boolean;
  author_deleted: boolean;
  root_live: boolean;
};
type ReportRow = {
  id: string;
  post_id: string;
  reason: string;
  note: string | null;
  created_at: Date;
  resolved_at: Date | null;
  reporter_id: string | null;
};
type AuditRow = {
  id: string;
  actor_id: string;
  target_user_id: string;
  post_id: string | null;
  report_id: string | null;
  action: CommunityAdminInput["action"];
  reason: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  created_at: Date;
};

const postTransitions = {
  hide: { from: ["published"], to: "hidden" },
  restore: { from: ["hidden"], to: "published" },
  approve: { from: ["pending"], to: "published" },
  reject: { from: ["pending"], to: "hidden" },
} satisfies Record<string, { from: readonly Status[]; to: Status }>;

export function communityModeration(sql = getPgSql()) {
  const postRows = sql`
    select p.id, p.user_id, p.insight_id, p.thread_id, p.parent_id, p.title, p.body, p.created_at, p.deleted_at,
      p.moderation_status, profile.nickname, coalesce(profile.banned, false) as banned, u.deleted_at is not null as author_deleted,
      coalesce(root.moderation_status = 'published' and root.deleted_at is null and root_user.deleted_at is null, false) as root_live
    from community_posts p
    join users u on u.id = p.user_id
    left join community_profiles profile on profile.user_id = p.user_id
    left join community_posts root on root.id = coalesce(p.thread_id, p.id)
    left join users root_user on root_user.id = root.user_id
  `;

  return {
    async posts(view: "content" | "review", page: number) {
      return sql<PostRow[]>`
        ${postRows}
        where p.deleted_at is null and u.deleted_at is null
          and (${view} = 'content' or p.moderation_status = 'pending')
        order by p.created_at desc, p.id desc
        limit ${COMMUNITY_ADMIN_PAGE_SIZE + 1} offset ${page * COMMUNITY_ADMIN_PAGE_SIZE}
      `;
    },
    async post(id: string) {
      const [row] = await sql<PostRow[]>`${postRows} where p.id = ${id}`;
      return row ?? null;
    },
    async reports(page: number) {
      return sql<ReportRow[]>`
        select id, post_id, reason, note, created_at, resolved_at, reporter_id
        from community_reports
        order by (resolved_at is null) desc, created_at desc, id desc
        limit ${COMMUNITY_ADMIN_PAGE_SIZE + 1} offset ${page * COMMUNITY_ADMIN_PAGE_SIZE}
      `;
    },
    async history(page: number) {
      return sql<AuditRow[]>`
        select id::text, actor_id, target_user_id, post_id, report_id, action, reason, before_state, after_state, created_at
        from community_moderation_log
        order by id desc
        limit ${COMMUNITY_ADMIN_PAGE_SIZE + 1} offset ${page * COMMUNITY_ADMIN_PAGE_SIZE}
      `;
    },
    async apply(actorId: string, { action, id, reason, confirm }: CommunityAdminInput) {
      if (action === "restore" && confirm !== "yes") return false;
      return sql.begin(async (tx) => {
        async function audit(targetUserId: string, postId: string, reportId: string | null, before: Record<string, string | boolean>, after: Record<string, string | boolean>) {
          await tx`
            insert into community_moderation_log (actor_id, target_user_id, post_id, report_id, action, reason, before_state, after_state)
            values (${actorId}, ${targetUserId}, ${postId}, ${reportId}, ${action}, ${reason}, ${tx.json(before)}, ${tx.json(after)})
          `;
        }

        if (action === "resolve-report") {
          const [report] = await tx<{ post_id: string; user_id: string }[]>`
            update community_reports report set resolved_at = now() from community_posts post
            where report.id = ${id} and report.post_id = post.id and report.resolved_at is null
            returning report.post_id, post.user_id
          `;
          if (!report) return false;
          await audit(report.user_id, report.post_id, id, { resolved: false }, { resolved: true });
          return true;
        }

        const [target] = await tx<{ user_id: string; root_id: string; deleted_at: Date | null }[]>`
          select p.user_id, coalesce(p.thread_id, p.id) as root_id, p.deleted_at from community_posts p
          join users u on u.id = p.user_id and u.deleted_at is null
          where p.id = ${id}
        `;
        if (!target || (target.deleted_at && action !== "unban")) return false;
        if (action === "ban" || action === "unban" || action === "warn") {
          await tx`select pg_advisory_xact_lock(hashtextextended(${"community-user:" + target.user_id}, 0))`;
          if (action === "warn") {
            await audit(target.user_id, id, null, { warned: false }, { warned: true });
            return true;
          }
          const [current] = await tx<{ banned: boolean }[]>`select banned from community_profiles where user_id = ${target.user_id}`;
          const before = current?.banned ?? false;
          const after = action === "ban";
          if (before === after) return false;
          await tx`
            insert into community_profiles (user_id, banned) values (${target.user_id}, ${after})
            on conflict (user_id) do update set banned = excluded.banned
          `;
          await audit(target.user_id, id, null, { banned: before }, { banned: after });
          return true;
        }

        const [root] = await tx<{ moderation_status: Status; deleted_at: Date | null; author_deleted: boolean }[]>`
          select p.moderation_status, p.deleted_at, u.deleted_at is not null as author_deleted
          from community_posts p join users u on u.id = p.user_id
          where p.id = ${target.root_id} for update of p
        `;
        if (!root || root.deleted_at || root.author_deleted) return false;
        const transition = postTransitions[action];
        if (id !== target.root_id && transition.to === "published" && root.moderation_status !== "published") return false;
        const [updated] = await tx<{ moderation_status: Status }[]>`
          update community_posts set moderation_status = ${transition.to}
          where id = ${id} and deleted_at is null and moderation_status in ${tx(transition.from)}
          returning moderation_status
        `;
        if (!updated) return false;
        await audit(target.user_id, id, null, { status: transition.from[0] }, { status: updated.moderation_status });
        return true;
      });
    },
  };
}
