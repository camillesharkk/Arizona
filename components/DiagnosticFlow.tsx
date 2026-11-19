"use client";

import { MemberCopy } from "@/components/MemberCopy";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { chapters } from "@/data/study-guide";
import { AnswerExplain } from "@/components/AnswerExplain";
import {
  arizonaDiagnostic,
  bandAction,
  blankSession,
  diagnosticStorageKey,
  missedTopics,
  parseDiagnosticSession,
  recommendFor,
  scoreDiagnostic,
  topicScores,
  type DiagnosticChoice,
  type DiagnosticSession,
} from "@/lib/diagnostic-ui";
import { trackAnalyticsEvent } from "@/lib/analytics";
import { currentEmail } from "@/lib/account";
import { paths } from "@/lib/paths";
import azPublic from "@/data/az-public.json";
import type { Question, TopicId } from "@/lib/types";

const profile = arizonaDiagnostic;

function lookupQuestion(id: string) {
  const saved = readStems();
  return saved.questions.find((question) => question.question_id === id) ?? null;
}

function readStems(): { questions: Question[]; token: string } {
  if (typeof window === "undefined") return { questions: [], token: "" };
  try {
    const parsed = JSON.parse(localStorage.getItem(`${diagnosticStorageKey(currentEmail())}:stems`) || "");
    return { questions: Array.isArray(parsed?.questions) ? parsed.questions : [], token: typeof parsed?.token === "string" ? parsed.token : "" };
  } catch {
    return { questions: [], token: "" };
  }
}

