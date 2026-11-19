// Held items remain available to historical readers at their original version.
const held: Readonly<Record<string, string>> = {
  "az-048": "2026-11-19",
  "az-113": "2026-11-19",
  "az-180": "2026-11-19",
  "az-206": "2026-11-19",
  "in-059": "2026-11-19",
  "ny-046": "2026-11-19",
  "ri-039": "2026-11-19",
  "ri-183": "2026-11-19",
  "ri-184": "2026-11-19",
  "ri-200": "2026-11-19",
  "tx-056": "2026-11-19",
  "tx-102": "2026-11-19",
  "tx-104": "2026-11-19",
  "tx-105": "2026-11-19",
  "tx-106": "2026-11-19",
  "tx-119": "2026-11-19",
  "tx-143": "2026-11-19",
  "tx-190": "2026-11-19",
};

export function questionDrawHold(id: string): string | null {
  return held[id] ?? null;
}
