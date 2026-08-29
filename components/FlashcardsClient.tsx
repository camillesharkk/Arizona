"use client";

import { useMemo, useState } from "react";
import { flashcards } from "@/data/flashcards";
import { getSource } from "@/data/sources";
import { loadProgress, saveProgress } from "@/lib/storage";

const cats = ["all", "fees", "dates", "definitions", "acts"] as const;

export function FlashcardsClient() {
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const deck = useMemo(
    () => (cat === "all" ? flashcards : flashcards.filter((c) => c.category === cat)),
    [cat]
  );
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
    </div>
  );
}
