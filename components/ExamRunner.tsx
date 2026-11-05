"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { publishedQuestions } from "@/data/questions";
import { publishedCaQuestions } from "@/data/ca-questions";
import { pickCaFullExam, pickCaQuickExam, weakestCaArea } from "@/lib/ca-exam";
import { areaLabel, caPaths } from "@/lib/ca-site";
import { examConfig, officialExam } from "@/data/exam-config";
import {
  buildQuickExam,
  pickExamSet,
  pickFullExam,
  presentExamQuestions,
  scorePercent,
  shuffle,
  topicLabel,
  weakTopics,
  type Letter,
} from "@/lib/quiz";
import { recordAnswer, saveProgress, loadProgress } from "@/lib/storage";
import { AccountInvite } from "@/components/AccountInvite";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { AnswerResult } from "@/components/AnswerResult";
import { ExamNav, FlagIcon, LoadingNote, QuestionJump } from "@/components/QuizChrome";
import { paths } from "@/lib/paths";
import { examCompleteParams, examStartParams, trackAnalyticsEvent, trackEvent } from "@/lib/analytics";
import { usePracticeAutoAdvance } from "@/lib/practice-auto-advance";
import { SaveForReview } from "@/components/SaveForReview";
import { settleSave, SubmitStatus } from "@/components/SubmitStatus";
import { clearSitting, openSitting, readSitting, remainingSeconds, writeSitting, type Sitting, type SittingState } from "@/lib/sitting";
import { weakestMissedTopic, topicStudyHref } from "@/lib/next-step";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { scrollUnderHeaderAfterLayout } from "@/lib/scroll-under-header";

type Mode = "quick" | "full" | "weak" | "practice";

