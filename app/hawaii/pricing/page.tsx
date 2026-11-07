import type { Metadata } from "next";
import { StateCheckout } from "@/components/StateCheckout";
import { hiCards } from "@/data/hi-cards";
import { hiQuestionCounts } from "@/data/hi-questions";
import { hiPaths } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

const counts = hiQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Practice Access" },
  description: "Hawaii Pro is 60 days of extra comprehensive practice. The published question bank stays available on the free plan.",
  alternates: { canonical: `${siteUrl()}/hawaii/pricing/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii Pro</h1>
      <div className="card">
        <p>{counts.free} of {counts.published} published questions are free, and all {hiCards.length} study cards are free. One Comprehensive Practice is included. That set is 50 questions with no time limit, and that count is this site's practice setting.</p>
        <p>The published Hawaii questions and study cards are included. Pro removes the one-practice limit and uses the account AI tutor allowance. One purchase covers Arizona, California, and Hawaii.</p>
        <a className="btn btn-ghost" href={`${hiPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <StateCheckout source="HI" />
    </main>
  );
}
