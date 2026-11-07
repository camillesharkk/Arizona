import type { Question } from "@/lib/types";
import { publishedHiQuestions } from "../data/hi-questions.ts";
import { shuffle } from "./answer-sequence.ts";
import { HI_EXAM, HI_PRACTICE_QUOTAS } from "./hi-site.ts";
import { hiStudyLabel } from "./hi-topics.ts";

export function hiPool(freeOnly = false) {
  return publishedHiQuestions().filter((question) => !freeOnly || question.is_free);
}

const QUICK_TOPICS = [
  "qualification",
  "application-exam",
  "identity",
  "acknowledgment",
  "jurat-oath",
  "certificate-seal",
  "journal",
  "fees-bond",
  "refusal-misconduct",
  "authority",
] as const;

export function pickHiQuickExam(seed: number, pool = hiPool(true)): Question[] {
  const used = new Set<string>();
  const picked: Question[] = [];
  QUICK_TOPICS.forEach((topic, index) => {
    const hit = shuffle(
      pool.filter((question) => question.study_topic === topic && !used.has(question.question_id)),
      seed + index
    )[0];
    if (!hit) return;
    used.add(hit.question_id);
    picked.push(hit);
  });
  if (picked.length < 10) {
    const rest = shuffle(pool.filter((question) => !used.has(question.question_id)), seed + 17);
    for (const question of rest) {
      if (picked.length === 10) break;
      picked.push(question);
    }
  }
  if (picked.length !== 10) return [];
  return shuffle(picked, seed + 99);
}

/** Site outline of 50 questions. Not an official blueprint. */
export function pickHiFullExam(seed: number, pool = hiPool(true)): Question[] | null {
  const used = new Set<string>();
  const picked: Question[] = [];
  HI_PRACTICE_QUOTAS.forEach((quota, index) => {
    const available = pool.filter((question) => question.study_topic === quota.id && !used.has(question.question_id));
    shuffle(available, seed + index * 17).slice(0, quota.count).forEach((question) => {
      used.add(question.question_id);
      picked.push(question);
    });
  });
  if (picked.length < HI_EXAM.practiceQuestionCount) {
    const rest = shuffle(pool.filter((question) => !used.has(question.question_id)), seed + 41);
    for (const question of rest) {
      if (picked.length === HI_EXAM.practiceQuestionCount) break;
      picked.push(question);
    }
  }
  if (picked.length !== HI_EXAM.practiceQuestionCount) return null;
  return shuffle(picked, seed + 87);
}

export function hiPracticeLabel(id: string) {
  return hiStudyLabel(id);
}
