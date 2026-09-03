import Link from "next/link";
import { examConfig, topics } from "@/data/exam-config";
import { OfficialBadge } from "@/components/Chrome";

import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { JsonLd, quizJson } from "@/components/JsonLd";
import { Breadcrumb } from "@/components/Breadcrumb";
import { HomeProCta } from "@/components/HomeProCta";
import { AccountStatusBanner } from "@/components/AccountStatusBanner";

export const metadata = pageMeta({
  title: "Arizona Notary Exam 2026",
  description: "Free Arizona notary exam practice: 45-question test, study guide, and official-source questions.",
  path: paths.home,
  keywords: "Arizona notary exam, Arizona notary test, Arizona notary 2026",
});

export default function ArizonaHub() {
  return (
    <main className="wrap">
      <JsonLd data={quizJson()} />
      <Breadcrumb items={[{ name: "Home", path: paths.home }]} />
      <section className="hero">
        <AccountStatusBanner />
        <p className="kicker">Arizona Notary Exam · {examConfig.year}</p>
        <h1>Pass the Arizona notary exam with a real practice test—not another article.</h1>
        <p className="lede">
          Start in seconds. Finish a timed simulation. See your score, weak topics, and the official
          source behind every item.
        </p>
        <div className="row" style={{ margin: "20px 0" }}>
          <Link className="btn btn-primary" href={paths.practice}>
            Start Free Practice Test
          </Link>
          <Link className="btn btn-ghost hero-secondary-cta" href={paths.examPrep}>
            View Exam Guide
          </Link>
        </div>
        <div className="grid grid-4 stats-mobile">
          <div className="stat">
            <b>{examConfig.questionCount}</b>
            <span>Questions</span>
          </div>
          <div className="stat">
            <b>{examConfig.timeLimitMinutes} min</b>
            <span>Time limit</span>
          </div>
          <div className="stat">
            <b>{examConfig.passingScorePercent}%</b>
            <span>Passing score</span>
          </div>
          <div className="stat">
            <b>{examConfig.openBook ? "Open book" : "Closed book"}</b>
            <span>Exam format</span>
          </div>
        </div>
      </section>

      <section className="grid grid-4" style={{ marginTop: 12 }}>
        <Link href={paths.practice} className="card">
          <h3>Practice Test</h3>
          <p>Quick 10 or full {examConfig.questionCount}. Core product.</p>
        </Link>
        <Link href={paths.study} className="card">
          <h3>Study Guide</h3>
          <p>Study chapters that send you back to the questions.</p>
        </Link>
        <Link href={paths.examPrep} className="card">
          <h3>Exam Guide</h3>
          <p>Format, cost notes, registration, and retakes.</p>
        </Link>
        <Link href={paths.flashcards} className="card">
          <h3>Flashcards</h3>
          <p>Fees, dates, definitions, prohibited acts.</p>
        </Link>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>Current exam status</h2>
        <OfficialBadge
          verified={examConfig.lastVerifiedAt}
          reference="Figures are loaded from exam configuration, not hardcoded in the layout."
        />
        <p>
          Official information:{" "}
          <a href={examConfig.officialExamUrl} target="_blank" rel="noreferrer">
            Arizona Secretary of State — Notary
          </a>
        </p>
        <p className="notice">{examConfig.disclaimer}</p>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2>Practice by topic</h2>
        <p className="lede">
          Drill the rule, then take the full exam.
        </p>
        <div className="grid grid-2">
          {topics.map((t) => (
            <Link key={t.id} href={`/arizona/questions/${t.id}/`} className="card">
              <h3>{t.label}</h3>
              <p>Topic practice with instant feedback.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 28 }}>
        <h2>2026 law updates</h2>
        <p>Track what changed, who is affected, and which questions to drill.</p>
        <Link className="btn btn-primary" href={paths.laws}>
          View Changes
        </Link>
      </section>

      <section className="card" style={{ marginTop: 20 }}>
        <h2>How to become a notary</h2>
        <p>Eligibility → apply → exam → bond → oath → supplies. Know what is required vs optional.</p>
        <Link className="btn btn-ghost" href={paths.become}>
          See the full path
        </Link>
      </section>

      <HomeProCta />
    </main>
  );
}
