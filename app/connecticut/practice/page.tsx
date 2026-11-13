import { Suspense } from 'react';
import { PracticeLaunch } from '@/components/PracticeLaunch';
import { ctTopics, ctQuestionCounts } from '@/data/ct-content';
import { ctPaths, ctExam } from '@/lib/ct-site';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ title: 'Connecticut Handbook Practice', description: 'Free Quick 10, topic practice and untimed comprehensive Connecticut scenarios.', path: ctPaths.practice, index: false });
export default function Page() {
  const counts = ctQuestionCounts();
  return <main className="wrap hero"><h1>Connecticut Handbook Practice</h1>
    <p>This site's practice. {counts.published} original questions, {counts.free} free and {counts.pro} Pro. Comprehensive Practice draws {ctExam.practiceQuestionCount} questions with no time limit.</p>
    <Suspense fallback={<p role="status">Loading practice…</p>}><PracticeLaunch stateCode="CT" /></Suspense>
    <section className="card" id="ct-topics" style={{ marginTop: 24 }}><h2>Topic Practice</h2><p>Free topic practice draws from the Connecticut free pool.</p>{ctTopics.map(topic => <p key={topic.id}><a href={`${ctPaths.practice}?mode=practice&area=${topic.id}`}>{topic.label}</a></p>)}</section>
  </main>;
}
