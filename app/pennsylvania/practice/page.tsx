import SharedPage from "@/app/preview/[state]/practice/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Practice",
  description: "Practice Pennsylvania notary questions with Quick 10 and a 30-question, 60-minute practice set.",
  path: "/pennsylvania/practice/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
