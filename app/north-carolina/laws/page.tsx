import { ncOfficial, NC_CHECKED } from "@/data/nc-resources";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina Notary Law", description: "Official North Carolina statutes and administrative rules for traditional notaries.", path: "/north-carolina/laws/", index: true });
export default function Page() {
  return (
    <main className="wrap hero">
      <h1>North Carolina notary law</h1>
      <div className="card">
        <p>Checked {NC_CHECKED}.</p>
        <ul>
          <li><a href={ncOfficial.statutes}>G.S. Chapter 10B, Article 1</a></li>
          <li><a href={ncOfficial.rules}>Secretary of State rules, July 2025</a></li>
          <li><a href={ncOfficial.currentRules}>OAH current Chapter 7 rules</a></li>
        </ul>
      </div>
    </main>
  );
}
