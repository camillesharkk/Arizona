import "server-only";
import { communityLimits, duplicates, linkRisk, type CommunityReportReason } from "@/lib/community-policy";
import { getPgSql } from "@/lib/store/pg-store";

export const COMMUNITY_PAGE_SIZE = 20;
export const COMMUNITY_REPLY_LIMIT = 200;
export const COMMUNITY_MAX_DEPTH = 4;

type Row = {
  id: string;
  parent_id: string | null;
  title: string | null;
  body: string;
  depth: number;
  created_at: Date;
  hidden: boolean;
  author: string | null;
  mine: boolean;
  liked: boolean;
  like_count: number;
  reply_count: number;
};

function publicPost(row: Row) {
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.hidden ? null : row.title,
    body: row.hidden ? "" : row.body,
    depth: row.depth,
    date: row.created_at.toISOString(),
    deleted: row.hidden,
    author: row.hidden ? null : (row.author ?? "Community member"),
    mine: !row.hidden && row.mine,
    liked: !row.hidden && row.liked,
    likes: row.hidden ? 0 : row.like_count,
    replies: row.reply_count,
  };
}

export type CommunityPost = ReturnType<typeof publicPost>;

export type CommunityInsightActivity = { id: string; likes: number; liked: boolean; comments: number };

type NewPost = {
  id: string;
  userId: string;
  insightId: string | null;
  title: string | null;
  parentId: string | null;
  body: string;
};

