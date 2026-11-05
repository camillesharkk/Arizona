"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { categoryLabel, StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { openSitting } from "@/lib/sitting";
import { loadProgress } from "@/lib/storage";

const ANON_FULL_KEY = "az-anon-full-started";
const HOME_CARD_KEY = "az-home-card";

export type StudyPreviewCard = StudyCardView & {
  source: string;
  sourceUrl: string;
};

export function HomeStudy({ cards }: { cards: StudyPreviewCard[] }) {
  const [homeQuiz, setHomeQuiz] = useState<"none" | "quick" | "full">("none");
  const [cardIndex, setCardIndex] = useState(0);
  const [cardCategory, setCardCategory] = useState("all");
  const [shuffled, setShuffled] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [homeQuickOpen, setHomeQuickOpen] = useState(false);
  const [fullSittingOpen, setFullSittingOpen] = useState(false);
  const [homeFullOpen, setHomeFullOpen] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [resumeHref, setResumeHref] = useState<string | null>(null);
  const [todayLeft, setTodayLeft] = useState<number | null>(null);
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
      }
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
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => {
        const nextOwner = d.user?.id || "guest";
        setIsPro(Boolean(d.user?.arizonaPro || d.user?.plan === "pro"));
        setFullExamCount(Number(d.user?.fullExamCount || 0));
        setSignedIn(Boolean(d.user));
        setQuickOpen(Boolean(openSitting(sessionStorage, nextOwner, "quick")));
        setHomeQuickOpen(Boolean(openSitting(sessionStorage, nextOwner, "home-quick")));
        setFullSittingOpen(Boolean(openSitting(sessionStorage, nextOwner, "full")));
        setHomeFullOpen(Boolean(openSitting(sessionStorage, nextOwner, "home-full")));
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

  const fullLocked = !fullSittingOpen && !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || (!signedIn && anonFullUsed));

  function moveCard(next: number) {
    setCardIndex(next);
    setFlipped(false);
  }

  const showContinue = Boolean(resumeHref || todayLeft);

  const fullHref = `${paths.practice}?mode=full${fullSittingOpen ? "" : "&start=1"}`;

  const fullAction = authReady && gateReady && fullSittingOpen ? (
    <a className="btn btn-ghost" href={fullHref}>Resume Full Practice Exam</a>
  ) : authReady && gateReady && fullLocked ? (
    <a className="btn btn-ghost" href={paths.pricing} data-upgrade-source="practice_limit">Unlock Pro</a>
  ) : authReady && gateReady ? (
    <a className="btn btn-ghost" href={fullHref}>Start a Full Practice Exam</a>
  ) : null;

  return (
    <>
      <section className="home-welcome" aria-label="Where to start">
        <h1>Arizona Notary Exam Prep</h1>
        <p className="home-lead">Learn the rules. Practice with scenarios. Review your mistakes. Start free. Pro opens the rest of the practice bank, study cards, and full exams.</p>
        <p className="home-diagnostic">Answer 10 free questions and find out what to study next.</p>
        <div className="home-actions-row">
          <a className="btn btn-primary" href={`${paths.practice}?mode=quick`}>
            Check My Knowledge — 10 Questions
          </a>
          {fullAction}
        </div>
        {quickOpen ? <p className="notice">You have an unfinished 10-question check. This continues it.</p> : null}
        {fullLocked && authReady && gateReady ? (
          <p className="notice">
            {signedIn
              ? "This account has used its free Full 45. Pro includes more full exams."
              : "This browser has used its free Full 45. Pro includes more full exams."}
          </p>
        ) : null}
        {homeQuickOpen ? (
          <button className="home-text-btn" type="button" onClick={() => setHomeQuiz("quick")}>
            Continue the 10 questions started on this page
          </button>
        ) : null}
        {homeFullOpen ? (
          <button className="home-text-btn" type="button" onClick={() => { setFullOpen(true); setHomeQuiz("full"); }}>
            Continue the full exam started on this page
          </button>
        ) : null}
      </section>
    <div className="study-stack">

      {showContinue ? (
        <p className="home-continue">
          {resumeHref ? <Link href={resumeHref}>Continue saved practice</Link> : null}
          {todayLeft ? (
            <Link href={paths.daily}>
              Today: {todayLeft} daily study {todayLeft === 1 ? "item" : "items"} left
            </Link>
          ) : null}
        </p>
      ) : null}

      <div className="home-stage">
        <section aria-label="Study cards">
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

        {homeQuiz === "quick" ? (
          <section className="home-quiz" aria-label="Practice questions">
            <ExamRunner mode="quick" practice isPro={isPro} reportStart="answer" layout="compact" sittingMode="home-quick" />
          </section>
        ) : null}

        {homeQuiz === "full" && fullOpen ? (
          <section aria-label="Full practice exam">
            <ExamRunner mode="full" isPro={isPro} layout="compact" sittingMode="home-full" />
          </section>
        ) : null}
      </div>

      <p className="home-continue">
        <Link href={paths.daily}>Daily Study</Link>
      </p>
    </div>
    </>
  );
}
