import { Suspense } from "react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { PERSONAL_USE_NOTICE, PRO_DURATION_NOTICE, CREDIT_PER_ORDER_NOTICE } from "@/lib/pricing/copy";

export const metadata = pageMeta({
  title: "Arizona Notary Exam Prep Pro — $19.99 for 60 days",
  description: "Free Arizona notary practice plus 60-day Pro: full bank, unlimited exams, weak-area training, and exam readiness. One-time payment, no subscription.",
  path: paths.pricing,
});

const faqs = [
  { q: "Is this the official SOS exam?", a: "No. This is independent practice. The official exam and commission are on the Arizona Secretary of State site." },
  { q: "Is Pro a subscription?", a: "No. Arizona Notary Exam Prep Pro is a one-time $19.99 payment for 60-Day Full Access. No subscription. No automatic renewal. Your Pro access lasts for 60 days from activation. If you purchase additional 60-day access while Pro is still active, the additional time is added after your current expiration date." },
  { q: "What is the refund policy?", a: "You may request a refund within 3 days of purchase only if you have not used any Pro-only feature. One-time New Member and Referral discounts are not restored after a refund. An eligible unused full refund restores the Referral Credit(s) used on that order. Up to 3 Referral Credits can be applied per order, subject to the purchase amount. Subject to applicable law and payment-provider requirements." },
  { q: "Can I share my Pro account?", a: "Pro access is for the personal use of the account holder. Account sharing or resale is not permitted. Your account may be active on up to 3 devices at a time." },
  { q: "Who collects payment?", a: "Checkout will use Lemon Squeezy as Merchant of Record. Until live keys are set, signed-in mock checkout is for local testing only." },
];

export default function PricingPage() {
  return (
    <main className="wrap hero">
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
            <li>First full 45-question practice test</li>
            <li>Score, PASS / NEEDS REVIEW</li>
            <li>Topic accuracy and weak areas</li>
            <li>Official sources and last verified dates</li>
            <li>Full study guide, exam guide, and new laws</li>
            <li>Free account, cloud progress, basic wrong-answer notebook, favorites</li>
            <li>Some exam questions</li>
            <li>AI Tutor — 3 requests per day</li>
          </ul>
        </section>
        <section className="card">
          <h2>Arizona Notary Exam Prep Pro</h2>
          <p className="kicker">$19.99 · 60-Day Full Access</p>
          <p>One-time payment. No subscription. No automatic renewal.</p>
          <p className="notice">{PRO_DURATION_NOTICE}</p>
          <p className="notice">{PERSONAL_USE_NOTICE}</p>
          <p className="notice">{CREDIT_PER_ORDER_NOTICE}</p>
          <ul>
            <li>Access the complete Arizona question bank</li>
            <li>Unlimited full-length exams</li>
            <li>Weak-area training</li>
            <li>Smart wrong-answer review</li>
            <li>Full flashcards</li>
            <li>Exam readiness score</li>
            <li>Advanced analytics</li>
            <li>Personalized study plan</li>
            <li>AI Tutor — 15 requests per day</li>
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
