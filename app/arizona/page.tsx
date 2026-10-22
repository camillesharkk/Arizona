import { flashcards } from "@/data/flashcards";
import { getSource } from "@/data/sources";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { HOME_STUDY_CARD_IDS } from "@/lib/study-cards";
import { JsonLd, quizJson } from "@/components/JsonLd";
import { AccountStatusBanner } from "@/components/AccountStatusBanner";
import { HomeStudy } from "@/components/HomeStudy";

const cardsById = new Map(flashcards.map((card) => [card.id, card]));
const previewCards = HOME_STUDY_CARD_IDS.flatMap((id) => {
  const card = cardsById.get(id);
  if (!card) return [];
  const source = getSource(card.source_id);
  return [{
    id: card.id,
    category: card.category,
    front: card.front,
    back: card.back,
    title: card.title,
    rule: card.rule,
    boundary: card.boundary,
    example: card.example,
    mixup: card.mixup,
    memory: card.memory,
    kind: card.kind,
    compare: card.compare,
    practiceHref: card.topic ? paths.topic(card.topic) : undefined,
    source: source.reference,
    sourceUrl: source.url,
  }];
});

export const metadata = pageMeta({
  title: "Arizona Notary Exam 2026",
  description: "Free Arizona notary exam practice: 45-question test, study guide, and official-source questions.",
  path: paths.home,
  keywords: "Arizona notary exam, Arizona notary test, Arizona notary 2026",
});

export default function ArizonaHub() {
  return (
    <main className="home-canvas">
      <div className="wrap home-main">
        <JsonLd data={quizJson()} />
        <AccountStatusBanner />
        <h1>Arizona Notary Study &amp; Practice</h1>
        <HomeStudy cards={previewCards} />
      </div>
    </main>
  );
}
