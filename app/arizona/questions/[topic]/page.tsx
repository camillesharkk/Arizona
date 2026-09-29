import { notFound } from "next/navigation";
import { topics } from "@/data/exam-config";
import { QuestionsClient } from "@/components/QuestionsClient";
import { eligibleExamPool } from "@/lib/quiz";
import type { TopicId } from "@/lib/types";

export function generateStaticParams() {
  return topics.map((t) => ({ topic: t.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = topics.find((x) => x.id === topic);
  if (!t) return { title: "Topic Practice" };
  return {
    title: `${t.label} Practice`,
    description: `Arizona notary practice questions on ${t.label}, with explanations and official sources.`,
  };
}

export default async function TopicPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const t = topics.find((x) => x.id === topic);
  if (!t) notFound();
  const topicId = t.id as TopicId;
  const freeCount = eligibleExamPool({ topic: topicId, freeOnly: true }).length;
  const allCount = eligibleExamPool({ topic: topicId }).length;
  return (
    <main className="wrap hero">
      <p className="kicker">Topic Practice</p>
      <h1>{t.label}</h1>
      <p className="lede">
        {freeCount > 0
          ? `${freeCount} of ${allCount} questions in this topic are free. Explanations show as soon as you answer. The rest are Pro.`
          : `All ${allCount} questions in this topic are Pro-only. Free Quick 10 and topics that have free questions stay available.`}
      </p>
      <QuestionsClient topic={topicId} />
    </main>
  );
}
