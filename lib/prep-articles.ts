import { stateSeoArticles } from '@/lib/seo-article-catalog';
import type { PrepCode } from "@/lib/prep-pack";
import type { StateArticle } from "@/lib/state-articles";
import { paReferenceCatalog } from "@/lib/pa-article-registry";
import { laReferenceCatalog } from "@/lib/la-article-registry";

// State content commits add only their own registry entry. No public launch flag lives here.
export const prepArticles: Partial<Record<PrepCode, StateArticle[]>> = stateSeoArticles;
export const prepReferences: Partial<Record<PrepCode, Record<string, StateArticle>>> = { PA: paReferenceCatalog, LA: laReferenceCatalog };
