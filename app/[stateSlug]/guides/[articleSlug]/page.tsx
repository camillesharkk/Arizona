import { notFound } from 'next/navigation';
import { StateArticlePage } from '@/components/StateArticle';
import { fullStateArticles } from '@/data/full-state-articles';
import { freeStateForSlug, freeStateCatalog } from '@/lib/free-state-catalog';
import { productionStateBlocked } from '@/lib/state-release';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() {
  return freeStateCatalog.flatMap(([code, , stateSlug]) => (fullStateArticles[code] || []).map(article => ({ stateSlug, articleSlug: article.slug })));
}
async function articleFor(params: Promise<{ stateSlug: string; articleSlug: string }>) {
  const { stateSlug, articleSlug } = await params;
  const state = freeStateForSlug(stateSlug);
  if (!state || productionStateBlocked(state[0])) notFound();
  const article = fullStateArticles[state[0]]?.find(item => item.slug === articleSlug);
  if (!article) notFound();
  return article;
}
export async function generateMetadata({ params }: { params: Promise<{ stateSlug: string; articleSlug: string }> }) {
  const article = await articleFor(params);
  return pageMeta({ title: article.title, description: article.description, path: article.path, index: process.env.VERCEL_ENV !== 'preview' });
}
export default async function Page({ params }: { params: Promise<{ stateSlug: string; articleSlug: string }> }) {
  return <StateArticlePage article={await articleFor(params)} />;
}
