import { AnswerSource } from "@/components/AnswerSource";
import { ExplanationBody } from "@/components/ExplanationBody";
import type { Question } from "@/lib/types";

export function AnswerExplain({
  explanation,
  question,
  sourceUrl,
  sourceLabel,
  wrongNote,
  expanded = false,
  reviewLinks,
}: {
  explanation: string;
  question?: Pick<
    Question,
    "source_id" | "source_reference" | "last_verified_at"
  >;
  sourceUrl?: string;
  sourceLabel?: string;
  wrongNote?: string;
  status?: string;
  reviewLinks?: { href: string; label: string }[];
  expanded?: boolean;
}) {
  return (
    <div className="answer-result">
      <details className="answer-explanation" open={expanded}>
        <summary className="explain-toggle">
          Explanation<span aria-hidden="true">⌄</span>
        </summary>
        <ExplanationBody explanation={explanation} wrongNote={wrongNote} />
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
      {question ? <AnswerSource question={question} /> : null}
      {!question && sourceUrl ? (
        <p className="answer-source">
          <a href={sourceUrl}>{sourceLabel || "Official source"}</a>
        </p>
      ) : !question && sourceLabel ? (
        <p className="answer-source">{sourceLabel}</p>
      ) : null}
    </div>
  );
}
