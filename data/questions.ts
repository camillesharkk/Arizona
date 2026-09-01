import type { Question, TopicId } from "../lib/types.ts";
import { isActiveQuestion } from "../lib/question-status.ts";

type Draft = Omit<
  Question,
  | "state"
  | "status"
  | "version"
  | "effective_from"
  | "effective_to"
  | "last_verified_at"
> & {
  last_verified_at?: string;
};

type Letter = "A" | "B" | "C" | "D";

function remapCorrectLetter(q: Draft, dest: Letter): Draft {
  const src = q.correct_option;
  if (src === dest) return q;
  const texts: Record<Letter, string> = { A: q.option_a, B: q.option_b, C: q.option_c, D: q.option_d };
  const fbs = { ...q.option_feedback };
  const swappedText = { ...texts, [dest]: texts[src], [src]: texts[dest] };
  const swappedFb = { ...fbs, [dest]: fbs[src], [src]: fbs[dest] };
  const explanation = q.explanation
    .replace(new RegExp(`\\boption ${src}\\b`, "gi"), `option ${dest}`)
    .replace(new RegExp(`\\bOption ${src}\\b`, "g"), `Option ${dest}`);
  return {
    ...q,
    option_a: swappedText.A,
    option_b: swappedText.B,
    option_c: swappedText.C,
    option_d: swappedText.D,
    option_feedback: swappedFb,
    correct_option: dest,
    explanation,
  };
}

function balanceCorrectLetters(items: Draft[]): Draft[] {
  const cycle: Letter[] = ["A", "B", "C", "D"];
  return items.map((q, i) => remapCorrectLetter(q, cycle[i % 4]));
}

function publish(drafts: Draft[]): Question[] {
  return balanceCorrectLetters(drafts).map((q) => ({
    ...q,
    state: "AZ",
    status: "published",
    version: 1,
    effective_from: "2024-01-01",
    effective_to: null,
    last_verified_at: q.last_verified_at ?? "2026-08-01",
  }));
}

