import Link from "next/link";
import { AnswerExplain } from "@/components/AnswerExplain";

export function PracticeAfterword({
  during,
  samples,
  links,
}: {
  during: string;
  samples: {
    question_id: string;
    question_text: string;
    options: Record<string, string>;
    correct: string;
    explanation: string;
    sourceUrl: string;
    sourceLabel: string;
    moreHref: string;
  }[];
  links: { href: string; label: string }[];
}) {
  return (
    <>
      <section className="card" style={{ margin: "20px 0" }}>
        <h2>What happens during and after the test?</h2>
        <p>{during}</p>
      </section>
      <section aria-labelledby="sample-questions">
        <h2 id="sample-questions">Sample questions with answers and explanations</h2>
        <p>These items are from the published free set.</p>
        {samples.map((q, i) => (
          <article key={q.question_id} className="card" style={{ marginTop: 16 }}>
            <h3>{i + 1}. {q.question_text}</h3>
            <ol type="A">{Object.entries(q.options).map(([letter, text]) => <li key={letter}>{text}</li>)}</ol>
            <p><strong>Answer: {q.correct}. {q.options[q.correct]}</strong></p>
            <AnswerExplain explanation={q.explanation} sourceUrl={q.sourceUrl} sourceLabel={q.sourceLabel} />
            <Link href={q.moreHref}>Practice more questions on this topic</Link>
          </article>
        ))}
      </section>
      <p style={{ marginTop: 24 }}>
        {links.map((link, i) => (
          <span key={link.href}>
            {i > 0 ? " · " : null}
            <Link href={link.href}>{link.label}</Link>
          </span>
        ))}
      </p>
    </>
  );
}
