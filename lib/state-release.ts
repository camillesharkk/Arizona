/** All configured packs are available on the public state routes. */
export function productionStateBlocked(_state: unknown): boolean {
  return false;
}

export function prepPageEnabled(slug: string): boolean {
  return ["new-york", "pennsylvania", "louisiana", "connecticut", "north-carolina", "indiana"].includes(slug) ||
    (process.env.VERCEL_ENV !== "production" && process.env.STATE_PREVIEW === "1");
}
