// Publish a new version with up to three major changes. Say what changed and how it helps.
export const latestSiteUpdate = {
  version: "2026-11-19-community-insights",
  highlights: [
    "Community Insights is now in the main menu, at the end of Quick 10, and in Daily Study. You can compare how others prepared while your own practice is still fresh.",
    "Browse more than 50 reviewed public posts with links to related practice. You can also share what helped you, or like and reply to other learners’ posts.",
  ] as const satisfies readonly [string, string?, string?],
} as const;
