import SharedPage from "@/app/preview/[state]/study-cards/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Study Cards",
  description: "Review 50 independent Pennsylvania notary study cards with official references.",
  path: "/pennsylvania/study-cards/",
  index: true,
});

export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }), searchParams });
}
