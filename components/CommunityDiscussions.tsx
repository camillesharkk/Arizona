import { randomUUID } from "node:crypto";
import Image from "next/image";
import Link from "next/link";
import { communityInsights } from "@/data/community-insights";
import { communityDiscussionPath } from "@/lib/community-links";
import { communityDisplayName, communityStore, COMMUNITY_MAX_DEPTH, type CommunityPost } from "@/lib/community-store";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";
import { getStore } from "@/lib/store";
import { CommunityComposer, CommunityLike, CommunityRemove, CommunityShare } from "./CommunityPostForms";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });

function Message({ post }: { post: CommunityPost }) {
  if (post.deleted) return <p className="community-meta">Deleted reply</p>;
  return (
    <>
      {post.title && <h3>{post.title}</h3>}
      <p className="community-meta">
        {post.author} · <time dateTime={post.date}>{dateFormat.format(new Date(post.date))} UTC</time>
      </p>
      <p className="community-message">{post.body}</p>
    </>
  );
}

function MessageActions({ post, signedIn }: { post: CommunityPost; signedIn: boolean }) {
  if (post.deleted) return null;
  return (
    <>
      {signedIn
        ? <CommunityLike id={post.id} likes={post.likes} liked={post.liked} target={post.title || `${post.author}’s message`} />
        : <span className="community-meta">{post.likes} {post.likes === 1 ? "like" : "likes"}</span>}
      {post.mine && <CommunityRemove id={post.id} root={post.depth === 0} />}
    </>
  );
}

function Replies({ parentId, threadId, insightId, grouped, signedIn }: {
  parentId: string;
  threadId: string;
  insightId: string | null;
  grouped: Map<string, CommunityPost[]>;
  signedIn: boolean;
}) {
  const children = grouped.get(parentId);
  if (!children?.length) return null;
  return (
    <ul className="community-replies" role="list">
      {children.map((post) => (
        <li key={post.id} id={`community-message-${post.id}`}>
          <Message post={post} />
          <div className="row">
            <MessageActions post={post} signedIn={signedIn} />
            {signedIn && !post.deleted && post.depth < COMMUNITY_MAX_DEPTH && (
              <Link className="btn btn-ghost" href={communityDiscussionPath(insightId, threadId, 0, post.id)}>
                Reply<span className="visually-hidden"> to {post.author}</span>
              </Link>
            )}
          </div>
          <Replies parentId={post.id} threadId={threadId} insightId={insightId} grouped={grouped} signedIn={signedIn} />
        </li>
      ))}
    </ul>
  );
}

