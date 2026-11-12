import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  return (
    <main className="wrap">
      <h1>{pack.name} study guide</h1>
      <div className="card">
        <p>Start with a free Quick 10. Read the explanation for each choice, study the matching cards, then use Daily Study to revisit mistakes. The comprehensive practice checks several topics together.</p>
        {pack.topics.map((topic) => (
          <p key={topic.id}><a href={`${pack.paths.practice}?mode=practice&area=${topic.id}`}>{topic.label}</a></p>
        ))}
        <p><a href={pack.paths.studyCards}>Study cards</a>{" · "}<a href={pack.paths.questions}>Question list</a></p>
      </div>
    </main>
  );
}
