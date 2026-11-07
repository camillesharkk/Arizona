import type { Metadata } from "next";
import { StateSectionCrumb } from "@/components/Breadcrumb";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Become a Hawaii Notary" },
  description: "How a first-time Hawaii notary applicant is approved, tested, and commissioned. Remote online notarization is a separate later step.",
  alternates: { canonical: canonicalUrl("/hawaii/become-a-notary/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <StateSectionCrumb state="HI" name="Become a notary" path="/hawaii/become-a-notary/" />
      <h1>Become a Hawaii notary</h1>
      <div className="card">
        <p>The Department of the Attorney General commissions notaries. A first commission is not the same as a renewal, a restoration, or a remote online notary commission. Checked {HI_EXAM.checkedOn}.</p>
        <ol>
          <li>Confirm the qualifications on the Attorney General page: age 18, Hawaii residence, and the citizenship or residency status that page states.</li>
          <li>Apply online with the justification letter, character letter, and, for a government notary, the department letter. The application fee in HAR §5-11-46 is $20 and is not refundable.</li>
          <li>After approval, take the scheduled written closed-book exam. The passing minimum is 80 percent. Exam dates are on the live scheduler.</li>
          <li>File the $1,000 bond with the circuit clerk where you reside, after a circuit judge approves it. HRS §456-5.</li>
          <li>The commission term is four years from the commission date. HRS §456-1. Renewal is your own duty. A timely renewal is one received within 60 days before expiration. HAR §5-11-12.</li>
        </ol>
        <p>The exam is closed book. Official question count and time are not published. This site’s 50-question Comprehensive Practice is not that exam. The $1,000 bond is filed after approval and the exam, with the circuit clerk, after a judge approves it.</p>
        <p>Remote online notarization is available only to a notary who already holds an active commission. It has a separate application, a separate exam, and a commission that ends with the notary commission. It is not part of the first application.</p>
        <p><a href="/hawaii/exam-scheduling/">Scheduling</a>{" · "}<a href="/hawaii/bond/">Bond</a>{" · "}<a href="/hawaii/remote-online-notary/">Remote commission</a></p>
        <p>
          <a href={HI_EXAM.sources.ag}>Attorney General requirements</a>
          {" · "}
          <a href={hiPaths.practice}>Start Quick 10</a>
        </p>
      </div>
    </main>
  );
}
