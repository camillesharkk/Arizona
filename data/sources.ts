import type { Source } from "../lib/types.ts";

export const sources: Record<string, Source> = {
  sos_handbook: {
    source_id: "sos_handbook",
    source_type: "Manual",
    title: "Arizona Notary Public Handbook",
    reference: "SOS Notary Handbook (current edition)",
    url: "https://azsos.gov/business/notary",
    last_verified_at: "2026-08-01",
  },
  ars_41_311: {
    source_id: "ars_41_311",
    source_type: "Statute",
    title: "Arizona Revised Statutes — Notaries Public",
    reference: "A.R.S. Title 41, Chapter 2, Article 2",
    url: "https://www.azleg.gov/arsDetail/?title=41",
    last_verified_at: "2026-08-01",
  },
  sos_exam: {
    source_id: "sos_exam",
    source_type: "SOS",
    title: "Arizona SOS Notary Exam & Application",
    reference: "Arizona Secretary of State — Become a Notary",
    url: "https://azsos.gov/business/notary",
    last_verified_at: "2026-08-01",
  },
};

export function getSource(id: string): Source {
  return sources[id] ?? sources.sos_handbook;
}
