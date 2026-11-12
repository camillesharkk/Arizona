import SharedPage from "@/app/preview/[state]/questions/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Practice Questions",
  description: "Study 203 published New York notary questions with explanations and official references.",
  path: "/new-york/questions/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
