import type { MetadataRoute } from "next";
import { seoGuides } from "@/lib/seo-guides";
import { paths } from "@/lib/paths";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = [
    paths.home,
    paths.practice,
    paths.questions,
    paths.study,
    paths.studyCards,
    paths.daily,
    paths.examPrep,
    paths.guidesIndex,
    paths.passingScore,
    paths.fees,
    paths.bond,
    paths.ron,
    paths.cram,
    paths.mistakesGuide,
    paths.courses,
    paths.training,
    paths.become,
    paths.laws,
    paths.flashcards,
    paths.resources,
    paths.pricing,
    paths.privacy,
    paths.terms,
    paths.refund,
    paths.disclaimer,
    paths.contact,
  ];
  const indexed = [...new Set([...urls, ...seoGuides.filter((guide) => guide.index !== false).map((guide) => guide.path)])];
  return indexed.map((path) => ({ url: `${siteUrl()}${path}`, changeFrequency: "weekly" as const, priority: 0.8 }));
}
