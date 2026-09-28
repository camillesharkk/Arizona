import Link from "next/link";
import { examConfig } from "@/data/exam-config";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import { eligibleExamPool } from "@/lib/quiz";
import { getSource } from "@/data/sources";

export const metadata = pageMeta({
  title: "Free Arizona Notary Practice Test 2026",
  description: "Start a free Arizona notary practice test without registration. Quick 10 or your first Full 45, with scores, answer explanations and official sources.",
  path: paths.practice,
});

export default function PracticeTestPage() {
  const pool = eligibleExamPool();
  const free = pool.filter((q) => q.is_free);
  const samples = ["commission", "identification", "acknowledgments", "jurats", "seals-fees", "prohibited-acts"]
    .flatMap((topic) => free.filter((q) => q.topic === topic).slice(0, 1));
  return (
    <main className="wrap hero">
      <p className="kicker">Practice Test</p>
      <h1>Free Arizona Notary Practice Test {examConfig.year}</h1>
      <p className="lede">
        Free Quick 10 and your first {examConfig.questionCount}-question full practice test. No registration or email required to start.
        Get your score, topic accuracy, correct answers, explanations and official references when you finish.
      </p>
      <p>
        <strong>{pool.length} unique questions in the active bank; {free.length} available for free topic practice.</strong>{" "}
        Quick 10 draws from the free pool. Full 45 draws {examConfig.questionCount} distinct questions from the full bank;
        later attempts can repeat questions. Unlimited full tests and additional Pro features are paid.
      </p>
      <PracticeLaunch />
      <p className="notice">Independent practice questions, not official exam questions. An account is optional for saving progress across devices.</p>
      <section className="card" style={{ margin: "20px 0" }}>
        <h2>What happens during and after the test?</h2>
        <p>
          Quick 10 shows feedback after each answer. Full 45 gives you {examConfig.timeLimitMinutes} minutes and hides
          explanations until submission. Results show the number correct, percentage, accuracy by topic and the
          answer explanation for every question. Missed topics link back to the free study guide.
        </p>
        <p>
          The simulation uses an {examConfig.passingScorePercent}% practice target ({Math.ceil(examConfig.questionCount * examConfig.passingScorePercent / 100)} of {examConfig.questionCount}).
          A practice pass is not a commission or an official exam result. The official exam provides its own on-screen manual;
          a physical manual is not allowed. Check the <a href={examConfig.officialExamUrl}>Arizona SOS exam instructions</a> before booking.
        </p>
      </section>
      <section aria-labelledby="sample-questions">
        <h2 id="sample-questions">Sample Arizona notary questions with answers and explanations</h2>
        <p>These are actual items from this site’s practice bank. Read every answer here without starting a quiz or creating an account.</p>
        {samples.map((q, i) => {
          const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
          return (
            <article key={q.question_id} className="card" style={{ marginTop: 16 }}>
              <h3>{i + 1}. {q.question_text}</h3>
              <ol type="A">{Object.entries(options).map(([letter, text]) => <li key={letter}>{text}</li>)}</ol>
              <p><strong>Answer: {q.correct_option}. {options[q.correct_option]}</strong></p>
              <p>{q.explanation}</p>
              <p>Official basis: <a href={getSource(q.source_id).url}>{q.source_reference}</a></p>
              <Link href={paths.topic(q.topic)}>Practice more questions on this topic</Link>
            </article>
          );
        })}
      </section>
      <section className="card" style={{ marginTop: 24 }}>
        <h2>Choose your next step</h2>
        <p>Need the rules explained? Read the <Link href={paths.study}>free Arizona Notary Study Guide</Link>.</p>
        <p>Need a study schedule? Follow the <Link href={paths.examPrep}>seven-step exam preparation plan</Link>.</p>
      </section>
    </main>
  );
}
