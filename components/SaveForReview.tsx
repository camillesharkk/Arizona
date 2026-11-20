"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { BookmarkIcon } from "@/components/QuizChrome";
import { DailyStudySaveDialog } from "@/components/DailyStudySaveDialog";
import { paths } from "@/lib/paths";
import { parseStateCookie } from '@/lib/site-state';

const PENDING_KEY = "az-pending-review-saves";
const savedIds = new Set<string>();

function readPending() {
  const pending = new Map<string, boolean>();
  try {
    const raw = JSON.parse(sessionStorage.getItem(PENDING_KEY) || "[]");
    if (Array.isArray(raw)) for (const entry of raw) {
      if (typeof entry === "string") pending.set(entry, true);
      else if (typeof entry?.questionId === "string" && typeof entry.includeNotebook === "boolean") {
        pending.set(entry.questionId, entry.includeNotebook);
      }
    }
  } catch {}
  return pending;
}

function writePending(pending: Map<string, boolean>) {
  try {
    sessionStorage.setItem(PENDING_KEY, JSON.stringify(Array.from(pending, ([questionId, includeNotebook]) => ({ questionId, includeNotebook }))));
  } catch {}
}

const savedKnown = new Map<string, Promise<void>>();
const localSaveChoice = new Map<string, boolean>();

export function publishReviewSave(questionId: string, saved: boolean) {
  if (saved) savedIds.add(questionId);
  else savedIds.delete(questionId);
  localSaveChoice.set(questionId, saved);
  window.dispatchEvent(new CustomEvent("az-review-save", { detail: { questionId, saved } }));
}

function rememberServerSaves(rows: { questionId?: string; savedForReview?: boolean }[]) {
  for (const row of rows) {
    if (!row?.questionId || localSaveChoice.has(row.questionId)) continue;
    if (row.savedForReview) savedIds.add(row.questionId);
  }
}

function loadSavedReviews(questionId: string) {
  const state = parseStateCookie(questionId.split('-')[0].toUpperCase()) || 'AZ';
  if (!savedKnown.has(state)) {
    const request = Promise.all([`/api/mistakes/?state=${state}`].map((url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null)))
      .then((payloads) => {
        for (const data of payloads) {
          const rows = Array.isArray(data?.mistakes) ? data.mistakes : [];
          rememberServerSaves(Array.isArray(data?.savedReviewIds)
            ? data.savedReviewIds.map((id: string) => ({ questionId: id, savedForReview: true }))
            : rows);
        }
      })
      .catch(() => undefined);
    savedKnown.set(state, request);
  }
  return savedKnown.get(state);
}

async function postSave(questionId: string, saveForReview: boolean, includeNotebook?: boolean) {
  return fetch("/api/mistakes/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ questionId, saveForReview, includeNotebook }),
  });
}

let pendingFlush: Promise<void> | undefined;

function flushPendingReviewSaves() {
  if (pendingFlush) return pendingFlush;
  const pending = readPending();
  if (!pending.size) return;
  pendingFlush = applyPending(pending).finally(() => { pendingFlush = undefined; });
  return pendingFlush;
}

async function applyPending(pending: Map<string, boolean>) {
  for (const [id, includeNotebook] of pending) {
    const res = await postSave(id, true, includeNotebook).catch(() => null);
    if (res?.status === 401) break;
    if (!res?.ok) continue;
    const body = await res.json().catch(() => null);
    if (body?.ok !== true || body.savedForReview !== true || body.savedInNotebook !== includeNotebook) continue;
    const left = readPending();
    if (left.get(id) === includeNotebook) {
      left.delete(id);
      writePending(left);
    }
    publishReviewSave(id, true);
  }
}

export function SaveForReview({
  questionId,
  label = "Add to Daily Study",
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
  const [asking, setAsking] = useState(false);
  const [message, setMessage] = useState("");
  const saving = useRef(false);

  useEffect(() => {
    let cancel = false;
    setSaved(savedIds.has(questionId));
    setNext(`${paths.login}?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    Promise.all([flushPendingReviewSaves(), loadSavedReviews(questionId)])
      .then(() => {
        if (!cancel) setSaved(savedIds.has(questionId));
      })
      .catch(() => undefined);
    function onSaved(event: Event) {
      const { questionId: changed, saved: nextSaved } = (event as CustomEvent<{ questionId: string; saved: boolean }>).detail;
      if (changed === questionId) setSaved(nextSaved);
    }
    window.addEventListener("az-review-save", onSaved);
    return () => {
      cancel = true;
      window.removeEventListener("az-review-save", onSaved);
    };
  }, [questionId]);

  async function save(nextSaved: boolean, includeNotebook?: boolean) {
    if (saving.current) return;
    saving.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    setNeedLogin(false);
    const res = await postSave(questionId, nextSaved, includeNotebook).catch(() => null);
    const body = res?.ok ? await res.json().catch(() => null) : null;
    saving.current = false;
    setBusy(false);
    if (!res) {
      setError("Could not save this question. Try again.");
      return;
    }
    if (res.status === 401) {
      if (nextSaved && includeNotebook !== undefined) writePending(readPending().set(questionId, includeNotebook));
      setNeedLogin(true);
      return;
    }
    if (!res.ok) {
      setError("Could not save this question. Try again.");
      return;
    }
    if (!body?.ok || body.savedForReview !== nextSaved ||
      (includeNotebook !== undefined && body.savedInNotebook !== includeNotebook)) {
      setError("Could not save this question. Try again.");
      return;
    }
    const pending = readPending();
    pending.delete(questionId);
    writePending(pending);
    setSaved(nextSaved);
    if (nextSaved) setMessage(includeNotebook ? "Saved to Daily Study and Wrong Answers." : "Saved to Daily Study.");
    publishReviewSave(questionId, nextSaved);
  }

  return (
    <div className="save-review">
      <button className={`btn btn-ghost${saved ? " is-on" : ""}`} type="button" onClick={() => {
        if (saved) return save(false);
        setAsking(true);
      }} disabled={busy} aria-pressed={saved} aria-haspopup={saved ? undefined : "dialog"}>
        <BookmarkIcon /> {busy ? "Saving…" : saved ? "Added to Daily Study" : label}
      </button>
      {asking ? <DailyStudySaveDialog onDismiss={() => setAsking(false)} onSave={(includeNotebook) => void save(true, includeNotebook)} /> : null}
      {hint && !saved ? <p className="notice">Adds this question to Daily Study. It does not count as a missed answer.</p> : null}
      {needLogin ? (
        <p className="notice" role="status">
          Sign in to save this question for review. <Link href={next}>Sign in</Link>
        </p>
      ) : null}
      {error ? <p className="form-error" role="alert">{error}</p> : null}
      {message ? <p className="notice" role="status">{message}</p> : null}
    </div>
  );
}
