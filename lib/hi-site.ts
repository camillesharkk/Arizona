import { paths } from "./paths.ts";

/** Hawaii practice settings. Official blanks stay unknown. */
export const HI_EXAM = {
  checkedOn: "2026-11-07",
  /** HAR §5-11-32. Not a site-made cutoff. */
  officialPassingPercent: 80,
  officialQuestionCount: null as number | null,
  officialTimeLimitMinutes: null as number | null,
  officialItemType: null as string | null,
  officialUnscoredCount: null as number | null,
  officialWeights: null as string | null,
  /** This site's comprehensive practice. Not an official exam form. */
  practiceQuestionCount: 50,
  practiceTimed: false,
  practiceTargetPercent: 80,
  practiceName: "Comprehensive Practice",
  practiceNote: "This 50-question set is this site's practice setting.",
  studyCutoff: 8,
  sources: {
    ag: "https://ag.hawaii.gov/notaries-public/",
    documents: "https://ag.hawaii.gov/notaries-public/notaries-public-documents/",
    manual: "https://ag.hawaii.gov/wp-content/uploads/2023/04/Notary-Manual-website-version-2023_AG-website_updated-2023-04-14.pdf",
    har: "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
    statutes: "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/",
    resources: "https://notary.ehawaii.gov/notary/public/resources.html",
    scheduler: "https://notary.ehawaii.gov/notary/public/notary-scheduler.html",
    faq: "https://notary.ehawaii.gov/notary/public/faq.html",
    apply: "https://notary.ehawaii.gov/notary/",
  },
} as const;

export const hiPaths = {
  home: "/hawaii/",
  practice: "/hawaii/practice/",
  questions: "/hawaii/questions/",
  study: "/hawaii/study-guide/",
  studyCards: "/hawaii/study-cards/",
  mistakes: "/hawaii/wrong-answers/",
  daily: "/hawaii/daily-study/",
  resources: "/hawaii/resources/",
  examGuide: "/hawaii/exam-guide/",
  passingScore: "/hawaii/passing-score/",
  laws: "/hawaii/laws/",
  become: "/hawaii/become-a-notary/",
  pricing: "/hawaii/pricing/",
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

export function isHawaiiPath(pathname: string) {
  return pathname === "/hawaii" || pathname.startsWith("/hawaii/");
}

/** Site draw for Comprehensive Practice. Not an official blueprint. */
export const HI_PRACTICE_QUOTAS = [
  { id: "qualification", count: 4 },
  { id: "application-exam", count: 4 },
  { id: "term-renewal", count: 4 },
  { id: "authority", count: 3 },
  { id: "identity", count: 4 },
  { id: "acknowledgment", count: 4 },
  { id: "jurat-oath", count: 3 },
  { id: "certificate-seal", count: 4 },
  { id: "journal", count: 4 },
  { id: "documents", count: 3 },
  { id: "fees-bond", count: 4 },
  { id: "refusal-misconduct", count: 3 },
  { id: "authentication", count: 2 },
  { id: "remote-online", count: 4 },
] as const;
