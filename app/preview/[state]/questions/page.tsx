import { notFound } from "next/navigation";
import { QuestionsClient } from "@/components/QuestionsClient";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (process.env.STATE_PREVIEW !== "1") notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  return (
    <main className="wrap hero">
      <h1>{pack.name} questions</h1>
      <QuestionsClient stateCode={code} questions={pack.questions()} />
    </main>
  );
}
