import Link from "next/link";
import { notFound } from "next/navigation";
import { nyArticles } from "@/data/ny-articles";
import { prepPacks, type PrepCode } from "@/lib/prep-pack";

const codes: Record<string, PrepCode> = { "new-york": "NY", pennsylvania: "PA", louisiana: "LA" };

export default async function Page({ params }: { params: Promise<{ state: string }> }) {
  if (process.env.STATE_PREVIEW !== "1") notFound();
  const code = codes[(await params).state];
  if (!code) notFound();
  const pack = prepPacks[code];
  const articles = code === "NY" ? nyArticles : [];
  return (
    <main className="wrap">
      <h1>{pack.name} resources</h1>
      <div className="card">
        <p>Official sources used for the published questions. This preview is not in the public sitemap.</p>
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
