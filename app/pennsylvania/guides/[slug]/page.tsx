import SharedPage from "@/app/preview/[state]/guides/[slug]/page";
import { notFound } from "next/navigation";
import { paArticles } from "@/data/pa-articles";
import { articleBySlug } from "@/lib/state-articles";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return paArticles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = articleBySlug(paArticles, (await params).slug);
  if (!article) notFound();
  return pageMeta({ title: article.title, description: article.description, path: article.path });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "pennsylvania", slug: (await params).slug }) });
}
