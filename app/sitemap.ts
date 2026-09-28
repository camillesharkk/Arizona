import type { MetadataRoute } from "next";
import { paths } from "@/lib/paths";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = [
    paths.home,
    paths.practice,
    paths.questions,
    paths.study,
    paths.examPrep,
    paths.courses,
    paths.training,
    paths.become,
    paths.laws,
    paths.flashcards,
    paths.pricing,
    paths.privacy,
    paths.terms,
    paths.refund,
    paths.disclaimer,
    paths.contact,
  ];
  return urls.map((path) => ({ url: `${siteUrl()}${path}`, changeFrequency: "weekly" as const, priority: 0.8 }));
}
