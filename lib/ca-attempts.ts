import type { Letter } from "./sitting.ts";
import { applyMistakeImport, applyReviewImport, type ReviewTopic, type TopicMiss } from "./ca-next.ts";
import { loadProgress, saveProgress } from "./storage.ts";

export type TopicPracticeState = "CA" | "HI";

export type CaQuickAttempt = {
  id: string;
  owner: string;
  state: TopicPracticeState;
  mode: "quick";
  sittingMode: string;
  finishedAt: string;
  seed: number;
  questionIds: string[];
  answers: Record<string, Letter>;
  originalAnswers: Record<string, Letter>;
  attemptIds: Record<string, string>;
  correctIds: string[];
  wrongIds: string[];
  skippedIds: string[];
  topicMisses: TopicMiss[];
  /** Set after the signed-in account has this attempt. A later save must not clear it. */
  synced?: boolean;
};

export type CaStudyRecord = {
  owner: string;
  reads: string[];
  mastered: string[];
  reviewTopics: ReviewTopic[];
};

function keys(state: TopicPracticeState) {
  if (state === "HI") return { attempts: "hi-notary-attempts", study: "hi-notary-study", local: "hi-notary-local-mistakes" };
  return { attempts: "ca-notary-attempts", study: "ca-notary-study", local: "ca-notary-local-mistakes" };
}

function readList<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function writeList(key: string, rows: unknown[]) {
  localStorage.setItem(key, JSON.stringify(rows));
}

function asAttempt(row: unknown, state: TopicPracticeState): CaQuickAttempt | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Partial<CaQuickAttempt>;
  if (item.state !== state || item.mode !== "quick") return null;
  if (typeof item.id !== "string" || typeof item.owner !== "string" || !Array.isArray(item.questionIds)) return null;
  return item as CaQuickAttempt;
}

export function listCaAttempts(owner: string, state: TopicPracticeState = "CA") {
  return readList<unknown>(keys(state).attempts)
    .map((row) => asAttempt(row, state))
    .filter((item): item is CaQuickAttempt => Boolean(item && item.owner === owner))
    .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
}

export function readCaAttempt(owner: string, id: string, state: TopicPracticeState = "CA") {
  if (!id) return null;
  return listCaAttempts(owner, state).find((item) => item.id === id) || null;
}

export function latestCaQuick(owner: string, state: TopicPracticeState = "CA") {
  return listCaAttempts(owner, state)[0] || null;
}

export function saveCaQuickAttempt(row: CaQuickAttempt) {
  if (typeof window === "undefined" || !row.id || !row.owner) return;
  const state = row.state === "HI" ? "HI" : "CA";
  const all = readList<unknown>(keys(state).attempts).map((item) => asAttempt(item, state)).filter((item): item is CaQuickAttempt => Boolean(item));
  const index = all.findIndex((item) => item.id === row.id);
  if (index >= 0) {
    if (all[index].owner !== row.owner) return;
    all[index] = { ...row, finishedAt: all[index].finishedAt, synced: all[index].synced || row.synced };
  } else {
    all.unshift(row);
  }
  writeList(keys(state).attempts, all.slice(0, 30));
}

export function adoptGuestCaRecords(userId: string, state: TopicPracticeState = "CA") {
  if (typeof window === "undefined" || !userId || userId === "guest") return;
  const store = keys(state);
  const attempts = readList<unknown>(store.attempts).map((item) => asAttempt(item, state)).filter((item): item is CaQuickAttempt => Boolean(item));
  writeList(store.attempts, attempts.map((item) => (item.owner === "guest" ? { ...item, owner: userId } : item)));
  const study = readList<CaStudyRecord>(store.study).filter((item) => item && typeof item.owner === "string");
  const guest = study.find((item) => item.owner === "guest");
  const mine = study.find((item) => item.owner === userId);
  if (guest) {
    const merged = mergeStudy(mine || emptyStudy(userId), guest);
    writeList(store.study, [...study.filter((item) => item.owner !== "guest" && item.owner !== userId), merged]);
  }
  const local = readList<{ owner: string; ids: string[] }>(store.local);
  const guestIds = local.find((item) => item.owner === "guest")?.ids || [];
  const userIds = local.find((item) => item.owner === userId)?.ids || [];
  writeList(store.local, [
    ...local.filter((item) => item.owner !== "guest" && item.owner !== userId),
    { owner: userId, ids: [...new Set([...userIds, ...guestIds])] },
  ]);
}