const drafts: Draft[] = [
  {
    question_id: "az-001",
    topic: "commission",
    difficulty: "easy",
    question_text: "An Arizona notary public commission is typically issued for which term?",
    option_a: "Two years",
    option_b: "Four years",
    option_c: "Five years",
    option_d: "Until the notary relocates",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(E) provides that on compliance with that section, the secretary of state shall issue a commission as a notary public for a term of four years. Renewal is a separate application, not an automatic extension.",
    option_feedback: {
      A: "Two years is shorter than the four-year term in A.R.S. § 41-269(E).",
      B: "Correct. A.R.S. § 41-269(E) sets a four-year commission term.",
      C: "Five years is used in some other states, not the Arizona term in § 41-269(E).",
      D: "Moving can affect eligibility, but the commission still has a fixed four-year term.",
    },
    source_id: "ars_41_269",
    source_reference: "A.R.S. § 41-269(E)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-002",
    topic: "commission",
    difficulty: "easy",
    question_text: "Who issues an Arizona notary public commission?",
    option_a: "The county recorder in the notary's home county",
    option_b: "The Arizona Attorney General",
    option_c: "The Arizona Secretary of State",
    option_d: "The superior court clerk",
    correct_option: "C",
    explanation:
      "A.R.S. § 41-269(E) provides that on compliance with that section, the secretary of state shall issue a commission as a notary public for a term of four years. County offices, the Attorney General, and court clerks are not the issuing authority in that subsection.",
    option_feedback: {
      A: "County recorders are not the issuing authority in A.R.S. § 41-269(E).",
      B: "The Attorney General is not the issuing authority in A.R.S. § 41-269(E).",
      C: "Correct. A.R.S. § 41-269(E): the secretary of state shall issue the commission on compliance with § 41-269.",
      D: "Court clerks are not the issuing authority in A.R.S. § 41-269(E).",
    },
    source_id: "ars_41_269",
    source_reference: "A.R.S. § 41-269(E)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-003",
    topic: "commission",
    difficulty: "medium",
    question_text: "Which item is generally required before an Arizona notary may begin notarizing?",
    option_a: "A $5,000 surety bond (assurance) submitted to the Secretary of State",
    option_b: "A law degree",
    option_c: "A federal background investigation by the FBI",
    option_d: "Membership in a national notary association",
    correct_option: "A",
    explanation:
      "A.R.S. § 41-269(D) requires the applicant to submit a $5,000 surety-bond assurance to the secretary of state before a commission is issued. A notary may perform notarial acts in this state only while a valid assurance is on file. A law degree and association membership are not commissioning requirements in that section.",
    option_feedback: {
      A: "Correct. A.R.S. § 41-269(D) requires a $5,000 surety bond / assurance before issuance.",
      B: "Notaries are not required to be attorneys.",
      C: "An FBI investigation is not the bond requirement in § 41-269(D).",
      D: "Professional associations are optional and do not replace the bond.",
    },
    source_id: "ars_41_269",
    source_reference: "A.R.S. § 41-269(D)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-004",
    topic: "commission",
    difficulty: "medium",
    question_text:
      "If an Arizona notary public has a change of surname during the commission term, which statement matches current law?",
    option_a: "The commission is automatically void until the Secretary of State issues a new commission",
    option_b:
      "The notary may continue to use the official stamp and commission in the prior name until that commission expires, must sign the new surname on the certificate signature line and immediately below it the name under which the notary was commissioned, and must notify the Secretary of State within 30 days",
    option_c: "The old stamp must be destroyed immediately; no notarial act may occur until a new stamp is purchased",
    option_d: "Only A.R.S. § 41-323(A) address notice applies; surname change has no separate statutory duty",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-327 addresses surname change. The notary may continue to use the official stamp and commission in the prior name until that commission expires. On the notarial certificate, the notary shall sign the changed surname on the signature line and, immediately below that signature, sign the name under which the notary was commissioned. The notary shall notify the secretary of state's office within 30 days; failure to notify is evidence of failure to fully and faithfully discharge the duties of a notary public. The statute does not require immediate destruction of the old stamp or automatic reissuance of a new commission. A.R.S. § 41-323(A) is the 30-day mailing/business/residential address notice and is not the surname-change rule. Arizona SOS Existing Notaries operational guidance additionally directs notaries to submit a name-change notification with supporting legal documentation (for example a marriage license or divorce decree); that filing process is operational, not a substitute for § 41-327.",
    option_feedback: {
      A: "A.R.S. § 41-327 continues the existing commission; it does not void it pending a new issuance.",
      B: "Correct. A.R.S. § 41-327: continue prior-name stamp/commission until expiration; dual signature; 30-day SOS notice.",
      C: "Section 41-327 expressly allows continued use of the official stamp in the prior name until the commission expires.",
      D: "Address change is A.R.S. § 41-323(A). Surname change is A.R.S. § 41-327.",
    },
    source_id: "ars_41_327",
    source_reference: "A.R.S. § 41-327; Arizona SOS Existing Notaries (name-change notification / supporting documents)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-005",
    topic: "commission",
    difficulty: "hard",
    question_text:
      "A commissioned Arizona notary moves from Phoenix (Maricopa County) to Tucson (Pima County) but still meets A.R.S. § 41-269(B) residence qualifications. Which statement is accurate?",
    option_a: "The commission automatically ends because the county of residence changed",
    option_b:
      "The in-state move does not by itself terminate the commission, but A.R.S. § 41-323(A) still requires a signed address-change notice to the Secretary of State within 30 days",
    option_c: "No address notice is required so long as the notary remains an Arizona resident",
    option_d: "Only records signed in Maricopa County remain valid after the move",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(B)(3) requires the applicant to be a resident of this state for income-tax purposes and to claim this state as the primary residence. Remaining an Arizona resident after a Phoenix-to-Tucson move can satisfy that qualification, but it is not a reason to skip address reporting. A.R.S. § 41-323(A) requires that within 30 days after a change of mailing, business, or residential address, the notary deliver to the secretary of state, by certified mail or other means providing a receipt, a signed notice with the old and new addresses. Failure to comply with subsection A is treated as failure to fully and faithfully discharge the duties of a notary public, and § 41-323(C) authorizes a $25 civil penalty for an address-notice failure. A.R.S. § 41-269(D) and (F) authorize notarial acts in this state while a valid assurance is on file; they do not say that changing counties automatically ends the commission. This item does not claim a separate 'statewide commission' slogan beyond those sections, and it does not require an immediate stamp replacement under § 41-266.",
    option_feedback: {
      A: "A county change is not listed as automatic termination in A.R.S. § 41-269 or § 41-323.",
      B: "Correct. Stay eligible under § 41-269(B); still give the 30-day signed address notice under § 41-323(A).",
      C: "Arizona residency does not repeal the 30-day address-notice duty in § 41-323(A).",
      D: "A.R.S. § 41-269(D) and (F) authorize notarial acts in this state; they do not confine validity to the original county.",
    },
    source_id: "ars_41_323",
    source_reference: "A.R.S. § 41-323(A), (C); A.R.S. § 41-269(B)(3), (D), (F)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-006",
    topic: "commission",
    difficulty: "easy",
    question_text: "The Arizona Secretary of State's notary competency examination is currently described as:",
    option_a: "Closed-book, with no access to the official notary manual during the exam",
    option_b:
      "45 questions in 60 minutes, an 80% passing score, and open-book access to the official manual provided in the exam (a physical copy is not allowed)",
    option_c: "An oral interview only",
    option_d: "Optional if the applicant already has a stamp",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-270 is the statutory basis: the secretary of state may require a competency examination covering notary laws, rules, procedures, and ethics. It does not itself prescribe 45 questions, 60 minutes, 80%, or open-book format. Those operational numbers come from the current Arizona SOS Notary exam page (New Notary): 45 questions, 60 minutes, 80% to pass, and an open-book format in which a link to the official manual is built into the exam; a physical copy is not allowed at testing sites or during remote testing. Exam vendor, exam fee, and whether remote testing is available are operational details that have appeared with conflicting SOS wording and are not tested by this item.",
    option_feedback: {
      A: "SOS describes the exam as open book, with the official manual linked inside the exam—not a closed book with no manual.",
      B: "Correct. SOS New Notary notices list 45 questions, 60 minutes, 80%, and a built-in manual (no physical copy).",
      C: "The published path is a written, timed exam, not an oral interview.",
      D: "Buying a stamp does not replace the exam or commission. A.R.S. § 41-270 authorizes the examination.",
    },
    source_id: "sos_new_notary",
    source_reference:
      "A.R.S. § 41-270 (examination authority / statutory basis only — does not set 45/60/80 or open-book format); Arizona SOS current Notary exam page (New Notary) — operational format: 45 questions / 60 minutes / 80% / open book with official manual built into the exam (physical copy not allowed)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-007",
    topic: "identification",
    difficulty: "easy",
    question_text: "Before taking an acknowledgment, verification on oath or affirmation, or witnessing a signature, a notary must determine identity:",
    option_a: "From personal knowledge or satisfactory evidence of identity, as Arizona law allows",
    option_b: "By guaranteeing that the document is legal",
    option_c: "By reading the entire document aloud",
    option_d: "By witnessing every signature on related attachments, even if not requested",
    correct_option: "A",
    explanation:
      "A.R.S. § 41-253(A)–(C) requires the notarial officer to determine identity from personal knowledge or satisfactory evidence of identity. A.R.S. § 41-255(A) defines personal knowledge (dealings sufficient to provide reasonable certainty of the identity claimed). Section 41-255(B) defines satisfactory evidence (listed credentials or a credible witness). Personal knowledge is not itself an ID document. Notaries do not certify that a document is legally sufficient.",
    option_feedback: {
      A: "Correct. A.R.S. § 41-253(A)–(C) allows personal knowledge or satisfactory evidence; § 41-255 defines both.",
      B: "Notaries authenticate signatures/oaths, not the legality of the deal.",
      C: "Reading the whole document is not a notarial identity duty.",
      D: "Only the requested notarial act is performed.",
    },
    source_id: "ars_41_253",
    source_reference: "A.R.S. § 41-253(A)–(C); A.R.S. § 41-255(A)–(B)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-008",
    topic: "identification",
    difficulty: "medium",
    question_text:
      "A signer presents a severely damaged ID on which the photograph and expiration date cannot be read. The notary should:",
    option_a: "Accept it because it was once a government ID",
    option_b:
      "Not treat that card as the listed credential under A.R.S. § 41-255(B), and use another identification method the statute allows if one is available",
    option_c: "Complete the notarization and note 'ID damaged' only",
    option_d: "Ask the signer to describe what the ID used to look like",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-255 does not use the words 'damaged ID.' Section 41-255(B)(1) lists credentials that must be unexpired (and otherwise meet the statutory description). If a photograph and expiration date cannot be read, the officer cannot determine that those requirements are met from that card. Section 41-255(D) allows the officer to require additional information or credentials to be assured of identity. Other permitted methods include personal knowledge (§ 41-255(A)) or a credible witness (§ 41-255(B)(2)). This item does not create a damaged-ID exception, a temporary exception, or an expired-document grace period.",
    option_feedback: {
      A: "That the card was once a government ID does not establish the unexpired listed credential in § 41-255(B).",
      B: "Correct. An unreadable photograph and expiration date cannot satisfy the listed credential; use another statutory method if available.",
      C: "A journal note does not create satisfactory evidence under § 41-255.",
      D: "The signer's description is not a listed identification method in § 41-255.",
    },
    source_id: "ars_41_255",
    source_reference: "A.R.S. § 41-255(B), (D)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-009",
    topic: "identification",
    difficulty: "medium",
    question_text: "Under A.R.S. § 41-255(A), a notarial officer has personal knowledge of identity if the individual is personally known to the officer:",
    option_a: "Because the officer has seen the person on social media",
    option_b:
      "Through dealings sufficient to provide reasonable certainty that the individual has the identity claimed",
    option_c: "Because the officer has the person's email address",
    option_d: "Because they share the same last name",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-255(A) uses 'reasonable certainty' from dealings, not absolute certainty and not an ID document. Social media, an email address, or a shared surname is not the statutory test.",
    option_feedback: {
      A: "Social media is not the dealings test in § 41-255(A).",
      B: "Correct. Section 41-255(A) requires dealings sufficient to provide reasonable certainty of the identity claimed.",
      C: "An email address is not personal knowledge under § 41-255(A).",
      D: "A shared surname is not personal knowledge under § 41-255(A).",
    },
    source_id: "ars_41_255",
    source_reference: "A.R.S. § 41-255(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-010",
    topic: "identification",
    difficulty: "hard",
    question_text: "A credible identifying witness may be used as satisfactory evidence of identity when:",
    option_a: "The notary wants to skip the journal entry",
    option_b:
      "The witness personally appears and is either personally known to the notarial officer or identified from satisfactory evidence under A.R.S. § 41-255(B)(1), and verifies the signer's identity on oath or affirmation",
    option_c: "The document is written in another language",
    option_d: "The notary is related to the signer and needs to cure a conflict of interest",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-255(B)(2) requires verification on oath or affirmation of a credible witness who personally appears before the notarial officer and who is known to the officer or whom the officer can identify under subsection (B)(1). A telephone call is not that personal appearance. A credible witness is an identification method; it does not waive journal duties under § 41-319 and does not cure a disqualifying conflict of interest.",
    option_feedback: {
      A: "Using a credible witness does not authorize skipping the journal.",
      B: "Correct. A.R.S. § 41-255(B)(2) requires personal appearance of the witness plus knowledge or (B)(1) identification of the witness.",
      C: "Language is governed by § 41-253(F), not by using a witness as an ID shortcut.",
      D: "A conflict of interest is not solved by a credible witness.",
    },
    source_id: "ars_41_255",
    source_reference: "A.R.S. § 41-255(B)(2)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-011",
    topic: "identification",
    difficulty: "easy",
    question_text: "If a notarial act relates to a statement or a signature on a record, the individual generally must:",
    option_a: "Mail the signed document later without appearing",
    option_b:
      "Appear personally before the notarial officer, which a remotely located individual may do by authorized communication technology under A.R.S. § 41-263",
    option_c: "Appear only through an attorney",
    option_d: "Appear by audio-only telephone or by a pre-recorded video for every act",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-254(A) requires the individual making the statement or executing the signature to appear personally before the notarial officer. A.R.S. § 41-263(A) allows a remotely located individual to comply with § 41-254 by using communication technology. Ordinary mail, an audio-only telephone call, or a pre-recorded video is not that statutory appearance. This item does not apply SB 1479 thumbprint rules, which were not yet in force on 2026-09-01.",
    option_feedback: {
      A: "Mail without personal appearance does not satisfy A.R.S. § 41-254(A).",
      B: "Correct. Section 41-254(A) requires personal appearance; § 41-263(A) is the authorized remote path.",
      C: "An attorney is not a substitute for the individual's appearance.",
      D: "Audio-only phone and pre-recorded video are not the communication-technology appearance in § 41-263.",
    },
    source_id: "ars_41_254",
    source_reference: "A.R.S. § 41-254(A); A.R.S. § 41-263(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-012",
    topic: "acknowledgments",
    difficulty: "easy",
    question_text: "In an acknowledgment, the individual is declaring before the notarial officer that:",
    option_a: "The document contents are true under oath",
    option_b:
      "The individual has signed the record for the purpose stated in the record and, if signing in a representative capacity, signed with proper authority",
    option_c: "The notary drafted the document",
    option_d: "The document has been recorded",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-251(1) defines acknowledgment as a declaration before a notarial officer that the individual has signed the record for the purpose stated in the record and, if signed in a representative capacity, signed with proper authority as the act of the person or entity identified. 'Voluntarily' is not the statutory definition. A.R.S. § 41-256(A)(2) separately allows a notarial officer to refuse if not satisfied that the signature is knowingly and voluntarily made. An acknowledgment is not a verification that the record's statements are true (§ 41-251(16)).",
    option_feedback: {
      A: "That describes a verification on oath or affirmation (§ 41-251(16)), not an acknowledgment.",
      B: "Correct. A.R.S. § 41-251(1) is signed-for-the-purpose-stated (and representative authority if applicable), not a 'voluntary' definition.",
      C: "Drafting the document is not the acknowledgment declaration.",
      D: "Recording is a separate process, not the acknowledgment definition.",
    },
    source_id: "ars_41_251",
    source_reference: "A.R.S. § 41-251(1); see also A.R.S. § 41-256(A)(2) (refusal if signature not knowingly and voluntarily made)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-013",
    topic: "acknowledgments",
    difficulty: "medium",
    question_text: "The signer says they already signed the deed yesterday at home and now want an acknowledgment. The notary should:",
    option_a: "Refuse because the signature was not made in the notary's presence",
    option_b:
      "Take an acknowledgment if the signer appears personally, is identified, and declares that the signature is theirs and was signed for the purpose stated in the record",
    option_c: "Have a coworker sign as a substitute",
    option_d: "Backdate the certificate to yesterday",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-251(1) is a declaration that the individual has signed the record; it does not require the signature to be made in the officer's presence. A.R.S. § 41-254(A) requires personal appearance. A.R.S. § 41-253(A) requires identity from personal knowledge or satisfactory evidence and a determination that the signature on the record is the individual's. The certificate must be executed contemporaneously with the act (§ 41-264(A)(1)); do not backdate. This is not a verification on oath or affirmation.",
    option_feedback: {
      A: "In-presence signing is not the acknowledgment definition in § 41-251(1). Appearance and acknowledgment of the existing signature are required.",
      B: "Correct. Pre-signed records may be acknowledged if § 41-254(A) and § 41-253(A) are met.",
      C: "A substitute signer is not authorized.",
      D: "Backdating contradicts contemporaneous execution under § 41-264(A)(1).",
    },
    source_id: "ars_41_251",
    source_reference: "A.R.S. § 41-251(1); A.R.S. § 41-253(A); A.R.S. § 41-254(A); A.R.S. § 41-264(A)(1)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-014",
    topic: "acknowledgments",
    difficulty: "medium",
    question_text: "The notarial certificate is incomplete and the venue (state and county) is blank. The notary should:",
    option_a: "Leave it blank so the recorder can fill it in",
    option_b: "Complete it with the jurisdiction in which the notarial act is performed",
    option_c: "Always write 'Maricopa County' because it is the largest county",
    option_d: "Omit the certificate entirely",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-264(A)(3) requires the certificate to identify the jurisdiction in which the notarial act is performed. A.R.S. § 41-265 short forms use State of ___ and County of ___ for that jurisdiction—not the signer's residence and not where the property sits. The certificate must also be signed and dated, show office title and commission expiration, and, for a tangible record by a notary public, bear an official stamp (§ 41-264(A)–(B)). A stamp alone is not a complete certificate.",
    option_feedback: {
      A: "The notarial officer completes the certificate; a recorder should not fill in venue.",
      B: "Correct. A.R.S. § 41-264(A)(3) is the jurisdiction of the act, matching the § 41-265 short-form venue lines.",
      C: "Venue is not a default county; it is where the act is performed.",
      D: "A notarial act must be evidenced by a certificate (§ 41-264(A)).",
    },
    source_id: "ars_41_264",
    source_reference: "A.R.S. § 41-264(A)(3); A.R.S. § 41-265 (short-form State/County lines)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-015",
    topic: "acknowledgments",
    difficulty: "hard",
    question_text: "A document names two signers, but only one appears. The notary should:",
    option_a:
      "Complete an acknowledgment only for the appearing individual, if that person is identified and the certificate truthfully names only who appeared",
    option_b: "Sign the absent person's name 'as a courtesy'",
    option_c: "Attach a sticky note saying the other person will appear later",
    option_d: "Use one certificate that claims both appeared",
    correct_option: "A",
    explanation:
      "A.R.S. § 41-254(A) requires the individual whose statement or signature is the subject of the act to appear personally. A.R.S. § 41-253(A) requires identity and a determination that the signature is that individual's. Executing a certificate certifies compliance with §§ 41-252, 41-253, and 41-254 (§ 41-264(D)). Two named signers does not require refusing the entire record; it does forbid a certificate that the absent person appeared or acknowledged. Do not sign for the absent person.",
    option_feedback: {
      A: "Correct. Certificate and act follow the appearing individual only (§§ 41-253(A), 41-254(A), 41-264(D)).",
      B: "Signing another's name is not a notarial act and can be false certification.",
      C: "A sticky note is not a certificate under § 41-264.",
      D: "Claiming both appeared when only one did violates § 41-264(D).",
    },
    source_id: "ars_41_253",
    source_reference: "A.R.S. § 41-253(A); A.R.S. § 41-254(A); A.R.S. § 41-264(D)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-016",
    topic: "jurats",
    difficulty: "easy",
    question_text: "A verification on oath or affirmation (often called a jurat) requires the individual to:",
    option_a: "Acknowledge a previously applied signature without an oath or affirmation",
    option_b:
      "Declare on oath or affirmation before the notarial officer that a statement in the record is true; Arizona's statutory short form certifies the record was 'signed and sworn to (or affirmed) before me'",
    option_c: "Pay recording fees to the notary",
    option_d: "Provide two extra copies of the document",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-251(16) defines verification on oath or affirmation as a declaration, on oath or affirmation before a notarial officer, that a statement in a record is true. It does not, by itself, use the words 'must sign in the notary's presence.' A.R.S. § 41-253(B) requires the individual to appear and make the verification, and a determination that the signature on the statement is that individual's. A.R.S. § 41-265(3) supplies a sufficient short form: 'Signed and sworn to (or affirmed) before me.' This item does not invent a Manual page number. An acknowledgment under § 41-251(1) is a different act.",
    option_feedback: {
      A: "That is an acknowledgment (§ 41-251(1)), not a verification on oath or affirmation.",
      B: "Correct. Section 41-251(16) is the oath/affirmation declaration; § 41-265(3) is the 'signed and sworn to (or affirmed) before me' short form.",
      C: "Recording fees are not an element of § 41-251(16).",
      D: "Extra copies are not a verification requirement.",
    },
    source_id: "ars_41_251",
    source_reference: "A.R.S. § 41-251(16); A.R.S. § 41-253(B); A.R.S. § 41-265(3)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-017",
    topic: "jurats",
    difficulty: "medium",
    question_text:
      "The preprinted certificate says the record was acknowledged, but the individual is making a verification on oath or affirmation. The notary should:",
    option_a: "Ignore the mismatch and stamp the acknowledgment certificate anyway",
    option_b:
      "Complete or securely attach a certificate that matches the verification actually performed, such as the short form in A.R.S. § 41-265(3)—not choose a legal form as advice for the customer",
    option_c: "Cross out random words until it looks official",
    option_d: "Tell the signer certificates never matter",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-264(D) provides that executing a certificate certifies compliance with the requirements of the act performed. Section 41-264(C) and § 41-265 supply different sufficient short forms for acknowledgment versus verification on oath or affirmation. Do not execute an acknowledgment certificate for a verification. The notary does not give legal advice about which act the customer should request; this item assumes the act being performed is a verification. A stamp without a matching certificate is not enough (§ 41-264(A)–(B)).",
    option_feedback: {
      A: "Stamping a mismatched acknowledgment certificate does not satisfy § 41-264(D).",
      B: "Correct. Use a certificate for the verification actually performed (§ 41-265(3)), not a false acknowledgment form.",
      C: "Random alterations are not a sufficient certificate under § 41-264.",
      D: "The certificate is required evidence of the notarial act (§ 41-264(A)).",
    },
    source_id: "ars_41_264",
    source_reference: "A.R.S. § 41-264(C)–(D); A.R.S. § 41-265(1), (3)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-018",
    topic: "jurats",
    difficulty: "medium",
    question_text: "A signer refuses to take an oath or affirmation for a verification (jurat). The notary should:",
    option_a: "Perform the verification anyway to be helpful",
    option_b: "Decline that verification because an oath or affirmation is required",
    option_c: "Replace it with an acknowledgment certificate without telling the signer",
    option_d: "Have a bystander take the oath on the signer's behalf",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-251(16) defines verification on oath or affirmation as a declaration made on oath or affirmation before a notarial officer that a statement in a record is true. A.R.S. § 41-253(B) requires the officer who takes that verification to determine identity and that the appearing individual is making the verification. A.R.S. § 41-265(3) is worded 'signed and sworn to (or affirmed) before me.' Without an oath or affirmation, that act cannot be completed. Silently substituting an acknowledgment certificate would certify a different act (§ 41-264(D)).",
    option_feedback: {
      A: "A verification without oath or affirmation does not meet § 41-251(16).",
      B: "Correct. Oath or affirmation is essential to § 41-251(16) and § 41-253(B).",
      C: "Swapping to an acknowledgment without the individual's declaration misstates the act (§ 41-264(D)).",
      D: "The declaration is made by the individual, not a bystander (§ 41-251(16)).",
    },
    source_id: "ars_41_251",
    source_reference: "A.R.S. § 41-251(16); A.R.S. § 41-253(B); A.R.S. § 41-265(3)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-019",
    topic: "jurats",
    difficulty: "easy",
    question_text: "Under A.R.S. § 41-251(16), a verification that a statement in a record is true may be made:",
    option_a: "Only as a religious oath that names a specific deity",
    option_b: "On oath or affirmation before a notarial officer",
    option_c: "By using a notary seal instead of any declaration",
    option_d: "Only by a county recording stamp",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-251(16) states that a verification on oath or affirmation is a declaration made on oath or affirmation before a notarial officer that a statement in a record is true. The statute allows either oath or affirmation; it does not define affirmation as always nonreligious and does not require an oath to name a deity. A.R.S. § 41-265(3) uses 'sworn to (or affirmed).' This item does not add Manual theology that is not in the statute.",
    option_feedback: {
      A: "Section 41-251(16) allows affirmation as well as oath and does not require naming a deity.",
      B: "Correct. A.R.S. § 41-251(16) is oath or affirmation before the notarial officer.",
      C: "A stamp is not a substitute for the declaration in § 41-251(16).",
      D: "Recording stamps are not a verification on oath or affirmation.",
    },
    source_id: "ars_41_251",
    source_reference: "A.R.S. § 41-251(16); A.R.S. § 41-265(3)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-020",
    topic: "journals",
    difficulty: "easy",
    question_text: "Arizona notaries keep a journal because:",
    option_a: "It is only a marketing booklet for clients",
    option_b: "A.R.S. § 41-319 requires notarial acts to be recorded in the required journal",
    option_c: "It replaces the need for a seal",
    option_d: "It is used only for remote notarizations",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-319(A) requires a notary public to keep the required journal and to record notarial acts in chronological order, with specified entry contents. Tangible records are chronicled in a paper journal; electronic records may be chronicled in a paper journal or one or more electronic journals. The statute does not say the journal replaces the seal, and it is not limited to remote notarizations. Policy language about 'protecting the public' is not the pin-cite for this item.",
    option_feedback: {
      A: "A journal is a statutory record, not advertising.",
      B: "Correct. A.R.S. § 41-319 requires recording notarial acts in the required journal.",
      C: "The seal and the journal are separate requirements.",
      D: "Section 41-319 covers notarial acts regarding tangible and electronic records, not only RON.",
    },
    source_id: "ars_41_319",
    source_reference: "A.R.S. § 41-319(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-021",
    topic: "journals",
    difficulty: "medium",
    question_text:
      "A regular customer asks the notary to skip all journal recordkeeping 'to save time.' Under A.R.S. § 41-319, the notary should:",
    option_a: "Skip all records because a repeat customer automatically counts as personal knowledge",
    option_b:
      "Not treat 'regular customer' as a waiver. Record the act as § 41-319 requires, unless a specific statutory alternative actually applies (for example, personal knowledge plus retaining a copy of the notarized documents in lieu of a journal entry under § 41-319(B))",
    option_c: "Enter a fake name to anonymize the customer",
    option_d: "Wait a week and reconstruct the entry from memory",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-319(A) requires recording notarial acts in the journal. 'Regular customer' is not a statutory waiver and is not the same as personal knowledge under § 41-255(A). If the notary does have personal knowledge, § 41-319(B) allows either retaining a paper or electronic copy of the notarized documents in lieu of a journal entry, or making a journal entry meeting subsection (A) paragraphs 1–5 and 7—not skipping all records. Section 41-319(C) (other than RON) addresses a six-month window after the first satisfactory evidence: later acts in that window may not require new satisfactory evidence or the individual to sign the journal; it does not authorize skipping the journal entirely. False names and delayed reconstruction from memory are not authorized.",
    option_feedback: {
      A: "Repeat business is not automatic personal knowledge and does not waive § 41-319.",
      B: "Correct. Regular-customer convenience is not a waiver; only the specific alternatives in § 41-319(B)–(C) apply, and they are narrower than skipping all records.",
      C: "A false journal name is not authorized.",
      D: "Delayed reconstruction from memory is not the contemporaneous record § 41-319 requires.",
    },
    source_id: "ars_41_319",
    source_reference: "A.R.S. § 41-319(A)–(C)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-022",
    topic: "journals",
    difficulty: "medium",
    question_text: "If a notary's official journal is lost, stolen, or compromised, the notary must:",
    option_a: "Ignore it if photos of some pages exist on a phone",
    option_b:
      "Within 10 days, deliver a signed notice to the Secretary of State by certified mail or another method that provides a receipt, and if it was theft, also notify the appropriate law-enforcement agency",
    option_c: "Invent replacement entries for the past year",
    option_d: "Stop using a journal forever",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-323(B) requires, within ten days after loss, theft, or compromise of an official journal or stamping device, a signed notice to the secretary of state by certified mail or other means providing a receipt. In the case of theft, the notary also shall inform the appropriate law-enforcement agency. Phone photos and fabricated replacement history are not that notice. The journal duty continues. This item does not test the civil penalty in § 41-323(C).",
    option_feedback: {
      A: "Photos of pages do not satisfy the 10-day SOS notice in § 41-323(B).",
      B: "Correct. A.R.S. § 41-323(B): 10 days, signed SOS notice with a receipt, and law enforcement if stolen.",
      C: "Invented history is not the statutory notice.",
      D: "Section 41-319 still requires a journal; loss does not end the duty.",
    },
    source_id: "ars_41_323",
    source_reference: "A.R.S. § 41-323(B)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-023",
    topic: "journals",
    difficulty: "hard",
    question_text: "Except for confidential or non-public journal entries, an Arizona notary's journal:",
    option_a: "Must be destroyed to protect privacy whenever anyone asks about it",
    option_b:
      "Is a public record that any member of the public may view or copy only after presenting a written request that states the month and year of the notarial act, the name of the individual whose signature was notarized, and the type of record or transaction",
    option_c: "Must be posted in full on social media for transparency",
    option_d: "May never be viewed by anyone except a law-enforcement officer",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-319(F) makes the journal a public record that may be viewed by or copied for any member of the public, but only on presentation of a written request detailing the month and year of the notarial act, the name of the individual whose signature was notarized, and the type of record or transaction. Entries that violate attorney-client privilege or that are confidential under federal or state law are not public records (§ 41-319(A), (E)). Access is not limited to law enforcement. Posting the entire journal or destroying it to avoid a request is not authorized.",
    option_feedback: {
      A: "Destroying the journal to avoid access is not authorized by § 41-319.",
      B: "Correct. A.R.S. § 41-319(F) is public-record access with a specific written request, not law-enforcement-only access.",
      C: "Public posting of the whole journal is not the request process in § 41-319(F).",
      D: "Members of the public may view or copy public-record entries if the written request meets § 41-319(F).",
    },
    source_id: "ars_41_319",
    source_reference: "A.R.S. § 41-319(A), (E)–(F)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-024",
    topic: "seals-fees",
    difficulty: "easy",
    question_text: "On a tangible record, an Arizona notary public's official stamp:",
    option_a: "May be used as a marketing logo on flyers",
    option_b:
      "Must be affixed to the notarial certificate and does not certify that the document's contents are true",
    option_c: "Proves that an attorney drafted the document",
    option_d: "Replaces the notary's signature on the certificate",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-264(B) requires a notary public who performs a notarial act regarding a tangible record to affix an official stamp to the certificate. A.R.S. § 41-266 describes what the stamp must include and that it is an official seal of office; it does not state that the stamp warrants the truth of the record's contents. Section 41-264(A)(2) still requires the notary's signature. A stamp is not a marketing logo and is not attorney certification.",
    option_feedback: {
      A: "The official stamp is not advertising art (§ 41-266).",
      B: "Correct. A.R.S. § 41-264(B) requires the stamp on the tangible-record certificate; it does not authenticate the document's legal truth.",
      C: "The stamp does not prove attorney drafting.",
      D: "Signature and stamp are separate: § 41-264(A)(2) and (B).",
    },
    source_id: "ars_41_264",
    source_reference: "A.R.S. § 41-264(B); A.R.S. § 41-266",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-025",
    topic: "seals-fees",
    difficulty: "medium",
    question_text: "Regarding copyability and placement, an Arizona notary public's official stamp:",
    option_a: "May be left unreadable if the notary's intent seems obvious",
    option_b:
      "Must be capable of being copied together with the record, and may not be affixed over the notary's signature or any other signature on the record",
    option_c: "Should be initialed by the signer if the impression is faint",
    option_d: "May be replaced with a generic store-bought 'Notary' sticker",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-266(A)(2) requires the official stamp to be capable of being copied together with the record. An electronic official stamp must be legible when reproduced (§ 41-266(B)). Section 41-266(C) forbids affixing the stamp over the notary's signature or any other signature on the record. The statute does not use the words 're-stamp a faint impression.' This item does not invent a Manual re-stamp procedure. A novelty sticker is not the official stamp described in § 41-266.",
    option_feedback: {
      A: "An unreadable stamp does not meet the copyable/legible requirements in § 41-266(A)–(B).",
      B: "Correct. A.R.S. § 41-266(A)(2) and (C): copyable with the record, and not over signatures.",
      C: "The signer does not authenticate the official stamp.",
      D: "Only the official stamp meeting § 41-266 is the official seal of office.",
    },
    source_id: "ars_41_266",
    source_reference: "A.R.S. § 41-266(A)(2), (B), (C)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-026",
    topic: "seals-fees",
    difficulty: "easy",
    question_text: "Notary fees in Arizona:",
    option_a: "May be invented by each notary without any legal limit",
    option_b: "Are limited by Secretary of State rule; charging more than the authorized maximum is a violation",
    option_c: "Must always be $0",
    option_d: "Are set only by the IRS",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-316(A) requires the secretary of state to establish fees that notaries may charge, by rule. Section 41-316(C) forbids advertising, charging, or receiving a fee except as specifically authorized by rule. Ariz. Admin. Code R2-12-1102 and SOS Remote & eNotary guidance describe a range from no charge up to a maximum (currently $10 per the posted rule/SOS notice). That figure is a ceiling, not a required price, and notaries are not required to charge $0.",
    option_feedback: {
      A: "A.R.S. § 41-316(C) forbids fees except as the rule authorizes. There is a maximum.",
      B: "Correct. Fees come from SOS rule under A.R.S. § 41-316; exceeding the authorized maximum is a violation.",
      C: "R2-12-1102 allows a standard fee from no charge up to the maximum; $0 is permitted, not mandatory.",
      D: "The IRS does not set Arizona notary fee caps.",
    },
    source_id: "ars_41_316",
    source_reference: "A.R.S. § 41-316; Ariz. Admin. Code R2-12-1102; SOS Remote & eNotary (no charge up to $10)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-027",
    topic: "seals-fees",
    difficulty: "medium",
    question_text: "A notary's commission has expired. The notary should:",
    option_a: "Keep using the old stamp until a new one arrives",
    option_b: "Stop performing notarial acts until a new commission is issued",
    option_c: "Borrow a colleague's stamp",
    option_d: "Notarize only for family",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(E) issues a commission for a four-year term. Section 41-269(F) states that a commission authorizes the notary public to perform notarial acts. After expiration, that authority has ended; a stamp does not extend the term. A.R.S. § 41-267(A) forbids allowing another individual to use the stamping device to perform a notarial act. Family transactions still require a current commission and are separately limited by § 41-252(B). Physical-device delivery after expiration is covered in A.R.S. § 41-317 and is not this item's test.",
    option_feedback: {
      A: "The stamp does not extend the four-year commission in § 41-269(E).",
      B: "Correct. After expiration, § 41-269(F) no longer authorizes notarial acts until a new commission is issued.",
      C: "A.R.S. § 41-267(A) does not allow another person to use the device to perform a notarial act.",
      D: "Family acts still require a current commission.",
    },
    source_id: "ars_41_269",
    source_reference: "A.R.S. § 41-269(E)–(F)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-028",
    topic: "seals-fees",
    difficulty: "hard",
    question_text: "Errors and omissions (E&O) insurance is:",
    option_a: "The same thing as the required $5,000 surety bond / assurance",
    option_b: "Optional coverage for the notary; it is not a substitute for the statutory bond",
    option_c: "Required instead of a journal",
    option_d: "Issued automatically with every stamp purchase",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(D) requires a $5,000 surety-bond assurance before a commission is issued. Arizona SOS Notary Resources state that the bond protects the public, not the notary; E&O insurance protects the notary and is not mandatory when applying. This item does not claim that E&O automatically repays every claim or provides unlimited protection. E&O is not a journal substitute, and a stamp vendor does not issue the statutory bond.",
    option_feedback: {
      A: "The required assurance is § 41-269(D). SOS resources treat E&O as separate, optional coverage for the notary.",
      B: "Correct. SOS Notary Resources: bond required and protects the public; E&O optional and protects the notary.",
      C: "Insurance does not replace A.R.S. § 41-319 journal duties.",
      D: "Buying a stamp does not issue the statutory bond or E&O.",
    },
    source_id: "ars_41_269",
    source_reference:
      "A.R.S. § 41-269(D) (required $5,000 assurance); Arizona SOS Notary Resources (bond protects the public; E&O optional and protects the notary)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-029",
    topic: "prohibited-acts",
    difficulty: "easy",
    question_text:
      "A notarial officer is asked to perform a notarial act on a record to which the officer or the officer's spouse is a party, or in which either has a direct beneficial interest. The officer should:",
    option_a: "Perform the act because it is convenient",
    option_b: "Refuse; a notarial act performed in violation of that prohibition is voidable",
    option_c: "Have a family member use the officer's stamp",
    option_d: "Perform the act but omit the journal entry",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-252(B) provides that a notarial officer may not perform a notarial act with respect to a record to which the officer or the officer's spouse is a party or in which either of them has a direct beneficial interest. A notarial act performed in violation of that subsection is voidable—not described in the statute as automatically 'void.' Lending the stamp or hiding the journal does not cure the prohibition.",
    option_feedback: {
      A: "Convenience is not an exception in § 41-252(B).",
      B: "Correct. A.R.S. § 41-252(B): party or direct beneficial interest (officer or spouse); the act is voidable.",
      C: "A.R.S. § 41-267(A) forbids another person using the stamping device to perform a notarial act.",
      D: "Omitting a journal entry does not authorize a prohibited act.",
    },
    source_id: "ars_41_252",
    source_reference: "A.R.S. § 41-252(B)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-030",
    topic: "prohibited-acts",
    difficulty: "medium",
    question_text:
      "A non-attorney notary is asked to choose, for a customer's complex real-estate matter, which legal form or legal strategy the customer should use. That request is:",
    option_a: "Always a required notarial service",
    option_b:
      "Not authorized by a notary commission, which does not allow drafting legal records, giving legal advice, or otherwise practicing law",
    option_c: "Required by the surety that issued the bond",
    option_d: "The same as completing a certificate for a notarial act the customer has already requested",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-273(A) states that a notary commission does not authorize assisting persons in drafting legal records, giving legal advice, otherwise practicing law, or acting as an immigration consultant. Completing the certificate for a notarial act the individual has requested is not the same as choosing the customer's legal form or legal strategy. This item does not forbid a high-level description of what an acknowledgment is versus a verification when that is not legal advice about the customer's transaction.",
    option_feedback: {
      A: "A notary is not the customer's lawyer (§ 41-273(A)).",
      B: "Correct. A.R.S. § 41-273(A) does not authorize legal advice or selecting legal records for others.",
      C: "The bond does not authorize the practice of law.",
      D: "Completing a customer-requested notarial certificate is different from choosing the legal document.",
    },
    source_id: "ars_41_273",
    source_reference: "A.R.S. § 41-273(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-031",
    topic: "prohibited-acts",
    difficulty: "medium",
    question_text: "A signer appears confused about the record. The notarial officer:",
    option_a: "Must proceed quickly before the signer changes their mind",
    option_b:
      "May refuse the notarial act if not satisfied that the individual is competent or has capacity to execute the record, or that the signature is knowingly and voluntarily made",
    option_c: "Must have a relative sign the individual's name",
    option_d: "May notarize a blank signature line for later",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-256(A) allows a notarial officer to refuse if not satisfied that the individual executing the record is competent or has capacity, or that the signature is knowingly and voluntarily made. Looking confused is not, by itself, a statutory finding of incompetence. A relative may not sign as the individual. A blank signature line is not a completed notarial act under § 41-264.",
    option_feedback: {
      A: "Pressure is not a reason to skip the § 41-256(A) satisfaction standard.",
      B: "Correct. A.R.S. § 41-256(A) is a may-refuse standard, not an automatic incompetence rule.",
      C: "Another person cannot execute the record as the signer.",
      D: "A blank signature line is not a completed notarial act.",
    },
    source_id: "ars_41_256",
    source_reference: "A.R.S. § 41-256(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-032",
    topic: "prohibited-acts",
    difficulty: "hard",
    question_text: "Dating a notarial certificate as of last week's contract date, instead of the date the notarial act is performed, is:",
    option_a: "Acceptable if both parties agree",
    option_b:
      "Inconsistent with the requirement that the certificate be executed contemporaneously with the notarial act and be dated by the notarial officer",
    option_c: "Required whenever a title company asks",
    option_d: "Allowed on weekends only",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-264(A)(1) requires the certificate to be executed contemporaneously with the performance of the notarial act. Section 41-264(A)(2) requires the certificate to be signed and dated by the notarial officer. A private agreement or industry request cannot change the date of the act. Failure to comply with this article can be a ground for commission action under A.R.S. § 41-271(A)(1); this item tests the contemporaneous-date rule, not a specific penalty amount.",
    option_feedback: {
      A: "Private agreement does not replace contemporaneous execution under § 41-264(A)(1).",
      B: "Correct. A.R.S. § 41-264(A)(1)–(2): contemporaneous execution and dating by the officer.",
      C: "A title company's preference is not an exception.",
      D: "The calendar weekday is irrelevant.",
    },
    source_id: "ars_41_264",
    source_reference: "A.R.S. § 41-264(A)(1)–(2)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-033",
    topic: "prohibited-acts",
    difficulty: "easy",
    question_text: "A notary public:",
    option_a: "May lend the official stamping device so an office manager can perform a notarial act",
    option_b: "May not allow another individual to use the stamping device to perform a notarial act",
    option_c: "May pre-sign certificates for busy days before any notarial act is performed",
    option_d: "May notarize a record to which the notary is a party",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-267(A) makes the notary responsible for the security of the stamping device and provides that the notary may not allow another individual to use the device to perform a notarial act. The statute does not use the phrase 'exclusive control' of stamp and journal as a single rule. A.R.S. § 41-264(E) forbids signing a certificate until the notarial act has been performed. A.R.S. § 41-252(B) forbids a notarial act on a record to which the officer is a party.",
    option_feedback: {
      A: "Lending the device so another person can perform the act violates § 41-267(A).",
      B: "Correct. A.R.S. § 41-267(A): no other individual may use the stamping device to perform a notarial act.",
      C: "A.R.S. § 41-264(E) forbids signing the certificate until the act is performed.",
      D: "A.R.S. § 41-252(B) prohibits a notarial act on a record to which the officer is a party.",
    },
    source_id: "ars_41_267",
    source_reference: "A.R.S. § 41-267(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-034",
    topic: "new-laws",
    difficulty: "medium",
    question_text: "When an Arizona notary statute is amended during a four-year commission, the notary should:",
    option_a: "Ignore the amendment until the current commission expires",
    option_b: "Apply the law that is in force on the date of each notarial act, including its stated effective date",
    option_c: "Treat a governor's signature alone as making a future-effective act current immediately",
    option_d: "Ask the customer which version of the statute to follow",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(E) sets a four-year commission term; it does not freeze the rest of Title 41 for that term. A.R.S. § 1-241 provides that an act that by its terms takes effect on a specified day takes effect at noon on that day unless the act provides otherwise. A.R.S. § 1-244 provides that no statute is retroactive unless expressly declared. Example as of 2026-09-01: Laws 2026, Chapter 31 (SB 1479) was approved April 9, 2026, with a general effective date of September 12, 2026. It is signed but not yet in force on 2026-09-01, so its later journal/thumbprint amendments (including to § 41-254) are not current law for an act performed on 2026-09-01. A last-verified date on a study item is not a statute's effective date.",
    option_feedback: {
      A: "The four-year term in A.R.S. § 41-269(E) does not freeze later amendments.",
      B: "Correct. Apply the law in force on the date of the notarial act; watch the statutory effective date (A.R.S. § 1-241).",
      C: "A signed act with a later effective date is not current before that date. Example: SB 1479 / Laws 2026, Ch. 31, effective September 12, 2026.",
      D: "Customers do not choose the governing statute.",
    },
    source_id: "ars_1_241",
    source_reference:
      "A.R.S. § 1-241; A.R.S. § 1-244; A.R.S. § 41-269(E); Laws 2026, Chapter 31 (SB 1479), effective September 12, 2026 (not in force 2026-09-01)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-035",
    topic: "new-laws",
    difficulty: "easy",
    question_text: "Remote online notarization (RON) for a remotely located individual, where authorized, requires:",
    option_a: "A social-media video call with no identity proofing",
    option_b:
      "A notary located in Arizona using communication technology, statutory identification of the remote signer, and an audiovisual recording of the act",
    option_c: "Emailing a photo of a signed paper",
    option_d: "The notary to be physically located in another country",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-263(B) allows a notary public located in this state to perform a notarial act using communication technology for a remotely located individual if identity is established as the statute provides (personal knowledge, a credible witness, or at least two types of identity proofing), the record can be confirmed, and an audiovisual recording is created. A remotely located individual is not in the notary's physical presence. Before the first such act, the notary must notify the Secretary of State (§ 41-263(F)). Traditional in-person electronic notarization is a different process on the SOS Remote & eNotary page.",
    option_feedback: {
      A: "Casual video without the statutory identification and recording requirements is not RON under § 41-263.",
      B: "Correct. A.R.S. § 41-263 requires an Arizona-located notary, communication technology, statutory identification, and an audiovisual recording.",
      C: "Emailing a photo of a wet signature is not a notarial act under § 41-263.",
      D: "Section 41-263(B) requires the notary public to be located in this state, not in another country.",
    },
    source_id: "ars_41_263",
    source_reference: "A.R.S. § 41-263(B), (F); SOS Remote & eNotary",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-036",
    topic: "new-laws",
    difficulty: "hard",
    question_text:
      "A notary bill has been signed by the governor but states a later effective date. For a notarial act performed before that date, which statement is correct?",
    option_a: "The signed bill is already current law because the governor signed it",
    option_b:
      "A signed law with a future effective date should not be treated as currently effective before that date; apply the law in force on the date of the notarial act",
    option_c: "A study question's last_verified_at date is the legal effective date of the statute",
    option_d: "A practice bank's effective_from field is the legal effective date of the statute",
    correct_option: "B",
    explanation:
      "A.R.S. § 1-241 controls when an act that specifies a day takes effect (noon on that day unless otherwise provided). A.R.S. § 1-244 forbids treating a statute as retroactive unless the statute expressly so declares. Signing date, publication date, a study last-verified date, and a question-bank effective_from field are not substitutes for the act's effective date. Illustration as of 2026-09-01: Laws 2026, Chapter 31 (SB 1479) was approved April 9, 2026 and is effective September 12, 2026. On 2026-09-01 it is not yet current law; do not apply its later amendments (including thumbprint/journal changes) to an act performed before September 12, 2026.",
    option_feedback: {
      A: "The governor's signature is not the same as the statutory effective date. SB 1479 / Laws 2026, Ch. 31 is effective September 12, 2026.",
      B: "Correct. Future effective date means not currently effective; apply the law in force on the date of the act (A.R.S. § 1-241, § 1-244).",
      C: "last_verified_at records when a study item was checked; it is not a statute's effective date.",
      D: "A question-bank effective_from field is not Arizona's statutory effective date.",
    },
    source_id: "az_sb_1479_2026",
    source_reference:
      "Laws 2026, Chapter 31 (SB 1479), effective September 12, 2026; A.R.S. § 1-241; A.R.S. § 1-244 (not in force on 2026-09-01)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-037",
    topic: "commission",
    difficulty: "medium",
    question_text: "After an applicant passes the notary competency examination, which statement is accurate?",
    option_a: "The passing score itself issues the commission; no further statutory steps are required",
    option_b:
      "Passing the examination is one qualification if the Secretary of State requires it; the commission is issued only after the remaining requirements of A.R.S. § 41-269 are met, including the oath of office and the $5,000 surety-bond assurance",
    option_c: "Buying a stamping device is the statutory act that issues the commission",
    option_d: "Registration with the postal service completes commissioning",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(B)(6) requires the applicant to have passed the examination in § 41-270 if required by the secretary of state. That is one qualification, not the commissioning act. Before issuance, the applicant must execute an oath of office and submit it to the secretary of state (§ 41-269(C)) and submit a $5,000 surety-bond assurance (§ 41-269(D)). On compliance with the section, the secretary of state shall issue the commission (§ 41-269(E)). Purchasing a stamp is not listed as a legal condition of issuance in § 41-269. SOS New Notary describes the current application/exam operational flow after the exam; exam vendor, fee, and remote-testing details are not tested here.",
    option_feedback: {
      A: "A.R.S. § 41-269(E) issues the commission only on compliance with the section, not on the exam score alone.",
      B: "Correct. Exam (if required) is one of § 41-269(B); oath, $5,000 assurance, and SOS issuance still follow.",
      C: "A stamping device is not the commissioning condition in A.R.S. § 41-269.",
      D: "The postal service is not the commissioning authority.",
    },
    source_id: "ars_41_269",
    source_reference: "A.R.S. § 41-269(B)(6), (C), (D), (E); Arizona SOS New Notary (application flow)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-038",
    topic: "identification",
    difficulty: "medium",
    question_text: "A signer presents an expired driver license as the only identification. Under Arizona identification rules, the notary should:",
    option_a: "Always accept it if the photo looks like the person",
    option_b:
      "Decline to rely on that expired license as the statute's listed unexpired credential and use another permitted identification method if one is available",
    option_c: "Accept any expired ID less than 10 years old",
    option_d: "Accept it only on Sundays",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-255(B)(1)(a) lists an unexpired United States passport or a state-issued driver license or nonoperating identification license. The statute does not treat an ordinary expired driver license as that listed credential. Personal knowledge (§ 41-255(A)) and a credible witness (§ 41-255(B)(2)) are separate methods; a photo resemblance on an expired license does not create them. This item does not invent extra exceptions the statute does not state.",
    option_feedback: {
      A: "A resemblance is not enough. Section 41-255(B)(1)(a) uses unexpired credentials.",
      B: "Correct. An ordinary expired driver license is not the unexpired credential listed in A.R.S. § 41-255(B)(1)(a).",
      C: "The statute does not create a generic 10-year expired-ID rule.",
      D: "The weekday is irrelevant to § 41-255.",
    },
    source_id: "ars_41_255",
    source_reference: "A.R.S. § 41-255(B)(1)(a)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-039",
    topic: "acknowledgments",
    difficulty: "easy",
    question_text: "The notary public's signature on the notarial certificate must:",
    option_a: "Be signed and dated in the same manner as on file with the Secretary of State",
    option_b: "Be a nickname the clients prefer",
    option_c: "Be omitted if the official stamp is dark enough",
    option_d: "Be signed by the office receptionist",
    correct_option: "A",
    explanation:
      "A.R.S. § 41-264(A)(2) requires the certificate to be signed and dated by the notarial officer and, if the officer is a notary public, signed in the same manner as on file with the secretary of state. The statute does not say the wet signature must be a letter-for-letter duplicate of the printed name on the official stamp. For a tangible record, a notary public must also affix an official stamp (§ 41-264(B)); the stamp does not replace the signature. A notarial officer may not sign the certificate until the act has been performed (§ 41-264(E)).",
    option_feedback: {
      A: "Correct. A.R.S. § 41-264(A)(2) is same manner as on file with the Secretary of State, plus dating.",
      B: "A client-preferred nickname is not the manner on file with the Secretary of State.",
      C: "Section 41-264(A)(2) requires a signature; subsection (B) stamp is additional for tangible records.",
      D: "Only the notarial officer signs the certificate.",
    },
    source_id: "ars_41_264",
    source_reference: "A.R.S. § 41-264(A)(2), (B), (E)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-040",
    topic: "jurats",
    difficulty: "hard",
    question_text: "For a verification on oath or affirmation (jurat), Arizona's sufficient short-form certificate language is that the record was:",
    option_a: "Acknowledged at any earlier time without the individual appearing",
    option_b: "Signed and sworn to (or affirmed) before the notarial officer",
    option_c: "Signed by the notary if the individual is tired",
    option_d: "Signed in pencil so it can be changed",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-251(16) defines the verification as a declaration on oath or affirmation before the officer that a statement in the record is true; that subsection does not itself say 'must sign in the notary's presence.' A.R.S. § 41-253(B) requires the individual to appear and make the verification. A.R.S. § 41-265(3) states the sufficient short form: 'Signed and sworn to (or affirmed) before me.' An acknowledgment under § 41-251(1) may concern a signature already on the record. No August 2026 Manual page is cited. Pencil or the notary signing for the individual is not authorized.",
    option_feedback: {
      A: "No appearance would violate § 41-254(A) and is not a verification under § 41-251(16).",
      B: "Correct. The statutory short form in § 41-265(3) is 'signed and sworn to (or affirmed) before me,' together with appearance under § 41-253(B).",
      C: "The notary does not sign the record for the individual.",
      D: "An alterable signature is not the statutory verification process.",
    },
    source_id: "ars_41_265",
    source_reference: "A.R.S. § 41-265(3); A.R.S. § 41-253(B); A.R.S. § 41-251(16) (definition of the declaration, not a standalone in-presence signing rule)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-041",
    topic: "journals",
    difficulty: "easy",
    question_text: "Journal entries of notarial acts must be:",
    option_a: "Recorded in chronological order",
    option_b: "Written only once a month as a summary",
    option_c: "Stored only in the customer's email",
    option_d: "Destroyed after 24 hours",
    correct_option: "A",
    explanation:
      "A.R.S. § 41-319(A) requires the notary public to record all notarial acts in chronological order. The statute does not require a separate serial-number system beyond that chronological record. Monthly summaries, customer email, and 24-hour destruction are not authorized. Retention while commissioned is at least five years after the act under A.R.S. § 41-317(C), which is outside this item's main pin-cite.",
    option_feedback: {
      A: "Correct. A.R.S. § 41-319(A) requires chronological order.",
      B: "A monthly summary is not recording each act in chronological order.",
      C: "Customer email is not the journal required by § 41-319.",
      D: "Premature destruction is not authorized; this item tests chronological recording, not the five-year rule.",
    },
    source_id: "ars_41_319",
    source_reference: "A.R.S. § 41-319(A)",
    last_verified_at: "2026-09-01",
    is_free: true,
  },
  {
    question_id: "az-042",
    topic: "seals-fees",
    difficulty: "medium",
    question_text: "If a customer asks for a discount below the authorized maximum, the notary:",
    option_a: "May select a standard fee from no charge up to the maximum, and may not exceed that maximum for a rush job",
    option_b: "Must always charge the maximum",
    option_c: "Must charge double to offset the discount later",
    option_d: "May exceed the maximum for rush jobs",
    correct_option: "A",
    explanation:
      "Ariz. Admin. Code R2-12-1102(B) directs a notary to select a standard fee from no charge up to the maximum $10 fee for a notarial act and to be consistent. A.R.S. § 41-316(C) forbids charging a fee except as the rule authorizes, so exceeding the maximum is the violation. The maximum is a ceiling, not a mandatory price. Copy certification is billed per page certified under R2-12-1102(E); this item tests the ceiling principle, not every unit.",
    option_feedback: {
      A: "Correct. R2-12-1102 allows no charge up to the maximum; A.R.S. § 41-316(C) does not allow exceeding the rule.",
      B: "The maximum is a ceiling, not a required price.",
      C: "Later overcharging still exceeds the authorized maximum.",
      D: "Rush or convenience does not authorize a fee above the rule.",
    },
    source_id: "ars_41_316",
    source_reference: "A.R.S. § 41-316; Ariz. Admin. Code R2-12-1102(B), (E)",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
  {
    question_id: "az-043",
    topic: "prohibited-acts",
    difficulty: "medium",
    question_text: "Translating a Spanish document and then advising which Arizona legal form the customer should use is risky because:",
    option_a: "Translation itself is always illegal",
    option_b:
      "A notary commission does not authorize giving legal advice or assisting persons in drafting legal records, including selecting a legal form for another person",
    option_c: "Spanish-language documents can never be notarized",
    option_d: "Notaries may never communicate in a language other than English",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-273(A) does not authorize drafting legal records, giving legal advice, otherwise practicing law, or immigration consulting. Translation by itself is not listed as illegal in that subsection. Communication in a language both understand is addressed in A.R.S. § 41-253(F). This item does not expand into the separate 'notario' advertising rules in § 41-273(C)–(D).",
    option_feedback: {
      A: "Translation itself is not listed as prohibited in § 41-273(A).",
      B: "Correct. The UPL risk is legal advice / selecting a legal record, not the translation step.",
      C: "A Spanish-language record can still be the subject of a notarial act if communication and certificate rules are met.",
      D: "A.R.S. § 41-253(F) allows communication in a shared language or through a statutory translator.",
    },
    source_id: "ars_41_273",
    source_reference: "A.R.S. § 41-273(A)",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
  {
    question_id: "az-044",
    topic: "new-laws",
    difficulty: "medium",
    question_text:
      "A 2026 Arizona notary bill has been signed and states a future effective date. To determine what rule applies to a notarial act today, the notary should:",
    option_a: "Rely only on a social-media or third-party blog summary of the bill",
    option_b:
      "Read the current A.R.S. text on the Arizona Legislature site, confirm the act's effective date, treat SOS notary pages as operational guidance that may still show old section numbers, and apply only law that is in force on the date of the act",
    option_c: "Treat the signed bill as already in force because it has a chapter number",
    option_d: "Wait until a signer complains before checking the official text",
    correct_option: "B",
    explanation:
      "Legal text and effective dates come from the Arizona Legislature (current A.R.S. and session laws). A.R.S. § 1-241 and § 1-244 control timing and non-retroactivity. SOS notary pages may describe filing, exam, and name/address operations, and some still display recodified/old section numbers; those pages do not replace the current Legislature numbering. Illustration as of 2026-09-01: Laws 2026, Chapter 31 (SB 1479) is effective September 12, 2026, so it is not current law today. This item does not ask which commercial study page to use.",
    option_feedback: {
      A: "Unofficial recaps are not the official text or effective date.",
      B: "Correct. Current A.R.S. + stated effective date; SOS pages are operational only; apply law in force on the act date.",
      C: "A chaptered session law still waits for its effective date (§ 1-241). SB 1479 is not in force on 2026-09-01.",
      D: "A complaint is not how a notary determines current law.",
    },
    source_id: "az_sb_1479_2026",
    source_reference:
      "Laws 2026, Chapter 31 (SB 1479), effective September 12, 2026; A.R.S. § 1-241; A.R.S. § 1-244; current A.R.S. on azleg.gov",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
  {
    question_id: "az-045",
    topic: "commission",
    difficulty: "hard",
    question_text:
      "Under A.R.S. § 41-269, which statement correctly distinguishes examination, unofficial practice, and issuance of a commission?",
    option_a: "A high score on any unofficial practice test causes the secretary of state to issue the commission",
    option_b:
      "Passing the examination described in A.R.S. § 41-270, if required by the secretary of state, is one qualification; unofficial practice scores are not that examination, and the secretary of state issues the commission only after the statutory requirements of § 41-269 are satisfied",
    option_c: "A practice-test score replaces the § 41-270 examination whenever the applicant prefers",
    option_d: "A practice-test score automatically purchases and files the $5,000 surety-bond assurance",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-269(B)(6) treats the § 41-270 examination as one qualification if the secretary of state requires it. Subsections C and D still require the oath of office and the $5,000 assurance. Subsection E: on compliance with the section, the secretary of state shall issue the commission. An unofficial practice test is not the examination in § 41-270 and is not issuance under § 41-269(E). This item is an Arizona commissioning rule, not a statement about any particular commercial website.",
    option_feedback: {
      A: "Section 41-269(E) issues the commission on statutory compliance, not on an unofficial practice score.",
      B: "Correct. Practice ≠ § 41-270 exam ≠ SOS issuance under § 41-269(E).",
      C: "Section 41-269(B)(6) points to the official examination if required, not a substitute practice set.",
      D: "The $5,000 assurance in § 41-269(D) is submitted to the secretary of state; a practice score does not file it.",
    },
    source_id: "ars_41_269",
    source_reference: "A.R.S. § 41-269(B)(6), (C), (D), (E); A.R.S. § 41-270",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
  {
    question_id: "az-046",
    topic: "identification",
    difficulty: "hard",
    question_text: "The notary and the signer do not share a language. Under A.R.S. § 41-253(F), the notary should:",
    option_a: "Guess the person's intent from gestures",
    option_b:
      "Communicate directly in a language both understand, or indirectly through a translator who communicates directly with the notary and the signer in languages the translator understands; if neither method is available, do not proceed",
    option_c: "Have a child interpret legal terms without following the statutory translator method",
    option_d: "Notarize because identification was shown",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-253(F) requires communication either (1) directly in a language both the notary and the individual understand, or (2) indirectly through a translator who communicates directly with the notary and the individual in languages the translator understands. Lack of a shared language is not an automatic refusal if a lawful translator method is available. A.R.S. § 41-254(B) requires that translator to appear personally. Identification under § 41-255 does not replace the communication requirement. Gestures and an informal child interpreter are not the methods in § 41-253(F).",
    option_feedback: {
      A: "Gestures are not communication under § 41-253(F).",
      B: "Correct. Direct shared language or a statutory translator; otherwise do not proceed. The translator must appear personally (§ 41-254(B)).",
      C: "An informal child interpreter is not the translator method in § 41-253(F)(2).",
      D: "Showing ID does not satisfy the communication requirement in § 41-253(F).",
    },
    source_id: "ars_41_253",
    source_reference: "A.R.S. § 41-253(F)(1)–(2); A.R.S. § 41-254(B)",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
  {
    question_id: "az-047",
    topic: "acknowledgments",
    difficulty: "medium",
    question_text:
      "If a notarial certificate for a tangible record is attached on a separate sheet of paper, the attachment must:",
    option_a: "Be used whenever the notary wants a second fee",
    option_b:
      "Contain a description of the record including at least the title or type of record, the date of the record, the number of pages, and any additional signers other than those named in the certificate",
    option_c: "Be used so an absent signer can appear to have signed",
    option_d: "Be added even when the certificate already on the record is complete and truthful",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-264(F) requires that if the certificate is attached using a separate sheet of paper, the attachment must contain a description of the record that includes at a minimum the title or type of record, the date of the record, the number of pages, and any additional signers other than those named in the notarial certificate. The certificate must still be part of or securely attached to the record. The statute uses 'separate sheet of paper,' not 'allonge.' A separate sheet cannot create a false appearance. A complete certificate already on the record does not require a second sheet.",
    option_feedback: {
      A: "A second fee is not the test in § 41-264(F).",
      B: "Correct. A.R.S. § 41-264(F) lists the minimum description on a separate certificate sheet.",
      C: "Attachment cannot manufacture appearance (§ 41-254(A)).",
      D: "Do not add a second certificate if the first already satisfies § 41-264.",
    },
    source_id: "ars_41_264",
    source_reference: "A.R.S. § 41-264(F)",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
  {
    question_id: "az-048",
    topic: "journals",
    difficulty: "hard",
    question_text:
      "When an Arizona notary's commission ends by resignation, revocation, or expiration without reappointment, the physical stamping device, journal, and public records should:",
    option_a: "Be given to any coworker who wants them",
    option_b:
      "Be delivered to the Secretary of State as required by A.R.S. § 41-317, not discarded as household trash or sold",
    option_c: "Be thrown in household recycling the same day without checking the law",
    option_d: "Be sold online as collectibles",
    correct_option: "B",
    explanation:
      "A.R.S. § 41-317(B) requires delivery of the physical stamping device, notarial journal, and records (except records of notarial acts that are not public record) to the secretary of state by certified mail or other means providing a receipt. If the notary does not apply for reappointment, the same delivery is required on expiration. Neglecting to deposit them for three months thereafter can forfeit not less than $50 or more than $500 to the state. While commissioned, the notary must keep records and journals for at least five years after the act (§ 41-317(C)). Electronic stamping devices are treated separately: A.R.S. § 41-267(A) requires disabling an electronic stamping device so it cannot be used, not informal sale or workplace handoff of the physical device.",
    option_feedback: {
      A: "A.R.S. § 41-317(B) requires delivery to the Secretary of State, not to a coworker.",
      B: "Correct. Physical device, journal, and records go to the SOS under § 41-317; do not treat them as trash or office supplies.",
      C: "Household recycling is not the statutory delivery. Failure to deposit within three months has a forfeiture consequence.",
      D: "Selling a physical stamping device is not the delivery required by § 41-317(B).",
    },
    source_id: "ars_41_317",
    source_reference: "A.R.S. § 41-317(B)–(C); see also A.R.S. § 41-267(A) (electronic stamping device)",
    last_verified_at: "2026-09-01",
    is_free: false,
  },
];

export const questions: Question[] = publish(drafts);

export function publishedQuestions(): Question[] {
  return questions.filter((q) => isActiveQuestion(q));
}

export function freeQuestions(): Question[] {
  return publishedQuestions().filter((q) => q.is_free);
}

export function questionsByTopic(topic: TopicId): Question[] {
  return publishedQuestions().filter((q) => q.topic === topic);
}

export function getQuestion(id: string): Question | undefined {
  return questions.find((q) => q.question_id === id);
}
