import type { Question, TopicId } from "@/lib/types";
import { topics } from "@/data/exam-config";
import { publishedQuestions } from "@/data/questions";

export function shuffle<T>(items: T[], seed?: number): T[] {
  const copy = [...items];
  let s = seed ?? Date.now() % 100000;
  for (let i = copy.length - 1; i > 0; i--) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function pickExamSet(count: number, opts?: { freeOnly?: boolean; topic?: TopicId }): Question[] {
  let pool = publishedQuestions();
  if (opts?.freeOnly) pool = pool.filter((q) => q.is_free);
  if (opts?.topic) pool = pool.filter((q) => q.topic === opts.topic);
  return shuffle(pool).slice(0, Math.min(count, pool.length));
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

export function isActiveQuestion(q: Question, asOf = new Date()): boolean {
  const from = new Date(q.effective_from);
  const to = q.effective_to ? new Date(q.effective_to) : null;
  if (asOf < from) return false;
  if (to && asOf > to) return false;
  return q.status === "published";
}
