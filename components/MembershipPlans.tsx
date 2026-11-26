import { MemberCopy } from "@/components/MemberCopy";
import Link from "next/link";
import { NEWCOMER_HOURS, NEWCOMER_PRICE_CENTS } from "@/lib/pricing/catalog";
import { LIFETIME_ACCESS_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { benefitSymbols as symbols, membershipBenefits, standard, lifetime, guarantee, type BenefitValue } from "@/lib/pricing/membership-benefits";
import "./MembershipPlans.css";

const access = formatUsd(LIFETIME_ACCESS_CENTS);

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
            <h3>60-Day Pro</h3>
            <p className="membership-price">{standard} <small>USD once</small></p>
            <p>Full Pro tools across available states for 60 days.</p>
            <p className="notice">{formatUsd(NEWCOMER_PRICE_CENTS)} for eligible new members within {NEWCOMER_HOURS} hours of verifying their email.</p>
            <a className="btn btn-primary" href="#pro-checkout">Continue to 60-Day Pro checkout</a>
          </article>
          <article className="card membership-plan membership-plan-lifetime">
            <h3>Lifetime Pro</h3>
            <p className="membership-price">{lifetime} <small>USD once</small></p>
            <p>{access} for lifetime access + {guarantee} for the official exam guarantee.</p>
            {!lifetimeAvailable && <p className="notice">Checkout is currently unavailable.</p>}
            <a className="btn btn-primary" href="#lifetime-checkout">Continue to Lifetime Pro checkout</a>
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
              {membershipBenefits.map(({ label, free, timed, permanent }) => (
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
