import Link from "next/link";
import { examConfig, officialExam, topics } from "@/data/exam-config";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { JsonLd, quizJson } from "@/components/JsonLd";
import { HomeProCta } from "@/components/HomeProCta";
import { AccountStatusBanner } from "@/components/AccountStatusBanner";
import { HomeStudy } from "@/components/HomeStudy";
import { searchMatrix } from "@/lib/seo-guides";
import { eligibleExamPool } from "@/lib/quiz";
import { flashcards } from "@/data/flashcards";
import { getSource } from "@/data/sources";
import { FREE_FLASHCARD_PREVIEW } from "@/lib/product";

const bank = eligibleExamPool();
const freeCount = bank.filter((q) => q.is_free).length;
const previewCards = flashcards.slice(0, FREE_FLASHCARD_PREVIEW).map((card) => {
  const source = getSource(card.source_id);
  return {
    id: card.id,
    category: card.category,
    front: card.front,
    back: card.back,
    source: source.reference,
    sourceUrl: source.url,
  };
});

export const metadata = pageMeta({
  title: "Arizona Notary Exam 2026",
  description: "Free Arizona notary exam practice: 45-question test, study guide, and official-source questions.",
  path: paths.home,
  keywords: "Arizona notary exam, Arizona notary test, Arizona notary 2026",
});

export default function ArizonaHub() {
  return (
    <main className="home-canvas">
    <div className="wrap home-main">
      <JsonLd data={quizJson()} />
      <AccountStatusBanner />
      <h1>Arizona Notary Study &amp; Practice</h1>
      <HomeStudy cards={previewCards} />

      <section className="home-after">
        <h2>Exam practice details</h2>
        <p>
          Quick Practice above is 10 free questions. An explanation appears after you answer, and it does not use your one free full exam.
          A full practice exam is {examConfig.questionCount} questions and starts only when you choose it.
          {freeCount} questions are free. Pro includes all {bank.length}. The flashcards above are a free preview; the rest of that deck is part of Pro.
        </p>
        <p className="notice">
          Independent practice, not the Arizona Secretary of State.{" "}
          <a href={officialExam.filingUrl}>Check the official notary page</a> before you apply.
        </p>
        <p className="notice">{examConfig.disclaimer}</p>
        <h2>Keep studying</h2>
        <ul className="home-links">
          <li><Link href={paths.study}>Study guide</Link></li>
          <li><Link href={paths.examPrep}>Exam format and registration</Link></li>
          <li><Link href={paths.questions}>Questions and explanations</Link></li>
          <li><Link href={paths.become}>How to become a notary</Link></li>
          <li><Link href={paths.laws}>2026 law updates</Link></li>
          <li><Link href={paths.pricing}>Free and Pro access</Link></li>
        </ul>
        <h2>Practice by topic</h2>
        <ul className="home-links">
          {topics.map((topic) => (
            <li key={topic.id}>
              <Link href={paths.topic(topic.id)}>{topic.label}</Link>
            </li>
          ))}
        </ul>
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
    </div>
    </main>
  );
}
