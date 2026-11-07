import type { Metadata } from "next";
import { HI_EXAM } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Laws" },
  description: "Where to read Hawaii notary statutes and rules: HRS Chapter 456 and HAR Chapter 5-11.",
  alternates: { canonical: `${siteUrl()}/hawaii/laws/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>Hawaii notary laws</h1>
      <div className="card">
        <p>The commission statute is HRS Chapter 456. The notary rules are HAR Chapter 5-11. HAR §5-11-33 also puts HRS §§502-41 to 502-74 on the written exam. Checked {HI_EXAM.checkedOn}.</p>
        <ul>
          <li><a href={HI_EXAM.sources.statutes}>HRS Chapter 456 index</a> — commission, acts, seal, journal, fees, bond, and remote notarization.</li>
          <li><a href="https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001.htm">HRS §456-1</a> — four-year term and the Attorney General's commission.</li>
          <li><a href="https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm">HRS §456-1.6</a> — definitions, identity, and notarial acts.</li>
          <li><a href="https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm">HRS §456-15</a> — journal entries and the 10-year retention period.</li>
          <li><a href={HI_EXAM.sources.har}>HAR Chapter 5-11 (PDF)</a> — exam, certificate, seal, fees, and remote-online rules.</li>
          <li><a href={HI_EXAM.sources.manual}>2023 notary manual</a> — practice handbook. A later statute or rule controls if the manual is older.</li>
        </ul>
        <p>HRS §456-9 prints commission fees and says the rules may adjust them. HAR §5-11-46 is the later fee schedule. A practice question names which one it is asking about.</p>
        <p>Checked again on November 7, 2026. Act 54, Session Laws of Hawaii 2020, has been effective since January 1, 2021. The Attorney General page still says revisions to the administrative rules will be forthcoming. The HAR PDF is the compilation linked from the documents page. It is not proof that every line was amended on the PDF’s file date.</p>
        <p>The FAQ on notary.ehawaii.gov includes older answers. It is not used where it conflicts with the current statute or the 2022 rule compilation.</p>
        <p><a href="/hawaii/notary-fees/">Act fees and commission fees</a>{" · "}<a href="/hawaii/remote-online-notary/">Remote online notarization</a></p>
      </div>
    </main>
  );
}
