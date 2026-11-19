import type { QuestionEdit } from "../lib/question-version.ts";

export const hiQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "hi-038": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii notary moves to a new residence. Under HAR §5-11-10(a), what is the deadline for the required written change notice to the Attorney General?",
      "option_a": "Within 24 hours.",
      "option_b": "At the next commission renewal.",
      "option_c": "Written notice is optional if the seal stays the same.",
      "option_d": "Within 30 days of the change.",
      "correct_option": "D",
      "explanation": "The administrative rule sets a 30-day deadline for written notice. HRS §456-1(a) also directs notaries to report a change in residence promptly, so send the written notice as soon as possible.",
      "option_feedback": {
        "A": "The written deadline in this administrative rule is 30 days.",
        "B": "Renewal does not extend the written reporting deadline.",
        "C": "Keeping the same seal does not excuse written notice.",
        "D": "Correct. The written notice is due within 30 days, and the statute separately calls for prompt reporting."
      },
      "source_reference": "HAR §5-11-10(a), printed p. 11-10; HRS §456-1(a). https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-041": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A notary fails to report a change of address on time, so renewal forms are mailed to the wrong address. What administrative fine does the second sentence of HAR §5-11-10(d) specify for that circumstance?",
      "option_a": "$50.",
      "option_b": "$25.",
      "option_c": "$10.",
      "option_d": "$1,000.",
      "correct_option": "A",
      "explanation": "The second sentence specifies a $50 fine when untimely written notice of an address change causes renewal forms to be mailed to an incorrect address. The first sentence specifies $25 for untimely written change notices generally.",
      "option_feedback": {
        "A": "Correct. The second sentence specifies $50 for misdirected renewal forms.",
        "B": "The first sentence names $25 for the general late-notice rule.",
        "C": "The change fee is $10, which is separate from this address-related fine.",
        "D": "$1,000 is the ordinary bond amount, which does not set this fine."
      },
      "source_reference": "HAR §§5-11-10(d) and 5-11-46(a)(10), printed pp. 11-11 and 11-24; HRS §456-5. https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-066": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A signer has no qualifying ID and the notary does not know her. Her spouse says, “This is my wife,” without swearing or affirming. The notary does not know the spouse and cannot identify the spouse through a credential allowed for a credible witness. May the notary take the signer’s acknowledgment on these facts?",
      "option_a": "Yes. A spouse always qualifies as a credible witness.",
      "option_b": "Yes, if both names appear in the record.",
      "option_c": "Yes, if the notary waives the fee.",
      "option_d": "No. This introduction does not provide the sworn verification or witness identification required by law.",
      "correct_option": "D",
      "explanation": "A credible witness must appear personally and verify the signer’s identity under oath or affirmation. The notary must personally know the witness or identify the witness using one of the credentials listed in HRS §456-1.6(1)(D). The spouse meets neither of those identification conditions and made only an unsworn introduction.",
      "option_feedback": {
        "A": "Being married to the signer does not by itself satisfy the rule.",
        "B": "Names in the record do not establish the signer’s identity.",
        "C": "The fee has no effect on the identification requirement.",
        "D": "Correct. The introduction was unsworn, and the notary also could not identify the spouse."
      },
      "source_reference": "HRS §456-1.6, satisfactory evidence of identity paragraph (1)(D); HAR §5-11-7, printed p. 11-9. https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-067": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A credible witness personally appears and swears to the signer’s identity. The notary does not know the witness but verifies the witness’s identity using a current government-issued driver’s license. Can the witness supply satisfactory evidence of the signer’s identity?",
      "option_a": "No. Two credible witnesses are always required.",
      "option_b": "Yes, but the oath and personal appearance are optional.",
      "option_c": "Yes. The witness appears, provides sworn verification, and can be identified by the listed driver’s license.",
      "option_d": "No. The notary must have known the witness for ten years.",
      "correct_option": "C",
      "explanation": "HRS §456-1.6(1)(D) allows a personally appearing credible witness to verify the signer’s identity under oath or affirmation. The notary may personally know the witness or identify the witness from a qualifying passport, driver’s license, or government-issued nondriver ID. A current driver’s license meets the time condition.",
      "option_feedback": {
        "A": "This statutory route refers to a credible witness without requiring a second.",
        "B": "The witness must personally appear and verify identity under oath or affirmation.",
        "C": "Correct. Qualifying identification can establish the witness’s identity even if the notary does not personally know the witness.",
        "D": "The law imposes no ten-year acquaintance requirement."
      },
      "source_reference": "HRS §456-1.6, satisfactory evidence of identity paragraph (1)(D). https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001_0006.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-082": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "One signer acknowledges a document in person. The notary has already attached the acknowledgment certificate to the original and the first duplicate original. The signer requests a certificate on one more duplicate original. What additional fee does HRS §456-17(7) allow?",
      "option_a": "$5 for a second full acknowledgment.",
      "option_b": "$25 for a remote online act.",
      "option_c": "$0 because every duplicate original is included.",
      "option_d": "$2.50 for the signer on this additional duplicate original.",
      "correct_option": "D",
      "explanation": "The $5 acknowledgment charge covers the original and the first duplicate original. Under HRS §456-17(7), the notary may charge $2.50 per acknowledging person for each duplicate original after the first duplicate.",
      "option_feedback": {
        "A": "This is an extra duplicate certificate for the same acknowledgment, so the separate $2.50 rate applies.",
        "B": "No remote appearance occurred.",
        "C": "The first duplicate is included. The law authorizes a separate fee for subsequent duplicate originals.",
        "D": "Correct. The request is for the second duplicate original, beyond the one covered by the acknowledgment charge."
      },
      "source_reference": "HRS §456-17(7); Hawaii Attorney General, Notary Public Manual, 2026 website version, printed p. 13. https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0017.htm",
      "last_verified_at": "2026-11-19"
    }
  }
};
