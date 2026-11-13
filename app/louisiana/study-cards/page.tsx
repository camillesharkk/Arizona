import SharedPage from "@/app/preview/[state]/study-cards/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Study Cards",
  description: "Review 54 independent Louisiana notary study cards with official references.",
  path: "/louisiana/study-cards/",
  index: true,
});

export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }), searchParams });
}
