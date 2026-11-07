import { site, siteUrl } from "@/lib/site";

export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
  );
}

export function defaultGraph(state: "AZ" | "CA" | "HI" = "AZ") {
  const url = siteUrl();
  const name = state === "CA" ? "California Exam" : state === "HI" ? "Hawaii Exam" : site.legalName;
  const siteName = state === "CA" ? "California Exam" : state === "HI" ? "Hawaii Exam" : site.name;
  const description =
    state === "CA"
      ? "Independent California notary exam practice. Not a government office and not affiliated with the California Secretary of State."
      : state === "HI"
        ? "Independent Hawaii notary exam practice. Not a government office and not affiliated with the Hawaii Department of the Attorney General."
        : site.independent;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name,
        url,
        description,
      },
      {
        "@type": "WebSite",
        name: siteName,
        url,
      },
    ],
  };
}

export function breadcrumbJson(items: { name: string; path: string }[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${siteUrl()}${item.path}`,
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
