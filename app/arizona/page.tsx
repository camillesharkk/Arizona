import Link from "next/link";
import { examConfig, topics } from "@/data/exam-config";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { JsonLd, quizJson } from "@/components/JsonLd";
import { HomeProCta } from "@/components/HomeProCta";
import { AccountStatusBanner } from "@/components/AccountStatusBanner";
import { HomeStudy } from "@/components/HomeStudy";
import { searchMatrix } from "@/lib/seo-guides";
import { eligibleExamPool } from "@/lib/quiz";
import { diagnosticReady } from "@/lib/diagnostic";

const bank = eligibleExamPool();
const freeCount = bank.filter((q) => q.is_free).length;
const showDiagnostic = diagnosticReady("AZ");

export const metadata = pageMeta({
  title: "Arizona Notary Exam 2026",
  description: "Free Arizona notary exam practice: 45-question test, study guide, and official-source questions.",
  path: paths.home,
  keywords: "Arizona notary exam, Arizona notary test, Arizona notary 2026",
});

export default function ArizonaHub() {
  return (
    <main className="wrap home-main">
      <JsonLd data={quizJson()} />
      <AccountStatusBanner />
      <h1>Prepare for the Arizona Notary Exam</h1>
      <p className="lede">
        {showDiagnostic
          ? "Start with 10 questions to see what to review."
          : "Study the guide, use flashcards, or take a practice exam."}
      </p>
      <HomeStudy diagnosticReady={showDiagnostic} />

      <section className="home-next">
        <h2>How practice works</h2>
        <p>
          The knowledge check, when it is offered, uses free published questions and does not use your one free full exam.
          Quick 10 on the <Link href={paths.practice}>practice test</Link> shows the answer after each question.
          A full practice exam is {examConfig.questionCount} questions. {freeCount} questions are free. Pro includes all {bank.length}.
        </p>
      </section>

      <section className="home-next">
        <h2>Keep going</h2>
        <ul className="home-links">
          <li><Link href={paths.study}>Study guide</Link></li>
          <li><Link href={paths.examPrep}>Exam format and registration</Link></li>
          <li><Link href={paths.questions}>Questions and explanations</Link></li>
          <li><Link href={paths.become}>How to become a notary</Link></li>
          <li><Link href={paths.laws}>2026 law updates</Link></li>
          <li><Link href={paths.pricing}>Free and Pro access</Link></li>
        </ul>
        <p className="notice">
          Independent practice, not the Arizona Secretary of State.{" "}
          <a href={examConfig.officialExamUrl}>Check the official notary page</a> before you apply.
        </p>
        <p className="notice">{examConfig.disclaimer}</p>
      </section>

      <section className="home-next">
        <h2>Practice by topic</h2>
        <ul className="home-links">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link href={paths.topic(topic.id)}>{topic.label}</Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="home-next">
        <h2>Guides</h2>
        <ul className="home-links">
          {searchMatrix.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.title}</Link>
            </li>
          ))}
        </ul>
      </section>

      <HomeProCta />
    </main>
  );
}
