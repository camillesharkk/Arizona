import type { StudyChapter } from "../lib/types.ts";

export const chapters: StudyChapter[] = [
  {
    id: "commission",
    title: "Commission, Eligibility & Exam",
    topic: "commission",
    summary: "Who may apply, how long a commission lasts, and how the official exam fits into the SOS process.",
    sections: [
      {
        heading: "What a commission is",
        body: "An Arizona notary public is a public officer commissioned by the Secretary of State. The commission authorizes specific notarial acts inside Arizona. It is not a license to practice law, give immigration advice, or certify that a contract is 'legal.'",
      },
      {
        heading: "Eligibility in plain language",
        body: "Applicants must meet statutory residency, age, and character requirements and complete the SOS process. If you are unsure whether a criminal history or non-residency issue blocks you, read the official application instructions rather than guessing from a forum post.",
      },
      {
        heading: "Exam vs. commission",
        body: "A practice score on this site is a study signal only. The official exam, bond, oath, and filings are what create a live commission. Do not buy a stamp and start stamping documents before the commission is issued.",
      },
    ],
    keyFacts: [
      "Typical commission term: 4 years (verify before you apply).",
      "Commissioning authority: Arizona Secretary of State.",
      "Exam on this platform: timed, open-book model matching published SOS format fields.",
    ],
    source_id: "sos_exam",
  },
  {
    id: "identification",
    title: "Identifying the Signer",
    topic: "identification",
    summary: "Satisfactory evidence of identity is the foundation of every honest notarial act.",
    sections: [
      {
        heading: "Personal appearance",
        body: "The signer must appear—physically, or through an authorized remote online notarization session. A phone call or a mailed packet is not appearance.",
      },
      {
        heading: "Satisfactory evidence",
        body: "Use personal knowledge, an acceptable identification credential, or a credible witness if Arizona law allows that path. Unreadable, obviously altered, or mismatched ID is not 'close enough.'",
      },
      {
        heading: "Communication",
        body: "If you cannot communicate the acknowledgment or oath, stop. Showing ID does not fix a language or capacity barrier.",
      },
    ],
    keyFacts: [
      "ID must actually identify the person in front of you.",
      "Personal knowledge is a real relationship, not a social-media follow.",
      "Credible-witness rules are statutory—follow them exactly.",
    ],
    source_id: "sos_handbook",
  },
  {
    id: "acknowledgments",
    title: "Acknowledgments",
    topic: "acknowledgments",
    summary: "The signer acknowledges that the signature is theirs and was made voluntarily.",
    sections: [
      {
        heading: "What you are certifying",
        body: "You are not swearing that the deed is valid or that the price is fair. You are certifying identity, appearance, and a voluntary acknowledgment of the signature.",
      },
      {
        heading: "Prior signatures",
        body: "The wet signature may have been written earlier. The signer still must appear and acknowledge it. Never backdate the certificate to the original signing day.",
      },
      {
        heading: "Certificates",
        body: "Venue, date, name, signature, and seal must match reality. If two people are named and only one appears, do not claim both appeared.",
      },
    ],
    keyFacts: [
      "Acknowledgment ≠ oath that the document is true.",
      "Complete the venue for the place the act occurs.",
      "Loose certificates are for space, not for missing signers.",
    ],
    source_id: "sos_handbook",
  },
  {
    id: "jurats",
    title: "Jurats, Oaths & Affirmations",
    topic: "jurats",
    summary: "A jurat adds a truth oath or affirmation and a signature in your presence.",
    sections: [
      {
        heading: "The extra step",
        body: "If the certificate is a jurat, administer an oath or affirmation. If the signer refuses, you cannot complete a jurat. Do not silently swap in an acknowledgment.",
      },
      {
        heading: "Affirmations",
        body: "An affirmation is a solemn, legally binding promise without required religious language. Offer it when a signer objects to an oath.",
      },
      {
        heading: "Presence",
        body: "The signature on a jurat is made in your presence as part of the act. That is a common exam trap versus acknowledgments.",
      },
    ],
    keyFacts: [
      "Wrong certificate wording can void the act.",
      "Oath/affirmation is personal to the signer.",
      "Match the certificate to the act actually performed.",
    ],
    source_id: "sos_handbook",
  },
  {
    id: "journals",
    title: "The Notary Journal",
    topic: "journals",
    summary: "A sequential journal is evidence. It is not optional customer service.",
    sections: [
      {
        heading: "Why it exists",
        body: "When a signature is later disputed, the journal is how investigators reconstruct who appeared, how they were identified, and what act was performed.",
      },
      {
        heading: "How to write entries",
        body: "Make entries at the time of the act, in order. Do not invent a month-end summary. Do not skip 'regulars.'",
      },
      {
        heading: "Privacy and access",
        body: "Journals hold personal data. Disclose according to Arizona law—not by posting pages online, and not by destroying records to hide a problem.",
      },
    ],
    keyFacts: [
      "Contemporaneous sequential entries.",
      "Report a lost or stolen journal as required.",
      "End-of-commission handling follows SOS instructions.",
    ],
    source_id: "ars_41_311",
  },
  {
    id: "seals-fees",
    title: "Seal, Stamp & Fees",
    topic: "seals-fees",
    summary: "The seal authenticates the certificate. Fees are capped by statute.",
    sections: [
      {
        heading: "Control of the seal",
        body: "Only you may use your seal. Lending it, pre-signing blanks, or using it after expiration is a fast path to discipline.",
      },
      {
        heading: "Legibility",
        body: "If the impression cannot be read, the relying party cannot verify you. Re-stamp clearly without obliterating document text.",
      },
      {
        heading: "Fees vs. bond vs. E&O",
        body: "Statutory fees are a ceiling. The surety bond protects the public. E&O insurance, if purchased, protects you. They are not the same product.",
      },
    ],
    keyFacts: [
      "Name on seal matches commissioned name.",
      "Expired commission = stop all acts.",
      "Never exceed the legal fee cap, including 'rush' add-ons.",
    ],
    source_id: "ars_41_311",
  },
  {
    id: "prohibited-acts",
    title: "Prohibited Acts & Impartiality",
    topic: "prohibited-acts",
    summary: "Notaries are impartial public officers, not deal-makers.",
    sections: [
      {
        heading: "Conflicts",
        body: "If you are a party or have a disqualifying financial interest, refuse. Convenience is not an exception.",
      },
      {
        heading: "Unauthorized practice of law",
        body: "Explaining what an acknowledgment is differs from telling a customer which real-estate form they should use. The second is legal advice.",
      },
      {
        heading: "False certificates",
        body: "Backdating, claiming an absent signer appeared, or notarizing a blank signature line is fraud, not customer service.",
      },
    ],
    keyFacts: [
      "No notarizing your own signature.",
      "Capacity and willingness are required.",
      "Industry pressure is not a legal defense.",
    ],
    source_id: "sos_handbook",
  },
  {
    id: "new-laws",
    title: "Keeping Up With 2026 Changes",
    topic: "new-laws",
    summary: "Follow the law in effect on the date of the act. Study effective dates, not rumors.",
    sections: [
      {
        heading: "Effective dates",
        body: "A handbook you received at commissioning can lag. When a statute changes, acts on or after the effective date follow the new rule.",
      },
      {
        heading: "Remote online notarization",
        body: "RON is a regulated electronic process with technology and identity-proofing rules. It is not an informal video chat.",
      },
      {
        heading: "How this site treats updates",
        body: "New Laws pages pair a before/after explanation with practice items. Last verified dates are visible so you never treat stale copy as current law.",
      },
    ],
    keyFacts: [
      "Official SOS and statute text beat social posts.",
      "Practice questions should be regenerated when a source changes.",
      "Commission term does not freeze the statutes.",
    ],
    source_id: "sos_exam",
  },
  {
    id: "copy-certification",
    title: "Copy Certification",
    topic: "copy-certification",
    summary: "Certifying a copy is a distinct notarial act. Compare the copy to the original and do not certify Arizona public records except as the journal statute requires.",
    sections: [
      {
        heading: "What the officer must determine",
        body: "A.R.S. § 41-253(D) requires the officer who certifies or attests a copy to determine that the copy is a full, true, and accurate transcription or reproduction of the record or item. Guessing from memory is not that determination.",
      },
      {
        heading: "Arizona public records",
        body: "Except as required under A.R.S. § 41-319, a notarial officer may not certify or attest a copy of a public record of this state. Journal public-record entries are the statutory exception when a certified copy of the journal is requested.",
      },
      {
        heading: "Electronic records on paper",
        body: "A.R.S. § 41-252(C) separately allows a notarial officer to certify that a tangible copy of an electronic record is an accurate copy of that electronic record. That is not a license to certify an Arizona public record.",
      },
    ],
    keyFacts: [
      "Copy certification is a listed notarial act in A.R.S. § 41-251(6).",
      "Full, true, and accurate comparison is required.",
      "Do not certify a copy of an Arizona public record except as § 41-319 requires.",
    ],
    source_id: "ars_41_253",
  },
  {
    id: "electronic-ron",
    title: "Electronic Notarization & RON",
    topic: "electronic-ron",
    summary: "In-person electronic notarization and remote online notarization are different processes. Do not improvise a video chat.",
    sections: [
      {
        heading: "Electronic notarization",
        body: "Arizona SOS Remote & eNotary describes electronic notarization as an electronic record signed with electronic signatures while the signer still physically appears before the notary. Traditional identification rules still apply. It is not the same as remote appearance.",
      },
      {
        heading: "Remote online notarization",
        body: "A.R.S. § 41-263 allows a notary public located in this state to perform a notarial act using communication technology for a remotely located individual. Identity must be established as the statute provides, an audiovisual recording must be created, and the certificate must indicate that communication technology was used.",
      },
      {
        heading: "Before the first remote act",
        body: "A.R.S. § 41-263(F) requires the notary to notify the Secretary of State before the first such act and to identify the technologies the notary intends to use. A casual video app is not a substitute for that notice and the statutory recording and identification rules.",
      },
    ],
    keyFacts: [
      "The notary must be located in Arizona for a remote act under § 41-263(B).",
      "RON identity may use personal knowledge, a credible witness, or at least two types of identity proofing.",
      "Keep the audiovisual recording at least five years unless a different rule period applies.",
    ],
    source_id: "ars_41_263",
  },
  {
    id: "exam-day",
    title: "Exam-Day Strategy",
    topic: "commission",
    summary: "Open-book does not mean unprepared. Know where rules live, then drill weak topics.",
    sections: [
      {
        heading: "Use the open book intelligently",
        body: "If the official exam allows references, tab the definitions of acknowledgment, jurat, and identification. Searching from zero on every item wastes the clock.",
      },
      {
        heading: "Trap patterns",
        body: "Watch for: acknowledgment vs jurat, expired commission, lending the seal, backdating, and skipping the journal for a 'regular.'",
      },
      {
        heading: "After you pass",
        body: "Bond, oath, filing, and supplies come next. Passing a quiz does not authorize notarial acts.",
      },
    ],
    keyFacts: [
      "Flag weak topics and drill them in Exam Questions.",
      "Passing percent is a configured official field—re-verify before test day.",
      "Timebox: do not spend the whole clock on one fact pattern.",
    ],
    source_id: "sos_exam",
  },
  {
    id: "after-exam",
    title: "From Exam to Commission",
    topic: "commission",
    summary: "The exam is the study product. The commission is a legal status with remaining steps.",
    sections: [
      {
        heading: "Bond",
        body: "A surety bond in the statutory amount is generally required. It is for the public's protection, not a substitute for careful work.",
      },
      {
        heading: "Oath and filing",
        body: "Follow SOS instructions for oath and any required recording or filing. Skipping a filing step can delay or invalidate commissioning.",
      },
      {
        heading: "Tools",
        body: "Order a seal that matches your commissioned name. Keep a proper journal. Consider E&O separately from the bond.",
      },
    ],
    keyFacts: [
      "Statutory bond amount is a configured high-risk field.",
      "Stamp vendors do not issue commissions.",
      "Compare products after you understand which purchases are mandatory.",
    ],
    source_id: "sos_exam",
  },
];
