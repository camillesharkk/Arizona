"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { flashcards } from "@/data/flashcards";
import { getSource } from "@/data/sources";
import { loadProgress, saveProgress } from "@/lib/storage";
import { paths } from "@/lib/paths";
import { FREE_FLASHCARD_PREVIEW } from "@/lib/product";
import { categoryLabel, StudyCardBody } from "@/components/StudyCardBody";

const FLASH_KEY = "az-flash-place";
const categoryOrder = ["identification", "appearance", "journal", "conflicts", "fees", "dates", "definitions", "acts"];

export function FlashcardsClient() {
  const [cat, setCat] = useState("all");
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [fullReported, setFullReported] = useState(false);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(FLASH_KEY) || "");
      if (typeof saved?.cat === "string") setCat(saved.cat);
      if (typeof saved?.index === "number") setI(saved.index);
    } catch {
      /* first visit */
    }
    const requested = new URLSearchParams(window.location.search).get("card");
    if (!requested) return;
    const allowed = flashcards.slice(0, FREE_FLASHCARD_PREVIEW).map((card) => card.id);
    const pool = flashcards.filter((card) => allowed.includes(card.id) || false);
    const at = (pool.length ? pool : flashcards).findIndex((card) => card.id === requested);
    if (at >= 0 && allowed.includes(requested)) {
      setCat("all");
      setI(at);
      setFlipped(true);
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ cat, index: i }));
    } catch {
      /* storage can be blocked */
    }
  }, [cat, i]);

  useEffect(() => {
    if (!isPro) return;
    const requested = new URLSearchParams(window.location.search).get("card");
    if (!requested) return;
    const at = flashcards.findIndex((card) => card.id === requested);
    if (at < 0) return;
    setCat("all");
    setI(at);
    setFlipped(true);
  }, [isPro]);

  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setIsPro(Boolean(d.user?.arizonaPro || d.user?.plan === "pro")))
      .catch(() => undefined)
      .finally(() => setAuthChecked(true));
  }, []);

  useEffect(() => {
    if (!isPro || fullReported || i < FREE_FLASHCARD_PREVIEW) return;
    setFullReported(true);
    fetch("/api/billing/pro-usage/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featureCode: "flashcards_full" }),
    }).catch(() => undefined);
  }, [isPro, fullReported, i]);

  const allowed = useMemo(() => {
    const freeIds = new Set(flashcards.slice(0, FREE_FLASHCARD_PREVIEW).map((card) => card.id));
    return flashcards.filter((card) => isPro || freeIds.has(card.id));
  }, [isPro]);
  const categories = ["all", ...categoryOrder.filter((category) => allowed.some((card) => card.category === category))];
  const full = useMemo(
    () => (cat === "all" ? allowed : allowed.filter((card) => card.category === cat)),
    [allowed, cat]
  );
  const deck = full;

  useEffect(() => {
    if (!authChecked || i < deck.length) return;
    setI(0);
  }, [authChecked, deck.length, i]);

  const card = deck[i];
  if (!deck.length) return <p>No cards in this set.</p>;
  if (finished || !card) {
    return (
      <div className="card">
        <h2>You finished this set.</h2>
        <p>
          {isPro
            ? "Practice the related questions next, or read the study guide."
            : <>This was the free preview of {deck.length} cards. The rest of the deck is part of Pro. The study guide stays free. <Link href={paths.pricing}>See Pro access</Link>.</>}
        </p>
        <div className="row">
          <Link className="btn btn-primary" href={paths.study}>
            Review the study guide
          </Link>
          <Link className="btn btn-ghost" href={paths.questions}>
            Practice questions
          </Link>
          <button
            className="btn btn-ghost"
            type="button"
            onClick={() => {
              setFinished(false);
              setI(0);
              setFlipped(false);
            }}
          >
            Review the cards again
          </button>
        </div>
      </div>
    );
  }
  const p = loadProgress();
  const known = p.knownCards.length;

  function pickCategory(next: string) {
    setCat(next);
    setI(0);
    setFlipped(false);
    setFinished(false);
  }

  return (
    <div className="flash-layout">
      <nav className="flash-topics" aria-label="Topics">
        {categories.map((c) => (
          <button
            key={c}
            className={cat === c ? "on" : ""}
            type="button"
            onClick={() => pickCategory(c)}
          >
            {c === "all" ? "In order" : categoryLabel(c)}
          </button>
        ))}
      </nav>
      <label className="flash-select">
        Topic
        <select value={cat} onChange={(event) => pickCategory(event.target.value)}>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "In order" : categoryLabel(c)}
            </option>
          ))}
        </select>
      </label>
      <div>
      <p className="notice">
        Mastered {known} · Review pile {p.reviewCards.length}
        {` · ${Math.min(i + 1, deck.length)} of ${deck.length} in this set`}
        {!isPro ? ` · Free preview ${allowed.length} of ${flashcards.length} cards` : ""}
      </p>
      <div
        className="card flash-card"
        onClick={() => setFlipped(!flipped)}
        onKeyDown={(event) => {
          if (event.key !== "Enter" && event.key !== " ") return;
          event.preventDefault();
          setFlipped((open) => !open);
        }}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
      >
        <div>
          <StudyCardBody
            card={{
              ...card,
              sourceLabel: getSource(card.source_id).reference,
              sourceUrl: getSource(card.source_id).url,
              practiceHref: card.topic ? paths.topic(card.topic) : undefined,
            }}
            flipped={flipped}
          />
          <p className="notice">Tap, click, or press Enter to flip.</p>
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
            setFlipped(false);
          }}
        >
          Review Again
        </button>
      </div>
      {!isPro ? (
        <p className="notice">
          This preview is free. <Link href={paths.pricing}>The rest of the deck is part of Pro.</Link>
        </p>
      ) : null}
      <div className="home-exam-nav">
        <div className="row space">
          <button className="btn btn-ghost" type="button" disabled={i === 0} onClick={() => { setI(i - 1); setFlipped(false); }}>
            Previous
          </button>
          <button className="btn btn-primary" type="button" onClick={() => {
            if (i + 1 >= deck.length) setFinished(true);
            else { setI(i + 1); setFlipped(false); }
          }}>
            {i + 1 >= deck.length ? "Done studying" : "Next"}
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}
