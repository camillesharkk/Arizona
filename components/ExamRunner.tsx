"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { examConfig, officialExam } from "@/data/exam-config";
import {
  buildQuickExam,
  pickExamSet,
  pickFullExam,
  presentExamQuestions,
  scorePercent,
  topicLabel,
  weakTopics,
  type Letter,
} from "@/lib/quiz";
import { recordAnswer, saveProgress, toggleFlag, loadProgress, subscribeProgress } from "@/lib/storage";
import { AccountInvite } from "@/components/AccountInvite";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { TutorPanel } from "@/components/TutorPanel";
import { AnswerReview } from "@/components/AnswerReview";
import { getSource } from "@/data/sources";
import { AnswerExplain } from "@/components/AnswerExplain";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { paths } from "@/lib/paths";
import { examCompleteParams, examStartParams, trackAnalyticsEvent, trackEvent } from "@/lib/analytics";
import { usePracticeAutoAdvance } from "@/lib/practice-auto-advance";
import { SaveForReview } from "@/components/SaveForReview";
import { settleSave, SubmitStatus } from "@/components/SubmitStatus";

type Mode = "quick" | "full" | "weak" | "practice";

export function ExamRunner({
  mode,
  practice,
  preset,
  isPro = false,
  reportStart = "mount",
  layout = "page",
  persistKey,
  review = false,
  onRecorded,
}: {
  mode: Mode;
  practice?: boolean;
  preset?: Question[];
  isPro?: boolean;
  /** Homepage can show a question before a real attempt begins. */
  reportStart?: "mount" | "answer";
  layout?: "page" | "compact";
  /** Keep this sitting's question order and answers if the learner leaves and comes back. */
  persistKey?: string;
  /** Wrong-answer practice. A normal practice correct does not move the review plan. */
  review?: boolean;
  onRecorded?: () => void;
}) {
  const generatedSeed = useMemo(() => Math.floor(Math.random() * 1_000_000_000), []);
  const [sessionSeed, setSessionSeed] = useState(generatedSeed);
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const poolLocked = useRef(false);
  const [poolIsPro, setPoolIsPro] = useState(isPro);
  const count = mode === "quick" ? 10 : mode === "full" ? examConfig.questionCount : 10;
  const questions = useMemo(() => {
    const present = (list: Question[]) => {
      const { questions: out, maps } = presentExamQuestions(list, sessionSeed);
      toOriginalRef.current = maps;
      return out;
    };
    if (mode === "quick") {
      const picked = buildQuickExam({ isPro: reportStart === "answer" ? poolIsPro : isPro, seed: sessionSeed, stale: preset });
      if (picked.length !== 10) {
        console.error("[exam] Quick exam requires 10 questions; pool returned", picked.length);
        return [];
      }
      return present(picked);
    }
    if (preset?.length) return present(preset);
    if (mode === "full") {
      const picked = pickFullExam(sessionSeed);
      if (picked.length !== examConfig.questionCount) {
        console.error("[exam] Full exam requires", examConfig.questionCount, "questions; pool returned", picked.length);
        return [];
      }
      return present(picked);
    }
    if (mode === "weak") {
      const ids = loadProgress().wrongIds;
      const pool = pickExamSet(200, { seed: sessionSeed }).filter((q) => ids.includes(q.question_id));
      const preview = isPro ? 10 : 5;
      if (pool.length >= 3) return present(pool.slice(0, preview));
      return [];
    }
    return present(pickExamSet(count, { seed: sessionSeed }));
  }, [count, mode, preset, isPro, poolIsPro, reportStart, sessionSeed]);

  useEffect(() => {
    if (reportStart !== "answer" || poolLocked.current) return;
    setPoolIsPro(isPro);
  }, [isPro, reportStart]);

  const timed = mode === "full" && !practice;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const hydratedSession = useRef(false);

  useEffect(() => {
    if (!persistKey) return;
    if (!hydratedSession.current) {
      hydratedSession.current = true;
      try {
        const saved = JSON.parse(sessionStorage.getItem(persistKey) || "null") as {
          seed?: number;
          idx?: number;
          answers?: Record<string, "A" | "B" | "C" | "D">;
        } | null;
        if (!saved) return;
        if (typeof saved.seed === "number") setSessionSeed(saved.seed);
        if (typeof saved.idx === "number") setIdx(Math.max(0, saved.idx));
        if (saved.answers && typeof saved.answers === "object") setAnswers(saved.answers);
      } catch {
        /* keep the new sitting */
      }
      return;
    }
    try {
      sessionStorage.setItem(persistKey, JSON.stringify({ seed: sessionSeed, idx, answers }));
    } catch {
      /* storage can be blocked */
    }
  }, [persistKey, sessionSeed, idx, answers]);
  const [marked, setMarked] = useState<string[]>([]);
  useEffect(() => {
    setMarked(loadProgress().flaggedIds);
    return subscribeProgress(() => setMarked(loadProgress().flaggedIds));
  }, []);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(examConfig.timeLimitMinutes * 60);
  const weakReported = useRef(false);
  const startReported = useRef(false);
  const startedAt = useRef<number | null>(null);
  const choiceLock = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const answersRef = useRef(answers);
  const finishOnce = useRef(false);
  const localSaved = useRef(false);
  const examSaveId = useRef<string | null>(null);
  const completeReported = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const attemptIds = useRef<Record<string, string>>({});
  const reviewScroll = useRef(0);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [pastIndex, setPastIndex] = useState<number | null>(null);
  answersRef.current = answers;
  const { cancel: cancelAutoAdvance, scheduleAfterCorrect } = usePracticeAutoAdvance();

  function reportExamStart() {
    if (startReported.current || !questions.length) return;
    startReported.current = true;
    poolLocked.current = true;
    startedAt.current = Date.now();
    const plan = isPro ? "pro" : "free";
    const start = examStartParams({ mode, practice, questionCount: questions.length, plan });
    trackAnalyticsEvent("exam_start", start);
    if (start.mode === "quick10") trackEvent("quick10_start");
    if (start.mode === "full45") trackEvent("full45_start", { plan });
  }

  useEffect(() => {
    if (reportStart !== "mount") return;
    reportExamStart();
  }, [questions.length, mode, isPro, practice, reportStart]);

  useEffect(() => {
    if (!timed || done) return;
    const t = window.setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          window.clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(t);
  }, [timed, done]);

  useEffect(() => {
    if (timed && seconds === 0 && !done) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, timed, done]);

  useEffect(() => {
    if (done) return;
    headingRef.current?.focus({ preventScroll: true });
  }, [idx, done]);

  const q = questions[idx];
  const selected = q ? answers[q.question_id] : undefined;

  if (!q) {
    return (
      <div className="card">
        {mode === "full" ? (
          <>
            <h2>Full 45 is not available</h2>
            <p>
              A full practice test must contain exactly {examConfig.questionCount} unique published questions. The current
              eligible bank does not, so the exam was not started. This is not a shortened 45-question test.
            </p>
          </>
        ) : (
          <p>Not enough questions in this set. Try Full 45 or open Exam Questions.</p>
        )}
        <Link className="btn btn-primary" href={paths.questions}>
          Start Questions
        </Link>
      </div>
    );
  }

  function attemptId(questionId: string) {
    if (!attemptIds.current[questionId]) attemptIds.current[questionId] = crypto.randomUUID();
    return attemptIds.current[questionId];
  }

  function originalLetter(questionId: string, display: Letter): Letter {
    return toOriginalRef.current[questionId]?.[display] ?? display;
  }

  function goTo(nextIdx: number) {
    cancelAutoAdvance();
    setPastIndex(null);
    setWrongId(null);
    setIdx(nextIdx);
  }

  function openPast() {
    if (idx < 1) return;
    cancelAutoAdvance();
    reviewScroll.current = window.scrollY;
    setPastIndex(idx - 1);
  }

  function closePast() {
    const y = reviewScroll.current;
    setPastIndex(null);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }

  function choose(letter: "A" | "B" | "C" | "D") {
    if (reportStart === "answer") reportExamStart();
    if (!practice && timed && done) return;
    if (practice) {
      if (answersRef.current[q.question_id] || choiceLock.current === q.question_id) return;
      choiceLock.current = q.question_id;
    }
    const nextAnswers = { ...answersRef.current, [q.question_id]: letter };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    if (practice) {
      recordAnswer(q.question_id, letter === q.correct_option);
      fetch("/api/progress/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: q.question_id,
          selected: originalLetter(q.question_id, letter),
          attemptId: attemptId(q.question_id),
          review,
        }),
      }).then(() => onRecorded?.()).catch(() => undefined);
      if (mode === "weak" && isPro && !weakReported.current) {
        weakReported.current = true;
        fetch("/api/billing/pro-usage/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featureCode: "weak_areas" }),
        }).catch(() => undefined);
      }
      if (letter === q.correct_option) {
        setWrongId(null);
        const at = idx;
        scheduleAfterCorrect(() => {
          if (at + 1 < questions.length) setIdx(at + 1);
          else finish();
        });
      } else {
        cancelAutoAdvance();
        setWrongId(q.question_id);
      }
    }
  }

  async function finish() {
    if (finishOnce.current || submitting) return;
    if (reportStart === "answer" && Object.keys(answersRef.current).length === 0) return;
    finishOnce.current = true;
    setSubmitError("");
    setSubmitting(true);
    if (reportStart === "answer") reportExamStart();
    cancelAutoAdvance();
    const current = answersRef.current;
    const results = questions.map((item) => ({
      question: item,
      correct: current[item.question_id] === item.correct_option,
    }));
    const pct = scorePercent(results.filter((r) => r.correct).length, questions.length);
    if (!localSaved.current) {
      localSaved.current = true;
      if (!practice) results.forEach((r) => recordAnswer(r.question.question_id, r.correct));
      const prev = loadProgress();
      saveProgress({
        lastScore: pct,
        lastMode: mode,
        scores: [{ at: new Date().toISOString(), score: pct, mode }, ...prev.scores].slice(0, 20),
      });
    }
    if (!examSaveId.current) examSaveId.current = crypto.randomUUID();
    const saves: Promise<Response>[] = [];
    if (!practice) results.forEach((r) => {
      const letter = current[r.question.question_id];
      if (letter) {
        saves.push(fetch("/api/progress/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: r.question.question_id,
            selected: originalLetter(r.question.question_id, letter),
            attemptId: attemptId(r.question.question_id),
            review: false,
          }),
        }));
      }
    });
    saves.push(fetch("/api/progress/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "exam",
        mode,
        score: pct,
        correctCount: results.filter((r) => r.correct).length,
        total: questions.length,
        examId: examSaveId.current,
      }),
    }));
    const outcomes = await Promise.all(saves.map((save) => settleSave(save)));
    if (outcomes.some((outcome) => outcome === "fail")) {
      finishOnce.current = false;
      setSubmitting(false);
      setSubmitError("We couldn't save this exam. Your answers are still here.");
      return;
    }
    setSubmitting(false);
    setDone(true);
    if (!completeReported.current) {
      completeReported.current = true;
      const elapsed = startedAt.current == null ? undefined : Math.max(0, Math.round((Date.now() - startedAt.current) / 1000));
      trackAnalyticsEvent(
        "exam_complete",
        examCompleteParams({
          mode,
          practice,
          questionCount: questions.length,
          answeredCount: Object.keys(current).length,
          score: pct,
          passed: pct >= examConfig.passingScorePercent,
          plan: isPro ? "pro" : "free",
          durationSeconds: elapsed,
        })
      );
    }
  }

  if (done) {
    const results = questions.map((item) => ({
      question: item,
      correct: answers[item.question_id] === item.correct_option,
    }));
    const correct = results.filter((r) => r.correct).length;
    const pct = scorePercent(correct, questions.length);
    const pass = pct >= examConfig.passingScorePercent;
    const weak = weakTopics(results, 4).filter((w) => w.wrong > 0);
    const topicAcc = new Map<string, { right: number; total: number; label: string }>();
    results.forEach((r) => {
      const cur = topicAcc.get(r.question.topic) || { right: 0, total: 0, label: topicLabel(r.question.topic) };
      cur.total += 1;
      if (r.correct) cur.right += 1;
      topicAcc.set(r.question.topic, cur);
    });
    const sources = [...new Set(results.map((r) => r.question.source_reference))];
    return (
      <div className="grid">
        <div className="card">
          <span className="kicker">Result</span>
          <h2>
            {pct}% — {pass ? "PASS" : "NEEDS REVIEW"}
          </h2>
          <p className="lede">
            {correct} of {questions.length} correct. Practice target {examConfig.passingScorePercent}%. The SOS notice
            checked {officialExam.checkedOn} lists {officialExam.passingScorePercent}% for the official exam. This result is not an SOS score.
          </p>
          <h3>Topic accuracy</h3>
          {[...topicAcc.entries()].map(([id, v]) => (
            <p key={id}>
              {v.label}: {Math.round((v.right / v.total) * 100)}% ({v.total - v.right} missed)
            </p>
          ))}
          {weak.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p>
                <strong>Your weakest areas are:</strong>
              </p>
              <ul>
                {weak.map((w) => (
                  <li key={w.topic}>{w.label}</li>
                ))}
              </ul>
              <p>Review those chapters in the free study guide, then drill the missed items.</p>
            </div>
          )}
          <h3>Official sources</h3>
          <ul>
            {sources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="row" style={{ marginTop: 16 }}>
            {weak.length > 0 ? (
              <Link className="btn btn-primary" href={`${paths.practice}?mode=weak`}>
                Fix My Weak Areas
              </Link>
            ) : (
              <Link className="btn btn-primary" href={paths.questions}>
                Continue Practice
              </Link>
            )}
            <WrongAnswersLink className="btn btn-ghost" label="Review wrong answers" />
            <Link className="btn btn-ghost" href={paths.study}>
              Review Study Guide
            </Link>
          </div>
          <AccountInvite />
          {isPro ? (
            <p className="notice">Pro is active. Keep practicing the topics you missed.</p>
          ) : (
            <p className="notice">
              Free practice uses the free question pool. A free account can record {FREE_FULL_EXAMS} full exam, and this browser can start one before you sign in. Pro opens the rest of the bank and more full exams.{" "}
              <Link href={paths.pricing}>View Pro</Link>
            </p>
          )}
        </div>
        {results.map((r, i) => (
          <QuestionBlock
            key={r.question.question_id}
            q={r.question}
            index={i}
            selected={answers[r.question.question_id]}
            reveal
            isPro={isPro}
            lockPaid={false}
            extra={<SaveForReview questionId={r.question.question_id} hint={false} />}
          />
        ))}
      </div>
    );
  }

  const source = getSource(q.source_id);
  const remain = seconds;
  const lastQuestion = idx + 1 >= questions.length;
  const practiceLocked = Boolean(practice && selected);
  const showingWrong = Boolean(practice && wrongId === q.question_id && selected && selected !== q.correct_option);
  const past = pastIndex != null ? questions[pastIndex] : null;
  const nextLabel = lastQuestion ? (practice ? "See results" : "Submit exam") : "Next";
  const questionBody =
    past && pastIndex != null ? (
      <AnswerReview q={past} index={pastIndex} selected={answers[past.question_id]} onBack={closePast} />
    ) : showingWrong && selected ? (
      <AnswerReview q={q} index={idx} selected={selected} />
    ) : (
      <>
        <QuestionBlock
          q={q}
          index={idx}
          selected={selected}
          reveal={Boolean(practice && selected)}
          explain={false}
          onChoose={choose}
          lockPaid={false}
          lockChoice={practiceLocked}
          headingRef={headingRef}
          isPro={isPro}
          marked={marked.includes(q.question_id)}
          onMark={() => toggleFlag(q.question_id)}
          extra={<SaveForReview questionId={q.question_id} hint={false} />}
        />
        {practice && selected === q.correct_option ? (
          <p className="notice" role="status">Correct.</p>
        ) : null}
        {!!selected && practice ? <TutorPanel q={q} selected={originalLetter(q.question_id, selected)} /> : null}
        {layout === "compact" || !practice ? (
          <p className="notice">
            {source.title} · {q.source_reference} · Last verified {q.last_verified_at}
          </p>
        ) : null}
      </>
    );
  const previousAnswer =
    practice && idx > 0 && pastIndex == null ? (
      <button className="card-corner-btn" type="button" onClick={openPast}>
        Previous answer
      </button>
    ) : null;
  const submitStatus = (
    <>
      {submitting ? <SubmitStatus /> : null}
      {submitError ? (
        <p className="form-error" role="alert">
          {submitError}{" "}
          <button className="btn btn-ghost" type="button" onClick={() => void finish()}>Try again</button>
        </p>
      ) : null}
    </>
  );

  const prevLocked = idx === 0 || pastIndex != null || (layout === "compact" && submitting);
  const nextLocked = pastIndex != null || submitting || (layout === "compact" ? false : practice ? !selected : false);
  return (
    <div className="home-exam">
      <div className="row space">
        <span className="notice">Question {idx + 1} of {questions.length}</span>
        {timed ? <span className="badge">{formatTime(remain)}</span> : <span className="badge">Practice mode — instant feedback</span>}
      </div>
      <div className="progress-bar" style={{ margin: "10px 0 18px" }}>
        <span style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>
      {previousAnswer}
      {questionBody}
      {submitStatus}
      <div className="home-exam-nav">
        <div className="row space">
          <button className="btn btn-ghost" type="button" disabled={prevLocked} onClick={() => goTo(idx - 1)}>
            Previous
          </button>
          <button
            className={lastQuestion && !practice ? "btn btn-sage" : "btn btn-primary"}
            type="button"
            disabled={nextLocked}
            onClick={() => (lastQuestion ? void finish() : goTo(idx + 1))}
          >
            {nextLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export function QuestionBlock({
  q,
  index,
  selected,
  reveal,
  onChoose,
  marked,
  onMark,
  isPro,
  lockPaid = true,
  lockChoice = false,
  headingRef,
  explain,
  extra,
}: {
  q: Question;
  index: number;
  selected?: "A" | "B" | "C" | "D";
  reveal?: boolean;
  onChoose?: (l: "A" | "B" | "C" | "D") => void;
  marked?: boolean;
  onMark?: () => void;
  isPro?: boolean;
  lockPaid?: boolean;
  lockChoice?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  explain?: boolean;
  extra?: ReactNode;
}) {
  const letters = ["A", "B", "C", "D"] as const;
  const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const locked = lockPaid && !q.is_free && !isPro;
  const choiceDisabled = !onChoose || locked || lockChoice;
  const showWriteup = explain ?? Boolean(reveal);
  return (
    <div className="card">
      <div className="quiz-meta">
        <span className="kicker">
          {topicLabel(q.topic)} · {q.difficulty}
          {!q.is_free ? " · Pro" : ""}
        </span>
        <div className="quiz-meta-actions">
          {extra}
          {onMark && (
            <button className="btn btn-ghost" type="button" onClick={onMark} aria-pressed={Boolean(marked)}>
              {marked ? "Flagged" : "Flag question"}
            </button>
          )}
        </div>
      </div>
      <h3 className="quiz-heading quiz-stem" ref={headingRef} tabIndex={-1}>
        {index + 1}. {q.question_text}
      </h3>
      {locked ? (
        <div className="explain">
          <strong>Pro question</strong>
          <p>This item is in the full question bank. Unlock Pro to turn weak topics into passing scores.</p>
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
        </div>
      ) : null}
      <div className="q-options" role="group" aria-label="Answer choices">
        {letters.map((l) => {
          let cls = "q-option";
          if (selected === l) cls += " selected";
          if (reveal) {
            if (l === q.correct_option) cls += " correct";
            else if (selected === l) cls += " wrong";
          }
          const status =
            reveal && l === q.correct_option
              ? "Correct answer"
              : reveal && selected === l
                ? "Your answer — incorrect"
                : null;
          return (
            <button
              key={l}
              className={cls}
              type="button"
              aria-pressed={selected === l}
              aria-label={`${l}. ${map[l]}${status ? `. ${status}` : ""}`}
              disabled={choiceDisabled}
              onClick={() => onChoose?.(l)}
            >
              <span className="q-option-inner">
                <strong>{l}.</strong> {map[l]}
                {status ? (
                  <span className={l === q.correct_option ? "q-option-tag" : "q-option-tag q-option-tag-wrong"}>
                    {status}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      {showWriteup && !locked ? (
        <AnswerExplain
          status={!selected ? "Unanswered" : selected === q.correct_option ? "Correct" : "Not quite"}
          explanation={q.explanation}
          wrongNote={selected && selected !== q.correct_option ? q.option_feedback[selected] : undefined}
          sourceUrl={getSource(q.source_id).url}
          sourceLabel={q.source_reference}
          reviewLinks={q.concept_ids?.slice(0, 2).map((id, index) => ({
            href: `${paths.flashcards}?card=${id}`,
            label: index === 0 ? "Review this rule" : "See the comparison",
          }))}
        />
      ) : null}
    </div>
  );
}
