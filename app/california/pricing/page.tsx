import type { Metadata } from "next";
import { caQuestionCounts } from "@/data/ca-questions";
import { caCards } from "@/data/ca-cards";
import { siteUrl } from "@/lib/site";
import { caPaths } from "@/lib/ca-site";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Practice Access" },
  description: "California Pro is not open. The published question bank and study cards are free.",
  alternates: { canonical: `${siteUrl()}/california/pricing/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California access</h1>
      <div className="card">
        <p>{counts.free} of {counts.published} published questions are free, and all {caCards.length} study cards are free. One full 45-question practice exam is included.</p>
        <p>California Pro is not open. There is no California checkout, and an Arizona Pro purchase does not unlock California.</p>
        <a className="btn btn-primary" href={`${caPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
    </main>
  );
}
