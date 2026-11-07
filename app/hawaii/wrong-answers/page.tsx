import type { Metadata } from "next";
import { CloudMistakes } from "@/components/CloudMistakes";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Wrong Answers" },
  description: "Hawaii notary questions missed or saved on this account.",
  alternates: { canonical: canonicalUrl("/hawaii/wrong-answers/") },
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; attempt?: string }>;
}) {
  const { topic, attempt } = await searchParams;
  return <CloudMistakes stateCode="HI" initialTopic={topic} attemptId={attempt || ""} />;
}
