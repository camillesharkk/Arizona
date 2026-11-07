"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { topics as arizonaTopics } from "@/data/exam-config";
import { StudyCardBody } from "@/components/StudyCardBody";
import { StudyPager } from "@/components/StudyPager";
import { scrollUnderHeaderSoon } from "@/lib/scroll-under-header";
import { paths } from "@/lib/paths";
import { hiStudyLabel } from "@/lib/hi-topics";
import { isTopicSlug, type PublicStudyCard } from "@/lib/study-cards";

export function StudyCardsClient({
  cards,
  initialTopic,
  topics = arizonaTopics,
  cardsHref = paths.studyCards,
  dailyHref = paths.daily,
  practiceHref,
  labelState,
}: {
  cards: PublicStudyCard[];
  initialTopic: string;
  topics?: readonly { id: string; label: string }[];
  cardsHref?: string;
  dailyHref?: string;
  practiceHref?: (topic: string) => string | undefined;
  labelState?: "HI";
}) {
  const labelFor = labelState === "HI" ? hiStudyLabel : undefined;
  const router = useRouter();
  const [topic, setTopic] = useState(initialTopic);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const card of cards) map.set(card.topic, (map.get(card.topic) || 0) + 1);
    return map;
  }, [cards]);
  const deck = useMemo(() => cards.filter((card) => topic === "all" || card.topic === topic), [cards, topic]);
  const safeIndex = Math.min(index, Math.max(0, deck.length - 1));
  const card = deck[safeIndex];
  const face = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTopic(initialTopic);
    setIndex(0);
    setFlipped(false);
  }, [initialTopic]);

  function pick(next: string) {
    setTopic(next);
    setIndex(0);
    setFlipped(false);
    router.replace(next === "all" ? cardsHref : `${cardsHref}?topic=${next}`, { scroll: false });
    scrollUnderHeaderSoon(face.current);
  }

  function move(next: number) {
    setIndex(next);
    setFlipped(false);
    scrollUnderHeaderSoon(face.current);
  }

  return (
    <>
      <div className="tool-row">
        <button className={`chip ${topic === "all" ? "on" : ""}`} type="button" onClick={() => pick("all")}>
          All Topics · {cards.length}
        </button>
        {topics.map((item) => (
          <button key={item.id} className={`chip ${topic === item.id ? "on" : ""}`} type="button" onClick={() => pick(item.id)}>
            {item.label} · {counts.get(item.id) || 0}
          </button>
        ))}
      </div>
      {card ? (
        <>
          <div
            ref={face}
            className="study-face"
            onClick={() => {
              if (!card.locked) setFlipped((open) => !open);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" && safeIndex < deck.length - 1) {
                event.preventDefault();
                move(safeIndex + 1);
                return;
              }
              if (event.key === "ArrowLeft" && safeIndex > 0) {
                event.preventDefault();
                move(safeIndex - 1);
                return;
              }
              if (card.locked || (event.key !== "Enter" && event.key !== " ")) return;
              event.preventDefault();
              setFlipped((open) => !open);
            }}
            role="button"
            tabIndex={0}
            aria-pressed={flipped}
          >
            {card.locked ? (
              <>
                <p className="kicker">Pro</p>
                <h3>{card.title}</h3>
                <p>This card is part of Pro, like the question it explains.</p>
                <Link className="btn btn-primary" href={paths.pricing} onClick={(event) => event.stopPropagation()}>
                  Unlock Pro
                </Link>
              </>
            ) : flipped && card.pending ? (
              <>
                <p className="kicker">Needs a checked source</p>
                <h3>{card.title}</h3>
                <p>This point is waiting for a checked official source. The card is not treated as covered.</p>
              </>
            ) : (
              <StudyCardBody
                labelFor={labelFor}
                card={{
                  ...card,
                  category: card.topic,
                  sourceLabel: card.sourceLabel,
                  sourceUrl: card.sourceUrl,
                }}
                flipped={flipped}
              />
            )}
            {!card.locked ? (
              <button
                className="btn btn-ghost study-reveal"
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setFlipped((open) => !open);
                }}
              >
                {flipped ? "Show question" : "Show answer"}
              </button>
            ) : null}
          </div>
          <StudyPager
            index={safeIndex}
            total={deck.length}
            target={face}
            onPrev={() => move(safeIndex - 1)}
            onNext={() => move(safeIndex + 1)}
          />
          {safeIndex === deck.length - 1 ? <p style={{ marginTop: 12 }}><Link className="btn btn-primary" href={dailyHref}>Continue to Daily Study</Link></p> : null}
        </>
      ) : (
        <p>No cards in this topic.</p>
      )}
      {(practiceHref ? practiceHref(topic) : isTopicSlug(topic) ? paths.topic(topic) : undefined) ? (
        <p style={{ marginTop: 12 }}>
          <Link className="btn btn-primary" href={(practiceHref ? practiceHref(topic) : paths.topic(topic)) || paths.practice}>
            Practice This Topic
          </Link>
        </p>
      ) : null}
    </>
  );
}
