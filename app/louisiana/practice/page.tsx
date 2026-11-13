import SharedPage from "@/app/preview/[state]/practice/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Practice",
  description: "Practice Louisiana notary questions with Quick 10 and a 40-question, 90-minute practice set.",
  path: "/louisiana/practice/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
