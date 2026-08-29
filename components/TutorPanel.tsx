"use client";

import { useEffect, useState } from "react";
import type { Question } from "@/lib/types";
import { getSource } from "@/data/sources";

export function TutorPanel({ q, selected }: { q: Question; selected?: "A" | "B" | "C" | "D" }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function ask(mode: string) {
    setBusy(true);
    setErr("");
    const res = await fetch("/api/ai/tutor/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.question_id, selected, mode }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) setErr(data.error || "Could not explain");
    else setText(data.text);
  }

  useEffect(() => setText(""), [q.question_id, selected]);

  return (
    <div className="explain">
      <strong>AI Tutor</strong>
      <p className="notice">Grounded in this site&apos;s handbook notes and {getSource(q.source_id).reference}. Free accounts have a daily cap.</p>
      <div className="row">
        <button className="chip" type="button" disabled={busy} onClick={() => ask("explain")}>Explain this question</button>
        <button className="chip" type="button" disabled={busy} onClick={() => ask("why-correct")}>Why is this correct?</button>
        <button className="chip" type="button" disabled={busy} onClick={() => ask("why-wrong")}>Why are others wrong?</button>
        <button className="chip" type="button" disabled={busy} onClick={() => ask("beginner")}>Explain like I&apos;m a beginner</button>
        <button className="chip" type="button" disabled={busy} onClick={() => ask("similar")}>Similar question</button>
      </div>
      {busy && <p>Loading…</p>}
      {err && <p className="form-error">{err}</p>}
      {text && <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>}
    </div>
  );
}
