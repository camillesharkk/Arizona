import SharedPage from "@/app/preview/[state]/laws/page";
import { paReferenceArticles } from "@/data/pa-articles";
import { pageMeta } from "@/lib/seo";

const article = paReferenceArticles["laws"];
export const metadata = pageMeta({ title: article.title, description: article.description, path: article.path });

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
