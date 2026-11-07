import type { Metadata } from "next";
import { StateSectionCrumb } from "@/components/Breadcrumb";
import { CA_EXAM } from "@/lib/ca-site";
import { canonicalUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Laws" },
  description: "Primary California notary sources: the Secretary of State handbook and the Government Code.",
  alternates: { canonical: canonicalUrl("/california/laws/") },
};

export default function Page() {
  return (
    <main className="wrap">
      <StateSectionCrumb state="CA" name="Laws" path="/california/laws/" />
      <h1>California notary laws</h1>
      <div className="card">
        <ul>
          <li><a href={CA_EXAM.sources.handbook}>Secretary of State handbook page</a></li>
          <li><a href={CA_EXAM.sources.handbookPdf}>2026 Notary Public Handbook PDF</a></li>
          <li><a href={CA_EXAM.sources.qualifications}>Qualifications</a></li>
          <li><a href={CA_EXAM.sources.statutes}>California legislative information</a></li>
          <li><a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8211.">Government Code section 8211, fees</a></li>
          <li><a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206.">Government Code section 8206, journal</a></li>
        </ul>
        <p>Checked November 7, 2026. The handbook page links a January 2026 PDF. The Online Notarization Act was signed on September 30, 2023, and became effective on January 1, 2024, in stages. Recognition provisions and Civil Code sections 1182 and 1183 were operative in 2024. Section 8231.18 was operative January 1, 2025. The handbook says notaries still cannot perform remote online notarization until Notary Automation Project 2.0 is finished or January 1, 2030, whichever is earlier. In-person electronic notarization is already allowed.</p>
        <p><a href="/california/online-notarization/">Current remote-notarization rule</a>{" · "}<a href="/california/notary-fees/">Allowed fees</a></p>
      </div>
    </main>
  );
}
