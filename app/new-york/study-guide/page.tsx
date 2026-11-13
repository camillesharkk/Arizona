import SharedPage from "@/app/preview/[state]/study-guide/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Free New York Notary Study Guide 2026 | Rules & Examples",
  description: "Study New York notary rules with chapter explanations, worked examples, key facts, official sources, reading progress and topic practice. Free, no login.",
  path: "/new-york/study-guide/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
