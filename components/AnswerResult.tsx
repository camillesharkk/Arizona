"use client";

import { useState } from "react";
import { TutorPanel } from "@/components/TutorPanel";
import { getSource } from "@/data/sources";
import { cleanExplanation, presentExplanation } from "@/lib/explanation";
import type { Question } from "@/lib/types";

export function AnswerResult({
  q,
  selected,
  open,
  onToggle,
  tutor = false,
}: {
  q: Question;
  selected?: "A" | "B" | "C" | "D";
  open?: boolean;
  onToggle?: () => void;
  tutor?: boolean;
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const shown = onToggle ? Boolean(open) : localOpen;
  const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const correct = selected === q.correct_option;
  const source = getSource(q.source_id);
  const { short, why } = presentExplanation(q.explanation);
  const notes = (["A", "B", "C", "D"] as const)
    .filter((letter) => letter !== q.correct_option)
    .map((letter) => ({ letter, note: cleanExplanation(q.option_feedback[letter] || "") }))
    .filter((item) => item.note);

  function toggle() {
    if (onToggle) onToggle();
    else setLocalOpen((value) => !value);
  }

  return (
    <div className={`answer-result${correct ? " is-correct" : " is-wrong"}`}>
      <p className="answer-result-line" role="status">
        {correct ? (
          <strong>Correct.</strong>
        ) : (
          <>
            <strong>{selected ? "Incorrect." : "Not answered."}</strong>{" "}
            Correct answer: {q.correct_option}. {options[q.correct_option]}
          </>
        )}
      </p>
      <button className="explain-toggle" type="button" aria-expanded={shown} onClick={toggle}>
        {shown ? "Hide explanation" : "Show explanation"}
        <span aria-hidden="true">{shown ? "▴" : "▾"}</span>
      </button>
      {shown ? (
        <div className="explain">
          {short ? <p>{short}</p> : <p>Explanation not on file.</p>}
          {why ? <p>{why}</p> : null}
          {notes.map((item) => (
            <p key={item.letter}>
              <strong>{item.letter} is wrong. </strong>
              {item.note}
            </p>
          ))}
          {source?.url ? (
            <p>
              <a href={source.url}>{source.title} · {q.source_reference}</a>
              {q.last_verified_at ? ` · Last verified ${q.last_verified_at}` : ""}
            </p>
          ) : (
            <p>
              {q.source_reference}
              {q.last_verified_at ? ` · Last verified ${q.last_verified_at}` : ""}
            </p>
          )}
          {tutor && selected ? <TutorPanel q={q} selected={selected} /> : null}
        </div>
      ) : null}
    </div>
  );
}
