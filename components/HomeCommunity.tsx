"use client";

import { useEffect, useRef, useState } from "react";
import type { CommunityInsight } from "@/data/community-insights";
import { stateByCode } from "@/lib/states";

export function HomeCommunity({
  insights,
}: {
  insights: readonly CommunityInsight[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    function updateEdges() {
      if (!element) return;
      setEdges({
        start: element.scrollLeft <= 2,
        end:
          element.scrollLeft + element.clientWidth >= element.scrollWidth - 2,
      });
    }
    updateEdges();
    element.addEventListener("scroll", updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(element);
    return () => {
      element.removeEventListener("scroll", updateEdges);
      observer.disconnect();
    };
  }, []);

  function move(direction: number) {
    const element = track.current;
    const first = element?.firstElementChild as HTMLElement | null;
    if (!element || !first) return;
    const step =
      first.offsetWidth + parseFloat(getComputedStyle(element).columnGap);
    const position = Math.round(element.scrollLeft / step) + direction;
    element.scrollTo({
      left: Math.max(
        0,
        Math.min(element.scrollWidth - element.clientWidth, position * step),
      ),
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <section
      className="home-section home-community"
      aria-labelledby="home-community-heading"
      data-reveal
    >
      <div className="home-section-top">
        <div>
          <p className="home-eyebrow">FROM THE NOTARY COMMUNITY</p>
          <h2 id="home-community-heading">Community Insights</h2>
        </div>
        {insights.length > 1 ? (
          <div
            className="home-carousel-controls"
            aria-label="Community card controls"
          >
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={edges.start}
              aria-label="Previous community insight"
              aria-controls="home-community-track"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => move(1)}
              disabled={edges.end}
              aria-label="Next community insight"
              aria-controls="home-community-track"
            >
              →
            </button>
          </div>
        ) : null}
      </div>
      <p className="home-section-intro">
        Public discussions inspire study topics. Official sources support the
        rules.
      </p>
      <div
        className="home-community-track"
        id="home-community-track"
        ref={track}
        data-count={insights.length}
        tabIndex={0}
        role="region"
        aria-label="Community study insights"
      >
        {insights.map((item) => (
          <article className="home-community-card" key={item.id}>
            <p className="home-state-tag">
              {stateByCode(item.state)?.name || item.state} · {item.state}
            </p>
            <h3>{item.title}</h3>
            <p>{item.summary}</p>
            <div className="home-community-actions">
              <a href={item.postUrl} target="_blank" rel="noopener noreferrer">
                Read the public discussion <span aria-hidden="true">↗</span>
              </a>
              <p>
                Reviewed <time dateTime={item.checkedAt}>{item.checkedAt}</time>
              </p>
              <a className="home-text-link" href={item.studyHref}>
                {item.studyLabel} <span aria-hidden="true">→</span>
              </a>
            </div>
          </article>
        ))}
      </div>
      <p className="home-editorial-date">
        Manually reviewed · Last updated{" "}
        <time
          dateTime={insights
            .map((item) => item.checkedAt)
            .sort()
            .at(-1)}
        >
          {insights
            .map((item) => item.checkedAt)
            .sort()
            .at(-1)}
        </time>
      </p>
    </section>
  );
}
