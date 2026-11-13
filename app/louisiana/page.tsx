import SharedPage from "@/app/preview/[state]/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Exam Practice",
  description: "203 Louisiana practice questions, 54 independent study cards and a free 10-question check.",
  path: "/louisiana/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
