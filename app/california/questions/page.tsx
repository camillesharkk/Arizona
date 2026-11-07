import type { Metadata } from "next";
import { QuestionsClient } from "@/components/QuestionsClient";
import { publishedCaQuestions, caQuestionCounts } from "@/data/ca-questions";
import { CA_EXAM, areaLabel, caPaths } from "@/lib/ca-site";
import { caStudyTopics } from "@/lib/ca-topics";
import { siteUrl } from "@/lib/site";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Questions" },
  description: `${counts.published} published California notary questions across the five exam areas.`,
  alternates: { canonical: `${siteUrl()}/california/questions/` },
};

export default async function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  return (
    <main className="wrap">
      <h1>California exam questions</h1>
      <div className="card">
        <p>{counts.published} published questions. {counts.free} are free. Each item has one answer and an explanation tied to the official source. The full practice exam uses 40 scored items and 5 unscored items. The official exam is closed book, one hour, and uses a scaled score of 70 rather than a percent.</p>
        <ul>
          {CA_EXAM.quotas.map((quota) => (
            <li key={quota.area}>{areaLabel(quota.area)}: {counts.areas[quota.area]} published, {quota.count} scored on a full exam</li>
          ))}
        </ul>
        <a className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <QuestionsClient
        stateCode="CA"
        topic={topic}
        questions={publishedCaQuestions()}
        topicChoices={caStudyTopics.map((topic) => ({ id: topic.id, short: topic.label, label: topic.label }))}
      />
    </main>
  );
}
