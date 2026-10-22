"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import { ExamRunner } from "@/components/ExamRunner";
import { topicLabel } from "@/lib/quiz";
import { paths } from "@/lib/paths";
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

  async function load() {
    const me = await fetch("/api/auth/me/").then((r) => r.json());
    if (!me.user) {
      setNeedAuth(true);
      return;
    }
    setIsPro(Boolean(me.user.arizonaPro || me.user.plan === "pro"));
    const data = await fetch("/api/mistakes/").then((r) => r.json());
    setStats(data.mistakes || []);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    setTopic(initialTopic && topicIds.has(initialTopic) ? initialTopic : "all");
  }, [initialTopic]);

  const filtered = stats.filter((s) => topic === "all" || s.topic === topic);
  const due = filtered.filter(dueNow);
  const nextReview = filtered
    .map((s) => s.nextReviewAt)
    .filter((value): value is string => Boolean(value))
    .sort()[0];
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
        <ExamRunner mode="weak" practice review preset={queue} isPro={isPro} />
      </div>
    );
  }

  return (
    <div>
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
      {!filtered.length ? (
        <div className="card">
          <p>No missed questions in this set yet.</p>
          <Link className="btn btn-primary" href={paths.practice}>Start a practice test</Link>
        </div>
      ) : (
        <>
          {due.length === 0 && nextReview ? <p className="notice">Next review {new Date(nextReview).toLocaleString()}.</p> : null}
          <button className="btn btn-primary" type="button" onClick={begin}>
            {due.length === 0 ? "Practice all wrong answers" : "Practice wrong answers"}
          </button>
        </>
      )}
      {filtered.map((s) => {
        const q = publishedQuestions().find((x) => x.question_id === s.questionId);
        if (!q) return null;
        return (
          <article className="card" key={s.questionId} style={{ marginTop: 12 }}>
            <span className="kicker">
              {topicLabel(q.topic)} · {dueNow(s) ? "Due" : "Later"}
            </span>
            <h3>{q.question_text}</h3>
            <p>
              Wrong {s.wrongCount} {s.wrongCount === 1 ? "time" : "times"}
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
