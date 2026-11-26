import type { LawChange } from "../lib/types.ts";
import { examConfig } from "./exam-config.ts";

/** Date used to compute effective vs upcoming on the public law pages. */
export const lawIndexAsOf = "2026-09-28";

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
    onIndex: false,
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
    onIndex: false,
  },
  {
    slug: "fee-cap-reminders",
    title: "Fee caps remain a high-risk compliance field",
    effective_from: "2026-01-01",
    status: "effective",
    who_affected: "Mobile notaries and businesses that add 'convenience' charges.",
    before: "Some offices bundled unspecified rush fees on top of the notarial act.",
    after: "R2-12-1102 sets the fee limits. A.R.S. § 41-316(C) bars any notarial-act fee the rule does not authorize.",
    impact: "Choose a standard fee within the rule's limits, post it conspicuously, and tell the requestor the fee before the act.",
    source_id: "aac_r2_12_1102",
    onIndex: false,
  },
  {
    slug: "sb1479-journal-thumbprint",
    title: "Journal thumbprint for deeds and powers of attorney (SB 1479)",
    effective_from: "2026-09-12",
    status: "effective",
    who_affected: "Notaries who notarize deeds, quitclaim deeds, deeds of trust, other real-property documents, or powers of attorney.",
    before: "A.R.S. § 41-254 required personal appearance but did not require a journal thumbprint for those documents.",
    after: "For covered acts, record the signer’s right thumbprint in the journal. If that thumb is unavailable, use the left thumb or another available finger and note it in the journal. If the signer physically cannot provide a print, record that fact and explain the physical condition. Exceptions include a trustee’s deed from judicial or nonjudicial foreclosure and a deed of release and reconveyance. For a remote act that complies with § 41-263, § 41-254(D)(3) requires both an identification credential number in the journal and retention of the audiovisual recording for at least seven years before the exception applies.",
    impact: "For a covered in-person document, identify the document type first and check whether a statutory exception applies. For remote credential analysis and identity proofing, A.A.C. R2-12-1309(A)(5) excludes the credential’s serial or identification number from the journal description. Check current Secretary of State guidance before relying on the remote thumbprint exception.",
    source_id: "az_sb_1479_2026",
    onIndex: true,
  },
];

export function hubLawChanges(): LawChange[] {
  return lawChanges.filter((c) => c.onIndex);
}

export function getLawChange(slug: string): LawChange | undefined {
  return lawChanges.find((l) => l.slug === slug);
}

export function lawStatus(change: LawChange, asOf = lawIndexAsOf): "effective" | "upcoming" {
  return new Date(asOf) >= new Date(change.effective_from) ? "effective" : "upcoming";
}
