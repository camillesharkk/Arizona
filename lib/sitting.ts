import type { StateCode } from "./types.ts";
import { currentQuestionVersion } from './question-revisions.ts';

export type Letter = "A" | "B" | "C" | "D";

export type SittingState = StateCode;

export type Sitting = {
  version: 1;
  owner: string;
  state: SittingState;
  mode: string;
  seed: number;
  questionIds: string[];
  questionVersions?: Record<string, number>;
  /** Missing means original three-choice presentation; keep saved letters stable. */
  presentationVersion?: number;
  idx: number;
  answers: Record<string, Letter>;
  explainOpen: Record<string, boolean>;
  flaggedIds: string[];
  startedAt: number | null;
  timeLimitSeconds: number | null;
  done: boolean;
  examId: string | null;
  attemptIds: Record<string, string>;
  recordedIds: string[];
  scored: boolean;
  /** California full exams persist which items do not affect the raw score. */
  unscoredIds?: string[];
};

const LETTERS = new Set(["A", "B", "C", "D"]);

export function sittingKey(owner: string, mode: string, state: SittingState = "AZ") {
  if (state === "HI") return `hi-sitting:HI:${owner}:${mode}`;
  if (state === "CA") return `ca-sitting:CA:${owner}:${mode}`;
  if (state === "AZ") return `az-sitting:AZ:${owner}:${mode}`;
  return `${state.toLowerCase()}-sitting:${state}:${owner}:${mode}`;
}

/** Claim browser sittings once, retaining an existing account sitting and old versions. */
export function adoptGuestSittings(storage: Storage, owner: string, state: SittingState) {
  const prefix = sittingKey("guest", "", state);
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter((key): key is string => Boolean(key?.startsWith(prefix)));
  for (const key of keys) {
    try {
      const row = JSON.parse(storage.getItem(key) || "null");
      if (row?.version !== 1 || row.owner !== "guest" || row.state !== state || typeof row.mode !== "string") continue;
      const target = sittingKey(owner, row.mode, state);
      const current = parseSitting(row, "guest", row.mode, state);
      const destination = current && !storage.getItem(target) ? target : `${target}:history:${row.examId || row.seed}`;
      storage.setItem(destination, JSON.stringify({ ...row, owner }));
      storage.removeItem(key);
    } catch {
      // A failed storage write leaves the guest copy available for retry.
    }
  }
}

export function remainingSeconds(startedAt: number, limitSeconds: number, now: number) {
  if (!Number.isFinite(startedAt) || !Number.isFinite(limitSeconds) || limitSeconds < 0) return 0;
  return Math.max(0, limitSeconds - Math.floor((now - startedAt) / 1000));
}

function letters(value: unknown): Record<string, Letter> {
  if (!value || typeof value !== "object") return {};
  const out: Record<string, Letter> = {};
  for (const [key, letter] of Object.entries(value)) {
    if (typeof key === "string" && typeof letter === "string" && LETTERS.has(letter)) out[key] = letter as Letter;
  }
  return out;
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string") : [];
}

export function parseSitting(raw: unknown, owner: string, mode: string, state: SittingState = "AZ"): Sitting | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Sitting>;
  if (row.version !== 1 || row.owner !== owner || row.state !== state || row.mode !== mode) return null;
  if (typeof row.seed !== "number" || !Array.isArray(row.questionIds) || !row.questionIds.length) return null;
  // Leave the raw saved sitting intact, but never regrade old letters against replacement content.
  if (['NY','PA','LA','CT','NC','IN'].includes(state) && row.questionIds.some(id => (row.questionVersions?.[id] ?? 1) !== currentQuestionVersion(id))) return null;
  return {
    version: 1,
    owner,
    state,
    mode,
    seed: row.seed,
    questionIds: stringList(row.questionIds),
    questionVersions: row.questionVersions,
    presentationVersion: row.presentationVersion ?? 1,
    idx: typeof row.idx === "number" && row.idx >= 0 ? Math.floor(row.idx) : 0,
    answers: letters(row.answers),
    explainOpen: row.explainOpen && typeof row.explainOpen === "object" ? (row.explainOpen as Record<string, boolean>) : {},
    flaggedIds: stringList(row.flaggedIds),
    startedAt: typeof row.startedAt === "number" ? row.startedAt : null,
    timeLimitSeconds: typeof row.timeLimitSeconds === "number" ? row.timeLimitSeconds : null,
    done: Boolean(row.done),
    examId: typeof row.examId === "string" ? row.examId : null,
    attemptIds: row.attemptIds && typeof row.attemptIds === "object" ? (row.attemptIds as Record<string, string>) : {},
    recordedIds: stringList(row.recordedIds),
    scored: Boolean(row.scored),
    unscoredIds: stringList(row.unscoredIds),
  };
}

export function readSitting(storage: Pick<Storage, "getItem"> & Partial<Pick<Storage, "setItem">>, owner: string, mode: string, state: SittingState = "AZ"): Sitting | null {
  try {
    const key = sittingKey(owner, mode, state);
    const raw = storage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : null;
    const result = parseSitting(parsed, owner, mode, state);
    if (!result && parsed?.owner === owner && parsed?.state === state && ['NY','PA','LA','CT','NC','IN'].includes(state) && parsed?.mode === mode && Array.isArray(parsed.questionIds) && parsed.questionIds.some((id: string) => (parsed.questionVersions?.[id] ?? 1) !== currentQuestionVersion(id))) {
      storage.setItem?.(`${key}:history:${parsed.examId || parsed.seed}:v${Math.max(...Object.values(parsed.questionVersions || { legacy: 1 }) as number[])}`, raw!);
    }
    return result;
  } catch {
    return null;
  }
}

export function writeSitting(storage: Pick<Storage, "setItem">, sitting: Sitting) {
  storage.setItem(sittingKey(sitting.owner, sitting.mode, sitting.state), JSON.stringify(sitting));
}

export function clearSitting(storage: Pick<Storage, "removeItem">, owner: string, mode: string, state: SittingState = "AZ") {
  storage.removeItem(sittingKey(owner, mode, state));
}

export function openSitting(storage: Pick<Storage, "getItem">, owner: string, mode: string, state: SittingState = "AZ"): Sitting | null {
  const sitting = readSitting(storage, owner, mode, state);
  if (!sitting || sitting.done) return null;
  return sitting;
}
