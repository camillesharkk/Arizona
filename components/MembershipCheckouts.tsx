import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { CheckoutButton } from "@/components/CheckoutButton";
import { LifetimeGuaranteeTerms } from "@/components/LifetimeGuaranteeTerms";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import type { StateCode } from "@/lib/types";
import { ONE_TIME_DISCOUNT_NOTICE } from "@/lib/pricing/copy";

export function MembershipCheckouts({ source, timedNotes }: {
  source?: StateCode;
  timedNotes?: ReactNode;
}) {
  return (
    <div className="membership-checkouts">
      <section className="card" id="pro-checkout" aria-labelledby="pro-checkout-heading">
        <h2 id="pro-checkout-heading">60-Day Pro Checkout</h2>
        <Suspense fallback={<p>Loading checkout…</p>}>
          <CheckoutButton sourceState={source} belowCta={timedNotes} />
        </Suspense>
      </section>
      <section className="card" id="lifetime-checkout" aria-labelledby="lifetime-checkout-heading">
        <h2 id="lifetime-checkout-heading">Lifetime Pro Checkout</h2>
        <div className="pricing-buy">
          <div className="price-summary-card">
            <div className="price-hero">
              <div>
                <p className="price-hero-label">Standard price</p>
                <p className="price-today">{formatUsd(LIFETIME_TOTAL_CENTS)}</p>
              </div>
            </div>
            <dl className="price-breakdown">
              <dt>Lifetime Pro access</dt><dd>{formatUsd(LIFETIME_ACCESS_CENTS)}</dd>
              <dt>Official exam guarantee</dt><dd>{formatUsd(EXAM_GUARANTEE_CENTS)}</dd>
            </dl>
            <p className="price-assurance">One-time payment · All available states · No expiration</p>
          </div>
          <p className="checkout-status">Lifetime purchasing is not open yet.</p>
          <div className="lifetime-purchase-notes">
            <h3>What’s included</h3>
            <ul>
              <li>Full question banks, practice exams, and official sources across available states.</li>
              <li>Wrong-answer review, Daily Study, flashcards, and the Pro daily AI allowance.</li>
              <li>Cross-device progress and access to future states as they become available.</li>
            </ul>
          </div>
          <p className="notice">State applications, official exams, required training, commissions, and government fees are separate.</p>
          <p className="notice">{ONE_TIME_DISCOUNT_NOTICE}</p>
          <section className="card pricing-policy-card" aria-labelledby="lifetime-guarantee-heading">
            <h3 id="lifetime-guarantee-heading">Lifetime Pro Exam Guarantee</h3>
            <LifetimeGuaranteeTerms />
          </section>
          <p className="notice"><Link href="/lifetime/">See the full list of included states</Link></p>
        </div>
      </section>
    </div>
  );
}
