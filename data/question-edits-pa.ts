import type { QuestionEdit } from "../lib/question-version.ts";

export const paQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "pa-016": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A customer asks for a verification on oath. The statement is already signed, and the customer refuses to sign again or take an oath or affirmation. What should the notary do?",
      "option_a": "Decline because a verification requires signing in the notary’s presence and taking an oath or affirmation.",
      "option_b": "Complete the verification because the notary recognizes the existing signature.",
      "option_c": "Complete an acknowledgment instead without the customer’s direction.",
      "option_d": "",
      "correct_option": "A",
      "explanation": "For a verification on oath or affirmation, the signer signs the record in the notary’s presence and swears or affirms that the statements are true. The customer refuses both requirements, so the notary cannot complete the requested verification.",
      "option_feedback": {
        "A": "This is the required response when the signer refuses the required signing and oath.",
        "B": "Recognizing a signature does not supply the signing or oath required for a verification.",
        "C": "An acknowledgment is a different act. The notary does not choose it for the customer.",
        "D": ""
      },
      "source_reference": "57 Pa.C.S. § 305(b). 4 Pa. Code § 167.63(1)–(3). https://www.legis.state.pa.us/WU01/LI/LI/CT/HTM/57/00.003..HTM",
      "last_verified_at": "2026-11-19"
    }
  },
  "pa-021": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A Pennsylvania notary identifies an unfamiliar signer using a current driver’s license. Along with how the signer was identified, what belongs in the journal?",
      "option_a": "A brief description of the license and its dates of issuance and expiration.",
      "option_b": "The signer’s full Social Security number.",
      "option_c": "Only the last four digits of the license number.",
      "option_d": "",
      "correct_option": "A",
      "explanation": "When identification relies on satisfactory evidence, describe the method and any credential presented, including the credential’s issuance and expiration dates. Pennsylvania’s journal rule bars Social Security numbers. The last four digits of a driver’s license are optional.",
      "option_feedback": {
        "A": "Record the credential description and both dates.",
        "B": "The journal may not contain any part of a Social Security number.",
        "C": "The last four digits are optional and do not replace the description or dates.",
        "D": ""
      },
      "source_reference": "57 Pa.C.S. § 319(c)(5). 4 Pa. Code § 167.32(d)–(e). https://www.legis.state.pa.us/WU01/LI/LI/CT/HTM/57/00.003..HTM",
      "last_verified_at": "2026-11-19"
    }
  },
  "pa-034": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "The Pennsylvania Department of State sends a notary notice that it revoked the commission. What must the individual do with the stamping device?",
      "option_a": "Deliver it to the Department within 15 days after the Department’s notice.",
      "option_b": "Destroy it and keep the pieces at home.",
      "option_c": "Give it to the employer within 15 days.",
      "option_d": "",
      "correct_option": "A",
      "explanation": "After revocation or suspension, surrender the stamping device to the Department. The regulation requires delivery within 15 days after notice from the Department.",
      "option_feedback": {
        "A": "Correct. The Department receives the device within the prescribed period.",
        "B": "The statute requires surrender after suspension or revocation.",
        "C": "The employer is not the recipient.",
        "D": ""
      },
      "source_reference": "57 Pa.C.S. § 318(a)(2.1). 4 Pa. Code § 167.22(f). https://www.legis.state.pa.us/WU01/LI/LI/CT/HTM/57/00.003..HTM",
      "last_verified_at": "2026-11-19"
    }
  },
  "pa-035": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A Pennsylvania notary discovers that someone stole the stamping device. How must the notary notify the Department?",
      "option_a": "Promptly, in writing or by email, within 15 days of discovery.",
      "option_b": "In the next commission renewal application.",
      "option_c": "By publishing a local newspaper notice instead of contacting the Department.",
      "option_d": "",
      "correct_option": "A",
      "explanation": "Report the theft promptly in writing or by email and within 15 days of discovery. Include when you discovered it and state that the device is no longer in your possession.",
      "option_feedback": {
        "A": "Correct. The statute calls for prompt notice and the rule specifies the method and outside limit.",
        "B": "Waiting until renewal does not satisfy the notification duty.",
        "C": "A newspaper notice does not notify the Department under this rule.",
        "D": ""
      },
      "source_reference": "57 Pa.C.S. § 318(b). 4 Pa. Code § 167.22(e). https://www.legis.state.pa.us/WU01/LI/LI/CT/HTM/57/00.003..HTM",
      "last_verified_at": "2026-11-19"
    }
  },
  "pa-077": {
    "version": 1,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A customer asks the notary to take an acknowledgment now and promises to sign the deed after leaving. May the act be completed on that promise?",
      "option_a": "Yes, if the customer prepays the fee.",
      "option_b": "No. The record must be signed before or during the acknowledgment.",
      "option_c": "Yes, a signature within 24 hours relates back.",
      "option_d": "",
      "correct_option": "B",
      "explanation": "The regulation prohibits a record from being signed subsequent to its acknowledgment.",
      "option_feedback": {
        "A": "Payment does not supply the required existing signature.",
        "B": "The regulation prohibits a record from being signed subsequent to its acknowledgment.",
        "C": "The rule provides no 24-hour future-signature procedure.",
        "D": ""
      },
      "source_reference": "4 Pa. Code § 167.61(1). https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/004/chapter167/chap167toc.html Read 2026-11-12.",
      "last_verified_at": "2026-11-19"
    }
  },
  "pa-078": {
    "version": 1,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A signer brings only a photocopy of a deed signed earlier and asks to acknowledge that prior signature. What specific regulation prevents using that record?",
      "option_a": "A previously signed record presented for acknowledgment may not be a photocopy.",
      "option_b": "Photocopies automatically count as original signatures.",
      "option_c": "A photocopy is allowed whenever the ink looks dark.",
      "option_d": "",
      "correct_option": "A",
      "explanation": "Section 167.61(3) addresses records signed before appearance.",
      "option_feedback": {
        "A": "Section 167.61(b)(3) addresses records signed before appearance.",
        "B": "The regulation expressly excludes a photocopy in this situation.",
        "C": "Visual ink darkness does not satisfy the original-record condition.",
        "D": ""
      },
      "source_reference": "4 Pa. Code § 167.61(3). https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/004/chapter167/chap167toc.html Read 2026-11-12.",
      "last_verified_at": "2026-11-19"
    }
  }
};
