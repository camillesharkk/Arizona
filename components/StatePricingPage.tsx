import { MemberCopy } from "@/components/MemberCopy";
import { StateCheckout } from "@/components/StateCheckout";
import { prepPacks } from "@/lib/prep-pack";

type StatePricingCode = "CT" | "IN" | "NC" | "NY" | "PA" | "LA";

export function StatePricingPage({ state, preview = false }: { state: StatePricingCode; preview?: boolean }) {
  if (state === "LA") {
    return <main className="wrap"><StateCheckout source={state} preview={preview} /></main>;
  }
  const pack = prepPacks[state];
  const counts = pack.counts();
  return (
    <main className="wrap">
      <h1>{pack.name} practice access</h1>
      <div className="card">
        <p>{counts.free} of {counts.published}<MemberCopy member={<> published questions are available to all learners. One full practice is included. Pro is the same 60-day account product used in every available state. It does not create a separate state fee.</>}> published questions are free. One full practice is included. Pro is the same 60-day account product used in every available state. It does not create a separate state fee.</MemberCopy></p>
        <a className="btn btn-ghost" href={`${pack.paths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <StateCheckout source={state} preview={preview} />
    </main>
  );
}
