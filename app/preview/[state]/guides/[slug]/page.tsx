import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { prepArticles } from "@/lib/prep-articles";
import type { PrepCode } from "@/lib/prep-pack";
import { articleBySlug } from "@/lib/state-articles";
import { StateArticlePage } from "@/components/StateArticle";

export default async function Page({ params }: { params: Promise<{ state: string; slug: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const { state, slug } = await params;
  const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", "north-carolina": "NC" };
  const article = articleBySlug(prepArticles[codes[state]] || [], slug);
  if (!article) notFound();
  return <StateArticlePage article={article} />;
}
