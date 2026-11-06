import { CloudMistakes } from "@/components/CloudMistakes";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Wrong Answers",
  description: "Cloud-synced Arizona notary missed questions with filters and accuracy history.",
  path: paths.mistakes,
});

export default async function MistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; attempt?: string }>;
}) {
  const { topic, attempt } = await searchParams;
  return <CloudMistakes stateCode="AZ" initialTopic={topic} attemptId={attempt || ""} />;
}
