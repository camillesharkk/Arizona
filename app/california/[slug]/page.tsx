import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StateArticlePage } from "@/components/StateArticle";
import { caArticles } from "@/data/ca-articles";
import { caQuestionCounts } from "@/data/ca-questions";
import { articleBySlug } from "@/lib/state-articles";
import { PRO_DURATION_DAYS, STANDARD_PRICE_CENTS } from "@/lib/pricing/catalog";
import { siteUrl } from "@/lib/site";

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
    alternates: { canonical: `${siteUrl()}${article.path}` },
    robots: { index: true, follow: true },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const article = articleBySlug(caArticles, (await params).slug);
  if (!article) notFound();
  const counts = caQuestionCounts();
  const price = (STANDARD_PRICE_CENTS / 100).toFixed(2);
  const bankNote = `The California practice bank has ${counts.published} published questions, and ${counts.free} are free. There is no separate paid California question bank. One full practice exam is free. Pro is one purchase for ${PRO_DURATION_DAYS} days across every available state, at the standard price of $${price}.`;
  return <StateArticlePage article={article} bankNote={bankNote} />;
}
