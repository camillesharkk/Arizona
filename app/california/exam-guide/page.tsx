import type { Metadata } from "next";
import { StateSectionCrumb } from "@/components/Breadcrumb";
import { CA_EXAM } from "@/lib/ca-site";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Guide" },
  description: "The California notary exam has 45 multiple-choice items, a one-hour limit, and a scaled passing score of 70.",
  alternates: { canonical: canonicalUrl("/california/exam-guide/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <StateSectionCrumb state="CA" name="Exam guide" path="/california/exam-guide/" />
      <h1>California exam guide</h1>
      <div className="card">
        <p>CPS HR, checked {CA_EXAM.checkedOn}, describes a closed-book exam of 45 multiple-choice items with a one-hour limit. Forty items are scored. Five are not. A candidate may test once in a calendar month.</p>
        <ul>
          {CA_EXAM.quotas.map((quota) => (
            <li key={quota.area}>{quota.label}: {quota.count} scored items</li>
          ))}
        </ul>
        <p>The exam is closed book. A candidate may test once in a calendar month. A second score in the same month is invalid and the fee is forfeited. Failing candidates receive a mailed notice. Results are not given by phone.</p>
        <p>Passing the official exam requires a scaled score of at least 70. That score is not the number correct divided by 45 or by 40. This site does not issue a scaled score or an official pass.</p>
        <p>Free Quick 10 shows the explanation after each question. One full practice exam is free. The published questions are free. Pro does not unlock a hidden California bank. It removes the one-exam limit for 60 days in every available state.</p>
        <p><a href="/california/open-book/">Closed-book rule</a>{" · "}<a href="/california/exam-retake/">Retake rules</a>{" · "}<a href="/california/how-hard/">Readiness</a></p>
        <p><a href={CA_EXAM.sources.exam}>CPS HR exam information</a></p>
      </div>
    </main>
  );
}
