import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { QuestionsClient } from "@/components/QuestionsClient";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", indiana: "IN", connecticut: "CT", "north-carolina": "NC" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
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
