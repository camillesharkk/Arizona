import {
  LIST_PRICE_CENTS,
  NEWCOMER_PERCENT,
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
  creditApplied: boolean;
  creditCents: number;
  baseAppliedPriceCents: number;
  subtotalBeforeCreditCents: number;
  finalPriceCents: number;
};

export function calculatePrice(el: PriceEligibility): PriceBreakdown {
  const newcomerApplied = el.newcomerEligible;
  const baseAppliedPriceCents = newcomerApplied
    ? applyPercent(LIST_PRICE_CENTS, NEWCOMER_PERCENT)
    : STANDARD_PRICE_CENTS;
  const newcomerDiscountCents = newcomerApplied ? LIST_PRICE_CENTS - baseAppliedPriceCents : 0;

  const referralApplied = el.referralDiscountEligible;
  const subtotalBeforeCreditCents = referralApplied
    ? applyPercent(baseAppliedPriceCents, REFERRAL_PERCENT)
    : baseAppliedPriceCents;
  const referralDiscountCents = referralApplied ? baseAppliedPriceCents - subtotalBeforeCreditCents : 0;

  const canApplyCredit = el.applyCredit && el.availableCreditCount > 0;
  const creditCents = canApplyCredit ? REFERRAL_CREDIT_CENTS : 0;
  const finalPriceCents = Math.max(0, subtotalBeforeCreditCents - creditCents);

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
    creditApplied: canApplyCredit,
    creditCents,
    baseAppliedPriceCents,
    subtotalBeforeCreditCents,
    finalPriceCents,
  };
}
