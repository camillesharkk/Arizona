import type { Letter } from "./sitting.ts";
import { applyMistakeImport, applyReviewImport, type ReviewTopic, type TopicMiss } from "./ca-next.ts";
import { loadProgress, saveProgress } from "./storage.ts";

export type CaQuickAttempt = {
  id: string;
  owner: string;
  state: "CA";
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
};

export type CaStudyRecord = {
  owner: string;
  reads: string[];
  mastered: string[];
  reviewTopics: ReviewTopic[];
};

const ATTEMPTS = "ca-notary-attempts";
const STUDY = "ca-notary-study";
const LOCAL = "ca-notary-local-mistakes";

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

function asAttempt(row: unknown): CaQuickAttempt | null {
  if (!row || typeof row !== "object") return null;
  const item = row as Partial<CaQuickAttempt>;
  if (item.state !== "CA" || item.mode !== "quick") return null;
  if (typeof item.id !== "string" || typeof item.owner !== "string" || !Array.isArray(item.questionIds)) return null;
  return item as CaQuickAttempt;
}

export function listCaAttempts(owner: string) {
  return readList<unknown>(ATTEMPTS)
    .map(asAttempt)
    .filter((item): item is CaQuickAttempt => Boolean(item && item.owner === owner))
    .sort((a, b) => b.finishedAt.localeCompare(a.finishedAt));
}

export function readCaAttempt(owner: string, id: string) {
  if (!id) return null;
  return listCaAttempts(owner).find((item) => item.id === id) || null;
}

export function latestCaQuick(owner: string) {
  return listCaAttempts(owner)[0] || null;
}

export function saveCaQuickAttempt(row: CaQuickAttempt) {
  if (typeof window === "undefined" || !row.id || !row.owner) return;
  const all = readList<unknown>(ATTEMPTS).map(asAttempt).filter((item): item is CaQuickAttempt => Boolean(item));
  const index = all.findIndex((item) => item.id === row.id);
  if (index >= 0) {
    if (all[index].owner !== row.owner) return;
    all[index] = { ...row, finishedAt: all[index].finishedAt };
  } else {
    all.unshift(row);
  }
  writeList(ATTEMPTS, all.slice(0, 30));
}

export function adoptGuestCaRecords(userId: string) {
  if (typeof window === "undefined" || !userId || userId === "guest") return;
  const attempts = readList<unknown>(ATTEMPTS).map(asAttempt).filter((item): item is CaQuickAttempt => Boolean(item));
  writeList(ATTEMPTS, attempts.map((item) => (item.owner === "guest" ? { ...item, owner: userId } : item)));
  const study = readList<CaStudyRecord>(STUDY).filter((item) => item && typeof item.owner === "string");
  const guest = study.find((item) => item.owner === "guest");
  const mine = study.find((item) => item.owner === userId);
  if (guest) {
    const merged = mergeStudy(mine || emptyStudy(userId), guest);
    writeList(STUDY, [...study.filter((item) => item.owner !== "guest" && item.owner !== userId), merged]);
  }
  const local = readList<{ owner: string; ids: string[] }>(LOCAL);
  const guestIds = local.find((item) => item.owner === "guest")?.ids || [];
  const userIds = local.find((item) => item.owner === userId)?.ids || [];
  writeList(LOCAL, [
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

export function caStudyRecord(owner: string): CaStudyRecord {
  const found = readList<CaStudyRecord>(STUDY).find((item) => item?.owner === owner);
  return found
    ? {
        owner,
        reads: Array.isArray(found.reads) ? found.reads : [],
        mastered: Array.isArray(found.mastered) ? found.mastered : [],
        reviewTopics: Array.isArray(found.reviewTopics) ? found.reviewTopics : [],
      }
    : emptyStudy(owner);
}

function writeStudy(record: CaStudyRecord) {
  const all = readList<CaStudyRecord>(STUDY).filter((item) => item?.owner && item.owner !== record.owner);
  writeList(STUDY, [...all, record]);
}

export function setCaChapterFlag(owner: string, id: string, field: "reads" | "mastered", on: boolean) {
  const record = caStudyRecord(owner);
  const list = new Set(record[field]);
  if (on) list.add(id);
  else list.delete(id);
  const next = { ...record, [field]: [...list] };
  writeStudy(next);
  return next;
}

export function importCaReviewTopics(owner: string, attemptId: string, misses: TopicMiss[]) {
  const record = caStudyRecord(owner);
  const applied = applyReviewImport(record.reviewTopics, attemptId, misses);
  writeStudy({ ...record, reviewTopics: applied.next });
  return applied;
}

export function localMistakeIds(owner: string) {
  const row = readList<{ owner: string; ids: string[] }>(LOCAL).find((item) => item.owner === owner);
  const progress = loadProgress("CA").wrongIds;
  return [...new Set([...(row?.ids || []), ...progress])];
}

export function importLocalMistakes(owner: string, ids: string[]) {
  const current = localMistakeIds(owner);
  const applied = applyMistakeImport(current, ids);
  const all = readList<{ owner: string; ids: string[] }>(LOCAL).filter((item) => item.owner !== owner);
  writeList(LOCAL, [...all, { owner, ids: applied.next }]);
  const progress = loadProgress("CA");
  const wrongIds = [...new Set([...progress.wrongIds, ...applied.next])];
  if (wrongIds.length !== progress.wrongIds.length) saveProgress({ wrongIds }, "CA");
  return applied;
}
