import { StudyCardsClient } from '@/components/StudyCardsClient';
import { ctCards, ctTopics } from '@/data/ct-content';
import { ctPaths } from '@/lib/ct-site';
import { pageMeta } from '@/lib/seo';
export const metadata = pageMeta({ title: 'Connecticut Notary Study Cards', description: 'Independent Connecticut rule cards with official references and topic practice.', path: ctPaths.studyCards, index: false });
export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string; card?: string }> }) {
  const { topic, card } = await searchParams;
  const cards = ctCards.map(item => ({ ...item, topic: item.study, back: item.rule, sourceLabel: item.source, locked: false, pending: false }));
  return <main className="wrap hero"><h1>Connecticut Study Cards</h1><p>{cards.length} independent rule cards. Question-derived cards are counted separately.</p>
    <StudyCardsClient cards={cards} initialTopic={ctTopics.some(item => item.id === topic) ? topic! : 'all'} initialCardId={card} topics={ctTopics} cardsHref={ctPaths.studyCards} dailyHref={ctPaths.daily} practiceBaseHref={ctPaths.practice} />
  </main>;
}
