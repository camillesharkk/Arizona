import {
  LIST_PRICE_CENTS,
  MAX_CREDITS_PER_ORDER,
  MIN_OUT_OF_POCKET_CENTS,
  NEWCOMER_PRICE_CENTS,
  REFERRAL_CREDIT_CENTS,
  REFERRAL_PERCENT,
  STANDARD_PRICE_CENTS,
} from "./catalog.ts";
import { applyPercent } from "./money.ts";

export type PriceEligibility = {
  newcomerEligible: boolean;
  newcomerExpiresAt: string | null;
  referralDiscountEligible: boolean;
  applyCredit: boolean;
  availableCreditCount: number;
  requestedCreditCount?: number;
};

export type PriceBreakdown = {
  listPriceCents: number;
  standardPriceCents: number;
  newcomerEligible: boolean;
  newcomerExpiresAt: string | null;
  newcomerApplied: boolean;
  newcomerDiscountCents: number;
  referralEligible: boolean;
  referralApplied: boolean;
  referralDiscountCents: number;
  referralCreditAvailable: number;
  maxApplicableCredits: number;
  creditsAppliedCount: number;
  creditApplied: boolean;
  creditCents: number;
  baseAppliedPriceCents: number;
  subtotalBeforeCreditCents: number;
  finalPriceCents: number;
};

export function maxApplicableCredits(subtotalCents: number, availableCount: number): number {
  const cap = Math.min(MAX_CREDITS_PER_ORDER, Math.max(0, Math.floor(availableCount)));
  let n = 0;
  while (n < cap) {
    const next = subtotalCents - (n + 1) * REFERRAL_CREDIT_CENTS;
    if (next < MIN_OUT_OF_POCKET_CENTS) break;
    n += 1;
  }
  return n;
}

export function calculatePrice(el: PriceEligibility): PriceBreakdown {
  const newcomerApplied = el.newcomerEligible;
  const baseAppliedPriceCents = newcomerApplied ? NEWCOMER_PRICE_CENTS : STANDARD_PRICE_CENTS;
  const newcomerDiscountCents = newcomerApplied ? LIST_PRICE_CENTS - baseAppliedPriceCents : 0;

  const referralApplied = el.referralDiscountEligible;
  const subtotalBeforeCreditCents = referralApplied
    ? applyPercent(baseAppliedPriceCents, REFERRAL_PERCENT)
    : baseAppliedPriceCents;
  const referralDiscountCents = referralApplied ? baseAppliedPriceCents - subtotalBeforeCreditCents : 0;

  const maxApplicable = maxApplicableCredits(subtotalBeforeCreditCents, el.availableCreditCount);
  const requested = el.applyCredit ? (el.requestedCreditCount ?? maxApplicable) : 0;
  const creditsAppliedCount = Math.min(Math.max(0, Math.floor(requested)), maxApplicable);
  const creditCents = creditsAppliedCount * REFERRAL_CREDIT_CENTS;
  const finalPriceCents = subtotalBeforeCreditCents - creditCents;

  return {
    listPriceCents: LIST_PRICE_CENTS,
    standardPriceCents: STANDARD_PRICE_CENTS,
    newcomerEligible: el.newcomerEligible,
    newcomerExpiresAt: el.newcomerExpiresAt,
    newcomerApplied,
    newcomerDiscountCents,
    referralEligible: el.referralDiscountEligible,
    referralApplied,
    referralDiscountCents,
    referralCreditAvailable: el.availableCreditCount,
    maxApplicableCredits: maxApplicable,
    creditsAppliedCount,
    creditApplied: creditsAppliedCount > 0,
    creditCents,
    baseAppliedPriceCents,
    subtotalBeforeCreditCents,
    finalPriceCents,
  };
}
