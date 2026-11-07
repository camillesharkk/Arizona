import Link from "next/link";
import { ArticleLink, ArticleView } from "@/components/ArticleLink";
import { Breadcrumb } from "@/components/Breadcrumb";
import { JsonLd, articleJson, faqJson } from "@/components/JsonLd";
import type { StateArticle } from "@/lib/state-articles";

export function StateArticlePage({ article }: { article: StateArticle }) {
  const home = article.state === "CA" ? "/california/" : "/hawaii/";
  const stateName = article.state === "CA" ? "California" : "Hawaii";
  const resources = `${home}resources/`;
  const crumbs = [
    { name: "Home", path: "/" },
    { name: stateName, path: home },
    { name: "Resources", path: resources },
    { name: article.kicker, path: article.path },
  ];
  const graph: Record<string, unknown>[] = [
    articleJson({
      headline: article.h1,
      description: article.description,
      path: article.path,
      datePublished: article.updated,
      dateModified: article.updated,
    }),
  ];
  if (article.faqs?.length) graph.push(faqJson(article.faqs));
  return (
    <main className="wrap hero">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": graph }} />
      <ArticleView articleId={article.id} articleState={article.state} />
      <Breadcrumb items={crumbs} />
      <p className="kicker">{article.kicker}</p>
      <h1>{article.h1}</h1>
      <p className="lede">{article.lede}</p>
      <p>
        <ArticleLink
          className="btn btn-primary"
          articleId={article.id}
          articleState={article.state}
          href={article.ledeCta.href}
          label={article.ledeCta.label}
          placement={article.ledeCta.placement}
          targetMode={article.ledeCta.targetMode}
        />
      </p>
      <p className="notice">Published {article.updated}. Arizona Notary Exam Practice. {article.checked}</p>
      {article.sections.map((section) => (
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
          {section.link ? (
            <p>
              <ArticleLink
                articleId={article.id}
                articleState={article.state}
                href={section.link.href}
                label={section.link.label}
                placement={section.link.placement}
                targetMode={section.link.targetMode}
              />
            </p>
          ) : null}
        </section>
      ))}
      {article.faqs?.map((item) => (
        <details className="card" key={item.q} style={{ marginTop: 12 }}>
          <summary>
            <strong>{item.q}</strong>
          </summary>
          <p>{item.a}</p>
        </details>
      ))}
      <p style={{ marginTop: 18 }}>
        <ArticleLink
          articleId={article.id}
          articleState={article.state}
          href={article.endCta.href}
          label={article.endCta.label}
          placement={article.endCta.placement}
          targetMode={article.endCta.targetMode}
        />
      </p>
      <section className="card" style={{ marginTop: 24 }}>
        <h2>Related reading</h2>
        <ul>
          {article.related.map((item) => (
            <li key={item.href}>
              {item.href.startsWith("/") ? <Link href={item.href}>{item.label}</Link> : <a href={item.href}>{item.label}</a>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
