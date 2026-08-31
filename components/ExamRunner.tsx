"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { examConfig } from "@/data/exam-config";
import {
  pickExamSet,
  pickFullExam,
  pickQuickExam,
  scorePercent,
  shuffleQuestionOptions,
  topicLabel,
  weakTopics,
  type Letter,
} from "@/lib/quiz";
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
  const sessionSeed = useMemo(() => Math.floor(Math.random() * 1_000_000_000), []);
  const toOriginalRef = useRef<Record<string, Record<Letter, Letter>>>({});
  const count = mode === "quick" ? 10 : mode === "full" ? examConfig.questionCount : 10;
  const questions = useMemo(() => {
    const applyShuffle = (list: Question[]) => {
      const maps: Record<string, Record<Letter, Letter>> = {};
      const out = list.map((item) => {
        const { question, toOriginal } = shuffleQuestionOptions(item, sessionSeed);
        maps[item.question_id] = toOriginal;
        return question;
      });
      toOriginalRef.current = maps;
      return out;
    };
    if (preset?.length) return applyShuffle(preset);
    if (mode === "full") {
      const picked = pickFullExam(sessionSeed);
      if (picked.length !== examConfig.questionCount) {
        console.error("[exam] Full exam requires", examConfig.questionCount, "questions; pool returned", picked.length);
        return [];
      }
      return applyShuffle(picked);
    }
    if (mode === "quick") {
      const picked = pickQuickExam(sessionSeed, false);
      if (picked.length !== 10) {
        console.error("[exam] Quick exam requires 10 questions; pool returned", picked.length);
        return [];
      }
      return applyShuffle(picked);
    }
    if (mode === "weak") {
      const ids = loadProgress().wrongIds;
      const pool = pickExamSet(200, { seed: sessionSeed }).filter((q) => ids.includes(q.question_id));
      const preview = isPro ? 10 : 5;
      if (pool.length >= 3) return applyShuffle(pool.slice(0, preview));
      return [];
    }
    return applyShuffle(pickExamSet(count, { seed: sessionSeed }));
  }, [count, mode, preset, isPro, sessionSeed]);

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
        <Link className="btn btn-primary" href="/arizona/exam-questions/">
          Start Questions
        </Link>
      </div>
    );
  }

  function originalLetter(questionId: string, display: Letter): Letter {
    return toOriginalRef.current[questionId]?.[display] ?? display;
  }

  function choose(letter: "A" | "B" | "C" | "D") {
    if (!practice && timed && done) return;
    setAnswers((a) => ({ ...a, [q.question_id]: letter }));
    if (practice) {
      recordAnswer(q.question_id, letter === q.correct_option);
      fetch("/api/progress/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.question_id, selected: originalLetter(q.question_id, letter) }),
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
          body: JSON.stringify({ questionId: r.question.question_id, selected: originalLetter(r.question.question_id, letter) }),
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
            {correct} of {questions.length} correct. Official passing score modeled at{" "}
            {examConfig.passingScorePercent}%. This is practice, not an SOS result.
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
            <Link className="btn btn-ghost" href={paths.mistakes}>
              Review Wrong Answers
            </Link>
            <Link className="btn btn-ghost" href={paths.study}>
              Review Study Guide
            </Link>
          </div>
          <AccountInvite />
          {mode === "weak" && !isPro && (
            <div className="card" style={{ marginTop: 16, background: "#fff8ef" }}>
              <strong>Turn your weak topics into passing scores.</strong>
              <p>Know exactly what to study next with weak-area training, smart review, and exam readiness.</p>
              <Link className="btn btn-primary" href={paths.pricing}>
                Unlock Pro
              </Link>
            </div>
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
          Question {idx + 1} of {questions.length}
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
        lockPaid={false}
        isPro={isPro}
        marked={marked.includes(q.question_id)}
        onMark={() => {
          toggleFlag(q.question_id);
          setMarked((m) =>
            m.includes(q.question_id) ? m.filter((x) => x !== q.question_id) : [...m, q.question_id]
          );
        }}
      />
      {selected && !showExplain && !done && (
        <p className="notice" aria-live="polite">
          You selected {selected}.
        </p>
      )}
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
  lockPaid = true,
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
}) {
  const letters = ["A", "B", "C", "D"] as const;
  const map = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const locked = lockPaid && !q.is_free && !isPro;
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
          <p>This item is in the full question bank. Unlock Pro to turn weak topics into passing scores.</p>
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
        </div>
      ) : null}
      <div className="q-options">
        {letters.map((l) => {
          let cls = "q-option";
          if (selected === l) cls += " selected";
          if (reveal && selected) {
            if (l === q.correct_option) cls += " correct";
            else if (selected === l) cls += " wrong";
          }
          return (
            <button
              key={l}
              className={cls}
              type="button"
              aria-pressed={selected === l}
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
