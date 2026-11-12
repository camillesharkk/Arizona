import type { Question } from "./types.ts";
import { scheduleReview, DEFAULT_STUDY_TIME_ZONE } from "./review-schedule.ts";
import type { QuestionStat } from "./store/types.ts";
import { currentQuestionVersion } from './question-revisions';

export function savedReviewStat(
  prev: QuestionStat | null,
  question: Question,
  input: { userId: string; save: boolean; now: string; timeZone?: string }
): QuestionStat | null {
  const timeZone = input.timeZone || DEFAULT_STUDY_TIME_ZONE;
  if (!input.save && !prev) return null;
  const base: QuestionStat = prev || {
    questionVersion: currentQuestionVersion(question.question_id),
    userId: input.userId,
    questionId: question.question_id,
    topic: question.topic,
    bank: question.state === "CA" ? "california-notary-exam" : question.state === "HI" ? "hawaii-notary-exam" : question.state === "NY" ? "new-york-notary-exam" : question.state === "PA" ? "pennsylvania-notary-exam" : question.state === "LA" ? "louisiana-notary-exam" : "arizona-notary-exam",
    chapter: question.topic,
    state: question.state,
    firstCorrect: null,
    lastCorrect: null,
    wrongCount: 0,
    rightCount: 0,
    reviewCount: 0,
    consecutiveCorrect: 0,
    reviewStage: 0,
    lastWrongAt: null,
    lastReviewedAt: null,
    nextReviewAt: null,
    reviewPlan: "v2",
    lastSelected: null,
    lastCorrectOption: null,
    firstAt: null,
    lastAt: null,
    mastered: false,
    favorited: false,
    savedForReview: false,
  };
  if (input.save) {
    return {
      ...base,
      userId: input.userId,
      savedForReview: true,
      nextReviewAt: base.nextReviewAt || scheduleReview(input.now, base.reviewStage || 0, timeZone),
      reviewPlan: "v2",
    };
  }
  const manualOnly = base.wrongCount <= 0;
  return {
    ...base,
    userId: input.userId,
    savedForReview: false,
    nextReviewAt: manualOnly ? null : base.nextReviewAt,
  };
}
