import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeAfterword } from "@/components/PracticeAfterword";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { publishedCaQuestions, caQuestionCounts } from "@/data/ca-questions";
import { getSource } from "@/data/sources";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { caStudyTopics } from "@/lib/ca-topics";
import { siteUrl } from "@/lib/site";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Practice Test" },
  description: "Check 10 California notary questions or take a 45-question, 60-minute practice exam. Forty items are scored.",
  alternates: { canonical: `${siteUrl()}/california/practice/` },
};

export default function Page() {
  const free = publishedCaQuestions().filter((q) => q.is_free);
  const samples = caStudyTopics.slice(0, 6).flatMap((topic) => {
    const q = free.find((item) => item.study_topic === topic.id);
    if (!q) return [];
    return [{
      question_id: q.question_id,
      question_text: q.question_text,
      options: { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d },
      correct: q.correct_option,
      explanation: q.explanation,
      sourceUrl: getSource(q.source_id).url,
      sourceLabel: q.source_reference,
      moreHref: `${caPaths.questions}?topic=${topic.id}`,
    }];
  });
  return (
    <main className="wrap hero">
      <p className="kicker">Practice Test</p>
      <h1>California Notary Practice Test — Free Quick 10 & Full 45</h1>
      <p>
        <strong>
          The practice bank has {counts.published} questions. {counts.free} are free. Each Full 45 draws {CA_EXAM.questionCount} questions, scores {CA_EXAM.scoredCount}, and allows {CA_EXAM.timeLimitMinutes} minutes.
        </strong>{" "}
        Quick 10 is free and shows each explanation immediately. The official exam is a separate closed-book CPS HR test. These questions are practice, not released exam items.
      </p>
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch stateCode="CA" />
      </Suspense>
      <PracticeAfterword
        during={`Quick 10 shows whether the answer is correct after each question. Full 45 gives you ${CA_EXAM.timeLimitMinutes} minutes and hides explanations until you submit. Forty items are scored and five are unscored. The site study route uses ${CA_EXAM.studyCutoff} of 10 on Quick 10. That cutoff is not the official scaled score.`}
        samples={samples}
        links={[
          { href: caPaths.study, label: "Study Guide" },
          { href: caPaths.questions, label: "Question bank" },
          { href: caPaths.pricing, label: "Pro" },
        ]}
      />
    </main>
  );
}
