import { Suspense } from "react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { PricingAnalytics } from "@/components/PricingAnalytics";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { PERSONAL_USE_NOTICE, PRO_DURATION_NOTICE, CREDIT_PER_ORDER_NOTICE, GUEST_NEWCOMER_HINT, TAX_CHECKOUT_NOTICE } from "@/lib/pricing/copy";
import { STANDARD_PRICE_CENTS, NEWCOMER_PRICE_CENTS } from "@/lib/pricing/catalog";
import { formatUsd } from "@/lib/pricing/money";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";
import { eligibleExamPool } from "@/lib/quiz";
import { examConfig } from "@/data/exam-config";

const pricingPool = eligibleExamPool();
const pricingFreeCount = pricingPool.filter((q) => q.is_free).length;

export const metadata = pageMeta({
  title: "Arizona Notary Exam Prep Pro — 60-Day Full Access",
  description: `Free practice uses ${pricingFreeCount} of ${pricingPool.length} questions. Pro includes all ${pricingPool.length}. Each Full 45 draws ${examConfig.questionCount}. One-time 60-day access, no subscription.`,
  path: paths.pricing,
});

const faqs = [
  { q: "Is this the official SOS exam?", a: "No. This is independent practice. The official exam and commission are on the Arizona Secretary of State site." },
  { q: "Is Pro a subscription?", a: `No. Arizona Notary Exam Prep Pro is a one-time payment for 60-Day Full Access. The standard price is ${formatUsd(STANDARD_PRICE_CENTS)}. New members may pay ${formatUsd(NEWCOMER_PRICE_CENTS)} for 72 hours after registration. No subscription. No automatic renewal. Your Pro access lasts for 60 days from activation. If you purchase additional 60-day access while Pro is still active, the additional time is added after your current expiration date.` },
  { q: "What is the refund policy?", a: "You may request a refund within 3 days of purchase only if you have not used any Pro-only feature. One-time New Member and Referral discounts are not restored after a refund. An eligible unused full refund restores the Referral Credit(s) used on that order. Up to 3 Referral Credits can be applied per order, subject to the purchase amount. Subject to applicable law and payment-provider requirements." },
  { q: "Can I share my Pro account?", a: "Pro access is for the personal use of the account holder. Account sharing or resale is not permitted. Your account may be active on up to 3 devices at a time." },
  { q: "Who collects payment?", a: "Paddle is the Merchant of Record. Paddle collects payment and handles applicable taxes at checkout. Arizona Notary Exam Prep Pro is a one-time purchase for 60-day access. It is not a subscription and does not renew automatically." },
];

export default function PricingPage() {
  const pool = pricingPool;
  const freeCount = pricingFreeCount;
  return (
    <main className="wrap hero">
      <PricingAnalytics />
      <JsonLd data={faqJson(faqs)} />
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Pricing", path: paths.pricing }]} />
      <h1>Free vs Arizona Notary Exam Prep Pro</h1>
      <p className="lede">Free builds trust with real practice. Pro is 60-day access to study faster toward a passing score.</p>
      <div className="grid grid-2">
        <section className="card">
          <h2>Free</h2>
          <p className="kicker">$0</p>
          <ul>
            <li>Quick 10</li>
            <li>One free Full 45 in this browser, which can include Pro questions</li>
            <li>Score, PASS / NEEDS REVIEW</li>
            <li>Topic accuracy and weak areas</li>
            <li>Official sources and last verified dates</li>
            <li>Full study guide, exam guide, and new laws</li>
            <li>Free account, cloud progress, basic wrong-answer notebook, favorites</li>
            <li>{freeCount} free practice questions for Quick 10 and topic practice</li>
            <li>AI Tutor — {AI_LIMIT_FREE} successful requests per day</li>
          </ul>
        </section>
        <section className="card">
          <h2>Arizona Notary Exam Prep Pro</h2>
          <p className="kicker">60-Day Full Access</p>
          <p>One-time payment. 60-day access. No subscription. No automatic renewal.</p>
          <p className="notice">Standard price {formatUsd(STANDARD_PRICE_CENTS)}.</p>
          <p className="notice">New Member price {formatUsd(NEWCOMER_PRICE_CENTS)} for 72 hours after registration.</p>
          <p className="notice">{GUEST_NEWCOMER_HINT}</p>
          <p className="notice">{PRO_DURATION_NOTICE}</p>
          <p className="notice">{PERSONAL_USE_NOTICE}</p>
          <p className="notice">{CREDIT_PER_ORDER_NOTICE}</p>
          <p className="notice">{TAX_CHECKOUT_NOTICE}</p>
          <ul>
            <li>All {pool.length} practice questions, including the {pool.length - freeCount} that are Pro-only</li>
            <li>Each additional Full {examConfig.questionCount} draws {examConfig.questionCount} questions from that bank</li>
            <li>Unlimited full-length exams</li>
            <li>Weak-area training</li>
            <li>Smart wrong-answer review</li>
            <li>Full flashcards</li>
            <li>Exam readiness score</li>
            <li>Advanced analytics</li>
            <li>Personalized study plan</li>
            <li>AI Tutor — {AI_LIMIT_PRO} successful requests per day</li>
            <li>Advanced weekly progress</li>
            <li>Cross-device progress</li>
          </ul>
          <p>
            <strong>Turn your weak topics into passing scores.</strong> Know exactly what to study next.
          </p>
          <Suspense fallback={<p>Loading checkout…</p>}>
            <CheckoutButton />
          </Suspense>
        </section>
      </div>
      {faqs.map((f) => (
        <details className="card" key={f.q} style={{ marginTop: 12 }}>
          <summary><strong>{f.q}</strong></summary>
          <p>{f.a}</p>
        </details>
      ))}
    </main>
  );
}
