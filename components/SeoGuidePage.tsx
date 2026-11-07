import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, articleJson, faqJson } from "@/components/JsonLd";
import { getSource } from "@/data/sources";
import { officialExamChecked } from "@/data/exam-config";
import { expandedGuides } from "@/lib/seo-expansion";
import { paths } from "@/lib/paths";
import { seoGuideById } from "@/lib/seo-guides";

const MODIFIED = "2026-11-07";

export function SeoGuidePage({ id }: { id: string }) {
  const guide = seoGuideById(id);
  const cta = guide.ctas?.[0];
  const showFaqSchema = guide.index !== false && Boolean(guide.faqs?.length);
  const published = expandedGuides.some((item) => item.id === guide.id) ? "2026-10-13" : "2026-09-29";
  const showKicker = guide.kicker.trim().toLowerCase() !== guide.h1.trim().toLowerCase() && !guide.h1.startsWith(guide.kicker);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Arizona", path: paths.home },
    { name: "Guides", path: paths.guidesIndex },
    { name: showKicker ? guide.kicker : guide.h1, path: guide.path },
  ];
  return (
    <main className="wrap hero">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            articleJson({
              headline: guide.h1,
              description: guide.description,
              path: guide.path,
              datePublished: published,
              dateModified: MODIFIED,
            }),
            ...(showFaqSchema && guide.faqs ? [faqJson(guide.faqs)] : []),
          ],
        }}
      />
      <Breadcrumb items={crumbs} />
      {showKicker ? <p className="kicker">{guide.kicker}</p> : null}
      <h1>{guide.h1}</h1>
      <p className="lede">{guide.lede}</p>
      <p className="notice">Published {published}. Updated {MODIFIED}. {siteByline()}</p>
      {guide.checked === officialExamChecked ? (
        <p className="notice">
          Question count, time, and the retry rule are kept on the <Link href="/arizona/exam-guide/">Arizona exam guide</Link>.
        </p>
      ) : guide.checked ? (
        <p className="notice">{guide.checked}</p>
      ) : null}
      {cta ? (
        <p>
          <Link className="btn btn-primary" href={cta.href}>
            {cta.label}
          </Link>
        </p>
      ) : null}
      {guide.sections.map((section) => (
        <section className="card" key={section.heading} style={{ marginTop: 18 }}>
          <h2>{section.heading}</h2>
          <p>{section.body}</p>
          {section.points ? (
            <ul>
              {section.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          ) : null}
          {section.sourceId ? (
            <p className="notice">
              Official source: <a href={getSource(section.sourceId).url}>{getSource(section.sourceId).title}</a>
              {" · "}
              {getSource(section.sourceId).reference}
            </p>
          ) : null}
          {section.href ? (
            <p>
              <Link href={section.href}>{section.hrefLabel || "Continue"}</Link>
            </p>
          ) : null}
        </section>
      ))}
      {guide.faqs?.map((item) => (
        <details className="card" key={item.q} style={{ marginTop: 12 }}>
          <summary>
            <strong>{item.q}</strong>
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
      <section className="card" style={{ marginTop: 24 }}>
        <h2>Related reading</h2>
        <ul>
          {guide.related.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function siteByline() {
  return "Written by Arizona Notary Exam Practice.";
}
