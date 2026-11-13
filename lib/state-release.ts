/** All configured packs have a public learning route in this release candidate. */
export function productionStateBlocked(_state: unknown): boolean {
  return _state === "CT" && (process.env.VERCEL_ENV === "production" || process.env.NEXT_PUBLIC_CT_PREVIEW !== "1");
}

/** Production middleware continues to reject every /preview/ URL. */
export function prepPageEnabled(stateSlug: string): boolean {
  if (stateSlug === "connecticut") return !productionStateBlocked("CT");
  return stateSlug === "new-york" || stateSlug === "pennsylvania" || stateSlug === "louisiana" ||
    (process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1");
}
