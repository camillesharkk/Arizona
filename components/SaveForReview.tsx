"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";

const PENDING_KEY = "az-pending-review-saves";
const savedIds = new Set<string>();

function readPending() {
  try {
    const raw = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
    return Array.isArray(raw) ? raw.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writePending(ids: string[]) {
  sessionStorage.setItem(PENDING_KEY, JSON.stringify([...new Set(ids)]));
}

let savedKnown: Promise<void> | null = null;
const localSaveChoice = new Map<string, boolean>();

function rememberServerSaves(rows: { questionId?: string; savedForReview?: boolean }[]) {
  for (const row of rows) {
    if (!row?.questionId || localSaveChoice.has(row.questionId)) continue;
    if (row.savedForReview) savedIds.add(row.questionId);
  }
}

function loadSavedReviews() {
  if (!savedKnown) {
    savedKnown = fetch("/api/mistakes/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const rows = Array.isArray(data?.mistakes) ? data.mistakes : [];
        rememberServerSaves(rows);
      })
      .catch(() => undefined);
  }
  return savedKnown;
}

async function postSave(questionId: string, saveForReview: boolean) {
  return fetch("/api/mistakes/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, saveForReview }),
  });
}

export async function flushPendingReviewSaves() {
  const pending = readPending();
  if (!pending.length) return;
  const left: string[] = [];
  for (const id of pending) {
    const res = await postSave(id, true).catch(() => null);
    if (res?.ok) savedIds.add(id);
    else if (res?.status === 401) left.push(id);
    else left.push(id);
  }
  writePending(left);
}

export function SaveForReview({
  questionId,
  label = "Save for review",
  hint = true,
}: {
  questionId: string;
  label?: string;
  hint?: boolean;
}) {
  const [saved, setSaved] = useState(savedIds.has(questionId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [needLogin, setNeedLogin] = useState(false);
  const [next, setNext] = useState<string>(paths.login);

  useEffect(() => {
    let cancel = false;
    setSaved(savedIds.has(questionId));
    setNext(`${paths.login}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    Promise.all([flushPendingReviewSaves(), loadSavedReviews()])
      .then(() => {
        if (!cancel) setSaved(savedIds.has(questionId));
      })
      .catch(() => undefined);
    return () => {
      cancel = true;
    };
  }, [questionId]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError("");
    setNeedLogin(false);
    const nextSaved = !saved;
    const res = await postSave(questionId, nextSaved).catch(() => null);
    setBusy(false);
    if (!res) {
      setError("Could not save this question. Try again.");
      return;
    }
    if (res.status === 401) {
      writePending([...readPending(), questionId]);
      setNeedLogin(true);
      return;
    }
    if (!res.ok) {
      setError("Could not save this question. Try again.");
      return;
    }
    if (nextSaved) savedIds.add(questionId);
    else savedIds.delete(questionId);
    localSaveChoice.set(questionId, nextSaved);
    writePending(readPending().filter((id) => id !== questionId));
    setSaved(nextSaved);
  }

  return (
    <div className="save-review">
      <button className="btn btn-ghost" type="button" onClick={toggle} disabled={busy} aria-pressed={saved}>
        {busy ? "Saving…" : saved ? "Saved for review" : label}
      </button>
      {hint && !saved ? <p className="notice">Guessed or unsure? Save this question to review later.</p> : null}
      {needLogin ? (
        <p className="notice" role="status">
          Sign in to save this question for review. <Link href={next}>Sign in</Link>
        </p>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </div>
  );
}
