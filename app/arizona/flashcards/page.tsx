import { FlashcardsClient } from "@/components/FlashcardsClient";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Arizona Notary Flashcards",
  description: "A short Arizona flip deck for fees, dates, definitions, and prohibited acts. Topic study cards, with a rule and a source on each card, are a separate deck.",
  path: paths.flashcards,
});

export default function FlashcardsPage() {
  return (
    <main className="wrap flash-page">
      <h1>Flashcards</h1>
      <FlashcardsClient />
    </main>
  );
}
