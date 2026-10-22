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
  acts: "Acts",
  commission: "Commission",
  acknowledgments: "Acknowledgments",
  jurats: "Jurats",
  journals: "Journals",
  "seals-fees": "Seal & fees",
  "prohibited-acts": "Prohibited acts",
  "new-laws": "2026 changes",
  "copy-certification": "Copy certification",
  "electronic-ron": "Electronic & RON",
};

export function categoryLabel(category: string) {
  return labels[category] ?? category;
}

export function StudyCardBody({ card, flipped }: { card: StudyCardView; flipped: boolean }) {
  if (!flipped) {
    return (
      <>
        <p className="kicker">{categoryLabel(card.category)}{card.kind === "compare" ? " · Compare" : ""}</p>
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
      {card.memory ? <p className="notice"><strong>Memory line, not the rule. </strong>{card.memory}</p> : null}
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
