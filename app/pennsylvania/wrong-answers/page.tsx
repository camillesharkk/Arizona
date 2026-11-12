import SharedPage from "@/app/preview/[state]/wrong-answers/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Wrong Answers",
  description: "Review your saved Pennsylvania mistakes and study progress.",
  path: "/pennsylvania/wrong-answers/",
  index: false,
});

export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string; attempt?: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }), searchParams });
}
