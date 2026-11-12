import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { nyArticles } from "@/data/ny-articles";
import { articleBySlug } from "@/lib/state-articles";
import { StateArticlePage } from "@/components/StateArticle";

export default async function Page({ params }: { params: Promise<{ state: string; slug: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const { state, slug } = await params;
  if (state !== "new-york") notFound();
  const article = articleBySlug(nyArticles, slug);
  if (!article) notFound();
  return <StateArticlePage article={article} />;
}
