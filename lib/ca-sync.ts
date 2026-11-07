"use client";

import { adoptGuestCaRecords, listCaAttempts, markCaAttemptSynced } from "@/lib/ca-attempts";

/** Post this browser's state checks to the signed-in account. Same attempt ids stay idempotent. */
const inflight = new Map<string, Promise<{ ok: boolean; pending: boolean }>>();

export function syncCaAttempts(state: "CA" | "HI" = "CA") {
  const existing = inflight.get(state);
  if (existing) return existing;
  const run = syncOnce(state).finally(() => {
    inflight.delete(state);
  });
  inflight.set(state, run);
  return run;
}

async function syncOnce(state: "CA" | "HI") {
  const me = await fetch("/api/auth/me/", { cache: "no-store" });
  if (!me.ok) return { ok: false, pending: false };
  const data = await me.json();
  const userId = data.user?.id as string | undefined;
  if (!userId) return { ok: true, pending: false };
  adoptGuestCaRecords(userId, state);
  const pending = listCaAttempts(userId, state).filter((attempt) => !attempt.synced);
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  for (const attempt of pending) {
    for (const questionId of attempt.questionIds) {
      const selected = attempt.originalAnswers[questionId];
      const attemptId = attempt.attemptIds[questionId];
      if (!selected || !attemptId) continue;
      const response = await fetch("/api/progress/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ questionId, selected, attemptId, review: false, state, timeZone }),
      });
      if (!response.ok) return { ok: false, pending: true };
    }
    const exam = await fetch("/api/progress/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        kind: "exam",
        mode: "quick",
        score: Math.round((attempt.correctIds.length / Math.max(attempt.questionIds.length, 1)) * 100),
        correctCount: attempt.correctIds.length,
        total: attempt.questionIds.length,
        examId: attempt.id,
        state,
        wrongIds: attempt.wrongIds,
        skipped: attempt.skippedIds.length,
        timeZone,
      }),
    });
    if (!exam.ok && exam.status !== 401) return { ok: false, pending: true };
    if (exam.status === 401) return { ok: false, pending: true };
    markCaAttemptSynced(userId, attempt.id, state);
  }
  return { ok: true, pending: false };
}
