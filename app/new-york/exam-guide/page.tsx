import SharedPage from "@/app/preview/[state]/exam-guide/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Exam Guide",
  description: "Understand the published examination facts and this site’s practice settings.",
  path: "/new-york/exam-guide/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
