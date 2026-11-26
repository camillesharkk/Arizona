import { MemberCopy } from "@/components/MemberCopy";
import Link from "next/link";
import { AnswerExplain } from "@/components/AnswerExplain";

export function PracticeAfterword({
  during,
  samples,
  links,
  publicLanding = false,
}: {
  during?: React.ReactNode;
  samples: {
    source_id: string;
    source_reference: string;
    last_verified_at: string;
    question_id: string;
    question_text: string;
    options: Record<string, string>;
    correct: string;
    explanation: string;
    moreHref: string;
    cardsHref?: string;
    guideHref?: string;
    optionFeedback?: Partial<Record<string, string>>;
  }[];
  links: { href: string; label: string }[];
  publicLanding?: boolean;
}) {
  return (
    <>
      {publicLanding && <noscript>
        {/* Next streams the completed route into a hidden container while its loading boundary is active. */}
        <style>{`
          [hidden]:has(> main[data-public-practice]) { display: contents; }
          body:has(main[data-public-practice]) .site-workspace > .loading-stage,
          main[data-public-practice] [data-practice-loading] { display: none; }
        `}</style>
        <p>Enable JavaScript to start interactive practice. The sample questions are available on this page.</p>
      </noscript>}
      {during && <section className="card" style={{ margin: "20px 0" }}>
        <h2>What happens during and after the test?</h2>
        <p>{during}</p>
      </section>}
      {samples.length > 0 && <section aria-labelledby="sample-questions">
        <h2 id="sample-questions">Sample questions with answers and explanations</h2>
        <p><MemberCopy member={<>These items are from the published starter set.</>}>These items are from the published free set.</MemberCopy></p>
        {samples.map((q, i) => (
          <article key={q.question_id} className="card" style={{ marginTop: 16 }}>
            <h3>{i + 1}. {q.question_text}</h3>
            <ol type="A">{Object.entries(q.options).map(([letter, text]) => <li key={letter}>{text}</li>)}</ol>
            <p><strong>Answer: {q.correct}. {q.options[q.correct]}</strong></p>
            <AnswerExplain question={q} explanation={q.explanation} optionFeedback={q.optionFeedback && Object.fromEntries(
              Object.entries(q.optionFeedback).flatMap(([letter, feedback]) => letter !== q.correct && feedback ? [[letter, feedback]] : [])
            )} />
            <Link className="btn btn-ghost card-action" href={q.moreHref}>Practice more questions on this topic</Link>
            {q.cardsHref && <Link className="btn btn-ghost card-action" href={q.cardsHref}>Review this topic’s study cards</Link>}
            {q.guideHref && <Link className="btn btn-ghost card-action" href={q.guideHref}>Read the study guide chapter</Link>}
          </article>
        ))}
      </section>}
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
