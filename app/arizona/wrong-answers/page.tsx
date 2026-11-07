import { CloudMistakes } from "@/components/CloudMistakes";

export const metadata = {
  title: "Wrong Answers",
  description: "Review missed Arizona notary practice questions and drill weak items.",
};

export default async function WrongAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string; attempt?: string }>;
}) {
  const { topic, attempt } = await searchParams;
  return <CloudMistakes stateCode="AZ" initialTopic={topic} attemptId={attempt || ""} />;
}
