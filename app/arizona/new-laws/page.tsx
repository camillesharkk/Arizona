import Link from "next/link";
import { lawChanges, lawStatus } from "@/data/laws";
import { examConfig } from "@/data/exam-config";
import { getSource } from "@/data/sources";

export const metadata = {
  title: "Arizona Notary Law Changes 2026",
  description: "What changed in Arizona notary law and which practice questions to study.",
};

export default function NewLawsPage() {
  return (
    <main className="wrap hero">
      <p className="kicker">New Laws</p>
      <h1>Arizona Notary Law Changes {examConfig.year} — What Changed and What to Study</h1>
      <p className="lede">
        Status is computed from effective dates vs last verified ({examConfig.lastVerifiedAt}), not
        baked into the template.
      </p>
      <div className="row">
        <Link className="btn btn-primary" href="/arizona/questions/new-laws/">
          Practice New-Law Questions
        </Link>
        <a className="btn btn-ghost" href={examConfig.officialManualUrl} target="_blank" rel="noreferrer">
          Read Official Source
        </a>
      </div>
      {lawChanges.map((c) => {
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
        <h2>Revision history</h2>
        <p>V1.0 · {examConfig.lastVerifiedAt} · Independent study rewrite. Re-verify against SOS before relying.</p>
      </section>
    </main>
  );
}
