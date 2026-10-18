"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { FlashcardsClient } from "@/components/FlashcardsClient";
import { DiagnosticFlow, savedDiagnosticKind } from "@/components/DiagnosticFlow";
import { examConfig } from "@/data/exam-config";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { loadProgress } from "@/lib/storage";

const ANON_FULL_KEY = "az-anon-full-started";

type View = "menu" | "diagnostic" | "full" | "cards";

export function HomeStudy({ diagnosticReady }: { diagnosticReady: boolean }) {
  const [view, setView] = useState<View>("menu");
  const [fresh, setFresh] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [runId, setRunId] = useState(0);
  const [savedKind, setSavedKind] = useState<"none" | "active" | "complete">("none");
  const [fullOpen, setFullOpen] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [resumeHref, setResumeHref] = useState<string | null>(null);
  const anonFullThisVisit = useRef(false);

  useEffect(() => {
    setSavedKind(savedDiagnosticKind());
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

  function leaveDiagnostic() {
    setSavedKind(savedDiagnosticKind());
    setView("menu");
  }

  return (
    <section className="home-quiz" aria-label="Study choices">
      {resumeHref && view === "menu" ? (
        <p className="notice">
          <Link href={resumeHref}>Continue saved practice</Link>
        </p>
      ) : null}
      {view === "menu" ? (
        <div className="home-choice">
          {diagnosticReady ? (
            <>
              <button
                className="btn btn-primary"
                type="button"
                onClick={() => {
                  setFresh(savedKind !== "active");
                  setShowResult(false);
                  setRunId((n) => n + 1);
                  setView("diagnostic");
                }}
              >
                {savedKind === "active" ? "Continue check" : "Check My Knowledge"}
              </button>
              <p className="home-choice-note">10 questions · No sign-up required</p>
            </>
          ) : null}
          {diagnosticReady && savedKind === "complete" ? (
            <button
              className="home-text-btn"
              type="button"
              onClick={() => {
                setFresh(false);
                setShowResult(true);
                setView("diagnostic");
              }}
            >
              See last result
            </button>
          ) : null}
          <button className="btn btn-ghost" type="button" onClick={() => setView("cards")}>
            Study with Flashcards
          </button>
          <button className="btn btn-ghost" type="button" onClick={() => setView("full")}>
            Take a Full Practice Exam
          </button>
          <p className="notice">
            <Link href={paths.practice}>Practice 10 questions with instant feedback</Link>
          </p>
        </div>
      ) : null}
      {view === "diagnostic" ? (
        <DiagnosticFlow
          key={runId}
          fresh={fresh}
          showResult={showResult}
          onOpenFull={() => setView("full")}
          onOpenCards={() => setView("cards")}
          onExit={leaveDiagnostic}
          onRestart={() => {
            setFresh(true);
            setShowResult(false);
            setRunId((n) => n + 1);
          }}
        />
      ) : null}
      {view === "full" && !fullOpen ? (
        <div className="card">
          <p>
            {examConfig.questionCount} questions, {examConfig.timeLimitMinutes} minutes, {examConfig.passingScorePercent}% practice target.
            Explanations stay hidden until you submit. Starting this uses your free full exam if you have one left.
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
          <button className="btn btn-ghost" type="button" onClick={() => setView("menu")}>
            Back
          </button>
        </div>
      ) : null}
      {fullOpen ? (
        <div hidden={view !== "full"}>
          <ExamRunner mode="full" isPro={isPro} layout="compact" />
          <button className="btn btn-ghost" type="button" onClick={() => setView("menu")}>
            Back
          </button>
        </div>
      ) : null}
      {view === "cards" ? (
        <div>
          <FlashcardsClient />
          <button className="btn btn-ghost" type="button" onClick={() => setView("menu")}>
            Back
          </button>
        </div>
      ) : null}
    </section>
  );
}
