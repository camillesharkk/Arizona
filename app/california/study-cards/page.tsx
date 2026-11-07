import type { Metadata } from "next";
import { StudyCardsClient } from "@/components/StudyCardsClient";
import { caCards } from "@/data/ca-cards";
import { caPaths } from "@/lib/ca-site";
import { caStudyTopics } from "@/lib/ca-topics";
import { canonicalUrl } from "@/lib/site";
import type { PublicStudyCard } from "@/lib/study-cards";

const cards: PublicStudyCard[] = caCards.map((card) => ({
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

export const metadata: Metadata = {
  title: { absolute: "California Notary Study Cards" },
  description: `${caCards.length} California notary study cards from the handbook and statutes.`,
  alternates: { canonical: canonicalUrl("/california/study-cards/") },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const known = topic && caStudyTopics.some((item) => item.id === topic);
  return (
    <main className="wrap hero">
      <h1>California Notary Study Cards</h1>
      <p className="lede">Flip a card for the rule. Use Previous and Next when you want the next one. Cards do not advance on their own.</p>
      <StudyCardsClient
        cards={cards}
        initialTopic={known ? topic : "all"}
        topics={caStudyTopics}
        cardsHref={caPaths.studyCards}
        dailyHref={caPaths.daily}
        practiceHref={(id) => (id === "all" ? undefined : `${caPaths.practice}?mode=practice&area=${id}`)}
      />
    </main>
  );
}
