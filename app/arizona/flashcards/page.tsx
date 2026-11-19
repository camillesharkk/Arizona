import { FlashcardsClient } from "@/components/FlashcardsClient";
import { flashcards } from "@/data/flashcards";
import { hasArizonaPro } from "@/lib/entitlements";
import { FREE_FLASHCARD_PREVIEW } from "@/lib/product";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export const metadata = pageMeta({
  title: "Arizona Notary Flashcards",
  description: "A short Arizona flip deck for fees, dates, definitions, and prohibited acts. Topic study cards, with a rule and a source on each card, are a separate deck.",
  path: paths.flashcards,
});

export default async function FlashcardsPage() {
  const session = await getSession();
  const pro = Boolean(session && await hasArizonaPro(session.id));
  const cards = pro ? flashcards : flashcards.slice(0, FREE_FLASHCARD_PREVIEW);
  return (
    <main className="wrap flash-page">
      <h1>Flashcards</h1>
      <FlashcardsClient cards={cards} totalCount={flashcards.length} />
    </main>
  );
}
