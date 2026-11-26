import { MemberCopy } from "@/components/MemberCopy";
import Link from "next/link";
import { Suspense } from "react";
import { examConfig, officialExam } from "@/data/exam-config";
import { AnswerExplain } from "@/components/AnswerExplain";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import { eligibleExamPool } from "@/lib/quiz";

const practicePool = eligibleExamPool();
const freeQuestions = practicePool.filter((question) => question.is_free);
const publicSampleIds = ["az-001", "az-007", "az-012", "az-016", "az-024", "az-029"];

export const metadata = pageMeta({
  title: "Arizona Notary Practice Test | Free Quick 10 & Full 45",
  description: `Prepare for the Arizona notary exam with independent questions and explanations. Use ${freeQuestions.length} free questions for Quick 10 and topic practice, or try the timed Full ${examConfig.questionCount}.`,
  path: paths.practice,
});

export default function PracticeTestPage() {
  const samples = publicSampleIds.flatMap(id => freeQuestions.filter(question => question.question_id === id));
  return (
    <main className="wrap hero">
      <p className="kicker">Practice Test</p>
      <h1>Arizona Notary Practice Test</h1>
      <p>
        Try Quick 10 or practice one topic for feedback as you answer. Use Full {examConfig.questionCount} for a timed practice exam with a score and explanations after you submit.
      </p>
      <p>
        <MemberCopy member={<>Your Pro access includes all {practicePool.length} questions and additional full practice exams.</>}>
          Quick 10 and topic practice draw from {freeQuestions.length} free questions. One introductory Full {examConfig.questionCount} can include Pro questions. Pro adds the other {practicePool.length - freeQuestions.length} questions and additional full attempts.
        </MemberCopy>
      </p>
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch />
      </Suspense>
      <section className="card" style={{ margin: "20px 0" }}>
        <h2>What happens during and after the test?</h2>
        <p>
          Full {examConfig.questionCount} gives you {examConfig.timeLimitMinutes} minutes. Our practice target is {examConfig.passingScorePercent}%.
          Each practice set uses independently written questions. After submitting, review the explanations for the questions you missed.{" "}
          <a href={officialExam.noticeUrl}>Official Arizona exam requirements</a>
        </p>
      </section>
      <section aria-labelledby="sample-questions">
        <h2 id="sample-questions">Sample Arizona notary questions with answers and explanations</h2>
        <p><MemberCopy member={<>These items are from the starter set.</>}>These items are from the free set.</MemberCopy></p>
        {samples.map((q, i) => {
          const options = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
          return (
            <article key={q.question_id} className="card" style={{ marginTop: 16 }}>
              <h3>{i + 1}. {q.question_text}</h3>
              <ol type="A">{Object.entries(options).map(([letter, text]) => <li key={letter}>{text}</li>)}</ol>
              <p><strong>Answer: {q.correct_option}. {options[q.correct_option]}</strong></p>
              <AnswerExplain question={q} explanation={q.explanation} />
              <Link className="btn btn-ghost card-action" href={paths.topic(q.topic)}>Practice more questions on this topic</Link>
            </article>
          );
        })}
      </section>
      <p style={{ marginTop: 24 }}>
        <Link href={paths.study}>Study Guide</Link>
        {" · "}
        <Link href={paths.examPrep}>Exam preparation plan</Link>
        {" · "}
        <Link href={paths.guidesIndex}>Exam guides</Link>
        {" · "}
        <MemberCopy member={<Link href={paths.daily}>Continue in Daily Study</Link>}><Link href={paths.pricing}>What Pro adds</Link></MemberCopy>
      </p>
    </main>
  );
}
