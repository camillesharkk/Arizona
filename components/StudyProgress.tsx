"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { chapters } from "@/data/study-guide";
import { loadProgress, saveProgress, subscribeProgress } from "@/lib/storage";
import { subscribeAuth } from "@/lib/account";
import type { StateCode } from "@/lib/types";
import { fetchAccount } from "@/lib/client-account";

const ProgressAccount = createContext<{ owner: string | null; ready: boolean }>({ owner: null, ready: false });

export function StudyProgressProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState({ owner: null as string | null, ready: false });
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let requestId = 0;
    const refresh = async () => {
      const id = ++requestId;
      setAccount((previous) => ({ ...previous, ready: false }));
      try {
        const response = await fetchAccount();
        if (!response.ok) throw new Error("Account unavailable");
        const data = await response.json();
        if (data.user && !data.user.email) throw new Error("Account missing");
        if (cancelled || id !== requestId) return;
        setAccount({ owner: data.user?.email ?? null, ready: true });
        setFailed(false);
      } catch {
        if (!cancelled && id === requestId) setFailed(true);
      }
    };
    void refresh();
    const stopAuth = subscribeAuth(refresh);
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    return () => {
      cancelled = true;
      stopAuth();
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
    };
  }, []);

  return <ProgressAccount.Provider value={account}>
    {failed && <p className="notice" role="status">Reading progress is unavailable. Reload to retry.</p>}
    {children}
  </ProgressAccount.Provider>;
}

export function ChapterProgress({ id, stateCode = "AZ" }: { id: string; stateCode?: StateCode }) {
  const [on, setOn] = useState(false);
  const { owner, ready } = useContext(ProgressAccount);

  useEffect(() => {
    const sync = () => setOn(ready && loadProgress(stateCode, owner).chapterReads.includes(id));
    sync();
    const stopProgress = subscribeProgress(sync);
    return stopProgress;
  }, [id, stateCode, owner, ready]);

  return (
    <button
      className={`chip ${on ? "on" : ""}`}
      type="button"
      disabled={!ready}
      aria-pressed={on}
      onClick={() => {
        if (!ready) return;
        const p = loadProgress(stateCode, owner);
        const chapterReads = p.chapterReads.includes(id) ? p.chapterReads.filter((x) => x !== id) : [...p.chapterReads, id];
        saveProgress({ chapterReads }, stateCode, owner);
      }}
    >
      {on ? "Marked read" : "Mark chapter read"}
    </button>
  );
}

export function Readiness({ stateCode = "AZ", guideChapters = chapters }: {
  stateCode?: StateCode;
  guideChapters?: readonly { id: string; title: string }[];
}) {
  const [reads, setReads] = useState(0);
  const [nextTitle, setNextTitle] = useState<string | null>(guideChapters[0]?.title ?? null);
  const { owner, ready } = useContext(ProgressAccount);

  useEffect(() => {
    const sync = () => {
      const readIds: string[] = ready ? loadProgress(stateCode, owner).chapterReads : [];
      setReads(guideChapters.filter((chapter) => readIds.includes(chapter.id)).length);
      setNextTitle(guideChapters.find((c) => !readIds.includes(c.id))?.title ?? null);
    };
    sync();
    const stopProgress = subscribeProgress(sync);
    return stopProgress;
  }, [stateCode, guideChapters, owner, ready]);

  return (
    <div className="card">
      <h3>Exam checklist</h3>
      <p>
        {reads} / {guideChapters.length} chapters marked read.
      </p>
      {nextTitle ? <p>Next: {nextTitle}</p> : <p>All chapters marked. Take a full exam.</p>}
    </div>
  );
}
