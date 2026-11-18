"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { CommunityInsight } from "@/data/community-insights";
import { communityDiscussionPath } from "@/lib/community-links";
import { paths } from "@/lib/paths";
import { stateByCode } from "@/lib/states";

function slideOffset(track: HTMLDivElement, index: number) {
  const slide = track.children[index];
  const first = track.firstElementChild;
  if (!slide || !first) return track.scrollLeft;
  const start = slide.getBoundingClientRect().left - first.getBoundingClientRect().left;
  return Math.min(start, track.scrollWidth - track.clientWidth);
}

export function HomeCommunity({
  insights,
  updatedAt,
  standalone = false,
}: {
  insights: readonly CommunityInsight[];
  updatedAt?: string;
  standalone?: boolean;
}) {
  const track = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const trackId = useId();
  const pending = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [status, setStatus] = useState("");
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let timer: number | undefined;
    let previous = 0;
    const update = (announce = false) => {
      const left = element.scrollLeft;
      const start = left <= 2;
      const end = left + element.clientWidth >= element.scrollWidth - 2;
      const target = pending.current;
      const atTarget = target !== null && Math.abs(slideOffset(element, target) - left) < 3;
      if (announce) pending.current = null;
      const next = atTarget ? target
        : start ? 0
        : end ? insights.length - 1
        : insights.reduce((closest, _, index) =>
            Math.abs(slideOffset(element, index) - left) < Math.abs(slideOffset(element, closest) - left)
              ? index : closest, 0);
      setEdges({ start, end });
      setCurrent(next);
      if (announce && next !== previous) setStatus(`Insight ${next + 1} of ${insights.length}`);
      previous = next;
    };
    const onScrollEnd = () => update(true);
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(onScrollEnd, 120);
    };
    const supportsScrollEnd = Reflect.has(element, "onscrollend");
    if (supportsScrollEnd) element.addEventListener("scrollend", onScrollEnd);
    else element.addEventListener("scroll", onScroll, { passive: true });
    update();
    const observer = new ResizeObserver(() => update());
    observer.observe(element);
    return () => {
      if (supportsScrollEnd) element.removeEventListener("scrollend", onScrollEnd);
      else element.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [insights.length]);

  function goTo(index: number) {
    const element = track.current;
    if (!element || index < 0 || index >= insights.length) return;
    const left = slideOffset(element, index);
    if (Math.abs(element.scrollLeft - left) < 2) {
      pending.current = null;
      setCurrent(index);
      setStatus(`Insight ${index + 1} of ${insights.length}`);
      return;
    }
    pending.current = index;
    element.scrollTo({ left });
  }

  function move(direction: -1 | 1) {
    const element = track.current;
    if (!element || (direction === -1 ? edges.start : edges.end)) return;
    const active = pending.current ?? current;
    const left = slideOffset(element, active);
    let next = active + direction;
    // Several visible end cards can share a clamped scroll position.
    while (next > 0 && next < insights.length - 1 && slideOffset(element, next) === left) next += direction;
    goTo(next);
  }

  const Heading = standalone ? "h1" : "h2";
  const CardHeading = standalone ? "h2" : "h3";
  return (
    <section
      className="home-section home-community"
      id="community-insights"
      aria-labelledby={headingId}
      aria-roledescription="carousel"
      data-reveal={standalone ? undefined : ""}
    >
      <div className="home-section-top">
        <Heading id={headingId}>Community Insights</Heading>
        {insights.length > 1 ? (
          <div
            className="home-carousel-controls"
            aria-label="Community card controls"
          >
            <button
              type="button"
              onClick={() => move(-1)}
              aria-disabled={edges.start}
              aria-label="Previous community insight"
              aria-controls={trackId}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              aria-disabled={edges.end}
              aria-label="Next community insight"
              aria-controls={trackId}
            >
              →
            </button>
          </div>
        ) : null}
      </div>
      <p className="home-section-intro">
        Public posts help us find difficult study topics. We verify the rules in
        our questions and explanations against official sources.
      </p>
      <div
        className="home-community-track"
        id={trackId}
        ref={track}
        data-count={insights.length}
        tabIndex={0}
        role="group"
        aria-label="Community study insights"
      >
        {insights.map((item, index) => (
          <article className="home-community-card" key={item.id} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${insights.length}: ${item.title}`}>
            <p className="home-state-tag">
              {stateByCode(item.state)?.name || item.state} · {item.platform}
            </p>
            <CardHeading>{item.title}</CardHeading>
            <p>{item.summary}</p>
            <div className="home-community-actions">
              <a href={item.postUrl} target="_blank" rel="noopener noreferrer">
                View original {item.platform} post <span aria-hidden="true">↗</span>
              </a>
              <p>
                Last checked <time dateTime={item.checkedAt}>{item.checkedAt}</time>
              </p>
              <a href={item.officialUrl} target="_blank" rel="noopener noreferrer">
                Official reference for this topic <span aria-hidden="true">↗</span>
              </a>
              <Link className="home-text-link" href={item.studyHref}>
                {item.studyLabel} <span aria-hidden="true">→</span>
              </Link>
              <Link href={communityDiscussionPath(item.id)}>
                Discussion<span className="visually-hidden"> about {item.title}</span> <span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
      <div className="filter-row home-community-markers" role="group" aria-label="Choose a community insight">
        {insights.map((item, index) => (
          <button
            className="chip"
            type="button"
            key={item.id}
            aria-controls={trackId}
            aria-label={`Show ${item.title}`}
            aria-current={index === current}
            onClick={() => goTo(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <p className="visually-hidden" role="status">{status}</p>
      {updatedAt ? <p className="home-editorial-date">
        Manually reviewed · Last updated{" "}
        <time dateTime={updatedAt}>{updatedAt}</time>
      </p> : null}
      {standalone ? null : <Link className="home-text-link" href={paths.community}>See all Community Insights <span aria-hidden="true">→</span></Link>}
    </section>
  );
}
