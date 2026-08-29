"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { examConfig } from "@/data/exam-config";
import { pickExamSet, scorePercent, weakTopics } from "@/lib/quiz";
import { recordAnswer, saveProgress, toggleFlag, loadProgress } from "@/lib/storage";
import { AccountInvite } from "@/components/AccountInvite";
import { TutorPanel } from "@/components/TutorPanel";
import { getSource } from "@/data/sources";
import { paths } from "@/lib/paths";

type Mode = "quick" | "full" | "weak" | "practice";

export function ExamRunner({
  mode,
  practice,
  preset,
  isPro = false,
}: {
  mode: Mode;
  practice?: boolean;
  preset?: Question[];
  isPro?: boolean;
}) {
  const count = mode === "quick" ? 10 : mode === "full" ? examConfig.questionCount : 10;
  const questions = useMemo(() => {
    if (preset?.length) return preset;
    if (mode === "weak") {
      const ids = loadProgress().wrongIds;
      const pool = pickExamSet(200, { freeOnly: !isPro }).filter((q) => ids.includes(q.question_id));
      if (pool.length >= 5) return pool.slice(0, 10);
    }
    return pickExamSet(count, { freeOnly: !isPro });
  }, [count, mode, preset, isPro]);

  const timed = mode === "full" && !practice;
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D">>({});
  const [marked, setMarked] = useState<string[]>([]);
  const [done, setDone] = useState(false);
  const [seconds, setSeconds] = useState(examConfig.timeLimitMinutes * 60);

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

  const q = questions[idx];
  const selected = q ? answers[q.question_id] : undefined;
  const showExplain = practice || done;

  if (!q) {
    return (
      <div className="card">
        <p>Not enough questions in this set. Try Full 45 or open Exam Questions.</p>
        <Link className="btn btn-primary" href="/arizona/exam-questions/">
          Start Questions
        </Link>
      </div>
    );
  }

  function choose(letter: "A" | "B" | "C" | "D") {
    if (!practice && timed && done) return;
    if (answers[q.question_id] && (practice || !timed)) {
      // allow change before lock in practice; in exam before submit
    }
    setAnswers((a) => ({ ...a, [q.question_id]: letter }));
    if (practice) {
      recordAnswer(q.question_id, letter === q.correct_option);
      fetch("/api/progress/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.question_id, selected: letter }),
      }).catch(() => undefined);
    }
  }

  function finish() {
    setDone(true);
    const results = questions.map((item) => ({
      question: item,
      correct: answers[item.question_id] === item.correct_option,
    }));
    results.forEach((r) => recordAnswer(r.question.question_id, r.correct));
    const pct = scorePercent(results.filter((r) => r.correct).length, questions.length);
    const prev = loadProgress();
    saveProgress({
      lastScore: pct,
      lastMode: mode,
      scores: [{ at: new Date().toISOString(), score: pct, mode }, ...prev.scores].slice(0, 20),
    });
    results.forEach((r) => {
      const letter = answers[r.question.question_id];
      if (letter) {
        fetch("/api/progress/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: r.question.question_id, selected: letter }),
        }).catch(() => undefined);
      }
    });
    fetch("/api/progress/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind: "exam", mode, score: pct, correctCount: results.filter((r) => r.correct).length, total: questions.length }),
    }).catch(() => undefined);
  }

  if (done) {
    const results = questions.map((item) => ({
      question: item,
      correct: answers[item.question_id] === item.correct_option,
    }));
    const correct = results.filter((r) => r.correct).length;
    const pct = scorePercent(correct, questions.length);
    const pass = pct >= examConfig.passingScorePercent;
    const weak = weakTopics(results, 2);
    return (
      <div className="grid">
        <div className="card">
          <span className="kicker">Result</span>
          <h2>
            {pct}% — {pass ? "PASS" : "NEEDS REVIEW"}
          </h2>
          <p className="lede">
            {correct} of {questions.length} correct. Official passing score modeled at{" "}
            {examConfig.passingScorePercent}%. This is practice, not an SOS result.
          </p>
          <div className="grid grid-2 stats-mobile">
            {weak.map((w) => (
              <div className="stat" key={w.topic}>
                <b>{w.label}</b>
                <span>
                  {w.wrong} missed in this set —{" "}
                  <Link href={`/arizona/questions/${w.topic}/`}>Practice this topic</Link>
                </span>
              </div>
            ))}
          </div>
          <div className="row" style={{ marginTop: 16 }}>
            <Link className="btn btn-primary" href={paths.questions}>
              Continue Practice
            </Link>
            <Link className="btn btn-ghost" href={paths.mistakes}>
              Review Weak Areas
            </Link>
            <Link className="btn btn-ghost" href={paths.study}>
              Review Study Guide
            </Link>
            <Link className="btn btn-sage" href={paths.become}>
              After the exam
            </Link>
          </div>
          <AccountInvite />
          <div className="card" style={{ marginTop: 16, background: "#fff8ef" }}>
            <strong>Unlock Pro</strong>
            <p>Full question bank, unlimited full exams, full notebook, AI Tutor, and readiness analytics.</p>
            <Link className="btn btn-primary" href={paths.pricing}>
              Unlock Pro
            </Link>
          </div>
        </div>
        {results.map((r, i) => (
          <QuestionBlock
            key={r.question.question_id}
            q={r.question}
            index={i}
            selected={answers[r.question.question_id]}
            reveal
            isPro={isPro}
          />
        ))}
      </div>
    );
  }

  const source = getSource(q.source_id);
  const remain = seconds;

  return (
    <div className="exam-pad">
      <div className="row space">
        <span className="notice">
          Question {idx + 1} / {questions.length}
        </span>
        {timed ? (
          <span className="badge">{formatTime(remain)}</span>
        ) : (
          <span className="badge">Practice mode — instant feedback</span>
        )}
      </div>
      <div className="progress-bar" style={{ margin: "10px 0 18px" }}>
        <span style={{ width: `${((idx + 1) / questions.length) * 100}%` }} />
      </div>
      <QuestionBlock
        q={q}
        index={idx}
        selected={selected}
        reveal={!!selected && (practice || showExplain)}
        onChoose={choose}
        isPro={isPro}
        marked={marked.includes(q.question_id)}
        onMark={() => {
          toggleFlag(q.question_id);
          setMarked((m) =>
            m.includes(q.question_id) ? m.filter((x) => x !== q.question_id) : [...m, q.question_id]
          );
        }}
      />
      {!!selected && (practice || showExplain) && <TutorPanel q={q} selected={selected} />}
      <p className="notice">
        {source.title} · {q.source_reference} · Last verified {q.last_verified_at}
      </p>
      <div className="sticky-nav">
        <div className="wrap row space">
          <button className="btn btn-ghost" type="button" disabled={idx === 0} onClick={() => setIdx(idx - 1)}>
            Previous
          </button>
          {idx + 1 < questions.length ? (
            <button className="btn btn-primary" type="button" onClick={() => setIdx(idx + 1)}>
              Next
            </button>
          ) : (
            <button className="btn btn-sage" type="button" onClick={finish}>
              Submit exam
            </button>
          )}
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
}: {
  q: Question;
  index: number;
  selected?: "A" | "B" | "C" | "D";
  reveal?: boolean;
  onChoose?: (l: "A" | "B" | "C" | "D") => void;
  marked?: boolean;
  onMark?: () => void;
  isPro?: boolean;
}) {
  const letters = ["A", "B", "C", "D"] as const;
  const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const locked = !q.is_free && !isPro;
  return (
    <div className="card">
      <div className="row space">
        <span className="kicker">
          {q.topic} · {q.difficulty}
          {!q.is_free ? " · Pro" : ""}
        </span>
        {onMark && (
          <button className="btn btn-ghost" type="button" onClick={onMark}>
            {marked ? "Marked" : "Mark for Review"}
          </button>
        )}
      </div>
      <h3>
        {index + 1}. {q.question_text}
      </h3>
      {locked ? (
        <div className="explain">
          <strong>Pro question</strong>
          <p>This item is in the paid set. Upgrade to open the full bank. Free items remain available.</p>
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
        </div>
      ) : null}
      <div className="q-options">
        {letters.map((l) => {
          let cls = "q-option";
          if (selected === l) cls += " locked";
          if (reveal && selected) {
            if (l === q.correct_option) cls += " correct";
            else if (selected === l) cls += " wrong";
          }
          return (
            <button
              key={l}
              className={cls}
              type="button"
              disabled={!onChoose || locked}
              onClick={() => onChoose?.(l)}
            >
              <strong>{l}.</strong> {map[l]}
            </button>
          );
        })}
      </div>
      {reveal && selected && (
        <div className="explain">
          <strong>{selected === q.correct_option ? "Correct" : "Not quite"}.</strong>
          <p>{q.explanation}</p>
          {selected !== q.correct_option && <p>{q.option_feedback[selected]}</p>}
          <details>
            <summary>Official source</summary>
            <p>
              {q.source_reference} · {getSource(q.source_id).url}
            </p>
          </details>
        </div>
      )}
    </div>
  );
}
