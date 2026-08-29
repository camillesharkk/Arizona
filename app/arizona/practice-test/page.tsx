import Link from "next/link";
import { examConfig } from "@/data/exam-config";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { OfficialBadge } from "@/components/Chrome";
import { paths } from "@/lib/paths";

export const metadata = {
  title: "Free Arizona Notary Practice Test 2026",
  description: "Free Arizona notary practice test: 45 questions, 60 minutes, instant scoring.",
};

export default function PracticeTestPage() {
  return (
    <main className="wrap hero">
      <p className="kicker">Practice Test</p>
      <h1>Free Arizona Notary Practice Test {examConfig.year}</h1>
      <p className="lede">
        {examConfig.questionCount} questions · {examConfig.timeLimitMinutes} minutes · passing score{" "}
        {examConfig.passingScorePercent}% · {examConfig.openBook ? "open book" : "closed book"} model.
      </p>
      <OfficialBadge verified={examConfig.lastVerifiedAt} reference={examConfig.disclaimer} />
      <div className="row" style={{ margin: "16px 0 8px" }}>
        <Link className="btn btn-ghost" href={paths.mistakes}>
          Practice Weak Areas
        </Link>
        <Link className="btn btn-ghost" href={paths.register}>
          Create Free Account
        </Link>
      </div>
      <div className="card" style={{ margin: "20px 0" }}>
        <h2>Exam rules on this simulation</h2>
        <p>
          Full exam mode hides explanations until you submit. Quick 10 and Weak Areas teach as you
          go. Advertisements are not shown during a timed attempt.
        </p>
      </div>
      <PracticeLaunch />
    </main>
  );
}
