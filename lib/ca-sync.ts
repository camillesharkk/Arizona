"use client";

import { adoptGuestCaRecords, hasPendingCaAttempts, listCaAttempts, markCaAttemptSynced, type TopicPracticeState } from "@/lib/ca-attempts";
import { adoptGuestSittings, readSitting, sittingKey } from "@/lib/sitting";
import { fetchAccount } from "@/lib/client-account";

type SyncResult = { ok: boolean; pending: boolean; message?: string };
const states: TopicPracticeState[] = ["AZ", "CA", "HI", "NY", "PA", "LA"];
const inflight = new Map<string, Promise<SyncResult>>();

export async function syncCaAttempts(state: TopicPracticeState = "CA", userId?: string): Promise<SyncResult> {
  const guestPrefix = sittingKey("guest", "", state);
  let hasGuestSitting = false;
  try {
    hasGuestSitting = Array.from({ length: sessionStorage.length }, (_, index) => sessionStorage.key(index)).some(key => key?.startsWith(guestPrefix));
  } catch {
    // The account page still works when a browser disallows session storage.
  }
  if (!hasPendingCaAttempts(state) && !hasGuestSitting) return { ok: true, pending: false };
  if (!userId) {
    try {
      const account = await (await fetchAccount()).json();
      return account.user?.id ? syncCaAttempts(state, account.user.id) : { ok: true, pending: false };
    } catch {
      return { ok: false, pending: true, message: "Your practice is saved on this device. Retry to finish syncing it." };
    }
  }
  const key = `${userId}:${state}`;
  const existing = inflight.get(key);
  if (existing) return existing;
  const run = syncOnce(state, userId).catch(() => ({ ok: false, pending: true, message: "Your practice is saved on this device. Retry to finish syncing it." })).finally(() => {
    if (inflight.get(key) === run) inflight.delete(key);
  });
  inflight.set(key, run);
  return run;
}

export function syncGuestProgress(userId?: string) {
  return Promise.all(states.map(state => syncCaAttempts(state, userId)));
}

async function syncOnce(state: TopicPracticeState, userId: string): Promise<SyncResult> {
  if (state === "AZ") {
    for (const mode of ["quick", "home-quick"]) {
      const guestSitting = readSitting(sessionStorage, "guest", mode, state);
      if (guestSitting?.done && guestSitting.examId && !listCaAttempts("guest", state).some(attempt => attempt.id === guestSitting.examId)) {
        const { archiveGuestArizonaQuick } = await import("@/lib/guest-sitting-attempt");
        archiveGuestArizonaQuick(guestSitting);
      }
    }
  }
  adoptGuestCaRecords(userId, state);
  adoptGuestSittings(sessionStorage, userId, state);
  const pending = listCaAttempts(userId, state).filter(attempt => !attempt.synced).sort((left, right) => left.finishedAt.localeCompare(right.finishedAt));
  let message: string | undefined;
  for (const attempt of pending) {
    const response = await fetch("/api/progress/import/", {
      method: "POST", headers: { "Content-Type": "application/json" }, signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        accountId: userId, state, examId: attempt.id, finishedAt: attempt.finishedAt,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        questions: attempt.questionIds.map(questionId => ({
          questionId, questionVersion: attempt.questionVersions?.[questionId] ?? 1,
          selected: attempt.originalAnswers[questionId], attemptId: attempt.attemptIds[questionId],
        })),
      }),
    });
    if (response.ok) markCaAttemptSynced(userId, attempt.id, state);
    else {
      const error = await response.json().catch(() => ({}));
      message = error.code === "question_updated"
        ? "An earlier practice uses older questions. Its original result remains saved on this device."
        : "Your practice is saved on this device. Retry to finish syncing it.";
    }
  }
  return { ok: !message, pending: Boolean(message), message };
}
