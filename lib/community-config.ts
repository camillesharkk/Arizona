export const communityLimits = {
  nicknameMin: 2,
  nicknameMax: 32,
  postTitleMax: 100,
  postBodyMax: 1600,
  postsPerMinute: 20,
  postingWindowSeconds: 60,
  duplicateSeconds: 10,
  reportNoteMax: 300,
} as const;

export const communityReportReasons = ["spam", "harassment", "scam", "other"] as const;
export type CommunityReportReason = (typeof communityReportReasons)[number];
