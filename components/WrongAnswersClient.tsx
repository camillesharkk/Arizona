"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { publishedQuestions } from "@/data/questions";
import { topicLabel } from "@/lib/quiz";
import { ExamRunner } from "@/components/ExamRunner";
import { loadProgress, removeWrong, subscribeProgress, toggleFlag } from "@/lib/storage";
import { currentEmail } from "@/lib/account";

export function WrongAnswersClient() {
  const [tick, setTick] = useState(0);
  const [drill, setDrill] = useState(false);
  const progress = useMemo(() => loadProgress(), [tick]);

  useEffect(() => subscribeProgress(() => setTick((n) => n + 1)), []);

  const wrong = publishedQuestions().filter((q) => progress.wrongIds.includes(q.question_id));
  const flagged = publishedQuestions().filter((q) => progress.flaggedIds.includes(q.question_id));

  if (drill) {
    if (!wrong.length) {
      return (
        <div className="card">
          <p>No missed items left. Nice work.</p>
          <button className="btn btn-ghost" type="button" onClick={() => setDrill(false)}>
            Back to notebook
          </button>
        </div>
      );
    }
    return (
      <div>
        <button className="btn btn-ghost" type="button" onClick={() => setDrill(false)} style={{ marginBottom: 16 }}>
          Back to notebook
        </button>
        <ExamRunner mode="weak" practice preset={wrong.slice(0, 10)} />
      </div>
    );
  }

  return (
    <div>
      <div className="row" style={{ marginBottom: 16 }}>
        <button className="btn btn-primary" type="button" disabled={!wrong.length} onClick={() => setDrill(true)}>
          Practice Wrong Answers
        </button>
        {!currentEmail() && (
          <Link className="btn btn-ghost" href="/arizona/account/">
            Create Free Account
          </Link>
        )}
      </div>
      {!wrong.length && (
        <div className="card">
          <h2>No missed questions yet</h2>
          <p>Wrong answers from practice tests and topic drills collect here automatically.</p>
          <Link className="btn btn-primary" href="/arizona/exam-questions/">
            Start Questions
          </Link>
        </div>
      )}
      {wrong.map((q) => (
        <article className="card" key={q.question_id} style={{ marginTop: 12 }}>
          <span className="kicker">
            {topicLabel(q.topic)} · {q.difficulty}
          </span>
          <h3>{q.question_text}</h3>
          <p className="notice">{q.source_reference}</p>
          <div className="row">
            <Link className="btn btn-primary" href={`/arizona/questions/${q.topic}/`}>
              Practice this topic
            </Link>
            <button className="btn btn-ghost" type="button" onClick={() => removeWrong(q.question_id)}>
              Remove
            </button>
            <button className="btn btn-ghost" type="button" onClick={() => toggleFlag(q.question_id)}>
              {progress.flaggedIds.includes(q.question_id) ? "Favorited" : "Favorite"}
            </button>
          </div>
        </article>
      ))}
      {flagged.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <h2>Favorites</h2>
          {flagged.map((q) => (
            <p key={q.question_id}>
              <Link href={`/arizona/questions/${q.topic}/`}>{q.question_text}</Link>
            </p>
          ))}
        </section>
      )}
    </div>
  );
}
