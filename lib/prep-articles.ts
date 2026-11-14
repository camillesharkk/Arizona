import { fullStateArticles } from '@/data/full-state-articles';
import { nyArticles } from "@/data/ny-articles";
import type { PrepCode } from "@/lib/prep-pack";
import type { StateArticle } from "@/lib/state-articles";
import { paArticleCatalog, paReferenceCatalog } from "@/lib/pa-article-registry";
import { laArticleCatalog, laReferenceCatalog } from "@/lib/la-article-registry";

// State content commits add only their own registry entry. No public launch flag lives here.
export const prepArticles: Partial<Record<PrepCode, StateArticle[]>> = { ...fullStateArticles, NY: nyArticles, PA: paArticleCatalog, LA: laArticleCatalog };
export const prepReferences: Partial<Record<PrepCode, Record<string, StateArticle>>> = { PA: paReferenceCatalog, LA: laReferenceCatalog };
