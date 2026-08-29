import { FlashcardsClient } from "@/components/FlashcardsClient";

export const metadata = {
  title: "Arizona Notary Flashcards",
  description: "Arizona notary flashcards for fees, dates, definitions, and prohibited acts.",
};

export default function FlashcardsPage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Flashcards</p>
      <h1>Arizona Notary Flashcards — Fast Review Before the Exam</h1>
      <p className="lede">Tap to flip. Mark Know It or Review Again. Cards cite the same source registry as the question bank.</p>
      <FlashcardsClient />
    </main>
  );
}
