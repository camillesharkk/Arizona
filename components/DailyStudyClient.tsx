"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { publishedCaQuestions } from "@/data/ca-questions";
import { publishedQuestions } from "@/data/questions";
import { ExamRunner } from "@/components/ExamRunner";
import { StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { StudyPager } from "@/components/StudyPager";
import { LoadingNote } from "@/components/QuizChrome";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { publishedHiQuestions } from "@/data/hi-questions";
import { hiStudyLabel } from "@/lib/hi-topics";
import { syncCaAttempts } from "@/lib/ca-sync";
import { paths } from "@/lib/paths";
import { packFor } from "@/lib/prep-pack";
import type { Question, StateCode } from "@/lib/types";

type Card = StudyCardView & { id: string };
type View = {
  today: string;
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
  freeQuestionCount: number;
  questionCount: number;
  freeCardCount: number;
  cardCount: number;
  reason: string | null;
  practiceCards: Card[];
  reviewCards: Card[];
  practiceQuestionIds: string[];
  reviewQuestionIds: string[];
  yesterdayWaiting: { id: string; nextReviewAt: string }[];
  unmappedQuestionIds: string[];
  nextReviewAt: string | null;
  taskStatus: { key: string; kind: string; status: string }[];
  recent?: { id: string; at: string; label: string; correct: number; total: number; wrong: number }[];
  scheduled?: { questionId: string; prompt: string; nextReviewAt: string | null; wrongCount: number; saved: boolean; due: boolean }[];
};

export function DailyStudyClient({ stateCode = "AZ" }: { stateCode?: StateCode }) {
  const pack = packFor(stateCode);
  const site = pack ? pack.paths : stateCode === "HI" ? hiPaths : stateCode === "CA" ? caPaths : paths;
  const [indianaQuestions, setIndianaQuestions] = useState<Question[] | null>(null);
  const [view, setView] = useState<View | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const loadId = useRef(0);
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [flipped, setFlipped] = useState<"practice" | "review" | null>(null);
  const [pinned, setPinned] = useState<"practice" | "review">("practice");
  const practiceFace = useRef<HTMLDivElement>(null);
  const reviewFace = useRef<HTMLDivElement>(null);
  const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix", []);
  const visibleStart = useRef<number | null>(null);

  const query = `timeZone=${encodeURIComponent(zone)}&state=${stateCode}`;

  async function load() {
    const id = ++loadId.current;
    setLoading(true);
    setLoadError(false);
    let hold = false;
    try {
      await syncCaAttempts(stateCode);
      if (id !== loadId.current) return;
      const response = await fetch(`/api/daily-study/?${query}`, { cache: "no-store" });
      if (id !== loadId.current) return;
      const back = `${site.login}?next=${encodeURIComponent(`${site.daily}${window.location.search}`)}`;
      if (response.status === 401) {
        hold = true;
        window.location.href = back;
        return;
      }
      if (!response.ok) throw new Error("daily");
      const data = await response.json();
      if (data.error) {
        hold = true;
        window.location.href = back;
        return;
      }
      if (stateCode !== "AZ" && data.state !== stateCode) throw new Error("state");
      if (stateCode === "IN") { const response = await fetch("/api/indiana/questions/", { cache: "no-store" }); if (!response.ok) throw new Error("questions"); const bank = await response.json(); if (id !== loadId.current) return; setIndianaQuestions(bank.questions); }
      setView(data);
    } catch {
      if (id === loadId.current) setLoadError(true);
    } finally {
      if (id === loadId.current && !hold) setLoading(false);
    }
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
    fetch(`/api/daily-study/?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "visible", seconds: Math.min(seconds, 120), attemptId: crypto.randomUUID() }),
    }).catch(() => undefined);
  }

  async function mark(cardId: string, action: "studied" | "remembered" | "need-review") {
    const data = await fetch(`/api/daily-study/?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, cardId, attemptId: crypto.randomUUID() }),
    }).then((response) => response.json());
    if (!data.error) setView(data);
    setFlipped(null);
  }

  if (!view && loading) return <LoadingNote text="Loading your study plan…" />;
  if (loadError && !view) {
    return (
      <div className="card">
        <p className="form-error" role="alert">Could not load today’s plan.</p>
        <button className="btn btn-primary" type="button" onClick={() => load()}>Retry</button>
      </div>
    );
  }
  if (!view) return <LoadingNote text="Loading your study plan…" />;
  const pending = (kind: string) => new Set(view.taskStatus.filter((task) => task.kind === kind && task.status === "pending").map((task) => task.key));
  const practiceCards = view.practiceCards.filter((card) => pending("new-card").has(`card:${card.id}`));
  const reviewCards = view.reviewCards.filter((card) => pending("review-card").has(`card:${card.id}`));
  const practiceCard = practiceCards[Math.min(practiceIndex, Math.max(practiceCards.length - 1, 0))];
  const reviewCard = reviewCards[Math.min(reviewIndex, Math.max(reviewCards.length - 1, 0))];
  const bank = stateCode === "IN" && indianaQuestions ? indianaQuestions : pack ? pack.questions() : stateCode === "HI" ? publishedHiQuestions() : stateCode === "CA" ? publishedCaQuestions() : publishedQuestions();
  const practiceQuestions = bank.filter((question) => pending("new-question").has(`question:${question.question_id}`));
  const reviewQuestions = bank.filter((question) => pending("review-question").has(`question:${question.question_id}`));
  const entitlement = view.entitlementExpiresAt ? view.entitlementExpiresAt.slice(0, 10) : null;
  const progress = view.total ? Math.round(((view.introduced + view.reviewed) / (view.total * 2)) * 100) : 0;

  return (
    <>
      <div className="daily-meta">
        <span>Day {view.dayNumber}</span>
        <span>{view.done} / {view.goal} today</span>
        <span>{progress}% of this plan</span>
        <span>Target {view.targetDate}</span>
        <Link href={stateCode === "AZ" ? `${paths.account}#study-settings` : `${paths.account}?state=${stateCode}#study-settings`}>Study Settings</Link>
      </div>
      {stateCode === "AZ" && view.freeOnly ? (
        <p className="notice">
          Today’s plan uses the free set: {view.freeQuestionCount} questions and {view.freeCardCount} study cards. Pro uses all {view.questionCount} questions and {view.cardCount} study cards.{" "}
          <Link href={paths.pricing}>View Pro</Link>
        </p>
      ) : stateCode === "AZ" ? (
        <p className="notice">Pro is active. Today’s plan uses the full question bank and study cards.</p>
      ) : null}
      {stateCode === "AZ" && entitlement && entitlement < view.targetDate ? <p className="notice">Pro access ends {entitlement}. The study target stays {view.targetDate}.</p> : null}
      {view.projectedDate && view.projectedDate > view.targetDate ? <p className="notice">At the current pace the plan finishes {view.projectedDate}.</p> : null}
      {view.projectReason ? <p className="notice">{view.projectReason}</p> : null}
      {view.reason ? <p className="notice">{view.reason}</p> : null}
      {view.unmappedQuestionIds.length ? <p className="notice">{view.unmappedQuestionIds.length} missed questions are not on a study card yet.</p> : null}
      <div className="daily-grid">
        <section className="card daily-practice-card" aria-label="Today’s Practice">
          <h2>Today’s Practice</h2>
          {practiceCard ? (
            <>
              <div ref={practiceFace} className="study-face" onClick={() => setFlipped(flipped === "practice" ? null : "practice")} role="button" tabIndex={0}>
                <StudyCardBody card={practiceCard} flipped={flipped === "practice"} labelFor={stateCode === "HI" ? hiStudyLabel : undefined} />
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={() => mark(practiceCard.id, "studied")}>Mark studied</button>
              </div>
              <StudyPager
                index={Math.min(practiceIndex, practiceCards.length - 1)}
                total={practiceCards.length}
                target={practiceFace}
                pin={Boolean(practiceCard) && (pinned === "practice" || !reviewCard)}
                onPrev={() => { setPinned("practice"); setPracticeIndex((index) => index - 1); setFlipped(null); }}
                onNext={() => { setPinned("practice"); setPracticeIndex((index) => index + 1); setFlipped(null); }}
              />
            </>
          ) : <p>No new cards left in today’s goal.</p>}
        </section>
        <section className="card daily-review-card" aria-label="Today’s Review">
          <h2>Today’s Review</h2>
          {reviewCard || reviewQuestions.length || view.yesterdayWaiting.length ? (
            <p>Reviews use questions you missed and questions you saved.</p>
          ) : null}
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
              <div ref={reviewFace} className="study-face" onClick={() => setFlipped(flipped === "review" ? null : "review")} role="button" tabIndex={0}>
                <StudyCardBody card={reviewCard} flipped={flipped === "review"} labelFor={stateCode === "HI" ? hiStudyLabel : undefined} />
              </div>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn btn-primary" type="button" onClick={() => mark(reviewCard.id, "remembered")}>Mark reviewed</button>
                <button className="btn btn-ghost" type="button" onClick={() => mark(reviewCard.id, "need-review")}>Need review</button>
              </div>
              <StudyPager
                index={Math.min(reviewIndex, reviewCards.length - 1)}
                total={reviewCards.length}
                target={reviewFace}
                pin={pinned === "review" || !practiceCard}
                onPrev={() => { setPinned("review"); setReviewIndex((index) => index - 1); setFlipped(null); }}
                onNext={() => { setPinned("review"); setReviewIndex((index) => index + 1); setFlipped(null); }}
              />
            </>
          ) : null}
        </section>
        {practiceQuestions.length ? (
          <div className="daily-practice-quiz">
            <ExamRunner mode="practice" practice isPro={(stateCode === "CT" || stateCode === "NC" || stateCode === "IN") && view?.freeOnly === false} preset={practiceQuestions} onRecorded={load} sittingMode={stateCode === "CT" ? `daily-practice-${view?.today}` : "daily-practice"} stateCode={stateCode} />
          </div>
        ) : null}
        {reviewQuestions.length ? (
          <div className="daily-review-quiz">
            <ExamRunner mode="weak" practice review isPro={(stateCode === "CT" || stateCode === "NC" || stateCode === "IN") && view?.freeOnly === false} preset={reviewQuestions} onRecorded={load} sittingMode={stateCode === "CT" ? `daily-review-${view?.today}` : "daily-review"} stateCode={stateCode} />
          </div>
        ) : null}
      </div>
      <p style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" type="button" onClick={async () => {
          const data = await fetch(`/api/daily-study/?${query}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "more", attemptId: crypto.randomUUID() }),
          }).then((response) => response.json());
          if (!data.error) setView(data);
        }}>Keep studying</button>
      </p>
      {view.recent && view.recent.length > 0 ? (
        <section className="card" style={{ marginTop: 16 }}>
          <h2>Recent practice</h2>
          <ul className="check">
            {view.recent.map((exam) => (
              <li key={exam.id}>
                <strong>{exam.label}</strong>
                {" · "}
                {new Date(exam.at).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                {" · "}
                {exam.correct}/{exam.total}
                {exam.wrong > 0 ? <> · <Link href={`${site.mistakes}?attempt=${exam.id}`}>Review My Mistakes ({exam.wrong})</Link></> : " · No mistakes"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {view.scheduled && view.scheduled.length > 0 ? (
        <section className="card">
          <h2>Scheduled review</h2>
          <ul className="check">
            {view.scheduled.map((item) => (
              <li key={item.questionId}>
                {item.prompt}
                {" · "}
                {item.saved && item.wrongCount === 0 ? "Added" : `Wrong ${item.wrongCount}`}
                {item.nextReviewAt ? ` · ${item.due ? "Due" : "Next"} ${new Date(item.nextReviewAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}` : ""}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}
