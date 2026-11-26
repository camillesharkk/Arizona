import Link from "next/link";
import { MembershipPlans } from "@/components/MembershipPlans";
import { MembershipCheckouts } from "@/components/MembershipCheckouts";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { PERSONAL_USE_NOTICE, PRO_DURATION_NOTICE, CREDIT_PER_ORDER_NOTICE, GUEST_NEWCOMER_HINT, TAX_CHECKOUT_NOTICE, ONE_TIME_DISCOUNT_NOTICE, REFERRAL_PROMOTION_NOTICE } from "@/lib/pricing/copy";
import { STANDARD_PRICE_CENTS, NEWCOMER_PRICE_CENTS, NEWCOMER_HOURS, REFUND_HOURS } from "@/lib/pricing/catalog";
import { EXAM_GUARANTEE_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { eligibleExamPool } from "@/lib/quiz";
import { caQuestionCounts } from "@/data/ca-questions";
import { getLifetimeCheckoutAvailability } from "@/lib/billing/lifetime-availability";

const pricingPool = eligibleExamPool();
const pricingFreeCount = pricingPool.filter((q) => q.is_free).length;
const california = caQuestionCounts();

export const metadata = pageMeta({
  title: "Notary Exam Prep Membership — Compare Free and Pro Plans",
  description: "Compare free notary practice with one-time 60-Day and Lifetime Pro plans. See question access by state, study tools, pricing, and refund terms.",
  path: paths.pricing,
});

const faqs = [
  { q: "Is Pro a subscription?", a: `No. 60-Day Pro is a one-time payment of ${formatUsd(STANDARD_PRICE_CENTS)} at standard price. Eligible new members may pay ${formatUsd(NEWCOMER_PRICE_CENTS)} within ${NEWCOMER_HOURS} hours of verifying their email. If you add 60 days while Pro is active, the extra time starts after your current expiration. Lifetime Pro is a separate one-time plan with no expiration. Neither plan automatically renews.` },
  { q: "Is this the official state exam?", a: "No. These are independently written practice questions with explanations and references. Register for official exams or required training through your state’s approved channels." },
  { q: "What is the refund policy?", a: `For 60-Day Pro, you may request a refund within ${REFUND_HOURS} hours of purchase if you have not used a Pro-only feature. Lifetime Pro has a separate ${formatUsd(EXAM_GUARANTEE_CENTS)} exam guarantee fee that can be refunded after an eligible failed official exam. ${ONE_TIME_DISCOUNT_NOTICE} ${REFERRAL_PROMOTION_NOTICE}` },
  { q: "Can I share my Pro account?", a: "Pro access is for the personal use of the account holder. Account sharing or resale is not permitted." },
  { q: "Who collects payment?", a: "Paddle is the Merchant of Record. Paddle collects payment and handles applicable taxes at checkout. Both Pro plans are one-time purchases with no automatic renewal." },
];

export default async function PricingPage() {
  const lifetimeAvailable = await getLifetimeCheckoutAvailability();
  return (
    <main className="wrap hero pricing-page">
      <JsonLd data={faqJson(faqs)} />
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Pricing", path: paths.pricing }]} />
      <h1>Compare Notary Exam Prep Plans</h1>
      <p className="lede">Start with Quick 10, answer explanations, and study guides. In Arizona, short and topic practice draw from {pricingFreeCount} free questions, and Pro opens all {pricingPool.length}. In California, {california.free} of {california.published} questions are free. Paid plans add repeat full practice where available and a higher AI Tutor allowance.</p>
      <p>See how a worked answer links to the official rule and its verification date in the <Link href={`${paths.practice}#sample-questions`}>Arizona sample questions</Link>. After a short practice set, review missed topics and choose what to study next in <Link href={paths.daily}>Daily Study</Link>.</p>
      <MembershipPlans lifetimeAvailable={lifetimeAvailable} />
      <MembershipCheckouts lifetimeAvailable={lifetimeAvailable} timedNotes={
        <div className="pricing-notes">
          <p>{GUEST_NEWCOMER_HINT}</p>
          <p>{PRO_DURATION_NOTICE}</p>
          <p>{PERSONAL_USE_NOTICE}</p>
          <p>{CREDIT_PER_ORDER_NOTICE}</p>
          <p>{TAX_CHECKOUT_NOTICE}</p>
        </div>
      } />
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
