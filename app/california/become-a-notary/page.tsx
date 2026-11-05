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
          <li>Complete the approved education.</li>
          <li>Register and take the exam.</li>
          <li>Submit fingerprints.</li>
          <li>File the oath and the $15,000 bond within 30 calendar days after the commission term begins.</li>
        </ol>
        <p>Checked {CA_EXAM.checkedOn}. <a href={CA_EXAM.sources.qualifications}>Official qualifications</a></p>
      </div>
    </main>
  );
}
