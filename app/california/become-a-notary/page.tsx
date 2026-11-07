import type { Metadata } from "next";
import { CA_EXAM } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Become a California Notary" },
  description: "California notary appointment steps from the Secretary of State: education, exam, fingerprints, oath, and bond.",
  alternates: { canonical: `${siteUrl()}/california/become-a-notary/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Become a California notary</h1>
      <div className="card">
        <p>The Secretary of State requires an applicant to be 18 or older, be a legal California resident, complete an approved course, pass the written exam, and clear a background check.</p>
        <ol>
          <li>Complete a six-hour course approved by the Secretary of State. A three-hour refresher applies only when you already hold a current commission, you have completed the six-hour course, and you apply before that commission expires. Government Code section 8201.</li>
          <li>Register for the separate CPS HR exam. It is closed book, 45 multiple-choice items, and one hour. This site does not issue the course certificate.</li>
          <li>Submit fingerprints after a passing result. The Secretary of State mails those instructions.</li>
          <li>File the oath and the $15,000 bond from an admitted surety insurer within 30 calendar days after the term begins. A late filing means the commission does not take effect.</li>
        </ol>
        <p><a href="/california/course-vs-exam-prep/">Course versus practice</a>{" · "}<a href="/california/bond-vs-insurance/">Bond versus insurance</a></p>
        <p>Checked {CA_EXAM.checkedOn}. <a href={CA_EXAM.sources.qualifications}>Official qualifications</a></p>
      </div>
    </main>
  );
}
