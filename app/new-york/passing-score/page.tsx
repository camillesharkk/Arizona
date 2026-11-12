import SharedPage from "@/app/preview/[state]/passing-score/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Exam Results and Passing Requirements",
  description: "Read how New York reports examination results, retakes and practice scores.",
  path: "/new-york/passing-score/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
