import Link from "next/link";
import { inPaths, indianaReference, indianaWeakTopics } from "@/lib/in-site";

type Topic = { id: string; label: string; total: number; right: number };
export function IndianaNext({ mode, correct, total, topics, fullHref, fullLocked }: { mode: "quick" | "full"; correct: number; total: number; topics: Topic[]; fullHref: string; fullLocked: boolean }) {
  const weak = indianaWeakTopics(topics);
  const reference = indianaReference(correct);
  const strong = mode === "full" ? reference.atReference : correct >= 8;
  const missed = topics.reduce((n,t) => n + t.total-t.right,0);
  const official = <Link className={mode === "full" && strong ? "btn btn-primary" : "btn btn-ghost"} href={`${inPaths.become}#course-exam`}>Official Course &amp; Exam</Link>;
  return <div className="next-step">
    <h3>Your next step</h3>
    {mode === "full" ? <p>{reference.atReference ? "Your practice result is at or above the 24/30 official reference line." : `Your practice result is ${reference.gap} ${reference.gap === 1 ? "answer" : "answers"} below the 24/30 official reference line.`} This is study feedback only.</p> : <p>{correct}/{total} correct. Quick 10 suggests what to review; it does not predict an official result.</p>}
    <div className="result-next">
      {mode === "quick" && strong && !fullLocked ? <Link className="btn btn-primary" href={fullHref}>Start 30-Question Mock Exam</Link> : null}
      {mode === "full" && !strong ? <Link className="btn btn-primary" href={inPaths.mistakes}>Review Wrong Answers</Link> : null}
      {mode === "full" && strong ? official : null}
    </div>
    <div className="grid" style={{ gap: 16, marginTop: 16 }}>
      {weak.map((topic,index) => <section key={topic.id}>
        <p>{topic.label}: {topic.right}/{topic.total} correct</p>
        <div className="row"><Link className={index === 0 && !strong ? "btn btn-primary" : "btn btn-ghost"} href={`${inPaths.studyCards}?topic=${topic.id}`}>Study {topic.label}</Link>{" "}
        <Link className="btn btn-ghost" href={`${inPaths.practice}?mode=practice&area=${topic.id}`}>Practice {topic.label}</Link></div>
      </section>)}
    </div>
    <div className="result-next" style={{ marginTop: 16 }}>
      {mode === "quick" || !strong ? official : null}
      {(mode === "quick" || strong) && missed > 0 ? <Link className="btn btn-ghost" href={inPaths.mistakes}>Review Wrong Answers</Link> : null}
      <Link className="btn btn-ghost" href={inPaths.daily}>Open Daily Study</Link>
    </div>
    {!weak.length && !strong ? <p>Answer at least two questions in a topic before using its result to choose a weak area.</p> : null}
    {mode === "quick" && fullLocked ? <p className="notice">Your free mock is already used. Continue free topic practice or open the official course and exam steps.</p> : null}
  </div>;
}
