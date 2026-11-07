import { canonicalUrl, site } from "@/lib/site";

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string;
  index?: boolean;
}) {
  const url = canonicalUrl(opts.path);
  return {
    title: { absolute: opts.title },
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      siteName: site.legalName,
      type: "website" as const,
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image" as const,
      title: opts.title,
      description: opts.description,
    },
    robots: { index: opts.index !== false, follow: true },
  };
}
