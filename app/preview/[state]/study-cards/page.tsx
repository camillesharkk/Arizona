import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { StudyCardsClient } from "@/components/StudyCardsClient";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";
import type { PublicStudyCard } from "@/lib/study-cards";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", indiana: "IN", "north-carolina": "NC" };

export default async function Page({ params, searchParams }: { params: Promise<{ state: string }>; searchParams: Promise<{ topic?: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const { topic } = await searchParams;
  const known = topic && pack.topics.some(item => item.id === topic);
  const cards: PublicStudyCard[] = pack.cards.map((card) => ({
    id: card.id,
    topic: card.study,
    title: card.title,
    front: card.front,
    back: card.rule,
    rule: card.rule,
    boundary: card.boundary,
    mixup: card.mixup,
    sourceLabel: card.source,
    sourceUrl: card.sourceUrl,
    locked: false,
    pending: false,
  }));
  return (
    <main className="wrap hero">
      <h1>{pack.name} study cards</h1>
      <p className="lede">{cards.length} independent cards. These are not copies of the question stems.</p>
      <StudyCardsClient
        cards={cards}
        initialTopic={known ? topic : "all"}
        topics={pack.topics.map((topic) => ({ id: topic.id, label: topic.label }))}
        cardsHref={pack.paths.studyCards}
        dailyHref={pack.paths.daily}
        practiceBaseHref={pack.paths.practice}
      />
    </main>
  );
}
