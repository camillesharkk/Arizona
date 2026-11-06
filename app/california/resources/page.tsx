import type { Metadata } from "next";
import Link from "next/link";
import { caGuideChapters } from "@/data/ca-study-guide";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "California Notary Resources" },
  description: "Official California notary sources and the study tools on this site.",
  alternates: { canonical: `${siteUrl()}/california/resources/` },
};

const gov = (section: string) =>
  `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=${section}.`;

export default function Page() {
  return (
    <main className="wrap resource-page">
      <h1>California resources</h1>
      <p className="lede">
        Use the official page for a filing, a fee, or an exam rule. Use this site to practice. Checked {CA_EXAM.checkedOn} for the handbook and statutes, and 2026-11-06 for the qualifications page and CPS HR.
      </p>
      <p><Link href={caPaths.home}>Back to practice</Link></p>

      <h2>Prepare for the exam</h2>
      <ul className="resource-list">
        <li>
          <a href={CA_EXAM.sources.handbookPdf}>2026 Notary Public Handbook (PDF)</a>
          <span>California Secretary of State</span>
          <p>The current handbook PDF linked from the Secretary of State. Use it while studying. The exam draws from the whole handbook.</p>
        </li>
        <li>
          <Link href={caPaths.study}>Study guide</Link>
          <span>This site</span>
          <p>Original chapter summaries with the statute or handbook section for each topic. Open a chapter from a Quick 10 result or import missed topics.</p>
        </li>
        <li>
          <Link href={caPaths.studyCards}>Study cards</Link>
          <span>This site</span>
          <p>Short rule cards. A topic link opens that topic’s cards.</p>
        </li>
        <li>
          <Link href={`${caPaths.practice}?mode=quick`}>Quick 10</Link>
          <span>This site</span>
          <p>Ten published questions. The result names the next chapter, the missed questions, and the full practice exam.</p>
        </li>
      </ul>

      <h2>Register and take the exam</h2>
      <ul className="resource-list">
        <li>
          <a href={CA_EXAM.sources.exam}>Notary exam information</a>
          <span>CPS HR</span>
          <p>Closed-book format, 45 items, one hour, the five scored areas, the scaled score of 70, the once-a-month rule, result timing, and the $30 rescore address.</p>
        </li>
        <li>
          <Link href={caPaths.examGuide}>Exam guide</Link>
          <span>This site</span>
          <p>A short restatement of the CPS HR format. It does not issue a scaled score.</p>
        </li>
        <li>
          <Link href={caPaths.passingScore}>Passing score</Link>
          <span>This site</span>
          <p>Explains why a scaled 70 is not a percent of the 40 scored items.</p>
        </li>
        <li>
          <Link href={`${caPaths.practice}?mode=full`}>Full 45 practice exam</Link>
          <span>This site</span>
          <p>Forty scored items in the official area counts, plus five unscored items. One free full exam is available. California Pro is not open.</p>
        </li>
      </ul>

      <h2>Apply for the commission</h2>
      <ul className="resource-list">
        <li>
          <a href={CA_EXAM.sources.qualifications}>Become a notary public</a>
          <span>California Secretary of State</span>
          <p>The appointment checklist: education, exam, fingerprints, commission packet, then the oath and bond. Also the disclosure rules for arrests and convictions.</p>
        </li>
        <li>
          <a href="https://www.sos.ca.gov/notary">Notary Public and Apostille</a>
          <span>California Secretary of State</span>
          <p>The commission overview, education approval, seal manufacturers, discipline, and the link to current processing times.</p>
        </li>
        <li>
          <Link href={caPaths.become}>Become a California notary</Link>
          <span>This site</span>
          <p>The same appointment steps in study order, with the qualifications page linked.</p>
        </li>
        <li>
          <a href={gov("8213")}>Government Code section 8213</a>
          <span>California statute</span>
          <p>The 30-day oath and bond filing. Miss the deadline and the commission does not take effect.</p>
        </li>
      </ul>

      <h2>Look up the statute or the handbook</h2>
      <ul className="resource-list">
        <li>
          <a href={CA_EXAM.sources.handbook}>Handbook page</a>
          <span>California Secretary of State</span>
          <p>The page that points to the current handbook and keeps the older editions. Start here if the PDF link changes.</p>
        </li>
        <li>
          <a href={CA_EXAM.sources.statutes}>California legislative information</a>
          <span>California statute</span>
          <p>The official code search. Use it when you need a section that is not linked below.</p>
        </li>
        <li>
          <a href={gov("8206")}>Government Code section 8206</a>
          <span>California statute</span>
          <p>The journal, thumbprint, public copy, and lost-journal notice.</p>
        </li>
        <li>
          <a href={gov("8211")}>Government Code section 8211</a>
          <span>California statute</span>
          <p>Maximum notarial fees, including the acknowledgments, jurats, depositions, and the power-of-attorney copy.</p>
        </li>
        <li>
          <a href="https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1185.">Civil Code section 1185</a>
          <span>California statute</span>
          <p>Satisfactory evidence: the identification documents and the one-witness and two-witness methods.</p>
        </li>
        <li>
          <Link href={caPaths.laws}>Laws on this site</Link>
          <span>This site</span>
          <p>A short index of the handbook, the qualifications page, and the sections used in the question bank.</p>
        </li>
      </ul>

      <h2>Chapters on this site</h2>
      <ul className="home-links">
        {caGuideChapters.map((chapter) => (
          <li key={chapter.id}><Link href={`${caPaths.study}#${chapter.id}`}>{chapter.title}</Link></li>
        ))}
      </ul>
    </main>
  );
}
