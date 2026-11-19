export const communityLimits = {
  nicknameMin: 2,
  nicknameMax: 32,
  postTitleMax: 100,
  postBodyMax: 1600,
  postsPerMinute: 3,
  postsPerDay: 30,
  duplicateHours: 24,
  similarityMinLength: 40,
  similarityThreshold: 0.86,
  reviewAtDistinctLinks: 4,
  reportNoteMax: 300,
} as const;

export const communityReportReasons = ["spam", "harassment", "scam", "other"] as const;
export type CommunityReportReason = (typeof communityReportReasons)[number];
