import SharedPage from "@/app/preview/[state]/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Exam Practice",
  description: "203 Pennsylvania practice questions, 50 independent study cards and a free 10-question check.",
  path: "/pennsylvania/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
