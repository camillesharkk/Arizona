import Link from "next/link";
import { examConfig } from "@/data/exam-config";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import { eligibleExamPool } from "@/lib/quiz";
import { getSource } from "@/data/sources";

const practicePool = eligibleExamPool();
const practiceFreeCount = practicePool.filter((q) => q.is_free).length;

export const metadata = pageMeta({
  title: "Arizona Notary Exam Practice Test 2026 | Free Quick 10 & Full 45",
  description: `Practice bank of ${practicePool.length} questions. ${practiceFreeCount} are free for Quick 10 and topic practice. Pro includes all ${practicePool.length}. Each Full 45 draws ${examConfig.questionCount}. Not official exam questions.`,
  path: paths.practice,
  keywords: "Arizona notary exam practice test, free Arizona notary practice test",
});

export default function PracticeTestPage() {
  const pool = practicePool;
  const free = pool.filter((q) => q.is_free);
  const samples = ["commission", "identification", "acknowledgments", "jurats", "seals-fees", "prohibited-acts"]
    .flatMap((topic) => free.filter((q) => q.topic === topic).slice(0, 1));
  return (
    <main className="wrap hero">
      <p className="kicker">Practice Test</p>
      <h1>Arizona Notary Exam Practice Test — Free Quick 10 & Full 45</h1>
      <p className="lede">
        Free Quick 10 and one free {examConfig.questionCount}-question Full 45 in this browser. No registration or email required to start.
        Get your score, topic accuracy, correct answers, explanations and official references when you finish.
      </p>
      <p>
        <strong>
          The practice bank has {pool.length} questions. {free.length} are free. Pro can use all {pool.length}. Each Full 45
          draws {examConfig.questionCount} distinct questions from that bank.
        </strong>{" "}
        Quick 10 and topic practice without Pro use only the {free.length} free questions. The other {pool.length - free.length} are
        Pro-only. One free Full 45 in this browser can include Pro questions. A later full exam in the same browser is a Pro
        feature. The reminder lives in this browser’s storage; clearing it or using another browser starts a new reminder. It is
        not a per-person or per-account limit. A signed-in free account still has one recorded full exam on the server. Later
        attempts can repeat questions.
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
          A practice pass is not a commission or an official exam result. Older SOS notices described an on-screen manual and no
          physical manual. That format was not re-read from the SOS page on 2026-09-29. Check the{" "}
          <a href={examConfig.officialExamUrl}>Arizona SOS exam instructions</a> before booking.
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
        <p>Need a number, not a full test yet? Open the <Link href={paths.guidesIndex}>exam guide matrix</Link> (passing score, question count, fees, bond, RON).</p>
        <p>Ready for the rest of the bank? See <Link href={paths.pricing}>Arizona Notary Exam Prep Pro</Link>.</p>
      </section>
    </main>
  );
}
