import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { StateArticlePage } from "@/components/StateArticle";
import { nyPassingScore } from "@/data/ny-guides";
import { prepReferences } from "@/lib/prep-articles";

function articleForState(state: string) {
  if (!prepPageEnabled(state)) notFound();
  const code = state === "pennsylvania" ? "PA" : state === "louisiana" ? "LA" : null;
  const article = state === "new-york" ? nyPassingScore : code ? prepReferences[code]?.["passing-score"] : null;
  if (!article) notFound();
  return article;
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }) {
  const article = articleForState((await params).state);
  return { title: article.title, description: article.description };
}

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  return <StateArticlePage article={articleForState((await params).state)} />;
}
