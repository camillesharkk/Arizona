"use client";

import { useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { caCards } from "@/data/ca-cards";
import { areaLabel, caPaths } from "@/lib/ca-site";
import { StudyPager } from "@/components/StudyPager";

const areas = ["all", "administration", "acts", "identity", "immigration", "violations"] as const;

export function CaliforniaCards() {
  const params = useSearchParams();
  const initial = params.get("topic") || "all";
  const [area, setArea] = useState<(typeof areas)[number]>(areas.includes(initial as (typeof areas)[number]) ? (initial as (typeof areas)[number]) : "all");
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const face = useRef<HTMLElement | null>(null);
  const cards = useMemo(() => caCards.filter((card) => area === "all" || card.area === area), [area]);
  const card = cards[index];

  function pick(next: (typeof areas)[number]) {
    setArea(next);
    setIndex(0);
    setOpen(false);
  }

  return (
    <div className="grid">
      <div className="tool-row" role="toolbar" aria-label="Study card topics">
        {areas.map((item) => (
          <button key={item} className={item === area ? "chip on" : "chip"} type="button" onClick={() => pick(item)}>
            {item === "all" ? "All study cards" : areaLabel(item)}
          </button>
        ))}
      </div>
      {card ? (
        <article className="card" ref={face}>
          <p className="kicker">{areaLabel(card.area)}</p>
          <h2>{card.title}</h2>
          <p>{open ? card.back : card.front}</p>
          <p className="notice">{card.source}</p>
          <div className="row">
            <button className="btn btn-ghost" type="button" onClick={() => setOpen((value) => !value)}>{open ? "Hide answer" : "Show answer"}</button>
            <a className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>Practice this state</a>
          </div>
          <StudyPager
            index={index}
            total={cards.length}
            target={face}
            onPrev={() => { setIndex((value) => Math.max(0, value - 1)); setOpen(false); }}
            onNext={() => { setIndex((value) => Math.min(cards.length - 1, value + 1)); setOpen(false); }}
          />
        </article>
      ) : (
        <p>No cards in this topic.</p>
      )}
    </div>
  );
}
