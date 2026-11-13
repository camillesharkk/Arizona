import Link from "next/link";
import { ncPaths } from "@/lib/nc-site";

export function NcPracticeNext({ correct, total, topics, quick }: {
  correct: number;
  total: number;
  topics: { id: string; label: string; right: number; total: number }[];
  quick: boolean;
}) {
  const missed = topics.filter(topic => topic.total - topic.right >= 2)
    .sort((a, b) => (b.total - b.right) - (a.total - a.right)).slice(0, 2);
  const strong = quick && correct >= Math.ceil(total * 0.8);
  return (
    <section aria-label="Next practice steps">
      <p>{strong ? "Continue your preparation with a course or another practice set." : missed.length ? "Review these topics, then try their practice questions again." : "Review the explanations and rule cards, then try another practice set."}</p>
      {!strong && missed.map(topic => (
        <div key={topic.id}>
          <h3>{topic.label}</h3>
          <div className="result-next">
            <Link className="btn btn-primary" href={`${ncPaths.studyCards}?topic=${encodeURIComponent(topic.id)}`}>Study {topic.label}</Link>
            <Link className="btn btn-ghost" href={`${ncPaths.practice}?mode=practice&area=${encodeURIComponent(topic.id)}`}>Practice {topic.label}</Link>
          </div>
        </div>
      ))}
      <div className="result-next">
        {strong ? <Link className="btn btn-primary" href={`${ncPaths.home}#courses`}>Find an Approved Course</Link> : <Link className="btn btn-primary" href={ncPaths.studyCards}>Study Cards</Link>}
        <Link className="btn btn-ghost" href={ncPaths.practice}>Continue Practicing</Link>
        <Link className="btn btn-ghost" href={ncPaths.mistakes}>Wrong Answers</Link>
      </div>
    </section>
  );
}
