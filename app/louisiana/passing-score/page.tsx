import SharedPage from "@/app/preview/[state]/passing-score/page";
import { laReferenceArticles } from "@/data/la-articles";
import { pageMeta } from "@/lib/seo";

const article = laReferenceArticles["passing-score"];
export const metadata = pageMeta({ title: article.title, description: article.description, path: article.path });

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
