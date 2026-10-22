"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { categoryLabel, StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { examConfig } from "@/data/exam-config";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { loadProgress } from "@/lib/storage";

const ANON_FULL_KEY = "az-anon-full-started";

export type StudyPreviewCard = StudyCardView & {
  source: string;
  sourceUrl: string;
};

const HOME_CARD_KEY = "az-home-card";

export function HomeStudy({ cards }: { cards: StudyPreviewCard[] }) {
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
      if (saved && typeof saved.index === "number") setCardIndex(saved.index);
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
    setFullOpen(true);
  }

  function moveCard(next: number) {
    setCardIndex(next);
    setFlipped(false);
  }

  return (
    <div className="study-stack">
      <section className="study-module" aria-label="Flashcards">
        <div className="study-module-bar">
          <h2>Flashcards</h2>
          {card ? <span className="study-category">{categoryLabel(card.category)}</span> : null}
          <span className="badge">Free preview</span>
          <Link href={paths.studyCards}>View all study cards</Link>
          <Link href={paths.flashcards}>Full deck</Link>
        </div>
        <div className="filter-row">
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
          <button className="chip" type="button" onClick={() => { setShuffled((on) => !on); setCardIndex(0); setFlipped(false); }}>
            {shuffled ? "Back to order" : "Shuffle"}
          </button>
        </div>
        {card ? (
          <>
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
              <StudyCardBody
                card={{ ...card, sourceLabel: card.source, sourceUrl: card.sourceUrl }}
                flipped={flipped}
              />
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
          </>
        ) : (
          <p>No free flashcards are available.</p>
        )}
      </section>

      <section className="study-module" aria-label="Quick Practice">
        <div className="study-module-bar">
          <h2>Quick Practice</h2>
          {resumeHref ? <Link href={resumeHref}>Continue saved practice</Link> : null}
          <WrongAnswersLink />
        </div>
        {ready ? (
          <ExamRunner mode="quick" practice isPro={isPro} reportStart="answer" layout="compact" persistKey="az-home-quick" />
        ) : (
          <div className="card" aria-busy="true">
            <p className="notice">Question 1 of 10</p>
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        )}
        <div className="q-options">
          {fullLocked ? (
            <Link className="q-option" href={paths.pricing}>
              <strong className="q-option-inner">Take a full practice exam</strong>
              <span className="notice q-option-inner">This browser or account already used its free full exam. Another full exam is part of Pro.</span>
            </Link>
          ) : (
            <button
              className={`q-option${fullOpen ? " selected" : ""}`}
              type="button"
              aria-pressed={fullOpen}
              disabled={!authReady || !gateReady}
              onClick={() => {
                if (!fullOpen) startFull();
              }}
            >
              <strong className="q-option-inner">Take a full practice exam</strong>
              <span className="notice q-option-inner">
                {examConfig.questionCount} questions, {examConfig.timeLimitMinutes} minutes. Explanations stay hidden until you submit.
                Starting this uses your free full exam if you have one left.
              </span>
            </button>
          )}
        </div>
        {fullOpen ? <ExamRunner mode="full" isPro={isPro} layout="compact" /> : null}
      </section>
    </div>
  );
}
