"use client";

import { useEffect, useState } from "react";
import { caPaths } from "@/lib/ca-site";

type Due = { questionId: string; prompt: string; due: string | null; area?: string };

export function CaliforniaDaily() {
  const [status, setStatus] = useState<"loading" | "signed-out" | "ready">("loading");
  const [due, setDue] = useState<Due[]>([]);

  useEffect(() => {
    fetch("/api/daily-study/?state=CA")
      .then(async (response) => {
        if (response.status === 401) {
          setStatus("signed-out");
          return;
        }
        const data = await response.json();
        setDue(Array.isArray(data.due) ? data.due : []);
        setStatus("ready");
      })
      .catch(() => setStatus("signed-out"));
  }, []);

  if (status === "loading") return <p className="notice">Loading daily study…</p>;
  if (status === "signed-out") {
    return (
      <div className="card">
        <h2>Sign in to see due reviews</h2>
        <p>Missed California questions use the same 1, 7, 14, and 30 day review spacing. This page shows an item when it is due.</p>
        <a className="btn btn-primary" href={`${caPaths.login}?next=${encodeURIComponent(caPaths.daily)}`}>Sign in</a>
      </div>
    );
  }
  return (
    <div className="grid">
      <div className="card">
        <h2>{due.length ? `${due.length} due` : "Nothing is due"}</h2>
        <p>A missed question is not due on the day you miss it. It comes back on the next scheduled day.</p>
        {due.length ? (
          <ul>
            {due.map((item) => (
              <li key={item.questionId}>{item.prompt}</li>
            ))}
          </ul>
        ) : (
          <a className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
        )}
      </div>
    </div>
  );
}