export function communityStore(sql = getPgSql()) {
  const columns = (viewer: string | null) => sql`
    p.id, p.parent_id, p.title, p.body, p.depth, p.created_at,
    (p.deleted_at is not null or u.deleted_at is not null) as hidden,
    profile.nickname as author, coalesce(p.user_id = ${viewer}, false) as mine,
    coalesce(l.liked, false) as liked, l.like_count, coalesce(r.reply_count, 0)::int as reply_count
  `;
  const counts = (viewer: string | null) => sql`
    left join lateral (
      select count(*)::int as like_count, bool_or(cl.user_id = ${viewer}) as liked
      from community_likes cl join users liked_by on liked_by.id = cl.user_id and liked_by.deleted_at is null
      where cl.post_id = p.id
    ) l on true
    left join lateral (
      select count(*)::int as reply_count
      from community_posts reply join users replied_by on replied_by.id = reply.user_id and replied_by.deleted_at is null
      where reply.thread_id = p.id and reply.deleted_at is null and reply.moderation_status = 'published'
    ) r on true
  `;

  return {
    async insightActivity(ids: readonly string[], viewer: string | null) {
      return sql<CommunityInsightActivity[]>`
        select target.id, l.likes, l.liked, c.comments
        from unnest(${sql.array([...ids])}::text[]) as target(id)
        cross join lateral (
          select count(*)::int as likes, coalesce(bool_or(reaction.user_id = ${viewer}), false) as liked
          from community_insight_likes reaction
          join users author on author.id = reaction.user_id and author.deleted_at is null
          where reaction.insight_id = target.id
        ) l
        cross join lateral (
          select coalesce(sum(1 + (
            select count(*) from community_posts reply
            join users reply_author on reply_author.id = reply.user_id and reply_author.deleted_at is null
            where reply.thread_id = root.id and reply.deleted_at is null and reply.moderation_status = 'published'
          )), 0)::int as comments
          from community_posts root
          join users author on author.id = root.user_id and author.deleted_at is null
          where root.insight_id = target.id and root.parent_id is null and root.deleted_at is null and root.moderation_status = 'published'
        ) c
      `;
    },
    async insightLikes(insightId: string, viewer: string | null) {
      const [row] = await sql<{ likes: number; liked: boolean }[]>`
        select count(*)::int as likes, coalesce(bool_or(l.user_id = ${viewer}), false) as liked
        from community_insight_likes l join users u on u.id = l.user_id and u.deleted_at is null
        where l.insight_id = ${insightId}
      `;
      return row;
    },
    async setInsightLike(insightId: string, userId: string, liked: boolean) {
      if (liked) {
        await sql`insert into community_insight_likes (insight_id, user_id)
          values (${insightId}, ${userId}) on conflict (insight_id, user_id) do nothing`;
      } else {
        await sql`delete from community_insight_likes where insight_id = ${insightId} and user_id = ${userId}`;
      }
    },
    async list(insightId: string | null, viewer: string | null, page: number) {
      const rows = await sql<Row[]>`
        select ${columns(viewer)}
        from community_posts p join users u on u.id = p.user_id
        left join community_profiles profile on profile.user_id = p.user_id
        ${counts(viewer)}
        where p.parent_id is null and p.insight_id is not distinct from ${insightId}
          and p.deleted_at is null and u.deleted_at is null and p.moderation_status = 'published'
        order by l.like_count + r.reply_count desc, p.created_at desc, p.id desc
        limit ${COMMUNITY_PAGE_SIZE + 1} offset ${page * COMMUNITY_PAGE_SIZE}
      `;
      return { posts: rows.slice(0, COMMUNITY_PAGE_SIZE).map(publicPost), more: rows.length > COMMUNITY_PAGE_SIZE };
    },
    async thread(insightId: string | null, id: string, viewer: string | null) {
      const rows = await sql<Row[]>`
        select ${columns(viewer)}
        from community_posts p join users u on u.id = p.user_id
        left join community_profiles profile on profile.user_id = p.user_id
        ${counts(viewer)}
        where (p.id = ${id} or p.thread_id = ${id}) and p.moderation_status = 'published'
          and exists (
            select 1 from community_posts root join users root_author on root_author.id = root.user_id
            where root.id = ${id} and root.parent_id is null
              and root.insight_id is not distinct from ${insightId}
              and root.deleted_at is null and root_author.deleted_at is null and root.moderation_status = 'published'
          )
        order by p.depth = 0 desc, p.created_at asc, p.id asc
      `;
      if (!rows.length) return null;
      const visibleIds = new Set(rows.map(row => row.id));
      const replies = rows.slice(1).map(row => {
        const post = publicPost(row);
        // Preserve public replies to separately moderated messages.
        if (post.parentId && !visibleIds.has(post.parentId)) post.parentId = id;
        return post;
      });
      return { post: publicPost(rows[0]), replies };
    },
    async member(userId: string) {
      const [[profile], warnings, pending] = await Promise.all([
        sql<{ nickname: string | null; banned: boolean }[]>`
          select nickname, banned from community_profiles where user_id = ${userId}`,
        sql<{ reason: string; created_at: Date }[]>`
          select reason, created_at from community_moderation_log
          where target_user_id = ${userId} and action = 'warn' order by id desc limit 30`,
        sql<{ id: string; title: string | null; body: string; insight_id: string | null; thread_id: string | null; created_at: Date }[]>`
          select id, title, body, insight_id, thread_id, created_at from community_posts
          where user_id = ${userId} and moderation_status = 'pending' and deleted_at is null
          order by created_at desc, id desc`,
      ]);
      return {
        nickname: profile?.nickname ?? null,
        banned: profile?.banned ?? false,
        warnings: warnings.map(row => ({ reason: row.reason, createdAt: row.created_at.toISOString() })),
        pending: pending.map(row => ({
          id: row.id, title: row.title, body: row.body, insightId: row.insight_id,
          threadId: row.thread_id, date: row.created_at.toISOString(),
        })),
      };
    },
    async setNickname(userId: string, nickname: string) {
      await sql`
        insert into community_profiles (user_id, nickname) values (${userId}, ${nickname})
        on conflict (user_id) do update set nickname = excluded.nickname
      `;
    },
    async publish(input: NewPost) {
      return sql.begin(async (tx) => {
        // Serialize author quota checks across pooled Vercel instances.
        await tx`select pg_advisory_xact_lock(hashtextextended(${`community-user:${input.userId}`}, 0))`;
        const [profile] = await tx`
          select nickname, banned from community_profiles where user_id = ${input.userId}
        `;
        if (profile?.banned) return { ok: false, code: "banned" } as const;
        if (!profile?.nickname) return { ok: false, code: "nickname" } as const;
        const [existing] = await tx`
          select coalesce(p.thread_id, p.id)::text as id, p.insight_id, p.parent_id, p.title, p.body,
            p.moderation_status, p.deleted_at,
            root.deleted_at is null and root.moderation_status = 'published' and root_author.deleted_at is null as root_live
          from community_posts p join community_posts root on root.id = coalesce(p.thread_id, p.id)
          join users root_author on root_author.id = root.user_id
          where p.id = ${input.id} and p.user_id = ${input.userId}
        `;
        if (existing) {
          if (existing.deleted_at || existing.moderation_status === "hidden" ||
              (existing.moderation_status === "published" && !existing.root_live)) return { ok: false, code: "missing" } as const;
          if (existing.insight_id !== input.insightId || existing.parent_id !== input.parentId ||
              existing.title !== input.title || existing.body !== input.body) return { ok: false, code: "duplicate" } as const;
          return { ok: true, threadId: String(existing.id), status: existing.moderation_status === "pending" ? "pending" : "published" } as const;
        }
        const recent = await tx<{ title: string | null; body: string; deleted_at: Date | null; last_minute: boolean; last_day: boolean }[]>`
          select title, body, deleted_at, created_at >= now() - interval '1 minute' as last_minute,
            created_at >= now() - interval '1 day' as last_day
          from community_posts
          where user_id = ${input.userId} and created_at >= now() - make_interval(hours => ${communityLimits.duplicateHours})
        `;
        if (recent.filter(post => post.last_minute).length >= communityLimits.postsPerMinute ||
            recent.filter(post => post.last_day).length >= communityLimits.postsPerDay) return { ok: false, code: "rate" } as const;
        const content = [input.title, input.body].filter(Boolean).join(" ");
        if (recent.some(post => !post.deleted_at &&
          (duplicates(input.body, post.body) || duplicates(content, [post.title, post.body].filter(Boolean).join(" "))))) {
          return { ok: false, code: "duplicate" } as const;
        }
        const risk = linkRisk(content);
        if (risk === "blocked") return { ok: false, code: "link" } as const;
        const status = risk === "pending" ? "pending" : "published";
        let threadId: string | null = null;
        let depth = 0;
        if (input.parentId) {
          const [parent] = await tx`
            select coalesce(p.thread_id, p.id)::text as id, p.depth
            from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
            where p.id = ${input.parentId} and p.deleted_at is null and p.moderation_status = 'published'
              and p.insight_id is not distinct from ${input.insightId}
          `;
          if (!parent) return { ok: false, code: "missing" } as const;
          threadId = String(parent.id);
          depth = Number(parent.depth) + 1;
          if (depth > COMMUNITY_MAX_DEPTH) return { ok: false, code: "depth" } as const;
          // Serialize per thread to enforce capacity and synchronize root deletion.
          const [root] = await tx`
            select p.id from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
            where p.id = ${threadId} and p.deleted_at is null and p.moderation_status = 'published' for update of p
          `;
          const [parentLive] = await tx`
            select p.id from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
            where p.id = ${input.parentId} and p.deleted_at is null and p.moderation_status = 'published' for share of p
          `;
          if (!root || !parentLive) return { ok: false, code: "missing" } as const;
          const [capacity] = await tx`select count(*)::int as total from community_posts where thread_id = ${threadId}`;
          if (capacity.total >= COMMUNITY_REPLY_LIMIT) return { ok: false, code: "full" } as const;
        }
        const inserted = await tx`
          insert into community_posts (id, user_id, insight_id, parent_id, thread_id, depth, title, body, moderation_status)
          values (${input.id}, ${input.userId}, ${input.insightId}, ${input.parentId}, ${threadId}, ${depth},
            ${input.title}, ${input.body}, ${status})
          on conflict (id) do nothing returning id
        `;
        if (!inserted.length) return { ok: false, code: "duplicate" } as const;
        return { ok: true, threadId: threadId ?? input.id, status } as const;
      });
    },
    async report(postId: string, userId: string, reason: CommunityReportReason, note: string) {
      return sql.begin(async (tx) => {
        await tx`select pg_advisory_xact_lock(hashtextextended(${`community-user:${userId}`}, 0))`;
        const [profile] = await tx`select banned from community_profiles where user_id = ${userId}`;
        if (profile?.banned) return "banned" as const;
        const [target] = await tx`select coalesce(thread_id, id)::text as root_id from community_posts where id = ${postId}`;
        if (!target) return "missing" as const;
        const [root] = await tx`
          select p.id from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
          where p.id = ${String(target.root_id)} and p.deleted_at is null and p.moderation_status = 'published' for share of p
        `;
        if (!root) return "missing" as const;
        const [visible] = await tx`
          select p.id from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
          where p.id = ${postId} and p.deleted_at is null and p.moderation_status = 'published' for share of p
        `;
        if (!visible) return "missing" as const;
        const inserted = await tx`
          insert into community_reports (post_id, reporter_id, reason, note) values (${postId}, ${userId}, ${reason}, ${note})
          on conflict (reporter_id, post_id) do nothing returning id
        `;
        return inserted.length ? "reported" as const : "duplicate" as const;
      });
    },
    async setLike(id: string, userId: string, liked: boolean) {
      if (liked) {
        await sql`
          insert into community_likes (post_id, user_id)
          select p.id, ${userId} from community_posts p
          join users u on u.id = p.user_id and u.deleted_at is null
          join community_posts root on root.id = coalesce(p.thread_id, p.id) and root.deleted_at is null
            and root.moderation_status = 'published'
          join users root_author on root_author.id = root.user_id and root_author.deleted_at is null
          where p.id = ${id} and p.deleted_at is null and p.moderation_status = 'published'
          on conflict (post_id, user_id) do nothing
        `;
      } else {
        await sql`delete from community_likes where post_id = ${id} and user_id = ${userId}`;
      }
    },
    async remove(id: string, userId: string) {
      const rows = await sql`
        update community_posts
        set deleted_at = now(), body = '', title = case when title is null then null else 'Deleted' end
        where id = ${id} and user_id = ${userId} and deleted_at is null and moderation_status = 'published' returning id
      `;
      return rows.length > 0;
    },
  };
}
