import { MemberCopy } from "@/components/MemberCopy";
import Image from "next/image";
import Link from "next/link";
import { NEWCOMER_HOURS, NEWCOMER_PRICE_CENTS, STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";
import "./MembershipPlans.css";

const standard = formatUsd(STANDARD_PRICE_CENTS);
const lifetime = formatUsd(LIFETIME_TOTAL_CENTS);
const guarantee = formatUsd(EXAM_GUARANTEE_CENTS);
const access = formatUsd(LIFETIME_ACCESS_CENTS);

const symbols = {
  full: { icon: "✓", label: "Included" },
  limited: { icon: "◐", label: "Limited" },
  none: { icon: "×", label: "Not included" },
} as const;

type BenefitValue = keyof typeof symbols | { text: string };

const benefits: [string, BenefitValue, BenefitValue, BenefitValue][] = [
  ["One-time price", { text: "$0" }, { text: standard }, { text: lifetime }],
  ["Pro access", "none", { text: "60 days" }, { text: "Lifetime" }],
  ["Question bank", "limited", "full", "full"],
  ["Practice exams", "limited", "full", "full"],
  ["Scores & topic accuracy", "full", "full", "full"],
  ["Answer explanations & sources", "full", "full", "full"],
  ["Study guides", "full", "full", "full"],
  ["Wrong answers & favorites", "limited", "full", "full"],
  ["Daily Study & readiness", "limited", "full", "full"],
  ["Flashcards", "limited", "full", "full"],
  ["AI Tutor per day", { text: String(AI_LIMIT_FREE) }, { text: String(AI_LIMIT_PRO) }, { text: String(AI_LIMIT_PRO) }],
  ["Cloud progress", "full", "full", "full"],
  ["Weekly progress email", "none", "full", "full"],
  ["Exam guarantee", "none", "none", { text: guarantee }],
  ["Eligible account discount", "none", "full", "none"],
];

function BenefitCell({ value }: { value: BenefitValue }) {
  if (typeof value !== "string") return <td>{value.text}</td>;
  const { icon, label } = symbols[value];
  return (
    <td>
      <span className={`plan-benefit-symbol is-${value}`} aria-hidden="true">{icon}</span>
      <span className="visually-hidden">{label}</span>
    </td>
  );
}

export function MembershipPlans({ lifetimeAvailable }: { lifetimeAvailable: boolean }) {
  return (
    <>
      <section className="membership-plans" aria-labelledby="membership-plans-heading">
        <h2 id="membership-plans-heading">Choose your Pro plan</h2>
        <div className="membership-plan-grid">
          <article className="card membership-plan">
            <Image className="membership-art" src="/images/glass-demo/study-stack.png" alt="" width={96} height={88} sizes="96px" />
            <h3>60-Day Pro</h3>
            <p className="membership-price">{standard} <small>USD once</small></p>
            <p>Full Pro tools across available states for 60 days.</p>
            <p className="notice">{formatUsd(NEWCOMER_PRICE_CENTS)} for eligible new members within {NEWCOMER_HOURS} hours of verifying their email.</p>
            <a className="btn btn-primary" href="#pro-checkout">Continue to 60-Day Pro checkout</a>
          </article>
          <article className="card membership-plan">
            <Image className="membership-art" src="/images/glass-demo/study-stack.png" alt="" width={96} height={88} sizes="96px" />
            <h3>Lifetime Pro</h3>
            <p className="membership-price">{lifetime} <small>USD once</small></p>
            <p>{access} for lifetime access + {guarantee} for the official exam guarantee.</p>
            {!lifetimeAvailable && <p className="notice">Checkout is currently unavailable.</p>}
            <a className="btn btn-ghost" href="#lifetime-checkout">{lifetimeAvailable ? "Continue to Lifetime Pro checkout" : "View Lifetime Pro checkout"}</a>
          </article>
        </div>
      </section>
      <section className="membership-comparison" aria-labelledby="membership-comparison-heading">
        <h2 id="membership-comparison-heading">Compare plan benefits</h2>
        <p className="plan-benefit-legend notice">
          {Object.entries(symbols).map(([key, { icon, label }]) => (
            <span key={key}><b className={`plan-benefit-symbol is-${key}`} aria-hidden="true">{icon}</b> {label}</span>
          ))}
        </p>
        <div className="membership-table-region" role="region" tabIndex={0} aria-labelledby="membership-comparison-heading">
          <table className="membership-table">
            <caption className="visually-hidden">Benefits by membership plan</caption>
            <thead>
              <tr>
                <th scope="col">Benefit</th>
                <th scope="col"><MemberCopy member={<>Starter</>}>Free</MemberCopy></th>
                <th scope="col">60-Day Pro</th>
                <th scope="col">Lifetime Pro</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map(([label, free, timed, permanent]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <BenefitCell value={free} />
                  <BenefitCell value={timed} />
                  <BenefitCell value={permanent} />
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="notice">Features vary by state. <Link href="/legal/refund/">Refund and discount terms</Link></p>
      </section>
    </>
  );
}
