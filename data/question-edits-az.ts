import type { QuestionEdit } from "../lib/question-version.ts";

export const azQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "az-048": {
    "version": 2,
    "previousReviewedDate": "2026-09-01",
    "fields": {
      "question_text": "You resign your Arizona notary commission in writing. Your public notarial journal contains several entries from the past year. How must you deliver the journal?",
      "option_a": "Give it to your employer and keep a receipt from the employer.",
      "option_b": "Send it to the Secretary of State by certified mail or another delivery method that provides a receipt.",
      "option_c": "Send it to the Secretary of State by ordinary mail with no proof of delivery.",
      "option_d": "Send it to the county recorder by certified mail.",
      "correct_option": "B",
      "explanation": "A.R.S. § 41-317(B) directs a resigning Arizona notary to deliver the journal to the Secretary of State by certified mail or another method that provides a receipt. The journal has recent public entries. Keep the delivery receipt as proof.",
      "option_feedback": {
        "A": "An employer’s receipt does not show that the Secretary of State received the journal.",
        "B": "Correct. The Secretary of State must receive the journal through a delivery method that provides a receipt.",
        "C": "Ordinary mail without a receipt does not meet the delivery requirement.",
        "D": "Certified mail meets the delivery-method requirement, but the county recorder is the wrong recipient."
      },
      "source_reference": "A.R.S. § 41-317(B); Arizona Secretary of State, Notary Public Reference Manual, October 2026, p. 11, Commission Resignation and Surrender of Journal, Seal and Records. https://www.azleg.gov/ars/41/00317.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "az-113": {
    "version": 2,
    "previousReviewedDate": "2026-09-29",
    "fields": {
      "question_text": "A student you do not know asks for an in-person acknowledgment in Arizona. They offer only a current photo ID issued by a private university. Can you use that card as a listed credential?",
      "option_a": "Yes. An unexpired card with a photo always qualifies.",
      "option_b": "No. Use a qualifying credential or another identification method Arizona law allows.",
      "option_c": "Yes. A private university ID counts as a state nonoperating identification license.",
      "option_d": "Yes. The student’s name and photo on the card establish personal knowledge.",
      "correct_option": "B",
      "explanation": "An ID issued solely by a private university is outside the government credential categories in A.R.S. § 41-255(B)(1). Ask for acceptable evidence, such as a qualifying unexpired state driver license or verification by a credible witness who meets the statutory requirements. If you cannot establish identity, stop.",
      "option_feedback": {
        "A": "A clear photo and a current date do not turn a private campus ID into a government credential.",
        "B": "Correct. The private campus ID does not qualify. Use a permitted identification route before performing the acknowledgment.",
        "C": "A state-issued nonoperating identification license is a different credential.",
        "D": "Personal knowledge comes from dealings sufficient to give reasonable certainty of identity."
      },
      "source_reference": "A.R.S. §§ 41-253(A) and 41-255(A), (B)(1)–(2), and (D); Arizona Secretary of State, Notary Public Reference Manual, October 2026, pp. 17–18. https://www.azleg.gov/ars/41/00253.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "az-180": {
    "version": 2,
    "previousReviewedDate": "2026-11-19",
    "fields": {
      "question_text": "You are reviewing Arizona’s journal-thumbprint exceptions for remote deeds. What is the minimum audiovisual recording retention stated in A.R.S. § 41-254(D)(3)(b) itself?",
      "option_a": "The recording may be discarded after the certificate is issued.",
      "option_b": "At least seven years.",
      "option_c": "Exactly five years because that is the general recording minimum.",
      "option_d": "Any period the technology provider chooses.",
      "correct_option": "B",
      "explanation": "The remote thumbprint exception lists a recording retention condition of at least seven years. The general five-year minimum is in § 41-263(E). Meeting the seven-year condition alone does not establish that the exception applies. The statute also lists a journal condition, and the published rule for credential analysis and identity proofing excludes the credential number from the journal description. The application of those provisions together remains under review.",
      "option_feedback": {
        "A": "Finishing the certificate does not satisfy the retention condition.",
        "B": "Correct. The statute sets at least seven years for this condition.",
        "C": "The ordinary recording minimum does not satisfy the separate seven-year condition.",
        "D": "The statute sets this condition whether or not a provider stores the recording."
      },
      "source_reference": "A.R.S. §§ 41-254(D)(3)(b) and 41-263(E); Laws 2026, ch. 31, §§ 6–7; A.A.C. R2-12-1309(A)(5). https://www.azleg.gov/ars/41/00254.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "az-206": {
    "version": 1,
    "replacementId": "az-208",
    "fields": {
      "question_text": "An authorized Arizona remote notary is taking an acknowledgment of a trustee’s deed that resulted from a nonjudicial foreclosure. The title company asks whether the deed’s separate thumbprint exception also lets the notary skip recording the call. What applies?",
      "option_a": "The recording can be skipped whenever a deed is exempt from the thumbprint requirement.",
      "option_b": "The recording is required only when the signer provides a journal thumbprint.",
      "option_c": "The trustee’s deed is exempt from the journal thumbprint, and the remote notarial act still requires an audiovisual recording.",
      "option_d": "The title company may waive the recording if it keeps an electronic copy of the deed.",
      "correct_option": "C",
      "explanation": "A.R.S. § 41-254(D)(1) independently exempts a trustee’s deed resulting from judicial or nonjudicial foreclosure from the journal thumbprint. The remote act still requires an audiovisual recording under § 41-263(B)(3). The separate remote thumbprint exception in § 41-254(D)(3) is not the basis for this deed’s exemption.",
      "option_feedback": {
        "A": "The exception in § 41-254(D)(1) applies to the journal thumbprint.",
        "B": "The remote recording requirement applies independently of the thumbprint requirement.",
        "C": "Correct. The deed-specific exception and the remote recording duty both apply.",
        "D": "An electronic copy of the deed does not substitute for a recording of the act."
      },
      "source_reference": "A.R.S. §§ 41-254(D)(1) and 41-263(B)(3); Laws 2026, ch. 31, §§ 6–7; A.A.C. R2-12-1308(A). https://www.azleg.gov/ars/41/00254.htm",
      "last_verified_at": "2026-11-19"
    }
  }
};
