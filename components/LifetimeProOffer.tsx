import Link from "next/link";
import { STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { formatUsd } from "@/lib/pricing/money";
import "./LifetimeProOffer.css";

export function LifetimeProOffer({ compact = false }: { compact?: boolean }) {
  return (
    <section
      className={`lifetime-offer${compact ? " lifetime-offer-compact" : ""}`}
      aria-labelledby="lifetime-offer-title"
    >
      <div>
        <p className="lifetime-eyebrow">One purchase. Every available state.</p>
        <h2 id="lifetime-offer-title">Lifetime Pro — $29.99</h2>
        <p>One-time payment. Pro access with no expiration date.</p>
        <p>
          Lifetime Pro unlocks the full question banks, weak-area training,
          flashcards, progress tools and Pro AI allowance across all available
          states.
        </p>
        {compact && (
          <dl className="lifetime-comparison">
            <div>
              <dt>Free</dt>
              <dd>$0 · Free practice and learning resources</dd>
            </div>
            <div>
              <dt>60-day Pro</dt>
              <dd>
                {formatUsd(STANDARD_PRICE_CENTS)} standard · All-state Pro for
                60 days
              </dd>
            </div>
            <div>
              <dt>Lifetime Pro</dt>
              <dd>$29.99 once · All-state Pro with no expiration</dd>
            </div>
          </dl>
        )}
      </div>
      <div className="lifetime-price">
        <p>
          <strong>$29.99</strong> USD · one-time
        </p>
        <Link className="btn btn-primary" href="/lifetime/">
          Explore Lifetime Pro
        </Link>
        <div className="lifetime-guarantee">
          <p>
            <span aria-hidden="true">🛡</span>{" "}
            <strong>Exam Refund Guarantee</strong>
          </p>
          <p>
            If you don’t pass your official notary exam, you can request a full
            refund under our Lifetime Pro refund policy.
          </p>
          <Link href="/legal/refund/#lifetime">View Refund Terms</Link>
        </div>
      </div>
    </section>
  );
}
