"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { publishedQuestions } from "@/data/questions";
import { topics } from "@/data/exam-config";
import { ExamRunner } from "@/components/ExamRunner";
import { paths } from "@/lib/paths";
import type { QuestionStat } from "@/lib/store/types";

export function CloudMistakes() {
  const [stats, setStats] = useState<QuestionStat[]>([]);
  const [topic, setTopic] = useState("all");
  const [drill, setDrill] = useState(false);
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

  const filtered = stats.filter((s) => topic === "all" || s.topic === topic);
  const qs = publishedQuestions().filter((q) => filtered.some((s) => s.questionId === q.question_id));

  if (needAuth) {
    return (
      <div className="card">
        <p>Sign in to save a cloud wrong-answer notebook that follows you across browsers.</p>
        <Link className="btn btn-primary" href={paths.register}>
          Create Free Account
        </Link>
      </div>
    );
  }

  if (drill) {
    return (
      <div>
        <button className="btn btn-ghost" type="button" onClick={() => setDrill(false)}>
          Back
        </button>
        <ExamRunner mode="weak" practice preset={qs.slice(0, 10)} isPro={isPro} />
      </div>
    );
  }

  return (
    <div>
      <div className="filter-row">
        <button className={`chip ${topic === "all" ? "on" : ""}`} type="button" onClick={() => setTopic("all")}>
          All
        </button>
        {topics.map((t) => (
          <button key={t.id} className={`chip ${topic === t.id ? "on" : ""}`} type="button" onClick={() => setTopic(t.id)}>
            {t.short}
          </button>
        ))}
      </div>
      <button className="btn btn-primary" type="button" disabled={!qs.length} onClick={() => setDrill(true)}>
        Practice Wrong Answers
      </button>
      {!qs.length && <p className="lede">No missed items in this filter.</p>}
      {filtered.map((s) => {
        const q = publishedQuestions().find((x) => x.question_id === s.questionId);
        if (!q) return null;
        const acc = s.rightCount + s.wrongCount ? Math.round((s.rightCount / (s.rightCount + s.wrongCount)) * 100) : 0;
        return (
          <article className="card" key={s.questionId} style={{ marginTop: 12 }}>
            <span className="kicker">
              {s.topic} · bank {s.bank} · chapter {s.chapter}
            </span>
            <h3>{q.question_text}</h3>
            <p>
              Last pick {s.lastSelected} · Correct {s.lastCorrectOption} · First {s.firstCorrect ? "correct" : "wrong"} ·
              Last {s.lastCorrect ? "correct" : "wrong"} · Wrong {s.wrongCount} · Right {s.rightCount} · Accuracy {acc}%
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
