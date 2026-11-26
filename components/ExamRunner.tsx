"use client";

import { MemberCopy } from "@/components/MemberCopy";
import { isFreeState } from "@/lib/free-state-catalog";
import { FreeStateResultNext } from "@/components/FreeStateResultNext";
import { fetchAccount } from "@/lib/client-account";
import { ANSWER_FEEDBACK_STREAM, readAnswerFeedback, type AnswerFeedback } from "@/lib/answer-feedback";

import { useEffect, useRef, useState, type ReactNode, type Ref } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { packFor } from "@/lib/client-pack";
import { weakestCaArea } from "@/lib/ca-result";
import { scorePercent, topicLabel, weakTopics } from "@/lib/quiz-ui";
import type { Letter } from "@/lib/answer-sequence";
import { areaLabel, CA_EXAM, caPaths } from "@/lib/ca-site";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { hiStudyLabel } from "@/lib/hi-topics";
import { examConfig, officialExam } from "@/data/exam-config";
import { recordAnswer, saveProgress, loadProgress } from "@/lib/storage";
import { currentQuestionVersion } from '@/lib/question-revisions';
import { AccountInvite } from "@/components/AccountInvite";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { AnswerResult } from "@/components/AnswerResult";
import { MessageDialog } from "@/components/MessageDialog";
import { ExamNav, FlagIcon, LoadingNote, QuestionJump, RestartPracticeDialog } from "@/components/QuizChrome";
import { paths } from "@/lib/paths";
import { examAnalyticsMode, examCompleteParams, examStartParams, trackAnalyticsEvent, trackEvent } from "@/lib/analytics";
import { SaveForReview } from "@/components/SaveForReview";
import { settleSave, SubmitStatus } from "@/components/SubmitStatus";
import { clearSitting, openSitting, readSitting, remainingSeconds, writeSitting, type Sitting, type SittingState } from "@/lib/sitting";
import { weakestMissedTopic, topicStudyHref } from "@/lib/next-step";
import { adoptGuestCaRecords, readCaAttempt, saveCaQuickAttempt } from "@/lib/ca-attempts";
import { CtResultNext } from "@/components/CtResultNext";
import { ctSources } from "@/lib/ct-site";
import { NcPracticeNext } from "@/components/NcPracticeNext";
import { clearIndianaStart } from "@/lib/in-client";
import { IndianaNext } from "@/components/IndianaNext";
import { CaQuickNext } from "@/components/CaQuickNext";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { scrollUnderHeaderAfterLayout } from "@/lib/scroll-under-header";

type Mode = "quick" | "full" | "weak" | "practice";

