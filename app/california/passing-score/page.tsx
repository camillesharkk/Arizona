import type { Metadata } from "next";
import { StateSectionCrumb } from "@/components/Breadcrumb";
import { CA_EXAM } from "@/lib/ca-site";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Passing Score" },
  description: "The official California notary exam requires a scaled score of at least 70. A scaled score is not a percent.",
  alternates: { canonical: canonicalUrl("/california/passing-score/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <StateSectionCrumb state="CA" name="Passing score" path="/california/passing-score/" />
      <h1>California passing score</h1>
      <div className="card">
        <p>CPS HR says a scaled score of at least 70 is required. Scaled scores run from 0 to 100 so different exam forms can be compared. A scaled score is not calculated by dividing the number correct by the number of questions.</p>
        <p>On this site, 8 of 10 on the short check is only a study cutoff. A full practice result shows how many of the 40 scored items were correct. Neither number is an official pass.</p>
        <p>Free practice can show whether you recall a rule. It cannot produce the scaled score. One full practice exam is free, and the published questions include explanations.</p>
        <p>Checked {CA_EXAM.checkedOn}. <a href={CA_EXAM.sources.exam}>Official exam information</a>{" · "}<a href="/california/how-hard/">Readiness guide</a>{" · "}<a href="/california/exam-retake/">Retake rules</a></p>
      </div>
    </main>
  );
}
