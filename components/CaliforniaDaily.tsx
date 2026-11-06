"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { syncCaAttempts } from "@/lib/ca-sync";
import { caPaths } from "@/lib/ca-site";
import { paths } from "@/lib/paths";

type Recent = {
  id: string;
  at: string;
  label: string;
  correct: number;
  total: number;
  wrong: number;
  skipped: number;
};

type Due = { questionId: string; prompt: string; due: string | null; area: string };
type Scheduled = { questionId: string; prompt: string; nextReviewAt: string | null; wrongCount: number; saved: boolean; due: boolean };
type Card = { id: string; title: string; front: string; study: string };

type View = {
  today: string;
  dayNumber: number;
  done: number;
  goal: number;
  recent: Recent[];
  due: Due[];
  scheduled: Scheduled[];
  nextReviewAt: string | null;
  todayCards: Card[];
  todayQuestionIds: string[];
  hasPractice: boolean;
};

function when(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

export function CaliforniaDaily() {
  const [view, setView] = useState<View | null>(null);
  const [phase, setPhase] = useState<"loading" | "ready" | "signed-out" | "error">("loading");
  const requestId = useRef(0);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setPhase("loading");
    setView(null);
    const me = await fetch("/api/auth/me/", { cache: "no-store" }).catch(() => null);
    if (id !== requestId.current) return;
    const account = me?.ok ? await me.json().catch(() => null) : null;
    const userId = account?.user?.id as string | undefined;
    if (!userId) {
      setPhase("signed-out");
      return;
    }
    const sync = await syncCaAttempts().catch(() => ({ ok: false, pending: true }));
    if (id !== requestId.current) return;
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const day = new Intl.DateTimeFormat("en-CA", { timeZone: zone, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    const response = await fetch(`/api/daily-study/?state=CA&timeZone=${encodeURIComponent(zone)}&day=${day}&account=${encodeURIComponent(userId)}`, { cache: "no-store" }).catch(() => null);
    if (id !== requestId.current) return;
    if (!response || !response.ok || !sync.ok) {
      setPhase("error");
      return;
    }
    const data = await response.json();
    if (id !== requestId.current || data?.state !== "CA") {
      if (id === requestId.current) setPhase("error");
      return;
    }
    setView(data);
    setPhase("ready");
  }, []);

  useEffect(() => {
    load();
    const onShow = () => {
      if (document.visibilityState === "visible") load();
    };
    window.addEventListener("pageshow", load);
    document.addEventListener("visibilitychange", onShow);
    return () => {
      window.removeEventListener("pageshow", load);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [load]);

  if (phase === "loading") {
    return (
      <p className="card loading-row" role="status">
        <span className="spinner" aria-hidden="true" />
        Loading your study plan…
      </p>
    );
  }
  if (phase === "signed-out") {
    return (
      <section className="card">
        <p>Sign in to see California practice saved on this account.</p>
        <Link className="btn" href={`${paths.login}?next=${encodeURIComponent(caPaths.daily)}`}>Sign in</Link>
      </section>
    );
  }
  if (phase === "error" || !view) {
    return (
      <section className="card">
        <p>Daily study could not be loaded. Your answers are still on this browser if you just finished.</p>
        <button className="btn" type="button" onClick={load}>Try again</button>
      </section>
    );
  }

  return (
    <>
      {!view.hasPractice && (
        <section className="card">
          <h2>Start California practice</h2>
          <p>A new account has no saved practice yet. Quick 10 is the first check.</p>
          <Link className="btn" href={`${caPaths.practice}?mode=quick`}>Start Quick 10</Link>
        </section>
      )}
      <section className="card">
        <h2>Recent practice</h2>
        {view.recent.length === 0 ? <p>No California exam is saved on this account yet.</p> : (
          <ul className="check">
            {view.recent.map((exam) => (
              <li key={exam.id}>
                <strong>{exam.label}</strong>
                {" · "}
                {when(exam.at)}
                {" · "}
                {exam.correct}/{exam.total}
                {exam.skipped > 0 ? ` · ${exam.skipped} unanswered` : ""}
                {exam.wrong > 0 ? (
                  <>
                    {" · "}
                    <Link href={`${caPaths.mistakes}?attempt=${exam.id}`}>Review My Mistakes ({exam.wrong})</Link>
                  </>
                ) : " · No mistakes"}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2>Today&apos;s review</h2>
        <p>{view.due.length > 0 ? `${view.due.length} due` : "Nothing is due"}</p>
        {view.nextReviewAt && <p>Next review {when(view.nextReviewAt)}.</p>}
        {view.due.length > 0 && (
          <ul className="check">
            {view.due.map((item) => <li key={item.questionId}>{item.prompt}</li>)}
          </ul>
        )}
      </section>
      <section className="card">
        <h2>Scheduled review</h2>
        {view.scheduled.length === 0 ? <p>No California questions are on the review plan.</p> : (
          <ul className="check">
            {view.scheduled.map((item) => (
              <li key={item.questionId}>
                {item.prompt}
                {" · "}
                {item.saved && item.wrongCount === 0 ? "Added" : `Wrong ${item.wrongCount}`}
                {item.nextReviewAt ? ` · ${item.due ? "Due" : "Next"} ${when(item.nextReviewAt)}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className="card">
        <h2>Today&apos;s new study</h2>
        <p>Day {view.dayNumber} · {view.done} of {view.goal} done.</p>
        {view.todayCards.length > 0 && (
          <ul className="check">
            {view.todayCards.map((card) => (
              <li key={card.id}>
                <Link href={`${caPaths.studyCards}?topic=${card.study}`}>{card.title}</Link>
                <span> · {card.front}</span>
              </li>
            ))}
          </ul>
        )}
        <p>{view.todayQuestionIds.length} new question{view.todayQuestionIds.length === 1 ? "" : "s"} today.</p>
      </section>
    </>
  );
}
