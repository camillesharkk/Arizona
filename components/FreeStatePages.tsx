import Link from 'next/link';
import { freeStateContent } from '@/data/free-state-content';
import { freeStatePaths, type FreeStateCode } from '@/lib/free-state-catalog';

export function FreeStateSources({ code }: { code: FreeStateCode }) {
  const content = freeStateContent[code]!;
  return <section id="sources"><h2>Official sources</h2><ul>{content.sources.map(source =>
    <li key={source.id}><a href={source.url}>{source.title}</a><p>{source.reference} · Checked {source.checkedAt}</p></li>
  )}</ul></section>;
}

export function FreeStateHome({ code }: { code: FreeStateCode }) {
  const content = freeStateContent[code]!;
  const site = freeStatePaths(content.slug);
  const officialFirst = content.processKind !== 'Independent exam';
  const handbook = content.sources.find(source => /handbook|manual/i.test(source.title));
  return <main className="wrap hero">
    <h1>{content.name} Notary Prep</h1>
    <p className="lede">{content.summary}</p>
    <div className="tool-row">
      <Link className={officialFirst ? 'btn btn-ghost' : 'btn btn-primary'} href={`${site.practice}?mode=quick&start=1`}>Start Free Quick 10</Link>
      <a className={officialFirst ? 'btn btn-primary' : 'btn btn-ghost'} href={content.officialNext.url}>{content.officialNext.label}</a>
    </div>
    {officialFirst && handbook ? <p><a href={handbook.url}>Read the official handbook</a></p> : null}
    <p>Ten original questions with explanations and official references. Free and untimed.</p>
    <section className="card"><h2>First-time application</h2><p>{content.training}</p><p>{content.assessment}</p>
      <Link href={site.become}>Application steps and exceptions</Link>
    </section>
    <section><h2>Study and review</h2><div className="tool-row">
      <Link className="btn btn-ghost" href={site.study}>Study Guide</Link>
      <Link className="btn btn-ghost" href={site.mistakes}>Wrong Answers</Link>
      <Link className="btn btn-ghost" href={site.resources}>Official resources</Link>
    </div></section>
    <FreeStateSources code={code} />
  </main>;
}

export function FreeStateGuide({ code }: { code: FreeStateCode }) {
  const content = freeStateContent[code]!;
  const site = freeStatePaths(content.slug);
  const specs = [
    content.specs.questions === null ? null : `${content.specs.questions} official questions`,
    content.specs.minutes === null ? null : `${content.specs.minutes} official minutes`,
    content.specs.passing, content.specs.credential,
  ].filter(Boolean);
  return <main className="wrap hero">
    <h1>{content.name} Notary Application and Study Guide</h1>
    <p className="lede">{content.summary}</p>
    <div className="tool-row"><a className="btn btn-primary" href={content.officialNext.url}>{content.officialNext.label}</a>
      <Link className="btn btn-ghost" href={`${site.practice}?mode=quick&start=1`}>Start Free Quick 10</Link></div>
    <section><h2>Training and assessment for first-time applicants</h2><p>{content.training}</p><p>{content.assessment}</p>
      {specs.length ? <ul>{specs.map(spec => <li key={spec}>{spec}</li>)}</ul> : null}
    </section>
    <section><h2>Application order</h2><ol>{content.steps.map(step => <li key={step}>{step}</li>)}</ol></section>
    {content.exceptions.length ? <section><h2>Applicant exceptions</h2><ul>{content.exceptions.map(item => <li key={item}>{item}</li>)}</ul></section> : null}
    <section><h2>Renewing a commission</h2><p>{content.renewal}</p></section>
    <section><h2>Remote online notarization</h2><p>{content.ron}</p></section>
    {content.difference ? <section><h2>Process clarification</h2><p>{content.difference}</p></section> : null}
    <nav aria-label="Study topics"><h2>Study topics</h2><ul>{content.topics.map(topic => <li key={topic.id}><a href={`#${topic.id}`}>{topic.label}</a></li>)}</ul></nav>
    {content.topics.map(topic => <section id={topic.id} key={topic.id} className="guide-chapter">
      <h2>{topic.label}</h2>
      {content.questions.filter(question => question.studyTopic === topic.id).map(question => {
        const source = content.sources.find(item => item.id === question.sourceId)!;
        return <div key={question.id}><h3>{question.stem}</h3><p>{question.explanation}</p>
          <p><a href={source.url}>{question.reference}</a> · Checked {source.checkedAt}</p></div>;
      })}
    </section>)}
    <FreeStateSources code={code} />
  </main>;
}
