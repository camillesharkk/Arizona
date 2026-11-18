import { CommunityDiscussions, type CommunitySearchParams } from "@/components/CommunityDiscussions";
import { communityInsightsUpdatedAt } from "@/data/community-insights";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import "../national-home.css";
import "../home-glass-demo.css";
import "./discussions.css";

export const metadata = pageMeta({
  title: "Notary Exam Community Insights",
  description: "Browse reviewed notary exam preparation discussions and practice the topics they raise with official-source study tools.",
  path: paths.community,
});

export default async function CommunityInsightsPage({
  searchParams,
}: {
  searchParams: Promise<CommunitySearchParams>;
}) {
  return (
    <main className="national-home glass-home-demo">
      <div className="home-container">
        <header className="home-section community-intro">
          <h1>Community Insights</h1>
          <p className="home-section-intro">
            Public discussions help us find difficult study topics. We check the rules in our questions and explanations against official sources.
          </p>
          {communityInsightsUpdatedAt && <p className="home-editorial-date">Manually reviewed · Last updated{" "}
            <time dateTime={communityInsightsUpdatedAt}>{communityInsightsUpdatedAt}</time>
          </p>}
          <a className="btn btn-ghost" href="#community-discussions">Share your experience</a>
        </header>
        <CommunityDiscussions params={await searchParams} />
      </div>
    </main>
  );
}
