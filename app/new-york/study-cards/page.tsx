import SharedPage from "@/app/preview/[state]/study-cards/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Study Cards",
  description: "Review 50 independent New York notary study cards with official references.",
  path: "/new-york/study-cards/",
  index: true,
});

export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }), searchParams });
}
