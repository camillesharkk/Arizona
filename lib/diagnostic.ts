import { freeQuestions } from "../data/questions.ts";
import type { Question, TopicId } from "./types.ts";
import { shuffle } from "./answer-sequence.ts";
import { isDiagnosticEligible, profileForState } from "./diagnostic-ui.ts";
export { DIAGNOSTIC_VERSION, arizonaDiagnostic, profileForState, diagnosticStorageKey, scoreDiagnostic, recommendFor, bandAction, topicScores, missedTopics, parseDiagnosticSession, blankSession, isDiagnosticEligible } from "./diagnostic-ui.ts";
export type { DiagnosticBandId, DiagnosticChoice, DiagnosticProfile, DiagnosticSession, TopicScore } from "./diagnostic-ui.ts";

export function diagnosticCandidates(stateCode: string, asOf = new Date()) {
  return freeQuestions().filter((q) => isDiagnosticEligible(q, stateCode, asOf));
}

export function diagnosticReady(stateCode: string, asOf = new Date()) {
  const profile = profileForState(stateCode);
  if (!profile?.enabled) return false;
  return diagnosticCandidates(stateCode, asOf).length >= profile.questionCount;
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