function emptyStudy(owner: string): CaStudyRecord {
  return { owner, reads: [], mastered: [], reviewTopics: [] };
}

function mergeStudy(user: CaStudyRecord, guest: CaStudyRecord): CaStudyRecord {
  const topics = user.reviewTopics.slice();
  for (const row of guest.reviewTopics) {
    if (!topics.some((item) => item.id === row.id)) topics.push(row);
  }
  return {
    owner: user.owner,
    reads: [...new Set([...user.reads, ...guest.reads])],
    mastered: [...new Set([...user.mastered, ...guest.mastered])],
    reviewTopics: topics,
  };
}

export function caStudyRecord(owner: string, state: TopicPracticeState = "CA"): CaStudyRecord {
  const found = readList<CaStudyRecord>(keys(state).study).find((item) => item?.owner === owner);
  return found
    ? {
        owner,
        reads: Array.isArray(found.reads) ? found.reads : [],
        mastered: Array.isArray(found.mastered) ? found.mastered : [],
        reviewTopics: Array.isArray(found.reviewTopics) ? found.reviewTopics : [],
      }
    : emptyStudy(owner);
}

function writeStudy(record: CaStudyRecord, state: TopicPracticeState) {
  const all = readList<CaStudyRecord>(keys(state).study).filter((item) => item?.owner && item.owner !== record.owner);
  writeList(keys(state).study, [...all, record]);
}

export function setCaChapterFlag(owner: string, id: string, field: "reads" | "mastered", on: boolean, state: TopicPracticeState = "CA") {
  const record = caStudyRecord(owner, state);
  const list = new Set(record[field]);
  if (on) list.add(id);
  else list.delete(id);
  const next = { ...record, [field]: [...list] };
  writeStudy(next, state);
  return next;
}

export function importCaReviewTopics(owner: string, attemptId: string, misses: TopicMiss[], state: TopicPracticeState = "CA") {
  const record = caStudyRecord(owner, state);
  const applied = applyReviewImport(record.reviewTopics, attemptId, misses);
  writeStudy({ ...record, reviewTopics: applied.next }, state);
  return applied;
}

export function localMistakeIds(owner: string, state: TopicPracticeState = "CA") {
  const row = readList<{ owner: string; ids: string[] }>(keys(state).local).find((item) => item.owner === owner);
  const progress = loadProgress(state).wrongIds;
  return [...new Set([...(row?.ids || []), ...progress])];
}

export function markCaAttemptSynced(owner: string, id: string, state: TopicPracticeState = "CA") {
  const all = readList<unknown>(keys(state).attempts).map((item) => asAttempt(item, state)).filter((item): item is CaQuickAttempt => Boolean(item));
  const index = all.findIndex((item) => item.id === id && item.owner === owner);
  if (index < 0) return;
  all[index] = { ...all[index], synced: true };
  writeList(keys(state).attempts, all);
}

export function importLocalMistakes(owner: string, ids: string[], state: TopicPracticeState = "CA") {
  const current = localMistakeIds(owner, state);
  const applied = applyMistakeImport(current, ids);
  const all = readList<{ owner: string; ids: string[] }>(keys(state).local).filter((item) => item.owner !== owner);
  writeList(keys(state).local, [...all, { owner, ids: applied.next }]);
  const progress = loadProgress(state);
  const wrongIds = [...new Set([...progress.wrongIds, ...applied.next])];
  if (wrongIds.length !== progress.wrongIds.length) saveProgress({ wrongIds }, state);
  return applied;
}
