import SharedPage from "@/app/preview/[state]/resources/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Louisiana Notary Resources",
  description: "Read Louisiana notary study articles, examination guidance and official sources.",
  path: "/louisiana/resources/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
