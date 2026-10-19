import { cleanExplanation, presentExplanation } from "@/lib/explanation";

export function AnswerExplain({
  explanation,
  sourceUrl,
  sourceLabel,
  wrongNote,
  status,
}: {
  explanation: string;
  sourceUrl?: string;
  sourceLabel?: string;
  wrongNote?: string;
  status?: string;
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
    </div>
  );
}
