import Link from "next/link";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";
import "./LifetimeProOffer.css";

export async function LifetimeProOffer() {
  const checkoutAvailable = await getLifetimeCheckoutAvailability();
  return (
    <section
      className="lifetime-offer"
      aria-labelledby="lifetime-offer-title"
    >
      <div>
        <p className="lifetime-eyebrow">One purchase. Every available state.</p>
        <h2 id="lifetime-offer-title">Lifetime Pro — {formatUsd(LIFETIME_TOTAL_CENTS)}</h2>
        <p>One-time payment. Pro access with no expiration date.</p>
        <p>
          Lifetime Pro unlocks the full question banks, weak-area training,
          flashcards, progress tools and Pro AI allowance across all available
          states.
        </p>
      </div>
      <div className="lifetime-price">
        <p>
          <strong>{formatUsd(LIFETIME_TOTAL_CENTS)}</strong> USD · one-time
        </p>
        <Link className="btn btn-primary" href="/lifetime/">
          Explore Lifetime Pro
        </Link>
        {!checkoutAvailable && <p className="notice">Purchasing is not open yet.</p>}
        <div className="lifetime-guarantee">
          <p>
            <span aria-hidden="true">🛡</span>{" "}
            <strong>Exam Refund Guarantee</strong>
          </p>
          <p>
            {formatUsd(LIFETIME_ACCESS_CENTS)} covers lifetime access. The {formatUsd(EXAM_GUARANTEE_CENTS)} exam guarantee fee can be refunded after a qualifying failed official exam. Your lifetime access stays active.
          </p>
          <Link href="/legal/refund/#lifetime">View Refund Terms</Link>
        </div>
      </div>
    </section>
  );
}
