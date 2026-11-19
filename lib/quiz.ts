import type { Question, TopicId } from "./types.ts";
import { examConfig } from "../data/exam-config.ts";
import { publishedQuestions } from "../data/questions.ts";
import { isActiveQuestion } from "./question-status.ts";
import { shuffle } from "./answer-sequence.ts";

export { scorePercent, topicLabel, weakTopics } from "./quiz-ui.ts";

export { isActiveQuestion };
export {
  buildBalancedAnswerSequence,
  countsAreBalanced,
  isAcceptableSequence,
  letterCounts,
  optionText,
  presentExamQuestions,
  sequenceViolations,
  shuffle,
  shuffleQuestionOptions,
  type Letter,
} from "./answer-sequence.ts";

export function eligibleExamPool(opts?: { freeOnly?: boolean; topic?: TopicId }): Question[] {
  let pool = publishedQuestions().filter((q) => isActiveQuestion(q));
  if (opts?.freeOnly) pool = pool.filter((q) => q.is_free);
  if (opts?.topic) pool = pool.filter((q) => q.topic === opts.topic);
  return pool;
}

export function pickExamSet(
  count: number,
  opts?: { freeOnly?: boolean; topic?: TopicId; requireExact?: boolean; seed?: number }
): Question[] {
  const pool = eligibleExamPool({ freeOnly: opts?.freeOnly, topic: opts?.topic });
  const picked = shuffle(pool, opts?.seed).slice(0, count);
  if (opts?.requireExact && picked.length !== count) return [];
  return picked;
}

export function pickFullExam(seed?: number): Question[] {
  return pickExamSet(examConfig.questionCount, { requireExact: true, seed });
}

export function pickQuickExam(seed?: number, freeOnly = false): Question[] {
  return pickExamSet(10, { requireExact: true, freeOnly, seed });
}

export function isQuickEligible(q: Question, opts?: { freeOnly?: boolean; asOf?: Date }) {
  if (!isActiveQuestion(q, opts?.asOf)) return false;
  if (opts?.freeOnly && !q.is_free) return false;
  return true;
}

export function sanitizeQuickExam(
  list: Question[],
  opts?: { freeOnly?: boolean; seed?: number; count?: number; asOf?: Date }
): Question[] {
  const count = opts?.count ?? 10;
  const kept: Question[] = [];
  const seen = new Set<string>();
  for (const q of list) {
    if (!isQuickEligible(q, opts) || seen.has(q.question_id)) continue;
    seen.add(q.question_id);
    kept.push(q);
    if (kept.length === count) return kept;
  }
  const fill = eligibleExamPool({ freeOnly: opts?.freeOnly }).filter((q) => !seen.has(q.question_id));
  for (const q of shuffle(fill, opts?.seed)) {
    if (!isQuickEligible(q, opts)) continue;
    seen.add(q.question_id);
    kept.push(q);
    if (kept.length === count) break;
  }
  return kept.length === count ? kept : [];
}

export function buildQuickExam(opts: { isPro?: boolean; seed?: number; stale?: Question[]; asOf?: Date }) {
  const freeOnly = !opts.isPro;
  const raw = opts.stale?.length ? opts.stale : pickQuickExam(opts.seed, freeOnly);
  return sanitizeQuickExam(raw, { freeOnly, seed: opts.seed, asOf: opts.asOf });
}

