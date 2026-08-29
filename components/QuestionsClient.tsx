"use client";

import { useEffect, useMemo, useState } from "react";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import type { Difficulty, TopicId } from "@/lib/types";
import { QuestionBlock } from "@/components/ExamRunner";
import { AccountInvite } from "@/components/AccountInvite";
import { TutorPanel } from "@/components/TutorPanel";
import { loadProgress, recordAnswer, saveProgress, subscribeProgress, toggleFlag } from "@/lib/storage";

export function QuestionsClient({ topic }: { topic?: TopicId }) {
  const [filter, setFilter] = useState<"all" | TopicId | "wrong" | "unanswered">(topic ?? "all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [progress, setProgress] = useState(() => loadProgress());
  const [explainOpen, setExplainOpen] = useState(false);
  const [resumed, setResumed] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => subscribeProgress(() => setProgress(loadProgress())), []);
  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setIsPro(d.user?.plan === "pro"))
      .catch(() => undefined);
  }, []);

  const pool = useMemo(() => {
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
  const answered = progress.answeredIds.length;
  const correctSession = publishedQuestions().filter((item) => answers[item.question_id] === item.correct_option).length;

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
        onChoose={(l) => {
          setAnswers((a) => ({ ...a, [q.question_id]: l }));
          recordAnswer(q.question_id, l === q.correct_option);
          saveProgress({ lastQuestionId: q.question_id });
          fetch("/api/progress/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: q.question_id, selected: l }),
          }).catch(() => undefined);
          setExplainOpen(true);
        }}
        marked={progress.flaggedIds.includes(q.question_id)}
        onMark={() => toggleFlag(q.question_id)}
        isPro={isPro}
      />
      {selected && <TutorPanel q={q} selected={selected} />}
      {selected && (
        <details className="explain" open={explainOpen}>
          <summary>Why this option is right or wrong</summary>
          <p>{q.option_feedback[selected]}</p>
        </details>
      )}
      <AccountInvite compact />
      <div className="sticky-nav">
        <div className="wrap row space">
          <button className="btn btn-ghost" type="button" disabled={safeIdx === 0} onClick={() => setIdx(safeIdx - 1)}>
            Previous
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => setIdx(Math.min(pool.length - 1, safeIdx + 1))}
          >
            Next Question
          </button>
        </div>
      </div>
    </div>
  );
}
