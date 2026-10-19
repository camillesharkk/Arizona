import Link from "next/link";
import { examConfig, officialExam } from "@/data/exam-config";
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
    d: `The SOS notice checked on ${officialExam.checkedOn} requires the exam for new and renewing notaries. It lists ${officialExam.questionCount} questions, ${officialExam.timeLimitMinutes} minutes, and ${officialExam.passingScorePercent}% to pass, administered by ${officialExam.provider} for $${officialExam.examFeeUsd} per proctored exam. A.R.S. § 41-270 does not set those figures. Practice on this site is separate.`,
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
          Arizona resident for income-tax purposes who claims Arizona as the primary residence, able to read, write and
          understand English, not disqualified under § 41-271, passage of the § 41-270 examination if the Secretary of State
          requires it, and an SOS-approved manual kept as a reference. The statute does not set the question count or the
          passing score. The SOS exam notice checked on {officialExam.checkedOn} does: {officialExam.questionCount} questions,{" "}
          {officialExam.timeLimitMinutes} minutes, {officialExam.passingScorePercent}%, {officialExam.provider}, ${officialExam.examFeeUsd} per
          proctored exam, {officialExam.attemptsBeforeWait} attempts, then a {officialExam.waitDaysAfterLimit}-day wait. This site’s Full{" "}
          {examConfig.questionCount} copies those counts for practice only.
        </p>
        <p>
          Before the commission is issued, § 41-269(C) and (D) still require the oath and a ${officialExam.bondUsd} surety
          bond. The SOS filing page lists a ${officialExam.applicationFeeUsd} standard application fee. That fee, the ${officialExam.examFeeUsd} exam
          charge, and the bond amount are three different things. The Secretary of State
          commissions notaries. {officialExam.provider} runs the proctored exam in the current notice. A surety company
          issues the bond. The notice does not name a required third-party training school.
        </p>
        <p className="notice">
          Official source: <a href={officialExam.commissionStatuteUrl}>A.R.S. § 41-269</a>
          {", "}
          <a href={officialExam.statuteUrl}>A.R.S. § 41-270</a>
          {", "}
          <a href={officialExam.noticeUrl}>SOS exam notice</a>
          {", and "}
          <a href={officialExam.filingUrl}>SOS filing page</a>. Checked {officialExam.checkedOn}. The filing page still
          also cites A.R.S. § 41-312(E) in one block; the qualification text used here is the current § 41-269(B).
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
