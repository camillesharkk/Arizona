"use client";

import { useEffect, useState } from "react";
import { chapters } from "@/data/study-guide";
import { loadProgress, saveProgress, subscribeProgress } from "@/lib/storage";

export function ChapterProgress({ id }: { id: string }) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const sync = () => setOn(loadProgress().chapterReads.includes(id));
    sync();
    return subscribeProgress(sync);
  }, [id]);

  return (
    <button
      className={`chip ${on ? "on" : ""}`}
      type="button"
      onClick={() => {
        const p = loadProgress();
        const chapterReads = on ? p.chapterReads.filter((x) => x !== id) : [...p.chapterReads, id];
        saveProgress({ chapterReads });
      }}
    >
      {on ? "Marked read" : "Mark chapter read"}
    </button>
  );
}

export function Readiness() {
  const [reads, setReads] = useState(0);
  const [nextTitle, setNextTitle] = useState<string | null>(null);

  useEffect(() => {
    const sync = () => {
      const p = loadProgress();
      setReads(p.chapterReads.length);
      setNextTitle(chapters.find((c) => !p.chapterReads.includes(c.id))?.title ?? null);
    };
    sync();
    return subscribeProgress(sync);
  }, []);

  return (
    <div className="card">
      <h3>Exam checklist</h3>
      <p>
        {reads} / {chapters.length} chapters marked read.
      </p>
      {nextTitle ? <p>Next: {nextTitle}</p> : <p>All chapters marked. Take a full exam.</p>}
    </div>
  );
}
