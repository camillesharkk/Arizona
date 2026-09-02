import type { Question, TopicId } from "@/lib/types";
import { topics } from "@/data/exam-config";
import { examConfig } from "@/data/exam-config";
import { publishedQuestions } from "@/data/questions";
import { isActiveQuestion } from "@/lib/question-status";
import { shuffle } from "@/lib/answer-sequence";

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
} from "@/lib/answer-sequence";

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

export function scorePercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function topicLabel(id: TopicId): string {
  return topics.find((t) => t.id === id)?.label ?? id;
}

export function weakTopics(
  results: { question: Question; correct: boolean }[],
  limit = 2
): { topic: TopicId; label: string; wrong: number; total: number }[] {
  const map = new Map<TopicId, { wrong: number; total: number }>();
  for (const r of results) {
    const cur = map.get(r.question.topic) ?? { wrong: 0, total: 0 };
    cur.total += 1;
    if (!r.correct) cur.wrong += 1;
    map.set(r.question.topic, cur);
  }
  return [...map.entries()]
    .map(([topic, v]) => ({ topic, label: topicLabel(topic), ...v }))
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong)
    .slice(0, limit);
}
