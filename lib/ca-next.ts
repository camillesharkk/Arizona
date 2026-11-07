import { caStudyLabel } from "./ca-topics.ts";

export type TopicMiss = { id: string; missed: number };

export type ReviewTopic = { id: string; missed: number; attemptId: string };

export function rankMissedTopics(misses: TopicMiss[], labelFor: (id: string) => string = caStudyLabel) {
  const ranked = misses
    .filter((item) => item.missed > 0)
    .sort((a, b) => b.missed - a.missed || a.id.localeCompare(b.id));
  const top = ranked[0];
  if (!top) return null;
  return { ...top, label: labelFor(top.id) };
}

export function quickNextBand(correct: number, total: number) {
  if (total > 0 && correct >= total) return "perfect" as const;
  if (correct >= 8) return "ready" as const;
  return "review" as const;
}

/** One row per topic. Repeating an attempt writes the same missed count and does not add a second row. */
export function applyReviewImport(current: ReviewTopic[], attemptId: string, misses: TopicMiss[]) {
  const next = current.map((item) => ({ ...item }));
  let added = 0;
  let kept = 0;
  for (const miss of misses) {
    if (miss.missed < 1 || !miss.id) continue;
    const row = { id: miss.id, missed: miss.missed, attemptId };
    const index = next.findIndex((item) => item.id === row.id);
    if (index >= 0) {
      kept += 1;
      next[index] = row;
    } else {
      added += 1;
      next.push(row);
    }
  }
  return { next, added, kept };
}

/** Set union. Does not carry a wrong-count, mastered flag, or review date. */
export function applyMistakeImport(existing: string[], ids: string[]) {
  const have = new Set(existing);
  const addedIds = ids.filter((id) => id && !have.has(id));
  const already = ids.filter((id) => have.has(id)).length;
  return { next: [...existing, ...addedIds], added: addedIds.length, already };
}
