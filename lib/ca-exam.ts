import type { ExamArea, Question } from "@/lib/types";
import { publishedCaQuestions } from "../data/ca-questions.ts";
import { shuffle } from "./answer-sequence.ts";
import { CA_EXAM } from "./ca-site.ts";
export { weakestCaArea } from "./ca-result.ts";

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

const AREAS: ExamArea[] = ["administration", "acts", "identity", "immigration", "violations"];
