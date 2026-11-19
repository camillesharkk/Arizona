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
  scenario: string | null;
  answer: string | null;
  keyword: string | null;
  nextReviewAt: string | null;
  wrongCount: number;
  previousWrongCount: number;
  saved?: boolean;
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

const reviewOffsets = [-3, -2, -1, 0, 1, 2, 3];
const reviewPlaceholders = ["review-placeholder", "identification", "journal", "calendar", "seal"];

export function ScheduledReviewGallery({ items, stateCode }: { items: ScheduledReviewItem[]; stateCode: StateCode }) {
  const [selection, setSelection] = useState<{ id: string; direction: number } | null>(null);
  const heading = useId();
  const promptRef = useRef<HTMLHeadingElement>(null);
  const focusAfterSelection = useRef(false);
  const index = Math.max(0, items.findIndex(item => item.questionId === selection?.id));
  const item = items[index];
  const stateName = stateByCode(stateCode)?.name ?? stateCode;

  useEffect(() => {
    if (!focusAfterSelection.current) return;
    focusAfterSelection.current = false;
    promptRef.current?.focus({ preventScroll: true });
  }, [selection]);

  function showQuestion(position: number, direction = Math.sign(position - index)) {
    const next = items[position];
    if (next && position !== index) {
      setSelection({ id: next.questionId, direction });
    }
  }

  function reviewArc(face: "front" | "back") {
    const orbitLength = Math.max(items.length, reviewOffsets.length);
    return (
      <div className={`daily-review-arc daily-review-arc--${face}`}>
        {reviewOffsets.map((offset) => {
          const orbitPosition = index + offset;
          const position = (orbitPosition + orbitLength) % orbitLength;
          const preview = items[position];
          // The tile returning at the bottom enters as a new element instead of crossing the entire arc.
          const tileKey = `${preview?.questionId ?? position}-${Math.floor(orbitPosition / orbitLength)}`;
          const style = {
            "--review-step": offset,
            "--review-distance": Math.abs(offset),
            "--review-angle": `${offset * 20}deg`,
          } as CSSProperties;

          return preview ? (
            <button type="button" className="daily-review-thumb" key={tileKey} style={style}
              data-review-slot={offset} data-review-item={position + 1}
              aria-hidden={offset === 0 ? true : undefined} disabled={offset === 0}
              aria-label={`Show review item ${position + 1} of ${items.length} from ${face === "front" ? "question" : "answer"} cards`}
              onClick={() => {
                focusAfterSelection.current = true;
                showQuestion(position, Math.sign(offset));
              }}>
              <span className="daily-review-thumb-number">{position + 1}</span>
              <span className="daily-review-keyword">{preview.keyword ?? "Unavailable"}</span>
            </button>
          ) : (
            <span className="daily-review-thumb is-decorative" key={tileKey}
              style={style} data-review-slot={offset} aria-hidden="true">
              <img src={`${artworkRoot}${reviewPlaceholders[position % reviewPlaceholders.length]}.webp`} width={280} height={280}
                alt="" loading="lazy" decoding="async" />
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <section className="card daily-gallery daily-scheduled-gallery" aria-labelledby={heading}>
      <header className="daily-scheduled-heading">
        <h2 id={heading}>Scheduled review</h2>
        <p className="daily-gallery-description">Review history for {stateName}, including mastered questions.</p>
      </header>
      <div className="daily-review-gallery" data-review-moving={selection ? "" : undefined}
        style={{ "--review-direction": selection?.direction ?? 0 } as CSSProperties}>
        <div className="daily-review-main">
          {item ? (
            <>
              <div className="daily-review-pair">
                <article className="daily-review-feature daily-review-feature--front" aria-label="Question" key={`front-${item.questionId}`}>
                  <span className="daily-review-face-label">Question</span>
                  <div className="daily-review-content">
                    {item.scenario ? <p className="daily-review-scenario">{item.scenario}</p> : null}
                    <h3 ref={promptRef} tabIndex={-1}>{item.prompt ?? "Question unavailable for review"}</h3>
                  </div>
                  <div className="daily-review-status">
                    <span className="daily-review-tag">
                      {item.wrongCount > 0 ? (
                        item.wrongCount === 1 ? "Missed once" : `Missed ${item.wrongCount} times`
                      ) : item.previousWrongCount > 0 ? "Missed an earlier version" : "Added"}
                    </span>
                    {item.mastered ? <span className="daily-review-tag is-schedule">Mastered</span> : item.prompt && item.nextReviewAt ? (
                      <span className="daily-review-tag is-schedule">
                        {item.due ? "Due" : "Next"}{" "}
                        <time dateTime={item.nextReviewAt}>{new Date(item.nextReviewAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time>
                      </span>
                    ) : null}
                  </div>
                </article>
                <article className="daily-review-feature daily-review-feature--back" aria-label="Answer" key={`back-${item.questionId}`}>
                  <span className="daily-review-face-label">Answer</span>
                  <div className="daily-review-content">
                    <p className="daily-review-answer">{item.answer ?? "The answer is currently unavailable."}</p>
                  </div>
                </article>
              </div>
              <span className="visually-hidden" role="status">Review item {index + 1} of {items.length}</span>
            </>
          ) : (
            <article className="daily-review-feature daily-review-empty">
              <h3>No reviews scheduled yet</h3>
              <p>Questions you miss or add to Daily Study will appear here when they’re ready to track.</p>
            </article>
          )}
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
        </div>
        {reviewArc("front")}
        {reviewArc("back")}
      </div>
    </section>
  );
}
