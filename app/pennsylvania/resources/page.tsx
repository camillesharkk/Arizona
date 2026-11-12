import SharedPage from "@/app/preview/[state]/resources/page";
import { pageMeta } from "@/lib/seo";

export const metadata = pageMeta({
  title: "Pennsylvania Notary Resources",
  description: "Read Pennsylvania notary study articles, examination guidance and official sources.",
  path: "/pennsylvania/resources/",
  index: true,
});

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
