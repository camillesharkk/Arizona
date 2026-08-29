import Link from "next/link";
import { examConfig } from "@/data/exam-config";

export const metadata = {
  title: "How to Become an Arizona Notary 2026",
  description: "Step-by-step: eligibility, exam, bond, oath, stamp, journal, and insurance.",
};

const steps = [
  {
    t: "Eligibility",
    d: "Confirm age, residency, and character rules on the SOS site before you pay anyone.",
  },
  {
    t: "Apply",
    d: "Use the official application. This site does not file paperwork for you.",
  },
  {
    t: "Exam",
    d: "Pass the official exam. Use the free practice test here to locate weak topics first.",
  },
  {
    t: "Bond",
    d: `A surety bond (configured amount $${examConfig.bondAmountUsd}) generally protects the public. Compare issuers; this page may later include affiliate links, labeled as such.`,
  },
  {
    t: "Oath / filing",
    d: "Complete the oath and any recording/filing SOS requires. Missing a filing can stall your commission.",
  },
  {
    t: "Supplies",
    d: "Seal/stamp matching your commissioned name, a proper journal, and optional E&O insurance. Insurance is recommended, not the same as the bond.",
  },
];

export default function BecomePage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Become a Notary</p>
      <h1>How to Become an Arizona Notary — Step-by-Step {examConfig.year}</h1>
      <p className="lede">
        Required legal steps vs optional purchases. Exam prep comes before shopping for a prettier stamp.
      </p>
      <div className="row">
        <Link className="btn btn-primary" href="/arizona/practice-test/">
          Start Exam Prep
        </Link>
        <a className="btn btn-ghost" href="#compare">
          Compare Notary Bonds
        </a>
      </div>
      <div className="timeline" style={{ marginTop: 32 }}>
        {steps.map((s, i) => (
          <div className="step card" key={s.t}>
            <span className="kicker">Step {i + 1}</span>
            <h2>{s.t}</h2>
            <p>{s.d}</p>
            {i === 2 && (
              <Link className="btn btn-primary" href="/arizona/practice-test/">
                Need to prepare? Free Practice Test
              </Link>
            )}
          </div>
        ))}
      </div>
      <section id="compare" className="card" style={{ marginTop: 24 }}>
        <h2>Compare bonds / supplies / insurance</h2>
        <p>
          <strong>Required vs optional:</strong> the statutory bond and a compliant seal/journal are
          part of acting as a notary. E&O is extra protection for you. Association memberships are
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
        <p className="notice">No live affiliate partners in MVP. Buttons are placeholders.</p>
      </section>
    </main>
  );
}
