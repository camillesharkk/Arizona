"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import type { Difficulty, TopicId } from "@/lib/types";
import { QuestionBlock } from "@/components/ExamRunner";
import { AccountInvite } from "@/components/AccountInvite";
import { TutorPanel } from "@/components/TutorPanel";
import { shuffleQuestionOptions, type Letter } from "@/lib/quiz";
import { loadProgress, recordAnswer, saveProgress, subscribeProgress, toggleFlag } from "@/lib/storage";
import { usePracticeAutoAdvance } from "@/lib/practice-auto-advance";

export function QuestionsClient({ topic }: { topic?: TopicId }) {
  const [filter, setFilter] = useState<"all" | TopicId | "wrong" | "unanswered">(topic ?? "all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [progress, setProgress] = useState(() => loadProgress());
  const [explainOpen, setExplainOpen] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const sessionSeed = useMemo(() => Math.floor(Math.random() * 1_000_000_000), []);
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const choiceLock = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
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
    setIdx(nextIdx);
  }

  useEffect(() => {
    headingRef.current?.focus();
  }, [safeIdx, q?.question_id]);

  if (!q) {
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
            }}
          >
            {d}
          </button>
        ))}
      </div>
      <p className="notice">
        Answered {answered} · This session correct {correctSession} · Wrong notebook {progress.wrongIds.length}
      </p>
      <QuestionBlock
        q={q}
        index={safeIdx}
        selected={selected}
        reveal={!!selected}
        lockChoice={!!selected}
        headingRef={headingRef}
        onChoose={(l) => {
          if (answers[q.question_id] || choiceLock.current === q.question_id) return;
          choiceLock.current = q.question_id;
          setAnswers((a) => ({ ...a, [q.question_id]: l }));
          recordAnswer(q.question_id, l === q.correct_option);
          saveProgress({ lastQuestionId: q.question_id });
          fetch("/api/progress/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: q.question_id, selected: originalLetter(l) }),
          }).catch(() => undefined);
          setExplainOpen(true);
          if (l === q.correct_option) {
            scheduleAfterCorrect(!lastQuestion, () => setIdx((i) => Math.min(pool.length - 1, i + 1)));
          }
        }}
        marked={progress.flaggedIds.includes(q.question_id)}
        onMark={() => toggleFlag(q.question_id)}
        isPro={isPro}
      />
      {selected && <TutorPanel q={q} selected={originalLetter(selected)} />}
      {selected && (
        <details className="explain" open={explainOpen}>
          <summary>Why this option is right or wrong</summary>
          <p>{q.option_feedback[selected]}</p>
        </details>
      )}
      <AccountInvite compact />
      <div className="sticky-nav">
        <div className="wrap row space">
          <button className="btn btn-ghost" type="button" disabled={safeIdx === 0} onClick={() => goTo(safeIdx - 1)}>
            Previous
          </button>
          <button
            className="btn btn-primary"
            type="button"
            disabled={lastQuestion}
            onClick={() => goTo(Math.min(pool.length - 1, safeIdx + 1))}
          >
            {lastQuestion ? "Last question" : "Next Question"}
          </button>
        </div>
      </div>
    </div>
  );
}
