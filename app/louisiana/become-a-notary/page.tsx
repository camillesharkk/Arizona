import SharedPage from "@/app/preview/[state]/become-a-notary/page";
import { laReferenceArticles } from "@/data/la-articles";
import { pageMeta } from "@/lib/seo";

const article = laReferenceArticles["become-a-notary"];
export const metadata = pageMeta({ title: article.title, description: article.description, path: article.path });

export default function Page() {
  return SharedPage({ params: Promise.resolve({ state: "louisiana" }) });
}
