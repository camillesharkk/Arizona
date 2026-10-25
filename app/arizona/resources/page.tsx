import Link from "next/link";
import { officialExam, topics } from "@/data/exam-config";
import { pageMeta } from "@/lib/seo";
import { searchMatrix } from "@/lib/seo-guides";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Arizona Notary Study Resources",
  description:
    "How the free 10-question check, full practice exam, topic practice, and guides fit together. Independent of the Arizona Secretary of State.",
  path: paths.resources,
});

export default function ResourcesPage() {
  return (
    <main className="wrap hero resource-page">
      <h1>Study resources</h1>
      <p className="lede">
        Quick 10, the study guide, and the links below are free. Pro opens the rest of the question bank and study cards.
      </p>
      <p>
        <Link href={paths.home}>Back to practice</Link>
      </p>
      <p>
        <a href={officialExam.filingUrl}>Official notary page</a>
      </p>

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
    </main>
  );
}
