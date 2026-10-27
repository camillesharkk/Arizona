"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import type { Difficulty, TopicId } from "@/lib/types";
import { QuestionBlock } from "@/components/ExamRunner";
import { ExamNav, LoadingNote, QuestionJump } from "@/components/QuizChrome";
import { shuffleQuestionOptions, type Letter } from "@/lib/quiz";
import { loadProgress, recordAnswer, saveProgress, subscribeProgress } from "@/lib/storage";
import { clearSitting, readSitting, writeSitting } from "@/lib/sitting";
import { scrollUnderHeaderAfterLayout } from "@/lib/scroll-under-header";
import { usePracticeAutoAdvance } from "@/lib/practice-auto-advance";
import { SaveForReview } from "@/components/SaveForReview";
import { settleSave, SubmitStatus } from "@/components/SubmitStatus";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { paths } from "@/lib/paths";
import { isActiveQuestion } from "@/lib/question-status";

export function QuestionsClient({ topic }: { topic?: TopicId }) {
  const [filter, setFilter] = useState<"all" | TopicId | "wrong" | "unanswered">(topic ?? "all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [progress, setProgress] = useState(() => loadProgress());
  const [resumed, setResumed] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pastIndex, setPastIndex] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [owner, setOwner] = useState("guest");
  const [seed, setSeed] = useState<number | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const [marked, setMarked] = useState<string[]>([]);
  const [explainOpen, setExplainOpen] = useState<Record<string, boolean>>({});
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [bootError, setBootError] = useState(false);
  const [bootTry, setBootTry] = useState(0);
  const recordedIds = useRef<string[]>([]);
  const modeKey = `questions:${topic || filter}:${difficulty}`;
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const choiceLock = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const reviewScroll = useRef(0);
  const doneOnce = useRef(false);
  const attemptIds = useRef<Record<string, string>>({});
  const pendingSaves = useRef<Promise<Response>[]>([]);
  const scrollIdx = useRef<number | null>(null);
  const scrollExplain = useRef(false);
  const { cancel: cancelAutoAdvance, scheduleAfterCorrect } = usePracticeAutoAdvance();

  useEffect(() => subscribeProgress(() => setProgress(loadProgress())), []);
  useEffect(() => {
    let cancel = false;
    setAuthReady(false);
    setBootError(false);
    fetch("/api/auth/me/")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("account"))))
      .then((data) => {
        if (cancel) return;
        const nextOwner = data.user?.id || "guest";
        const pro = Boolean(data.user?.arizonaPro || data.user?.plan === "pro");
        const existing = readSitting(sessionStorage, nextOwner, modeKey);
        setOwner(nextOwner);
        setIsPro(pro);
        setSeed(existing?.seed ?? Math.floor(Math.random() * 1_000_000_000));
        setOrder(existing?.questionIds ?? null);
        if (existing) {
          setIdx(existing.idx);
          setAnswers(existing.answers);
          setExplainOpen(existing.explainOpen);
          setMarked(existing.flaggedIds);
          recordedIds.current = existing.recordedIds;
          attemptIds.current = existing.attemptIds;
          setDone(existing.done);
          setResumed(true);
        } else {
          setIdx(0);
          setAnswers({});
          setExplainOpen({});
          setMarked([]);
          recordedIds.current = [];
          attemptIds.current = {};
          setDone(false);
        }
        setAuthReady(true);
        setLoadedKey(modeKey);
      })
      .catch(() => {
        if (!cancel) setBootError(true);
      });
    return () => {
      cancel = true;
    };
  }, [modeKey, bootTry]);

  const rawPool = useMemo(() => {
    let list = publishedQuestions().filter((q) => q.is_free || isPro);
    if (topic) list = list.filter((q) => q.topic === topic);
    else if (filter !== "all" && filter !== "wrong" && filter !== "unanswered") {
      list = list.filter((q) => q.topic === filter);
    }
    if (filter === "wrong") list = list.filter((q) => progress.wrongIds.includes(q.question_id));
    if (filter === "unanswered") list = list.filter((q) => !progress.answeredIds.includes(q.question_id));
    if (difficulty !== "all") list = list.filter((q) => q.difficulty === difficulty);
    return list;
  }, [filter, difficulty, topic, progress.wrongIds, progress.answeredIds, isPro]);

  const pool = useMemo(() => {
    const maps: Record<string, Record<Letter, Letter>> = {};
    const out = rawPool.map((item) => {
      const { question, toOriginal } = shuffleQuestionOptions(item, seed ?? 0);
      maps[item.question_id] = toOriginal;
      return question;
    });
    toOriginalRef.current = maps;
    return out;
  }, [rawPool, seed]);

  const orderedPool = useMemo(() => {
    if (!order?.length) return pool;
    const byId = new Map(pool.map((item) => [item.question_id, item]));
    const kept = order.flatMap((id) => {
      const question = byId.get(id);
      return question ? [question] : [];
    });
    return kept.length ? kept : pool;
  }, [pool, order]);

  useEffect(() => {
    if (!authReady || loadedKey !== modeKey || order) return;
    if (pool.length) setOrder(pool.map((item) => item.question_id));
  }, [authReady, loadedKey, modeKey, order, pool]);

  useEffect(() => {
    if (!authReady || loadedKey !== modeKey || seed == null || !order?.length) return;
    try {
      writeSitting(sessionStorage, {
        version: 1,
        owner,
        state: "AZ",
        mode: modeKey,
        seed,
        questionIds: order,
        idx,
        answers,
        explainOpen,
        flaggedIds: marked,
        startedAt: null,
        timeLimitSeconds: null,
        done,
        examId: null,
        attemptIds: attemptIds.current,
        recordedIds: recordedIds.current,
        scored: false,
      });
    } catch {
      /* storage can be blocked */
    }
  }, [authReady, loadedKey, modeKey, seed, order, idx, answers, explainOpen, marked, done, owner]);

  const active = orderedPool;
  const safeIdx = Math.min(idx, Math.max(0, active.length - 1));
  const q = active[safeIdx];
  const selected = q ? answers[q.question_id] : undefined;
  const lastQuestion = safeIdx + 1 >= active.length;
  const answered = progress.answeredIds.length;
  const correctSession = active.filter((item) => answers[item.question_id] === item.correct_option).length;

  function originalLetter(display: Letter): Letter {
    if (!q) return display;
    return toOriginalRef.current[q.question_id]?.[display] ?? display;
  }

  function goTo(nextIdx: number) {
    cancelAutoAdvance();
    setPastIndex(null);
    setIdx(nextIdx);
  }

  function attemptId(questionId: string) {
    if (!attemptIds.current[questionId]) attemptIds.current[questionId] = crypto.randomUUID();
    return attemptIds.current[questionId];
  }

  async function finishSet() {
    if (doneOnce.current || submitting) return;
    doneOnce.current = true;
    setSubmitError("");
    setSubmitting(true);
    cancelAutoAdvance();
    const outcomes = await Promise.all(pendingSaves.current.map((save) => settleSave(save)));
    if (outcomes.some((outcome) => outcome === "fail")) {
      doneOnce.current = false;
      setSubmitting(false);
      setSubmitError("We couldn't save this set. Your answers are still here.");
      return;
    }
    setSubmitting(false);
    setDone(true);
  }

  function openPast() {
    if (safeIdx < 1) return;
    cancelAutoAdvance();
    reviewScroll.current = window.scrollY;
    setPastIndex(safeIdx - 1);
  }

  function closePast() {
    const y = reviewScroll.current;
    setPastIndex(null);
    requestAnimationFrame(() => window.scrollTo(0, y));
  }

  useEffect(() => {
    if (!authReady || !q) return;
    const open = Boolean(explainOpen[q.question_id]);
    const idxChanged = scrollIdx.current !== safeIdx;
    const explainOpened = open && !scrollExplain.current;
    scrollIdx.current = safeIdx;
    scrollExplain.current = open;
    if (!idxChanged && !explainOpened) return;
    headingRef.current?.focus({ preventScroll: true });
    const explain = open ? document.querySelector(".home-exam .explain") : null;
    scrollUnderHeaderAfterLayout(open ? explain || headingRef.current : headingRef.current);
  }, [safeIdx, authReady, q, explainOpen]);

  const selectedTopic: TopicId | null =
    topic ?? (filter !== "all" && filter !== "wrong" && filter !== "unanswered" ? filter : null);
  const topicQuestions = selectedTopic
    ? publishedQuestions().filter((item) => item.topic === selectedTopic && isActiveQuestion(item))
    : [];
  const topicFreeCount = topicQuestions.filter((item) => item.is_free).length;
  const proOnlyTopic = Boolean(selectedTopic && !isPro && topicFreeCount === 0 && topicQuestions.length > 0);

  if (bootError) {
    return (
      <div className="card">
        <p className="form-error" role="alert">Could not load this practice set.</p>
        <button className="btn btn-primary" type="button" onClick={() => setBootTry((n) => n + 1)}>Retry</button>
      </div>
    );
  }

  if (!authReady) return <LoadingNote />;

  if (!q && !proOnlyTopic) {
    return <p>No questions match these filters.</p>;
  }

  return (
    <div>
      <div className="filter-row">
        {!topic &&
          (["all", "wrong", "unanswered", ...topics.map((t) => t.id)] as const).map((id) => (
            <button
              key={id}
              className={`chip ${filter === id ? "on" : ""}`}
              type="button"
              onClick={() => {
                cancelAutoAdvance();
                setFilter(id);
                setIdx(0);
                setDone(false);
                doneOnce.current = false;
                setPastIndex(null);
                setResumed(true);
              }}
            >
              {id === "all" ? "All topics" : id === "wrong" ? "Wrong" : id === "unanswered" ? "Unanswered" : topics.find((t) => t.id === id)?.short}
            </button>
          ))}
        {(["all", "easy", "medium", "hard"] as const).map((d) => (
          <button
            key={d}
            className={`chip ${difficulty === d ? "on" : ""}`}
            type="button"
            onClick={() => {
              cancelAutoAdvance();
              setDifficulty(d);
              setIdx(0);
              setDone(false);
              doneOnce.current = false;
              setPastIndex(null);
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="notice">
        Answered {answered} · This session correct {correctSession} · Wrong notebook {progress.wrongIds.length}
      </p>
      {proOnlyTopic ? (
        <div className="card">
          <h2>{topics.find((t) => t.id === selectedTopic)?.label} is in the Pro bank</h2>
          <p>
            This topic has {topicQuestions.length} practice questions and no free questions. Quick 10 still uses the free
            pool, and topics with free questions can be practiced without Pro.
          </p>
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
          <Link className="btn btn-ghost" href={`${paths.practice}?mode=quick`} style={{ marginLeft: 8 }}>
            Free Quick 10
          </Link>
        </div>
      ) : done ? (
        <div className="card">
          <h2>You finished this set.</h2>
          <p>{correctSession} of {active.length} correct in this sitting.</p>
          <div className="row">
            <Link className="btn btn-primary" href={paths.study}>Review the study guide</Link>
            <WrongAnswersLink className="btn btn-ghost" label="Review wrong answers" />
          </div>
        </div>
      ) : q ? (
      <div className="home-exam">
        <div className="row space">
          <span className="notice">Question {safeIdx + 1} of {active.length}{resumed ? " · Resumed" : ""}</span>
          <button className="btn btn-ghost" type="button" onClick={() => {
            if (!window.confirm("Start a new set? This replaces the unfinished one.")) return;
            clearSitting(sessionStorage, owner, modeKey);
            setSeed(Math.floor(Math.random() * 1_000_000_000));
            setOrder(null);
            setIdx(0);
            setAnswers({});
            setExplainOpen({});
            setMarked([]);
            setDone(false);
            setResumed(false);
            recordedIds.current = [];
            attemptIds.current = {};
            doneOnce.current = false;
          }}>Start new</button>
        </div>
        <div className="progress-bar" style={{ margin: "10px 0 18px" }}>
          <span style={{ width: `${((safeIdx + 1) / active.length) * 100}%` }} />
        </div>
        <QuestionJump ids={active.map((item) => item.question_id)} index={pastIndex ?? safeIdx} flagged={marked} onJump={goTo} />
        {safeIdx > 0 && pastIndex == null ? (
          <button className="card-corner-btn" type="button" onClick={openPast}>Previous answer</button>
        ) : null}
        {pastIndex != null && active[pastIndex] ? (
          <>
            <QuestionBlock
              q={active[pastIndex]}
              index={pastIndex}
              selected={answers[active[pastIndex].question_id]}
              reveal
              lockChoice
              isPro={isPro}
              marked={marked.includes(active[pastIndex].question_id)}
              extra={<SaveForReview questionId={active[pastIndex].question_id} hint={false} />}
              explainOpen={Boolean(explainOpen[active[pastIndex].question_id])}
              onToggleExplain={() => {
                const id = active[pastIndex].question_id;
                setExplainOpen((current) => ({ ...current, [id]: !current[id] }));
              }}
            />
            <button className="card-corner-btn" type="button" onClick={closePast}>Back to this question</button>
          </>
        ) : (
          <QuestionBlock
            q={q}
            index={safeIdx}
            selected={selected}
            reveal={!!selected}
            lockChoice={!!selected}
            headingRef={headingRef}
            onChoose={(l) => {
                if (recordedIds.current.includes(q.question_id) || answers[q.question_id] || choiceLock.current === q.question_id) return;
                choiceLock.current = q.question_id;
                recordedIds.current = [...recordedIds.current, q.question_id];
                setAnswers((a) => ({ ...a, [q.question_id]: l }));
                recordAnswer(q.question_id, l === q.correct_option);
                saveProgress({ lastQuestionId: q.question_id });
                pendingSaves.current.push(fetch("/api/progress/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ questionId: q.question_id, selected: originalLetter(l), attemptId: attemptId(q.question_id) }),
                }));
                if (l === q.correct_option) {
                  const at = safeIdx;
                  scheduleAfterCorrect(() => {
                    if (at + 1 < active.length) setIdx(at + 1);
                    else finishSet();
                  });
                } else {
                  cancelAutoAdvance();
                }
              }}
              marked={marked.includes(q.question_id)}
              onMark={() => setMarked((current) => current.includes(q.question_id) ? current.filter((id) => id !== q.question_id) : [...current, q.question_id])}
              isPro={isPro}
              extra={<SaveForReview questionId={q.question_id} hint={false} />}
              explainOpen={Boolean(explainOpen[q.question_id])}
              onToggleExplain={() => setExplainOpen((current) => ({ ...current, [q.question_id]: !current[q.question_id] }))}
              tutor
            />
        )}
        {submitting ? <SubmitStatus /> : null}
        {submitError ? (
          <p className="form-error" role="alert">
            {submitError}{" "}
            <button className="btn btn-ghost" type="button" onClick={() => void finishSet()}>Try again</button>
          </p>
        ) : null}
        <ExamNav
          prevDisabled={safeIdx === 0 || pastIndex != null || submitting}
          nextDisabled={pastIndex != null || submitting || !selected}
          onPrev={() => goTo(safeIdx - 1)}
          onNext={() => (lastQuestion ? void finishSet() : goTo(safeIdx + 1))}
          nextLabel={lastQuestion ? "See results" : "Next"}
          progress={`${safeIdx + 1} / ${active.length}`}
        />
      </div>
      ) : null}
    </div>
  );
}
