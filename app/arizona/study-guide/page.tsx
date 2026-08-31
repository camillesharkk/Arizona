import Link from "next/link";
import { chapters } from "@/data/study-guide";
import { getSource } from "@/data/sources";
import { ChapterProgress, Readiness } from "@/components/StudyProgress";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Arizona Notary Study Guide 2026",
  description: "Arizona notary exam study guide: rules, key facts, and practice links by topic.",
  path: paths.study,
});

export default async function StudyGuidePage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Study Guide</p>
      <h1>Arizona Notary Study Guide 2026 — Everything You Need to Know</h1>
      <p className="lede">
        Reorganized for study, not copied from the official handbook. Each chapter ends in practice. The full guide is free.
      </p>
      <div className="row">
        <Link className="btn btn-primary" href={paths.practice}>
          Take Full Exam
        </Link>
      </div>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <nav className="card toc">
          <h2>Chapters</h2>
          {chapters.map((c) => (
            <a key={c.id} href={`#${c.id}`}>
              {c.title}
            </a>
          ))}
        </nav>
        <Readiness />
      </div>
      {chapters.map((c) => {
        const src = getSource(c.source_id);
        return (
          <article key={c.id} id={c.id} className="card" style={{ marginTop: 18 }}>
            <div className="row space">
              <h2>{c.title}</h2>
              <ChapterProgress id={c.id} />
            </div>
            <p className="lede">{c.summary}</p>
            {c.sections.map((s) => (
              <div key={s.heading}>
                <h3>{s.heading}</h3>
                <p>{s.body}</p>
              </div>
            ))}
            <h3>Key facts</h3>
            <div className="grid grid-3">
              {c.keyFacts.map((k) => (
                <div className="stat" key={k}>
                  <span>{k}</span>
                </div>
              ))}
            </div>
            <p className="notice">
              Source: {src.title} · {src.reference}
            </p>
            <Link className="btn btn-primary" href={`/arizona/questions/${c.topic}/`}>
              Practice This Topic
            </Link>
          </article>
        );
      })}
    </main>
  );
}
