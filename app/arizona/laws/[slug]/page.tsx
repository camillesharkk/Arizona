import { notFound } from "next/navigation";
import Link from "next/link";
import { getLawChange, lawStatus } from "@/data/laws";
import { getSource } from "@/data/sources";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export function generateStaticParams() {
  return [
    { slug: "effective-date-discipline" },
    { slug: "ron-is-regulated" },
    { slug: "fee-cap-reminders" },
    { slug: "sb1479-journal-thumbprint" },
  ];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getLawChange(slug);
  if (!c) return { title: "Arizona notary law" };
  const meta = pageMeta({
    title: c.onIndex ? c.title : `${c.title} (study note)`,
    description: c.onIndex
      ? `${c.title}. Effective ${c.effective_from}.`
      : "Study note only — not a verified 2026 Arizona session-law amendment.",
    path: paths.law(c.slug),
  });
  if (!c.onIndex) {
    return { ...meta, robots: { index: false, follow: true } };
  }
  return meta;
}

export default async function LawDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getLawChange(slug);
  if (!c) notFound();
  const src = getSource(c.source_id);
  return (
    <main className="wrap hero">
      <p className="kicker">{c.onIndex ? `Law detail · ${lawStatus(c)}` : "Study note"}</p>
      <h1>{c.title}</h1>
      {!c.onIndex ? (
        <p className="notice">
          This URL is kept so existing links do not break. It is a study note, not a 2026 Arizona session-law
          amendment. For verified changes with effective dates, see the{" "}
          <Link href={paths.laws}>Arizona law-change index</Link>.
        </p>
      ) : null}
      <p>
        {c.onIndex ? `Effective ${c.effective_from}. ` : ""}{c.who_affected}
      </p>
      <div className="grid grid-2">
        <div className="card">
          <h2>{c.onIndex ? "Before" : "Common misconception"}</h2>
          <p>{c.before}</p>
        </div>
        <div className="card">
          <h2>{c.onIndex ? "After" : "Study guidance"}</h2>
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
          Practice related questions
        </Link>
      </div>
    </main>
  );
}
