export const inPaths = {
  home: "/indiana/",
  practice: "/indiana/practice/",
  questions: "/indiana/questions/",
  study: "/indiana/study-guide/",
  studyCards: "/indiana/study-cards/",
  mistakes: "/indiana/wrong-answers/",
  daily: "/indiana/daily-study/",
  resources: "/indiana/resources/",
  examGuide: "/indiana/exam-guide/",
  passingScore: "/indiana/passing-score/",
  laws: "/indiana/laws/",
  become: "/indiana/become-a-notary/",
  pricing: "/indiana/pricing/",
  login: "/login/",
};
export function isIndianaPath(path: string) { return path === "/indiana" || path.startsWith("/indiana/"); }

/** Source-confirmed official facts; unknown fields remain null. */
export const IN_OFFICIAL_EXAM = { questionCount: 30, passingCorrect: 24, timeLimitMinutes: null, optionCount: null, checkedOn: "2026-11-13", source: "https://www.in.gov/sos/business/files/New-Notary-System-FAQs-5-4-26.pdf", publishedOn: "2026-05-04" } as const;
/** Site settings, independent of official rules. */
export const IN_PRACTICE = { questionCount: 30, timeLimitMinutes: null, optionCount: 4, quickCount: 10 } as const;
export function indianaReference(correct: number) { return { atReference: correct >= IN_OFFICIAL_EXAM.passingCorrect, gap: Math.max(0, IN_OFFICIAL_EXAM.passingCorrect - correct), percentage: Math.round(correct / IN_PRACTICE.questionCount * 100) }; }

/** At least two answered observations; show at most two actionable weak topics. */
export function indianaWeakTopics<T extends { id: string; right: number; total: number }>(topics: T[]): T[] { return topics.filter(t => t.total >= 2 && t.right < t.total).sort((a,b) => a.right/a.total - b.right/b.total || (b.total-b.right)-(a.total-a.right) || a.id.localeCompare(b.id)).slice(0,2); }
