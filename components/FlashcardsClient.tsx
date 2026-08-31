"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { flashcards } from "@/data/flashcards";
import { getSource } from "@/data/sources";
import { loadProgress, saveProgress } from "@/lib/storage";
import { paths } from "@/lib/paths";
import { FREE_FLASHCARD_PREVIEW } from "@/lib/product";

const cats = ["all", "fees", "dates", "definitions", "acts"] as const;

export function FlashcardsClient() {
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isPro, setIsPro] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setIsPro(Boolean(d.user?.arizonaPro || d.user?.plan === "pro")))
      .catch(() => undefined);
  }, []);

  const full = useMemo(
    () => (cat === "all" ? flashcards : flashcards.filter((c) => c.category === cat)),
    [cat]
  );
  const deck = isPro ? full : full.slice(0, FREE_FLASHCARD_PREVIEW);
  const card = deck[i % Math.max(deck.length, 1)];
  if (!card) return <p>No cards in this set.</p>;
  const p = loadProgress();
  const known = p.knownCards.length;

  return (
    <div>
      <div className="filter-row">
        {cats.map((c) => (
          <button
            key={c}
            className={`chip ${cat === c ? "on" : ""}`}
            type="button"
            onClick={() => {
              setCat(c);
              setI(0);
              setFlipped(false);
            }}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="notice">
        Mastered {known} · Review pile {p.reviewCards.length}
        {!isPro ? ` · Free preview ${deck.length} of ${full.length} cards` : ""}
      </p>
      <div className="card flash-card" onClick={() => setFlipped(!flipped)} role="button" tabIndex={0}>
        <div>
          <span className="kicker">{flipped ? "Answer" : "Question"}</span>
          <h2>{flipped ? card.back : card.front}</h2>
          <p className="notice">Tap to flip · {getSource(card.source_id).reference}</p>
        </div>
      </div>
      <div className="row" style={{ marginTop: 14 }}>
        <button
          className="btn btn-sage"
          type="button"
          onClick={() => {
            const knownCards = [...new Set([...loadProgress().knownCards, card.id])];
            saveProgress({
              knownCards,
              reviewCards: loadProgress().reviewCards.filter((id) => id !== card.id),
            });
            setI(i + 1);
            setFlipped(false);
          }}
        >
          Know It
        </button>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            const reviewCards = [...new Set([...loadProgress().reviewCards, card.id])];
            saveProgress({ reviewCards });
            setI(i + 1);
            setFlipped(false);
          }}
        >
          Review Again
        </button>
      </div>
      {!isPro && (
        <div className="card" style={{ marginTop: 16 }}>
          <strong>Know exactly what to study next.</strong>
          <p>Full flashcards are included with 60-day Pro.</p>
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro
          </Link>
        </div>
      )}
    </div>
  );
}
