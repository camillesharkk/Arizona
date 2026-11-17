import { fullStateArticles as existingFullStateArticles } from '@/data/full-state-articles';
import { caArticles as existingCaArticles } from '@/data/ca-articles';
import { hiArticles as existingHiArticles } from '@/data/hi-articles';
import { nyArticles as existingNyArticles } from '@/data/ny-articles';
import { paArticles as existingPaArticles } from '@/data/pa-articles';
import { laArticles as existingLaArticles } from '@/data/la-articles';
import { ctArticles as existingCtArticles } from '@/data/ct-articles';
import { inArticles as existingInArticles, ncArticles as existingNcArticles } from '@/data/new-state-articles';
import { supplementalArticles } from '@/data/seo-matrix-articles';
import { freeStateCatalog } from '@/lib/free-state-catalog';
import { prepStates } from '@/lib/states';
import type { StateArticle } from '@/lib/state-articles';
import type { StateCode } from '@/lib/types';

const existing: Partial<Record<StateCode, StateArticle[]>> = {
  ...existingFullStateArticles, CA: existingCaArticles, HI: existingHiArticles,
  NY: existingNyArticles, PA: existingPaArticles, LA: existingLaArticles,
  CT: existingCtArticles, IN: existingInArticles, NC: existingNcArticles,
};

export const stateSeoArticles = Object.fromEntries(
  prepStates.map(({ code }) => [code, [...(existing[code as StateCode] || []), ...(supplementalArticles[code as StateCode] || [])]]),
) as Record<StateCode, StateArticle[]>;

export const fullStateArticles = Object.fromEntries(
  freeStateCatalog.map(([code]) => [code, stateSeoArticles[code]]),
) as typeof existingFullStateArticles;

export const caArticles = stateSeoArticles.CA;
export const hiArticles = stateSeoArticles.HI;
export const nyArticles = stateSeoArticles.NY;
export const paArticles = stateSeoArticles.PA;
export const laArticles = stateSeoArticles.LA;
export const ctArticles = stateSeoArticles.CT;
export const inArticles = stateSeoArticles.IN;
export const ncArticles = stateSeoArticles.NC;
