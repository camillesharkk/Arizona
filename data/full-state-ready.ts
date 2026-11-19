import type { FreeStateCode } from "../lib/free-state-catalog.ts";

/** Ready flags only. Question ids stay in full-state-summary, which client code must not import. */
export const fullStateReady: Partial<Record<FreeStateCode, boolean>> = {
  "AR": true,
  "CO": true,
  "IL": true,
  "ME": true,
  "MD": true,
  "MO": true,
  "MT": true,
  "NE": true,
  "NV": true,
  "NJ": true,
  "NM": true,
  "OH": true,
  "OR": true,
  "UT": true,
  "VT": true,
  "WI": true,
  "WY": true,
  "RI": true,
  "TX": true
};
