import SharedPage from "@/app/preview/[state]/resources/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "New York Notary Resources",
  description: "Read New York notary study articles, examination guidance and official sources.",
  path: "/new-york/resources/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "new-york" }) });
}
