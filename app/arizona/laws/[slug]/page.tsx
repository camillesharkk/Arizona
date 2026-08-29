import { notFound } from "next/navigation";
import Link from "next/link";
import { getLawChange, lawStatus } from "@/data/laws";
import { getSource } from "@/data/sources";

export function generateStaticParams() {
  return [{ slug: "effective-date-discipline" }, { slug: "ron-is-regulated" }, { slug: "fee-cap-reminders" }];
}

export default async function LawDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getLawChange(slug);
  if (!c) notFound();
  const src = getSource(c.source_id);
  return (
    <main className="wrap hero">
      <p className="kicker">Law detail · {lawStatus(c)}</p>
      <h1>{c.title}</h1>
      <p>
        Effective {c.effective_from}. {c.who_affected}
      </p>
      <div className="grid grid-2">
        <div className="card">
          <h2>Before</h2>
          <p>{c.before}</p>
        </div>
        <div className="card">
          <h2>After</h2>
          <p>{c.after}</p>
        </div>
      </div>
      <div className="card" style={{ marginTop: 16 }}>
        <h2>Practical impact</h2>
        <p>{c.impact}</p>
        <p>
          Official: <a href={src.url}>{src.title}</a>
        </p>
        <Link className="btn btn-primary" href="/arizona/questions/new-laws/">
          Practice 10 Questions on New Rules
        </Link>
      </div>
    </main>
  );
}
