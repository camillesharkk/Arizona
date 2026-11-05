import type { Metadata } from "next";
import { CA_EXAM } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Laws" },
  description: "Primary California notary sources: the Secretary of State handbook and the Government Code.",
  alternates: { canonical: `${siteUrl()}/california/laws/` },
};

export default function Page() {
  return (
    <main className="wrap">
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
        <p>The Online Notarization Act was signed in 2023. The handbook says California notaries cannot perform remote online notarization until the Secretary of State's technology project is finished or January 1, 2030, whichever is earlier.</p>
      </div>
    </main>
  );
}
