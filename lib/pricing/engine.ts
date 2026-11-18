import {
  LIST_PRICE_CENTS,
  MAX_CREDITS_PER_ORDER,
  MIN_OUT_OF_POCKET_CENTS,
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

export type MembershipPrice = {
  listPriceCents: number;
  standardPriceCents: number;
  protectedGuaranteeCents?: number;
};

const defaultMembershipPrice: MembershipPrice = {
  listPriceCents: LIST_PRICE_CENTS,
  standardPriceCents: STANDARD_PRICE_CENTS,
};

/** Apply account promotions to access charges, preserving any guarantee charge. */
export function calculatePrice(el: PriceEligibility, price: MembershipPrice = defaultMembershipPrice): PriceBreakdown {
  const guaranteeCents = price.protectedGuaranteeCents ?? 0;
  if (![price.listPriceCents, price.standardPriceCents, guaranteeCents].every(Number.isSafeInteger)
    || guaranteeCents < 0 || price.standardPriceCents < guaranteeCents || price.listPriceCents < price.standardPriceCents) {
    throw new Error("invalid_membership_price");
  }
  const accessCents = price.standardPriceCents - guaranteeCents;
  const newcomerApplied = el.newcomerEligible;
  const memberAccessCents = newcomerApplied ? applyPercent(accessCents, NEWCOMER_PERCENT) : accessCents;
  const baseAppliedPriceCents = memberAccessCents + guaranteeCents;
  const newcomerDiscountCents = newcomerApplied ? price.listPriceCents - baseAppliedPriceCents : 0;

  const referralApplied = el.referralDiscountEligible;
  const subtotalBeforeCreditCents = referralApplied
    ? applyPercent(memberAccessCents, REFERRAL_PERCENT) + guaranteeCents
    : baseAppliedPriceCents;
  const referralDiscountCents = referralApplied ? baseAppliedPriceCents - subtotalBeforeCreditCents : 0;

  const creditableSubtotal = Math.max(0, subtotalBeforeCreditCents - guaranteeCents);
  const maxApplicable = maxApplicableCredits(creditableSubtotal, el.availableCreditCount);
  const requested = el.applyCredit ? (el.requestedCreditCount ?? maxApplicable) : 0;
  const creditsAppliedCount = Math.min(Math.max(0, Math.floor(requested)), maxApplicable);
  const creditCents = creditsAppliedCount * REFERRAL_CREDIT_CENTS;
  const finalPriceCents = subtotalBeforeCreditCents - creditCents;

  return {
    listPriceCents: price.listPriceCents,
    standardPriceCents: price.standardPriceCents,
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
