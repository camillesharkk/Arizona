import Link from "next/link";
import { stateByCode } from "@/lib/states";
import { LIVE_STATES } from "@/lib/ca-site";
import { pageMeta } from "@/lib/seo";
import { LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { LifetimeGuaranteeTerms } from "@/components/LifetimeGuaranteeTerms";
import { CheckoutButton } from "@/components/CheckoutButton";
import { LIFETIME_PRO_PRODUCT_CODE } from "@/lib/pro-products";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";
import { TAX_CHECKOUT_NOTICE } from "@/lib/pricing/copy";
export const metadata = pageMeta({
  title: "Lifetime Pro — $29.99 All-State Access",
  description:
    "One-time Lifetime Pro access across all available states plus a $10 official exam guarantee.",
  path: "/lifetime/",
});
export default async function LifetimePage() {
  const lifetimeAvailable = await getLifetimeCheckoutAvailability();
  return (
    <main className="wrap hero">
      <h1>Lifetime Pro</h1>
      <p className="lede">
        {formatUsd(LIFETIME_TOTAL_CENTS)} USD standard · All available states · No expiration
      </p>
      <section className="card">
        <h2>Everything you need to keep preparing</h2>
        <p>
          Full question banks, unlimited available practice exams, weak-area
          training, wrong-answer review, full flashcards, readiness and study
          planning tools, cross-device progress and the Pro daily AI allowance.
          Features follow each state’s available preparation format.
        </p>
        <h2>Included states</h2>
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
      <section className="card" id="refund-policy">
        <h2>What the price covers</h2>
        <LifetimeGuaranteeTerms />
      </section>
      <section className="card" id="lifetime-checkout">
        <h2>Lifetime Pro Checkout</h2>
        <CheckoutButton productCode={LIFETIME_PRO_PRODUCT_CODE} checkoutAvailable={lifetimeAvailable} lifetimePage
          belowCta={<p className="notice">{TAX_CHECKOUT_NOTICE}</p>} />
      </section>
      <p>
        <Link href="/pricing/#lifetime-checkout">Compare both Pro checkouts</Link>
      </p>
    </main>
  );
}
