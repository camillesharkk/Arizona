import type { QuestionStat } from "./store/types.ts";

/** Practical spacing, not a claim about an individual's forgetting curve. */
export const REVIEW_INTERVALS_MS = [
  10 * 60 * 1000,
  24 * 60 * 60 * 1000,
  3 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
] as const;

export type ReviewFields = Pick<
  QuestionStat,
  | "wrongCount"
  | "rightCount"
  | "reviewCount"
  | "consecutiveCorrect"
  | "reviewStage"
  | "lastWrongAt"
  | "lastReviewedAt"
  | "nextReviewAt"
>;

export function applyReviewAnswer(
  prev: ReviewFields | null,
  input: { correct: boolean; review: boolean; now: string }
): ReviewFields {
  const nowMs = Date.parse(input.now);
  const base: ReviewFields = {
    wrongCount: prev?.wrongCount ?? 0,
    rightCount: prev?.rightCount ?? 0,
    reviewCount: prev?.reviewCount ?? 0,
    consecutiveCorrect: prev?.consecutiveCorrect ?? 0,
    reviewStage: prev?.reviewStage ?? 0,
    lastWrongAt: prev?.lastWrongAt ?? null,
    lastReviewedAt: prev?.lastReviewedAt ?? null,
    nextReviewAt: prev?.nextReviewAt ?? null,
  };
  if (!input.correct) {
    return {
      ...base,
      wrongCount: base.wrongCount + 1,
      consecutiveCorrect: 0,
      reviewStage: 0,
      lastWrongAt: input.now,
      nextReviewAt: new Date(nowMs + REVIEW_INTERVALS_MS[0]).toISOString(),
    };
  }
  const next: ReviewFields = { ...base, rightCount: base.rightCount + 1 };
  if (!input.review) return next;
  const due = !base.nextReviewAt || Date.parse(base.nextReviewAt) <= nowMs;
  next.lastReviewedAt = input.now;
  if (!due) return next;
  const stage = Math.min(base.reviewStage + 1, REVIEW_INTERVALS_MS.length - 1);
  next.reviewStage = stage;
  next.consecutiveCorrect = base.consecutiveCorrect + 1;
  next.reviewCount = base.reviewCount + 1;
  next.nextReviewAt = new Date(nowMs + REVIEW_INTERVALS_MS[stage]).toISOString();
  return next;
}

export function isDue(stat: Pick<QuestionStat, "nextReviewAt">, now: number) {
  return Boolean(stat.nextReviewAt) && Date.parse(stat.nextReviewAt as string) <= now;
}

export function compareMistakes(a: QuestionStat, b: QuestionStat, now: number) {
  const dueA = isDue(a, now) ? 0 : 1;
  const dueB = isDue(b, now) ? 0 : 1;
  if (dueA !== dueB) return dueA - dueB;
  if (a.wrongCount !== b.wrongCount) return b.wrongCount - a.wrongCount;
  const nextA = a.nextReviewAt || "";
  const nextB = b.nextReviewAt || "";
  if (nextA !== nextB) return nextA < nextB ? -1 : 1;
  return a.questionId < b.questionId ? -1 : a.questionId > b.questionId ? 1 : 0;
}
