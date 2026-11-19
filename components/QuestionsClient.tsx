"use client";

import { MemberCopy } from "@/components/MemberCopy";
import { clientStatePro } from "@/lib/state-pro";

import { fetchAccount } from "@/lib/client-account";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { topics } from "@/data/exam-config";
import type { Difficulty } from "@/lib/types";
import type { Letter } from "@/lib/answer-sequence";
import { QuestionBlock } from "@/components/ExamRunner";
import { ExamNav, LoadingNote, QuestionJump, RestartPracticeDialog } from "@/components/QuizChrome";
import { loadProgress, recordAnswer, saveProgress, subscribeProgress } from "@/lib/storage";
import { clearSitting, readSitting, writeSitting } from "@/lib/sitting";
import { scrollUnderHeaderAfterLayout } from "@/lib/scroll-under-header";
import { usePracticeAutoAdvance } from "@/lib/practice-auto-advance";
import { SaveForReview } from "@/components/SaveForReview";
import { settleSave, SubmitStatus } from "@/components/SubmitStatus";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { paths } from "@/lib/paths";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { packFor } from "@/lib/client-pack";
import type { Question, StateCode } from "@/lib/types";

export function QuestionsClient({
  topic,
  stateCode = "AZ",
  topicChoices,
}: {
  topic?: string;
  stateCode?: StateCode;
  questions?: Question[];
  topicChoices?: { id: string; short: string; label: string }[];
}) {
  const pack = packFor(stateCode);
  const sitePaths = pack ? pack.paths : stateCode === "HI" ? hiPaths : stateCode === "CA" ? caPaths : paths;
  const topicList = topicChoices ?? pack?.topics.map(item => ({ ...item, short: item.label })) ?? topics;
  const [filter, setFilter] = useState<string>(topic ?? "all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [progress, setProgress] = useState(() => loadProgress(stateCode));
  const [resumed, setResumed] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmRestart, setConfirmRestart] = useState(false);
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
  const tokenById = useRef<Record<string, string>>({});
  const canonicalRef = useRef<Record<string, Letter>>({});
  const progressRef = useRef(progress);
  progressRef.current = progress;
  const [served, setServed] = useState<Question[]>([]);
  const [pageMeta, setPageMeta] = useState({ total: 0, nextOffset: null as number | null, freeCount: 0, topicCount: 0 });
  const choiceLock = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const reviewScroll = useRef(0);
  const doneOnce = useRef(false);
  const attemptIds = useRef<Record<string, string>>({});
  const pendingSaves = useRef<Promise<Response>[]>([]);
  const scrollIdx = useRef<number | null>(null);
  const scrollExplain = useRef(false);
  const { cancel: cancelAutoAdvance, scheduleAfterCorrect } = usePracticeAutoAdvance();

  useEffect(() => subscribeProgress(() => setProgress(loadProgress(stateCode))), [stateCode]);
  useEffect(() => {
    let cancel = false;
    setAuthReady(false);
    setBootError(false);
    fetchAccount()
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("account"))))
      .then((data) => {
        if (cancel) return;
        const nextOwner = data.user?.id || "guest";
        const pro = clientStatePro(data.user, stateCode);
        const existing = readSitting(sessionStorage, nextOwner, modeKey, stateCode);
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
  }, [modeKey, bootTry, stateCode]);

  useEffect(() => {
    if (!authReady || loadedKey !== modeKey || seed == null) return;
    let cancel = false;
    const snapshot = progressRef.current;
    fetch("/api/practice/batch/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        kind: "topic",
        state: stateCode,
        topic,
        filter,
        difficulty,
        seed,
        offset: 0,
        wrongIds: snapshot.wrongIds.slice(0, 80),
        unansweredIds: snapshot.answeredIds.slice(0, 200),
      }),
    })
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (cancel) return;
        if (!response.ok) {
          setSubmitError(body.error || "Could not load these questions.");
          setServed([]);
          return;
        }
        const list = (body.questions || []) as Question[];
        tokenById.current = {};
        for (const item of list) tokenById.current[item.question_id] = body.token || "";
        setServed(list);
        setOrder(list.map((item) => item.question_id));
        setPageMeta({ total: body.total || list.length, nextOffset: body.nextOffset ?? null, freeCount: body.freeCount || 0, topicCount: body.topicCount || 0 });
      })
      .catch(() => {
        if (!cancel) setBootError(true);
      });
    return () => {
      cancel = true;
    };
  }, [authReady, loadedKey, modeKey, seed, filter, difficulty, topic, stateCode]);

  useEffect(() => {
    if (!authReady || loadedKey !== modeKey || seed == null || !order?.length) return;
    try {
      writeSitting(sessionStorage, {
        version: 1,
        owner,
        state: stateCode,
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
  }, [authReady, loadedKey, modeKey, seed, order, idx, answers, explainOpen, marked, done, owner, stateCode]);

  const active = served;
  const safeIdx = Math.min(idx, Math.max(0, active.length - 1));
  const q = active[safeIdx];
  const selected = q ? answers[q.question_id] : undefined;
  const lastQuestion = safeIdx + 1 >= active.length;
  const answered = progress.answeredIds.length;
  const correctSession = active.filter((item) => answers[item.question_id] === item.correct_option).length;

  function originalLetter(display: Letter): Letter {
    if (!q) return display;
    return canonicalRef.current[`${q.question_id}:${display}`] ?? display;
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

  const selectedTopic: string | null =
    topic ?? (filter !== "all" && filter !== "wrong" && filter !== "unanswered" ? filter : null);
  const topicFreeCount = pageMeta.freeCount;
  const proOnlyTopic = Boolean(selectedTopic && !isPro && topicFreeCount === 0 && pageMeta.topicCount > 0);

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
      <div className="tool-row">
        {!topic &&
          (["all", "wrong", "unanswered", ...topicList.map((t) => t.id)]).map((id) => (
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
              {id === "all" ? "All topics" : id === "wrong" ? "Wrong" : id === "unanswered" ? "Unanswered" : topicList.find((t) => t.id === id)?.short}
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
          <h2>{topicList.find((t) => t.id === selectedTopic)?.label} is in the Pro bank</h2>
          <p>
            This topic has {pageMeta.topicCount}<MemberCopy member={<> practice questions and no starter questions. Quick 10 still uses the starter
            pool, and topics with starter questions can be practiced without Pro.
          </>}> practice questions and no free questions. Quick 10 still uses the free
            pool, and topics with free questions can be practiced without Pro.
          </MemberCopy></p>
          {pack?.purchaseEnabled !== false ? <Link className="btn btn-primary" href={sitePaths.pricing}>
            Unlock Pro
          </Link> : null}
          <Link className="btn btn-ghost" href={`${sitePaths.practice}?mode=quick`} style={{ marginLeft: 8 }}><MemberCopy member={<>
            Quick 10
          </>}>
            Free Quick 10
          </MemberCopy></Link>
        </div>
      ) : done ? (
        <div className="card">
          <h2>You finished this set.</h2>
          <p>{correctSession} of {active.length} correct in this sitting.</p>
          <div className="row">
            <Link className="btn btn-primary" href={sitePaths.study}>Review the study guide</Link>
            <WrongAnswersLink className="btn btn-ghost" label="Review wrong answers" href={sitePaths.mistakes} stateCode={stateCode} />
          </div>
        </div>
      ) : q ? (
      <div className="home-exam">
        <div className="row space">
          <span className="notice">Question {safeIdx + 1} of {active.length}{resumed ? " · Resumed" : ""}</span>
          <button className="btn btn-ghost" type="button" onClick={() => {
            cancelAutoAdvance();
            setConfirmRestart(true);
          }}>Start new</button>
        </div>
        {confirmRestart && (
          <RestartPracticeDialog onClose={(restart) => {
            setConfirmRestart(false);
            if (!restart) return;
            clearSitting(sessionStorage, owner, modeKey, stateCode);
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
          }} />
        )}
        <div className="progress-bar" style={{ margin: "10px 0 18px" }}>
          <span style={{ width: `${((safeIdx + 1) / active.length) * 100}%` }} />
        </div>
        <QuestionJump ids={active.map((item) => item.question_id)} index={pastIndex ?? safeIdx} flagged={marked} onJump={goTo} />
        {safeIdx > 0 && pastIndex == null ? (
          <button className="card-corner-btn" type="button" onClick={openPast}>Previous answer</button>
        ) : null}
        {pastIndex != null && active[pastIndex] ? (
          <QuestionBlock
            q={active[pastIndex]}
            index={pastIndex}
            selected={answers[active[pastIndex].question_id]}
            reveal
            lockChoice
            isPro={isPro}
            marked={marked.includes(active[pastIndex].question_id)}
            extra={<SaveForReview key={active[pastIndex].question_id} questionId={active[pastIndex].question_id} hint={false} onAsk={cancelAutoAdvance} />}
            navigation={<button className="btn btn-ghost" type="button" onClick={closePast}>Back to this question</button>}
            explainOpen={Boolean(explainOpen[active[pastIndex].question_id])}
            onToggleExplain={() => {
              const id = active[pastIndex].question_id;
              setExplainOpen((current) => ({ ...current, [id]: !current[id] }));
            }}
          />
        ) : (
          <QuestionBlock
            q={q}
            index={safeIdx}
            selected={selected}
            reveal={!!selected}
            compactFeedback
            lockChoice={!!selected}
            headingRef={headingRef}
            onChoose={async (l) => {
                if (recordedIds.current.includes(q.question_id) || answers[q.question_id] || choiceLock.current === q.question_id) return;
                choiceLock.current = q.question_id;
                const response = await fetch("/api/practice/feedback/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ token: tokenById.current[q.question_id], action: "one", questionId: q.question_id, display: l, attemptId: attemptId(q.question_id) }),
                });
                const revealed = await response.json().catch(() => ({}));
                if (!response.ok || !revealed.correctOption) {
                  choiceLock.current = null;
                  setSubmitError(revealed.error || "Could not check this answer. Your other answers are still here.");
                  return;
                }
                recordedIds.current = [...recordedIds.current, q.question_id];
                canonicalRef.current[`${q.question_id}:${l}`] = revealed.canonical;
                setServed((current) => current.map((item) => item.question_id === q.question_id ? { ...item, correct_option: revealed.correctOption, explanation: revealed.explanation, option_feedback: revealed.optionFeedback } : item));
                setAnswers((a) => ({ ...a, [q.question_id]: l }));
                recordAnswer(q.question_id, Boolean(revealed.correct), stateCode);
                saveProgress({ lastQuestionId: q.question_id }, stateCode);
                if (revealed.correct) {
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
              extra={<SaveForReview key={q.question_id} questionId={q.question_id} hint={false} onAsk={cancelAutoAdvance} />}
              explainOpen={Boolean(explainOpen[q.question_id])}
              onToggleExplain={() => setExplainOpen((current) => ({ ...current, [q.question_id]: !current[q.question_id] }))}
              tutor
              navigation={
                <>
                  <ExamNav
                    prevDisabled={safeIdx === 0 || submitting}
                    nextDisabled={submitting || !selected}
                    onPrev={() => goTo(safeIdx - 1)}
                    onNext={() => (lastQuestion ? void finishSet() : goTo(safeIdx + 1))}
                    nextLabel={lastQuestion ? "See results" : "Next"}
                    progress={`${safeIdx + 1} / ${active.length}`}
                  />
                  {submitting ? <SubmitStatus /> : null}
                  {submitError ? (
                    <p className="form-error" role="alert">
                      {submitError}{" "}
                      <button className="btn btn-ghost" type="button" onClick={() => void finishSet()}>Try again</button>
                    </p>
                  ) : null}
                </>
              }
            />
        )}
      </div>
      ) : null}
    </div>
  );
}
