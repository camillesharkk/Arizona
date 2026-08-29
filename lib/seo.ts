import { siteUrl } from "@/lib/site";

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
}) {
  const url = `${siteUrl()}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: "Arizona Exam",
      type: "website" as const,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: opts.title,
      description: opts.description,
    },
    robots: { index: true, follow: true },
  };
}
