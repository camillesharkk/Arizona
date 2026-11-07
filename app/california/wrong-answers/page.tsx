import type { Metadata } from "next";
import { CloudMistakes } from "@/components/CloudMistakes";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Wrong Answers" },
  description: "California notary questions missed or saved on this account.",
  alternates: { canonical: canonicalUrl("/california/wrong-answers/") },
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; attempt?: string }>;
}) {
  const { topic, attempt } = await searchParams;
  return <CloudMistakes stateCode="CA" initialTopic={topic} attemptId={attempt || ""} />;
}
