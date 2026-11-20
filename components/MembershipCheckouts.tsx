import type { ReactNode } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { CheckoutButton } from "@/components/CheckoutButton";
import { LifetimeGuaranteeTerms } from "@/components/LifetimeGuaranteeTerms";
import type { StateCode } from "@/lib/types";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { TAX_CHECKOUT_NOTICE } from "@/lib/pricing/copy";
import { paths } from "@/lib/paths";

export function MembershipCheckouts({ source, timedNotes, lifetimeAvailable }: {
  source?: StateCode;
  timedNotes?: ReactNode;
  lifetimeAvailable: boolean;
}) {
  return (
    <div className="membership-checkouts">
      <section className="card" id="pro-checkout" aria-labelledby="pro-checkout-heading">
        <h2 id="pro-checkout-heading">60-Day Pro Checkout</h2>
        <p className="notice">Share your invite link with a friend. If you qualify for rewards, their first qualifying purchase earns you a $3 credit toward an eligible 60-Day Pro purchase.</p>
        <p><Link className="btn btn-ghost card-action" href={paths.referrals}>Invite &amp; Credits</Link></p>
        <Suspense fallback={<p>Loading checkout…</p>}>
          <CheckoutButton sourceState={source} belowCta={timedNotes} />
        </Suspense>
      </section>
      <section className="card" id="lifetime-checkout" aria-labelledby="lifetime-checkout-heading">
        <h2 id="lifetime-checkout-heading">Lifetime Pro Checkout</h2>
        <CheckoutButton productCode={LIFETIME_PRO_PRODUCT_CODE} sourceState={source} checkoutAvailable={lifetimeAvailable} belowCta={<>
          <p className="notice">{TAX_CHECKOUT_NOTICE}</p>
          <div className="lifetime-purchase-notes">
            <h3>What’s included</h3>
            <ul>
              <li>Full question banks, practice exams, and official sources across available states.</li>
              <li>Wrong-answer review, Daily Study, flashcards, and the Pro daily AI allowance.</li>
              <li>Cross-device progress and access to future states as they become available.</li>
            </ul>
          </div>
          <p className="notice">State applications, official exams, required training, commissions, and government fees are separate.</p>
          <section className="card pricing-policy-card" id="lifetime-refund-policy" aria-labelledby="lifetime-guarantee-heading">
            <h3 id="lifetime-guarantee-heading">Lifetime Pro Exam Guarantee</h3>
            <LifetimeGuaranteeTerms />
          </section>
          <p className="notice"><a href="/lifetime/#included-states">See the full list of included states</a></p>
        </>} />
      </section>
    </div>
  );
}
