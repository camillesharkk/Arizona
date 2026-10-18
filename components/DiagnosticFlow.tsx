"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { chapters } from "@/data/study-guide";
import { findSource } from "@/data/sources";
import {
  arizonaDiagnostic,
  bandAction,
  blankSession,
  diagnosticCandidates,
  diagnosticStorageKey,
  missedTopics,
  parseDiagnosticSession,
  pickDiagnosticQuestions,
  recommendFor,
  scoreDiagnostic,
  topicScores,
  type DiagnosticChoice,
  type DiagnosticSession,
} from "@/lib/diagnostic";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { currentEmail } from "@/lib/account";
import { paths } from "@/lib/paths";
import { eligibleExamPool } from "@/lib/quiz";
import type { Question, TopicId } from "@/lib/types";
import { FREE_FLASHCARD_PREVIEW } from "@/lib/product";

const profile = arizonaDiagnostic;

function lookupQuestion(id: string) {
  return diagnosticCandidates(profile.stateCode).find((q) => q.question_id === id) ?? null;
}

function readSaved() {
  if (typeof window === "undefined") return null;
  try {
    return parseDiagnosticSession(localStorage.getItem(diagnosticStorageKey(currentEmail())), profile, lookupQuestion);
  } catch {
    return null;
  }
}

function writeSaved(session: DiagnosticSession | null) {
  const key = diagnosticStorageKey(currentEmail());
  try {
    if (!session) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(session));
  } catch {
    /* private mode still runs this visit */
  }
}

export function savedDiagnosticKind(): "none" | "active" | "complete" {
  return readSaved()?.session.status ?? "none";
}

function chapterHref(topic: TopicId) {
  const chapter = chapters.find((item) => item.id === topic) ?? chapters.find((item) => item.topic === topic);
  return chapter ? `${paths.study}#${chapter.id}` : null;
}

function trackDiagnostic(name: string, mode: string, extra?: Record<string, string | number | boolean>) {
  trackAnalyticsEvent(name, { mode, version: profile.version, ...extra });
}

