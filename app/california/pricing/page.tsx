import type { Metadata } from "next";
import { StateCheckout } from "@/components/StateCheckout";
import { caQuestionCounts } from "@/data/ca-questions";
import { caCards } from "@/data/ca-cards";
import { siteUrl } from "@/lib/site";
import { caPaths } from "@/lib/ca-site";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Practice Access" },
  description: "California Pro is 60 days of extra full exams. The published question bank stays available on the free plan.",
  alternates: { canonical: `${siteUrl()}/california/pricing/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California Pro</h1>
      <div className="card">
        <p>{counts.free} of {counts.published} published questions are free, and all {caCards.length} study cards are free. One full 45-question practice exam is included.</p>
        <p>California Pro removes the one-exam limit and raises the AI tutor allowance for California questions. An Arizona or Hawaii purchase does not unlock California.</p>
        <a className="btn btn-ghost" href={`${caPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <StateCheckout state="CA" />
    </main>
  );
}
