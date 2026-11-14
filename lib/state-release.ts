import { isFreeState, releasedFreeStates } from './free-state-catalog';

/** Public activation follows preview acceptance for each free launch. */
export function productionStateBlocked(state: unknown): boolean {
  return process.env.VERCEL_ENV === 'production' && isFreeState(state) && !releasedFreeStates.includes(state);
}

export function prepPageEnabled(slug: string): boolean {
  return ["new-york", "pennsylvania", "louisiana", "connecticut", "north-carolina", "indiana"].includes(slug) ||
    (process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1");
}
