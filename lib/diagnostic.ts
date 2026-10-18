import { freeQuestions } from "../data/questions.ts";
import { topics } from "../data/exam-config.ts";
import type { Question, TopicId } from "./types.ts";
import { isActiveQuestion } from "./question-status.ts";
import { shuffle } from "./answer-sequence.ts";

export const DIAGNOSTIC_VERSION = 1;

export type DiagnosticBandId = "basics" | "review" | "full";
export type DiagnosticChoice = "A" | "B" | "C" | "D" | "unsure";

export type DiagnosticProfile = {
  stateCode: "AZ";
  stateName: string;
  enabled: boolean;
  questionCount: number;
  version: number;
  bands: { id: DiagnosticBandId; min: number; max: number; action: string }[];
};

/** Arizona only. Another state needs its own reviewed bank before `enabled` can be true. */
export const arizonaDiagnostic: DiagnosticProfile = {
  stateCode: "AZ",
  stateName: "Arizona",
  enabled: true,
  questionCount: 10,
  version: DIAGNOSTIC_VERSION,
  bands: [
    { id: "basics", min: 0, max: 5, action: "Start with the Basics" },
    { id: "review", min: 6, max: 8, action: "Review These Topics" },
    { id: "full", min: 9, max: 10, action: "Take a Full Practice Exam" },
  ],
};

export function profileForState(stateCode: string): DiagnosticProfile | null {
  if (stateCode === arizonaDiagnostic.stateCode) return arizonaDiagnostic;
  return null;
}

export type DiagnosticSession = {
  stateCode: "AZ";
  version: number;
  questionIds: string[];
  answers: Record<string, DiagnosticChoice>;
  index: number;
  status: "active" | "complete";
  startSent: boolean;
  completeSent: boolean;
};

const CHOICES = new Set<DiagnosticChoice>(["A", "B", "C", "D", "unsure"]);

export function isDiagnosticEligible(q: Question, stateCode: string, asOf = new Date()) {
  return q.state === stateCode && q.is_free && q.status === "published" && isActiveQuestion(q, asOf);
}

export function diagnosticCandidates(stateCode: string, asOf = new Date()) {
  return freeQuestions().filter((q) => isDiagnosticEligible(q, stateCode, asOf));
}

export function diagnosticReady(stateCode: string, asOf = new Date()) {
  const profile = profileForState(stateCode);
  if (!profile?.enabled) return false;
  return diagnosticCandidates(stateCode, asOf).length >= profile.questionCount;
}

export function diagnosticStorageKey(email: string | null) {
  const who = email?.trim() ? email.trim() : "guest";
  return `az-notary-diagnostic:${arizonaDiagnostic.stateCode}:${who}`;
}

function nextSeed(seed: number) {
  const s = (Math.abs(seed || 1) * 16807) % 2147483647;
  return s <= 0 ? 1 : s;
}

function stemKey(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
}

function similarStem(a: string, b: string) {
  const left = stemKey(a);
  const right = stemKey(b);
  if (!left || left === right) return true;
  const aw = [...new Set(left.split(" ").filter((w) => w.length > 3))];
  const bw = [...new Set(right.split(" ").filter((w) => w.length > 3))];
  if (aw.length < 5 || bw.length < 5) return false;
  const setB = new Set(bw);
  let shared = 0;
  for (const word of aw) if (setB.has(word)) shared += 1;
  const union = new Set([...aw, ...bw]).size;
  return union > 0 && shared / union >= 0.75;
}

/**
 * One pass across topic ids, then fill. Returns [] instead of repeating a question.
 * ponytail: easy/medium/hard only breaks ties. Not a validated difficulty model.
 */
export function pickDiagnosticQuestions(pool: Question[], count: number, seed: number, stateCode: string): Question[] {
  const unique: Question[] = [];
  const seen = new Set<string>();
  for (const q of pool) {
    if (!isDiagnosticEligible(q, stateCode) || seen.has(q.question_id)) continue;
    seen.add(q.question_id);
    unique.push(q);
  }
  if (count < 1 || unique.length < count) return [];

  const byTopic = new Map<TopicId, Question[]>();
  for (const q of unique) {
    const list = byTopic.get(q.topic) ?? [];
    list.push(q);
    byTopic.set(q.topic, list);
  }

  const picked: Question[] = [];
  const used = new Set<string>();
  const diffCount: Record<Question["difficulty"], number> = { easy: 0, medium: 0, hard: 0 };
  let cursor = seed || 1;

  function choose(list: Question[], allowSimilar: boolean) {
    cursor = nextSeed(cursor);
    const open = shuffle(
      list.filter((q) => !used.has(q.question_id)),
      cursor
    );
    let best: Question | null = null;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const q of open) {
      if (!allowSimilar && picked.some((kept) => similarStem(kept.question_text, q.question_text))) continue;
      const score = diffCount[q.difficulty] ?? 0;
      if (score < bestScore) {
        best = q;
        bestScore = score;
      }
    }
    return best;
  }

  function take(q: Question) {
    picked.push(q);
    used.add(q.question_id);
    diffCount[q.difficulty] += 1;
  }

  const topicOrder = shuffle([...byTopic.keys()], seed || 1);
  for (const topic of topicOrder) {
    if (picked.length === count) break;
    const q = choose(byTopic.get(topic) ?? [], false);
    if (q) take(q);
  }
  let guard = 0;
  while (picked.length < count && guard < topicOrder.length + 2) {
    guard += 1;
    let added = false;
    for (const topic of topicOrder) {
      if (picked.length === count) break;
      const q = choose(byTopic.get(topic) ?? [], false);
      if (!q) continue;
      take(q);
      added = true;
    }
    if (!added) break;
  }
  if (picked.length < count) {
    cursor = nextSeed(cursor);
    for (const q of shuffle(
      unique.filter((item) => !used.has(item.question_id)),
      cursor
    )) {
      if (picked.length === count) break;
      take(q);
    }
  }
  return picked.length === count ? picked : [];
}

