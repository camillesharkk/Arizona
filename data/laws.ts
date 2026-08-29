import type { LawChange } from "@/lib/types";
import { examConfig } from "@/data/exam-config";

export const lawChanges: LawChange[] = [
  {
    slug: "effective-date-discipline",
    title: "Acts follow the law in force on the date of notarization",
    effective_from: "2026-01-01",
    status: new Date(examConfig.lastVerifiedAt) >= new Date("2026-01-01") ? "effective" : "upcoming",
    who_affected: "Every commissioned Arizona notary and every applicant studying from older outlines.",
    before: "Some notaries treated the handbook they received at commissioning as frozen for the entire four-year term.",
    after: "Study materials and live practice must track statutory effective dates. Acts on or after a change follow the new rule.",
    impact: "When SOS or the legislature updates identification, RON, or fee rules, update your seal/journal/process the same day the rule takes effect—not at renewal.",
    source_id: "sos_exam",
  },
  {
    slug: "ron-is-regulated",
    title: "Remote online notarization is not an informal video chat",
    effective_from: "2026-01-01",
    status: "effective",
    who_affected: "Notaries who notarize for signers who are not physically present.",
    before: "A well-meaning notary might assume any video call plus a photo of ID is enough.",
    after: "Authorized RON requires registered technology, identity proofing, and electronic records that meet Arizona requirements.",
    impact: "If you are not registered and equipped for RON, require in-person appearance. Do not improvise.",
    source_id: "ars_41_311",
  },
  {
    slug: "fee-cap-reminders",
    title: "Fee caps remain a high-risk compliance field",
    effective_from: "2026-01-01",
    status: "effective",
    who_affected: "Mobile notaries and businesses that add 'convenience' charges.",
    before: "Some offices bundled unspecified rush fees on top of the notarial act.",
    after: "Treat the statutory maximum as a hard ceiling unless an official source clearly allows a listed extra charge.",
    impact: "Rebuild your price sheet from the current statute, not from last year's flyer.",
    source_id: "ars_41_311",
  },
];

export function getLawChange(slug: string): LawChange | undefined {
  return lawChanges.find((l) => l.slug === slug);
}

export function lawStatus(change: LawChange, asOf = examConfig.lastVerifiedAt): "effective" | "upcoming" {
  return new Date(asOf) >= new Date(change.effective_from) ? "effective" : "upcoming";
}
