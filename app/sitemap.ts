import { fullStateSummary } from '@/data/full-state-summary';
import { stateSeoArticles } from '@/lib/seo-article-catalog';
import { stateByCode } from '@/lib/states';
import { freeStateCatalog, freeStateFeatures, freeStatePaths, releasedFreeStates } from "@/lib/free-state-catalog";
import { ctPaths } from "@/lib/ct-site";
import { inPaths } from "@/lib/in-site";
import { ncPaths } from "@/lib/nc-site";
import type { MetadataRoute } from "next";
import { paPaths } from "@/lib/pa-site";
import { laPaths } from "@/lib/la-site";
import { nyPaths } from "@/lib/ny-site";
import { seoGuides } from "@/lib/seo-guides";
import { paths } from "@/lib/paths";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { canonicalUrl } from "@/lib/site";
import { communityInsightsUpdatedAt } from "@/data/community-insights";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls = [
    "/",
    ...freeStateCatalog.filter(([code]) => releasedFreeStates.includes(code)).flatMap(([code, , slug]) => {
      const site = freeStatePaths(slug);
      return [site.home, site.practice, site.study, site.become, site.resources, site.examGuide, site.laws, ...(fullStateSummary[code]?.ready ? [site.questions, site.studyCards, ...(freeStateFeatures[code]?.purchase !== false ? [site.pricing] : [])] : [])];
    }),
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
    paths.community,
    caPaths.home,
    caPaths.practice,
    caPaths.questions,
    caPaths.study,
    caPaths.studyCards,
    caPaths.resources,
    caPaths.examGuide,
    caPaths.passingScore,
    caPaths.laws,
    caPaths.become,
    caPaths.pricing,
    hiPaths.home,
    hiPaths.practice,
    hiPaths.questions,
    hiPaths.study,
    hiPaths.studyCards,
    hiPaths.resources,
    hiPaths.examGuide,
    hiPaths.passingScore,
    hiPaths.laws,
    hiPaths.become,
    hiPaths.pricing,
    nyPaths.home,
    nyPaths.practice,
    nyPaths.questions,
    nyPaths.study,
    nyPaths.studyCards,
    nyPaths.resources,
    nyPaths.examGuide,
    nyPaths.passingScore,
    nyPaths.laws,
    nyPaths.become,
    nyPaths.pricing,
    paPaths.home,
    paPaths.practice,
    paPaths.questions,
    paPaths.study,
    paPaths.studyCards,
    paPaths.resources,
    paPaths.examGuide,
    paPaths.passingScore,
    paPaths.laws,
    paPaths.become,
    paPaths.pricing,
    laPaths.home,
    laPaths.practice,
    laPaths.questions,
    laPaths.study,
    laPaths.studyCards,
    laPaths.resources,
    laPaths.examGuide,
    laPaths.passingScore,
    laPaths.laws,
    laPaths.become,
    laPaths.pricing,
    ...[ctPaths, inPaths, ncPaths].flatMap(paths => [paths.home, paths.practice, paths.questions, paths.study, paths.studyCards, paths.resources, paths.examGuide, paths.passingScore, paths.laws, paths.become, paths.pricing]),
  ];
  const articles = Object.entries(stateSeoArticles)
    .filter(([code]) => stateByCode(code)?.status === 'available')
    .flatMap(([, articles]) => articles);
  const indexed = [...new Set([...urls, ...seoGuides.filter((guide) => guide.index !== false).map((guide) => guide.path), ...articles.map((article) => article.path)])];
  const updated = new Map<string, string>([
    ...articles.map((article) => [article.path, article.updated] as const),
    ...seoGuides.filter((guide) => guide.index !== false).map((guide) => [guide.path, "2026-11-07"] as const),
    [paths.flashcards, "2026-11-07"],
    ...(communityInsightsUpdatedAt ? [[paths.community, communityInsightsUpdatedAt] as const] : []),
  ]);
  return indexed.map((path) => ({
    url: canonicalUrl(path),
    ...(path === paths.community ? {} : { changeFrequency: "weekly" as const }),
    priority: updated.has(path) ? 0.7 : 0.8,
    ...(updated.has(path) ? { lastModified: updated.get(path) } : {}),
  }));
}
