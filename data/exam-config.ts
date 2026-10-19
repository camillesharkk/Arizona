/**
 * Practice-simulator settings for this website.
 * Official exam figures live in `officialExam` and can diverge from these.
 */
export const examConfig = {
  state: "Arizona",
  stateCode: "AZ",
  year: 2026,
  questionCount: 45,
  timeLimitMinutes: 60,
  passingScorePercent: 80,
  openBook: true,
  lastVerifiedAt: "2026-10-19",
  officialExamUrl: "https://azsos.gov/business/notary-public/new-notary",
  officialFilingUrl: "https://azsos.gov/business/notary",
  officialManualUrl: "https://azsos.gov/sites/default/files/docs/Notary-Manual-Aug-2026.pdf",
  commissionTermYears: 4,
  bondAmountUsd: 5000,
  applicationFeeUsd: 43,
  examFeeUsd: 35,
  examFeeNote:
    "Checked 2026-10-19: the SOS exam notice lists $35 for every proctored exam. The SOS notary filing page lists a $43 standard application fee. The $5,000 figure is the surety bond amount in A.R.S. § 41-269(D), not a fee paid to the state.",
  disclaimer:
    "Study material on this site is independently written for exam practice. Fees, passing scores, and procedures can change. Always verify against the Arizona Secretary of State before you apply or notarize.",
};

/** Figures read from current official pages. Not this site's practice settings. */
export const officialExam = {
  checkedOn: "2026-10-19",
  noticeUrl: "https://azsos.gov/business/notary-public/new-notary",
  filingUrl: "https://azsos.gov/business/notary",
  statuteUrl: "https://www.azleg.gov/ars/41/00270.htm",
  commissionStatuteUrl: "https://www.azleg.gov/ars/41/00269.htm",
  questionCount: 45,
  timeLimitMinutes: 60,
  passingScorePercent: 80,
  examFeeUsd: 35,
  applicationFeeUsd: 43,
  nsfFeeUsd: 25,
  attemptsBeforeWait: 3,
  waitDaysAfterLimit: 30,
  manualTitle: "2026 Notary Public Reference Manual",
  provider: "Pearson",
  legacyProviderStillOnPage: "Prometric",
  requiredSince: "2025-07-01",
  bondUsd: 5000,
  commissionYears: 4,
} as const;

export const officialExamChecked =
  "Exam notice read on the Arizona Secretary of State New Notary page and the Notary filing page on October 19, 2026. That notice says Pearson, 45 questions, 60 minutes, 80% to pass, $35 for every proctored exam, three attempts, then a 30-day wait, with the manual built into the exam. The same pages still include an older Prometric registration block. A.R.S. § 41-270, read the same day, authorizes the exam and does not set the question count, time, or passing score. The $43 figure on the filing page is the standard commission application fee, not the exam fee. Check the live pages before you pay or book.";

export const topics = [
  { id: "commission", label: "Commission & Eligibility", short: "Commission" },
  { id: "identification", label: "Identification", short: "ID" },
  { id: "acknowledgments", label: "Acknowledgments", short: "Acknowledgments" },
  { id: "jurats", label: "Jurats & Oaths", short: "Jurats" },
  { id: "journals", label: "Journals", short: "Journals" },
  { id: "seals-fees", label: "Seal, Stamp & Fees", short: "Fees" },
  { id: "prohibited-acts", label: "Prohibited Acts", short: "Prohibited" },
  { id: "new-laws", label: "2026 Law Updates", short: "New Laws" },
  { id: "copy-certification", label: "Copy Certification", short: "Copies" },
  { id: "electronic-ron", label: "Electronic & RON", short: "RON" },
] as const;

export type TopicId = (typeof topics)[number]["id"];
