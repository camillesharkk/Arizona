export type AffiliateOffer = {
  id: string;
  name: string;
  urlKey: "nna" | "notaryNet" | "npu" | "other";
  price: string;
  course: string;
  practiceTest: string;
  studyGuide: string;
  stateSpecific: string;
  certificate: string;
  support: string;
  refund: string;
  bestFor: string;
  badge?: "Our Pick" | "Best Value";
  summary: string;
  pros: string[];
  cons: string[];
};

export const affiliateLinks = {
  nna: process.env.NEXT_PUBLIC_AFFILIATE_NNA || "https://www.nationalnotary.org/",
  notaryNet: process.env.NEXT_PUBLIC_AFFILIATE_NOTARYNET || "https://www.notary.net/",
  npu: process.env.NEXT_PUBLIC_AFFILIATE_NPU || "https://www.notarypublicunderwriters.com/",
  other: process.env.NEXT_PUBLIC_AFFILIATE_OTHER || "https://azsos.gov/business/notary",
};

export const affiliateOffers: AffiliateOffer[] = [
  {
    id: "nna",
    name: "National Notary Association",
    urlKey: "nna",
    price: "Membership + course (verify live)",
    course: "National notary education, supplies, and news",
    practiceTest: "Practice materials vary by product",
    studyGuide: "Handbook-style education",
    stateSpecific: "National overlay; Arizona rules still come from SOS",
    certificate: "NNA credentials are not an Arizona commission",
    support: "Member support",
    refund: "See NNA policy",
    bestFor: "Notaries who want a national association after commissioning",
    badge: "Our Pick",
    summary: "Useful after you pass Arizona's official process. It does not replace the SOS exam or commission.",
    pros: ["Large national footprint", "Supplies and education ecosystem"],
    cons: ["Not the Arizona official exam", "Membership cost is extra"],
  },
  {
    id: "notary-net",
    name: "Notary.net",
    urlKey: "notaryNet",
    price: "Course packages (verify live)",
    course: "Online notary training products",
    practiceTest: "Vendor practice, not SOS",
    studyGuide: "Vendor study content",
    stateSpecific: "Confirm Arizona coverage before you buy",
    certificate: "Completion is not a commission",
    support: "Vendor support",
    refund: "See vendor policy",
    bestFor: "Learners comparing paid video courses",
    summary: "A commercial training option. Always map lessons back to Arizona statutes and the SOS handbook.",
    pros: ["Structured course format", "Useful as a supplement"],
    cons: ["May mix multi-state content", "Does not file your Arizona application"],
  },
  {
    id: "npu",
    name: "Notary Public Underwriters",
    urlKey: "npu",
    price: "Bond / E&O quotes (verify live)",
    course: "Bond and insurance more than exam prep",
    practiceTest: "Limited or none",
    studyGuide: "Not a full exam platform",
    stateSpecific: "Bond products must match Arizona penal sum",
    certificate: "Bond is not a commission",
    support: "Issuer support",
    refund: "See issuer policy",
    bestFor: "Applicants shopping the required bond after the exam",
    badge: "Best Value",
    summary: "Compare for the statutory bond and optional E&O. Shop after you know you will apply.",
    pros: ["Focus on required surety", "Common next step after passing"],
    cons: ["Not an exam-prep substitute", "Insurance is optional, bond is not"],
  },
];
