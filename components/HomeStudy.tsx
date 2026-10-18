"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { FlashcardsClient } from "@/components/FlashcardsClient";
import { examConfig } from "@/data/exam-config";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { loadProgress } from "@/lib/storage";

const ANON_FULL_KEY = "az-anon-full-started";

type Tab = "practice" | "full" | "cards";

export function HomeStudy() {
  const [tab, setTab] = useState<Tab>("practice");
  const [fullOpen, setFullOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [ready, setReady] = useState(false);
  const [resumeHref, setResumeHref] = useState<string | null>(null);
  const anonFullThisVisit = useRef(false);

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
    setTab("full");
  }

  return (
    <section className="home-quiz" aria-label="Practice">
      <div className="study-switch" role="tablist" aria-label="Study mode">
        <button className={`chip ${tab === "practice" ? "on" : ""}`} type="button" role="tab" aria-selected={tab === "practice"} onClick={() => setTab("practice")}>
          Practice
        </button>
        <button className={`chip ${tab === "full" ? "on" : ""}`} type="button" role="tab" aria-selected={tab === "full"} onClick={() => setTab("full")}>
          Full Exam
        </button>
        <button className={`chip ${tab === "cards" ? "on" : ""}`} type="button" role="tab" aria-selected={tab === "cards"} onClick={() => setTab("cards")}>
          Flashcards
        </button>
      </div>
      {resumeHref ? (
        <p className="notice">
          <Link href={resumeHref}>Continue saved practice</Link>
        </p>
      ) : null}
      <div hidden={tab !== "practice"}>
        {ready ? (
          <ExamRunner mode="quick" practice isPro={isPro} reportStart="answer" layout="compact" />
        ) : (
          <div className="card" aria-busy="true">
            <p className="notice">Question 1 of 10</p>
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line" />
          </div>
        )}
      </div>
      {tab === "full" && !fullOpen ? (
        <div className="card">
          <p>
            {examConfig.questionCount} questions, {examConfig.timeLimitMinutes} minutes, {examConfig.passingScorePercent}% practice target.
            Explanations stay hidden until you submit.
          </p>
          {fullLocked ? (
            <>
              <p>This browser or account already used its free full exam. Another full exam is part of Pro.</p>
              <Link className="btn btn-primary" href={paths.pricing}>See Pro access</Link>
            </>
          ) : (
            <button className="btn btn-primary" type="button" onClick={startFull} disabled={!authReady || !gateReady}>
              Start full exam
            </button>
          )}
        </div>
      ) : null}
      {fullOpen ? (
        <div hidden={tab !== "full"}>
          <ExamRunner mode="full" isPro={isPro} layout="compact" />
        </div>
      ) : null}
      {tab === "cards" ? <FlashcardsClient /> : null}
    </section>
  );
}
