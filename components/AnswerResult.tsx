"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { isFreeState } from "@/lib/free-state-catalog";
import { prepNavigation } from "@/lib/prep-navigation";
import { fullStateSummary } from "@/data/full-state-summary";
import { TutorPanel } from "@/components/TutorPanel";
import { AnswerSource } from "@/components/AnswerSource";
import { ExplanationBody } from "@/components/ExplanationBody";
import { cleanExplanation, explanationParts } from "@/lib/explanation";
import type { Question } from "@/lib/types";

export function AnswerResult({
  q,
  selected,
  open,
  onToggle,
  tutor = false,
  compactFeedback = false,
}: {
  q: Question;
  selected?: "A" | "B" | "C" | "D";
  open?: boolean;
  onToggle?: () => void;
  tutor?: boolean;
  compactFeedback?: boolean;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const detailId = useId();
  const shown = onToggle ? Boolean(open) : localOpen;
  const options = {
    A: q.option_a,
    B: q.option_b,
    C: q.option_c,
    D: q.option_d,
  };
  const correct = selected === q.correct_option;
  const rule = compactFeedback ? explanationParts(q.explanation).rule : "";
  const detailLabel = compactFeedback
    ? (shown ? "Hide detailed explanation" : "View detailed explanation")
    : (shown ? "Hide option comparison" : "Compare the other options");
  const topicPaths =
    isFreeState(q.state) && fullStateSummary[q.state]?.ready
      ? prepNavigation[q.state].paths
      : null;
  const topic = encodeURIComponent(q.study_topic || q.topic);
  const notes = (["A", "B", "C", "D"] as const)
    .filter((letter) => letter !== q.correct_option)
    .map((letter) => ({
      letter,
      note: cleanExplanation(q.option_feedback?.[letter] || ""),
    }))
    .filter((item) => item.note);

  function toggle() {
    if (onToggle) onToggle();
    else setLocalOpen((value) => !value);
  }

  return (
    <div className={`answer-result${correct ? " is-correct" : " is-wrong"}${compactFeedback ? " answer-result-compact" : ""}`}>
      <p className={compactFeedback ? "visually-hidden" : "answer-result-line"} role="status">
        {correct ? (
          <strong>Correct.</strong>
        ) : (
          <>
            <strong>{selected ? "Incorrect." : "Not answered."}</strong>{" "}
          </>
        )}
      </p>
      <p className="answer-correct-choice">
        Correct answer{" "}
        <strong>
          {q.correct_option}. {options[q.correct_option]}
        </strong>
      </p>
      {compactFeedback ? (
        <p className="answer-brief-rule">{rule || "No explanation is recorded for this question."}</p>
      ) : (
        <ExplanationBody explanation={q.explanation} />
      )}
      <button
        className="explain-toggle"
        type="button"
        aria-expanded={shown}
        aria-controls={detailId}
        aria-describedby={compactFeedback && !shown ? `${detailId}-hint` : undefined}
        onClick={toggle}
      >
        {detailLabel}
        <span aria-hidden="true">{shown ? "▴" : "▾"}</span>
      </button>
      {compactFeedback && !shown && (
        <p id={`${detailId}-hint`} className="answer-detail-hint">
          See the reasoning and why the other choices are incorrect.
        </p>
      )}
      <div className="explain answer-option-comparison" id={detailId} hidden={!shown}>
        {compactFeedback && <ExplanationBody explanation={q.explanation} reasoningOnly />}
        {notes.length ? (
          <>
            <p className="answer-comparison-title">
              Why the other options are incorrect
            </p>
            <ul className="answer-option-notes">
              {notes.map((item) => (
                <li key={item.letter}>
                  <div>
                    <strong>
                      {item.letter}. {options[item.letter]}
                    </strong>
                    {selected === item.letter ? <span>Your choice</span> : null}
                  </div>
                  <p>{item.note}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p>No option-specific notes are recorded for this question.</p>
        )}
        {topicPaths ? (
          <div className="tool-row">
            <Link className="chip" href={`${topicPaths.study}#${topic}`}>
              Study This Rule
            </Link>
            <Link
              className="chip"
              href={`${topicPaths.studyCards}?topic=${topic}`}
            >
              Study Cards
            </Link>
            <Link
              className="chip"
              href={`${topicPaths.practice}?mode=practice&area=${topic}`}
            >
              Practice This Topic
            </Link>
          </div>
        ) : null}
        {tutor && selected ? <TutorPanel q={q} selected={selected} /> : null}
      </div>
      <AnswerSource question={q} />
    </div>
  );
}
