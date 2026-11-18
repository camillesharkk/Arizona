// Publish a new version with up to three major changes. Say what changed and how it helps.
export const latestSiteUpdate = {
  version: "2026-11-18-practice-daily-study-lifetime",
  highlights: [
    "You can move between practice questions without scrolling past the explanation. We’ll also ask you to confirm before submitting a test with unanswered questions.",
    "Daily Study shows your missed questions by state and what’s due for review, so it’s easier to pick up where you left off.",
    "Lifetime Pro is now available for a one-time payment of $29.99. It covers every state we offer now or add later, with no expiration.",
  ] as const satisfies readonly [string, string?, string?],
} as const;
