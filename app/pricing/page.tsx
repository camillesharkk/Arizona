import { MembershipPlans } from "@/components/MembershipPlans";
import { MembershipCheckouts } from "@/components/MembershipCheckouts";
import { PricingAnalytics } from "@/components/PricingAnalytics";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { ExamOutcomeComparison } from "@/components/ExamOutcomeComparison";
import { officialSosFaqAnswer, SHOW_SIMULATED_OUTCOME_DATA } from "@/lib/content/exam-outcome-demo";
import { PERSONAL_USE_NOTICE, PRO_DURATION_NOTICE, CREDIT_PER_ORDER_NOTICE, GUEST_NEWCOMER_HINT, TAX_CHECKOUT_NOTICE, ONE_TIME_DISCOUNT_NOTICE, REFERRAL_PROMOTION_NOTICE } from "@/lib/pricing/copy";
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
  { q: "Is Pro a subscription?", a: `No. 60-Day Pro is a one-time payment of ${formatUsd(STANDARD_PRICE_CENTS)} at standard price. Eligible new members may pay ${formatUsd(NEWCOMER_PRICE_CENTS)} within 72 hours of verifying their email. If you add 60 days while Pro is active, the extra time starts after your current expiration. Lifetime Pro is a separate one-time plan with no expiration. Neither plan automatically renews.` },
  { q: "Is this the official SOS exam?", a: officialSosFaqAnswer() },
  { q: "What is the refund policy?", a: `For 60-Day Pro, you may request a refund within 3 days of purchase if you have not used a Pro-only feature. Lifetime Pro has a separate $10 official exam guarantee. ${ONE_TIME_DISCOUNT_NOTICE} ${REFERRAL_PROMOTION_NOTICE}` },
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
      <MembershipCheckouts timedNotes={
        <div className="pricing-notes">
          <p>{GUEST_NEWCOMER_HINT}</p>
          <p>{PRO_DURATION_NOTICE}</p>
          <p>{PERSONAL_USE_NOTICE}</p>
          <p>{CREDIT_PER_ORDER_NOTICE}</p>
          <p>{TAX_CHECKOUT_NOTICE}</p>
        </div>
      } />
      {SHOW_SIMULATED_OUTCOME_DATA && <ExamOutcomeComparison />}
      {faqs.map((f) => (
        <details className="card pricing-faq" key={f.q}>
          <summary><strong>{f.q}</strong></summary>
          {f.a.split("\n\n").map((paragraph) => (
            <p key={paragraph.slice(0, 48)}>{paragraph}</p>
          ))}
        </details>
      ))}
    </main>
  );
}
