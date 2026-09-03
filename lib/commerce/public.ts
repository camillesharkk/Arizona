import type { PriceBreakdown } from "../pricing/engine.ts";
import { formatUsd } from "../pricing/money.ts";

export function publicBreakdown(b: PriceBreakdown) {
  return {
    listPriceCents: b.listPriceCents,
    standardPriceCents: b.standardPriceCents,
    newcomerEligible: b.newcomerEligible,
    newcomerExpiresAt: b.newcomerExpiresAt,
    newcomerApplied: b.newcomerApplied,
    newcomerDiscountCents: b.newcomerDiscountCents,
    referralEligible: b.referralEligible,
    referralApplied: b.referralApplied,
    referralDiscountCents: b.referralDiscountCents,
    referralCreditAvailable: b.referralCreditAvailable,
    maxApplicableCredits: b.maxApplicableCredits,
    creditsAppliedCount: b.creditsAppliedCount,
    creditApplied: b.creditApplied,
    creditCents: b.creditCents,
    baseAppliedPriceCents: b.baseAppliedPriceCents,
    subtotalBeforeCreditCents: b.subtotalBeforeCreditCents,
    finalPriceCents: b.finalPriceCents,
    display: {
      standard: formatUsd(b.standardPriceCents),
      newcomer: b.newcomerApplied ? formatUsd(b.baseAppliedPriceCents) : null,
      subtotal: formatUsd(b.subtotalBeforeCreditCents),
      credit: b.creditApplied ? formatUsd(b.creditCents) : null,
      final: formatUsd(b.finalPriceCents),
    },
  };
}