export function DiagnosticFlow({
  fresh,
  showResult,
  onOpenFull,
  onOpenCards,
  onExit,
  onRestart,
}: {
  fresh: boolean;
  showResult: boolean;
  onOpenFull: () => void;
  onOpenCards: () => void;
  onExit: () => void;
  onRestart: () => void;
}) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [session, setSession] = useState<DiagnosticSession | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const submitting = useRef(false);

  useEffect(() => {
    const saved = readSaved();
    if (showResult) {
      if (saved?.session.status === "complete") {
        setQuestions(saved.questions);
        setSession(saved.session);
      } else setUnavailable(true);
      return;
    }
    if (!fresh && saved?.session.status === "active") {
      const next = saved.session.startSent ? saved.session : { ...saved.session, startSent: true };
      setQuestions(saved.questions);
      setSession(next);
      writeSaved(next);
      if (!saved.session.startSent) trackDiagnostic("diagnostic_start", "diagnostic");
      return;
    }
    const picked = pickDiagnosticQuestions(
      diagnosticCandidates(profile.stateCode),
      profile.questionCount,
      Math.floor(Math.random() * 1_000_000_000) || 1,
      profile.stateCode
    );
    if (picked.length !== profile.questionCount) {
      setUnavailable(true);
      return;
    }
    const next = { ...blankSession(picked), startSent: true };
    setQuestions(picked);
    setSession(next);
    writeSaved(next);
    trackDiagnostic("diagnostic_start", "diagnostic");
  }, [fresh, showResult]);

  useEffect(() => {
    headingRef.current?.focus();
  }, [session?.index, session?.status]);

  function persist(next: DiagnosticSession) {
    setSession(next);
    writeSaved(next);
  }

  if (unavailable) {
    return (
      <div className="card">
        <p>This 10-question check is not available right now.</p>
        <button className="btn btn-ghost" type="button" onClick={onExit}>
          Back
        </button>
      </div>
    );
  }

  if (!session || !questions.length) {
    return (
      <div className="card" aria-busy="true">
        <p className="notice">Question 1 of {profile.questionCount}</p>
      </div>
    );
  }

  if (session.status === "complete") {
    return (
      <DiagnosticResult
        questions={questions}
        session={session}
        onOpenFull={onOpenFull}
        onOpenCards={onOpenCards}
        onExit={onExit}
        onRetake={() => {
          writeSaved(null);
          onRestart();
        }}
      />
    );
  }

  const q = questions[session.index];
  if (!q) return null;
  const selected = session.answers[q.question_id];
  const last = session.index + 1 === questions.length;

  function choose(choice: DiagnosticChoice) {
    persist({ ...session!, answers: { ...session!.answers, [q.question_id]: choice } });
  }

  function submit() {
    if (submitting.current || session!.completeSent) return;
    submitting.current = true;
    const next: DiagnosticSession = { ...session!, status: "complete", completeSent: true, index: session!.index };
    persist(next);
    const { correct } = scoreDiagnostic(questions, next.answers);
    trackDiagnostic("diagnostic_complete", "diagnostic", { recommendation: recommendFor(correct) });
  }

  return (
    <div className="home-exam">
      <div className="row space">
        <p id="diagnostic-progress" className="notice">
          Question {session.index + 1} of {questions.length}
        </p>
        <button className="home-text-btn" type="button" onClick={onExit}>
          Save and exit
        </button>
      </div>
      <div
        className="progress-bar"
        style={{ margin: "10px 0 18px" }}
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={questions.length}
        aria-valuenow={session.index + 1}
        aria-labelledby="diagnostic-progress"
      >
        <span style={{ width: `${((session.index + 1) / questions.length) * 100}%` }} />
      </div>
      <h2 ref={headingRef} tabIndex={-1}>
        {q.question_text}
      </h2>
      <fieldset className="q-options diagnostic-options">
        <legend className="visually-hidden">Choose an answer</legend>
        {(["A", "B", "C", "D"] as const).map((letter) => {
          const text = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d }[letter];
          return (
            <label key={letter} className={`q-option diagnostic-option ${selected === letter ? "selected" : ""}`}>
              <input
                type="radio"
                name={`diagnostic-${q.question_id}`}
                value={letter}
                checked={selected === letter}
                onChange={() => choose(letter)}
              />
              <span>
                {letter}. {text}
              </span>
            </label>
          );
        })}
        <label className={`q-option diagnostic-option ${selected === "unsure" ? "selected" : ""}`}>
          <input
            type="radio"
            name={`diagnostic-${q.question_id}`}
            value="unsure"
            checked={selected === "unsure"}
            onChange={() => choose("unsure")}
          />
          <span>I'm not sure</span>
        </label>
      </fieldset>
      {!selected ? (
        <p className="notice" id="diagnostic-need-answer">
          Choose an answer to continue. You will not see whether it is correct until you submit.
        </p>
      ) : (
        <p className="notice">Answer saved. Correctness stays hidden until you submit.</p>
      )}
      <div className="home-exam-nav">
        <div className="row space">
          <button
            className="btn btn-ghost"
            type="button"
            disabled={session.index === 0}
            onClick={() => persist({ ...session, index: session.index - 1 })}
          >
            Previous
          </button>
          {last ? (
            <button className="btn btn-primary" type="button" disabled={!selected} aria-describedby={selected ? undefined : "diagnostic-need-answer"} onClick={submit}>
              Submit check
            </button>
          ) : (
            <button
              className="btn btn-primary"
              type="button"
              disabled={!selected}
              aria-describedby={selected ? undefined : "diagnostic-need-answer"}
              onClick={() => persist({ ...session, index: session.index + 1 })}
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DiagnosticResult({
  questions,
  session,
  onOpenFull,
  onOpenCards,
  onExit,
  onRetake,
}: {
  questions: Question[];
  session: DiagnosticSession;
  onOpenFull: () => void;
  onOpenCards: () => void;
  onExit: () => void;
  onRetake: () => void;
}) {
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const { correct, total } = scoreDiagnostic(questions, session.answers);
  useEffect(() => {
    headingRef.current?.focus();
  }, []);
  const band = recommendFor(correct);
  const scores = topicScores(questions, session.answers);
  const missed = missedTopics(scores);
  const focus = missed[0];
  const focusStudy = focus ? chapterHref(focus.topic) : null;
  const clicked = useRef(new Set<string>());

  function recommend(next: string, run: () => void) {
    if (clicked.current.has(next)) {
      run();
      return;
    }
    clicked.current.add(next);
    trackDiagnostic("diagnostic_recommend_click", `diagnostic-${next}`, { recommendation: band, next });
    run();
  }

  const primary =
    band === "full" ? (
      <button className="btn btn-primary" type="button" onClick={() => recommend("full", onOpenFull)}>
        {bandAction("full")}
      </button>
    ) : band === "review" && missed.length !== 1 ? (
      <a className="btn btn-primary" href="#diagnostic-topics" onClick={() => recommend("review", () => undefined)}>
        {bandAction("review")}
      </a>
    ) : (
      <Link
        className="btn btn-primary"
        href={focusStudy ?? paths.study}
        onClick={() => recommend(band === "basics" ? "basics" : "review", () => undefined)}
      >
        {bandAction(band)}
      </Link>
    );

  return (
    <div>
      <h2 ref={headingRef} tabIndex={-1}>
        {correct} of {total} correct
      </h2>
      <p>This short check suggests what to review. It does not predict your official exam result.</p>
      <div className="home-choice">{primary}</div>
      <h3 id="diagnostic-topics">Topics in this check</h3>
      <ul className="home-links">
        {scores.map((item) => {
          const study = chapterHref(item.topic);
          const freePractice = eligibleExamPool({ topic: item.topic, freeOnly: true }).length > 0;
          return (
            <li key={item.topic}>
              {item.label}: {item.correct} of {item.total} correct
              {study ? (
                <>
                  {" "}
                  <Link href={study} onClick={() => recommend(`study-${item.topic}`, () => undefined)}>
                    Study
                  </Link>
                </>
              ) : null}
              {freePractice ? (
                <>
                  {" "}
                  <Link href={paths.topic(item.topic)} onClick={() => recommend(`practice-${item.topic}`, () => undefined)}>
                    Practice
                  </Link>
                </>
              ) : (
                <span> · Practice for this topic is part of Pro. The study chapter is free.</span>
              )}
            </li>
          );
        })}
      </ul>
      <p className="notice">Topics that did not appear in this check are not scored.</p>
      <p className="notice">
        <button className="home-text-btn" type="button" onClick={() => recommend("flashcards", onOpenCards)}>
          Study with Flashcards
        </button>
        {" · "}
        Free preview is the first {FREE_FLASHCARD_PREVIEW} cards. Those cards are not matched to these topics. The rest of the deck is part of Pro.
      </p>
      {band !== "full" ? (
        <p>
          <button className="home-text-btn" type="button" onClick={() => recommend("full", onOpenFull)}>
            Take a Full Practice Exam
          </button>
        </p>
      ) : null}
      <p>
        <Link href={paths.practice} onClick={() => recommend("quick10", () => undefined)}>
          Practice 10 questions with instant feedback
        </Link>
      </p>
      <h3 id="diagnostic-review">Question review</h3>
      {questions.map((q, index) => (
        <QuestionReview key={q.question_id} q={q} index={index} choice={session.answers[q.question_id]} />
      ))}
      <div className="row" style={{ marginTop: 16 }}>
        <button className="btn btn-ghost" type="button" onClick={onRetake}>
          Check again
        </button>
        <button className="btn btn-ghost" type="button" onClick={onExit}>
          Back
        </button>
      </div>
    </div>
  );
}

function QuestionReview({ q, index, choice }: { q: Question; index: number; choice?: DiagnosticChoice }) {
  const correct = choice === q.correct_option;
  const source = findSource(q.source_id);
  const study = chapterHref(q.topic);
  const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const status = !choice ? "Not answered" : choice === "unsure" ? "Unsure" : correct ? "Correct" : "Not correct";
  const missingFeedback = (["A", "B", "C", "D"] as const).filter((letter) => letter !== q.correct_option && !q.option_feedback[letter]?.trim());

  return (
    <details className="card" style={{ marginTop: 12 }}>
      <summary>
        Question {index + 1}: {status}
      </summary>
      <p>{q.question_text}</p>
      <p>
        <strong>
          Correct answer: {q.correct_option}. {options[q.correct_option]}
        </strong>
      </p>
      {choice && choice !== "unsure" ? (
        <p>
          Your answer: {choice}. {options[choice]}
        </p>
      ) : (
        <p>Your answer: {choice === "unsure" ? "I'm not sure" : "Not answered"}</p>
      )}
      <p>{q.explanation.trim() ? q.explanation : "Explanation not on file."}</p>
      {q.option_feedback[q.correct_option]?.trim() ? <p>Why this is correct: {q.option_feedback[q.correct_option]}</p> : null}
      {(["A", "B", "C", "D"] as const)
        .filter((letter) => letter !== q.correct_option && q.option_feedback[letter]?.trim())
        .map((letter) => (
          <p key={letter}>
            Why {letter} is wrong: {q.option_feedback[letter]}
          </p>
        ))}
      {missingFeedback.length ? <p>Explanation for {missingFeedback.join(", ")} is not on file.</p> : null}
      {source ? (
        <p>
          Official basis:{" "}
          <a href={source.url}>
            {source.title}
          </a>{" "}
          · {q.source_reference}
        </p>
      ) : (
        <p>Official source not on file.{q.source_reference ? ` Cited reference: ${q.source_reference}` : ""}</p>
      )}
      {study ? <p><Link href={study}>Review this chapter</Link></p> : <p>No study chapter is mapped for this topic.</p>}
    </details>
  );
}
