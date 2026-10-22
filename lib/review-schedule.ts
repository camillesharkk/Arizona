import { addCalendarDays } from "./calendar.ts";
import type { QuestionStat } from "./store/types.ts";

/** Calendar-day spacing. Not a claim about an individual's forgetting curve. */
export const REVIEW_INTERVAL_DAYS = [1, 7, 14, 30] as const;
export const DEFAULT_STUDY_TIME_ZONE = "America/Phoenix";

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
  | "reviewPlan"
>;

function blank(prev: ReviewFields | null): ReviewFields {
  return {
    wrongCount: prev?.wrongCount ?? 0,
    rightCount: prev?.rightCount ?? 0,
    reviewCount: prev?.reviewCount ?? 0,
    consecutiveCorrect: prev?.consecutiveCorrect ?? 0,
    reviewStage: prev?.reviewStage ?? 0,
    lastWrongAt: prev?.lastWrongAt ?? null,
    lastReviewedAt: prev?.lastReviewedAt ?? null,
    nextReviewAt: prev?.nextReviewAt ?? null,
    reviewPlan: "v2",
  };
}

export function scheduleReview(fromIso: string, stage: number, timeZone: string) {
  const index = Math.min(Math.max(stage, 0), REVIEW_INTERVAL_DAYS.length - 1);
  return addCalendarDays(fromIso, REVIEW_INTERVAL_DAYS[index], timeZone);
}

export function applyReviewAnswer(
  prev: ReviewFields | null,
  input: { correct: boolean; review: boolean; now: string; timeZone?: string }
): ReviewFields {
  const timeZone = input.timeZone || DEFAULT_STUDY_TIME_ZONE;
  const base = blank(prev);
  if (!input.correct) {
    return {
      ...base,
      wrongCount: base.wrongCount + 1,
      consecutiveCorrect: 0,
      reviewStage: 0,
      lastWrongAt: input.now,
      nextReviewAt: scheduleReview(input.now, 0, timeZone),
    };
  }
  const next: ReviewFields = { ...base, rightCount: base.rightCount + 1 };
  if (!input.review) {
    if (!base.nextReviewAt) next.nextReviewAt = scheduleReview(input.now, 0, timeZone);
    return next;
  }
  const due = !base.nextReviewAt || Date.parse(base.nextReviewAt) <= Date.parse(input.now);
  next.lastReviewedAt = input.now;
  if (!due) return next;
  const stage = Math.min(base.reviewStage + 1, REVIEW_INTERVAL_DAYS.length - 1);
  next.reviewStage = stage;
  next.consecutiveCorrect = base.consecutiveCorrect + 1;
  next.reviewCount = base.reviewCount + 1;
  next.nextReviewAt = scheduleReview(input.now, stage, timeZone);
  return next;
}

/**
 * Map the retired 10-minute / 3-day stages onto 1, 7, 14, 30 days.
 * Stage 2 (old 3 days) has no matching interval: the due time stays, and the next successful review uses the new schedule.
 * Already-due rows keep their due time. Not-yet-due 10-minute rows move to one calendar day after the last reset.
 */
export function migrateReviewFields<T extends ReviewFields & { lastAt?: string | null }>(row: T, now: string, timeZone = DEFAULT_STUDY_TIME_ZONE): T {
  if (row.reviewPlan === "v2") return row;
  const oldStage = row.reviewStage ?? 0;
  const stage = oldStage >= 5 ? 3 : oldStage === 4 ? 2 : oldStage === 3 ? 1 : 0;
  let nextReviewAt = row.nextReviewAt;
  const dueAlready = Boolean(nextReviewAt) && Date.parse(nextReviewAt as string) <= Date.parse(now);
  if (!nextReviewAt && (row.wrongCount ?? 0) > 0) {
    nextReviewAt = scheduleReview(row.lastWrongAt || row.lastAt || now, 0, timeZone);
  } else if (oldStage === 0 && nextReviewAt && !dueAlready) {
    nextReviewAt = scheduleReview(row.lastWrongAt || row.lastAt || now, 0, timeZone);
  }
  return { ...row, reviewStage: stage, nextReviewAt, reviewPlan: "v2" };
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
