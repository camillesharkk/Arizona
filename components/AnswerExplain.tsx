import { AnswerSource } from "@/components/AnswerSource";
import { ExplanationBody } from "@/components/ExplanationBody";
import type { AnswerEvidenceFields } from "@/lib/answer-evidence";

export function AnswerExplain({
  explanation,
  question,
  wrongNote,
  expanded = false,
  reviewLinks,
  optionFeedback,
}: {
  explanation: string;
  question: AnswerEvidenceFields;
  wrongNote?: string;
  reviewLinks?: { href: string; label: string }[];
  expanded?: boolean;
  optionFeedback?: Record<string, string>;
}) {
  return (
    <div className="answer-result">
      <details className="answer-explanation" open={expanded}>
        <summary className="explain-toggle">
          Explanation<span aria-hidden="true">⌄</span>
        </summary>
        <ExplanationBody explanation={explanation} wrongNote={wrongNote} />
        {optionFeedback && <div>
          <h4>Why the other choices are incorrect</h4>
          <ul>{Object.entries(optionFeedback).map(([letter, feedback]) => (
            <li key={letter}><strong>{letter}.</strong> {feedback}</li>
          ))}</ul>
        </div>}
        {reviewLinks?.length ? (
          <nav className="tool-row" aria-label="Related study tools">
            {reviewLinks.map((link) => (
              <a className="chip" href={link.href} key={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
        ) : null}
      </details>
      <AnswerSource question={question} />
    </div>
  );
}
