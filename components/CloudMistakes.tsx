"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import { ExamRunner } from "@/components/ExamRunner";
import { LoadingNote } from "@/components/QuizChrome";
import { topicLabel } from "@/lib/quiz";
import { paths } from "@/lib/paths";
import { listPhase } from "@/lib/list-phase";
import type { Question } from "@/lib/types";
import type { QuestionStat } from "@/lib/store/types";

const topicIds = new Set<string>(topics.map((topic) => topic.id));

function dueNow(stat: QuestionStat) {
  return Boolean(stat.nextReviewAt) && Date.parse(stat.nextReviewAt as string) <= Date.now();
}

export function CloudMistakes({ initialTopic }: { initialTopic?: string }) {
  const router = useRouter();
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [topic, setTopic] = useState(initialTopic && topicIds.has(initialTopic) ? initialTopic : "all");
  const [queue, setQueue] = useState<Question[] | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [needAuth, setNeedAuth] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [source, setSource] = useState<"all" | "incorrect" | "saved">("all");
  const requestId = useRef(0);

  async function load() {
    const id = ++requestId.current;
    setLoadError(false);
    try {
      const meResponse = await fetch("/api/auth/me/");
      if (id !== requestId.current) return;
      if (!meResponse.ok) throw new Error("account");
      const me = await meResponse.json();
      if (!me.user) {
        setNeedAuth(true);
        setReady(true);
        return;
      }
      setNeedAuth(false);
      setIsPro(Boolean(me.user.arizonaPro || me.user.plan === "pro"));
      const response = await fetch("/api/mistakes/");
      if (id !== requestId.current) return;
      if (!response.ok) throw new Error("mistakes");
      const data = await response.json();
      if (!Array.isArray(data.mistakes)) throw new Error("mistakes");
      setStats(data.mistakes);
      setReady(true);
    } catch {
      if (id !== requestId.current) return;
      setLoadError(true);
      setReady(true);
    }
  }

  useEffect(() => {
    load();
    function onSave() {
      load();
    }
    window.addEventListener("az-review-save", onSave);
    return () => window.removeEventListener("az-review-save", onSave);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setTopic(initialTopic && topicIds.has(initialTopic) ? initialTopic : "all");
  }, [initialTopic]);

  const byTopic = stats.filter((s) => topic === "all" || s.topic === topic);
  const filtered = byTopic.filter((s) => {
    if (source === "incorrect") return s.wrongCount > 0;
    if (source === "saved") return Boolean(s.savedForReview);
    return true;
  });
  const due = filtered.filter(dueNow);
  const nextReview = filtered
    .map((s) => s.nextReviewAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
  const phase = listPhase(loadError ? "error" : ready ? "ready" : "loading", filtered.length);
  const returnTo = topic === "all" ? paths.mistakes : `${paths.mistakes}?topic=${topic}`;

  function selectTopic(id: string) {
    setTopic(id);
    router.replace(id === "all" ? paths.mistakes : `${paths.mistakes}?topic=${id}`, { scroll: false });
  }

  function begin() {
    const byId = new Map(publishedQuestions().map((question) => [question.question_id, question]));
    const next = filtered.flatMap((stat) => {
      const question = byId.get(stat.questionId);
      return question ? [question] : [];
    });
    setQueue(next);
  }

  if (needAuth) {
    return (
      <div className="card">
        <p>Sign in to practice the questions you missed. Your place is saved.</p>
        <Link className="btn btn-primary" href={`${paths.login}?next=${encodeURIComponent(returnTo)}`}>
          Sign in
        </Link>
      </div>
    );
  }

  if (queue) {
    return (
      <div>
        <button className="btn btn-ghost" type="button" onClick={() => { setQueue(null); load(); }}>
          Back
        </button>
        <ExamRunner mode="weak" practice review preset={queue} isPro={isPro} sittingMode={`review-${source}-${topic}`} />
      </div>
    );
  }

  return (
    <div>
      {ready && isPro ? (
        <p className="notice">Pro is active. Missed questions and questions you save stay on this account.</p>
      ) : null}
      {ready && !isPro ? (
        <p className="notice">
          Missed questions and questions you save stay on this account. Pro adds the rest of the practice bank.{" "}
          <Link href={paths.pricing}>View Pro</Link>
        </p>
      ) : null}
      <div className="filter-row" aria-label="Review source">
        <button className={`chip ${source === "all" ? "on" : ""}`} type="button" onClick={() => setSource("all")}>All</button>
        <button className={`chip ${source === "incorrect" ? "on" : ""}`} type="button" onClick={() => setSource("incorrect")}>Incorrect</button>
        <button className={`chip ${source === "saved" ? "on" : ""}`} type="button" onClick={() => setSource("saved")}>Saved</button>
      </div>
      <div className="filter-row">
        <button className={`chip ${topic === "all" ? "on" : ""}`} type="button" onClick={() => selectTopic("all")}>
          All
        </button>
        {topics.map((item) => (
          <button key={item.id} className={`chip ${topic === item.id ? "on" : ""}`} type="button" onClick={() => selectTopic(item.id)}>
            {item.short}
          </button>
        ))}
      </div>
      {phase === "loading" ? <LoadingNote /> : null}
      {phase === "error" ? (
        <div className="card">
          <p className="form-error" role="alert">Could not load your questions.</p>
          <button className="btn btn-primary" type="button" onClick={() => { setReady(false); load(); }}>Retry</button>
        </div>
      ) : null}
      {loadError && phase === "list" ? (
        <p className="form-error" role="alert">
          Could not refresh this list.{" "}
          <button className="btn btn-ghost" type="button" onClick={() => load()}>Retry</button>
        </p>
      ) : null}
      {phase === "empty" ? (
        <div className="card">
          <p>
            {source === "saved"
              ? "No questions saved."
              : source === "incorrect"
                ? "No missed questions."
                : "No missed or saved questions in this set yet."}
          </p>
          <Link className="btn btn-primary" href={paths.practice}>Start a practice test</Link>
        </div>
      ) : null}
      {phase === "list" ? (
        <>
          {due.length === 0 && nextReview ? <p className="notice">Next review {new Date(nextReview).toLocaleString()}.</p> : null}
          <button className="btn btn-primary" type="button" onClick={begin}>
            {due.length === 0 ? "Practice all wrong answers" : "Practice wrong answers"}
          </button>
        </>
      ) : null}
      {filtered.map((s) => {
        const q = publishedQuestions().find((x) => x.question_id === s.questionId);
        if (!q) return null;
        return (
          <article className="card" key={s.questionId} style={{ marginTop: 12 }}>
            <span className="kicker">
              {topicLabel(q.topic)} · {dueNow(s) ? "Due" : "Later"}
              {s.wrongCount > 0 ? " · Incorrect" : ""}
              {s.savedForReview ? " · Saved" : ""}
            </span>
            <h3>{q.question_text}</h3>
            <p>
              {s.wrongCount > 0 ? `Wrong ${s.wrongCount} ${s.wrongCount === 1 ? "time" : "times"}` : "Saved for review"}
              {s.nextReviewAt ? ` · Next review ${new Date(s.nextReviewAt).toLocaleString()}` : ""}
            </p>
            <div className="row">
              <button
                className="chip"
                type="button"
                onClick={async () => {
                  await fetch("/api/mistakes/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: s.questionId, mastered: true }) });
                  load();
                }}
              >
                Mark mastered
              </button>
              <button
                className="chip"
                type="button"
                onClick={async () => {
                  await fetch("/api/mistakes/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: s.questionId, favorited: !s.favorited }) });
                  load();
                }}
              >
                {s.favorited ? "Favorited" : "Favorite"}
              </button>
              <button
                className="chip"
                type="button"
                onClick={async () => {
                  await fetch("/api/mistakes/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ questionId: s.questionId, remove: true }) });
                  load();
                }}
              >
                Delete record
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
