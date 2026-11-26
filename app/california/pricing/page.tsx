import { MemberCopy } from "@/components/MemberCopy";
import type { Metadata } from "next";
import { StateCheckout } from "@/components/StateCheckout";
import { caQuestionCounts } from "@/data/ca-questions";
import { caCards } from "@/data/ca-cards";
import { canonicalUrl } from "@/lib/site";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { AI_LIMIT_FREE, AI_LIMIT_PRO } from "@/lib/product";

const counts = caQuestionCounts();

export const metadata: Metadata = {
  title: { absolute: "California Notary Practice Access" },
  description: "Compare free California notary practice with Pro plans for repeat full practice exams and a higher AI Tutor allowance.",
  alternates: { canonical: canonicalUrl("/california/pricing/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California Pro</h1>
      <div className="card">
        <p>{counts.free} of {counts.published}<MemberCopy member={<> published questions are available to all learners, and all </>}> published questions are free, and all </MemberCopy>{caCards.length}<MemberCopy member={<> study cards are available to all learners.</>}> study cards are free.</MemberCopy> One full {CA_EXAM.questionCount}-question practice exam is included.</p>
        <p>Sign in with a free account to review missed or saved questions by topic, use Daily Study, and sync your progress across devices.</p>
        <p>Pro lets you take additional full practice exams and raises your daily AI Tutor allowance from {AI_LIMIT_FREE} to {AI_LIMIT_PRO}. One purchase covers Pro features across available states.</p>
        <a className="btn btn-ghost" href={`${caPaths.practice}?mode=quick`}>Check My Knowledge — 10 Questions</a>
      </div>
      <StateCheckout source="CA" />
    </main>
  );
}
