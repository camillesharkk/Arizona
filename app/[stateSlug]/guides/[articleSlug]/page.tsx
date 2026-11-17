import { notFound } from 'next/navigation';
import { StateArticlePage } from '@/components/StateArticle';
import { stateSeoArticles } from '@/lib/seo-article-catalog';
import { freeStateCatalog } from '@/lib/free-state-catalog';
import { stateBySlug } from '@/lib/states';
import type { StateCode } from '@/lib/types';
import { productionStateBlocked } from '@/lib/state-release';
import { pageMeta } from '@/lib/seo';

export const dynamicParams = false;
export function generateStaticParams() {
  const states = [['AZ', 'Arizona', 'arizona'], ...freeStateCatalog];
  return states.flatMap(([code, , stateSlug]) => (stateSeoArticles[code as StateCode] || []).map(article => ({ stateSlug, articleSlug: article.slug })));
}
async function articleFor(params: Promise<{ stateSlug: string; articleSlug: string }>) {
  const { stateSlug, articleSlug } = await params;
  const state = stateBySlug(stateSlug);
  if (!state || state.status !== 'available' || productionStateBlocked(state.code)) notFound();
  const article = stateSeoArticles[state.code as StateCode]?.find(item => item.slug === articleSlug);
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
