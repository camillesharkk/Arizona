import Link from "next/link";
import { examConfig } from "@/data/exam-config";
import { PrepCtas } from "@/components/PrepCtas";
import { HomeProCta } from "@/components/HomeProCta";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: `How to Become a Notary in Arizona ${examConfig.year}`,
  description:
    "How to become a notary in Arizona: eligibility, exam, $5,000 bond, oath, stamp, and journal. Practice the exam before you buy supplies.",
  path: paths.become,
  keywords: "how to become a notary in Arizona, Arizona notary exam requirements",
});

const steps = [
  {
    t: "Eligibility",
    d: "Confirm age, residency, English, and character rules in A.R.S. § 41-269(B) on the SOS site before you pay anyone. Working in Arizona alone does not establish the tax-residency test.",
  },
  {
    t: "Apply",
    d: "Use the official application. This site does not file paperwork for you.",
  },
  {
    t: "Exam",
    d: "Pass the official exam if the Secretary of State requires it under A.R.S. § 41-270. That statute does not set the question count, time limit, or cut score, and this page does not treat those figures as re-checked on the SOS site. Practice here first.",
  },
  {
    t: "Bond",
    d: `Submit a $${examConfig.bondAmountUsd} surety-bond assurance to the Secretary of State (A.R.S. § 41-269(D)). The bond protects the public. It is not the same as optional E&O insurance.`,
  },
  {
    t: "Oath / filing",
    d: "Complete the oath and any recording or filing the SOS requires. Missing a filing can stall your commission.",
  },
  {
    t: "Supplies",
    d: "Seal/stamp matching your commissioned name, a proper journal, and optional E&O. Insurance is recommended for you; it does not replace the bond.",
  },
];

export default function BecomePage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Become a Notary</p>
      <h1>How to Become a Notary in Arizona — Step-by-Step {examConfig.year}</h1>
      <p className="lede">
        Required legal steps vs optional purchases. Pass a practice exam before you shop for a prettier stamp.
      </p>
      <section className="card">
        <h2>Exam and commission requirements</h2>
        <p>
          A.R.S. § 41-269(B) is the eligibility list: at least 18, a U.S. citizen or permanent legal resident, an
          Arizona resident for income-tax purposes who claims Arizona as the primary residence, able to read and write
          English, not disqualified under § 41-271, passage of the § 41-270 examination if the Secretary of State
          requires it, and an SOS-approved manual kept as a reference. § 41-270 does not state how many questions are
          on the exam or what percent passes. Before the commission is issued, § 41-269(C) and (D) still require the
          oath and a $5,000 surety bond.
        </p>
        <p className="notice">
          Official source: <a href="https://www.azleg.gov/ars/41/00269.htm">A.R.S. § 41-269</a>
          {" and "}
          <a href="https://www.azleg.gov/ars/41/00270.htm">A.R.S. § 41-270</a>. Statutes checked 2026-09-29. The SOS
          exam page did not load that day.
        </p>
        <p>
          <Link href={`${paths.practice}?mode=quick`}>Try 10 free questions</Link>
          {" before you buy a stamp. "}
          <Link href={paths.bond}>Bond requirements</Link>
          {" and the "}
          <Link href={paths.passingScore}>practice passing score</Link>
          {" are separate pages."}
        </p>
      </section>
      <PrepCtas />
      <div className="timeline" style={{ marginTop: 32 }}>
        {steps.map((s, i) => (
          <div className="step card" key={s.t}>
            <span className="kicker">Step {i + 1}</span>
            <h2>{s.t}</h2>
            <p>{s.d}</p>
            {i === 2 && (
              <Link className="btn btn-primary" href={`${paths.practice}?mode=quick`}>
                Free 10-question test
              </Link>
            )}
            {i === 3 && (
              <p>
                <Link href={paths.bond}>Arizona notary bond requirements</Link>
              </p>
            )}
          </div>
        ))}
      </div>
      <section id="compare" className="card" style={{ marginTop: 24 }}>
        <h2>Compare bonds / supplies / insurance</h2>
        <p>
          <strong>Required vs optional:</strong> the statutory bond and a compliant seal/journal are
          part of acting as a notary. E&amp;O is extra protection for you. Association memberships are
          optional.
        </p>
        <div className="grid grid-3">
          <div className="stat">
            <b>Bond</b>
            <span>Public protection. Shop sureties; verify penal sum.</span>
          </div>
          <div className="stat">
            <b>Stamp & journal</b>
            <span>Must match commissioned name and statutory form.</span>
          </div>
          <div className="stat">
            <b>E&O</b>
            <span>Optional notary-side coverage. Not a bond replacement.</span>
          </div>
        </div>
        <p>
          Related: <Link href={paths.fees}>notary fees</Link>, <Link href={paths.examRequirements}>exam requirements</Link>,{" "}
          <Link href={paths.ron}>remote online notary rules</Link>.
        </p>
        <p className="notice">No live affiliate partners in MVP. Buttons are placeholders.</p>
      </section>
      <HomeProCta />
    </main>
  );
}
