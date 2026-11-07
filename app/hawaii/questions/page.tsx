import type { Metadata } from "next";
import { QuestionsClient } from "@/components/QuestionsClient";
import { publishedHiQuestions, hiQuestionCounts } from "@/data/hi-questions";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { hiStudyLabel, hiStudyTopics } from "@/lib/hi-topics";
import { canonicalUrl } from "@/lib/site";

const counts = hiQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Exam Questions" },
  description: `${counts.published} published Hawaii notary practice questions, with the same filters and resume behavior as the Arizona bank.`,
  alternates: { canonical: canonicalUrl("/hawaii/questions/") },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return (
    <main className="wrap">
      <h1>Hawaii notary exam questions</h1>
      <div className="card">
        <p>{counts.published} published questions. {counts.free} are free. Each item has an explanation and a source. Comprehensive Practice draws {HI_EXAM.practiceQuestionCount} unique questions. That count is this site's practice setting, not an official form. The official exam is closed book and requires 80 percent. Its length and time are not published.</p>
        <ul>
          {Object.entries(counts.topics).map(([id, count]) => (
            <li key={id}>{hiStudyLabel(id)}: {count} published</li>
          ))}
        </ul>
        <a className="btn btn-primary" href={`${hiPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <QuestionsClient
        stateCode="HI"
        topic={topic}
        questions={publishedHiQuestions()}
        topicChoices={hiStudyTopics.map((topic) => ({ id: topic.id, short: topic.label, label: topic.label }))}
      />
    </main>
  );
}
