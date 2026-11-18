import { findSource } from "@/data/sources";
import type { Question } from "@/lib/types";

export function AnswerSource({
  question,
}: {
  question: Pick<
    Question,
    "source_id" | "source_reference" | "last_verified_at"
  >;
}) {
  const source = findSource(question.source_id);
  return (
    <div className="answer-source">
      <p>
        Official source{" "}
        {source?.url ? (
          <a
            href={source.document_url || source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.title} · {question.source_reference}
          </a>
        ) : (
          <span>{question.source_reference || "Reference unavailable"}</span>
        )}
      </p>
      <p>Last verified {question.last_verified_at || "Date unavailable"}</p>
    </div>
  );
}
