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
      <h1>{pack.name} exam guide</h1>
      <div className="card">
        <p>{pack.fullDetail}</p>
        <p>Quick 10 is a free check. Eight or more correct is a study recommendation on this site. It is not an official passing score.</p>
        <p><a href={pack.paths.practice}>Open practice</a>{" · "}<a href={pack.paths.resources}>Sources and articles</a>{" · "}<a href={pack.paths.passingScore}>Scores and retakes</a>{" · "}<a href={pack.paths.become}>Apply for a commission</a></p>
      </div>
    </main>
  );
}