export type CommunitySearchParams = Record<string, string | string[] | undefined>;
const idPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function CommunityDiscussions({ params }: { params: CommunitySearchParams }) {
  const insight = communityInsights.find((item) => item.id === params.insight);
  const insightId = insight?.id ?? null;
  const threadId = typeof params.discussion === "string" && idPattern.test(params.discussion) ? params.discussion : null;
  const page = typeof params.page === "string" && /^\d{1,4}$/.test(params.page) ? Math.max(0, Number(params.page) - 1) : 0;
  const heading = insight ? `Discussion: ${insight.title}` : "Community discussions";
  const session = await getSession();
  const user = session ? await (await getStore()).getUserById(session.id).catch(() => null) : null;
  const signIn = `${paths.login}?next=${encodeURIComponent(communityDiscussionPath(insightId, threadId, page))}`;
  let posts: CommunityPost[] = [];
  let allReplies: CommunityPost[] = [];
  let more = false;
  let insightReaction: { liked: boolean; likes: number } | null = null;
  let unavailable = !process.env.DATABASE_URL;
  if (!unavailable) {
    try {
      const store = communityStore();
      if (insightId) insightReaction = await store.insightLikes(insightId, session?.id ?? null);
      if (threadId) {
        const thread = await store.thread(insightId, threadId, session?.id ?? null);
        if (thread) {
          posts = [thread.post];
          allReplies = thread.replies;
        }
      } else {
        ({ posts, more } = await store.list(insightId, session?.id ?? null, page));
      }
    } catch {
      // Leave the editorial carousel available during a database interruption.
      unavailable = true;
    }
  }
  const grouped = new Map<string, CommunityPost[]>();
  for (const reply of allReplies) {
    if (!reply.parentId) continue;
    const siblings = grouped.get(reply.parentId) ?? [];
    siblings.push(reply);
    grouped.set(reply.parentId, siblings);
  }
  const replyTarget = allReplies.find((post) => post.id === params.reply && !post.deleted && post.depth < COMMUNITY_MAX_DEPTH);
  const author = communityDisplayName(user?.name);

  return (
    <section className="community-discussions home-section" id="community-discussions" aria-labelledby="community-discussions-heading">
      <div className="community-discussions-header">
        <Image src="/images/glass-demo/community-chat.png" alt="" width={72} height={48} sizes="72px" />
        <h2 id="community-discussions-heading">{heading}</h2>
      </div>
      {insight && <p className="community-meta">Comments about this reviewed insight are written by members.</p>}
      {insight && (
        <div className="row community-navigation">
          {user && insightReaction && <CommunityLike id={insight.id} target={insight.title} insight {...insightReaction} />}
          {!user && insightReaction && <span className="community-meta">{insightReaction.likes} {insightReaction.likes === 1 ? "like" : "likes"} for this insight</span>}
          <CommunityShare href={communityDiscussionPath(insight.id)} />
        </div>
      )}
      {(threadId || insight) && (
        <div className="row community-navigation">
          {threadId && <Link href={communityDiscussionPath(insightId)}>Back to {insight ? "insight comments" : "discussions"}</Link>}
          {insight && <Link href={communityDiscussionPath()}>All community discussions</Link>}
        </div>
      )}
      {unavailable ? <p className="card">Discussions are temporarily unavailable. You can still browse the study insights above.</p> : (
        <>
          {!user && (
            <p className="community-meta"><Link href={signIn}>Sign in</Link> to post, reply or like a message.</p>
          )}
          {user && !threadId && (
            <div className="card">
              <CommunityComposer id={randomUUID()} insightId={insightId} parentId={null} author={author}
                label={insight ? "Post comment" : "Start a discussion"} />
            </div>
          )}
          {!posts.length && (
            <p className="community-empty">{threadId ? "This discussion is unavailable." : page ? "There are no more posts." : "No posts yet. Start the conversation."}</p>
          )}
          {posts.map((post) => (
            <article key={post.id} className="card community-post" id={`community-message-${post.id}`}>
              <Message post={post} />
              <div className="row">
                <MessageActions post={post} signedIn={Boolean(user)} />
                {!threadId && (
                  <Link className="btn btn-ghost" href={communityDiscussionPath(insightId, post.id)}>
                    {post.replies} {post.replies === 1 ? "reply" : "replies"}
                    <span className="visually-hidden"> to {post.title || `${post.author}’s comment`}</span>
                  </Link>
                )}
              </div>
              {threadId && (
                <>
                  <Replies parentId={post.id} threadId={threadId} insightId={insightId} grouped={grouped} signedIn={Boolean(user)} />
                  {user && <div id="reply-composer">
                    <CommunityComposer key={replyTarget?.id || post.id} id={randomUUID()} insightId={insightId}
                      parentId={replyTarget?.id ?? post.id} author={author}
                      label={replyTarget ? `Reply to ${replyTarget.author}` : "Post reply"} />
                  </div>}
                </>
              )}
            </article>
          ))}
          {!threadId && (page > 0 || more) && (
            <nav className="row community-navigation" aria-label="Discussion pages">
              {page > 0 && <Link href={communityDiscussionPath(insightId, null, page - 1)}>Previous page</Link>}
              {more && <Link href={communityDiscussionPath(insightId, null, page + 1)}>Next page</Link>}
            </nav>
          )}
        </>
      )}
    </section>
  );
}
