/** Unreleased packs remain unavailable on production, even if preview is enabled. */
export function productionStateBlocked(state: unknown): boolean {
  return process.env.VERCEL_ENV === "production" &&
    state === "LA";
}

/** Shared page renderers also serve the released pack routes. */
export function prepPageEnabled(stateSlug: string): boolean {
  return stateSlug === "new-york" || stateSlug === "pennsylvania" ||
    (process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1");
}
