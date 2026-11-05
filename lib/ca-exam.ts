import type { ExamArea, Question } from "@/lib/types";
import { publishedCaQuestions } from "../data/ca-questions.ts";
import { shuffle } from "./answer-sequence.ts";
import { CA_EXAM, areaLabel } from "./ca-site.ts";

const AREAS: ExamArea[] = ["administration", "acts", "identity", "immigration", "violations"];

export function caPool(freeOnly = false) {
  return publishedCaQuestions().filter((question) => !freeOnly || question.is_free);
}

export function pickCaQuickExam(seed: number, pool = caPool(true)): Question[] {
  const used = new Set<string>();
  const picked: Question[] = [];
  for (let round = 0; round < 2; round += 1) {
    AREAS.forEach((area, index) => {
      const hit = shuffle(
        pool.filter((question) => question.exam_area === area && !used.has(question.question_id)),
        seed + round * 10 + index
      )[0];
      if (!hit) return;
      used.add(hit.question_id);
      picked.push(hit);
    });
  }
  if (picked.length !== 10) return [];
  return shuffle(picked, seed + 99);
}

export function pickCaFullExam(seed: number, pool = caPool(false)): { questions: Question[]; unscoredIds: string[] } | null {
  const used = new Set<string>();
  const scored: Question[] = [];
  CA_EXAM.quotas.forEach((quota, index) => {
    const available = pool.filter((question) => question.exam_area === quota.area && !used.has(question.question_id));
    const picked = shuffle(available, seed + index * 17).slice(0, quota.count);
    picked.forEach((question) => used.add(question.question_id));
    scored.push(...picked);
  });
  if (scored.length !== CA_EXAM.scoredCount) return null;
  const unscored = shuffle(
    pool.filter((question) => !used.has(question.question_id)),
    seed + 41
  ).slice(0, CA_EXAM.unscoredCount);
  if (unscored.length !== CA_EXAM.unscoredCount) return null;
  return {
    questions: shuffle([...scored, ...unscored], seed + 87),
    unscoredIds: unscored.map((question) => question.question_id),
  };
}

export function weakestCaArea(
  items: { question: Question; selected?: string; correct: boolean }[]
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
