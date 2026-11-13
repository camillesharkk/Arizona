import Link from "next/link";
import type { ReactNode } from "react";
import type { StateCode } from "@/lib/types";
import { ChapterProgress, Readiness, StudyProgressProvider } from "@/components/StudyProgress";
import { PrepCtas } from "@/components/PrepCtas";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";

export type GuideChapter = {
  id: string;
  title: string;
  summary: string;
  sections: { heading: string; body: string; source?: { title: string; url: string } }[];
  example?: { heading: string; body: string };
  keyFacts: string[];
  source: { title: string; url: string; reference?: string };
  references?: { title: string; url: string }[];
  practiceHref: string;
  cardsHref: string;
  mistakesHref: string;
  hasFreePractice: boolean;
  afterSource?: ReactNode;
};

export function StudyGuide({ stateCode, title, lede, introduction, chapters, sitePaths, fullExamLabel }: {
  stateCode: StateCode;
  title: string;
  lede: string;
  introduction: ReactNode;
  chapters: GuideChapter[];
  sitePaths: { practice: string; study: string; studyCards: string; mistakes: string; pricing: string };
  fullExamLabel: string;
}) {
  return (
    <StudyProgressProvider key={stateCode}><main className="wrap hero">
      <p className="kicker">Study Guide</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {introduction}
      <PrepCtas studyCards guide={false} pro={false} sitePaths={sitePaths} fullExamLabel={fullExamLabel} />
      <p className="notice" style={{ marginTop: 0 }}>
        <WrongAnswersLink href={sitePaths.mistakes} stateCode={stateCode} />
      </p>
      <div className="grid grid-2" style={{ marginTop: 24 }}>
        <nav className="card toc" aria-label="Chapters">
          <h2>Chapters</h2>
          {chapters.map((chapter) => <a key={chapter.id} href={`#${chapter.id}`}>{chapter.title}</a>)}
        </nav>
        <Readiness stateCode={stateCode} guideChapters={chapters.map(({ id, title }) => ({ id, title }))} />
      </div>
      {chapters.map((chapter) => (
        <article key={chapter.id} id={chapter.id} className="card" style={{ marginTop: 18 }}>
          <div className="row space">
            <h2>{chapter.title}</h2>
            <ChapterProgress id={chapter.id} stateCode={stateCode} />
          </div>
          <p className="lede">{chapter.summary}</p>
          {chapter.sections.map((section) => <div key={section.heading}>
            <h3>{section.heading}</h3>
            <p>{section.body}</p>
            {section.source && <p className="notice"><a href={section.source.url}>{section.source.title}</a></p>}
          </div>)}
          {chapter.example && <section className="explain"><h3>{chapter.example.heading}</h3><p>{chapter.example.body}</p></section>}
          <h3>Key facts</h3>
          <div className="grid grid-3">
            {chapter.keyFacts.map((fact) => <div className="stat" key={fact}><span>{fact}</span></div>)}
          </div>
          <p className="notice">Official source: <a href={chapter.source.url}>{chapter.source.title}</a>{chapter.source.reference ? ` · ${chapter.source.reference}` : ""}</p>
          {!!chapter.references?.length && <p className="notice">Also consult: {chapter.references.map((source, index) => <span key={source.url}>{index > 0 ? " · " : ""}<a href={source.url}>{source.title}</a></span>)}</p>}
          {chapter.afterSource}
          <div className="row" style={{ marginTop: 12 }}>
            <Link className="btn btn-primary" href={chapter.practiceHref}>Practice This Topic</Link>
            {!chapter.hasFreePractice && <p>This topic’s practice questions are Pro-only.{" "}<Link href={chapter.practiceHref}>See the Pro explanation</Link>{" · "}<Link href={`${sitePaths.practice}?mode=quick`}>Start free Quick 10</Link></p>}
            <Link className="btn btn-ghost" href={chapter.cardsHref}>Study this topic</Link>
            <Link className="btn btn-ghost" href={chapter.mistakesHref}>Review wrong answers</Link>
          </div>
        </article>
      ))}
      <section className="study-pro" aria-labelledby="study-pro-heading">
        <h2 id="study-pro-heading">Put what you’ve learned into practice</h2>
        <p>Use Pro to practice more questions on the topics in this guide and prepare with full practice exams.</p>
        <p><Link href={sitePaths.pricing}>Explore Pro</Link></p>
      </section>
    </main></StudyProgressProvider>
  );
}
