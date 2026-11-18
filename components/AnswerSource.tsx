import { resolveAnswerEvidence, type AnswerEvidenceFields } from "@/lib/answer-evidence";

function additionalSourceName(href: string, index: number) {
  if (href.includes("/notary-handbook-current.pdf")) return "California Notary Public Handbook";
  if (href.includes("/dA/93ab6b5f72/")) return "Indiana Secretary of State FAQ (alternate PDF)";
  if (href === "https://inbiz.in.gov/certification/notary") return "Indiana INBiz Notary Resources";
  return `Additional source ${index + 1}`;
}

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
              {additionalSourceName(href, index)}
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
