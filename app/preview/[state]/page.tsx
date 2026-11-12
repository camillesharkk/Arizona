import { notFound } from "next/navigation";
import { HomeStudy } from "@/components/HomeStudy";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (process.env.STATE_PREVIEW !== "1") notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const cards = pack.cards.map((card) => ({
    id: card.id,
    category: card.study,
    title: card.title,
    front: card.front,
    back: card.rule,
    rule: card.rule,
    boundary: card.boundary,
    mixup: card.mixup,
    source: card.source,
    sourceUrl: card.sourceUrl,
    sourceLabel: card.source,
    practiceHref: `${pack.paths.practice}?mode=practice&area=${encodeURIComponent(card.study)}`,
  }));
  return (
    <main className="wrap hero">
      <HomeStudy cards={cards} stateCode={code} />
    </main>
  );
}
