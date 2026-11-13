import type { Source } from "../lib/types.ts";

const NC_CHECKED = "2026-11-13";
const statuteSections = [3, 5, 7, 8, 9, 10, 13, 20, 22, 23, 24, 30, 31, 32, 35, 36, 37, 38, 40, 50, 60, 67, 68];
const rulesUrl = "https://reports.oah.state.nc.us/ncac/title%2018%20-%20secretary%20of%20state/chapter%2007%20-%20notary%20public%20division/chapter%2007%20rules.html";
export const ncSources: Record<string, Source> = Object.fromEntries(statuteSections.map(section => [`nc-10b-${section}`, {
  source_id: `nc-10b-${section}`, source_type: "Statute" as const,
  title: `North Carolina General Statutes § 10B-${section}`,
  reference: `G.S. 10B-${section}, current enacted text checked ${NC_CHECKED}`,
  url: `https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_10B/GS_10B-${section}.html`,
  last_verified_at: NC_CHECKED, last_checked_at: NC_CHECKED,
}]));
ncSources["nc-rules"] = {
  source_id: "nc-rules", source_type: "Rule", title: "18 NCAC Chapter 07 — Notary Public Division",
  reference: "Current OAH compilation, including July 1, 2025 amendments, checked 2026-11-13",
  url: rulesUrl, document_url: rulesUrl.replace(".html", ".pdf"),
  last_verified_at: NC_CHECKED, last_checked_at: NC_CHECKED,
};
ncSources["nc-sos-manual"] = {
  source_id: "nc-sos-manual", source_type: "SOS", title: "The North Carolina Notary Manual, 2026 — official availability notice",
  reference: "SOS notice that 2026 edition replaces 2016 and each notary must have a personal copy",
  url: "https://www.sosnc.gov/online_services/notary_external/notary_manual_home",
  last_verified_at: NC_CHECKED, last_checked_at: NC_CHECKED,
};
