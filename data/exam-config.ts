export const examConfig = {
  state: "Arizona",
  stateCode: "AZ",
  year: 2026,
  questionCount: 45,
  timeLimitMinutes: 60,
  passingScorePercent: 80,
  openBook: true,
  lastVerifiedAt: "2026-08-01",
  officialExamUrl: "https://azsos.gov/business/notary",
  officialManualUrl: "https://azsos.gov/business/notary",
  commissionTermYears: 4,
  bondAmountUsd: 5000,
  applicationFeeUsd: 43,
  examFeeNote: "Confirm current fee on the official SOS page before applying.",
  disclaimer:
    "Study material on this site is independently written for exam practice. Fees, passing scores, and procedures can change. Always verify against the Arizona Secretary of State before you apply or notarize.",
};

export const topics = [
  { id: "commission", label: "Commission & Eligibility", short: "Commission" },
  { id: "identification", label: "Identification", short: "ID" },
  { id: "acknowledgments", label: "Acknowledgments", short: "Acknowledgments" },
  { id: "jurats", label: "Jurats & Oaths", short: "Jurats" },
  { id: "journals", label: "Journals", short: "Journals" },
  { id: "seals-fees", label: "Seal, Stamp & Fees", short: "Fees" },
  { id: "prohibited-acts", label: "Prohibited Acts", short: "Prohibited" },
  { id: "new-laws", label: "2026 Law Updates", short: "New Laws" },
] as const;

export type TopicId = (typeof topics)[number]["id"];
