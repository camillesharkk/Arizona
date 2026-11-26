"use client";

import { useState } from "react";
import Link from "next/link";
import type { CommunityInsight } from "@/data/community-insights";
import { communityDiscussionPath } from "@/lib/community-links";
import { paths } from "@/lib/paths";

type Insight = Omit<CommunityInsight, "keywords" | "updatedAt"> & { stateName: string };

export function EditorialHomeCommunity({ insights, updatedAt }: { insights: Insight[]; updatedAt?: string }) {
  const [state, setState] = useState("");
  const visible = state ? insights.filter(item => item.state === state) : insights.slice(0, 3);
  return (
    <section className="editorial-wrap editorial-section" id="community" aria-labelledby="community-heading">
      <div className="editorial-section-head">
        <div>
          <p className="editorial-kicker"><span />Community Insights</p>
          <h2 id="community-heading">Real questions.<br /><span className="editorial-underline">Better things to study.</span></h2>
        </div>
        <p>See what notary candidates ask about, then use the official references and guided practice to study the rule.</p>
      </div>
      <div className="insight-filters" role="group" aria-label="Filter insights by state">
        <button type="button" aria-pressed={!state} onClick={() => setState("")}>All insights</button>
        {insights.map(item => (
          <button type="button" key={item.state} aria-pressed={state === item.state} onClick={() => setState(item.state)}>{item.stateName}</button>
        ))}
      </div>
      <p className="visually-hidden" role="status">{visible.length} {visible.length === 1 ? "insight" : "insights"} shown</p>
      <div className="editorial-insight-grid">
        {visible.map((item, index) => (
          <article className={"editorial-card editorial-insight" + (index === 0 ? " editorial-dark" : "")} key={item.id}>
            <p className="insight-meta">{item.stateName} · {item.platform} discussion</p>
            <h3><Link href={communityDiscussionPath(item.id)}>{item.title}</Link></h3>
            <p>{item.summary}</p>
            <div className="insight-links">
              <Link href={item.studyHref}>{item.studyLabel} →</Link>
              <Link href={communityDiscussionPath(item.id)}>Site discussion →</Link>
              <a href={item.postUrl}>Original discussion ↗</a>
              <a href={item.officialUrl}>Official reference ↗</a>
            </div>
            <small>Checked <time dateTime={item.checkedAt}>{item.checkedAt}</time></small>
          </article>
        ))}
      </div>
      <div className="editorial-community-foot">
        <p>Discussion suggests topics to study. Explanations follow official sources.{updatedAt && <> Editorial update <time dateTime={updatedAt}>{updatedAt}</time>.</>}</p>
        <Link href={paths.community}>Explore Community Insights →</Link>
      </div>
    </section>
  );
}
