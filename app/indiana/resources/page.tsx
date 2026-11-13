import { inArticles } from '@/data/new-state-articles';
import { IndianaGuide } from "@/components/IndianaGuide";
import { pageMeta } from "@/lib/seo";
export const metadata = { ...pageMeta({ title: "Indiana Official Notary Resources", description: "First-time Indiana notary application steps with direct official links.", path: "/indiana/resources/", index: true }), robots: { index: true, follow: true } };
export default function Page() { return <IndianaGuide resources={true}><section className="card"><h2>Study notes</h2><ul>{inArticles.map(article=><li key={article.id}><a href={article.path}>{article.title}</a></li>)}</ul></section></IndianaGuide>; }
