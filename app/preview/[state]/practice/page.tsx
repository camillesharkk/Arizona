import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { PracticeLaunch } from "@/components/PracticeLaunch";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (process.env.STATE_PREVIEW !== "1") notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const counts = pack.counts();
  return (
    <main className="wrap hero">
      <p className="kicker">Practice preview</p>
      <h1>{pack.name} practice</h1>
      <p>
        <strong>{counts.published} published questions. {counts.free} are free and {counts.pro} are Pro.</strong> {pack.fullDetail}
      </p>
      <Suspense fallback={<p className="notice">Loading exam…</p>}>
        <PracticeLaunch stateCode={code} />
      </Suspense>
    </main>
  );
}
