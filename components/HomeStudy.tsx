"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { StudyPager } from "@/components/StudyPager";
import { scrollUnderHeaderSoon } from "@/lib/scroll-under-header";
import { categoryLabel, StudyCardBody, type StudyCardView } from "@/components/StudyCardBody";
import { paths } from "@/lib/paths";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { hiStudyLabel } from "@/lib/hi-topics";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { openSitting } from "@/lib/sitting";
import { loadProgress } from "@/lib/storage";

const ANON_FULL_KEY = "az-anon-full-started";
const HOME_CARD_KEY = "az-home-card";

export type StudyPreviewCard = StudyCardView & {
  source: string;
  sourceUrl: string;
};

export function HomeStudy({ cards, stateCode = "AZ" }: { cards: StudyPreviewCard[]; stateCode?: "AZ" | "CA" | "HI" }) {
  const onCa = stateCode === "CA";
  const onHi = stateCode === "HI";
  const site = onHi ? hiPaths : onCa ? caPaths : paths;
  const cardKey = onHi ? "hi-home-card" : onCa ? "ca-home-card" : HOME_CARD_KEY;
  const anonKey = onHi ? "hi-anon-full-started" : onCa ? "ca-anon-full-started" : ANON_FULL_KEY;
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
  const cardFace = useRef<HTMLDivElement>(null);
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
      const saved = JSON.parse(sessionStorage.getItem(cardKey) || "");
      if (saved && typeof saved.index === "number") {
        setCardIndex(saved.index);
      }
      if (typeof saved?.category === "string") setCardCategory(saved.category);
    } catch {
      /* first visit */
    }
    if (new URLSearchParams(window.location.search).get("attempt")) setHomeQuiz("quick");
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(cardKey, JSON.stringify({ index: safeIndex, category: cardCategory }));
    } catch {
      /* storage can be blocked */
    }
  }, [safeIndex, cardCategory, cardKey]);

  useEffect(() => {
    try {
      setAnonFullUsed(localStorage.getItem(anonKey) === "1");
    } catch {
      setAnonFullUsed(false);
    }
    const saved = loadProgress(stateCode);
    if (saved.lastMode === "quick" || saved.lastMode === "full" || saved.lastMode === "weak") {
      if (saved.answeredIds.length > 0 || saved.lastScore != null) {
        setResumeHref(`${site.practice}?mode=${saved.lastMode}`);
      }
    }
    setGateReady(true);
    setAuthReady(false);
    let cancel = false;
    const controller = new AbortController();
    fetch("/api/auth/me/", { signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancel) return;
        const nextOwner = d.user?.id || "guest";
        setIsPro(Boolean(d.user?.arizonaPro || d.user?.californiaPro || d.user?.hawaiiPro || d.user?.plan === "pro"));
        setFullExamCount(Number((onHi ? d.user?.hiFullExamCount : onCa ? d.user?.caFullExamCount : d.user?.fullExamCount) || 0));
        setSignedIn(Boolean(d.user));
        setQuickOpen(Boolean(openSitting(sessionStorage, nextOwner, "quick", stateCode)));
        setHomeQuickOpen(Boolean(openSitting(sessionStorage, nextOwner, "home-quick", stateCode)));
        setFullSittingOpen(Boolean(openSitting(sessionStorage, nextOwner, "full", stateCode)));
        setHomeFullOpen(Boolean(openSitting(sessionStorage, nextOwner, "home-full", stateCode)));
        if (new URLSearchParams(window.location.search).get("exam") === "full" && openSitting(sessionStorage, nextOwner, "home-full", stateCode)) {
          setFullOpen(true);
          setHomeQuiz("full");
        }
      })
      .catch((error: unknown) => {
        if (cancel || (error instanceof DOMException && error.name === "AbortError")) return;
      })
      .finally(() => {
        if (!cancel) setAuthReady(true);
      });
    return () => {
      cancel = true;
      controller.abort();
    };
  }, [anonKey, onCa, onHi, site.practice, stateCode]);

  useEffect(() => {
    if (!signedIn) return;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    fetch(`/api/daily-study/?timeZone=${encodeURIComponent(timeZone)}${onHi ? "&state=HI" : onCa ? "&state=CA" : ""}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const tasks = Array.isArray(data?.taskStatus) ? data.taskStatus : [];
        const left = tasks.filter((task: { status?: string }) => task.status === "pending").length;
        setTodayLeft(left > 0 ? left : null);
      })
      .catch(() => undefined);
  }, [signedIn, onCa, onHi]);

  const fullLocked = !fullSittingOpen && !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || (!signedIn && anonFullUsed));

  function moveCard(next: number) {
    setCardIndex(next);
    setFlipped(false);
    scrollUnderHeaderSoon(cardFace.current);
  }

  const fullHref = `${site.practice}?mode=full${fullSittingOpen ? "" : "&start=1"}`;

  const fullAction = authReady && gateReady && fullSittingOpen ? (
    <a className="btn btn-ghost" href={fullHref}>Resume Full Practice Exam</a>
  ) : authReady && gateReady && fullLocked ? (
    <a className="btn btn-ghost" href={site.pricing} data-upgrade-source="practice_limit">{onHi ? "Practice limit" : onCa ? "Full exam limit" : "Unlock Pro"}</a>
  ) : authReady && gateReady ? (
    <a className="btn btn-ghost" href={fullHref}>{onHi ? "Start Comprehensive Practice" : "Start a Full Practice Exam"}</a>
  ) : null;

  return (
    <>
      <section className="home-welcome" aria-label="Where to start">
        <h1>{onHi ? "Hawaii Notary Exam Prep" : onCa ? "California Notary Exam Prep" : "Arizona Notary Exam Prep"}</h1>
      </section>
      <div className="home-copy">
        <p className="home-lead">{onHi ? "Practice Hawaii notary questions and study cards. Quick 10 suggests what to study next. It is not an official score." : onCa ? "Practice the California notary exam with published questions and study cards. The check uses your answers to suggest a next step. It is not an official score." : "Learn the rules. Practice with scenarios. Review your mistakes. Start free. Pro opens the rest of the practice bank, study cards, and full exams."}</p>
        <p className="home-diagnostic">{onHi ? "Quick 10 is free. Comprehensive Practice is 50 questions with no time limit. That count is this site's practice setting. The official written exam requires at least 80%." : onCa ? "A full practice exam is 45 questions and 60 minutes. Forty items are scored. Five are unscored. The official exam needs a scaled score of at least 70, which is not a percent." : "Answer 10 free questions and find out what to study next."}</p>
      </div>
      <section className="home-welcome home-welcome-actions" aria-label="Start">
        <div className="home-actions-row">
          <a className="btn btn-primary" href={`${site.practice}?mode=quick`}>
            Check My Knowledge — 10 Questions
          </a>
          {fullAction}
        </div>
        {quickOpen ? <p className="notice">You have an unfinished 10-question check. This continues it.</p> : null}
        {fullLocked && authReady && gateReady ? (
          <p className="notice">
            {signedIn
              ? (onHi ? "This account has used its free Comprehensive Practice. Pro includes more of them in every available state for 60 days." : onCa ? "This account has used its full practice exam. Pro includes more full exams in every available state for 60 days." : "This account has used its free Full 45. Pro includes more full exams.")
              : (onHi ? "This browser has used its free Comprehensive Practice. Pro includes more of them in every available state for 60 days." : onCa ? "This browser has used its full practice exam. Pro includes more full exams in every available state for 60 days." : "This browser has used its free Full 45. Pro includes more full exams.")}
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

      <p className="home-continue">
          {resumeHref ? <Link href={resumeHref}>Continue saved practice</Link> : null}
          <Link href={signedIn ? site.daily : `${site.login}?next=${encodeURIComponent(site.daily)}`}>
            {todayLeft ? `Today: ${todayLeft} daily study ${todayLeft === 1 ? "item" : "items"} left` : "Daily Study"}
          </Link>
        </p>

      <div className="home-stage">
        <section aria-label="Study cards">
          <div className="tool-row home-topics">
            {categories.map((category) => (
              <button
                key={category}
                className={`chip ${cardCategory === category ? "on" : ""}`}
                type="button"
                onClick={() => {
                  setCardCategory(category);
                  moveCard(0);
                  setShuffled(false);
                }}
              >
                {category === "all" ? "In order" : onHi ? hiStudyLabel(category) : categoryLabel(category)}
              </button>
            ))}
            <button
              className="chip"
              type="button"
              onClick={() => {
                setShuffled((on) => !on);
                moveCard(0);
              }}
            >
              {shuffled ? "Back to order" : "Shuffle"}
            </button>
            <Link className="chip" href={site.studyCards}>All study cards</Link>
          </div>
          {card ? (
            <div className="home-card-column">
              <div
                ref={cardFace}
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
                <StudyCardBody card={{ ...card, sourceLabel: card.source, sourceUrl: card.sourceUrl }} flipped={flipped} labelFor={onHi ? hiStudyLabel : undefined} />
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
                <StudyPager
                  index={safeIndex}
                  total={deck.length}
                  target={cardFace}
                  onPrev={() => moveCard(safeIndex - 1)}
                  onNext={() => moveCard(safeIndex + 1)}
                />
                {card.practiceHref ? <Link className="btn btn-ghost" href={card.practiceHref}>Practice this topic</Link> : null}
              </div>
            </div>
          ) : (
            <p>No study cards are available.</p>
          )}
        </section>

        {homeQuiz === "quick" ? (
          <section className="home-quiz" aria-label="Practice questions">
            <ExamRunner mode="quick" practice isPro={isPro} reportStart="answer" layout="compact" sittingMode="home-quick" stateCode={stateCode} />
          </section>
        ) : null}

        {homeQuiz === "full" && fullOpen ? (
          <section aria-label="Full practice exam">
            <ExamRunner mode="full" isPro={isPro} layout="compact" sittingMode="home-full" stateCode={stateCode} />
          </section>
        ) : null}
      </div>
    </div>
    </>
  );
}
