/** Unreleased packs remain unavailable on production, even if preview is enabled. */
export function productionStateBlocked(state: unknown): boolean {
  return process.env.VERCEL_ENV === "production" &&
    (state === "NY" || state === "PA" || state === "LA");
}
