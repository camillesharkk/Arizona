import type { QuestionEdit } from "../lib/question-version.ts";

export const nyQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "ny-046": {
    "version": 2,
    "previousReviewedDate": "2026-11-09",
    "fields": {
      "question_text": "A duly appointed New York notary performs an otherwise proper acknowledgment before taking or filing the required oath of office. What does Public Officers Law § 15 say about that omission?",
      "option_a": "It automatically voids the acknowledgment.",
      "option_b": "It does not invalidate the acknowledgment by itself, and § 15 does not excuse any otherwise applicable criminal liability.",
      "option_c": "It voids the acknowledgment unless the county clerk ratifies it.",
      "option_d": "It eliminates the duty to take and file an oath before acting.",
      "correct_option": "B",
      "explanation": "Public Officers Law § 10 requires an officer to take and file the oath before performing official duties. Section 15 preserves the validity of an otherwise proper act by a duly chosen officer despite that omission. It leaves any criminal liability imposed by another provision intact.",
      "option_feedback": {
        "A": "Section 15 preserves an otherwise proper act despite the oath omission.",
        "B": "Correct. Section 15 addresses the act’s validity and preserves any criminal liability that otherwise applies.",
        "C": "Section 15 does not require the county clerk to ratify the act.",
        "D": "Section 10 still requires the officer to take and file the oath before acting."
      },
      "source_reference": "New York Public Officers Law §§ 10 and 15; https://www.nysenate.gov/legislation/laws/PBO/15",
      "last_verified_at": "2026-11-19"
    }
  },
  "ny-077": {
    "version": 2,
    "previousReviewedDate": "2026-11-09",
    "fields": {
      "question_text": "A New York electronic notary wants to use their official electronic notarial signature to approve a routine office purchase order. No notarial act is being performed. May they use that signature for the approval?",
      "option_a": "No. A routine office purchase approval is outside its authorized uses.",
      "option_b": "Yes, because any electronic business approval qualifies.",
      "option_c": "Yes, as long as the purchase is below the office spending limit.",
      "option_d": "Yes, as long as the notary does not charge a notarization fee.",
      "correct_option": "A",
      "explanation": "The official electronic notarial signature cannot be used for a routine office purchase approval. New York restricts the signature to electronic notarial acts and separately requires it for certain official notices to the Department of State, such as an electronic notary’s email-address change.",
      "option_feedback": {
        "A": "Correct. A routine purchase approval is neither an electronic notarial act nor a required official notice.",
        "B": "Using an electronic signature for a business approval does not make it a notarial act.",
        "C": "An office spending limit cannot authorize use of the official notarial signature.",
        "D": "Waiving a fee does not change the signature’s authorized uses."
      },
      "source_reference": "New York Executive Law §135-c(5)(c), (7), https://www.nysenate.gov/legislation/laws/EXC/135-C; 19 NYCRR §182.4(a)(6), (10), DOS Notary Public License Law (September 2026), pp. 16–17.",
      "last_verified_at": "2026-11-19"
    }
  },
  "ny-148": {
    "version": 2,
    "previousReviewedDate": "2026-11-09",
    "fields": {
      "question_text": "A recipient requests a county clerk’s certification under New York Executive Law §133 for a signature on a notarial acknowledgment. Which statement about that certification is correct?",
      "option_a": "It states that the clerk’s office has the notary’s commission or certificate of official character and autograph signature on file, and that the clerk believes the signature is genuine.",
      "option_b": "It certifies that every statement in the underlying contract is true.",
      "option_c": "It certifies that the transaction is financially sound.",
      "option_d": "It certifies that the signer has paid every tax owed on the transaction.",
      "correct_option": "A",
      "explanation": "Under §133, the clerk certifies the filing and states that they recognize the notary’s handwriting or compared the signature with the one on file and believe it is genuine. The certification does not decide whether the underlying contract is true, financially sound or tax compliant.",
      "option_feedback": {
        "A": "Correct. Section 133 expressly calls for these filing and signature statements.",
        "B": "Authentication concerns the notarial signature; it does not verify the contract’s claims.",
        "C": "The clerk does not assess the transaction’s finances.",
        "D": "The certification does not determine whether taxes have been paid."
      },
      "source_reference": "New York Executive Law §133, certification of notarial signatures, https://www.nysenate.gov/legislation/laws/EXC/133 (current section revised July 7, 2023).",
      "last_verified_at": "2026-11-19"
    }
  },
  "ny-194": {
    "version": 2,
    "previousReviewedDate": "2026-11-09",
    "fields": {
      "question_text": "A New York notary takes an acknowledgment in Albany County for land in Erie County. The signer lives in Kings County. What location belongs in the venue?",
      "option_a": "Kings County, because the signer lives there.",
      "option_b": "Whichever county the lender prefers.",
      "option_c": "Albany County, where the notary takes the acknowledgment.",
      "option_d": "Erie County, because the land is located there.",
      "correct_option": "C",
      "explanation": "The venue gives the state and county where the notarial act takes place. This acknowledgment takes place in Albany County.",
      "option_feedback": {
        "A": "The signer’s residence does not determine where the acknowledgment occurred.",
        "B": "The venue follows the actual location of the notarial act.",
        "C": "Correct. The notary took the acknowledgment in Albany County.",
        "D": "The property location does not determine where the acknowledgment occurred."
      },
      "source_reference": "New York Executive Law §137, https://www.nysenate.gov/legislation/laws/EXC/137; New York DOS, Notary Public License Law (September 2026), p. 22, Venue.",
      "last_verified_at": "2026-11-19"
    }
  }
};
