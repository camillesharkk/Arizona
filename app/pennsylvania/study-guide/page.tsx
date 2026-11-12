import SharedPage from "@/app/preview/[state]/study-guide/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Study Guide",
  description: "Review Pennsylvania notary topics and continue to study cards and practice.",
  path: "/pennsylvania/study-guide/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