function withAnswerFeedback(question: Question, feedback: AnswerFeedback): Question {
  return { ...question, correct_option: feedback.correctOption, explanation: feedback.explanation, option_feedback: feedback.optionFeedback };
}

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
  questionReason,
  deliveryToken,
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
  onRecorded?: (fullExamCount?: number) => void;
  stateCode?: SittingState;
  focusArea?: string;
  questionReason?: (id: string) => string;
  deliveryToken?: string;
}) {
  const baseModeKey = sittingMode || mode;
  const dailySet = Boolean(practice && preset && sittingMode?.startsWith("daily-"));
  const modeKey = !dailySet && (stateCode === "CT" || isFreeState(stateCode)) && preset
    ? `${baseModeKey}:${preset.map(question => question.question_id).join(",")}`
    : baseModeKey;
  const cloudSaved = useRef(false);
  const initializedScope = useRef("");
  const onCa = stateCode === "CA";
  const onHi = stateCode === "HI";
  const pack = packFor(stateCode);
  const topicPractice = onCa || onHi || Boolean(pack);
  const site = pack ? pack.paths : onHi ? hiPaths : onCa ? caPaths : paths;
  const examMinutes = pack ? pack.fullMinutes ?? 0 : onHi ? 0 : onCa ? 60 : examConfig.timeLimitMinutes;

  const anonFullKey = pack ? pack.anonKey : onHi ? "hi-anon-full-started" : onCa ? "ca-anon-full-started" : "az-anon-full-started";
  const unscoredRef = useRef<string[]>([]);
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const poolLocked = useRef(false);
  const [poolIsPro, setPoolIsPro] = useState(isPro);
  const fullSize = pack ? (pack.fullCountFor?.(isPro) ?? pack.fullCount) : onHi ? HI_EXAM.practiceQuestionCount : onCa ? CA_EXAM.questionCount : examConfig.questionCount;
  const count = mode === "quick" ? 10 : mode === "full" ? fullSize : 10;
  const [served, setServed] = useState<Question[]>([]);
  const questions = served;
  const [owner, setOwner] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [bootError, setBootError] = useState(false);
  const [restrictedResult, setRestrictedResult] = useState<ReturnType<typeof readCaAttempt>>(null);
  const [bootMessage, setBootMessage] = useState("");
  const [bootTry, setBootTry] = useState(0);
  const [activeSeed, setActiveSeed] = useState<number | null>(null);
  const [presentationVersion, setPresentationVersion] = useState(2);
  const [lockedIds, setLockedIds] = useState<string[] | null>(null);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    if (reportStart !== "answer" || poolLocked.current) return;
    setPoolIsPro(isPro);
  }, [isPro, reportStart]);

  const timed = mode === "full" && !practice && (pack ? pack.fullMinutes !== null : !onHi);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [explainOpen, setExplainOpen] = useState<Record<string, boolean>>({});
  const [marked, setMarked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  useEffect(() => { if (done) window.dispatchEvent(new Event("notary-quiz-finished")); }, [done]);
  const [seconds, setSeconds] = useState(examMinutes * 60);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const recordedIds = useRef<string[]>([]);
  const booted = owner != null && activeSeed != null && lockedIds != null;
  const weakReported = useRef(false);
  const startReported = useRef(false);
  const choiceLock = useRef<symbol | null>(null);
  const [pendingChoice, setPendingChoice] = useState<Letter>();
  const [pendingFeedback, setPendingFeedback] = useState<AnswerFeedback>();
  const [restarting, setRestarting] = useState(false);
  const [answerFailures, setAnswerFailures] = useState<Record<string, AnswerCheckFailure | undefined>>({});
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const resultHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);
  const answersRef = useRef(answers);
  const finishOnce = useRef(false);
  const localSaved = useRef(false);
  const examSaveId = useRef<string | null>(null);
  const completeReported = useRef(false);
  const viewedResult = useRef<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [unansweredToConfirm, setUnansweredToConfirm] = useState(0);
  const [confirmRestart, setConfirmRestart] = useState(false);
  const attemptIds = useRef<Record<string, string>>({});
  const pendingAnswers = useRef<Record<string, Letter>>({});
  const viewOnly = useRef(false);
  const reviewScroll = useRef(0);
  const [pastIndex, setPastIndex] = useState<number | null>(null);
  answersRef.current = answers;

  const tokenRef = useRef("");
  const canonicalRef = useRef<Record<string, Letter>>({});

  function currentSitting(patch: Partial<Sitting> = {}): Sitting | null {
    if (!owner || activeSeed == null || !lockedIds) return null;
    return {
      version: 1,
      owner,
      state: stateCode,
      mode: modeKey,
      seed: activeSeed,
      questionIds: lockedIds,
      questionVersions: Object.fromEntries(lockedIds.map(id => [id, currentQuestionVersion(id)])),
      presentationVersion,
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
      pendingAnswers: mode === "quick" ? pendingAnswers.current : undefined,
      recordedIds: recordedIds.current,
      scored: localSaved.current,
      practiceToken: tokenRef.current,
      ...patch,
    };
  }

  function persistSitting(patch: Partial<Sitting> = {}) {
    if (viewOnly.current || ((stateCode === "CT" || isFreeState(stateCode)) && initializedScope.current !== modeKey)) return;
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
    setRestrictedResult(null);
    initializedScope.current = "";
    setBootMessage("");
    setOwner(null);
    setActiveSeed(null);
    setLockedIds(null);
    setRestored(false);
    setDone(false);
    setUnansweredToConfirm(0);
    setAnswers({});
    answersRef.current = {};
    setIdx(0);
    setStartedAt(null);
    setExplainOpen({});
    setMarked([]);
    startReported.current = false;
    poolLocked.current = false;
    finishOnce.current = false;
    localSaved.current = false;
    examSaveId.current = null;
    recordedIds.current = [];
    attemptIds.current = {};
    pendingAnswers.current = {};
    choiceLock.current = null;
    setPendingChoice(undefined);
    setPendingFeedback(undefined);
    setRestarting(false);
    setAnswerFailures({});
    viewOnly.current = false;
    const controller = new AbortController();
    fetchAccount({ signal: controller.signal, cache: "no-store" })
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("account"))))
      .then(async (data) => {
        if (cancel) return;
        async function openBatch(extra: Record<string, unknown>) {
          const response = await fetch("/api/practice/batch/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            cache: "no-store",
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(30000)]),
            body: JSON.stringify({
              state: stateCode,
              mode,
              practice: mode !== "full",
              focusArea,
              missedIds: loadProgress(stateCode).wrongIds.slice(0, 40),
              presetIds: preset?.map((question) => question.question_id),
              deliveryToken,
              ...extra,
            }),
          });
          const body = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(typeof body.error === "string" ? body.error : "Could not load this practice set.");
          setServed(body.questions || []);
          tokenRef.current = body.token || "";
          if (Array.isArray(body.unscoredIds)) unscoredRef.current = body.unscoredIds;
          if (typeof body.examId === "string") examSaveId.current = body.examId;
          return body as { seed: number; questionIds: string[]; presentationVersion?: number };
        }
        const nextOwner = data.user?.id || "guest";
        setSignedIn(Boolean(data.user));
        setFullExamCount(Number((pack ? data.user?.packFullExamCount?.[stateCode] : onHi ? data.user?.hiFullExamCount : onCa ? data.user?.caFullExamCount : data.user?.fullExamCount) || 0));
        const params = new URLSearchParams(window.location.search);
        const startFresh = params.get("start") === "1";
        let existing = readSitting(sessionStorage, nextOwner, modeKey, stateCode);
        const savedQuestionIds = existing?.questionIds;
        if (dailySet && savedQuestionIds && preset && (savedQuestionIds.length !== preset.length ||
          preset.some(question => !savedQuestionIds.includes(question.question_id)))) {
          existing = null;
        }
        if (startFresh && existing?.done) {
          clearSitting(sessionStorage, nextOwner, modeKey, stateCode);
          existing = null;
        }
        const requestedAttempt = startFresh ? "" : params.get("attempt") || "";
        if ((mode === "quick" || mode === "full") && requestedAttempt && existing?.examId !== requestedAttempt) {
          if (nextOwner !== "guest") adoptGuestCaRecords(nextOwner, stateCode);
          const archived = readCaAttempt(nextOwner, requestedAttempt, stateCode);
          if (archived && archived.mode === mode) {
            const batch = await openBatch({ seed: archived.seed, questionIds: archived.questionIds, restoreExamId: mode === "full" ? archived.id : undefined, presentationVersion: archived.presentationVersion ?? 1 });
            if (cancel) return;
            viewOnly.current = Boolean(existing);
            setOwner(nextOwner);
            setActiveSeed(batch.seed);
            setPresentationVersion(batch.presentationVersion ?? archived.presentationVersion ?? 1);
            setLockedIds(batch.questionIds || archived.questionIds);
            initializedScope.current = modeKey;
            setAnswers(archived.answers);
            answersRef.current = archived.answers;
            setDone(true);
            setIdx(0);
            examSaveId.current = archived.id;
            attemptIds.current = archived.attemptIds;
            localSaved.current = true;
            finishOnce.current = true;
            recordedIds.current = archived.questionIds;
            setRestored(true);
            return;
          }
        }
        viewOnly.current = false;
        const batch = await openBatch({
          seed: existing?.seed,
          questionIds: existing?.questionIds,
          token: startFresh ? undefined : existing?.practiceToken,
          restoreExamId: mode === "full" && existing?.done ? existing.examId : undefined,
          presentationVersion: existing?.presentationVersion ?? 2,
        });
        if (cancel) return;
        const ids = batch.questionIds || [];
        setOwner(nextOwner);
        setActiveSeed(batch.seed);
        setPresentationVersion(batch.presentationVersion ?? (existing ? existing.presentationVersion ?? 1 : 2));
        setLockedIds(ids);
        initializedScope.current = modeKey;
        if (!existing) return;
        setIdx(Math.min(existing.idx, Math.max(0, ids.length - 1)));
        setAnswers(existing.answers);
        answersRef.current = existing.answers;
        setExplainOpen(existing.explainOpen);
        setMarked(existing.flaggedIds);
        setDone(existing.done);
        attemptIds.current = existing.attemptIds;
        if (mode === "quick") {
          pendingAnswers.current = Object.fromEntries(ids.flatMap((id: string) => {
            const letter = existing.pendingAnswers?.[id];
            return letter && existing.attemptIds[id] && !existing.answers[id] ? [[id, letter]] : [];
          }));
          setAnswerFailures(Object.fromEntries(Object.entries(pendingAnswers.current).map(([id, retryChoice]) => [id, { retryChoice }])));
        }
        recordedIds.current = existing.recordedIds;
        examSaveId.current = mode === "full" ? examSaveId.current || existing.examId : existing.examId;
        localSaved.current = existing.scored;
        if (existing.startedAt != null) {
          startReported.current = true;
          poolLocked.current = true;
          setStartedAt(existing.startedAt);
          if (existing.timeLimitSeconds) setSeconds(remainingSeconds(existing.startedAt, existing.timeLimitSeconds, Date.now()));
        }
        setRestored(true);
      })
      .catch((error: unknown) => {
        if (cancel || (error instanceof DOMException && error.name === "AbortError")) return;
        setBootMessage(error instanceof Error ? error.message : "");
        setBootError(true);
      });
    return () => {
      cancel = true;
      controller.abort();
    };
    // A new state or mode draws again. Restoring a sitting still keeps that sitting's question ids.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bootTry, modeKey, stateCode]);

  useEffect(() => {
    if (viewOnly.current || !done || (mode !== "quick" && mode !== "full")) return;
    if (!owner || !examSaveId.current || activeSeed == null || !lockedIds?.length || !questions.length) return;
    const answersNow = answersRef.current;
    const correctIds: string[] = [];
    const wrongIds: string[] = [];
    const skippedIds: string[] = [];
    const topicCounts = new Map<string, number>();
    const originalAnswers: Record<string, Letter> = {};
    questions.forEach((item) => {
      const selected = answersNow[item.question_id];
      if (!selected) {
        skippedIds.push(item.question_id);
        return;
      }
      originalAnswers[item.question_id] = originalLetter(item.question_id, selected);
      if (selected === item.correct_option) correctIds.push(item.question_id);
      else {
        wrongIds.push(item.question_id);
        const topic = item.study_topic;
        if (topic) topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
      }
    });
    saveCaQuickAttempt({
      id: examSaveId.current,
      owner,
      state: stateCode,
      mode,
      sittingMode: modeKey,
      finishedAt: new Date().toISOString(),
      seed: activeSeed,
      questionIds: lockedIds,
      answers: answersNow,
      originalAnswers,
      questionVersions: Object.fromEntries(lockedIds.map(id => [id, currentQuestionVersion(id)])),
      presentationVersion,
      unscoredIds: mode === "full" ? [...unscoredRef.current] : [],
      attemptIds: { ...attemptIds.current },
      correctIds,
      wrongIds,
      skippedIds,
      topicMisses: [...topicCounts.entries()].map(([id, missed]) => ({ id, missed })),
      synced: cloudSaved.current,
    });
    const url = new URL(window.location.href);
    if (url.searchParams.get("attempt") !== examSaveId.current) {
      url.searchParams.set("attempt", examSaveId.current);
      window.history.replaceState(null, "", url);
    }
    // Archive the finished check once. Later renders keep the same attempt id.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done, owner, activeSeed, lockedIds, questions, stateCode, mode, modeKey]);

  useEffect(() => {
    persistSitting();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, activeSeed, lockedIds, idx, answers, explainOpen, marked, startedAt, done, modeKey]);

  useEffect(() => { if (stateCode === "IN" && done) scrollUnderHeaderAfterLayout(resultRef.current); }, [stateCode, done]);

  const entryPoint = layout === "compact" ? "home_practice" : focusArea ? "topic_practice" : "practice";
  useEffect(() => {
    const resultId = examSaveId.current || restrictedResult?.id;
    const questionCount = restrictedResult?.questionIds.length ?? questions.length;
    if ((!done && !restrictedResult) || !questionCount || !resultId || viewedResult.current === resultId) return;
    viewedResult.current = resultId;
    trackAnalyticsEvent("result_view", examStartParams({
      mode, practice, questionCount, plan: isPro ? "pro" : "free", state: stateCode,
      topic: Boolean(focusArea), entryPoint,
    }));
  }, [done, entryPoint, focusArea, isPro, mode, practice, questions.length, restrictedResult, stateCode]);

  function reportExamStart() {
    if (startReported.current || !questions.length) return;
    startReported.current = true;
    poolLocked.current = true;
    setStartedAt((current) => current ?? Date.now());
    const plan = isPro ? "pro" : "free";
    const start = examStartParams({ mode, practice, questionCount: questions.length, plan, state: stateCode, topic: Boolean(focusArea), entryPoint });
    trackAnalyticsEvent("exam_start", start);
    if (start.mode === "quick10") trackEvent("quick10_start");
    if (start.mode === "full45" && (stateCode === "AZ" || stateCode === "CA")) trackEvent("full45_start", { plan });
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

  useEffect(() => {
    if (stateCode !== "CT" || !done) return;
    resultHeadingRef.current?.focus({ preventScroll: true });
    scrollUnderHeaderAfterLayout(resultHeadingRef.current);
  }, [done, stateCode]);

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

  if (done && restrictedResult && isFreeState(stateCode)) {
    return <div className="grid"><div className="card result-summary">
      <span className="kicker">Saved result</span><h2>{restrictedResult.correctIds.length} of {restrictedResult.questionIds.length} correct</h2>
      <p>Your completed score and progress are saved. Pro opens the paid questions and explanations in this practice.</p>
      <FreeStateResultNext code={stateCode} attemptId={restrictedResult.id} />
      {mode === "quick" && <Link className="btn btn-ghost" href={paths.community}>Explore Community Insights</Link>}
    </div></div>;
  }


  if (!booted) {
    if (bootError) {
      return (
        <div className="card">
          <p className="form-error" role="alert">{bootMessage || "Could not load this practice set."}</p>
          <button className="btn btn-primary" type="button" onClick={() => setBootTry((n) => n + 1)}>Retry</button>
          {isFreeState(stateCode) && pack?.purchaseEnabled !== false && bootMessage.startsWith("Pro access") ? <Link className="btn btn-ghost" href={site.pricing}>Open Pro access</Link> : null}
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
            <h2>{onHi ? "Comprehensive Practice is not available" : onCa ? "Full 45 is not available" : "Full practice is not available"}</h2>
            <p>
              This practice must contain exactly {fullSize} unique published questions. The current
              eligible bank does not, so it was not started.
            </p>
          </>
        ) : (
          <p>Not enough questions in this set. Open Exam Questions.</p>
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
    return canonicalRef.current[`${questionId}:${display}`] ?? display;
  }

  function goTo(nextIdx: number) {
    setPastIndex(null);
    setIdx(nextIdx);
  }

  function openPast() {
    if (idx < 1) return;
    reviewScroll.current = window.scrollY;
    setPastIndex(idx - 1);
  }

  function closePast() {
    const y = reviewScroll.current;
    setPastIndex(null);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }

  async function choose(letter: "A" | "B" | "C" | "D") {
    if (choiceLock.current) return;
    if (reportStart === "answer") reportExamStart();
    if (!practice && timed && done) return;
    if (practice) {
      const id = q.question_id;
      const retryChoice = answerFailures[id]?.retryChoice;
      if (recordedIds.current.includes(id) || answersRef.current[id] || (retryChoice && retryChoice !== letter)) return;
      const operation = Symbol();
      choiceLock.current = operation;
      setPendingChoice(letter);
      const key = attemptId(id);
      if (mode === "quick") {
        pendingAnswers.current[id] = letter;
        persistSitting();
      }
      const response = await fetch("/api/practice/feedback/", {
        method: "POST",
        signal: AbortSignal.timeout?.(15000),
        headers: {
          "Content-Type": "application/json",
          Accept: mode === "quick" ? ANSWER_FEEDBACK_STREAM : "application/json",
        },
        body: JSON.stringify({
          token: tokenRef.current,
          action: "one",
          questionId: q.question_id,
          display: letter,
          attemptId: key,
          review,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      }).catch(() => null);
      const revealed = await readAnswerFeedback(response, (feedback) => {
        if (choiceLock.current === operation) setPendingFeedback(feedback);
      });
      if (choiceLock.current !== operation) return;
      choiceLock.current = null;
      setPendingChoice(undefined);
      setPendingFeedback(undefined);
      if (!response?.ok || !revealed.correctOption) {
        const retry = retryChoice ?? (!response || response.status >= 500 || response.ok ? letter : undefined);
        if (mode === "quick" && !retry) {
          delete pendingAnswers.current[id];
          persistSitting();
        }
        setAnswerFailures((current) => ({ ...current, [id]: { message: "error" in revealed ? revealed.error : undefined, retryChoice: retry } }));
        return;
      }
      if (answerFailures[id]) setAnswerFailures((current) => ({ ...current, [id]: undefined }));
      delete pendingAnswers.current[id];
      recordedIds.current = [...recordedIds.current, q.question_id];
      canonicalRef.current[`${q.question_id}:${letter}`] = revealed.canonical;
      setServed((current) => current.map((item) => item.question_id === id ? withAnswerFeedback(item, revealed) : item));
      const nextAnswers = { ...answersRef.current, [id]: letter };
      answersRef.current = nextAnswers;
      setAnswers(nextAnswers);
      try {
        recordAnswer(id, Boolean(revealed.correct), stateCode);
      } catch {
        // Local storage can be blocked. The answer check has already succeeded.
      }
      if (stateCode !== "IN" && mode === "weak" && isPro && !weakReported.current) {
        weakReported.current = true;
        fetch("/api/billing/pro-usage/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ featureCode: "weak_areas", state: stateCode }),
        }).catch(() => undefined);
      }
      onRecorded?.();
      return;
    }
    const nextAnswers = { ...answersRef.current, [q.question_id]: letter };
    answersRef.current = nextAnswers;
    setAnswers(nextAnswers);
  }

  function requestFinish() {
    const current = answersRef.current;
    if (finishOnce.current || submitting) return;
    if (reportStart === "answer" && Object.keys(current).length === 0) return;
    const unanswered = questions.filter((item) => !current[item.question_id]).length;
    if (unanswered > 0 && !localSaved.current) {
      setUnansweredToConfirm(unanswered);
      return;
    }
    void finish();
  }

  async function finish() {
    if (finishOnce.current || submitting) return;
    finishOnce.current = true;
    setUnansweredToConfirm(0);
    setSubmitError("");
    setSubmitting(true);
    if (reportStart === "answer") reportExamStart();
    let live = questions;
    if (tokenRef.current) {
      const response = await fetch("/api/practice/feedback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: tokenRef.current,
          action: "grade",
          answers: questions.map((item) => ({ questionId: item.question_id, display: answersRef.current[item.question_id] })),
        }),
      });
      const graded = await response.json().catch(() => ({}));
      if (!response.ok) {
        finishOnce.current = false;
        setSubmitting(false);
        setSubmitError(graded.error || "We couldn't score this set. Your answers are still here.");
        return;
      }
      if (graded.token) tokenRef.current = graded.token;
      const rows = new Map<string, { correctOption?: Letter; explanation?: string; optionFeedback?: Question["option_feedback"]; canonical?: Letter }>((graded.results || []).map((row: { questionId: string; correctOption?: Letter; explanation?: string; optionFeedback?: Question["option_feedback"]; canonical?: Letter }) => [row.questionId, row]));
      live = questions.map((item) => {
        const row = rows.get(item.question_id);
        const selected = answersRef.current[item.question_id];
        if (row?.canonical && selected) canonicalRef.current[`${item.question_id}:${selected}`] = row.canonical;
        return row?.correctOption ? { ...item, correct_option: row.correctOption, explanation: row.explanation || "", option_feedback: row.optionFeedback || item.option_feedback } : item;
      });
      setServed(live);
    }
    const current = answersRef.current;
    const results = live.map((item) => ({
      question: item,
      correct: current[item.question_id] === item.correct_option,
    }));
    const pct = scorePercent(results.filter((r) => r.correct).length, live.length);
    if (!examSaveId.current) examSaveId.current = crypto.randomUUID();
    if (!localSaved.current) {
      localSaved.current = true;
      if (!practice) results.forEach((r) => {
        if (!pack || current[r.question.question_id]) recordAnswer(r.question.question_id, r.correct, stateCode);
      });
      const prev = loadProgress(stateCode);
      saveProgress({
        lastScore: pct,
        lastMode: mode,
        scores: [{ at: new Date().toISOString(), score: pct, mode }, ...prev.scores].slice(0, 20),
      }, stateCode);
    }
    persistSitting({ examId: examSaveId.current, scored: true });
    const saves: Promise<Response>[] = [];
    const fullSubmission = mode === "full";
    let savedFullCount: number | undefined;
    if (fullSubmission) saves.push(fetch(stateCode === "IN" ? "/api/indiana/sitting/" : "/api/progress/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "pack-full", ...(stateCode === "IN" ? { action: "submit" } : {}), state: stateCode, seed: activeSeed, examId: examSaveId.current, accountId: owner === "guest" ? undefined : owner,
        unscoredIds: unscoredRef.current,
        questions: live.map(item => ({ questionId: item.question_id, questionVersion: item.version, attemptId: attemptIds.current[item.question_id],
          selected: current[item.question_id] ? originalLetter(item.question_id, current[item.question_id]) : undefined })),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }),
    }).then(async response => {
      if (response.ok) {
        const result = await response.clone().json();
        if (Number.isInteger(result.fullExamCount) && result.fullExamCount >= 0) savedFullCount = result.fullExamCount;
      }
      return response;
    }));
    if (!fullSubmission && (!practice || topicPractice)) results.forEach((r) => {
      const letter = current[r.question.question_id];
      if (letter) {
        saves.push(fetch("/api/progress/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: r.question.question_id,
            questionVersion: r.question.version,
            selected: originalLetter(r.question.question_id, letter),
            attemptId: attemptId(r.question.question_id),
            review: false,
            state: stateCode,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        }));
      }
    });
    const scoreUnscored = (stateCode === "CA" || pack?.code === "PA") && mode === "full";
    const scoredResults = scoreUnscored
      ? results.filter((item) => !unscoredRef.current.includes(item.question.question_id))
      : results;
    const scoredCorrect = scoredResults.filter((item) => item.correct).length;
    if (!fullSubmission) saves.push(fetch("/api/progress/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "exam",
        mode,
        score: scoreUnscored ? scorePercent(scoredCorrect, scoredResults.length || 1) : pct,
        correctCount: scoreUnscored ? scoredCorrect : results.filter((r) => r.correct).length,
        total: scoreUnscored ? scoredResults.length : live.length,
        examId: examSaveId.current,
        state: stateCode,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        ...(topicPractice
          ? {
              wrongIds: results.filter((item) => !item.correct && current[item.question.question_id]).map((item) => item.question.question_id),
              skipped: results.filter((item) => !current[item.question.question_id]).length,
            }
          : {}),
      }),
    }));
    persistSitting({ examId: examSaveId.current, scored: localSaved.current });
    // Quick practice saves each answer before the result, so rapid answers can queue.
    const outcomes = await Promise.all(saves.map((save) => settleSave(save, mode === "quick" || isFreeState(stateCode) ? 60000 : 20000)));
    if (outcomes.some((outcome) => outcome === "fail")) {
      finishOnce.current = false;
      setSubmitting(false);
      setSubmitError("We couldn't save this exam. Your answers are still here.");
      return;
    }
    cloudSaved.current = outcomes.every(outcome => outcome === "ok") && !(stateCode === "IN" && owner === "guest");
    setSubmitting(false);
    if (stateCode === "IN" && mode === "full" && owner) clearIndianaStart(owner);
    setDone(true);
    if (fullSubmission) {
      setFullExamCount(savedFullCount ?? Math.max(fullExamCount, FREE_FULL_EXAMS));
      onRecorded?.(savedFullCount);
    }
    if (!completeReported.current) {
      completeReported.current = true;
      const elapsed = startedAt == null ? undefined : Math.max(0, Math.round((Date.now() - startedAt) / 1000));
      trackAnalyticsEvent(
        "exam_complete",
        examCompleteParams({
          mode,
          practice,
          questionCount: live.length,
          answeredCount: Object.keys(current).length,
          score: pct,
          passed: topicPractice ? false : pct >= examConfig.passingScorePercent,
          state: stateCode,
          topic: Boolean(focusArea),
          entryPoint,
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
    const pass = topicPractice ? false : pct >= examConfig.passingScorePercent;
    const unscored = new Set(unscoredRef.current);
    const splitScore = (stateCode === "CA" || stateCode === "PA") && mode === "full";
    const scoredRows = splitScore ? results.filter((item) => !unscored.has(item.question.question_id)) : results;
    const scoredCorrect = scoredRows.filter((item) => item.correct).length;
    const caMiss = stateCode === "CA" ? weakestCaArea(questions.map((item) => ({
      question: item,
      selected: answers[item.question_id],
      correct: answers[item.question_id] === item.correct_option,
    }))) : null;
    const weak = weakTopics(results, 4).filter((w) => w.wrong > 0);
    const topicAcc = new Map<string, { right: number; total: number; label: string }>();
    results.forEach((r) => {
      const key = pack || onHi ? r.question.study_topic || r.question.topic : stateCode === "CA" ? r.question.exam_area || r.question.topic : r.question.topic;
      const cur = topicAcc.get(key) || { right: 0, total: 0, label: pack ? pack.topics.find(topic => topic.id === key)?.label || key : onHi ? hiStudyLabel(key) : stateCode === "CA" ? areaLabel(key) : topicLabel(r.question.topic) };
      if (stateCode !== "IN" || answers[r.question.question_id]) cur.total += 1;
      if (r.correct) cur.right += 1;
      topicAcc.set(key, cur);
    });
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
    const packMiss = [...topicAcc.entries()].filter(([, value]) => value.total > value.right)
      .sort(([, a], [, b]) => (b.total - b.right) - (a.total - a.right))[0];
    const studyHref = pack ? (packMiss ? pack.freeLaunch ? `${site.study}#${packMiss[0]}` : `${site.studyCards}?topic=${packMiss[0]}` : site.study)
      : stateCode === "CA"
      ? (caMiss ? `${site.studyCards}?topic=${caMiss.area}` : site.study)
      : (missed ? topicStudyHref(missed.topic, isPro) : paths.study);
    const recommend = pack ? (packMiss ? { label: packMiss[1].label } : null) : stateCode === "CA" ? caMiss : missed;
    let anonFullUsed = false;
    if (typeof window !== "undefined") {
      try {
        anonFullUsed = localStorage.getItem(anonFullKey) === "1";
      } catch {
        anonFullUsed = false;
      }
    }
    const practiceFull = Boolean(owner && openSitting(sessionStorage, owner, "full", stateCode));
    const homeFull = Boolean(owner && openSitting(sessionStorage, owner, "home-full", stateCode));
    const fullResume = practiceFull || homeFull;
    const fullLocked = !fullResume && !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || (!signedIn && anonFullUsed));
    const fullHref = homeFull && !practiceFull
      ? `${site.home}?exam=full`
      : `${site.practice}?mode=full${practiceFull ? "" : "&start=1"}`;
    const dailyHref = signedIn ? site.daily : `${site.login}?next=${encodeURIComponent(site.daily)}`;
    const mistakesHref = (mode === "full" || isFreeState(stateCode)) && examSaveId.current ? `${site.mistakes}?attempt=${examSaveId.current}` : site.mistakes;
    const azMisses = stateCode === "AZ" ? results.filter(result =>
      !result.correct && answers[result.question.question_id]
    ) : [];
    const azTopics = new Map<Question["topic"], number>();
    for (const { question } of azMisses) azTopics.set(question.topic, (azTopics.get(question.topic) ?? 0) + 1);
    const firstAzMiss = azMisses[0]?.question.question_id;
    const azCanTakeFull = mode === "quick" && pct >= examConfig.passingScorePercent && !fullLocked && !isPro;
    return (
      <div className="grid">
        <div className="card result-summary" ref={resultRef}>
          <span className="kicker">Result</span>
          {stateCode === "AZ" ? (
            <>
              <h2>{correct} of {questions.length} correct</h2>
              <p className="lede">{pct}% on this Arizona practice set. {questions.length - Object.keys(answers).length} skipped.</p>
              {azTopics.size > 0 && <>
                <h3>Topics to revisit in this set</h3>
                <ul>{[...azTopics].sort(([, a], [, b]) => b - a).slice(0, 2).map(([topic, missedCount]) => (
                  <li key={topic}>{topicLabel(topic)} · {missedCount} missed</li>
                ))}</ul>
              </>}
              <div className="result-next">
                {firstAzMiss ? <a className="btn btn-primary" href={`#review-${firstAzMiss}`}>Review missed explanations</a>
                  : azCanTakeFull ? <Link className="btn btn-primary" href={fullHref}>{fullResume ? "Resume Full 45" : "Start Full 45"}</Link>
                  : mode === "quick" && !preset && layout === "page"
                    ? <button className="btn btn-primary" type="button" disabled={restarting} onClick={() => void startNew()}>
                      {restarting ? "Starting…" : "Try another Quick 10"}
                    </button>
                    : <a className="btn btn-primary" href={`${site.practice}?mode=quick&start=1`}>Try another Quick 10</a>}
                {firstAzMiss && <WrongAnswersLink className="btn btn-ghost" label="Review wrong answers" href={mistakesHref} stateCode={stateCode} />}
                <Link className="btn btn-ghost" href={dailyHref}>Open Daily Study</Link>
              </div>
              {submitError && <p className="form-error" role="alert">{submitError}</p>}
              {isPro ? <p className="notice">Pro is active. Keep practicing or revisit a rule in the <Link href={site.study}>Arizona study guide</Link>.</p>
                : fullLocked && <p className="notice">Your free Full 45 has been used. Quick 10 and Arizona topic practice are still free. Pro adds the full question bank and repeat Full 45 practice.{" "}
                  <Link href={site.pricing} data-upgrade-source="exam_results"
                    data-upgrade-mode={examAnalyticsMode(mode, practice, questions.length, Boolean(focusArea))}
                    data-upgrade-question-count={questions.length}>View Pro plans</Link>
                </p>}
            </>
          ) : isFreeState(stateCode) ? (
            <><h2>{correct} of {questions.length} correct</h2><FreeStateResultNext code={stateCode} attemptId={examSaveId.current || ""} /></>
          ) : stateCode === "NC" ? (
            <>
              <h2>{correct} of {questions.length} correct</h2>
              <p className="lede">Your {mode === "quick" ? "Quick 10" : mode === "full" ? "Comprehensive Practice" : "Topic Practice"} result. {questions.filter(item => !answers[item.question_id]).length} skipped.</p>
              <NcPracticeNext correct={correct} total={questions.length} topics={[...topicAcc.entries()].map(([id, value]) => ({ id, ...value }))} quick={mode === "quick"} />
            </>
          ) : stateCode === "CT" ? (
            <>
              <h2 ref={resultHeadingRef} tabIndex={-1}>{correct} of {questions.length} correct</h2>
              <p className="lede">Your Connecticut practice result.</p>
              <CtResultNext correct={correct} total={questions.length}
                missedTopics={[...topicAcc.entries()].filter(([, value]) => value.right < value.total).map(([id, value]) => ({ id, label: value.label }))}
                attemptId={mode === "quick" || signedIn ? examSaveId.current || "" : ""} />
            </>
          ) : guided && mode === "quick" ? (
            <>
              <h2>{correct} of {questions.length} correct</h2>
              {stateCode === "IN" ? <IndianaNext mode="quick" correct={correct} total={questions.length} topics={[...topicAcc.entries()].map(([id,value]) => ({ id,...value }))} fullHref={fullHref} fullLocked={fullLocked} /> : topicPractice ? (
                <CaQuickNext
                  correct={correct}
                  total={questions.length}
                  skipped={questions.filter((item) => !answers[item.question_id]).length}
                  misses={(() => {
                    const counts = new Map<string, number>();
                    questions.forEach((item) => {
                      const selected = answers[item.question_id];
                      if (!selected || selected === item.correct_option || !item.study_topic) return;
                      counts.set(item.study_topic, (counts.get(item.study_topic) || 0) + 1);
                    });
                    return [...counts.entries()].map(([id, missed]) => ({ id, missed }));
                  })()}
                  attemptId={examSaveId.current || ""}
                  fullHref={fullHref}
                  fullResume={fullResume}
                  fullLocked={fullLocked}
                  communityHref={onCa ? paths.community : undefined}
                  paths={pack ? pack.paths : onHi ? hiPaths : caPaths}
                  fullName={pack ? pack.fullTitle : onHi ? "Comprehensive Practice" : "Full 45 Practice Exam"}
                  labelFor={onHi ? hiStudyLabel : undefined}
                  dailyState={pack ? pack.code : onHi ? "HI" : "CA"}
                  limitNote={pack || onHi ? <MemberCopy member={`The introductory ${pack?.fullTitle ?? "Comprehensive Practice"} on this account or browser is already used.`}>{`The free ${pack?.fullTitle ?? "Comprehensive Practice"} on this account or browser is already used.`}</MemberCopy> : undefined}
                />
              ) : (
                <>
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
                    <a className="btn btn-primary" href={site.pricing} data-upgrade-source="practice_limit">Unlock Pro</a>
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
                    <MemberCopy member={signedIn
                      ? "This account has used its starter Full 45. Pro includes more full exams."
                      : "This browser has used its starter Full 45. Pro includes more full exams."}>{signedIn
                      ? "This account has used its free Full 45. Pro includes more full exams."
                      : "This browser has used its free Full 45. Pro includes more full exams."}</MemberCopy>
                  </p>
                ) : null}
                {correct < 8 && !recommend ? (
                  <a className="btn btn-ghost" href={`${site.practice}?mode=quick&start=1`}>Check My Knowledge — 10 Questions</a>
                ) : null}
                <a className="btn btn-ghost" href={dailyHref}>Open Daily Study</a>
              </div>
                </>
              )}
            </>
          ) : (
            <>
              <h2>
                {stateCode === "IN"
                  ? `${correct}/${questions.length}`
                  : onHi && mode === "full"
                  ? `${correct} of ${questions.length}`
                  : stateCode === "CA" && mode === "full"
                  ? `${scoredCorrect} of 40 scored`
                  : stateCode === "PA" && mode === "full"
                  ? `${scoredCorrect} of 25 practice-scored`
                  : (pack?.code === "NY" || pack?.code === "LA") && mode === "full"
                  ? `${correct} of ${questions.length}`
                  : `${pct}% — ${pass ? "PASS" : "NEEDS REVIEW"}`}
              </h2>
              <p className="lede">
                {stateCode === "IN"
                  ? `${pct}% correct in this site practice. ${mode === "full" ? "Indiana’s official exam uses a 24/30 reference line. This practice score does not complete the official course or exam." : "Review the rules below and try the topic again."}`
                  : onHi && mode === "full"
                  ? `${correct} of ${questions.length} correct. ${HI_EXAM.practiceNote} A score of ${HI_EXAM.practiceTargetPercent}% is this site's practice target. It is not an official exam result. The Attorney General's written exam requires at least ${HI_EXAM.officialPassingPercent}%.`
                  : stateCode === "CA" && mode === "full"
                  ? `${scoredCorrect} of 40 scored items correct. Five items are unscored and are marked below. This raw count is study feedback. The official exam uses a scaled score of at least 70, and a scaled score is not a percent.`
                  : stateCode === "PA" && mode === "full"
                  ? `${scoredCorrect} of 25 practice-scored items correct. Five items were this site's unscored set and are marked below. All 30 still count for study. This raw count is not the official scaled score of 75.`
                  : pack?.code === "LA" && mode === "full"
                  ? `${correct} of ${questions.length} correct. This 40-question, 90-minute set is this site's scenario practice. It covers selected statute-based skills, not the complete official study guide or four-hour examination. The official passing score is scaled 70 out of 100; this raw count cannot be converted to that scale.`
                  : pack?.code === "NY" && mode === "full"
                  ? `${correct} of ${questions.length} correct. This 40-question, 60-minute set is this site's practice. The Department of State reports pass or fail only and does not publish a numeric passing score. This count is not an official result.`
                  : `${correct} of ${questions.length} correct. Practice target ${examConfig.passingScorePercent}%. The SOS notice checked ${officialExam.checkedOn} lists ${officialExam.passingScorePercent}% for the official exam. This result is not an SOS score.`}
              </p>
              {guided && mode === "full" && stateCode === "IN" ? <IndianaNext mode="full" correct={correct} total={questions.length} topics={[...topicAcc.entries()].map(([id,value]) => ({ id,...value }))} fullHref={fullHref} fullLocked={fullLocked} /> : guided && mode === "full" ? (
                <div className="result-next">
                  {recommend ? (
                    <a className="btn btn-primary" href={studyHref}>Review {recommend.label}</a>
                  ) : null}
                  <a className={recommend ? "btn btn-ghost" : "btn btn-primary"} href={dailyHref}>Open Daily Study</a>
                  <p className="notice">
                    <MemberCopy member={signedIn
                      ? "Missed questions stay on your review schedule. Daily Study shows a question when it is due."
                      : "Sign in to sync this practice and open Daily Study. If your account has used its starter full practice for this state, Pro access is required."}>{signedIn
                      ? "Missed questions stay on your review schedule. Daily Study shows a question when it is due."
                      : "Sign in to sync this practice and open Daily Study. If your account has used its free full practice for this state, Pro access is required."}</MemberCopy>
                  </p>
                </div>
              ) : null}
            </>
          )}
          {stateCode !== "AZ" && <><h3>Topic accuracy</h3>
          {[...topicAcc.entries()].map(([id, v]) => (
            <p key={id}>
              {v.label}: {v.total ? Math.round((v.right / v.total) * 100) : 0}% ({v.total - v.right} missed)
            </p>
          ))}
          {stateCode !== "NC" && !guided && weak.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <p>
                <strong>Your weakest areas are:</strong>
              </p>
              <ul>
                {weak.map((w) => (
                  <li key={w.topic}>{w.label}</li>
                ))}
              </ul>
              <p><MemberCopy member={<>Review those chapters in the starter study guide, then drill the missed items.</>}>Review those chapters in the free study guide, then drill the missed items.</MemberCopy></p>
            </div>
          )}
          {isFreeState(stateCode) || stateCode === "CT" || stateCode === "NC" || (topicPractice && mode === "quick") ? null : guided ? (
            <div className="result-links">
              {topicPractice ? <Link href={mistakesHref}>Review wrong answers</Link> : <WrongAnswersLink label="Review wrong answers" href={mistakesHref} stateCode={stateCode} />}
              <Link href={site.study}>Review Study Guide</Link>
            </div>
          ) : (
            <div className="result-next">
              {weak.length > 0 ? (
                <Link className="btn btn-primary" href={`${site.practice}?mode=weak`}>
                  Fix My Weak Areas
                </Link>
              ) : (
                <Link className="btn btn-primary" href={site.questions}>
                  Continue Practice
                </Link>
              )}
              <WrongAnswersLink className="btn btn-ghost" label="Review wrong answers" href={mistakesHref} stateCode={stateCode} />
              <Link className="btn btn-ghost" href={site.study}>
                Review Study Guide
              </Link>
            </div>
          )}
          {mode === "quick" && (!onCa || !guided) && <p><Link className="btn btn-ghost" href={paths.community}>Explore Community Insights</Link></p>}</>}
          <AccountInvite />
          {stateCode === "AZ" || isFreeState(stateCode) ? null : stateCode === "CT" ? <p className="notice"><MemberCopy member={<>Topic practice is available in the Connecticut question bank.</>}>Free learning uses the Connecticut free question pool.</MemberCopy></p> : onCa ? (
            <p className="notice">{mode === "full" ? "This is study feedback for California. Forty items are scored. This raw count is not an official scaled score." : "This score describes your California practice set."}</p>
          ) : onHi ? (
            <p className="notice">This is study feedback for Hawaii. This score is this site's practice result, not an official exam result.</p>
          ) : stateCode === "IN" ? <p className="notice"><MemberCopy member={isPro ? "Indiana Pro is active for this account." : "Starter practice uses 60 Indiana questions. Pro opens all 203 questions across every available state for 60 days."}>{isPro ? "Indiana Pro is active for this account." : "Free practice uses 60 Indiana questions. Pro opens all 203 questions across every available state for 60 days."}</MemberCopy></p> : isPro ? (
            <p className="notice">Pro is active. Keep practicing the topics you missed.</p>
          ) : (
            <p className="notice"><MemberCopy member={<>
              Starter practice uses the starter question pool. Pro opens the rest of the bank and more full exams.</>}>
              Free practice uses the free question pool. Pro opens the rest of the bank and more full exams.</MemberCopy>{" "}
              <Link href={site.pricing} data-upgrade-source="exam_results">View Pro</Link>
            </p>
          )}
        </div>
        {results.map((r, i) => (
          <QuestionBlock
            key={r.question.question_id}
            q={r.question}
            tutor={isFreeState(stateCode) && !pack?.freeLaunch}
            index={i}
            selected={answers[r.question.question_id]}
            reveal
            reviewAnchor={stateCode === "AZ" ? `review-${r.question.question_id}` : undefined}
            isPro={isPro}
            lockPaid={false}
            extra={
              unscored.has(r.question.question_id) ? (
                <p className="notice">Unscored. This item did not affect the {stateCode === "PA" ? "25-item practice" : "40-item"} count.</p>
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
  const checking = Boolean(pendingChoice) || restarting;
  const practiceLocked = Boolean(practice && selected);
  const past = pastIndex != null ? questions[pastIndex] : null;
  const view = past ?? (pendingFeedback ? withAnswerFeedback(q, pendingFeedback) : q);
  const viewIndex = past && pastIndex != null ? pastIndex : idx;
  const viewSelected = past ? answers[past.question_id] : selected;
  const nextLabel = lastQuestion ? (practice ? "See results" : "Submit exam") : "Next";
  const previousAnswer =
    practice && idx > 0 && pastIndex == null ? (
      <button className="card-corner-btn" type="button" disabled={checking} onClick={openPast}>
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

  async function startNew() {
    if (!owner || choiceLock.current) return;
    const operation = Symbol();
    choiceLock.current = operation;
    setRestarting(true);
    const response = await fetch("/api/practice/batch/", {
      method: "POST",
      signal: AbortSignal.timeout?.(15000),
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ state: stateCode, mode, practice: mode !== "full", focusArea, deliveryToken, presetIds: preset?.map((question) => question.question_id) }),
    }).catch(() => null);
    const batch = (await response?.json().catch(() => null)) ?? {};
    if (choiceLock.current !== operation) return;
    choiceLock.current = null;
    setRestarting(false);
    if (!response?.ok) {
      setSubmitError(batch.error || "Could not start a new set. Your previous answers are still on this device.");
      return;
    }
    clearSitting(sessionStorage, owner, modeKey, stateCode);
    setServed(batch.questions || []);
    tokenRef.current = batch.token || "";
    setActiveSeed(batch.seed);
    setPresentationVersion(batch.presentationVersion || 2);
    setLockedIds(batch.questionIds || []);
    unscoredRef.current = batch.unscoredIds || [];
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
    examSaveId.current = batch.examId || null;
    attemptIds.current = {};
    pendingAnswers.current = {};
    recordedIds.current = [];
    finishOnce.current = false;
    completeReported.current = false;
    setSeconds(examMinutes * 60);
    setRestored(false);
    setPastIndex(null);
    setSubmitError("");
    setAnswerFailures({});
    setUnansweredToConfirm(0);
  }

  function toggleMark(questionId: string) {
    setMarked((current) => (current.includes(questionId) ? current.filter((id) => id !== questionId) : [...current, questionId]));
  }

  const prevLocked = checking || idx === 0 || pastIndex != null || (layout === "compact" && submitting);
  const nextLocked = checking || pastIndex != null || submitting || (layout === "compact" ? false : practice ? !selected : false);
  return (
    <div className="home-exam" data-editorial-quiz-active="">
      <div className="row space">
        <span className="notice">
          Question {idx + 1} of {questions.length}
          {restored ? " · Resumed" : ""}
        </span>
        <span className="row">
          {timed ? <span className="badge">{formatTime(remain)}</span> : <span className="badge">{mode === "full" ? "No time limit" : "Practice mode — instant feedback"}</span>}
          <button className="btn btn-ghost" type="button" disabled={checking} onClick={() => setConfirmRestart(true)}>Start new</button>
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
        disabled={checking}
      />
      {previousAnswer}
      <QuestionBlock
        q={view}
        reason={past ? undefined : questionReason?.(view.question_id)}
        index={viewIndex}
        selected={pendingChoice ?? viewSelected}
        reveal={Boolean((practice && (viewSelected || pendingFeedback)) || past)}
        checking={checking}
        answerFailure={past ? undefined : answerFailures[view.question_id]}
        compactFeedback={practice && !past}
        onChoose={past ? undefined : choose}
        lockPaid={false}
        lockChoice={practiceLocked && !past}
        headingRef={past ? undefined : headingRef}
        isPro={isPro}
        marked={marked.includes(view.question_id)}
        onMark={past ? undefined : () => toggleMark(view.question_id)}
        extra={<SaveForReview key={view.question_id} questionId={view.question_id} hint={false} />}
        explainOpen={Boolean(explainOpen[view.question_id])}
        onToggleExplain={() => {
          const id = view.question_id;
          setExplainOpen((current) => ({ ...current, [id]: !current[id] }));
        }}
        tutor
        navigation={
          past ? (
            <button className="btn btn-ghost" type="button" onClick={closePast}>
              Back to this question
            </button>
          ) : (
            <>
              <ExamNav
                prevDisabled={prevLocked}
                nextDisabled={nextLocked}
                onPrev={() => goTo(idx - 1)}
                onNext={() => (lastQuestion ? requestFinish() : goTo(idx + 1))}
                nextLabel={nextLabel}
                progress={`${idx + 1} / ${questions.length}`}
                submit={lastQuestion && !practice}
              />
              {submitStatus}
            </>
          )
        }
      />
      {confirmRestart && (
        <RestartPracticeDialog onClose={(restart) => {
          setConfirmRestart(false);
          if (restart) startNew();
        }} />
      )}
      {unansweredToConfirm > 0 ? (
        <MessageDialog title="Submit with unanswered questions?" onClose={() => setUnansweredToConfirm(0)}>
          <p>You have {unansweredToConfirm} unanswered {unansweredToConfirm === 1 ? "question" : "questions"}.</p>
          <form className="row message-dialog-close" method="dialog">
            <button className="btn btn-ghost" type="submit" data-dialog-autofocus>
              Return to questions
            </button>
            <button className="btn btn-primary" type="button" onClick={() => void finish()}>
              Submit anyway
            </button>
          </form>
        </MessageDialog>
      ) : null}
    </div>
  );
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

export type AnswerCheckFailure = { message?: string; retryChoice?: Letter };

export function QuestionBlock({
  q,
  index,
  selected,
  reveal,
  checking = false,
  answerFailure,
  compactFeedback,
  onChoose,
  marked,
  onMark,
  isPro,
  lockPaid = true,
  lockChoice = false,
  headingRef,
  extra,
  navigation,
  explainOpen,
  onToggleExplain,
  tutor = false,
  reason,
  reviewAnchor,
}: {
  q: Question;
  index: number;
  selected?: "A" | "B" | "C" | "D";
  reveal?: boolean;
  checking?: boolean;
  answerFailure?: AnswerCheckFailure;
  compactFeedback?: boolean;
  onChoose?: (l: "A" | "B" | "C" | "D") => void;
  marked?: boolean;
  onMark?: () => void;
  isPro?: boolean;
  lockPaid?: boolean;
  lockChoice?: boolean;
  headingRef?: Ref<HTMLHeadingElement>;
  explain?: boolean;
  extra?: ReactNode;
  navigation?: ReactNode;
  explainOpen?: boolean;
  onToggleExplain?: () => void;
  tutor?: boolean;
  reason?: string;
  reviewAnchor?: string;
}) {
  const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const letters = (["A", "B", "C", "D"] as const).filter((letter) => map[letter]);
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
      {q.state === "CT" ? <p><a className="btn btn-ghost card-action" href={ctSources.manual} target="_blank" rel="noopener noreferrer">Open Official Handbook</a></p> : null}
      {reason ? <p className="notice">Why this question? {reason}</p> : null}
      {q.scenario_text ? <p className="notice">{q.scenario_text}</p> : null}
      <h3 className="quiz-heading quiz-stem" id={reviewAnchor} ref={headingRef} tabIndex={-1}>
        {marked ? <span className="flagged-note"><FlagIcon /> Flagged</span> : null}
        {index + 1}. {q.question_text}
      </h3>
      {locked ? (
        <div className="explain">
          <strong>Pro question</strong>
          <p><MemberCopy member={packFor(q.state)?.purchaseEnabled === false ? 'Continue reviewing with the starter question pool and official sources.' : 'This item is in the full question bank. Unlock Pro to turn weak topics into passing scores.'}>{packFor(q.state)?.purchaseEnabled === false ? 'Continue reviewing with the free question pool and official sources.' : 'This item is in the full question bank. Unlock Pro to turn weak topics into passing scores.'}</MemberCopy></p>
          <Link className="btn btn-primary" href={packFor(q.state)?.purchaseEnabled === false ? `${packFor(q.state)!.paths.practice}?mode=quick` : q.state === "CT" ? "/connecticut/practice/?mode=quick" : paths.pricing} data-upgrade-source="locked_question">
            <MemberCopy member={packFor(q.state)?.purchaseEnabled === false ? "Start Member Practice" : q.state === "CT" ? "Start Member Quick 10" : "Unlock Pro"}>{packFor(q.state)?.purchaseEnabled === false ? "Start Free Practice" : q.state === "CT" ? "Start Free Quick 10" : "Unlock Pro"}</MemberCopy>
          </Link>
        </div>
      ) : null}
      <div className="q-options" role="group" aria-label="Answer choices" aria-busy={checking || undefined}>
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
          const retainFocus = Boolean(onChoose && lockChoice && !locked && selected === l);
          return (
            <button
              key={l}
              className={cls}
              type="button"
              aria-pressed={selected === l}
              aria-label={`${l}. ${map[l]}${status ? `. ${status}` : ""}`}
              disabled={(choiceDisabled && !retainFocus) || Boolean(answerFailure?.retryChoice && answerFailure.retryChoice !== l)}
              aria-disabled={checking || retainFocus || undefined}
              onClick={() => { if (!checking && !choiceDisabled) onChoose?.(l); }}
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
      {!checking && answerFailure ? (
        <p className="form-error" role="alert">
          {answerFailure.message || "Could not check this answer."}{" "}
          {answerFailure.retryChoice ? `Select ${answerFailure.retryChoice} to try again.` : "Select an option to try again."}
        </p>
      ) : null}
      {navigation ? <div className="question-navigation">{navigation}</div> : null}
      {reveal && !locked ? (
        <AnswerResult
          q={q}
          selected={selected}
          open={explainOpen}
          onToggle={onToggleExplain}
          compactFeedback={compactFeedback}
          tutor={tutor && !packFor(q.state)?.freeLaunch}
        />
      ) : null}
    </div>
  );
}
