import type { Metadata } from "next";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Study Guide" },
  description: "California notary rules for appointment, notarial acts, identification, advertising, journals, and fees.",
  alternates: { canonical: `${siteUrl()}/california/study-guide/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California study guide</h1>
      <div className="card">
        <p>Checked {CA_EXAM.checkedOn} against the Secretary of State handbook, the qualifications page, CPS HR, and the cited statutes.</p>
        <h2 id="administration">Administrative procedures</h2>
        <p>A commission lasts four years and does not take effect until the oath and $15,000 bond are filed within 30 calendar days. First-time applicants take an approved six-hour course. A notary notifies the Secretary of State of an address change within 30 days.</p>
        <h2 id="acts">Notarial acts and documents</h2>
        <p>The signer appears in person. An acknowledgment is not completed on a document that arrived by mail. The maximum acknowledgment fee is $15 per signature. Remote online notarization is not available to California notaries until the Secretary of State finishes the technology project or January 1, 2030, whichever is earlier.</p>
        <h2 id="identity">Identification and credible witnesses</h2>
        <p>Satisfactory evidence is a qualifying identification document, one credible witness the notary personally knows, or two credible witnesses identified to the notary. The journal records the document details or the witness information.</p>
        <h2 id="immigration">Immigration and foreign language</h2>
        <p>A non-attorney notary does not translate Notary Public as notario or notario publico and does not give legal advice about immigration. A first violation of the advertising statute is grounds for suspension or revocation.</p>
        <h2 id="violations">Misconduct and fees</h2>
        <p>The notary keeps one active sequential journal and the seal under exclusive control. Neither is surrendered to an employer. Deeds and powers of attorney generally require a thumbprint, with the foreclosure and reconveyance exceptions in Government Code section 8206.</p>
        <p><a href={caPaths.studyCards}>Open study cards</a></p>
      </div>
    </main>
  );
}
