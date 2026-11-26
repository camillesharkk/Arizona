import Link from "next/link";
import { paths } from "@/lib/paths";
import { NEWCOMER_HOURS, NEWCOMER_PRICE_CENTS, PRO_DURATION_DAYS } from "@/lib/pricing/catalog";
import { LIFETIME_ACCESS_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { benefitSymbols, guarantee, lifetime, membershipBenefits, standard, type BenefitValue } from "@/lib/pricing/membership-benefits";

const refund = paths.refund + "#lifetime";
const tableNotes: Record<string, string> = {
  bank: "State-specific practice questions",
  exams: "Where available",
  wrong: "Review missed and saved questions",
  sync: "Across devices when signed in",
};

const homeRows = new Set(["duration", "bank", "exams", "wrong", "daily", "cards", "ai", "sync", "renewal", "guarantee", "discount"]);

function PlanValue({ value }: { value: BenefitValue }) {
  if (typeof value !== "string") return value.text;
  const { icon, label } = benefitSymbols[value];
  return <span className={"comparison-value " + value}><b aria-hidden="true">{icon}</b> {label}</span>;
}

export function EditorialHomePlans() {
  return (
    <section className="editorial-wrap editorial-section" id="plans" aria-labelledby="plans-heading">
      <div className="editorial-section-head">
        <div>
          <p className="editorial-kicker"><span />Pro plans</p>
          <h2 id="plans-heading">More practice.<br /><span className="editorial-underline">A plan that fits.</span></h2>
        </div>
        <p>Start free. Choose Pro when you want the full study toolkit, for {PRO_DURATION_DAYS} days or for the long run.</p>
      </div>
      <div className="editorial-plan-grid">
        <article className="editorial-card editorial-plan">
          <h3>60-Day Pro</h3>
          <p>A focused study window with the complete Pro toolkit.</p>
          <p className="editorial-price">{standard} <small>USD · one-time payment</small></p>
          <p className="editorial-duration">{PRO_DURATION_DAYS} days of access · No automatic renewal</p>
          <ul>
            <li>Full question banks and practice exams where available</li>
            <li>Wrong-answer review, Daily Study and flashcards</li>
            <li>Pro AI Tutor allowance across available states</li>
          </ul>
          <Link className="btn btn-primary" href={paths.pricing + "#pro-checkout"}>Explore 60-Day Pro</Link>
          <p className="plan-small">Eligible new members pay {formatUsd(NEWCOMER_PRICE_CENTS)} within {NEWCOMER_HOURS} hours of verifying email. Other eligible account offers appear at checkout.</p>
        </article>
        <article className="editorial-card editorial-plan editorial-dark">
          <h3>Lifetime Pro</h3>
          <p>Return to the full study toolkit whenever you need it.</p>
          <p className="editorial-price">{lifetime} <small>USD · one-time payment</small></p>
          <p className="editorial-duration">Lifetime access · No expiration</p>
          <ul>
            <li>All Pro study tools, with progress synced across devices</li>
            <li>Available states and future state additions</li>
            <li>{guarantee} exam guarantee fee included</li>
          </ul>
          <Link className="btn editorial-yellow-button" href={paths.pricing + "#lifetime-checkout"}>Explore Lifetime Pro</Link>
          <p className="plan-small">{formatUsd(LIFETIME_ACCESS_CENTS)} access + {guarantee} exam guarantee fee. <Link href={refund}>See eligibility and refund terms</Link>.</p>
        </article>
      </div>

      <section className="editorial-comparison" aria-labelledby="comparison-heading">
        <div className="editorial-section-head">
          <h3 id="comparison-heading">The details, side by side.</h3>
          <p>Compare the two access periods and what each includes.</p>
        </div>
        <div className="editorial-table-shell" role="region" aria-labelledby="comparison-heading" tabIndex={0}>
          <table className="editorial-table">
            <caption className="visually-hidden">Benefits of 60-Day Pro and Lifetime Pro</caption>
            <colgroup><col className="feature-column" /><col /><col /></colgroup>
            <thead><tr>
              <th scope="col">What’s included</th>
              <th scope="col">60-Day Pro <span>{standard} <small>once</small></span></th>
              <th scope="col">Lifetime Pro <span>{lifetime} <small>once</small></span></th>
            </tr></thead>
            <tbody>
              {membershipBenefits.filter(row => homeRows.has(row.id)).map(row => (
                <tr key={row.id} data-benefit={row.id}>
                  <th scope="row">{row.label}{tableNotes[row.id] && <small>{tableNotes[row.id]}</small>}{row.id === "guarantee" && <Link href={refund}>Eligibility and terms</Link>}</th>
                  <td><PlanValue value={row.timed} /></td>
                  <td><PlanValue value={row.permanent} />{row.id === "guarantee" && <small>Fee included. Refundable if eligible.</small>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="editorial-table-foot"><span>Features vary by state.</span><Link href={paths.pricing}>Full plan details →</Link></div>
        </div>
      </section>
    </section>
  );
}
