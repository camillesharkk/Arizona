import Link from 'next/link';
import { ctPaths, ctSources } from '@/lib/ct-site';
import { ctQuestionCounts, ctTopics, ctCards } from '@/data/ct-content';
import { pageMeta } from '@/lib/seo';

export const metadata = pageMeta({ title: 'Connecticut Notary Prep', description: 'Handbook lookup practice, original Connecticut scenarios and a first-application checklist.', path: ctPaths.home, index: false });
export default function Page() {
  const counts = ctQuestionCounts();
  return (
    <main className="wrap hero">
      <h1>Connecticut Notary Prep</h1>
      <p className="lede">Build confidence finding the rule, applying it to a workplace scenario and preparing your first application.</p>
      <div className="row">
        <Link className="btn btn-primary" href={`${ctPaths.practice}?mode=quick`}>Practice With the Handbook</Link>
        <a className="btn btn-ghost" href={ctSources.application} target="_blank" rel="noopener noreferrer">Open Official Application</a>
      </div>
      <p>Start a free 10-question handbook practice. Open the official manual while you work.</p>
      <section className="card" style={{ marginTop: 24 }}>
        <h2>Your first Connecticut application</h2>
        <p>Read the manual, prepare your Jurat and Writing Sample and Certificate of Character, then complete the eLicense application. After approval, take the oath of office and record your appointment.</p>
        <Link href={ctPaths.become}>First Application Checklist</Link>
      </section>
      <p>{counts.published} original questions · {counts.free} free · {ctCards.length} independent study cards</p>
      <div className="grid grid-3">
        <section className="card"><h2>Handbook practice</h2><p>Quick 10, focused topic practice and an untimed comprehensive set.</p><Link href={ctPaths.practice}>Choose practice</Link></section>
        <section className="card"><h2>Study the rules</h2><p>Find the rule and compare its limits before your next practice.</p><Link href={ctPaths.study}>Study Guide</Link>{' · '}<Link href={ctPaths.studyCards}>Study Cards</Link></section>
        <section className="card"><h2>Your learning</h2><p>Review missed questions, save favorites and plan daily study.</p><Link href={ctPaths.mistakes}>Wrong Answers</Link>{' · '}<Link href={ctPaths.daily}>Daily Study</Link></section>
      </div>
      <section className="card" style={{ marginTop: 24 }}><h2>Practice by topic</h2>{ctTopics.map(topic => <p key={topic.id}><Link href={`${ctPaths.practice}?mode=practice&area=${topic.id}`}>{topic.label}</Link></p>)}</section>
      <p className="notice">Independent study practice. <Link href={ctPaths.resources}>Official sources and version notes</Link></p>
    </main>
  );
}
