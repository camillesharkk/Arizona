import SharedPage from "@/app/preview/[state]/wrong-answers/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Wrong Answers",
  description: "Review your saved New York mistakes and study progress.",
  path: "/new-york/wrong-answers/",
  index: false,
});

export default function Page({ searchParams }: { searchParams: Promise<{ topic?: string; attempt?: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }), searchParams });
}
