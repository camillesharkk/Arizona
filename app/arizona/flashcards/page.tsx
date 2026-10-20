import { FlashcardsClient } from "@/components/FlashcardsClient";

export const metadata = {
  title: "Arizona Notary Flashcards",
  description: "Arizona notary flashcards for fees, dates, definitions, and prohibited acts.",
};

export default function FlashcardsPage() {
  return (
    <main className="wrap flash-page">
      <h1>Flashcards</h1>
      <FlashcardsClient />
    </main>
  );
}
