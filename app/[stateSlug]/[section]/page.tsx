import { PrepStudyGuide } from '@/components/PrepStudyGuide';
import { StudyCardsClient } from '@/components/StudyCardsClient';
import { StateCheckout } from '@/components/StateCheckout';
import { QuestionsClient } from '@/components/QuestionsClient';
import { prepPacks } from '@/lib/prep-pack';
import { fullStateArticles } from '@/data/full-state-articles';
import { getSession } from '@/lib/session';
import { hasStatePro } from '@/lib/entitlements';
import { serverStateQuestions } from '@/data/full-state-server';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PracticeLaunch } from '@/components/PracticeLaunch';
import { CloudMistakes } from '@/components/CloudMistakes';
import { DailyStudyClient } from '@/components/DailyStudyClient';
import { FreeStateGuide, FreeStateSources } from '@/components/FreeStatePages';
import { freeStateContent } from '@/data/free-state-content';
import { freeStateCatalog, freeStateFeatures, freeStateForSlug, freeStatePaths, releasedFreeStates } from '@/lib/free-state-catalog';
import { productionStateBlocked } from '@/lib/state-release';
import { pageMeta } from '@/lib/seo';
import Link from 'next/link';

const sections = ['practice', 'study-guide', 'become-a-notary', 'exam-guide', 'resources', 'laws', 'wrong-answers', 'daily-study', 'questions', 'study-cards', 'pricing', 'passing-score'];
export const dynamicParams = false;
export function generateStaticParams() {
  return freeStateCatalog.flatMap(([code, , stateSlug]) => sections.filter(section => section !== 'pricing' || freeStateFeatures[code]?.purchase !== false).map(section => ({ stateSlug, section })));
}

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string; section: string }> }) {
  const { stateSlug, section } = await params;
  const state = freeStateForSlug(stateSlug);
  if (!state) return {};
  const label = section === 'practice' ? 'Notary Practice Questions' : section === 'wrong-answers' ? 'Wrong Answers' : section === 'resources' || section === 'laws' ? 'Official Notary Resources' : section === 'daily-study' ? 'Daily Study' : section === 'study-cards' ? 'Notary Study Cards' : section === 'pricing' ? '60-Day Pro Access' : section === 'questions' ? 'Notary Question Bank' : 'Notary Application and Study Guide';
  return pageMeta({ title: `${state[1]} ${label}`, description: `Prepare for ${state[1]} notary duties with free original practice, explanations and dated official application sources.`,
    path: `/${stateSlug}/${section}/`, index: releasedFreeStates.includes(state[0]) && !['wrong-answers', 'daily-study'].includes(section) && process.env.VERCEL_ENV !== 'preview' });
}

export default async function Page({ params, searchParams }: {
  params: Promise<{ stateSlug: string; section: string }>;
  searchParams: Promise<{ topic?: string; attempt?: string; card?: string }>;
}) {
  const { stateSlug, section } = await params;
  const state = freeStateForSlug(stateSlug);
  if (!state || !sections.includes(section) || productionStateBlocked(state[0]) || !freeStateContent[state[0]]) notFound();
  const code = state[0];
  const content = freeStateContent[code]!;
  const site = freeStatePaths(stateSlug);
  const pack = prepPacks[code];
  const counts = pack.counts();
  const full = !pack.freeLaunch;
  if (['questions', 'study-cards', 'pricing'].includes(section) && !full) notFound();
  if (section === 'pricing' && pack.purchaseEnabled === false) notFound();
  if (section === 'study-guide' && full) return <PrepStudyGuide code={code} />;
  if (section === 'pricing') return <main className="wrap hero"><h1>{state[1]} Notary Pro</h1>
    <div className="card"><p>{counts.free} of {counts.published} questions are free. Pro opens the complete bank, repeated Comprehensive Practice and the shared Pro Tutor allowance for 60 days across every available state.</p>
    <p>Study Cards, the Study Guide and Quick 10 remain available free. Comprehensive Practice has 40 questions and no time limit. One full practice is included free.</p>
    <Link href={site.practice}>Try practice</Link></div><StateCheckout source={code} /></main>;
  if (section === 'study-cards') {
    const query = await searchParams;
    const cards = pack.cards.map(item => ({ ...item, topic: item.study, back: item.rule, sourceLabel: item.source, locked: false, pending: false }));
    return <main className="wrap hero"><h1>{state[1]} Study Cards</h1><p>{cards.length} independent rule cards with official references.</p>
      <StudyCardsClient cards={cards} initialTopic={pack.topics.some(item => item.id === query.topic) ? query.topic! : 'all'} initialCardId={query.card}
        topics={pack.topics} cardsHref={site.studyCards} dailyHref={site.daily} practiceBaseHref={site.practice} /></main>;
  }
  if (section === 'questions') {
    const session = await getSession();
    const pro = Boolean(session && await hasStatePro(session.id, code));
    const query = await searchParams;
    return <main className="wrap hero"><h1>{state[1]} Practice Questions</h1><QuestionsClient key={code} stateCode={code} topic={query.topic}
      questions={serverStateQuestions(code).filter(question => pro || question.is_free)} /></main>;
  }
  if (section === 'practice') return <main className="wrap hero"><h1>{state[1]} Notary Practice</h1>
    <p>Quick 10 gives ten free original questions with explanations and official sources.</p>
    {full ? <><p>{counts.published} published questions · {counts.free} free · {counts.pro} Pro</p><p>{pack.fullDetail}</p>
      <div className="tool-row"><Link className="chip" href={site.study}>Study Guide</Link><Link className="chip" href={site.studyCards}>Study Cards</Link>{pack.purchaseEnabled !== false ? <Link className="chip" href={site.pricing}>60-Day Pro</Link> : null}</div></> : null}
    <Suspense fallback={<p role="status">Loading practice…</p>}><PracticeLaunch key={code} stateCode={code} /></Suspense>
  </main>;
  if (section === 'wrong-answers') {
    const query = await searchParams;
    return <CloudMistakes key={code} stateCode={code} initialTopic={query.topic} attemptId={query.attempt} />;
  }
  if (section === 'daily-study') return <main className="wrap hero"><h1>{state[1]} Daily Study</h1><DailyStudyClient key={code} stateCode={code} /></main>;
  if (section === 'resources' || section === 'laws') return <main className="wrap hero"><h1>{state[1]} Official Notary Resources</h1>
    <a className="btn btn-primary" href={content.officialNext.url}>{content.officialNext.label}</a>
    <p><Link href={site.become}>Application guide</Link> · <Link href={site.practice}>Free Quick 10</Link></p>
    {full ? <section><h2>Learning guides</h2><ul>{fullStateArticles[code]?.map(article => <li key={article.id}><Link href={article.path}>{article.title}</Link><p>{article.description}</p></li>)}</ul></section> : null}
    <FreeStateSources code={code} /></main>;
  return <FreeStateGuide code={code} />;
}
