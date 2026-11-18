import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { communityInsightsUpdatedAt, type CommunityInsight } from "@/data/community-insights";
import { communityDiscussionPath } from "@/lib/community-links";
import type { CommunityInsightActivity, CommunityPost } from "@/lib/community-store";
import { stateByCode } from "@/lib/states";
import { CommunityLike, CommunityShare } from "./CommunityPostForms";

function thumbnailFor(insight: CommunityInsight) {
  const topic = insight.keywords.join(" ").toLowerCase();
  if (/\b(id|identification|identity)\b/.test(topic)) return "identification";
  if (/journal|recordkeep/.test(topic)) return "journal";
  if (/handbook|manual|official (booklet|guide)/.test(topic)) return "manual";
  if (/timing|time management|deadline|pacing/.test(topic)) return "timing";
  if (/exam|practice|retake|quiz|study|flashcards/.test(topic)) return "practice";
  return "discussion";
}

function Thumbnail({ name, eager = false }: { name: string; eager?: boolean }) {
  return <Image src={`/images/community-insights/${name}.webp`} alt="" width={384} height={384} unoptimized loading={eager ? "eager" : "lazy"} />;
}

function reactions({ likes, comments }: { likes: number; comments: number }) {
  return `${likes} ${likes === 1 ? "like" : "likes"} · ${comments} ${comments === 1 ? "comment" : "comments"}`;
}

function engagement(activity?: { likes: number; comments: number }) {
  return activity ? activity.likes + activity.comments : 0;
}

const fullArcCount = 11;
const compactArcCount = 7;

function arcPosition(index: number, count: number) {
  const angle = count > 1 ? index * Math.PI / (count - 1) : Math.PI / 2;
  // The arc has a 43% radius on a track whose height is 57% of its width.
  return {
    x: `${50 - 43 * Math.cos(angle)}%`,
    y: `${(50 - 43 * Math.sin(angle)) / 0.57}%`,
    tilt: `${-22 * Math.sin(2 * angle)}deg`,
  };
}

function CommunityIntro() {
  return (
    <header className="home-section community-intro">
      <h1>Community Insights</h1>
      <p className="home-section-intro">
        Public discussions help us find difficult study topics. We check the rules in our questions and explanations against official sources.
      </p>
      {communityInsightsUpdatedAt && <p className="home-editorial-date">Manually reviewed · Last updated{" "}
        <time dateTime={communityInsightsUpdatedAt}>{communityInsightsUpdatedAt}</time>
      </p>}
      <a className="btn btn-ghost" href="#community-discussions">Share your experience</a>
    </header>
  );
}

export function CommunityInsightFeed({ insights, activity, memberPosts, signedIn, showHighlights }: {
  insights: readonly CommunityInsight[];
  activity: CommunityInsightActivity[] | null;
  memberPosts: CommunityPost[];
  signedIn: boolean;
  showHighlights: boolean;
}) {
  const metrics = new Map(activity?.map((item) => [item.id, item] as const));
  const reviewed = insights.map((insight) => ({ insight, activity: metrics.get(insight.id), image: thumbnailFor(insight) }))
    .sort((a, b) => engagement(b.activity) - engagement(a.activity) || b.insight.updatedAt.localeCompare(a.insight.updatedAt));
  const spotlight = showHighlights ? [
    ...reviewed.map(({ insight, activity, image }) => ({
      key: insight.id,
      title: insight.title,
      keyword: insight.keywords[0],
      href: `#insight-${insight.id}`,
      image,
      activity,
    })),
    ...memberPosts.map((post) => ({
      key: post.id,
      title: post.title || "Member discussion",
      keyword: "Community post",
      href: communityDiscussionPath(null, post.id),
      image: "discussion",
      activity: { likes: post.likes, comments: post.replies },
    })),
  ].sort((a, b) => engagement(b.activity) - engagement(a.activity)).slice(0, fullArcCount) : [];
  const compactCount = Math.min(spotlight.length, compactArcCount);

  return (
    <>
      {spotlight.length > 0 ? (
        <section className="community-spotlight" aria-labelledby="community-featured-heading">
          <CommunityIntro />
          <h2 className="visually-hidden" id="community-featured-heading">{activity ? "Most active in our community" : "Featured study insights"}</h2>
          <ul className="community-spotlight-track" role="list">
            {spotlight.map((item, index) => {
              const full = arcPosition(index, spotlight.length);
              const compact = index < compactCount ? arcPosition(index, compactCount) : full;
              return (
                <li key={item.key} style={{
                  "--arc-x": full.x, "--arc-y": full.y, "--arc-tilt": full.tilt,
                  "--arc-small-x": compact.x, "--arc-small-y": compact.y, "--arc-small-tilt": compact.tilt,
                } as CSSProperties}>
                  <Link className="community-spotlight-link" href={item.href} title={item.title}>
                    <Thumbnail name={item.image} eager={index < compactCount} />
                    <span className="community-spotlight-keyword">{item.keyword}</span>
                    <span className="visually-hidden">{item.title}</span>
                    {item.activity && <span className="community-meta visually-hidden">{reactions(item.activity)}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : <CommunityIntro />}
      {reviewed.length > 0 && <section className="community-editorial home-section" id="community-insights" aria-labelledby="community-editorial-heading">
        <h2 id="community-editorial-heading">{showHighlights ? `${reviewed.length} reviewed public posts` : "Reviewed public post"}</h2>
        <div className="community-editorial-list">
          {reviewed.map(({ insight, activity, image }) => (
            <article className="card community-insight-post" key={insight.id} id={`insight-${insight.id}`} aria-labelledby={`title-${insight.id}`}>
              <div className="community-insight-image"><Thumbnail name={image} /></div>
              <div className="community-insight-content">
                <p className="community-meta">{stateByCode(insight.state)?.name ?? insight.state} · {insight.platform}</p>
                <h3 id={`title-${insight.id}`}>{insight.title}</h3>
                <p>{insight.summary}</p>
                <p className="community-meta"><span className="visually-hidden">Topics:</span> {insight.keywords.join(" · ")}</p>
                <div className="community-source-links">
                  <a href={insight.postUrl} target="_blank" rel="noopener noreferrer">Original {insight.platform} post <span aria-hidden="true">↗</span></a>
                  <a href={insight.officialUrl} target="_blank" rel="noopener noreferrer">Official reference <span aria-hidden="true">↗</span></a>
                  <span className="community-meta">Last checked <time dateTime={insight.checkedAt}>{insight.checkedAt}</time></span>
                </div>
              </div>
              <div className="community-insight-actions">
                <Link className="btn btn-ghost" href={insight.studyHref}>{insight.studyLabel} <span aria-hidden="true">→</span></Link>
                <div className="community-reactions">
                  {signedIn && activity && <CommunityLike id={insight.id} target={insight.title} insight liked={activity.liked} likes={activity.likes} />}
                  {!signedIn && activity && <span className="community-meta">{activity.likes} {activity.likes === 1 ? "like" : "likes"}</span>}
                  <Link className="btn btn-ghost" href={communityDiscussionPath(insight.id)}>
                    {activity?.comments ? `${activity.comments} ${activity.comments === 1 ? "comment" : "comments"}` : "Comment"}
                    <span className="visually-hidden"> on {insight.title}</span>
                  </Link>
                  <CommunityShare href={communityDiscussionPath(insight.id)} label="Share" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>}
    </>
  );
}
