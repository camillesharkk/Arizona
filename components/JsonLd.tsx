import { canonicalUrl, publicBrand } from "@/lib/site";
import { availableStates } from "@/lib/states";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />
  );
}

const origin = canonicalUrl().slice(0, -1);

export function defaultGraph() {
  const description =
    "Independent notary practice and study guides for supported U.S. states.";
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${origin}/#organization`,
        name: publicBrand,
        url: origin,
        description,
        areaServed: availableStates().map(({ name }) => ({ "@type": "State", name })),
      },
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        name: publicBrand,
        url: origin,
        description,
        publisher: { "@id": `${origin}/#organization` },
      },
    ],
  };
}

export function articleJson(input: {
  headline: string;
  description: string;
  path: string;
  datePublished: string;
  dateModified: string;
}) {
  return {
    "@type": "BlogPosting",
    headline: input.headline,
    description: input.description,
    inLanguage: "en-US",
    mainEntityOfPage: canonicalUrl(input.path),
    datePublished: input.datePublished,
    dateModified: input.dateModified,
    author: { "@id": `${origin}/#organization` },
    publisher: { "@id": `${origin}/#organization` },
  };
}

export function breadcrumbJson(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: canonicalUrl(item.path),
    })),
  };
}

export function faqJson(items: { q: string; a: string }[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

export function quizJson() {
  return {
    "@type": "Quiz",
    name: "Arizona Notary Practice Test",
    educationalLevel: "professional",
    about: "Arizona notary public exam practice",
  };
}
