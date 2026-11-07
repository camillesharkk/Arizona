import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StateArticlePage } from "@/components/StateArticle";
import { caArticles } from "@/data/ca-articles";
import { articleBySlug } from "@/lib/state-articles";
import { canonicalUrl } from "@/lib/site";

type Params = { slug: string };

export function generateStaticParams() {
  return caArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const article = articleBySlug(caArticles, (await params).slug);
  if (!article) return {};
  return {
    title: { absolute: article.title },
    description: article.description,
    alternates: { canonical: canonicalUrl(article.path) },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const article = articleBySlug(caArticles, (await params).slug);
  if (!article) notFound();
  return <StateArticlePage article={article} />;
}
