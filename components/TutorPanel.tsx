"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Question } from "@/lib/types";
import { getSource } from "@/data/sources";
import { paths } from "@/lib/paths";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";

const MODES = [
  { id: "explain", label: "Explain this question" },
  { id: "why-correct", label: "Why is this correct?" },
  { id: "why-wrong", label: "Why are others wrong?" },
  { id: "beginner", label: "Explain like I'm a beginner" },
  { id: "similar", label: "Similar question" },
] as const;

type Usage = {
  plan: "free" | "pro";
  used: number;
  limit: number;
  remaining: number;
};

export function TutorPanel({ q, selected }: { q: Question; selected?: "A" | "B" | "C" | "D" }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [usage, setUsage] = useState<Usage | null>(null);
  const [signedIn, setSignedIn] = useState(true);

  const loadUsage = useCallback(async () => {
    const res = await fetch("/api/ai/tutor/");
    if (res.status === 401) {
      setSignedIn(false);
      setUsage(null);
      return;
    }
    const data = await res.json().catch(() => null);
    if (res.ok && data && typeof data.used === "number") {
      setSignedIn(true);
      setUsage({
        plan: data.plan === "pro" ? "pro" : "free",
        used: data.used,
        limit: data.limit,
        remaining: data.remaining,
      });
    }
  }, []);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  useEffect(() => setText(""), [q.question_id, selected]);

  const atLimit = Boolean(usage && usage.remaining <= 0);
  const limit = usage?.limit ?? (usage?.plan === "pro" ? AI_LIMIT_PRO : AI_LIMIT_FREE);

  async function ask(mode: string) {
    if (atLimit) return;
    setBusy(true);
    setErr("");
    const res = await fetch("/api/ai/tutor/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: q.question_id, selected, mode }),
    });
    const data = await res.json();
    setBusy(false);
    if (typeof data.used === "number" && typeof data.limit === "number") {
      setUsage({
        plan: data.plan === "pro" ? "pro" : usage?.plan || "free",
        used: data.used,
        limit: data.limit,
        remaining: data.remaining ?? Math.max(0, data.limit - data.used),
      });
    }
    if (!res.ok) {
      setErr(data.error || "Could not explain");
      return;
    }
    setText(data.text);
  }

  return (
    <div className="explain">
      <strong>AI Tutor</strong>
      {signedIn && usage && (
        <p className="ai-usage" aria-live="polite">
          AI uses today: {usage.used} / {usage.limit}
          <span className="visually-hidden">. AI uses today: {usage.used} of {usage.limit}.</span>
        </p>
      )}
      <p className="notice">
        Grounded in this site&apos;s handbook notes and {getSource(q.source_id).reference}. Core answer explanations
        above are always free and unlimited. Each Tutor button uses 1 request when a response is successfully delivered.
        Limits apply per account per day, not per question.
      </p>
      {atLimit && usage?.plan === "free" && (
        <div className="ai-limit-notice">
          <p>You&apos;ve used all {AI_LIMIT_FREE} free Tutor requests for today.</p>
          <p>Upgrade to Pro for up to {AI_LIMIT_PRO} Tutor requests per day.</p>
          <Link className="btn btn-primary" href={paths.pricing}>
            Unlock Pro — {AI_LIMIT_PRO}/day
          </Link>
        </div>
      )}
      {atLimit && usage?.plan === "pro" && (
        <p className="ai-limit-notice">
          You&apos;ve used all {limit} Pro Tutor requests for today. Please try again tomorrow.
        </p>
      )}
      <div className="row">
        {MODES.map((m) => (
          <button
            key={m.id}
            className="chip"
            type="button"
            disabled={busy || atLimit}
            aria-disabled={busy || atLimit}
            onClick={() => ask(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {busy && <p>Loading…</p>}
      {err && <p className="form-error">{err}</p>}
      {text && <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>}
    </div>
  );
}
