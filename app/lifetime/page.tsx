import Link from "next/link";
import { stateByCode } from "@/lib/states";
import { LIVE_STATES } from "@/lib/ca-site";
import { pageMeta } from "@/lib/seo";
import { EXAM_GUARANTEE_CENTS, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { LifetimeGuaranteeTerms } from "@/components/LifetimeGuaranteeTerms";
import { CheckoutButton } from "@/components/CheckoutButton";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";
import { TAX_CHECKOUT_NOTICE } from "@/lib/pricing/copy";
export const metadata = pageMeta({
  title: `Lifetime Pro — ${formatUsd(LIFETIME_TOTAL_CENTS)} All-State Access`,
  description:
    `One payment for Lifetime Pro with no automatic renewal. The ${formatUsd(EXAM_GUARANTEE_CENTS)} exam guarantee fee is refundable after a qualifying failed official exam.`,
  path: "/lifetime/",
});
export default async function LifetimePage() {
  const lifetimeAvailable = await getLifetimeCheckoutAvailability();
  return (
    <main className="wrap hero pricing-page">
      <h1>Lifetime Pro</h1>
      <p className="lede">
        {formatUsd(LIFETIME_TOTAL_CENTS)} USD once · No expiration · No automatic renewal
      </p>
      <section className="card guide-chapter" id="lifetime-checkout" aria-labelledby="lifetime-checkout-heading">
        <h2 id="lifetime-checkout-heading">Lifetime Pro Checkout</h2>
        <CheckoutButton productCode={LIFETIME_PRO_PRODUCT_CODE} checkoutAvailable={lifetimeAvailable} lifetimePage
          belowCta={<p className="notice">{TAX_CHECKOUT_NOTICE}</p>} />
      </section>
      <section className="card pricing-policy-card guide-chapter" id="refund-policy" aria-labelledby="lifetime-terms-heading">
        <h2 id="lifetime-terms-heading">Lifetime Pro Exam Guarantee</h2>
        <LifetimeGuaranteeTerms />
      </section>
      <section className="card pricing-policy-card">
        <h2>What’s included</h2>
        <p>
          Full question banks and repeat full practice where available, weak-area
          training, wrong-answer review, full flashcards, readiness and study
          planning tools, cross-device progress and the Pro daily AI allowance.
          Features follow each state’s available preparation format.
        </p>
        <h2 className="guide-chapter" id="included-states">Included states</h2>
        <p>
          {LIVE_STATES.map(
            (code) => `${stateByCode(code)?.name ?? code} (${code})`,
          ).join(" · ")}
        </p>
        <p>
          One account covers all {LIVE_STATES.length} available states,
          including future states as they become available.
        </p>
        <p>
          Independent exam preparation. State applications, official exams,
          required training, commissions and government fees are separate.
        </p>
      </section>
      <p>
        <Link href="/pricing/#lifetime-checkout">Compare both Pro checkouts</Link>
      </p>
    </main>
  );
}
