import { notFound } from "next/navigation";
import { topics } from "@/data/exam-config";
import { QuestionsClient } from "@/components/QuestionsClient";
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
  return (
    <main className="wrap hero">
      <p className="kicker">Topic Practice</p>
      <h1>{t.label}</h1>
      <p className="lede">Filtered to this knowledge area. Explanations show as soon as you answer.</p>
      <QuestionsClient topic={t.id as TopicId} />
    </main>
  );
}
