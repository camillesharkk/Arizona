import { paths } from "./paths.ts";

/** Live states on arizonanotaryprep.com. Texas stays on its own app. */
export const LIVE_STATES = ["AZ", "CA"] as const;
export type LiveState = (typeof LIVE_STATES)[number];

export const caPaths = {
  home: "/california/",
  practice: "/california/practice/",
  questions: "/california/questions/",
  study: "/california/study-guide/",
  studyCards: "/california/study-cards/",
  mistakes: "/california/wrong-answers/",
  daily: "/california/daily-study/",
  resources: "/california/resources/",
  examGuide: "/california/exam-guide/",
  passingScore: "/california/passing-score/",
  laws: "/california/laws/",
  become: "/california/become-a-notary/",
  pricing: "/california/pricing/",
  login: paths.login,
  register: paths.register,
  privacy: paths.privacy,
  terms: paths.terms,
  refund: paths.refund,
  disclaimer: paths.disclaimer,
  contact: paths.contact,
  account: paths.account,
  dashboard: paths.dashboard,
};

export const CA_EXAM = {
  questionCount: 45,
  scoredCount: 40,
  unscoredCount: 5,
  timeLimitMinutes: 60,
  /** In-site study cutoff for the 10-question check. Not an official scaled score. */
  studyCutoff: 8,
  quotas: [
    { area: "administration", label: "Administrative procedures", count: 5 },
    { area: "acts", label: "Notarial acts and documents", count: 12 },
    { area: "identity", label: "Identification and subscribing witness notarizations", count: 4 },
    { area: "immigration", label: "Immigration and foreign language", count: 4 },
    { area: "violations", label: "Misconduct and fees", count: 15 },
  ] as const,
  sources: {
    handbook: "https://www.sos.ca.gov/notary/handbook",
    handbookPdf: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
    qualifications: "https://www.sos.ca.gov/notary/qualifications",
    exam: "https://cpshr.us/services/california-notary-exam-2/notary-exam-information/",
    statutes: "https://leginfo.legislature.ca.gov/",
  },
  checkedOn: "2026-11-05",
};

const SWITCH_PAIRS: [string, string][] = [
  [caPaths.practice, paths.practice],
  [caPaths.questions, paths.questions],
  [caPaths.study, paths.study],
  [caPaths.studyCards, paths.studyCards],
  [caPaths.mistakes, paths.mistakes],
  [caPaths.daily, paths.daily],
  [caPaths.resources, paths.resources],
  [caPaths.examGuide, paths.examPrep],
  [caPaths.passingScore, paths.passingScore],
  [caPaths.laws, paths.laws],
  [caPaths.become, paths.become],
  [caPaths.pricing, paths.pricing],
  [caPaths.home, paths.home],
];

export function isCaliforniaPath(pathname: string) {
  return pathname === "/california" || pathname.startsWith("/california/");
}

/** Matching page in the other live state. Drops topic ids, question ids, and exam query. */
export function switchStateHref(pathname: string, target: LiveState) {
  const path = pathname.split("?")[0] || "/";
  const onCa = isCaliforniaPath(path);
  if (target === "CA" && onCa) return path.endsWith("/") ? path : `${path}/`;
  if (target === "AZ" && !onCa) return path || paths.home;
  for (const [ca, az] of SWITCH_PAIRS) {
    if (onCa && (path === ca || path === ca.slice(0, -1))) return target === "AZ" ? az : ca;
    if (!onCa && (path === az || path === az.slice(0, -1))) return target === "CA" ? ca : az;
  }
  return target === "CA" ? caPaths.home : paths.home;
}

export function areaLabel(area: string) {
  return CA_EXAM.quotas.find((item) => item.area === area)?.label || area;
}
