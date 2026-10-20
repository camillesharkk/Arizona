import Link from "next/link";
import { cleanExplanation, presentExplanation } from "@/lib/explanation";

export function AnswerExplain({
  explanation,
  sourceUrl,
  sourceLabel,
  wrongNote,
  status,
  reviewLinks,
  expanded,
}: {
  explanation: string;
  sourceUrl?: string;
  sourceLabel?: string;
  wrongNote?: string;
  status?: string;
  reviewLinks?: { href: string; label: string }[];
  expanded?: boolean;
}) {
  const { short, why } = presentExplanation(explanation);
  const note = wrongNote ? cleanExplanation(wrongNote) : "";
  const visible = short || "Explanation not on file.";
  return (
    <div className="explain" role="status">
      {status ? (
        <p>
          <strong>{status}.</strong>
        </p>
      ) : null}
      <p>
        <strong>Short answer.</strong> {visible}
      </p>
      {reviewLinks?.map((link) => (
        <p key={link.href}>
          <Link href={link.href}>{link.label}</Link>
        </p>
      ))}
      {expanded ? (
        <>
          {why ? <p>{why}</p> : null}
          {note ? <p><strong>Why that choice is wrong. </strong>{note}</p> : null}
          {sourceUrl ? <p><a href={sourceUrl}>{sourceLabel || "Official source"}</a></p> : sourceLabel ? <p>{sourceLabel}</p> : null}
        </>
      ) : (
        <details>
          <summary>Why / Official source</summary>
          {why ? <p>{why}</p> : null}
          {note ? <p>{note}</p> : null}
          {sourceUrl ? (
            <p>
              <a href={sourceUrl}>{sourceLabel || "Official source"}</a>
            </p>
          ) : null}
        </details>
      )}
    </div>
  );
}
