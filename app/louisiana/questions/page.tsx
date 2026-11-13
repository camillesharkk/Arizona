import SharedPage from "@/app/preview/[state]/questions/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Practice Questions",
  description: "Study 203 published Louisiana notary questions with explanations and official references.",
  path: "/louisiana/questions/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
