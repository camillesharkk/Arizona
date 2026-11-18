"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { switchStateHref } from "@/lib/ca-site";
import { stateByCode } from "@/lib/states";
import type { StateCode } from "@/lib/types";

export type MissedState = { state: StateCode; count: number; available: boolean };

export type ScheduledReviewItem = {
  questionId: string;
  prompt: string | null;
  nextReviewAt: string | null;
  wrongCount: number;
  previousWrongCount: number;
  mastered: boolean;
  due: boolean;
};

const stateArtwork: Partial<Record<StateCode, string>> = {
  AZ: "az", CA: "ca", HI: "hi", NY: "ny", PA: "pa", CO: "co", NE: "ne", WY: "wy",
  ME: "northeast", CT: "northeast", NJ: "northeast", RI: "northeast", VT: "northeast",
  AR: "south", LA: "south", MD: "south", NC: "south", TX: "south",
  IL: "midwest", IN: "midwest", MO: "midwest", OH: "midwest", WI: "midwest",
};

const starterStates: StateCode[] = ["AZ", "CA", "NY", "CO"];
const reviewArtwork = ["journal", "identification", "seal", "calendar"] as const;
const artworkRoot = "/images/daily-study/";

export function MissedStateGallery({ total, states, stateCode, dailyHref }: {
  total: number;
  states: MissedState[];
  stateCode: StateCode;
  dailyHref: string;
}) {
  const rail = useRef<HTMLUListElement>(null);
  const leadTile = useRef<HTMLLIElement>(null);
  const visible = [...states].sort((a, b) => b.count - a.count);
  if (visible.length <= 1) {
    const present = new Set(visible.map(item => item.state));
    for (const state of new Set([stateCode, ...starterStates])) {
      if (!present.has(state) && visible.length < 4 && stateByCode(state)?.status === "available") {
        visible.push({ state, count: 0, available: true });
      }
    }
  }
  const largest = visible[0]?.count ?? 0;
  const leadState = largest ? visible[0].state : null;
  const compact = visible.filter(({ count }) => largest > 0 && count <= largest * 0.48);
  const prominent = visible.filter(({ count }) => !largest || count > largest * 0.48);
  // Keep small columns in pairs around the full-height tiles.
  const leftCount = Math.min(4, 2 * Math.floor((compact.length + 1) / 4));
  const arranged = [...compact.slice(0, leftCount), ...prominent, ...compact.slice(leftCount)];

  useEffect(() => {
    const track = rail.current;
    const tile = leadTile.current;
    if (!track || !tile || track.scrollWidth <= track.clientWidth) return;
    track.scrollLeft = tile.offsetLeft + (tile.offsetWidth - track.clientWidth) / 2;
  }, [leadState]);

  return (
    <section className="card daily-gallery daily-missed-gallery" aria-labelledby="daily-missed-heading">
      <header className="daily-missed-heading">
        <h2 id="daily-missed-heading">Missed questions across the site</h2>
        <p className="daily-gallery-description"><strong>{total}</strong> {total === 1 ? "question" : "questions"} missed on your account.</p>
        {total === 0 ? <p className="notice">Questions you miss will appear here.</p> : null}
      </header>
      <ul ref={rail} className="daily-state-rail" aria-label="Missed questions by state" role="list" tabIndex={0}>
        {arranged.map(({ state, count, available }) => {
          const name = stateByCode(state)?.name ?? state;
          const size = largest ? Math.pow(count / largest, 1.4) : 0.25;
          const label = count ? `${name} (${count})` : `${name} (0 missed)`;
          const contents = (
            <>
              <img src={`${artworkRoot}${stateArtwork[state] ?? "west"}.webp`} alt="" width={320} height={320} loading="lazy" decoding="async" />
              <span className="daily-state-caption">
                <span>{name}</span>
                <strong>{count}{count === 0 ? " missed" : ""}</strong>
              </span>
            </>
          );
          return (
            <li ref={state === leadState ? leadTile : undefined}
              className={largest > 0 && count <= largest * 0.48 ? "daily-state-compact" : undefined}
              style={{ "--daily-state-scale": size } as CSSProperties} key={state}>
              {available && state !== stateCode ? (
                <Link className="daily-state-tile" href={switchStateHref(dailyHref, state)} aria-label={label}>{contents}</Link>
              ) : (
                <span className="daily-state-tile" aria-current={state === stateCode ? "true" : undefined}>{contents}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function ScheduledReviewGallery({ items, stateCode }: { items: ScheduledReviewItem[]; stateCode: StateCode }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const heading = useId();
  const promptRef = useRef<HTMLHeadingElement>(null);
  const index = Math.max(0, items.findIndex(item => item.questionId === selectedId));
  const item = items[index];
  const stateName = stateByCode(stateCode)?.name ?? stateCode;

  function showQuestion(position: number) {
    const next = items[position];
    if (next) setSelectedId(next.questionId);
  }

  function thumbnailRail(offsets: number[], side: "before" | "after") {
    return (
      <div className={`daily-review-thumbs daily-review-thumbs-${side}`}>
        {offsets.map((offset, slot) => {
          const position = index + offset;
          const preview = items[position];
          const artIndex = preview ? position % reviewArtwork.length : (slot + (side === "before" ? 0 : 2)) % reviewArtwork.length;
          const picture = <img src={`${artworkRoot}${reviewArtwork[artIndex]}.webp`} alt="" width={192} height={192} loading="lazy" decoding="async" />;
          return preview ? (
            <button className="daily-review-thumb" type="button" key={offset}
              aria-label={`Show review item ${position + 1} of ${items.length}`}
              onClick={() => {
                showQuestion(position);
                promptRef.current?.focus({ preventScroll: true });
              }}>
              {picture}<span>{position + 1}</span>
            </button>
          ) : (
            <span className="daily-review-thumb is-decorative" aria-hidden="true" key={offset}>{picture}</span>
          );
        })}
      </div>
    );
  }

  return (
    <section className="card daily-gallery" aria-labelledby={heading}>
      <h2 id={heading}>Scheduled review</h2>
      <p className="daily-gallery-description">Review history for {stateName}, including mastered questions.</p>
      <div className="daily-review-gallery">
        {thumbnailRail([-3, -2, -1], "before")}
        <article className="daily-review-feature">
          <div className="daily-review-content" aria-live="polite" aria-atomic="true">
            {item ? (
              <>
                <div className="daily-review-status">
                  {item.wrongCount > 0 ? (
                    <span className="daily-review-tag">{item.wrongCount === 1 ? "Missed once" : `Missed ${item.wrongCount} times`}</span>
                  ) : (
                    <span className="daily-review-tag">{item.previousWrongCount > 0 ? "Missed an earlier version" : "Added"}</span>
                  )}
                  {item.mastered ? <span className="daily-review-tag is-schedule">Mastered</span> : item.prompt && item.nextReviewAt ? (
                    <span className="daily-review-tag is-schedule">
                      {item.due ? "Due" : "Next"}{" "}
                      <time dateTime={item.nextReviewAt}>{new Date(item.nextReviewAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
                    </span>
                  ) : null}
                </div>
                <h3 ref={promptRef} tabIndex={-1}>{item.prompt ?? "Question unavailable for review"}</h3>
              </>
            ) : (
              <>
                <h3>No reviews scheduled yet</h3>
                <p>Questions you miss or add to Daily Study will appear here when they’re ready to track.</p>
              </>
            )}
          </div>
          {items.length > 1 ? (
            <div className="daily-review-navigation">
              <button className="btn btn-ghost" type="button" aria-label="Previous review item" aria-disabled={index === 0}
                onClick={() => showQuestion(index - 1)}>Previous</button>
              <select aria-label="Review item" value={index} onChange={(event) => showQuestion(Number(event.target.value))}>
                {items.map((entry, position) => <option value={position} key={entry.questionId}>{position + 1} / {items.length}</option>)}
              </select>
              <button className="btn btn-primary" type="button" aria-label="Next review item" aria-disabled={index === items.length - 1}
                onClick={() => showQuestion(index + 1)}>Next</button>
            </div>
          ) : null}
        </article>
        {thumbnailRail([1, 2, 3], "after")}
      </div>
    </section>
  );
}
