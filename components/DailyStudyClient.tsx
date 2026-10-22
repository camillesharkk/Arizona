"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { publishedQuestions } from "@/data/questions";
import { ExamRunner } from "@/components/ExamRunner";
import { StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { paths } from "@/lib/paths";

type Card = StudyCardView & { id: string };
type View = {
  dayNumber: number;
  done: number;
  goal: number;
  introduced: number;
  reviewed: number;
  total: number;
  targetDate: string;
  projectedDate: string | null;
  projectReason: string | null;
  entitlementExpiresAt: string | null;
  freeOnly: boolean;
  reason: string | null;
  practiceCards: Card[];
  reviewCards: Card[];
  practiceQuestionIds: string[];
  reviewQuestionIds: string[];
  yesterdayWaiting: { id: string; nextReviewAt: string }[];
  unmappedQuestionIds: string[];
  nextReviewAt: string | null;
  taskStatus: { key: string; kind: string; status: string }[];
};

export function DailyStudyClient() {
  const [view, setView] = useState<View | null>(null);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState<"practice" | "review" | null>(null);
  const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix", []);
  const visibleStart = useRef<number | null>(null);

  async function load() {
    const data = await fetch(`/api/daily-study/?timeZone=${encodeURIComponent(zone)}`).then((response) => response.json());
    if (data.error) {
      window.location.href = `${paths.login}?next=${encodeURIComponent(paths.daily)}`;
      return;
    }
    setView(data);
  }

  useEffect(() => {
    load();
    function onVisibility() {
      if (document.visibilityState === "hidden") flushVisible();
      else visibleStart.current = Date.now();
    }
    visibleStart.current = Date.now();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      flushVisible();
    };
    // The timer is tied to this page, not to each refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zone]);

  function flushVisible() {
    if (visibleStart.current == null) return;
    const seconds = Math.round((Date.now() - visibleStart.current) / 1000);
    visibleStart.current = document.visibilityState === "visible" ? Date.now() : null;
    if (seconds < 5) return;
    fetch("/api/daily-study/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "visible", seconds: Math.min(seconds, 120), attemptId: crypto.randomUUID() }),
    }).catch(() => undefined);
  }

  async function mark(cardId: string, action: "studied" | "remembered" | "need-review") {
    const data = await fetch("/api/daily-study/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, cardId, attemptId: crypto.randomUUID() }),
    }).then((response) => response.json());
    if (!data.error) setView(data);
    setFlipped(null);
  }

  if (!view) return <p className="notice">Loading today’s plan…</p>;
  const pending = (kind: string) => new Set(view.taskStatus.filter((task) => task.kind === kind && task.status === "pending").map((task) => task.key));
  const practiceCards = view.practiceCards.filter((card) => pending("new-card").has(`card:${card.id}`));
  const reviewCards = view.reviewCards.filter((card) => pending("review-card").has(`card:${card.id}`));
  const practiceCard = practiceCards[Math.min(practiceIndex, Math.max(practiceCards.length - 1, 0))];
  const reviewCard = reviewCards[Math.min(reviewIndex, Math.max(reviewCards.length - 1, 0))];
  const practiceQuestions = publishedQuestions().filter((question) => pending("new-question").has(`question:${question.question_id}`));
  const reviewQuestions = publishedQuestions().filter((question) => pending("review-question").has(`question:${question.question_id}`));
  const entitlement = view.entitlementExpiresAt ? view.entitlementExpiresAt.slice(0, 10) : null;
  const progress = view.total ? Math.round(((view.introduced + view.reviewed) / (view.total * 2)) * 100) : 0;

  return (
    <>
      <div className="daily-meta">
        <span>Day {view.dayNumber}</span>
        <span>{view.done} / {view.goal} today</span>
        <span>{progress}% of this plan</span>
        <span>Target {view.targetDate}</span>
        <Link href={`${paths.account}#study-settings`}>Study Settings</Link>
      </div>
      {view.freeOnly ? <p className="notice">This plan covers the free set. It is not the full Pro bank.</p> : null}
      {entitlement && entitlement < view.targetDate ? <p className="notice">Pro access ends {entitlement}. The study target stays {view.targetDate}.</p> : null}
      {view.projectedDate && view.projectedDate > view.targetDate ? <p className="notice">At the current pace the plan finishes {view.projectedDate}.</p> : null}
      {view.projectReason ? <p className="notice">{view.projectReason}</p> : null}
      {view.reason ? <p className="notice">{view.reason}</p> : null}
      {view.unmappedQuestionIds.length ? <p className="notice">{view.unmappedQuestionIds.length} missed questions have no knowledge card yet.</p> : null}
      <div className="daily-grid">
        <section className="card" aria-label="Today’s Practice">
          <h2>Today’s Practice</h2>
          {practiceCard ? (
            <>
              <div className="study-face" onClick={() => setFlipped(flipped === "practice" ? null : "practice")} role="button" tabIndex={0}>
                <StudyCardBody card={practiceCard} flipped={flipped === "practice"} />
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={() => mark(practiceCard.id, "studied")}>Mark studied</button>
                <button className="btn btn-ghost" type="button" disabled={practiceIndex === 0} onClick={() => { setPracticeIndex((index) => index - 1); setFlipped(null); }}>Previous</button>
                <button className="btn btn-ghost" type="button" disabled={practiceIndex >= practiceCards.length - 1} onClick={() => { setPracticeIndex((index) => index + 1); setFlipped(null); }}>Next</button>
              </div>
            </>
          ) : <p>No new cards left in today’s goal.</p>}
          {practiceQuestions.length ? <ExamRunner mode="practice" practice preset={practiceQuestions} onRecorded={load} /> : null}
        </section>
        <section className="card" aria-label="Today’s Review">
          <h2>Today’s Review</h2>
          {view.yesterdayWaiting.length ? (
            <p className="notice">
              {view.yesterdayWaiting.length} missed {view.yesterdayWaiting.length === 1 ? "question is" : "questions are"} not due until {new Date(view.yesterdayWaiting[0].nextReviewAt).toLocaleString()}.
            </p>
          ) : null}
          {!reviewCard && !reviewQuestions.length ? (
            <p>No reviews due today.{view.nextReviewAt ? ` Next review ${new Date(view.nextReviewAt).toLocaleString()}.` : ""}</p>
          ) : null}
          {reviewCard ? (
            <>
              <div className="study-face" onClick={() => setFlipped(flipped === "review" ? null : "review")} role="button" tabIndex={0}>
                <StudyCardBody card={reviewCard} flipped={flipped === "review"} />
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={() => mark(reviewCard.id, "remembered")}>Mark reviewed</button>
                <button className="btn btn-ghost" type="button" onClick={() => mark(reviewCard.id, "need-review")}>Need review</button>
              </div>
              <div className="row">
                <button className="btn btn-ghost" type="button" disabled={reviewIndex === 0} onClick={() => { setReviewIndex((index) => index - 1); setFlipped(null); }}>Previous</button>
                <button className="btn btn-ghost" type="button" disabled={reviewIndex >= reviewCards.length - 1} onClick={() => { setReviewIndex((index) => index + 1); setFlipped(null); }}>Next</button>
              </div>
            </>
          ) : null}
          {reviewQuestions.length ? <ExamRunner mode="weak" practice review preset={reviewQuestions} onRecorded={load} /> : null}
        </section>
      </div>
      <p style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" type="button" onClick={async () => {
          const data = await fetch("/api/daily-study/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "more", attemptId: crypto.randomUUID() }),
          }).then((response) => response.json());
          if (!data.error) setView(data);
        }}>Keep studying</button>
      </p>
    </>
  );
}
