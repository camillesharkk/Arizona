import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PracticeLaunch } from '@/components/PracticeLaunch';
import { CloudMistakes } from '@/components/CloudMistakes';
import { DailyStudyClient } from '@/components/DailyStudyClient';
import { FreeStateGuide, FreeStateSources } from '@/components/FreeStatePages';
import { freeStateContent } from '@/data/free-state-content';
import { freeStateCatalog, freeStateForSlug, freeStatePaths, releasedFreeStates } from '@/lib/free-state-catalog';
import { productionStateBlocked } from '@/lib/state-release';
import { pageMeta } from '@/lib/seo';
import Link from 'next/link';

const sections = ['practice', 'study-guide', 'become-a-notary', 'exam-guide', 'resources', 'laws', 'wrong-answers', 'daily-study'];
export const dynamicParams = false;
export function generateStaticParams() {
  return freeStateCatalog.flatMap(([, , stateSlug]) => sections.map(section => ({ stateSlug, section })));
}

export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string; section: string }> }) {
  const { stateSlug, section } = await params;
  const state = freeStateForSlug(stateSlug);
  if (!state) return {};
  const label = section === 'practice' ? 'Free Quick 10 Practice' : section === 'wrong-answers' ? 'Wrong Answers' : section === 'resources' || section === 'laws' ? 'Official Notary Resources' : section === 'daily-study' ? 'Daily Study' : 'Notary Application and Study Guide';
  return pageMeta({ title: `${state[1]} ${label}`, description: `Prepare for ${state[1]} notary duties with free original practice, explanations and dated official application sources.`,
    path: `/${stateSlug}/${section}/`, index: releasedFreeStates.includes(state[0]) && !['wrong-answers', 'daily-study'].includes(section) && process.env.VERCEL_ENV !== 'preview' });
}

export default async function Page({ params, searchParams }: {
  params: Promise<{ stateSlug: string; section: string }>;
  searchParams: Promise<{ topic?: string; attempt?: string }>;
}) {
  const { stateSlug, section } = await params;
  const state = freeStateForSlug(stateSlug);
  if (!state || !sections.includes(section) || productionStateBlocked(state[0]) || !freeStateContent[state[0]]) notFound();
  const code = state[0];
  const content = freeStateContent[code]!;
  const site = freeStatePaths(stateSlug);
  if (section === 'practice') return <main className="wrap hero"><h1>{state[1]} Free Notary Practice</h1>
    <p>Quick 10 gives ten original questions with explanations and official sources. Free and untimed.</p>
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
    <FreeStateSources code={code} /></main>;
  return <FreeStateGuide code={code} />;
}
