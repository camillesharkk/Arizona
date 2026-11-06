"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { caGuideChapters } from "@/data/ca-study-guide";
import {
  adoptGuestCaRecords,
  caStudyRecord,
  importCaReviewTopics,
  latestCaQuick,
  readCaAttempt,
  setCaChapterFlag,
  type CaQuickAttempt,
} from "@/lib/ca-attempts";
import { caPaths } from "@/lib/ca-site";
import { caStudyLabel } from "@/lib/ca-topics";
import { scrollUnderHeaderSoon } from "@/lib/scroll-under-header";

function ownerFrom(userId: string | null) {
  return userId || "guest";
}

export function CaliforniaGuide() {
  const params = useSearchParams();
  const requested = params.get("attempt") || "";
  const chapter = params.get("chapter") || "";
  const [owner, setOwner] = useState("guest");
  const [signedIn, setSignedIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [attempt, setAttempt] = useState<CaQuickAttempt | null>(null);
  const [reads, setReads] = useState<string[]>([]);
  const [mastered, setMastered] = useState<string[]>([]);
  const [topics, setTopics] = useState<{ id: string; missed: number; attemptId: string }[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function loadRecord(nextOwner: string, nextAttempt: CaQuickAttempt | null) {
    const record = caStudyRecord(nextOwner);
    setReads(record.reads);
    setMastered(record.mastered);
    setTopics(record.reviewTopics);
    setAttempt(nextAttempt);
  }

  useEffect(() => {
    fetch("/api/auth/me/")
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("account"))))
      .then((data) => {
        const userId = data.user?.id || "";
        if (userId) adoptGuestCaRecords(userId);
        const nextOwner = ownerFrom(userId);
        setOwner(nextOwner);
        setSignedIn(Boolean(userId));
        const row = requested ? readCaAttempt(nextOwner, requested) : latestCaQuick(nextOwner);
        loadRecord(nextOwner, row);
      })
      .catch(() => {
        const row = requested ? readCaAttempt("guest", requested) : latestCaQuick("guest");
        loadRecord("guest", row);
      });
  }, [requested]);

  useEffect(() => {
    const id = window.location.hash.replace("#", "") || chapter;
    if (!id) return;
    const target = document.getElementById(id);
    scrollUnderHeaderSoon(target);
  }, [chapter, attempt]);

  const misses = attempt?.topicMisses.filter((item) => item.missed > 0) || [];
  const otherMisses = useMemo(() => misses.filter((item) => item.id !== chapter), [misses, chapter]);

  function refresh() {
    loadRecord(owner, attempt);
  }

  function importTopics() {
    if (!attempt) return;
    setError("");
    try {
      const result = importCaReviewTopics(owner, attempt.id, attempt.topicMisses);
      setMessage(result.added
        ? `${result.added} review ${result.added === 1 ? "topic" : "topics"} added · ${result.kept} already listed`
        : `${result.kept} review ${result.kept === 1 ? "topic" : "topics"} already listed`);
      refresh();
      setOpen(false);
    } catch {
      setError("Could not add these topics. Try again.");
    }
  }

  function toggle(id: string, field: "reads" | "mastered") {
    const on = field === "reads" ? !reads.includes(id) : !mastered.includes(id);
    const next = setCaChapterFlag(owner, id, field, on);
    setReads(next.reads);
    setMastered(next.mastered);
  }

  return (
    <>
      <div className="row space">
        <p className="kicker">Study Guide</p>
        <button className="btn btn-ghost" type="button" onClick={() => { setOpen((value) => !value); setError(""); }}>
          Import Topics from Practice
        </button>
      </div>
      {open ? (
        <div className="card import-panel">
          <h2>Import Topics from Practice</h2>
          {!attempt ? (
            <>
              <p>No finished Quick 10 is on this account yet.</p>
              <Link className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>Start Quick 10</Link>
            </>
          ) : misses.length === 0 ? (
            <p>No missed topics to import.</p>
          ) : (
            <>
              <p>Finished {new Date(attempt.finishedAt).toLocaleString()}.</p>
              <ul>
                {misses.map((item) => (
                  <li key={item.id}>{caStudyLabel(item.id)} · {item.missed} missed</li>
                ))}
              </ul>
              <button className="btn btn-primary" type="button" onClick={importTopics}>Add to My Review Topics</button>
            </>
          )}
          {error ? <p className="form-error" role="alert">{error}</p> : null}
        </div>
      ) : null}
      {message ? <p className="notice" role="status">{message}</p> : null}
      {chapter && otherMisses.length > 0 ? (
        <p className="notice">
          This chapter is ready to read.{" "}
          <button className="btn btn-ghost" type="button" onClick={() => setOpen(true)}>
            Import the other missed topics from this check
          </button>
        </p>
      ) : null}
      {topics.length > 0 ? (
        <section className="card" aria-label="My review topics">
          <h2>My Review Topics</h2>
          <ul className="review-topic-list">
            {topics.map((item) => (
              <li key={item.id}>
                <strong>{caStudyLabel(item.id)}</strong> · {item.missed} missed
                <span className="row">
                  <a href={`#${item.id}`}>Read Chapter</a>
                  <Link href={`${caPaths.studyCards}?topic=${item.id}`}>Study Cards</Link>
                  <Link href={`${caPaths.practice}?mode=practice&area=${item.id}`}>Practice This Topic</Link>
                </span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <nav className="card toc" aria-label="Chapters">
        <h2>Chapters</h2>
        {caGuideChapters.map((item) => (
          <a key={item.id} href={`#${item.id}`}>{item.title}</a>
        ))}
      </nav>
      {caGuideChapters.map((item) => (
        <article key={item.id} id={item.id} className="card guide-chapter">
          <div className="row space">
            <h2>{item.title}</h2>
            <span className="kicker">{reads.includes(item.id) ? "Read" : "Unread"}{mastered.includes(item.id) ? " · Mastered" : ""}</span>
          </div>
          <p className="lede">{item.summary}</p>
          <h3>Core rule</h3>
          <p>{item.rule}</p>
          <h3>Exception</h3>
          <p>{item.exception}</p>
          <section className="explain">
            <h3>{item.exampleTitle}</h3>
            <p>{item.example}</p>
          </section>
          <p className="notice">Official source: <a href={item.sourceUrl}>{item.sourceLabel}</a></p>
          <div className="row">
            <button className={`chip ${reads.includes(item.id) ? "on" : ""}`} type="button" onClick={() => toggle(item.id, "reads")}>
              {reads.includes(item.id) ? "Marked read" : "Mark chapter read"}
            </button>
            <button className={`chip ${mastered.includes(item.id) ? "on" : ""}`} type="button" onClick={() => toggle(item.id, "mastered")}>
              {mastered.includes(item.id) ? "Mastered" : "Mark mastered"}
            </button>
            <Link className="btn btn-ghost" href={`${caPaths.studyCards}?topic=${item.id}`}>Study Cards</Link>
          <Link className="btn btn-primary" href={`${caPaths.practice}?mode=practice&area=${item.id}`}>Practice This Topic</Link>
        </div>
      </article>
      ))}
      <p><Link className="btn btn-primary" href={signedIn ? caPaths.daily : `${caPaths.login}?next=${encodeURIComponent(caPaths.daily)}`}>Continue to Daily Study</Link></p>
      {!signedIn ? <p className="notice">Chapter progress on this browser stays with this browser until you sign in.</p> : null}
    </>
  );
}
