import SharedPage from "@/app/preview/[state]/questions/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Practice Questions",
  description: "Study 203 published Pennsylvania notary questions with explanations and official references.",
  path: "/pennsylvania/questions/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
