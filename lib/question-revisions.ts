import type { QuestionStat } from './store/types.ts';

// IDs stay stable. An absent stored version means the original published item.
export const NY_REVISIONS: Record<string, number> = {
  'ny-016': 2, 'ny-017': 2, 'ny-053': 2, 'ny-054': 2, 'ny-055': 2,
  'ny-057': 2, 'ny-060': 2, 'ny-062': 2, 'ny-064': 2,
};
export const PA_REVISIONS: Record<string, number> = {};
export function currentQuestionVersion(id: string) {
  return NY_REVISIONS[id] ?? PA_REVISIONS[id] ?? 1;
}

/** Non-destructive projection: retain the prior record before resetting current mastery. */
export function currentRevisionStat(stat: QuestionStat): QuestionStat {
  const version = currentQuestionVersion(stat.questionId);
  if ((stat.questionVersion ?? 1) >= version) return stat;
  const { revisionHistory = [], ...historical } = stat;
  return {
    ...stat, questionVersion: version,
    revisionHistory: [...revisionHistory, { ...historical, questionVersion: stat.questionVersion ?? 1 }],
    firstCorrect: null, lastCorrect: null, wrongCount: 0, rightCount: 0,
    reviewCount: 0, consecutiveCorrect: 0, reviewStage: 0,
    lastWrongAt: null, lastReviewedAt: null, nextReviewAt: null,
    lastSelected: null, lastCorrectOption: null, firstAt: null, lastAt: null,
    mastered: false,
    // Keep this previously studied item discoverable without calling the new item wrong.
    savedForReview: true,
  };
}
