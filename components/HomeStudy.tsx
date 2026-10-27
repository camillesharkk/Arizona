"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { categoryLabel, StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { examConfig } from "@/data/exam-config";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { loadProgress } from "@/lib/storage";

const ANON_FULL_KEY = "az-anon-full-started";
const HOME_CARD_KEY = "az-home-card";

export type StudyPreviewCard = StudyCardView & {
  source: string;
  sourceUrl: string;
};

type Mode = "learn" | "practice";

export function HomeStudy({ cards }: { cards: StudyPreviewCard[] }) {
  const [mode, setMode] = useState<Mode>("practice");
  const [cardIndex, setCardIndex] = useState(0);
  const [cardCategory, setCardCategory] = useState("all");
  const [shuffled, setShuffled] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [ready, setReady] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [resumeHref, setResumeHref] = useState<string | null>(null);
  const [cardResume, setCardResume] = useState(false);
  const [todayLeft, setTodayLeft] = useState<number | null>(null);
  const anonFullThisVisit = useRef(false);
  const deck = (() => {
    const list = cards.filter((item) => cardCategory === "all" || item.category === cardCategory);
    if (!shuffled) return list;
    const out = list.slice();
    let seed = 20261019;
    for (let i = out.length - 1; i > 0; i -= 1) {
      seed = (seed * 16807) % 2147483647;
      const j = seed % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  })();
  const categories = ["all", ...Array.from(new Set(cards.map((item) => item.category)))];
  const safeIndex = Math.min(cardIndex, Math.max(deck.length - 1, 0));
  const card = deck[safeIndex];

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(HOME_CARD_KEY) || "");
      if (saved && typeof saved.index === "number") {
        setCardIndex(saved.index);
        if (saved.index > 0) setCardResume(true);
      }
      if (typeof saved?.category === "string" && saved.category !== "all") setCardResume(true);
      if (typeof saved?.category === "string") setCardCategory(saved.category);
    } catch {
      /* first visit */
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(HOME_CARD_KEY, JSON.stringify({ index: safeIndex, category: cardCategory }));
    } catch {
      /* storage can be blocked */
    }
  }, [safeIndex, cardCategory]);

  useEffect(() => {
    try {
      setAnonFullUsed(localStorage.getItem(ANON_FULL_KEY) === "1");
    } catch {
      setAnonFullUsed(false);
    }
    const saved = loadProgress();
    if (saved.lastMode === "quick" || saved.lastMode === "full" || saved.lastMode === "weak") {
      if (saved.answeredIds.length > 0 || saved.lastScore != null) {
        setResumeHref(`${paths.practice}?mode=${saved.lastMode}`);
      }
    }
    setGateReady(true);
    setReady(true);
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => {
        setIsPro(Boolean(d.user?.arizonaPro || d.user?.plan === "pro"));
        setFullExamCount(Number(d.user?.fullExamCount || 0));
        setSignedIn(Boolean(d.user));
      })
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
  }, []);

  useEffect(() => {
    if (!signedIn) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/daily-study/?timeZone=${encodeURIComponent(timeZone)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const tasks = Array.isArray(data?.taskStatus) ? data.taskStatus : [];
        const left = tasks.filter((task: { status?: string }) => task.status === "pending").length;
        setTodayLeft(left > 0 ? left : null);
      })
      .catch(() => undefined);
  }, [signedIn]);

  const inThisAnonFull = anonFullThisVisit.current && fullOpen;
  const anonBlocked = !isPro && !signedIn && anonFullUsed && !inThisAnonFull;
  const fullLocked = !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || anonBlocked);

  function consumeAnonFull() {
    anonFullThisVisit.current = true;
    try {
      localStorage.setItem(ANON_FULL_KEY, "1");
    } catch {
      /* this visit still stays open in memory */
    }
    setAnonFullUsed(true);
  }

  function startFull() {
    if (!authReady || !gateReady || fullLocked) return;
    if (!isPro && !signedIn && !anonFullUsed) consumeAnonFull();
    setMode("practice");
    setFullOpen(true);
  }

  function moveCard(next: number) {
    setCardIndex(next);
    setFlipped(false);
  }

  const showContinue = Boolean(resumeHref || cardResume || todayLeft);

  return (
    <div className="study-stack">
      <div className="home-modes" role="radiogroup" aria-label="How to study">
        <button
          className={`q-option${mode === "learn" ? " selected" : ""}`}
          type="button"
          role="radio"
          aria-checked={mode === "learn"}
          onClick={() => setMode("learn")}
        >
          <strong className="q-option-inner">Learn</strong>
          <span className="notice q-option-inner">Study key rules with flashcards and examples.</span>
        </button>
        <button
          className={`q-option${mode === "practice" ? " selected" : ""}`}
          type="button"
          role="radio"
          aria-checked={mode === "practice"}
          onClick={() => setMode("practice")}
        >
          <strong className="q-option-inner">Practice</strong>
          <span className="notice q-option-inner">Apply what you know with practice questions.</span>
        </button>
      </div>

      {showContinue ? (
        <p className="home-continue">
          {resumeHref ? <Link href={resumeHref}>Continue saved practice</Link> : null}
          {cardResume ? (
            <button className="home-text-btn" type="button" onClick={() => setMode("learn")}>
              Continue study cards
            </button>
          ) : null}
          {todayLeft ? (
            <Link href={paths.daily}>
              Today: {todayLeft} daily study {todayLeft === 1 ? "item" : "items"} left
            </Link>
          ) : null}
        </p>
      ) : null}

      <div className="home-stage">
        <section hidden={mode !== "learn"} aria-label="Study cards">
          <div className="filter-row home-topics">
            {categories.map((category) => (
              <button
                key={category}
                className={`chip ${cardCategory === category ? "on" : ""}`}
                type="button"
                onClick={() => {
                  setCardCategory(category);
                  setCardIndex(0);
                  setFlipped(false);
                  setShuffled(false);
                }}
              >
                {category === "all" ? "In order" : categoryLabel(category)}
              </button>
            ))}
            <button
              className="chip"
              type="button"
              onClick={() => {
                setShuffled((on) => !on);
                setCardIndex(0);
                setFlipped(false);
              }}
            >
              {shuffled ? "Back to order" : "Shuffle"}
            </button>
            <Link className="btn btn-ghost home-all-cards" href={paths.studyCards}>All study cards</Link>
          </div>
          {card ? (
            <div className="home-card-column">
              <div
                className="study-face"
                onClick={() => setFlipped((open) => !open)}
                onKeyDown={(event) => {
                  if (event.key === "ArrowRight" && safeIndex < deck.length - 1) {
                    event.preventDefault();
                    moveCard(safeIndex + 1);
                    return;
                  }
                  if (event.key === "ArrowLeft" && safeIndex > 0) {
                    event.preventDefault();
                    moveCard(safeIndex - 1);
                    return;
                  }
                  if (event.key !== "Enter" && event.key !== " ") return;
                  event.preventDefault();
                  setFlipped((open) => !open);
                }}
                role="button"
                tabIndex={0}
                aria-pressed={flipped}
              >
                <StudyCardBody card={{ ...card, sourceLabel: card.source, sourceUrl: card.sourceUrl }} flipped={flipped} />
                <button
                  className="btn btn-ghost study-reveal"
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setFlipped((open) => !open);
                  }}
                >
                  {flipped ? "Show question" : "Show answer"}
                </button>
              </div>
              <div className="home-card-actions">
                <div className="study-pager">
                  <button className="btn btn-ghost" type="button" onClick={() => moveCard(safeIndex - 1)} disabled={safeIndex === 0}>
                    Previous
                  </button>
                  <span>
                    {safeIndex + 1} / {deck.length}
                  </span>
                  <button className="btn btn-ghost" type="button" onClick={() => moveCard(safeIndex + 1)} disabled={safeIndex >= deck.length - 1}>
                    Next
                  </button>
                </div>
                {card.practiceHref ? <Link className="btn btn-ghost" href={card.practiceHref}>Practice this topic</Link> : null}
              </div>
            </div>
          ) : (
            <p>No study cards are available.</p>
          )}
        </section>

        <section className="home-quiz" hidden={mode !== "practice" || fullOpen} aria-label="Practice questions">
          {ready ? (
            <ExamRunner mode="quick" practice isPro={isPro} reportStart="answer" layout="compact" sittingMode="home-quick" />
          ) : (
            <div className="card" aria-busy="true">
              <p className="notice">Question 1 of 10</p>
              <div className="skeleton skeleton-line" />
              <div className="skeleton skeleton-line" />
            </div>
          )}
        </section>

        {fullOpen ? (
          <section hidden={mode !== "practice"} aria-label="Full practice exam">
            <ExamRunner mode="full" isPro={isPro} layout="compact" sittingMode="home-full" />
          </section>
        ) : null}
      </div>

      <div className="home-ways">
        <Link className="q-option" href={`${paths.practice}?mode=quick`}>
          <strong className="q-option-inner">Check My Knowledge — 10 Questions</strong>
        </Link>
        {fullLocked ? (
          <Link className="q-option" href={paths.pricing}>
            <strong className="q-option-inner">Full Practice Exam</strong>
            <span className="notice q-option-inner">Another full exam is part of Pro.</span>
          </Link>
        ) : (
          <button className={`q-option${fullOpen ? " selected" : ""}`} type="button" disabled={!authReady || !gateReady} onClick={startFull}>
            <strong className="q-option-inner">Full Practice Exam</strong>
            <span className="notice q-option-inner">
              {examConfig.questionCount} questions, {examConfig.timeLimitMinutes} minutes
            </span>
          </button>
        )}
        <Link className="q-option" href={paths.daily}>
          <strong className="q-option-inner">Daily Study</strong>
        </Link>
      </div>
    </div>
  );
}
