import type { Metadata } from "next";
import { CA_EXAM } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Exam Guide" },
  description: "The California notary exam has 45 multiple-choice items, a one-hour limit, and a scaled passing score of 70.",
  alternates: { canonical: `${siteUrl()}/california/exam-guide/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California exam guide</h1>
      <div className="card">
        <p>CPS HR, checked {CA_EXAM.checkedOn}, describes a closed-book exam of 45 multiple-choice items with a one-hour limit. Forty items are scored. Five are not. A candidate may test once in a calendar month.</p>
        <ul>
          {CA_EXAM.quotas.map((quota) => (
            <li key={quota.area}>{quota.label}: {quota.count} scored items</li>
          ))}
        </ul>
        <p>Passing the official exam requires a scaled score of at least 70. That score is not the number correct divided by 45 or by 40. This site does not issue a scaled score or an official pass.</p>
        <p><a href={CA_EXAM.sources.exam}>CPS HR exam information</a></p>
      </div>
    </main>
  );
}
