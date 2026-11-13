import { ctPaths, isConnecticutPath } from "./ct-site";
import { ncPaths, isNorthCarolinaPath } from "./nc-site.ts";
import { inPaths, isIndianaPath } from "./in-site.ts";
import { nyPaths, isNewYorkPath } from "./ny-site.ts";
import { paPaths, isPennsylvaniaPath } from "./pa-site.ts";
import { laPaths, isLouisianaPath } from "./la-site.ts";
import { hiPaths, isHawaiiPath } from "./hi-site.ts";
import { paths } from "./paths.ts";

/** Live states on arizonanotaryprep.com. Texas stays on its own app. */
export const LIVE_STATES = ["AZ", "CA", "HI", "NY", "PA", "LA", "CT", "NC", "IN"] as const;
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
  checkedOn: "2026-11-07",
};

export function isCaliforniaPath(pathname: string) {
  return pathname === "/california" || pathname.startsWith("/california/");
}

const SWITCH_FEATURES = ["practice", "questions", "study", "studyCards", "mistakes", "daily", "resources", "examGuide", "passingScore", "laws", "become", "pricing", "home"] as const;

function switchBundle(code: LiveState) {
  if (code === "NC") return ncPaths;
  if (code === "IN") return inPaths;
  if (code === "CA") return caPaths;
  if (code === "HI") return hiPaths;
  if (code === "NY") return nyPaths;
  if (code === "PA") return paPaths;
  if (code === "CT") return ctPaths;
  if (code === "LA") return laPaths;
  return {
    practice: paths.practice,
    questions: paths.questions,
    study: paths.study,
    studyCards: paths.studyCards,
    mistakes: paths.mistakes,
    daily: paths.daily,
    resources: paths.resources,
    examGuide: paths.examPrep,
    passingScore: paths.passingScore,
    laws: paths.laws,
    become: paths.become,
    pricing: paths.pricing,
    home: paths.home,
  };
}

/** Matching page in another live state. Drops topic ids, question ids, and exam query. */
export function switchStateHref(pathname: string, target: LiveState) {
  const path = pathname.split("?")[0] || "/";
  const current: LiveState = isIndianaPath(path) ? "IN" : isNorthCarolinaPath(path) ? "NC" : isConnecticutPath(path) ? "CT" : isLouisianaPath(path) ? "LA" : isPennsylvaniaPath(path) ? "PA" : isNewYorkPath(path) ? "NY" : isHawaiiPath(path) ? "HI" : isCaliforniaPath(path) ? "CA" : "AZ";
  if (current === target) return path.endsWith("/") ? path : `${path}/`;
  const here = switchBundle(current);
  const there = switchBundle(target);
  for (const feature of SWITCH_FEATURES) {
    const value = here[feature];
    if (path === value || path === value.slice(0, -1)) return there[feature];
  }
  return there.home;
}

export function areaLabel(area: string) {
  return CA_EXAM.quotas.find((item) => item.area === area)?.label || area;
}
