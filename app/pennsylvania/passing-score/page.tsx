import SharedPage from "@/app/preview/[state]/passing-score/page";
import { paReferenceArticles } from "@/data/pa-articles";
import { pageMeta } from "@/lib/seo";

const article = paReferenceArticles["passing-score"];
export const metadata = pageMeta({ title: article.title, description: article.description, path: article.path });

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania" }) });
}
