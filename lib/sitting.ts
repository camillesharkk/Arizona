export type Letter = "A" | "B" | "C" | "D";

export type Sitting = {
  version: 1;
  owner: string;
  state: "AZ";
  mode: string;
  seed: number;
  questionIds: string[];
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
};

const LETTERS = new Set(["A", "B", "C", "D"]);

export function sittingKey(owner: string, mode: string) {
  return `az-sitting:AZ:${owner}:${mode}`;
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

export function parseSitting(raw: unknown, owner: string, mode: string): Sitting | null {
  if (!raw || typeof raw !== "object") return null;
  const row = raw as Partial<Sitting>;
  if (row.version !== 1 || row.owner !== owner || row.state !== "AZ" || row.mode !== mode) return null;
  if (typeof row.seed !== "number" || !Array.isArray(row.questionIds) || !row.questionIds.length) return null;
  return {
    version: 1,
    owner,
    state: "AZ",
    mode,
    seed: row.seed,
    questionIds: stringList(row.questionIds),
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
  };
}

export function readSitting(storage: Pick<Storage, "getItem">, owner: string, mode: string): Sitting | null {
  try {
    return parseSitting(JSON.parse(storage.getItem(sittingKey(owner, mode)) || "null"), owner, mode);
  } catch {
    return null;
  }
}

export function writeSitting(storage: Pick<Storage, "setItem">, sitting: Sitting) {
  storage.setItem(sittingKey(sitting.owner, sitting.mode), JSON.stringify(sitting));
}

export function clearSitting(storage: Pick<Storage, "removeItem">, owner: string, mode: string) {
  storage.removeItem(sittingKey(owner, mode));
}

export function openSitting(storage: Pick<Storage, "getItem">, owner: string, mode: string): Sitting | null {
  const sitting = readSitting(storage, owner, mode);
  if (!sitting || sitting.done) return null;
  return sitting;
}
