import { MembershipPlans } from "@/components/MembershipPlans";
import { Fragment, Suspense } from "react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { PricingAnalytics } from "@/components/PricingAnalytics";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { ExamOutcomeComparison } from "@/components/ExamOutcomeComparison";
import { officialSosFaqAnswer, SHOW_SIMULATED_OUTCOME_DATA } from "@/lib/content/exam-outcome-demo";
import { PERSONAL_USE_NOTICE, PRO_DURATION_NOTICE, CREDIT_PER_ORDER_NOTICE, GUEST_NEWCOMER_HINT, TAX_CHECKOUT_NOTICE } from "@/lib/pricing/copy";
import { STANDARD_PRICE_CENTS, NEWCOMER_PRICE_CENTS } from "@/lib/pricing/catalog";
import { formatUsd } from "@/lib/pricing/money";
import { eligibleExamPool } from "@/lib/quiz";
import { examConfig } from "@/data/exam-config";

const pricingPool = eligibleExamPool();
const pricingFreeCount = pricingPool.filter((q) => q.is_free).length;

export const metadata = pageMeta({
  title: "Notary Exam Prep Membership — Compare Free and Pro Plans",
  description: `Free practice uses ${pricingFreeCount} of ${pricingPool.length} questions. Pro includes all ${pricingPool.length}. Each Full 45 draws ${examConfig.questionCount}. One-time 60-day access, no subscription.`,
  path: paths.pricing,
});

const faqs = [
  { q: "Is this the official SOS exam?", a: officialSosFaqAnswer() },
  { q: "Is Pro a subscription?", a: `No. One purchase unlocks Pro across all available states for 60 days, including states added while Pro is active. The standard price is ${formatUsd(STANDARD_PRICE_CENTS)}. New members may pay ${formatUsd(NEWCOMER_PRICE_CENTS)} for 72 hours after registration. No subscription. No automatic renewal. If you purchase again while Pro is still active, the extra 60 days start after the current expiration.` },
  { q: "What is the refund policy?", a: "You may request a refund within 3 days of purchase only if you have not used any Pro-only feature. One-time New Member and Referral discounts are not restored after a refund. An eligible unused full refund restores the Referral Credit(s) used on that order. Up to 3 Referral Credits can be applied per order, subject to the purchase amount. Subject to applicable law and payment-provider requirements." },
  { q: "Can I share my Pro account?", a: "Pro access is for the personal use of the account holder. Account sharing or resale is not permitted." },
  { q: "Who collects payment?", a: "Paddle is the Merchant of Record. Paddle collects payment and handles applicable taxes at checkout. 60-Day Pro is a one-time purchase with no automatic renewal." },
];

export default function PricingPage() {
  return (
    <main className="wrap hero">
      <PricingAnalytics />
      <JsonLd data={faqJson(faqs)} />
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Pricing", path: paths.pricing }]} />
      <h1>Compare Notary Exam Prep Plans</h1>
      <MembershipPlans />
      <section className="card" id="pro-checkout" aria-labelledby="pro-checkout-heading">
        <h2 id="pro-checkout-heading">60-Day Pro Checkout</h2>
        <Suspense fallback={<p>Loading checkout…</p>}>
          <CheckoutButton
            belowCta={
              <div className="pricing-notes">
                <p>{GUEST_NEWCOMER_HINT}</p>
                <p>{PRO_DURATION_NOTICE}</p>
                <p>{PERSONAL_USE_NOTICE}</p>
                <p>{CREDIT_PER_ORDER_NOTICE}</p>
                <p>{TAX_CHECKOUT_NOTICE}</p>
              </div>
            }
          />
        </Suspense>
      </section>
      {faqs.map((f) => (
        <Fragment key={f.q}>
          <details className="card" style={{ marginTop: 12 }}>
            <summary><strong>{f.q}</strong></summary>
            {f.a.split("\n\n").map((paragraph) => (
              <p key={paragraph.slice(0, 48)}>{paragraph}</p>
            ))}
          </details>
          {f.q === "Is this the official SOS exam?" && SHOW_SIMULATED_OUTCOME_DATA ? <ExamOutcomeComparison /> : null}
        </Fragment>
      ))}
    </main>
  );
}
