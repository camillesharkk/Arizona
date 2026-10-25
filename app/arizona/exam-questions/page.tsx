import Link from "next/link";
import { QuestionsClient } from "@/components/QuestionsClient";
import { QuestionPageCtas } from "@/components/QuestionPageCtas";
import { examConfig, officialExam } from "@/data/exam-config";
import { AnswerExplain } from "@/components/AnswerExplain";
import { getSource } from "@/data/sources";
import { eligibleExamPool } from "@/lib/quiz";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

const questionPool = eligibleExamPool();
const questionFreeCount = questionPool.filter((q) => q.is_free).length;

export const metadata = pageMeta({
  title: "Arizona Notary Exam Questions and Answers 2026",
  description: `${questionPool.length} practice questions, ${questionFreeCount} free. Pro includes all ${questionPool.length}. Each Full 45 draws ${examConfig.questionCount}. Not official exam questions.`,
  path: paths.questions,
  keywords: "Arizona notary exam questions and answers, Arizona notary practice questions",
});

export default function ExamQuestionsPage() {
  const pool = questionPool;
  const free = pool.filter((q) => q.is_free);
  const samples = ["commission", "identification", "acknowledgments", "jurats", "seals-fees", "prohibited-acts"]
    .flatMap((topic) => free.filter((q) => q.topic === topic).slice(0, 1));
  return (
    <main className="wrap hero">
      <p className="kicker">Exam Questions</p>
      <h1>Arizona Notary Exam Questions and Answers</h1>
      <p className="lede">
        Practice one rule at a time. Every item stores an official source, not just a letter key. Filter by topic or missed items below.
      </p>
      <p>
        This page uses the practice bank: {pool.length} questions, of which {free.length} are free. Pro can use all {pool.length}.
        Topics with no free questions stay in the Pro bank. A.R.S. § 41-270 allows the Secretary of State to require an exam and does
        not set the question count. The SOS notice checked on {officialExam.checkedOn} says the official exam has {officialExam.questionCount} questions.
        Each Full 45 here draws {examConfig.questionCount} practice questions from this bank. Take a{" "}
        <Link href={`${paths.practice}?mode=quick`}>free 10-question test</Link> or a{" "}
        <Link href={`${paths.practice}?mode=full`}>timed Full 45</Link>.
      </p>
      <QuestionPageCtas />
      <div id="start">
        <QuestionsClient />
      </div>
      <section aria-labelledby="sample-qa" style={{ marginTop: 28 }}>
        <h2 id="sample-qa">Sample questions with answers (no account required)</h2>
        <p>These are live free-bank items.</p>
        {samples.map((q, i) => {
          const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
          return (
            <article key={q.question_id} className="card" style={{ marginTop: 16 }}>
              <h3>{i + 1}. {q.question_text}</h3>
              <ol type="A">{Object.entries(options).map(([letter, text]) => <li key={letter}>{text}</li>)}</ol>
              <p><strong>Answer: {q.correct_option}. {options[q.correct_option]}</strong></p>
              <AnswerExplain explanation={q.explanation} sourceUrl={getSource(q.source_id).url} sourceLabel={q.source_reference} />
              <Link href={paths.topic(q.topic)}>More questions on this topic</Link>
            </article>
          );
        })}
      </section>
      <p className="notice" style={{ marginTop: 24 }}>
        Progress is saved on this device. Create a free account to keep the cloud notebook.
      </p>
    </main>
  );
}
