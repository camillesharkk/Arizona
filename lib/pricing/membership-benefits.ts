import { PRO_DURATION_DAYS, STANDARD_PRICE_CENTS } from "./catalog";
import { EXAM_GUARANTEE_CENTS, LIFETIME_TOTAL_CENTS } from "./lifetime";
import { formatUsd } from "./money";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "../product";

export const standard = formatUsd(STANDARD_PRICE_CENTS);
export const lifetime = formatUsd(LIFETIME_TOTAL_CENTS);
export const guarantee = formatUsd(EXAM_GUARANTEE_CENTS);

export const benefitSymbols = {
  full: { icon: "✓", label: "Included" },
  limited: { icon: "◐", label: "Limited" },
  none: { icon: "×", label: "Not included" },
} as const;

export type BenefitValue = keyof typeof benefitSymbols | { text: string };

export const membershipBenefits: { id: string; label: string; free: BenefitValue; timed: BenefitValue; permanent: BenefitValue }[] = [
  { id: "price", label: "One-time price", free: { text: "$0" }, timed: { text: standard }, permanent: { text: lifetime } },
  { id: "duration", label: "Access duration", free: "none", timed: { text: PRO_DURATION_DAYS + " days" }, permanent: { text: "No expiration" } },
  { id: "bank", label: "Full question banks", free: "limited", timed: "full", permanent: "full" },
  { id: "exams", label: "Practice exams", free: "limited", timed: "full", permanent: "full" },
  { id: "scores", label: "Scores & topic accuracy", free: "full", timed: "full", permanent: "full" },
  { id: "explanations", label: "Answer explanations & sources", free: "full", timed: "full", permanent: "full" },
  { id: "guides", label: "Study guides", free: "full", timed: "full", permanent: "full" },
  { id: "wrong", label: "Wrong answers & favorites", free: "limited", timed: "full", permanent: "full" },
  { id: "daily", label: "Daily Study & readiness", free: "limited", timed: "full", permanent: "full" },
  { id: "cards", label: "Flashcards", free: "limited", timed: "full", permanent: "full" },
  { id: "ai", label: "AI Tutor per day", free: { text: String(AI_LIMIT_FREE) }, timed: { text: String(AI_LIMIT_PRO) }, permanent: { text: String(AI_LIMIT_PRO) } },
  { id: "sync", label: "Cloud progress", free: "full", timed: "full", permanent: "full" },
  { id: "email", label: "Weekly progress email", free: "none", timed: "full", permanent: "full" },
  { id: "renewal", label: "Automatic renewal", free: { text: "None" }, timed: { text: "None" }, permanent: { text: "None" } },
  { id: "guarantee", label: "Exam guarantee", free: "none", timed: "none", permanent: { text: guarantee } },
  { id: "discount", label: "Eligible account discount", free: "none", timed: "full", permanent: "none" },
];
