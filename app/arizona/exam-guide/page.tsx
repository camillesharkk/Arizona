import Link from "next/link";
import { examConfig } from "@/data/exam-config";
import { OfficialBadge } from "@/components/Chrome";

export const metadata = {
  title: "Arizona Notary Exam Guide 2026",
  description:
    "Arizona notary exam format, cost notes, passing score, registration, and what to do if you fail.",
};

const faqs = [
  {
    q: "How many questions are on the exam?",
    a: `This site models ${examConfig.questionCount} questions. Confirm live on the SOS page.`,
  },
  {
    q: "What is the passing score?",
    a: `${examConfig.passingScorePercent}% is the configured passing score. Re-verify before test day.`,
  },
  {
    q: "Is it open book?",
    a: examConfig.openBook
      ? "Yes, the configured format is open book. Bring only what SOS allows."
      : "The configured format is closed book.",
  },
  {
    q: "What if I fail?",
    a: "Follow SOS retake rules. Use Weak Areas on this site, then attempt the official exam again only when you are ready.",
  },
];

export default function ExamGuidePage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Exam Guide</p>
      <h1>Arizona Notary Exam Guide {examConfig.year} — Format, Cost, Passing Score & Registration</h1>
      <OfficialBadge verified={examConfig.lastVerifiedAt} reference="High-risk fields come from exam configuration." />
      <div className="grid grid-4 stats-mobile" style={{ margin: "20px 0" }}>
        <div className="stat">
          <b>{examConfig.questionCount}</b>
          <span>Questions</span>
        </div>
        <div className="stat">
          <b>{examConfig.timeLimitMinutes} min</b>
          <span>Time</span>
        </div>
        <div className="stat">
          <b>{examConfig.passingScorePercent}%</b>
          <span>Pass</span>
        </div>
        <div className="stat">
          <b>${examConfig.applicationFeeUsd}</b>
          <span>Listed application fee (verify)</span>
        </div>
      </div>
      <div className="row">
        <Link className="btn btn-primary" href="/arizona/practice-test/">
          Take Free Practice Test
        </Link>
        <a className="btn btn-ghost" href={examConfig.officialExamUrl} target="_blank" rel="noreferrer">
          Official Registration
        </a>
      </div>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Who needs the exam</h2>
        <p>New applicants generally must pass. Renewing notaries should read current SOS instructions—do not assume a waiver from an old blog post.</p>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h2>How to register</h2>
        <ol>
          <li>Read eligibility on the Arizona Secretary of State notary page.</li>
          <li>Complete the official application path SOS publishes.</li>
          <li>Schedule or start the exam using only official links.</li>
          <li>Keep a copy of any confirmation you receive.</li>
        </ol>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h2>Exam day</h2>
        <p>Bring required identification and any allowed reference materials. Know acknowledgment vs jurat before you sit down—open book still has a clock.</p>
      </section>
      <section className="card" style={{ marginTop: 16 }}>
        <h2>After you pass</h2>
        <p>Bond, oath, and supplies are still ahead. A practice-test pass is not a commission.</p>
        <Link href="/arizona/become-a-notary/">Continue to Become a Notary</Link>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>FAQ</h2>
        {faqs.map((f) => (
          <details className="card" key={f.q} style={{ marginBottom: 10 }}>
            <summary>
              <strong>{f.q}</strong>
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
      <p style={{ marginTop: 24 }}>
        <Link className="btn btn-primary" href="/arizona/practice-test/">
          Try the Free Practice Test
        </Link>
      </p>
    </main>
  );
}
