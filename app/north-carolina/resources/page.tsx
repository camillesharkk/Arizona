import { ncArticles } from '@/data/new-state-articles';
import { ncOfficial, NC_CHECKED } from "@/data/nc-resources";
import { NcCourseFinder } from "@/components/NcCourseFinder";
import { NcApplicationGuide } from "@/components/NcApplicationGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina Notary Resources", description: "Official courses, 2026 manual, initial application, statutes and administrative rules.", path: "/north-carolina/resources/", index: false });
export default function Page() {
  return (
    <main className="wrap hero">
      <h1>North Carolina notary resources</h1>
      <p>Sources checked {NC_CHECKED}. College course information and enrollment instructions can change.</p>
      <NcCourseFinder />
      <section className="card" style={{ marginTop: 20 }}>
        <h2>Manual, forms and law</h2>
        <p>Get your own 2026 North Carolina Notary Public Manual. UNC's purchase page lists the paperback with complimentary online access. Check the bookstore for its current price.</p>
        <ul>
          <li><a href={ncOfficial.manual}>Buy the 2026 manual from UNC School of Government</a></li>
          <li><a href={ncOfficial.manualNotice}>Secretary of State manual announcement</a></li>
          <li><a href={ncOfficial.forms}>Secretary of State forms and current instructions</a></li>
          <li><a href={ncOfficial.application}>Initial application PDF</a></li>
          <li><a href={ncOfficial.statutes}>Chapter 10B, Article 1</a></li>
          <li><a href={ncOfficial.rules}>Secretary of State consolidated rules, July 2025</a></li>
          <li><a href={ncOfficial.currentRules}>Office of Administrative Hearings Chapter 7 rules</a></li>
        </ul>
        <p className="notice">The Secretary of State's live ordinary-notary, forms and rules pages were checked on {NC_CHECKED}. Use the linked forms page for current submission instructions.</p>
      </section>
      <section className="card"><h2>Study notes</h2><ul>{ncArticles.map(article=><li key={article.id}><a href={article.path}>{article.title}</a></li>)}</ul></section>
      <NcApplicationGuide />
    </main>
  );
}
