import {notFound} from 'next/navigation';
import {ncArticles as articles} from '@/data/new-state-articles';
import {StateArticlePage} from '@/components/StateArticle';
import {pageMeta} from '@/lib/seo';
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const article=articles.find(a=>a.slug===slug);return article?pageMeta({title:article.title,description:article.description,path:article.path,index:true}):{};}
export default async function Page({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const article=articles.find(a=>a.slug===slug);if(!article)notFound();return <StateArticlePage article={article}/>;}
