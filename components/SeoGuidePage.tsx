import Link from "next/link";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, faqJson } from "@/components/JsonLd";
import { getSource } from "@/data/sources";
import { paths } from "@/lib/paths";
import { seoGuideById } from "@/lib/seo-guides";

export function SeoGuidePage({ id }: { id: string }) {
  const guide = seoGuideById(id);
  const ctas = (guide.ctas ?? []).slice(0, 2);
  const showFaqSchema = guide.index !== false && Boolean(guide.faqs?.length);
  return (
    <main className="wrap hero">
      {showFaqSchema && guide.faqs ? (
        <JsonLd data={{ "@context": "https://schema.org", ...faqJson(guide.faqs) } as Record<string, unknown>} />
      ) : null}
      <Breadcrumb items={[{ name: "Home", path: paths.home }, { name: "Exam guides", path: paths.guidesIndex }, { name: guide.kicker, path: guide.path }]} />
      <p className="kicker">{guide.kicker}</p>
      <h1>{guide.h1}</h1>
      <p className="lede">{guide.lede}</p>
      {guide.checked ? <p className="notice">{guide.checked}</p> : null}
      {ctas[0] ? (
        <p>
          <Link className="btn btn-primary" href={ctas[0].href}>
            {ctas[0].label}
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
      {ctas[1] ? (
        <p style={{ marginTop: 18 }}>
          <Link href={ctas[1].href}>{ctas[1].label}</Link>
        </p>
      ) : null}
      <section className="card" style={{ marginTop: 24 }} aria-label="Choose your next study step">
        <h2>Put this guide into practice</h2>
        <ul>
          <li><Link href={`${paths.practice}?mode=quick`}>Free Quick 10: find a weak topic</Link></li>
          <li><Link href={`${paths.practice}?mode=full`}>Full 45: practice pacing</Link> — one free Full 45 in this browser.</li>
          <li><Link href={paths.study}>Study Guide: understand the rule</Link></li>
          <li><Link href={paths.pricing}>View Pro</Link> for the rest of this site’s practice bank. Official sources on this page stay free.</li>
        </ul>
      </section>
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
