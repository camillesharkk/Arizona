export type ArticleLink = {
  href: string;
  label: string;
  placement: "lede" | "section" | "end";
  targetMode: "quick" | "full" | "topic" | "guide" | "daily" | "pricing" | "official";
};

export type StateArticle = {
  id: string;
  state: "CA" | "HI" | "NY" | "PA";
  slug: string;
  path: string;
  keyword: string;
  intent: string;
  title: string;
  description: string;
  h1: string;
  kicker: string;
  lede: string;
  checked: string;
  updated: string;
  ledeCta: ArticleLink;
  sections: { heading: string; body: string; points?: string[]; link?: ArticleLink }[];
  endCta: ArticleLink;
  related: { href: string; label: string }[];
  faqs?: { q: string; a: string }[];
};

export function articleBySlug(articles: StateArticle[], slug: string) {
  return articles.find((article) => article.slug === slug);
}
