"use client";

import { useState } from "react";
import { cleanExplanation, presentExplanation } from "@/lib/explanation";

export function AnswerExplain({
  explanation,
  sourceUrl,
  sourceLabel,
  wrongNote,
}: {
  explanation: string;
  sourceUrl?: string;
  sourceLabel?: string;
  wrongNote?: string;
  status?: string;
  reviewLinks?: { href: string; label: string }[];
  expanded?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { short, why } = presentExplanation(explanation);
  const note = wrongNote ? cleanExplanation(wrongNote) : "";
  return (
    <div className="answer-result">
      <button className="explain-toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        {open ? "Hide explanation" : "Show explanation"}
        <span aria-hidden="true">{open ? "▴" : "▾"}</span>
      </button>
      {open ? (
        <div className="explain">
          <p>{short || "Explanation not on file."}</p>
          {why ? <p>{why}</p> : null}
          {note ? <p>{note}</p> : null}
          {sourceUrl ? <p><a href={sourceUrl}>{sourceLabel || "Official source"}</a></p> : sourceLabel ? <p>{sourceLabel}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
