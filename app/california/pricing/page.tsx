import { MemberCopy } from "@/components/MemberCopy";
import type { Metadata } from "next";
import { StateCheckout } from "@/components/StateCheckout";
import { caQuestionCounts } from "@/data/ca-questions";
import { caCards } from "@/data/ca-cards";
import { canonicalUrl } from "@/lib/site";
import { caPaths } from "@/lib/ca-site";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Practice Access" },
  description: "California Pro is 60 days of extra full exams. The published question bank stays available on the free plan.",
  alternates: { canonical: canonicalUrl("/california/pricing/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California Pro</h1>
      <div className="card">
        <p>{counts.free} of {counts.published}<MemberCopy member={<> published questions are available to all learners, and all </>}> published questions are free, and all </MemberCopy>{caCards.length}<MemberCopy member={<> study cards are available to all learners. One full 45-question practice exam is included.</>}> study cards are free. One full 45-question practice exam is included.</MemberCopy></p>
        <p>Pro removes the one-exam limit and uses the account AI tutor allowance. One purchase covers all available states.</p>
        <a className="btn btn-ghost" href={`${caPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <StateCheckout source="CA" />
    </main>
  );
}
