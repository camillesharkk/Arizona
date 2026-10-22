import { CloudMistakes } from "@/components/CloudMistakes";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";

export const metadata = pageMeta({
  title: "Wrong Answers",
  description: "Cloud-synced Arizona notary missed questions with filters and accuracy history.",
  path: paths.mistakes,
});

export default async function MistakesPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;
  return (
    <main className="wrap hero">
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Wrong Answers", path: paths.mistakes }]} />
      <h1>Wrong-answer notebook</h1>
      <CloudMistakes initialTopic={topic} />
    </main>
  );
}
