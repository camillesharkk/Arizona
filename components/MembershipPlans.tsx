import Image from "next/image";
import Link from "next/link";
import { MembershipCarousel } from "@/components/MembershipCarousel";
import { NEWCOMER_HOURS, NEWCOMER_PRICE_CENTS, STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { EXAM_GUARANTEE_CENTS, LIFETIME_ACCESS_CENTS, LIFETIME_TOTAL_CENTS } from "@/lib/pricing/lifetime";
import { formatUsd } from "@/lib/pricing/money";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";
import "./MembershipPlans.css";

const standard = formatUsd(STANDARD_PRICE_CENTS);
const lifetime = formatUsd(LIFETIME_TOTAL_CENTS);
const guarantee = formatUsd(EXAM_GUARANTEE_CENTS);
const access = formatUsd(LIFETIME_ACCESS_CENTS);

const benefits = [
  ["One-time price", "$0", standard, lifetime],
  ["Pro access duration", "Free access", "60 days", "No expiration"],
  ["Availability", "Available", "Available", "Purchasing not open yet"],
  ["Practice questions", "Free questions by state", "Full available banks", "Full available banks"],
  ["Practice exams", "Free set or trial by state", "Unlimited available exams", "Unlimited available exams"],
  ["Practice results and topic accuracy", "Included", "Included", "Included"],
  ["Answer explanations, official sources and verification dates", "Included for accessible questions", "Included", "Included"],
  ["Study guides", "Included where available", "Included", "Included"],
  ["Wrong-answer notebook and favorites", "Basic review", "Full review", "Full review"],
  ["Daily Study, weak areas and readiness", "Basic tools where available", "Full tools where available", "Full tools where available"],
  ["Flashcards", "Free cards by state", "Full available decks", "Full available decks"],
  ["AI Tutor requests per day", String(AI_LIMIT_FREE), String(AI_LIMIT_PRO), String(AI_LIMIT_PRO)],
  ["Cloud progress across devices", "With a free account", "Included", "Included"],
  ["Weekly progress email", "—", "Included where available", "Included where available"],
  ["Exam guarantee", "—", "—", `Qualifying ${guarantee} refund, lifetime access stays active`],
  ["Refund terms", "—", "Within 72 hours if unused", `${access} access is nonrefundable under the exam guarantee`],
];

export function MembershipPlans() {
  return (
    <>
      <MembershipCarousel>
        <div className="card membership-plan" role="group" aria-roledescription="slide" aria-label="60-Day Pro, 1 of 2">
          <Image className="membership-art" src="/images/glass-demo/study-stack.png" alt="" width={96} height={88} sizes="96px" />
          <h3>60-Day Pro</h3>
          <p className="membership-price">{standard} <small>USD once</small></p>
          <p>Full Pro tools across available states for 60 days.</p>
          <p className="notice">{formatUsd(NEWCOMER_PRICE_CENTS)} for eligible new members during the first {NEWCOMER_HOURS} hours.</p>
          <a className="btn btn-primary" href="#pro-checkout">Continue to 60-Day Pro checkout</a>
        </div>
        <div className="card membership-plan" role="group" aria-roledescription="slide" aria-label="Lifetime Pro, 2 of 2">
          <Image className="membership-art" src="/images/glass-demo/study-stack.png" alt="" width={96} height={88} sizes="96px" />
          <h3>Lifetime Pro</h3>
          <p className="membership-price">{lifetime} <small>USD once</small></p>
          <p>{access} for lifetime access + {guarantee} for the official exam guarantee.</p>
          <p className="notice">Purchasing is not open yet.</p>
          <Link className="btn btn-ghost" href="/lifetime/">View Lifetime Pro details</Link>
        </div>
      </MembershipCarousel>
      <section className="membership-comparison" aria-labelledby="membership-comparison-heading">
        <h2 id="membership-comparison-heading">Compare plan benefits</h2>
        <p className="notice">Study tools and free access vary by state. Paddle shows any applicable taxes at checkout.</p>
        <div className="membership-table-region" role="region" tabIndex={0} aria-labelledby="membership-comparison-heading">
          <table className="membership-table">
            <thead>
              <tr>
                <th scope="col">Benefit</th>
                <th scope="col">Free</th>
                <th scope="col">60-Day Pro</th>
                <th scope="col">Lifetime Pro</th>
              </tr>
            </thead>
            <tbody>
              {benefits.map(([label, free, timed, permanent]) => (
                <tr key={label}>
                  <th scope="row">{label}</th>
                  <td>{free}</td>
                  <td>{timed}</td>
                  <td>{permanent}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="notice"><Link href="/legal/refund/">Read the full refund terms</Link></p>
      </section>
    </>
  );
}
