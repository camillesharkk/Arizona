import type { Metadata } from "next";
import { StudyCardsClient } from "@/components/StudyCardsClient";
import { hiCards } from "@/data/hi-cards";
import { hiPaths } from "@/lib/hi-site";
import { hiStudyTopics } from "@/lib/hi-topics";
import { siteUrl } from "@/lib/site";
import type { PublicStudyCard } from "@/lib/study-cards";

const cards: PublicStudyCard[] = hiCards.map((card) => ({
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
  title: { absolute: "Hawaii Notary Study Cards" },
  description: `${hiCards.length} Hawaii notary study cards from HRS Chapter 456 and HAR Chapter 5-11.`,
  alternates: { canonical: `${siteUrl()}/hawaii/study-cards/` },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const known = topic && hiStudyTopics.some((item) => item.id === topic);
  return (
    <main className="wrap hero">
      <h1>Hawaii notary study cards</h1>
      <p className="lede">Flip a card for the rule. Use Previous and Next when you want the next one. Cards do not advance on their own.</p>
      <StudyCardsClient
        cards={cards}
        initialTopic={known ? topic : "all"}
        topics={hiStudyTopics}
        cardsHref={hiPaths.studyCards}
        dailyHref={hiPaths.daily}
        practiceHref={(id) => (id === "all" ? undefined : `${hiPaths.practice}?mode=practice&area=${id}`)}
        labelState="HI"
      />
    </main>
  );
}