function writeStems(questions: Question[], token: string) {
  localStorage.setItem(`${diagnosticStorageKey(currentEmail())}:stems`, JSON.stringify({ questions, token }));
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
    if (!session) {
      localStorage.removeItem(key);
      localStorage.removeItem(`${key}:stems`);
    } else localStorage.setItem(key, JSON.stringify(session));
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
  const tokenRef = useRef("");
  const [submitError, setSubmitError] = useState("");

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
      tokenRef.current = readStems().token;
      setQuestions(saved.questions);
      setSession(next);
      writeSaved(next);
      if (!saved.session.startSent) trackDiagnostic("diagnostic_start", "diagnostic");
      return;
    }
    let cancel = false;
    fetch("/api/practice/batch/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: "AZ", mode: "diagnostic", practice: true }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (cancel) return;
        if (!response.ok || !Array.isArray(body.questions) || body.questions.length !== profile.questionCount) {
          setUnavailable(true);
          return;
        }
        tokenRef.current = body.token || "";
        const next = { ...blankSession(body.questions), startSent: true };
        setQuestions(body.questions);
        setSession(next);
        writeSaved(next);
        writeStems(body.questions, tokenRef.current);
        trackDiagnostic("diagnostic_start", "diagnostic");
      })
      .catch(() => {
        if (!cancel) setUnavailable(true);
      });
    return () => {
      cancel = true;
    };
  }, [fresh, showResult]);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
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

  async function submit() {
    if (submitting.current || session!.completeSent) return;
    submitting.current = true;
    setSubmitError("");
    const response = await fetch("/api/practice/feedback/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: tokenRef.current,
        action: "grade",
        answers: questions.map((item) => ({
          questionId: item.question_id,
          display: session!.answers[item.question_id] === "unsure" ? undefined : session!.answers[item.question_id],
        })),
      }),
    });
    const graded = await response.json().catch(() => ({}));
    if (!response.ok) {
      submitting.current = false;
      setSubmitError(graded.error || "Could not score this check. Your answers are still here.");
      return;
    }
    const rows = new Map<string, { correctOption?: Question["correct_option"]; explanation?: string; optionFeedback?: Question["option_feedback"] }>((graded.results || []).map((row: { questionId: string; correctOption?: Question["correct_option"]; explanation?: string; optionFeedback?: Question["option_feedback"] }) => [row.questionId, row]));
    const revealed = questions.map((item) => {
      const row = rows.get(item.question_id);
      return row?.correctOption ? { ...item, correct_option: row.correctOption, explanation: row.explanation || "", option_feedback: row.optionFeedback || item.option_feedback } : item;
    });
    setQuestions(revealed);
    writeStems(revealed, graded.token || tokenRef.current);
    const next: DiagnosticSession = { ...session!, status: "complete", completeSent: true, index: session!.index };
    persist(next);
    const { correct } = scoreDiagnostic(revealed, next.answers);
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
      <div className="card">
      <h2 className="quiz-stem" ref={headingRef} tabIndex={-1}>
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
          Choose an answer to continue.
        </p>
      ) : null}
      </div>
      <div className="home-exam-nav">
        <div className="row space">
          <button className="btn btn-ghost" type="button" disabled={session.index === 0} onClick={() => persist({ ...session, index: session.index - 1 })}>
            Previous
          </button>
          <button className="btn btn-primary" type="button" disabled={!selected || submitting.current} onClick={() => (last ? void submit() : persist({ ...session, index: session.index + 1 }))}>
            {last ? "Submit check" : "Next"}
          </button>
        </div>
        {submitError ? <p className="form-error" role="alert">{submitError}</p> : null}
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
    headingRef.current?.focus({ preventScroll: true });
  }, []);
  const band = recommendFor(correct);
  const scores = topicScores(questions, session.answers);
  const missed = missedTopics(scores);
  const focus = missed[0];
  const focusStudy = focus ? chapterHref(focus.topic) : null;
  const advice = !missed.length
    ? "Every answer in this check was correct."
    : missed.length === 1
      ? `Review ${missed[0].label}. That is the topic you missed.`
      : missed.length === 2
        ? `Review ${missed[0].label} and ${missed[1].label}. Those are the topics you missed.`
        : `Review ${missed[0].label} and ${missed[1].label} first. You also missed ${missed.length - 2} other topics.`;
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
      <h2 className="quiz-result" ref={headingRef} tabIndex={-1}>
        {correct} of {total} correct
      </h2>
      <p className="home-lead">{advice}</p>
      <div className="home-actions">{primary}</div>
      <details className="home-more" id="diagnostic-topics">
        <summary>Topics in this check</summary>
        <ul className="home-links">
          {scores.map((item) => {
            const study = chapterHref(item.topic);
            const freePractice = (azPublic.freeTopics as string[]).includes(item.topic);
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
                  <span><MemberCopy member={<> · Practice for this topic is part of Pro. The study chapter is available to all learners.</>}> · Practice for this topic is part of Pro. The study chapter is free.</MemberCopy></span>
                )}
              </li>
            );
          })}
        </ul>
        <p className="notice">Topics that did not appear in this check are not scored.</p>
      </details>
      <details className="home-more" id="diagnostic-review">
        <summary>Review answers</summary>
        {questions.map((q, index) => (
          <QuestionReview key={q.question_id} q={q} index={index} choice={session.answers[q.question_id]} />
        ))}
      </details>
      <p className="home-sub">
        <button className="home-text-btn" type="button" onClick={() => recommend("flashcards", onOpenCards)}>
          Study Flashcards
        </button>
        <span aria-hidden="true"> · </span>
        <button className="home-text-btn home-restart" type="button" onClick={onRetake}>
          Start over
        </button>
        <span aria-hidden="true"> · </span>
        <button className="home-text-btn home-restart" type="button" onClick={onExit}>
          Back
        </button>
      </p>
    </div>
  );
}

function QuestionReview({ q, index, choice }: { q: Question; index: number; choice?: DiagnosticChoice }) {
  const correct = choice === q.correct_option;
  const study = chapterHref(q.topic);
  const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const status = !choice ? "Not answered" : choice === "unsure" ? "Unsure" : correct ? "Correct" : "Not correct";

  return (
    <details className="home-review">
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
      <AnswerExplain
        question={q}
        explanation={q.explanation}
        wrongNote={choice && choice !== "unsure" && choice !== q.correct_option ? q.option_feedback[choice] : undefined}
      />
      {study ? <p><Link href={study}>Review this chapter</Link></p> : <p>No study chapter is mapped for this topic.</p>}
    </details>
  );
}
