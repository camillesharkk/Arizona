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
        body: "Under A.R.S. § 41-269(B), an applicant must be at least 18, a U.S. citizen or permanent legal resident, an Arizona resident for income-tax purposes with Arizona as the primary residence on tax returns, and able to read, write and understand English. The applicant must also meet the disqualification, examination and reference-manual requirements. Working in Arizona alone does not establish residency.",
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
    source_id: "ars_41_269",
    example: {
      heading: "Worked example: employer paid for the stamp",
      body: "An employer pays your commissioning costs, then says the commission belongs to the business. Under A.R.S. § 41-269(G), payment does not transfer ownership of the commission or stamping device. You remain the commissioned officer responsible for their use.",
    },
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
        body: "A.R.S. § 41-255 separates personal knowledge from satisfactory evidence. Listed credentials include an unexpired passport, driver license or government-issued nondriver ID; other listed government identification must carry a signature or photograph and be satisfactory to the officer. A credible witness must make an oath or affirmation and be personally known to the officer or identified with a listed credential. Check the statute’s special rules for real-estate conveyances; do not assume every foreign credential works for every act.",
      },
      {
        heading: "Communication",
        body: "A.R.S. § 41-253(F) permits direct communication in a shared language or indirect communication through a translator who communicates with both participants in languages the translator understands. If you cannot establish that communication or the signer’s willingness and capacity, stop and resolve the problem. Identification alone does not complete the act.",
      },
    ],
    keyFacts: [
      "ID must actually identify the person in front of you.",
      "Personal knowledge is a real relationship, not a social-media follow.",
      "Credible-witness rules are statutory—follow them exactly.",
    ],
    source_id: "ars_41_255",
    example: {
      heading: "Worked example: unreadable ID",
      body: "A signer hands you a government card so damaged that the photograph and expiration date cannot be read. A.R.S. § 41-255(B) lists credentials that must be unexpired and otherwise match the statute. If you cannot read those facts, that card is not the listed credential. Use another method the statute allows—personal knowledge under § 41-255(A), a credible witness under § 41-255(B)(2), or additional credentials under § 41-255(D)—or stop. A journal note that says “ID damaged” does not create satisfactory evidence.",
    },
  },
  {
    id: "acknowledgments",
    title: "Acknowledgments",
    topic: "acknowledgments",
    summary: "The signer declares that they signed the record for its stated purpose; a representative also declares the required authority. This is different from swearing the record’s statements are true.",
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
    source_id: "ars_41_253",
    example: {
      heading: "Worked example: two names, one person",
      body: "The deed names two owners. Only one appears. A.R.S. § 41-254(A) requires the individual whose signature is the subject of the act to appear. Complete the acknowledgment only for the person in front of you, and write a certificate that names only who appeared. Do not claim the absent owner appeared, and do not sign that person’s name. Executing a certificate certifies compliance with the act actually performed (A.R.S. § 41-264(D)).",
    },
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
      "Use certificate wording that accurately records the act performed.",
      "Oath/affirmation is personal to the signer.",
      "Match the certificate to the act actually performed.",
    ],
    source_id: "ars_41_251",
    example: {
      heading: "Worked example: signer refuses the oath",
      body: "The certificate is a verification on oath or affirmation (often called a jurat). The signer will not take an oath or affirmation. A.R.S. § 41-251(16) requires that declaration before the notarial officer. You cannot complete that act. Do not silently stamp an acknowledgment certificate instead—that would certify a different act (A.R.S. § 41-264(D)). Offer a lawful affirmation if the objection is to religious oath language; if they still refuse, stop.",
    },
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
        body: "Under A.R.S. § 41-319, record entries chronologically with the date, document description, act, signer’s name/address/signature, identity evidence and fee as required. Personal knowledge and specified repeat entries have statutory alternatives; read those before using them. Being a regular customer alone is not permission to omit the record.",
      },
      {
        heading: "Privacy and access",
        body: "Separate public-record entries from entries that must remain confidential. Section 41-319 addresses a written request identifying the person, type of document and month/year for a certified copy of a public journal entry. Do not expose unrelated entries while fulfilling that request.",
      },
    ],
    keyFacts: [
      "Contemporaneous sequential entries.",
      "Report a lost or stolen journal as required.",
      "End-of-commission handling follows SOS instructions.",
    ],
    source_id: "ars_41_319",
    example: {
      heading: "Worked example: “skip the journal, I’m a regular”",
      body: "A repeat customer asks you to skip the journal to save time. A.R.S. § 41-319 requires notarial acts to be recorded in the required journal, in chronological order, unless a specific statutory alternative actually applies. Being a regular is not a waiver. For deeds, quitclaim deeds, deeds of trust, other real-property documents, and powers of attorney, also apply the journal-thumbprint rule in Laws 2026, Chapter 31 (SB 1479), effective September 12, 2026—details live on the law-change page, not as a second copy of that statute here.",
    },
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
      "Notarial-act fees must comply with the current fee rule; do not disguise excess notarial fees as rush charges.",
    ],
    source_id: "ars_41_266",
    example: {
      heading: "Worked example: stamp over a signature",
      body: "The remaining space sits on top of the signer’s wet signature. A.R.S. § 41-266(C) forbids affixing the official stamp over the notary’s signature or any other signature on the record. Place a readable stamp that can be copied with the record (§ 41-266(A)(2)). A faint or covered impression does not become valid because “everyone knew what you meant.”",
    },
  },
  {
    id: "prohibited-acts",
    title: "Prohibited Acts & Impartiality",
    topic: "prohibited-acts",
    summary: "Notaries are impartial public officers, not deal-makers.",
    sections: [
      {
        heading: "Conflicts",
        body: "A.R.S. § 41-252(B) bars an act if you or your spouse is a party to the record or has a direct beneficial interest. Refer the signer to another notary; a deadline does not remove the conflict. Under § 41-256, also consider whether the person can understand the act and is signing willingly.",
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
    source_id: "ars_41_273",
    example: {
      heading: "Worked example: spouse is on the deed",
      body: "Your spouse is named as a grantor. A.R.S. § 41-252(B) says you may not perform a notarial act on a record to which you or your spouse is a party, or in which either has a direct beneficial interest. The act is voidable. Convenience, a closing deadline, or “just this once” is not an exception. Send them to another notary. Separately, A.R.S. § 41-273(A) does not authorize choosing the customer’s legal form or giving legal strategy.",
    },
  },
  {
    id: "new-laws",
    title: "Keeping Up With 2026 Changes",
    topic: "new-laws",
    summary: "Apply the statute in force on the date of the act. Session-law details live on the law-change page so this guide does not copy them twice.",
    sections: [
      {
        heading: "Where to read verified changes",
        body: "The law-change index lists Arizona session laws we have verified, with effective dates. As of September 12, 2026, that list includes Laws 2026, Chapter 31 (SB 1479) journal thumbprints for covered deeds and powers of attorney. Do not treat a blog titled “new notary laws 2026” as Arizona law.",
      },
      {
        heading: "How to study a change",
        body: "Read the chaptered session law and the effective date, then drill the new-laws question set. A.R.S. § 1-241 and § 1-244 control timing and non-retroactivity. A commission term does not freeze older handbook language.",
      },
    ],
    keyFacts: [
      "Official legislature text and stated effective dates beat social posts.",
      "This chapter points to the law page instead of reprinting the same SB 1479 write-up.",
    ],
    source_id: "az_sb_1479_2026",
    example: {
      heading: "Worked example: an older handbook and a current deed",
      body: "A signer brings a deed after a new rule has taken effect, but your old handbook does not mention it. Check the chaptered law and its exceptions for that act’s date, then use the verified law-update page below to work through the thumbprint requirements. The date you received your commission does not freeze the rules.",
    },
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
    example: {
      heading: "Worked example: a copy of an Arizona public record",
      body: "A customer asks you to certify a copy of an Arizona public record. Section 41-253(D) excludes those records from ordinary copy certification, apart from the journal exception in § 41-319. Direct the customer to the issuing custodian’s certified-copy process; do not stamp a photocopy as a substitute.",
    },
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
      "The usual statutory recording floor is five years; the SB 1479 thumbprint exception requires seven years and the journal credential number.",
    ],
    source_id: "ars_41_263",
    example: {
      heading: "Worked example: an ordinary video call",
      body: "A customer sends an ID photo and asks you to watch a signature over a casual video call. That alone does not meet § 41-263. The notary must be in Arizona and meet the identity, record-confirmation, audiovisual-recording, certificate and prior-notification requirements. Arrange a compliant session or an in-person appointment.",
    },
  },
  {
    id: "exam-day",
    title: "Exam-Day Strategy",
    topic: "commission",
    summary: "Open-book does not mean unprepared. Know where rules live, then drill weak topics.",
    sections: [
      {
        heading: "Use the open book intelligently",
        body: "Learn where the definitions and rules appear in the digital manual. The official examination provides the manual on screen and does not allow a physical copy. Practice navigating it while studying; do not plan to bring a tabbed paper manual to the exam.",
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
    example: {
      heading: "Worked example: a correct guess",
      body: "You choose the right answer but cannot explain why the other choices fail. Treat it as a review item. Find the cited rule, explain the difference, and try another scenario. Use the Exam Prep page for the full study schedule rather than treating one practice score as proof of readiness.",
    },
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
    example: {
      heading: "Worked example: passed, but not yet commissioned",
      body: "You pass the exam and a friend asks you to notarize that afternoon. Passing alone does not issue a commission. Complete the SOS application requirements and wait for the commission to take effect before acting; § 41-269 also requires a valid bond on file.",
    },
  },
];
