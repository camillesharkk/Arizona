import Link from "next/link";
import { affiliateLinks, affiliateOffers } from "@/data/affiliates";
import { pageMeta } from "@/lib/seo";
import { paths } from "@/lib/paths";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { site } from "@/lib/site";

export const metadata = pageMeta({
  title: "Best Arizona Notary Courses & Exam Prep 2026",
  description:
    "Compare Arizona notary training options including NNA, Notary.net, and bond issuers. Independent exam prep vs official SOS requirements.",
  path: paths.courses,
  keywords: "Arizona notary courses, Arizona notary training, Arizona notary exam prep",
});

const faqs = [
  { q: "Does a paid course replace the Arizona SOS exam?", a: "No. Only the official Arizona process commissions you. Courses are optional study aids." },
  { q: "What should I buy first?", a: "Pass the exam with free practice here, then shop the required bond. Optional E&O and national memberships come later." },
];

export default function CoursesPage() {
  return (
    <main className="wrap hero">
      <JsonLd data={faqJson(faqs)} />
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Courses", path: paths.courses }]} />
      <p className="kicker">Affiliate comparison</p>
      <h1>Best Arizona notary courses and exam prep</h1>
      <p className="lede">
        We rank tools by how clearly they separate Arizona SOS requirements from national marketing. {site.independent}
      </p>
      <p>
        <Link href={paths.affiliate}>Affiliate disclosure</Link>
      </p>
      <p>
        Our own pick for the exam itself is the free practice test on this site, then Pro if you need the full bank. Outside courses
        are compared below for people who want video, membership, or a bond quote.
      </p>
      <div className="card" style={{ overflowX: "auto" }}>
        <table className="compare">
          <thead>
            <tr>
              <th>Provider</th>
              <th>Price</th>
              <th>Practice Test</th>
              <th>State specific</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            {affiliateOffers.map((o) => (
              <tr key={o.id}>
                <td>
                  {o.name} {o.badge && <span className="badge">{o.badge}</span>}
                </td>
                <td>{o.price}</td>
                <td>{o.practiceTest}</td>
                <td>{o.stateSpecific}</td>
                <td>{o.bestFor}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {affiliateOffers.map((o) => (
        <article className="card" key={o.id} style={{ marginTop: 16 }} id={o.id}>
          <h2>{o.name}</h2>
          <p>{o.summary}</p>
          <p>
            <strong>Pros:</strong> {o.pros.join("; ")}
          </p>
          <p>
            <strong>Cons:</strong> {o.cons.join("; ")}
          </p>
          <a className="btn btn-primary" href={affiliateLinks[o.urlKey]} target="_blank" rel="noreferrer sponsored">
            Visit website
          </a>
        </article>
      ))}
      {faqs.map((f) => (
        <details className="card" key={f.q} style={{ marginTop: 12 }}>
          <summary>
            <strong>{f.q}</strong>
          </summary>
          <p>{f.a}</p>
        </details>
      ))}
    </main>
  );
}
