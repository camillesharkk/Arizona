import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { StateCheckout } from "@/components/StateCheckout";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", indiana: "IN", "north-carolina": "NC", connecticut: "CT" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const counts = pack.counts();
  if (code === "LA") {
    return <main className="wrap"><StateCheckout source={code} /></main>;
  }
  return (
    <main className="wrap">
      <h1>{pack.name} practice access</h1>
      <div className="card">
        <p>{counts.free} of {counts.published} published questions are free. One full practice is included. Pro is the same 60-day account product used in every available state. It does not create a separate state fee.</p>
        <a className="btn btn-ghost" href={`${pack.paths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <StateCheckout source={code} />
    </main>
  );
}
