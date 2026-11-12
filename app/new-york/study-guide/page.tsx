import SharedPage from "@/app/preview/[state]/study-guide/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Study Guide",
  description: "Review New York notary topics and continue to study cards and practice.",
  path: "/new-york/study-guide/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
