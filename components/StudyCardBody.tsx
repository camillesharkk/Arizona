import Link from "next/link";
import type { Flashcard } from "@/lib/types";

export type StudyCardView = {
  id: string;
  category: string;
  front: string;
  back: string;
  title?: string;
  rule?: string;
  boundary?: string;
  example?: string;
  mixup?: string;
  memory?: string;
  kind?: Flashcard["kind"];
  compare?: Flashcard["compare"];
  sourceLabel?: string;
  sourceUrl?: string;
  practiceHref?: string;
};

const labels: Record<string, string> = {
  identification: "Identification",
  appearance: "Appearance",
  journal: "Journal & seal",
  conflicts: "Conflicts",
  fees: "Fees",
  dates: "Dates",
  definitions: "Definitions",
  acts: "Notarial acts",
  commission: "Commission",
  acknowledgments: "Acknowledgments",
  jurats: "Jurats",
  journals: "Journals",
  "seals-fees": "Seal & fees",
  "prohibited-acts": "Prohibited acts",
  "new-laws": "2026 changes",
  "copy-certification": "Copy certification",
  "electronic-ron": "Electronic & RON",
  qualification: "Qualifications",
  "education-exam": "Training and exam",
  "bond-oath": "Bond and oath",
  "address-records": "Address and records",
  "authority-conflict": "Authority and conflicts",
  acknowledgment: "Acknowledgments",
  jurat: "Jurats and oaths",
  certificates: "Certificates",
  "subscribing-witness": "Subscribing witnesses",
  "copy-cert": "Copy certification",
  "credible-witness": "Credible witnesses",
  "advertising-immigration": "Advertising and immigration",
  "foreign-language": "Foreign language",
  "journal-thumbprint": "Journal and thumbprint",
  seal: "Seal",
  misconduct: "Misconduct",
  administration: "Administrative procedures",
  identity: "Identification",
  immigration: "Immigration and language",
  violations: "Misconduct and fees",
  "application-exam": "Application and exam",
  "term-renewal": "Term and renewal",
  authority: "Authority and conflicts",
  "jurat-oath": "Jurats and oaths",
  "certificate-seal": "Certificate and seal",
  documents: "Document problems",
  "fees-bond": "Fees and bond",
  "refusal-misconduct": "Refusal and penalties",
  authentication: "Authentication and apostille",
  "remote-online": "Remote online notarization",
};

export function categoryLabel(category: string) {
  return labels[category] ?? category;
}

export function StudyCardBody({ card, flipped, labelFor }: { card: StudyCardView; flipped: boolean; labelFor?: (id: string) => string }) {
  const kicker = labelFor ? labelFor(card.category) : categoryLabel(card.category);
  if (!flipped) {
    return (
      <>
        <p className="kicker">{kicker}{card.kind === "compare" ? " · Compare" : ""}</p>
        {card.title ? <p className="study-card-title">{card.title}</p> : null}
        <h3>{card.front}</h3>
      </>
    );
  }
  return (
    <>
      <p className="kicker">Rule</p>
      <h3>{card.rule || card.back}</h3>
      {card.boundary ? <p><strong>When it applies. </strong>{card.boundary}</p> : null}
      {card.example ? <p><strong>Example. </strong>{card.example}</p> : null}
      {card.mixup ? <p><strong>Easy to mix up. </strong>{card.mixup}</p> : null}
      {card.compare ? (
        <div className="study-compare">
          <p><strong>What they share. </strong>{card.compare.shared}</p>
          <table className="compare-table">
            <thead>
              <tr>
                <th>Question</th>
                <th>{card.compare.left}</th>
                <th>{card.compare.right}</th>
              </tr>
            </thead>
            <tbody>
              {card.compare.rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  <td>{row.a}</td>
                  <td>{row.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><strong>Common mix-up. </strong>{card.compare.mistake}</p>
          <p><strong>Change one fact. </strong>{card.compare.twist}</p>
        </div>
      ) : null}
      {card.sourceUrl ? (
        <details className="study-source" onClick={(event) => event.stopPropagation()}>
          <summary>Official source</summary>
          <p><a href={card.sourceUrl}>{card.sourceLabel || "Official source"}</a></p>
        </details>
      ) : null}
      {card.practiceHref ? (
        <p onClick={(event) => event.stopPropagation()}>
          <Link href={card.practiceHref}>Practice a related question</Link>
        </p>
      ) : null}
    </>
  );
}
