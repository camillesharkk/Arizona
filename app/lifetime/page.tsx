import Link from "next/link";
import { stateByCode } from "@/lib/states";
import { LIVE_STATES } from "@/lib/ca-site";
import { pageMeta } from "@/lib/seo";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_POLICY_VERSION, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
export const metadata = pageMeta({
  title: "Lifetime Pro — $29.99 All-State Access",
  description:
    "Lifetime Pro access plus a $10 official exam guarantee. Lifetime purchasing is not open yet.",
  path: "/lifetime/",
});
export default function LifetimePage() {
  return (
    <main className="wrap hero">
      <h1>Lifetime Pro</h1>
      <p className="lede">
        {formatUsd(LIFETIME_TOTAL_CENTS)} USD once · All available states · No expiration
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
        <ul>
          <li><strong>{formatUsd(LIFETIME_ACCESS_CENTS)}</strong> for lifetime Pro access. This portion is nonrefundable under the exam guarantee.</li>
          <li><strong>{formatUsd(EXAM_GUARANTEE_CENTS)}</strong> for the official exam guarantee. A qualifying refund returns this fee and keeps your lifetime access active.</li>
        </ul>
        <p>
          If you fail an official notary exam taken after purchase, request a
          refund within 30 days of the official results. Submit your order
          number, exam and result dates, and official failure proof through{" "}
          <Link href="/contact/?topic=lifetime-exam-refund">
            Contact support
          </Link>
          .
        </p>
        <p>
          Complete requests are reviewed within 5–7 business days. Approved
          refunds return through Paddle to the original payment method.
          Settlement time depends on Paddle and your bank.
        </p>
        <p>
          <Link href="/legal/refund/#lifetime">
            Read the full Lifetime refund policy
          </Link>{" "}
          · Policy {LIFETIME_POLICY_VERSION}
        </p>
      </section>
      <section className="card">
        <h2>Lifetime purchasing is not open yet</h2>
        <p>You can use free practice or choose 60-day Pro today.</p>
        <Link href="/contact/">Contact support</Link>
      </section>
      <p>
        <Link href="/pricing/">Compare free and 60-day Pro access</Link>
      </p>
    </main>
  );
}
