import SharedPage from "@/app/preview/[state]/practice/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Practice",
  description: "Practice New York notary questions with Quick 10 and a 40-question, 60-minute practice set.",
  path: "/new-york/practice/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
