import { notFound } from 'next/navigation';
import { ctArticles } from '@/data/ct-articles';
import { StateArticlePage } from '@/components/StateArticle';
import { pageMeta } from '@/lib/seo';
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const found = ctArticles.find(item => item.slug === slug);
  return found ? pageMeta({ title: found.title, description: found.description, path: found.path, index: true }) : {};
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ctArticles.find(item => item.slug === slug);
  if (!article) notFound();
  return <StateArticlePage article={article} />;
}
