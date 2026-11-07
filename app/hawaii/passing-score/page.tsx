import type { Metadata } from "next";
import { HI_EXAM } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Exam Passing Score" },
  description: "The Hawaii notary written exam requires at least 80 percent. A score on this site is practice feedback, not an official result.",
  alternates: { canonical: `${siteUrl()}/hawaii/passing-score/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii passing score</h1>
      <div className="card">
        <p>HAR §5-11-32 says the written exam requires a minimum of 80 percent. The Attorney General does not publish a question count, a time limit, or a scaled-score formula. This site does not invent those.</p>
        <p>On this site, 8 of 10 on Quick 10 only chooses the next study step. Comprehensive Practice uses an 80 percent practice target on its own 50-question set. {HI_EXAM.practiceNote} Neither result is an official exam result.</p>
        <p>A failed official exam can be retaken without a new application only if the request, fee, and new date are handled within 14 days of the failure notice. Two failures require a 90-day wait before a new application. HAR §5-11-32, checked {HI_EXAM.checkedOn}.</p>
        <p>Free Quick 10 shows explanations. It does not issue the official percent. All published Hawaii questions are free.</p>
        <p><a href={HI_EXAM.sources.har}>HAR Chapter 5-11</a>{" · "}<a href="/hawaii/how-hard/">Readiness</a>{" · "}<a href="/hawaii/exam-retake/">Retake rules</a></p>
      </div>
    </main>
  );
}
