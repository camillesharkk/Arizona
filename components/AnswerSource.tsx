import { resolveAnswerEvidence, type AnswerEvidenceFields } from "@/lib/answer-evidence";

export function AnswerSource({ question }: { question: AnswerEvidenceFields }) {
  const evidence = resolveAnswerEvidence(question);
  const date = question.last_verified_at?.trim();
  return (
    <div className="answer-source">
      <p>
        Official source{" "}
        {evidence.href ? (
          <a href={evidence.href} target="_blank" rel="noopener noreferrer">
            {evidence.label}
          </a>
        ) : (
          <span>{evidence.label} · Link unavailable</span>
        )}
        {evidence.additional.map((href, index) => (
          <span key={href}>
            {" · "}
            <a href={href} target="_blank" rel="noopener noreferrer">
              {href.includes("/notary-handbook-current.pdf")
                ? "California Notary Public Handbook"
                : `Additional source ${index + 1}`}
            </a>
          </span>
        ))}
      </p>
      <p>
        Last verified{" "}
        {date ? <time dateTime={date}>{date}</time> : "Date unavailable"}
      </p>
    </div>
  );
}
