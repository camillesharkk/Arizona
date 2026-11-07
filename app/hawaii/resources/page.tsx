import type { Metadata } from "next";
import Link from "next/link";
import { hiArticles } from "@/data/hi-articles";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Hawaii Notary Resources" },
  description: "Official Hawaii notary pages for the exam, appointment, statutes, and rules, plus the study tools on this site.",
  alternates: { canonical: `${siteUrl()}/hawaii/resources/` },
};

export default function Page() {
  return (
    <main className="wrap resource-page">
      <h1>Hawaii notary resources</h1>
      <p className="lede">Use the official page for a filing, a fee, or an exam date. Use this site to practice. Checked {HI_EXAM.checkedOn}.</p>
      <p><Link href={hiPaths.home}>Back to practice</Link></p>

      <h2>Prepare for the exam</h2>
      <ul className="resource-list">
        <li>
          <a href={HI_EXAM.sources.manual}>Notary Manual (PDF, updated April 14, 2023)</a>
          <span>Department of the Attorney General</span>
          <p>The manual linked from the official documents page. Later statutes and rules control if they conflict with the manual.</p>
        </li>
        <li>
          <Link href={hiPaths.study}>Study guide</Link>
          <span>This site</span>
          <p>Chapter summaries with the statute or rule for each topic.</p>
        </li>
        <li>
          <Link href={hiPaths.studyCards}>Study cards</Link>
          <span>This site</span>
          <p>Short rule cards. A topic link opens practice for that topic.</p>
        </li>
        <li>
          <Link href={hiPaths.practice}>Practice</Link>
          <span>This site</span>
          <p>Quick 10, then Comprehensive Practice. The 50-question set is this site's practice setting.</p>
        </li>
      </ul>

      <h2>Exam day</h2>
      <ul className="resource-list">
        <li>
          <a href={HI_EXAM.sources.scheduler}>Notary exam scheduler</a>
          <span>notary.ehawaii.gov</span>
          <p>Live dates and locations. Dates change, so this page does not list a session.</p>
        </li>
        <li>
          <a href={HI_EXAM.sources.ag}>Notaries public</a>
          <span>Department of the Attorney General</span>
          <p>Commission requirements, the written closed-book exam, and the office contact.</p>
        </li>
        <li>
          <Link href={hiPaths.passingScore}>Passing score</Link>
          <span>This site</span>
          <p>The official minimum is 80 percent. A score on this site is not an official result.</p>
        </li>
      </ul>

      <h2>Appointment</h2>
      <ul className="resource-list">
        <li>
          <a href={HI_EXAM.sources.apply}>Online notary application</a>
          <span>notary.ehawaii.gov</span>
          <p>The application portal. The Attorney General page describes the letters and the nonrefundable application fee.</p>
        </li>
        <li>
          <Link href={hiPaths.become}>Become a Hawaii notary</Link>
          <span>This site</span>
          <p>A short map of the first commission. Remote online notarization is a later, separate application.</p>
        </li>
      </ul>

      <h2>Guides</h2>
      <ul className="resource-list">
        {hiArticles.map((article) => (
          <li key={article.id}>
            <Link href={article.path}>{article.h1}</Link>
            <span>{article.keyword}</span>
            <p>{article.description}</p>
          </li>
        ))}
      </ul>

      <h2>Laws and forms</h2>
      <ul className="resource-list">
        <li>
          <a href={HI_EXAM.sources.statutes}>HRS Chapter 456</a>
          <span>Hawaii State Legislature</span>
          <p>The notary public statute, including identity, journal, fees, bond, and remote acts.</p>
        </li>
        <li>
          <a href={HI_EXAM.sources.har}>HAR Chapter 5-11 (PDF)</a>
          <span>Department of the Attorney General</span>
          <p>Rules compiled through the February 27, 2022 amendment notation, including the exam and the fee schedule.</p>
        </li>
        <li>
          <a href={HI_EXAM.sources.documents}>Notary documents</a>
          <span>Department of the Attorney General</span>
          <p>Links to the manual, the rules, and related acts.</p>
        </li>
        <li>
          <a href={HI_EXAM.sources.faq}>Notary FAQ</a>
          <span>notary.ehawaii.gov</span>
          <p>Some answers describe older practice. Use the current statute or rule when they differ.</p>
        </li>
      </ul>
    </main>
  );
}
