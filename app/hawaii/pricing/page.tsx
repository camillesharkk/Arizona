import type { Metadata } from "next";
import { hiCards } from "@/data/hi-cards";
import { hiQuestionCounts } from "@/data/hi-questions";
import { hiPaths } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

const counts = hiQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Practice Access" },
  description: "Hawaii Pro is not open. The published Hawaii question bank and study cards are free.",
  alternates: { canonical: `${siteUrl()}/hawaii/pricing/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii access</h1>
      <div className="card">
        <p>{counts.free} of {counts.published} published questions are free, and all {hiCards.length} study cards are free. One Comprehensive Practice is included. That set is 50 questions with no time limit.</p>
        <p>Hawaii Pro is not open. There is no Hawaii checkout. An Arizona or California purchase does not unlock Hawaii.</p>
        <a className="btn btn-primary" href={`${hiPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
    </main>
  );
}
