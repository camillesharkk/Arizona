import { HomeCommunity } from "@/components/HomeCommunity";
import { communityInsights, communityInsightsUpdatedAt } from "@/data/community-insights";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import "../national-home.css";
import "../home-glass-demo.css";

export const metadata = pageMeta({
  title: "Notary Exam Community Insights",
  description: "Browse reviewed notary exam preparation discussions and practice the topics they raise with official-source study tools.",
  path: paths.community,
});

export default function CommunityInsightsPage() {
  return (
    <main className="national-home glass-home-demo">
      <div className="home-container">
        <HomeCommunity insights={communityInsights} updatedAt={communityInsightsUpdatedAt} standalone />
      </div>
    </main>
  );
}
