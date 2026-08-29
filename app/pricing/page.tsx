import { Suspense } from "react";
import { CheckoutButton } from "@/components/CheckoutButton";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";

export const metadata = pageMeta({
  title: "Arizona Notary Exam Pro",
  description: "Unlock the full Arizona notary question bank, notebook, AI Tutor, and exam readiness score. One-time or MoR-billed Pro.",
  path: paths.pricing,
});

const faqs = [
  { q: "Is this the official SOS exam?", a: "No. This is independent practice. The official exam and commission are on the Arizona Secretary of State site." },
  { q: "Who collects payment?", a: "Checkout is designed for a Merchant of Record such as Paddle or Lemon Squeezy. Until those keys are set, mock checkout upgrades a signed-in account for local testing." },
];

export default function PricingPage() {
  return (
    <main className="wrap hero">
      <JsonLd data={faqJson(faqs)} />
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Pricing", path: paths.pricing }]} />
      <h1>Free vs Pro</h1>
      <div className="grid grid-2">
        <section className="card">
          <h2>Free</h2>
          <ul>
            <li>Quick 10 and modeled full practice on free items</li>
            <li>Basic explanations</li>
            <li>Cloud notebook after you register (capped)</li>
            <li>Core study chapters</li>
          </ul>
        </section>
        <section className="card">
          <h2>Pro</h2>
          <ul>
            <li>Full question bank and unlimited modeled exams</li>
            <li>Full wrong-answer notebook and high-frequency drills</li>
            <li>AI Tutor with official-source context</li>
            <li>Exam readiness score and topic analytics</li>
            <li>Advanced study chapters and email reminders</li>
          </ul>
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
