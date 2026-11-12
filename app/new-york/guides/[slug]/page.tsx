import SharedPage from "@/app/preview/[state]/guides/[slug]/page";
import { notFound } from "next/navigation";
import { nyArticles } from "@/data/ny-articles";
import { articleBySlug } from "@/lib/state-articles";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return nyArticles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const article = articleBySlug(nyArticles, (await params).slug);
  if (!article) notFound();
  return pageMeta({ title: article.title, description: article.description, path: article.path });
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  return SharedPage({ params: Promise.resolve({ state: "new-york", slug: (await params).slug }) });
}
