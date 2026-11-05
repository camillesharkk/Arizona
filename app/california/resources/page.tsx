import type { Metadata } from "next";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Resources" },
  description: "Official California notary links and the practice pages on this site.",
  alternates: { canonical: `${siteUrl()}/california/resources/` },
};

export default function Page() {
  return (
    <main className="wrap">
      <h1>California resources</h1>
      <div className="card">
        <ul>
          <li><a href={CA_EXAM.sources.handbook}>Handbook</a></li>
          <li><a href={CA_EXAM.sources.exam}>Exam information</a></li>
          <li><a href={CA_EXAM.sources.qualifications}>Qualifications</a></li>
          <li><a href={caPaths.study}>Study guide</a></li>
          <li><a href={caPaths.studyCards}>Study cards</a></li>
          <li><a href={caPaths.practice}>Practice</a></li>
        </ul>
      </div>
    </main>
  );
}
