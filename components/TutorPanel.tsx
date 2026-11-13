"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Question } from "@/lib/types";
import { paths } from "@/lib/paths";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";
import { trackEvent } from "@/lib/analytics";
import { packFor } from "@/lib/prep-pack";

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
  const [answerSource, setAnswerSource] = useState("");
  const requestId = useRef(0);
  const pathname = usePathname();

  const loadUsage = useCallback(async () => {
    try {
      const res = await fetch(`/api/ai/tutor/?state=${q.state}`, { signal: AbortSignal.timeout(20000) });
      if (res.status === 401) {
        setSignedIn(false);
        setUsage(null);
        return;
      }
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || typeof data.used !== "number") throw new Error("Invalid Tutor limits response");
      if (typeof data.used === "number") {
        setSignedIn(true);
        setUsage({
          plan: data.plan === "pro" ? "pro" : "free",
          used: data.used,
          limit: data.limit,
          remaining: data.remaining,
        });
      }
    } catch {
      setErr("Could not load Tutor limits. Try the request again.");
    }
  }, [q.state]);

  useEffect(() => {
    loadUsage();
  }, [loadUsage]);

  useEffect(() => {
    ++requestId.current;
    setText("");
    setErr("");
    setAnswerSource("");
    setBusy(false);
    return () => { ++requestId.current; };
  }, [q.question_id, selected]);

  const atLimit = Boolean(usage && usage.remaining <= 0);
  const limit = usage?.limit ?? (usage?.plan === "pro" ? AI_LIMIT_PRO : AI_LIMIT_FREE);

  async function ask(mode: string) {
    if (atLimit || busy || !signedIn) return;
    const id = ++requestId.current;
    setBusy(true);
    setErr("");
    setText("");
    setAnswerSource("");
    try {
      const res = await fetch("/api/ai/tutor/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId: q.question_id, questionVersion: q.version || 1, state: q.state, selected, mode, options: [q.option_a, q.option_b, q.option_c, q.option_d] }),
        signal: AbortSignal.timeout(20000),
      });
      const data = await res.json().catch(() => null);
      if (id !== requestId.current) return;
      if (res.status === 401) setSignedIn(false);
      if (!data) throw new Error("Could not read the Tutor response. Please try again.");
      if (typeof data.used === "number" && typeof data.limit === "number") {
        setUsage({
          plan: data.plan === "pro" ? "pro" : usage?.plan || "free",
          used: data.used,
          limit: data.limit,
          remaining: data.remaining ?? Math.max(0, data.limit - data.used),
        });
      }
      if (!res.ok) {
        setErr(data.error || "Could not explain this question. Please try again.");
        return;
      }
      setText(data.text);
      setAnswerSource(data.provider === "deepseek" ? "AI-generated explanation."
        : data.fallbackReason === "local" ? "Local explanation from the verified study material."
        : "The AI service was unavailable. A local explanation from the verified study material is shown. This delivered answer uses one Tutor request.");
      trackEvent("ai_tutor_use", {
        provider: data.provider === "deepseek" ? "deepseek" : "grounded-fallback",
        plan: data.plan === "pro" ? "pro" : "free",
        mode,
      });
    } catch (error) {
      if (id === requestId.current) setErr(error instanceof Error && error.name === "TimeoutError"
        ? "The Tutor request timed out. Please try again."
        : "Could not reach the Tutor or read its response. Please try again.");
    } finally {
      if (id === requestId.current) setBusy(false);
    }
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
        Explanations stay free. Each delivered Tutor answer uses 1 request. Free accounts get {AI_LIMIT_FREE} a day; Pro gets {AI_LIMIT_PRO}.
      </p>
      {!signedIn && <p><Link href={`${paths.login}?next=${encodeURIComponent(pathname)}`}>Sign in to use Tutor</Link></p>}
      {atLimit && usage?.plan === "free" && (
        <div className="ai-limit-notice">
          <p>You&apos;ve used all {AI_LIMIT_FREE} free Tutor requests for today.</p>
          {q.state !== "IN" ? <><p>Upgrade to Pro for up to {AI_LIMIT_PRO} Tutor requests per day.</p>
          <Link className="btn btn-primary" href={packFor(q.state)?.paths.pricing || paths.pricing}>
            Unlock Pro — {AI_LIMIT_PRO}/day
          </Link></> : <p>Your free Tutor allowance resets tomorrow. You can keep reviewing explanations and study cards.</p>}
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
            disabled={busy || atLimit || !signedIn}
            aria-disabled={busy || atLimit || !signedIn}
            onClick={() => ask(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>
      {busy && <p>Loading…</p>}
      {err && <p className="form-error" role="alert">{err}</p>}
      {answerSource && <p role="status">{answerSource}</p>}
      {text && <p style={{ whiteSpace: "pre-wrap" }}>{text}</p>}
    </div>
  );
}