export function ExamRunner({
  mode,
  practice,
  preset,
  isPro = false,
  reportStart = "mount",
  layout = "page",
  sittingMode,
  review = false,
  onRecorded,
  stateCode = "AZ",
  focusArea,
}: {
  mode: Mode;
  practice?: boolean;
  preset?: Question[];
  isPro?: boolean;
  /** Homepage can show a question before a real attempt begins. */
  reportStart?: "mount" | "answer";
  layout?: "page" | "compact";
  /** Separate saved progress for this account, state, and practice mode. */
  sittingMode?: string;
  /** Wrong-answer practice. A normal practice correct does not move the review plan. */
  review?: boolean;
  onRecorded?: () => void;
  stateCode?: SittingState;
  focusArea?: string;
}) {
  const modeKey = sittingMode || mode;
  const site = stateCode === "CA" ? caPaths : paths;
  const examMinutes = stateCode === "CA" ? 60 : examConfig.timeLimitMinutes;
  const fullSize = stateCode === "CA" ? 45 : examConfig.questionCount;
  const anonFullKey = stateCode === "CA" ? "ca-anon-full-started" : "az-anon-full-started";
  const unscoredRef = useRef<string[]>([]);
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const poolLocked = useRef(false);
  const [poolIsPro, setPoolIsPro] = useState(isPro);
  const count = mode === "quick" ? 10 : mode === "full" ? fullSize : 10;
  const byId = useMemo(
    () => new Map((stateCode === "CA" ? publishedCaQuestions() : publishedQuestions()).map((item) => [item.question_id, item])),
    [stateCode]
  );
  const [owner, setOwner] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [bootError, setBootError] = useState(false);
  const [bootTry, setBootTry] = useState(0);
  const [activeSeed, setActiveSeed] = useState<number | null>(null);
  const [lockedIds, setLockedIds] = useState<string[] | null>(null);
  const [restored, setRestored] = useState(false);
  const questions = useMemo(() => {
    if (activeSeed == null || !lockedIds?.length) return [];
    const list = lockedIds.flatMap((id) => {
      const question = byId.get(id);
      return question ? [question] : [];
    });
    const { questions: out, maps } = presentExamQuestions(list, activeSeed);
    toOriginalRef.current = maps;
    return out;
  }, [activeSeed, lockedIds, byId]);

  useEffect(() => {
    if (reportStart !== "answer" || poolLocked.current) return;
    setPoolIsPro(isPro);
  }, [isPro, reportStart]);

  const timed = mode === "full" && !practice;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [explainOpen, setExplainOpen] = useState<Record<string, boolean>>({});
  const [marked, setMarked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(examMinutes * 60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const recordedIds = useRef<string[]>([]);
  const booted = owner != null && activeSeed != null && lockedIds != null;
  const weakReported = useRef(false);
  const startReported = useRef(false);
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
  const [pastIndex, setPastIndex] = useState<number | null>(null);
  answersRef.current = answers;
  const { cancel: cancelAutoAdvance, scheduleAfterCorrect } = usePracticeAutoAdvance();

  function drawQuestionIds(seed: number) {
    if (stateCode === "CA") {
      if (focusArea) {
        const pool = publishedCaQuestions().filter((item) => item.study_topic === focusArea || item.exam_area === focusArea);
        return shuffle(pool, seed).slice(0, 10).map((item) => item.question_id);
      }
      if (mode === "quick") return pickCaQuickExam(seed).map((item) => item.question_id);
      if (mode === "full") {
        const picked = pickCaFullExam(seed);
        if (!picked) return [];
        unscoredRef.current = picked.unscoredIds;
        return picked.questions.map((item) => item.question_id);
      }
      const missed = loadProgress("CA").wrongIds;
      return publishedCaQuestions().filter((item) => missed.includes(item.question_id)).slice(0, 10).map((item) => item.question_id);
    }
    if (mode === "quick") {
      const picked = buildQuickExam({ isPro: reportStart === "answer" ? poolIsPro : isPro, seed, stale: preset });
      return picked.length === 10 ? picked.map((item) => item.question_id) : [];
    }
    if (preset?.length) return preset.map((item) => item.question_id);
    if (mode === "full") {
      const picked = pickFullExam(seed);
      return picked.length === examConfig.questionCount ? picked.map((item) => item.question_id) : [];
    }
    if (mode === "weak") {
      const missed = loadProgress().wrongIds;
      const pool = pickExamSet(200, { seed }).filter((item) => missed.includes(item.question_id));
      const preview = isPro ? 10 : 5;
      return pool.length >= 3 ? pool.slice(0, preview).map((item) => item.question_id) : [];
    }
    return pickExamSet(count, { seed }).map((item) => item.question_id);
  }

  function currentSitting(patch: Partial<Sitting> = {}): Sitting | null {
    if (!owner || activeSeed == null || !lockedIds) return null;
    return {
      version: 1,
      owner,
      state: stateCode,
      mode: modeKey,
      seed: activeSeed,
      questionIds: lockedIds,
      idx,
      answers,
      explainOpen,
      flaggedIds: marked,
      startedAt,
      timeLimitSeconds: timed ? examMinutes * 60 : null,
      unscoredIds: unscoredRef.current,
      done,
      examId: examSaveId.current,
      attemptIds: attemptIds.current,
      recordedIds: recordedIds.current,
      scored: localSaved.current,
      ...patch,
    };
  }

  function persistSitting(patch: Partial<Sitting> = {}) {
    const sitting = currentSitting(patch);
    if (!sitting) return;
    try {
      writeSitting(sessionStorage, sitting);
    } catch {
      /* storage can be blocked */
    }
  }

  useEffect(() => {
    let cancel = false;
    setBootError(false);
    fetch("/api/auth/me/")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("account"))))
      .then((data) => {
        if (cancel) return;
        const nextOwner = data.user?.id || "guest";
        setSignedIn(Boolean(data.user));
        setFullExamCount(Number((stateCode === "CA" ? data.user?.caFullExamCount : data.user?.fullExamCount) || 0));
        const existing = readSitting(sessionStorage, nextOwner, modeKey, stateCode);
        const seed = existing?.seed ?? Math.floor(Math.random() * 1_000_000_000);
        if (existing?.unscoredIds?.length) unscoredRef.current = existing.unscoredIds;
        const ids = existing?.questionIds?.length ? existing.questionIds : drawQuestionIds(seed);
        setOwner(nextOwner);
        setActiveSeed(seed);
        setLockedIds(ids);
        if (!existing) return;
        setIdx(Math.min(existing.idx, Math.max(0, ids.length - 1)));
        setAnswers(existing.answers);
        answersRef.current = existing.answers;
        setExplainOpen(existing.explainOpen);
        setMarked(existing.flaggedIds);
        setDone(existing.done);
        attemptIds.current = existing.attemptIds;
        recordedIds.current = existing.recordedIds;
        examSaveId.current = existing.examId;
        localSaved.current = existing.scored;
        if (existing.startedAt != null) {
          startReported.current = true;
          poolLocked.current = true;
          setStartedAt(existing.startedAt);
          if (existing.timeLimitSeconds) setSeconds(remainingSeconds(existing.startedAt, existing.timeLimitSeconds, Date.now()));
        }
        setRestored(true);
      })
      .catch(() => {
        if (!cancel) setBootError(true);
      });
    return () => {
      cancel = true;
    };
    // Draw once for this mode. A restored sitting keeps its own question ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootTry, modeKey]);

  useEffect(() => {
    persistSitting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, activeSeed, lockedIds, idx, answers, explainOpen, marked, startedAt, done, modeKey]);

  function reportExamStart() {
    if (startReported.current || !questions.length) return;
    startReported.current = true;
    poolLocked.current = true;
    setStartedAt((current) => current ?? Date.now());
    const plan = isPro ? "pro" : "free";
    const start = examStartParams({ mode, practice, questionCount: questions.length, plan, state: stateCode });
    trackAnalyticsEvent("exam_start", start);
    if (start.mode === "quick10") trackEvent("quick10_start");
    if (start.mode === "full45") trackEvent("full45_start", { plan });
  }

  useEffect(() => {
    if (!booted || reportStart !== "mount" || startedAt) return;
    reportExamStart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booted, questions.length, reportStart, startedAt]);

  useEffect(() => {
    if (!timed || done || !startedAt) return;
    const limit = examMinutes * 60;
    const tick = () => setSeconds(remainingSeconds(startedAt, limit, Date.now()));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [timed, done, startedAt]);

  useEffect(() => {
    if (booted && timed && seconds === 0 && startedAt && !done) finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, timed, done, booted, startedAt]);

  const q = questions[idx];
  const selected = q ? answers[q.question_id] : undefined;

  const scrollIdx = useRef<number | null>(null);
  const scrollExplain = useRef(false);
  useEffect(() => {
    if (!booted || done || !q) return;
    const open = Boolean(explainOpen[q.question_id]);
    const idxChanged = scrollIdx.current !== idx;
    const explainOpened = open && !scrollExplain.current;
    scrollIdx.current = idx;
    scrollExplain.current = open;
    if (!idxChanged && !explainOpened) return;
    headingRef.current?.focus({ preventScroll: true });
    const explain = open ? document.querySelector(".home-exam .explain") : null;
    scrollUnderHeaderAfterLayout(idxChanged && !open ? headingRef.current : explain || headingRef.current);
  }, [idx, booted, done, q, explainOpen]);

  if (!booted) {
    if (bootError) {
      return (
        <div className="card">
          <p className="form-error" role="alert">Could not load this practice set.</p>
          <button className="btn btn-primary" type="button" onClick={() => setBootTry((n) => n + 1)}>Retry</button>
        </div>
      );
    }
    return <LoadingNote />;
  }

  if (!q) {
    return (
      <div className="card">
        {mode === "full" ? (
          <>
            <h2>Full 45 is not available</h2>
            <p>
              A full practice test must contain exactly {fullSize} unique published questions. The current
              eligible bank does not, so the exam was not started. This is not a shortened 45-question test.
            </p>
          </>
        ) : (
          <p>Not enough questions in this set. Try Full 45 or open Exam Questions.</p>
        )}
        <Link className="btn btn-primary" href={site.questions}>
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
      if (recordedIds.current.includes(q.question_id) || answersRef.current[q.question_id] || choiceLock.current === q.question_id) return;
      choiceLock.current = q.question_id;
      recordedIds.current = [...recordedIds.current, q.question_id];
    }
    const nextAnswers = { ...answersRef.current, [q.question_id]: letter };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
    if (practice) {
      recordAnswer(q.question_id, letter === q.correct_option, stateCode);
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
        const at = idx;
        scheduleAfterCorrect(() => {
          if (at + 1 < questions.length) setIdx(at + 1);
          else finish();
        });
      } else {
        cancelAutoAdvance();
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
    if (!examSaveId.current) examSaveId.current = crypto.randomUUID();
    if (!localSaved.current) {
      localSaved.current = true;
      if (!practice) results.forEach((r) => recordAnswer(r.question.question_id, r.correct, stateCode));
      const prev = loadProgress(stateCode);
      saveProgress({
        lastScore: pct,
        lastMode: mode,
        scores: [{ at: new Date().toISOString(), score: pct, mode }, ...prev.scores].slice(0, 20),
      }, stateCode);
    }
    persistSitting({ examId: examSaveId.current, scored: true });
    const saves: Promise<Response>[] = [];
    if (!practice || stateCode === "CA") results.forEach((r) => {
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
            state: stateCode,
          }),
        }));
      }
    });
    const scoredResults = stateCode === "CA" && mode === "full"
      ? results.filter((item) => !unscoredRef.current.includes(item.question.question_id))
      : results;
    const scoredCorrect = scoredResults.filter((item) => item.correct).length;
    saves.push(fetch("/api/progress/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "exam",
        mode,
        score: stateCode === "CA" && mode === "full" ? scorePercent(scoredCorrect, scoredResults.length || 1) : pct,
        correctCount: stateCode === "CA" && mode === "full" ? scoredCorrect : results.filter((r) => r.correct).length,
        total: stateCode === "CA" && mode === "full" ? scoredResults.length : questions.length,
        examId: examSaveId.current,
        state: stateCode,
      }),
    }));
    persistSitting({ examId: examSaveId.current, scored: localSaved.current });
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
      const elapsed = startedAt == null ? undefined : Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      trackAnalyticsEvent(
        "exam_complete",
        examCompleteParams({
          mode,
          practice,
          questionCount: questions.length,
          answeredCount: Object.keys(current).length,
          score: pct,
          passed: stateCode === "CA" ? false : pct >= examConfig.passingScorePercent,
          state: stateCode,
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
    const pass = stateCode === "CA" ? false : pct >= examConfig.passingScorePercent;
    const unscored = new Set(unscoredRef.current);
    const scoredRows = stateCode === "CA" && mode === "full" ? results.filter((item) => !unscored.has(item.question.question_id)) : results;
    const scoredCorrect = scoredRows.filter((item) => item.correct).length;
    const caMiss = stateCode === "CA" ? weakestCaArea(questions.map((item) => ({
      question: item,
      selected: answers[item.question_id],
      correct: answers[item.question_id] === item.correct_option,
    }))) : null;
    const weak = weakTopics(results, 4).filter((w) => w.wrong > 0);
    const topicAcc = new Map<string, { right: number; total: number; label: string }>();
    results.forEach((r) => {
      const key = stateCode === "CA" ? r.question.exam_area || r.question.topic : r.question.topic;
      const cur = topicAcc.get(key) || { right: 0, total: 0, label: stateCode === "CA" ? areaLabel(key) : topicLabel(r.question.topic) };
      cur.total += 1;
      if (r.correct) cur.right += 1;
      topicAcc.set(key, cur);
    });
    const sources = [...new Set(results.map((r) => r.question.source_reference))];
    const guided = (mode === "quick" || mode === "full") && !review;
    const missed = guided
      ? weakestMissedTopic(
          questions.map((item) => ({
            question: item,
            selected: answers[item.question_id],
            correct: answers[item.question_id] === item.correct_option,
          }))
        )
      : null;
    const studyHref = stateCode === "CA"
      ? (caMiss ? `${site.studyCards}?topic=${caMiss.area}` : site.study)
      : (missed ? topicStudyHref(missed.topic, isPro) : paths.study);
    const recommend = stateCode === "CA" ? caMiss : missed;
    let anonFullUsed = false;
    if (typeof window !== "undefined") {
      try {
        anonFullUsed = localStorage.getItem(anonFullKey) === "1";
      } catch {
        anonFullUsed = false;
      }
    }
    const fullResume = Boolean(owner && openSitting(sessionStorage, owner, "full", stateCode));
    const fullLocked = !fullResume && !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || (!signedIn && anonFullUsed));
    const fullHref = `${site.practice}?mode=full${fullResume ? "" : "&start=1"}`;
    const dailyHref = signedIn ? site.daily : `${site.login}?next=${encodeURIComponent(site.daily)}`;
    return (
      <div className="grid">
        <div className="card result-summary">
          <span className="kicker">Result</span>
          {guided && mode === "quick" ? (
            <>
              <h2>{correct} of {questions.length} correct</h2>
              <p className="lede">
                {correct >= 8
                  ? "Next: take a full practice exam."
                  : recommend
                    ? `Next: review ${recommend.label}.`
                    : "Next: read the study guide, or try another 10 questions. Skipped questions are not enough to pick a topic."}
              </p>
              <div className="result-next">
                {correct >= 8 ? (
                  fullLocked ? (
                    <a className="btn btn-primary" href={site.pricing} data-upgrade-source="practice_limit">{stateCode === "CA" ? "Full exam limit" : "Unlock Pro"}</a>
                  ) : (
                    <a className="btn btn-primary" href={fullHref}>{fullResume ? "Resume Full Practice Exam" : "Start a Full Practice Exam"}</a>
                  )
                ) : recommend ? (
                  <a className="btn btn-primary" href={studyHref}>Review {recommend.label}</a>
                ) : (
                  <a className="btn btn-primary" href={site.study}>Review Study Guide</a>
                )}
                {correct >= 8 && recommend ? (
                  <a className="btn btn-ghost" href={studyHref}>Review {recommend.label}</a>
                ) : null}
                {correct >= 8 && fullLocked ? (
                  <p className="notice">
                    {stateCode === "CA"
                      ? "The free California Full 45 on this account or browser is used. California Pro is not open yet."
                      : signedIn
                        ? "This account has used its free Full 45. Pro includes more full exams."
                        : "This browser has used its free Full 45. Pro includes more full exams."}
                  </p>
                ) : null}
                {correct < 8 && !recommend ? (
                  <a className="btn btn-ghost" href={`${site.practice}?mode=quick&start=1`}>Check My Knowledge — 10 Questions</a>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <h2>
                {stateCode === "CA" && mode === "full"
                  ? `${scoredCorrect} of 40 scored`
                  : `${pct}% — ${pass ? "PASS" : "NEEDS REVIEW"}`}
              </h2>
              <p className="lede">
                {stateCode === "CA" && mode === "full"
                  ? `${scoredCorrect} of 40 scored items correct. Five items are unscored and are marked below. This raw count is study feedback. The official exam uses a scaled score of at least 70, and a scaled score is not a percent.`
                  : `${correct} of ${questions.length} correct. Practice target ${examConfig.passingScorePercent}%. The SOS notice checked ${officialExam.checkedOn} lists ${officialExam.passingScorePercent}% for the official exam. This result is not an SOS score.`}
              </p>
              {guided && mode === "full" ? (
                <div className="result-next">
                  {recommend ? (
                    <a className="btn btn-primary" href={studyHref}>Review {recommend.label}</a>
                  ) : null}
                  <a className={recommend ? "btn btn-ghost" : "btn btn-primary"} href={dailyHref}>Open Daily Study</a>
                  <p className="notice">
                    {signedIn
                      ? "Missed questions stay on your review schedule. Daily Study shows a question when it is due."
                      : "Daily Study needs a sign-in. This exam stays in this browser. It is not added to Daily Study unless you were signed in when you submitted."}
                  </p>
                </div>
              ) : null}
            </>
          )}
          <h3>Topic accuracy</h3>
          {[...topicAcc.entries()].map(([id, v]) => (
            <p key={id}>
              {v.label}: {Math.round((v.right / v.total) * 100)}% ({v.total - v.right} missed)
            </p>
          ))}
          {!guided && weak.length > 0 && (
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
          {guided ? (
            <div className="result-links">
              {stateCode === "CA" ? <Link href={site.mistakes}>Review wrong answers</Link> : <WrongAnswersLink label="Review wrong answers" />}
              <Link href={site.study}>Review Study Guide</Link>
            </div>
          ) : (
            <div className="result-next">
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
          )}
          <AccountInvite />
          {stateCode === "CA" ? (
            <p className="notice">This is study feedback for California. California Pro is not open, and this raw count is not an official scaled score.</p>
          ) : isPro ? (
            <p className="notice">Pro is active. Keep practicing the topics you missed.</p>
          ) : (
            <p className="notice">
              Free practice uses the free question pool. Pro opens the rest of the bank and more full exams.{" "}
              <Link href={paths.pricing} data-upgrade-source="exam_results">View Pro</Link>
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
            extra={
              unscored.has(r.question.question_id) ? (
                <p className="notice">Unscored. This item did not affect the 40-item count.</p>
              ) : stateCode === "CA" ? null : (
                <SaveForReview questionId={r.question.question_id} hint={false} />
              )
            }
          />
        ))}
      </div>
    );
  }

  const remain = seconds;
  const lastQuestion = idx + 1 >= questions.length;
  const practiceLocked = Boolean(practice && selected);
  const past = pastIndex != null ? questions[pastIndex] : null;
  const view = past ?? q;
  const viewIndex = past && pastIndex != null ? pastIndex : idx;
  const viewSelected = past ? answers[past.question_id] : selected;
  const nextLabel = lastQuestion ? (practice ? "See results" : "Submit exam") : "Next";
  const questionBody = (
    <>
      <QuestionBlock
        q={view}
        index={viewIndex}
        selected={viewSelected}
        reveal={Boolean((practice && viewSelected) || past)}
        onChoose={past ? undefined : choose}
        lockPaid={false}
        lockChoice={practiceLocked && !past}
        headingRef={past ? undefined : headingRef}
        isPro={isPro}
        marked={marked.includes(view.question_id)}
        onMark={past ? undefined : () => toggleMark(view.question_id)}
        extra={stateCode === "CA" ? null : <SaveForReview questionId={view.question_id} hint={false} />}
        explainOpen={Boolean(explainOpen[view.question_id])}
        onToggleExplain={() => {
          const id = view.question_id;
          setExplainOpen((current) => ({ ...current, [id]: !current[id] }));
        }}
        tutor={stateCode !== "CA"}
      />
      {past ? (
        <button className="card-corner-btn" type="button" onClick={closePast}>
          Back to this question
        </button>
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

  function startNew() {
    if (!owner) return;
    if (!window.confirm("Start a new set? This replaces the unfinished one.")) return;
    clearSitting(sessionStorage, owner, modeKey, stateCode);
    const seed = Math.floor(Math.random() * 1_000_000_000);
    const ids = drawQuestionIds(seed);
    setActiveSeed(seed);
    setLockedIds(ids);
    setIdx(0);
    setAnswers({});
    answersRef.current = {};
    setExplainOpen({});
    setMarked([]);
    setDone(false);
    setStartedAt(null);
    startReported.current = false;
    poolLocked.current = false;
    localSaved.current = false;
    examSaveId.current = null;
    attemptIds.current = {};
    recordedIds.current = [];
    finishOnce.current = false;
    completeReported.current = false;
    choiceLock.current = null;
    setSeconds(examMinutes * 60);
    setRestored(false);
    setPastIndex(null);
    setSubmitError("");
  }

  function toggleMark(questionId: string) {
    setMarked((current) => (current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId]));
  }

  const prevLocked = idx === 0 || pastIndex != null || (layout === "compact" && submitting);
  const nextLocked = pastIndex != null || submitting || (layout === "compact" ? false : practice ? !selected : false);
  return (
    <div className="home-exam">
      <div className="row space">
        <span className="notice">
          Question {idx + 1} of {questions.length}
          {restored ? " · Resumed" : ""}
        </span>
        <span className="row">
          {timed ? <span className="badge">{formatTime(remain)}</span> : <span className="badge">Practice mode — instant feedback</span>}
          <button className="btn btn-ghost" type="button" onClick={startNew}>Start new</button>
        </span>
      </div>
      <div className="progress-bar" style={{ margin: "10px 0 18px" }}>
        <span style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>
      <QuestionJump
        ids={questions.map((item) => item.question_id)}
        index={viewIndex}
        flagged={marked}
        onJump={goTo}
      />
      {previousAnswer}
      {questionBody}
      {submitStatus}
      <ExamNav
        prevDisabled={prevLocked}
        nextDisabled={nextLocked}
        onPrev={() => goTo(idx - 1)}
        onNext={() => (lastQuestion ? void finish() : goTo(idx + 1))}
        nextLabel={nextLabel}
        progress={`${idx + 1} / ${questions.length}`}
        submit={lastQuestion && !practice}
      />
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
  extra,
  explainOpen,
  onToggleExplain,
  tutor = false,
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
  explainOpen?: boolean;
  onToggleExplain?: () => void;
  tutor?: boolean;
}) {
  const letters = ["A", "B", "C", "D"] as const;
  const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const locked = lockPaid && !q.is_free && !isPro;
  const choiceDisabled = !onChoose || locked || lockChoice;
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
            <button className={`btn btn-ghost${marked ? " is-on" : ""}`} type="button" onClick={onMark} aria-pressed={Boolean(marked)}>
              <FlagIcon /> {marked ? "Flagged" : "Flag question"}
            </button>
          )}
        </div>
      </div>
      <h3 className="quiz-heading quiz-stem" ref={headingRef} tabIndex={-1}>
        {marked ? <span className="flagged-note"><FlagIcon /> Flagged</span> : null}
        {index + 1}. {q.question_text}
      </h3>
      {locked ? (
        <div className="explain">
          <strong>Pro question</strong>
          <p>This item is in the full question bank. Unlock Pro to turn weak topics into passing scores.</p>
          <Link className="btn btn-primary" href={paths.pricing} data-upgrade-source="locked_question">
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
              ? "Correct"
              : reveal && selected === l && selected !== q.correct_option
                ? "Incorrect"
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
      {reveal && !locked ? (
        <AnswerResult q={q} selected={selected} open={explainOpen} onToggle={onToggleExplain} tutor={tutor} />
      ) : null}
    </div>
  );
}
