import { currentEmail } from "@/lib/account";
import { currentQuestionVersion } from './question-revisions.ts';

const PREFIX = "az-notary-";
export const PROGRESS_EVENT = "az-notary-progress";
export const ACCOUNT_INVITE_AFTER = 10;

export type ScoreRecord = {
  at: string;
  score: number;
  mode: string;
};

export type SavedProgress = {
  questionVersions?: Record<string, number>;
  revisionHistory?: { questionId: string; version: number; answered: boolean; wrong: boolean }[];
  wrongIds: string[];
  flaggedIds: string[];
  answeredIds: string[];
  lastQuestionId: string | null;
  chapterReads: string[];
  knownCards: string[];
  reviewCards: string[];
  lastScore: number | null;
  lastMode: string | null;
  scores: ScoreRecord[];
};

const empty: SavedProgress = {
  wrongIds: [],
  flaggedIds: [],
  answeredIds: [],
  lastQuestionId: null,
  chapterReads: [],
  knownCards: [],
  reviewCards: [],
  lastScore: null,
  lastMode: null,
  scores: [],
};

function progressKey(email: string | null = currentEmail(), state: import("@/lib/types").StateCode = "AZ") {
  const prefix = state === "CA" ? "ca-notary-" : state === "HI" ? "hi-notary-" : state === "AZ" ? PREFIX : `${state.toLowerCase()}-notary-`;
  return email ? `${prefix}progress:${email}` : `${prefix}progress`;
}

function notifyProgress() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

export function loadProgress(state: import("@/lib/types").StateCode = "AZ", owner?: string | null): SavedProgress {
  if (typeof window === "undefined") return { ...empty };
  try {
    const raw = localStorage.getItem(progressKey(owner, state));
    if (!raw) return { ...empty };
    const progress: SavedProgress = { ...empty, ...JSON.parse(raw) };
    if (state === 'NY') {
      const replaced = [...new Set([...progress.answeredIds, ...progress.wrongIds])].filter(id => (progress.questionVersions?.[id] ?? 1) < currentQuestionVersion(id));
      if (replaced.length) {
        progress.revisionHistory = [...(progress.revisionHistory ?? []), ...replaced.map(id => ({ questionId: id, version: progress.questionVersions?.[id] ?? 1, answered: progress.answeredIds.includes(id), wrong: progress.wrongIds.includes(id) }))];
        progress.answeredIds = progress.answeredIds.filter(id => !replaced.includes(id));
        progress.wrongIds = progress.wrongIds.filter(id => !replaced.includes(id));
        progress.questionVersions = { ...progress.questionVersions, ...Object.fromEntries(replaced.map(id => [id, currentQuestionVersion(id)])) };
        localStorage.setItem(progressKey(owner, state), JSON.stringify(progress));
      }
    }
    return progress;
  } catch {
    return { ...empty };
  }
}

export function saveProgress(patch: Partial<SavedProgress>, state: import("@/lib/types").StateCode = "AZ", owner?: string | null): SavedProgress {
  const next = { ...loadProgress(state, owner), ...patch };
  localStorage.setItem(progressKey(owner, state), JSON.stringify(next));
  notifyProgress();
  return next;
}

export function addWrong(id: string) {
  const p = loadProgress();
  if (!p.wrongIds.includes(id)) saveProgress({ wrongIds: [...p.wrongIds, id] });
}

export function removeWrong(id: string) {
  const p = loadProgress();
  saveProgress({ wrongIds: p.wrongIds.filter((x) => x !== id) });
}

export function recordAnswer(id: string, correct: boolean, state: import("@/lib/types").StateCode = "AZ") {
  const p = loadProgress(state);
  const answeredIds = p.answeredIds.includes(id) ? p.answeredIds : [...p.answeredIds, id];
  const wrongIds = correct ? p.wrongIds.filter((x) => x !== id) : p.wrongIds.includes(id) ? p.wrongIds : [...p.wrongIds, id];
  saveProgress({ answeredIds, wrongIds, lastQuestionId: id, questionVersions: { ...p.questionVersions, [id]: currentQuestionVersion(id) } }, state);
}

export function toggleFlag(id: string) {
  const p = loadProgress();
  const flaggedIds = p.flaggedIds.includes(id)
    ? p.flaggedIds.filter((x) => x !== id)
    : [...p.flaggedIds, id];
  saveProgress({ flaggedIds });
}

export function mergeGuestIntoAccount(email: string) {
  if (typeof window === "undefined") return;
  const guestRaw = localStorage.getItem(`${PREFIX}progress`);
  const accountKey = `${PREFIX}progress:${email}`;
  const accountRaw = localStorage.getItem(accountKey);
  const guest = guestRaw ? ({ ...empty, ...JSON.parse(guestRaw) } as SavedProgress) : { ...empty };
  const account = accountRaw ? ({ ...empty, ...JSON.parse(accountRaw) } as SavedProgress) : { ...empty };

  const union = (a: string[], b: string[]) => [...new Set([...a, ...b])];
  const merged: SavedProgress = {
    wrongIds: union(account.wrongIds, guest.wrongIds),
    flaggedIds: union(account.flaggedIds, guest.flaggedIds),
    answeredIds: union(account.answeredIds, guest.answeredIds),
    lastQuestionId: account.lastQuestionId || guest.lastQuestionId,
    chapterReads: union(account.chapterReads, guest.chapterReads),
    knownCards: union(account.knownCards, guest.knownCards),
    reviewCards: union(account.reviewCards, guest.reviewCards),
    lastScore: account.lastScore ?? guest.lastScore,
    lastMode: account.lastMode ?? guest.lastMode,
    scores: [...account.scores, ...guest.scores]
      .sort((x, y) => y.at.localeCompare(x.at))
      .slice(0, 20),
  };
  localStorage.setItem(accountKey, JSON.stringify(merged));
  localStorage.setItem(`${PREFIX}progress`, JSON.stringify(merged));
  notifyProgress();
}

export function subscribeProgress(cb: () => void) {
  if (typeof window === "undefined") return () => undefined;
  const handler = () => cb();
  window.addEventListener(PROGRESS_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(PROGRESS_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function shouldInviteAccount() {
  if (currentEmail()) return false;
  return loadProgress().answeredIds.length >= ACCOUNT_INVITE_AFTER;
}
