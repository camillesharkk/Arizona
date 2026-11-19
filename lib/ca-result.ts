import type { ExamArea, Question } from "./types.ts";
import { areaLabel } from "./ca-site.ts";

export function weakestCaArea(
  items: { question: Question; selected?: string; correct: boolean }[],
): { area: ExamArea; label: string } | null {
  const answered = items.filter((item) => item.selected);
  const map = new Map<ExamArea, { wrong: number; total: number }>();
  for (const item of answered) {
    const area = item.question.exam_area;
    if (!area) continue;
    const row = map.get(area) || { wrong: 0, total: 0 };
    row.total += 1;
    if (!item.correct) row.wrong += 1;
    map.set(area, row);
  }
  const ranked = [...map.entries()]
    .filter(([, row]) => row.wrong > 0)
    .sort((a, b) => b[1].wrong / b[1].total - a[1].wrong / a[1].total || b[1].wrong - a[1].wrong || a[0].localeCompare(b[0]));
  const top = ranked[0];
  if (!top) return null;
  return { area: top[0], label: areaLabel(top[0]) };
}
