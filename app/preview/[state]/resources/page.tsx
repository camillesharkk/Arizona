import Link from "next/link";
import { prepPageEnabled } from "@/lib/state-release";
import { notFound } from "next/navigation";
import { nyArticles } from "@/data/ny-articles";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (!prepPageEnabled((await params).state)) notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const articles = code === "NY" ? nyArticles : [];
  return (
    <main className="wrap">
      <h1>{pack.name} resources</h1>
      <div className="card">
        <p>Official sources and study articles for the published questions.</p>
        <ul>
          {articles.map((article) => (
            <li key={article.id}><Link href={article.path}>{article.title}</Link></li>
          ))}
        </ul>
        <p><a href={pack.paths.examGuide}>Exam guide</a></p>
      </div>
    </main>
  );
}
