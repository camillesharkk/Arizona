import type { Metadata } from "next";
import { Suspense } from "react";
import { PracticeAfterword } from "@/components/PracticeAfterword";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { publishedHiQuestions, hiQuestionCounts } from "@/data/hi-questions";
import { getSource } from "@/data/sources";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { hiStudyTopics } from "@/lib/hi-topics";
import { siteUrl } from "@/lib/site";

const counts = hiQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Practice Test" },
  description: `Free Hawaii notary Quick 10, plus a ${HI_EXAM.practiceQuestionCount}-question Comprehensive Practice with no time limit. This count is this site's practice setting.`,
  alternates: { canonical: `${siteUrl()}/hawaii/practice/` },
};

export default function Page() {
  const free = publishedHiQuestions().filter((q) => q.is_free);
  const samples = hiStudyTopics.slice(0, 6).flatMap((topic) => {
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
      moreHref: `${hiPaths.questions}?topic=${topic.id}`,
    }];
  });
  return (
    <main className="wrap hero">
      <p className="kicker">Practice Test</p>
      <h1>Hawaii Notary Practice Test — Free Quick 10 & Comprehensive Practice</h1>
      <p>
        <strong>
          The practice bank has {counts.published} questions. {counts.free} are free. Comprehensive Practice draws {HI_EXAM.practiceQuestionCount} distinct questions and has no time limit. That count is this site's practice setting.
        </strong>{" "}
        Quick 10 is free and shows each explanation immediately. The official exam is a separate closed-book test. Its question count is not the 50 used here.
      </p>
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch stateCode="HI" />
      </Suspense>
      <PracticeAfterword
        during="Quick 10 shows whether the answer is correct after each question. Comprehensive Practice has no time limit and hides explanations until you submit. The site practice target is 80%. Hawaii has not published an official question count or time limit, so this score is not an official pass."
        samples={samples}
        links={[
          { href: hiPaths.study, label: "Study Guide" },
          { href: hiPaths.questions, label: "Question bank" },
          { href: hiPaths.pricing, label: "Pro" },
        ]}
      />
    </main>
  );
}
