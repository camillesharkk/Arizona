"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { caCards } from "@/data/ca-cards";
import { caPaths } from "@/lib/ca-site";
import { caStudyTopics } from "@/lib/ca-topics";
import { StudyCardBody } from "@/components/StudyCardBody";
import { StudyPager } from "@/components/StudyPager";
import { scrollUnderHeaderSoon } from "@/lib/scroll-under-header";

export function CaliforniaCards() {
  const params = useSearchParams();
  const initial = params.get("topic") || "all";
  const topics = ["all", ...caStudyTopics.map((topic) => topic.id)];
  const [topic, setTopic] = useState(topics.includes(initial) ? initial : "all");
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const face = useRef<HTMLDivElement>(null);
  const cards = useMemo(() => caCards.filter((card) => topic === "all" || card.study === topic), [topic]);
  const safeIndex = Math.min(index, Math.max(cards.length - 1, 0));
  const card = cards[safeIndex];

  function pick(next: string) {
    setTopic(next);
    setIndex(0);
    setFlipped(false);
  }

  function move(next: number) {
    setIndex(next);
    setFlipped(false);
    scrollUnderHeaderSoon(face.current);
  }

  return (
    <div>
      <div className="tool-row" role="toolbar" aria-label="Study card topics">
        {topics.map((item) => (
          <button key={item} className={item === topic ? "chip on" : "chip"} type="button" onClick={() => pick(item)}>
            {item === "all" ? "All study cards" : caStudyTopics.find((entry) => entry.id === item)?.label}
          </button>
        ))}
      </div>
      {card ? (
        <div className="home-card-column">
          <div
            ref={face}
            className="study-face"
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
            onClick={() => setFlipped((open) => !open)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" && safeIndex < cards.length - 1) {
                event.preventDefault();
                move(safeIndex + 1);
              } else if (event.key === "ArrowLeft" && safeIndex > 0) {
                event.preventDefault();
                move(safeIndex - 1);
              } else if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                setFlipped((open) => !open);
              }
            }}
          >
            <StudyCardBody
              card={{
                id: card.id,
                category: card.study,
                title: card.title,
                front: card.front,
                back: card.rule,
                rule: card.rule,
                boundary: card.boundary,
                mixup: card.mixup,
                sourceLabel: card.source,
                sourceUrl: card.sourceUrl,
              }}
              flipped={flipped}
            />
            <button className="btn btn-ghost study-reveal" type="button" onClick={(event) => { event.stopPropagation(); setFlipped((open) => !open); }}>
              {flipped ? "Show question" : "Show answer"}
            </button>
          </div>
          <div className="home-card-actions">
            <StudyPager index={safeIndex} total={cards.length} target={face} onPrev={() => move(safeIndex - 1)} onNext={() => move(safeIndex + 1)} />
            <a className="btn btn-ghost" href={`${caPaths.practice}?mode=practice&area=${card.study}`}>Practice this topic</a>
          </div>
        </div>
      ) : (
        <p>No cards in this topic.</p>
      )}
    </div>
  );
}
