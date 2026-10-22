"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import type { Difficulty, TopicId } from "@/lib/types";
import { QuestionBlock } from "@/components/ExamRunner";
import { AccountInvite } from "@/components/AccountInvite";
import { TutorPanel } from "@/components/TutorPanel";
import { CardStage } from "@/components/CardStage";
import { AnswerReview } from "@/components/AnswerReview";
import { shuffleQuestionOptions, type Letter } from "@/lib/quiz";
import { loadProgress, recordAnswer, saveProgress, subscribeProgress, toggleFlag } from "@/lib/storage";
import { usePracticeAutoAdvance } from "@/lib/practice-auto-advance";
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
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [pastIndex, setPastIndex] = useState<number | null>(null);
  const [isPro, setIsPro] = useState(false);
  const sessionSeed = useMemo(() => Math.floor(Math.random() * 1_000_000_000), []);
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const choiceLock = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const reviewScroll = useRef(0);
  const doneOnce = useRef(false);
  const attemptIds = useRef<Record<string, string>>({});
  const pendingSaves = useRef<Promise<unknown>[]>([]);
  const { cancel: cancelAutoAdvance, scheduleAfterCorrect } = usePracticeAutoAdvance();

  useEffect(() => subscribeProgress(() => setProgress(loadProgress())), []);
  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setIsPro(Boolean(d.user?.arizonaPro || d.user?.plan === "pro")))
      .catch(() => undefined);
  }, []);

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
      const { question, toOriginal } = shuffleQuestionOptions(item, sessionSeed);
      maps[item.question_id] = toOriginal;
      return question;
    });
    toOriginalRef.current = maps;
    return out;
  }, [rawPool, sessionSeed]);

  useEffect(() => {
    if (resumed || topic) return;
    const last = progress.lastQuestionId;
    if (!last) {
      setResumed(true);
      return;
    }
    const i = pool.findIndex((q) => q.question_id === last);
    if (i >= 0) setIdx(i);
    setResumed(true);
  }, [pool, progress.lastQuestionId, resumed, topic]);

  const safeIdx = Math.min(idx, Math.max(0, pool.length - 1));
  const q = pool[safeIdx];
  const selected = q ? answers[q.question_id] : undefined;
  const lastQuestion = safeIdx + 1 >= pool.length;
  const answered = progress.answeredIds.length;
  const correctSession = pool.filter((item) => answers[item.question_id] === item.correct_option).length;

  function originalLetter(display: Letter): Letter {
    if (!q) return display;
    return toOriginalRef.current[q.question_id]?.[display] ?? display;
  }

  function goTo(nextIdx: number) {
    cancelAutoAdvance();
    setPastIndex(null);
    setWrongId(null);
    setIdx(nextIdx);
  }

  function attemptId(questionId: string) {
    if (!attemptIds.current[questionId]) attemptIds.current[questionId] = crypto.randomUUID();
    return attemptIds.current[questionId];
  }

  function finishSet() {
    if (doneOnce.current) return;
    doneOnce.current = true;
    cancelAutoAdvance();
    void Promise.allSettled(pendingSaves.current).finally(() => setDone(true));
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
    headingRef.current?.focus({ preventScroll: true });
  }, [safeIdx, q?.question_id]);

  const selectedTopic: TopicId | null =
    topic ?? (filter !== "all" && filter !== "wrong" && filter !== "unanswered" ? filter : null);
  const topicQuestions = selectedTopic
    ? publishedQuestions().filter((item) => item.topic === selectedTopic && isActiveQuestion(item))
    : [];
  const topicFreeCount = topicQuestions.filter((item) => item.is_free).length;
  const proOnlyTopic = Boolean(selectedTopic && !isPro && topicFreeCount === 0 && topicQuestions.length > 0);

  if (!q && !proOnlyTopic) {
    return <p>No questions match these filters.</p>;
  }

  return (
    <div className="exam-pad">
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
                setWrongId(null);
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
              setWrongId(null);
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
          <p>{correctSession} of {pool.length} correct in this sitting.</p>
          <div className="row">
            <Link className="btn btn-primary" href={paths.study}>Review the study guide</Link>
            <WrongAnswersLink className="btn btn-ghost" label="Review wrong answers" />
          </div>
        </div>
      ) : q ? (
      <CardStage
        onPrev={() => goTo(safeIdx - 1)}
        prevDisabled={safeIdx === 0 || pastIndex != null}
        onNext={() => (lastQuestion ? finishSet() : goTo(safeIdx + 1))}
        nextDisabled={pastIndex != null || !selected}
        nextLabel={lastQuestion ? "See results" : "Next"}
        corner={
          safeIdx > 0 && pastIndex == null ? (
            <button className="card-corner-btn" type="button" onClick={openPast}>Previous answer</button>
          ) : null
        }
      >
        {pastIndex != null && pool[pastIndex] ? (
          <AnswerReview q={pool[pastIndex]} index={pastIndex} selected={answers[pool[pastIndex].question_id]} onBack={closePast} />
        ) : selected && selected !== q.correct_option && wrongId === q.question_id ? (
          <AnswerReview q={q} index={safeIdx} selected={selected} />
        ) : (
          <>
            <QuestionBlock
              q={q}
              index={safeIdx}
              selected={selected}
              reveal={!!selected}
              explain={false}
              lockChoice={!!selected}
              headingRef={headingRef}
              onChoose={(l) => {
                if (answers[q.question_id] || choiceLock.current === q.question_id) return;
                choiceLock.current = q.question_id;
                setAnswers((a) => ({ ...a, [q.question_id]: l }));
                recordAnswer(q.question_id, l === q.correct_option);
                saveProgress({ lastQuestionId: q.question_id });
                pendingSaves.current.push(fetch("/api/progress/", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ questionId: q.question_id, selected: originalLetter(l), attemptId: attemptId(q.question_id) }),
                }).catch(() => undefined));
                if (l === q.correct_option) {
                  setWrongId(null);
                  const at = safeIdx;
                  scheduleAfterCorrect(() => {
                    if (at + 1 < pool.length) setIdx(at + 1);
                    else finishSet();
                  });
                } else {
                  cancelAutoAdvance();
                  setWrongId(q.question_id);
                }
              }}
              marked={progress.flaggedIds.includes(q.question_id)}
              onMark={() => toggleFlag(q.question_id)}
              isPro={isPro}
            />
            {selected === q.correct_option ? <p className="notice" role="status">Correct.</p> : null}
            {selected === q.correct_option ? <TutorPanel q={q} selected={originalLetter(selected)} /> : null}
            <AccountInvite compact />
          </>
        )}
      </CardStage>
      ) : null}
    </div>
  );
}
