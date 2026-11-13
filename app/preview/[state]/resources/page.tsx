import Link from "next/link";
import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { prepArticles } from "@/lib/prep-articles";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA", "north-carolina": "NC" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const articles = prepArticles[code] || [];
  const sources = [...new Map(pack.cards.map(card => [card.sourceUrl, { url: card.sourceUrl, label: card.source }])).values()];
  return (
    <main className="wrap">
      <h1>{pack.name} resources</h1>
      <div className="card">
        <p>Official sources and study articles for the published questions.</p>
        <h2>Start with official sources</h2>
        <ul>{sources.map(source => <li key={source.url}><a href={source.url} target="_blank" rel="noreferrer">{source.label}</a></li>)}</ul>
        <h2>Study articles</h2>
        <ul>
          {articles.map((article) => (
            <li key={article.id}><Link href={article.path}>{article.title}</Link></li>
          ))}
        </ul>
        <p><a href={pack.paths.examGuide}>Exam guide</a>{" · "}<a href={pack.paths.passingScore}>Scores</a>{" · "}<a href={pack.paths.laws}>Laws</a>{" · "}<a href={pack.paths.become}>Apply for a commission</a></p>
      </div>
    </main>
  );
}
