import SharedPage from "@/app/preview/[state]/study-guide/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Study Guide",
  description: "Review Louisiana notary topics and continue to study cards and practice.",
  path: "/louisiana/study-guide/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
