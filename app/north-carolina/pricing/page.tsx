import Link from "next/link";
import { ncQuestionCounts, ncCards } from "@/data/nc-content";
import { ncPaths } from "@/lib/nc-site";
import { pageMeta } from "@/lib/seo";
export const metadata = pageMeta({ title: "North Carolina Notary Practice Access", description: "Free North Carolina practice and state-level 60-day Pro access information.", path: ncPaths.pricing, index: false });
export default function Page() {
  const counts = ncQuestionCounts();
  return (
    <main className="wrap hero">
      <h1>North Carolina practice access</h1>
      <div className="card">
        <h2>Start free</h2>
        <p>Use {counts.free} free questions, Quick 10, topic practice and {ncCards.length} independent rule cards. Save mistakes and use Daily Study with a free account.</p>
        <Link className="btn btn-primary" href={`${ncPaths.practice}?mode=quick&start=1`}>Try Quick 10</Link>
        <h2>North Carolina Pro</h2>
        <p>NC Pro opens all {counts.published} questions and additional Comprehensive Practice for 60 days. Access belongs to North Carolina.</p>
        <p>Purchases will open when North Carolina product and price configuration is ready.</p>
      </div>
    </main>
  );
}