export function scoreDiagnostic(questions: Question[], answers: Record<string, DiagnosticChoice | undefined>) {
  let correct = 0;
  for (const q of questions) {
    if (answers[q.question_id] === q.correct_option) correct += 1;
  }
  return { correct, total: questions.length };
}

export function recommendFor(correct: number, profile: DiagnosticProfile = arizonaDiagnostic): DiagnosticBandId {
  const band = profile.bands.find((item) => correct >= item.min && correct <= item.max);
  return band?.id ?? "review";
}

export function bandAction(id: DiagnosticBandId, profile: DiagnosticProfile = arizonaDiagnostic) {
  return profile.bands.find((item) => item.id === id)?.action ?? "Review These Topics";
}

export type TopicScore = { topic: TopicId; label: string; correct: number; total: number };

export function topicScores(questions: Question[], answers: Record<string, DiagnosticChoice | undefined>): TopicScore[] {
  const map = new Map<TopicId, { correct: number; total: number }>();
  for (const q of questions) {
    const cur = map.get(q.topic) ?? { correct: 0, total: 0 };
    cur.total += 1;
    if (answers[q.question_id] === q.correct_option) cur.correct += 1;
    map.set(q.topic, cur);
  }
  return topics
    .filter((topic) => map.has(topic.id))
    .map((topic) => {
      const cur = map.get(topic.id)!;
      return { topic: topic.id, label: topic.label, correct: cur.correct, total: cur.total };
    });
}

export function missedTopics(scores: TopicScore[]) {
  return scores
    .filter((item) => item.correct < item.total)
    .sort((a, b) => b.total - b.correct - (a.total - a.correct) || a.correct / a.total - b.correct / b.total);
}

export function parseDiagnosticSession(
  raw: string | null,
  profile: DiagnosticProfile,
  lookup: (id: string) => Question | null
): { session: DiagnosticSession; questions: Question[] } | null {
  if (!raw) return null;
  let data: Partial<DiagnosticSession>;
  try {
    data = JSON.parse(raw) as Partial<DiagnosticSession>;
  } catch {
    return null;
  }
  if (data.version !== profile.version || data.stateCode !== profile.stateCode) return null;
  if (data.status !== "active" && data.status !== "complete") return null;
  if (!Array.isArray(data.questionIds) || data.questionIds.length !== profile.questionCount) return null;
  if (new Set(data.questionIds).size !== data.questionIds.length) return null;
  if (typeof data.index !== "number" || data.index < 0 || data.index >= data.questionIds.length) return null;
  if (typeof data.startSent !== "boolean" || typeof data.completeSent !== "boolean") return null;
  const questions: Question[] = [];
  for (const id of data.questionIds) {
    if (typeof id !== "string") return null;
    const q = lookup(id);
    if (!q || !isDiagnosticEligible(q, profile.stateCode)) return null;
    questions.push(q);
  }
  const answers: Record<string, DiagnosticChoice> = {};
  if (!data.answers || typeof data.answers !== "object") return null;
  for (const [id, choice] of Object.entries(data.answers)) {
    if (!data.questionIds.includes(id) || !CHOICES.has(choice as DiagnosticChoice)) return null;
    answers[id] = choice as DiagnosticChoice;
  }
  return {
    session: {
      stateCode: profile.stateCode,
      version: profile.version,
      questionIds: data.questionIds,
      answers,
      index: data.index,
      status: data.status,
      startSent: data.startSent,
      completeSent: data.completeSent,
    },
    questions,
  };
}

export function blankSession(questions: Question[], profile: DiagnosticProfile = arizonaDiagnostic): DiagnosticSession {
  return {
    stateCode: profile.stateCode,
    version: profile.version,
    questionIds: questions.map((q) => q.question_id),
    answers: {},
    index: 0,
    status: "active",
    startSent: false,
    completeSent: false,
  };
}
