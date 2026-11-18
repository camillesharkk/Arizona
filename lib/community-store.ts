import "server-only";
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

export function communityDisplayName(name: string | null | undefined) {
  const cleaned = name?.normalize("NFKC").replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, "").trim();
  return cleaned && !cleaned.includes("@") ? cleaned.slice(0, 64) : "Community member";
}

function publicPost(row: Row) {
  return {
    id: row.id,
    parentId: row.parent_id,
    title: row.hidden ? null : row.title,
    body: row.hidden ? "" : row.body,
    depth: row.depth,
    date: row.created_at.toISOString(),
    deleted: row.hidden,
    author: row.hidden ? null : communityDisplayName(row.author),
    mine: !row.hidden && row.mine,
    liked: !row.hidden && row.liked,
    likes: row.hidden ? 0 : row.like_count,
    replies: row.reply_count,
  };
}

export type CommunityPost = ReturnType<typeof publicPost>;

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
    u.name as author, coalesce(p.user_id = ${viewer}, false) as mine,
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
      where reply.thread_id = p.id and reply.deleted_at is null
    ) r on true
  `;

  return {
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
        ${counts(viewer)}
        where p.parent_id is null and p.insight_id is not distinct from ${insightId}
          and p.deleted_at is null and u.deleted_at is null
        order by l.like_count + r.reply_count desc, p.created_at desc, p.id desc
        limit ${COMMUNITY_PAGE_SIZE + 1} offset ${page * COMMUNITY_PAGE_SIZE}
      `;
      return { posts: rows.slice(0, COMMUNITY_PAGE_SIZE).map(publicPost), more: rows.length > COMMUNITY_PAGE_SIZE };
    },
    async thread(insightId: string | null, id: string, viewer: string | null) {
      const rows = await sql<Row[]>`
        select ${columns(viewer)}
        from community_posts p join users u on u.id = p.user_id
        ${counts(viewer)}
        where (p.id = ${id} or p.thread_id = ${id})
          and exists (
            select 1 from community_posts root join users root_author on root_author.id = root.user_id
            where root.id = ${id} and root.parent_id is null
              and root.insight_id is not distinct from ${insightId}
              and root.deleted_at is null and root_author.deleted_at is null
          )
        order by p.depth = 0 desc, p.created_at asc, p.id asc
      `;
      return rows.length ? { post: publicPost(rows[0]), replies: rows.slice(1).map(publicPost) } : null;
    },
    async publish(input: NewPost) {
      return sql.begin(async (tx) => {
        // Serialize author quota checks across pooled Vercel instances.
        await tx`select pg_advisory_xact_lock(hashtextextended(${`community-user:${input.userId}`}, 0))`;
        const [existing] = await tx`
          select coalesce(thread_id, id)::text as id from community_posts
          where id = ${input.id} and user_id = ${input.userId} and deleted_at is null
        `;
        if (existing) return { ok: true, threadId: String(existing.id) } as const;
        const [usage] = await tx`
          select count(*)::int as day, count(*) filter (where created_at >= now() - interval '1 minute')::int as minute
          from community_posts where user_id = ${input.userId} and created_at >= now() - interval '1 day'
        `;
        if (usage.day >= 30 || usage.minute >= 3) return { ok: false, code: "rate" } as const;
        let threadId: string | null = null;
        let depth = 0;
        if (input.parentId) {
          const [parent] = await tx`
            select coalesce(p.thread_id, p.id)::text as id, p.depth
            from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
            where p.id = ${input.parentId} and p.deleted_at is null
              and p.insight_id is not distinct from ${input.insightId}
          `;
          if (!parent) return { ok: false, code: "missing" } as const;
          threadId = String(parent.id);
          depth = Number(parent.depth) + 1;
          if (depth > COMMUNITY_MAX_DEPTH) return { ok: false, code: "depth" } as const;
          // Serialize per thread to enforce capacity and synchronize root deletion.
          const [root] = await tx`
            select p.id from community_posts p join users u on u.id = p.user_id and u.deleted_at is null
            where p.id = ${threadId} and p.deleted_at is null for update of p
          `;
          const [parentLive] = await tx`select id from community_posts where id = ${input.parentId} and deleted_at is null for share`;
          if (!root || !parentLive) return { ok: false, code: "missing" } as const;
          const [capacity] = await tx`select count(*)::int as total from community_posts where thread_id = ${threadId}`;
          if (capacity.total >= COMMUNITY_REPLY_LIMIT) return { ok: false, code: "full" } as const;
        }
        await tx`
          insert into community_posts (id, user_id, insight_id, parent_id, thread_id, depth, title, body)
          values (${input.id}, ${input.userId}, ${input.insightId}, ${input.parentId}, ${threadId}, ${depth}, ${input.title}, ${input.body})
        `;
        return { ok: true, threadId: threadId ?? input.id } as const;
      });
    },
    async setLike(id: string, userId: string, liked: boolean) {
      if (liked) {
        await sql`
          insert into community_likes (post_id, user_id)
          select p.id, ${userId} from community_posts p
          join users u on u.id = p.user_id and u.deleted_at is null
          join community_posts root on root.id = coalesce(p.thread_id, p.id) and root.deleted_at is null
          join users root_author on root_author.id = root.user_id and root_author.deleted_at is null
          where p.id = ${id} and p.deleted_at is null
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
        where id = ${id} and user_id = ${userId} and deleted_at is null returning id
      `;
      return rows.length > 0;
    },
  };
}
