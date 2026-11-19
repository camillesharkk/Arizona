import { topics } from "../data/exam-config.ts";
import type { Question, TopicId } from "./types.ts";

export function topicLabel(id: TopicId | string): string {
  return topics.find((topic) => topic.id === id)?.label ?? id;
}

export function scorePercent(correct: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((correct / total) * 100);
}

export function weakTopics(
  results: { question: Question; correct: boolean }[],
  limit = 2,
): { topic: TopicId; label: string; wrong: number; total: number }[] {
  const map = new Map<TopicId, { wrong: number; total: number }>();
  for (const row of results) {
    const current = map.get(row.question.topic) ?? { wrong: 0, total: 0 };
    current.total += 1;
    if (!row.correct) current.wrong += 1;
    map.set(row.question.topic, current);
  }
  return [...map.entries()]
    .map(([topic, value]) => ({ topic, label: topicLabel(topic), ...value }))
    .sort((a, b) => b.wrong / b.total - a.wrong / a.total || b.wrong - a.wrong || a.topic.localeCompare(b.topic))
    .slice(0, limit);
}
