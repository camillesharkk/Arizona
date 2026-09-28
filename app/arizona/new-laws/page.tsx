import Link from "next/link";
import { hubLawChanges, lawIndexAsOf, lawStatus } from "@/data/laws";
import { getSource } from "@/data/sources";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";

export const metadata = pageMeta({
  title: "Arizona Notary Law Change: SB 1479 (Sept. 12, 2026)",
  description:
    "Verified Arizona notary session-law change: Laws 2026, Chapter 31 (SB 1479) journal thumbprint rule, effective September 12, 2026.",
  path: paths.laws,
});

export default function NewLawsPage() {
  const listed = hubLawChanges();
  return (
    <main className="wrap hero">
      <p className="kicker">Arizona session law</p>
      <h1>Arizona Notary Law Change — SB 1479 Journal Thumbprint</h1>
      <p className="lede">
        Verified Arizona update: SB 1479 adds journal-thumbprint requirements for covered documents,
        effective September 12, 2026. Read the exceptions before applying the rule.
      </p>
      <p>Effective-date confirmation: <a href="https://azsos.gov/business/notary">Arizona Secretary of State SB 1479 notice</a>. Signed April 9, 2026.</p>
      <p className="notice">
        Status uses each item’s statutory effective date (as of {lawIndexAsOf}). Re-read the chaptered session law
        before you rely on it.
      </p>
      <div className="row">
        <Link className="btn btn-primary" href="/arizona/questions/new-laws/">
          Practice SB 1479 Questions
        </Link>
        <Link className="btn btn-ghost" href={paths.study}>
          Study Guide
        </Link>
      </div>
      {listed.map((c) => {
        const status = lawStatus(c);
        const src = getSource(c.source_id);
        return (
          <article key={c.slug} className="card" style={{ marginTop: 18 }}>
            <span className={status === "effective" ? "badge" : "badge badge-warn"}>{status}</span>
            <h2>
              <Link href={`/arizona/laws/${c.slug}/`}>{c.title}</Link>
            </h2>
            <p>
              <strong>Effective {c.effective_from}</strong> · {c.who_affected}
            </p>
            <div className="grid grid-2">
              <div className="stat">
                <b>Before</b>
                <span>{c.before}</span>
              </div>
              <div className="stat">
                <b>After</b>
                <span>{c.after}</span>
              </div>
            </div>
            <p>
              <strong>What to do:</strong> {c.impact}
            </p>
            <p className="notice">
              {src.title} · <a href={src.url}>{src.url}</a>
            </p>
          </article>
        );
      })}
      <section className="card" style={{ marginTop: 18 }}>
        <h2>What this page does not cover</h2>
        <p>
          Standing Arizona rules (identification, RON technology, fee caps) belong in the{" "}
          <Link href={paths.study}>Study Guide</Link>. Those rules are not listed here as 2026 “changes” unless a
          session law with a verified effective date amended them.
        </p>
      </section>
    </main>
  );
}
