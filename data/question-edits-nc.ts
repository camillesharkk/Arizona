import type { QuestionEdit } from "../lib/question-version.ts";

export const ncQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "nc-182": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A North Carolina notary keeps one journal for both traditional and in-person electronic acts. A completed traditional entry contains the principal’s name but omits the time, document title, and identity method. What information do rules .0208 and .0302(1)–(5) require for the entry?",
      "option_a": "The principal’s name is sufficient if the notary recognizes the person.",
      "option_b": "Date and time at the notary’s location, the principals’ and any designee’s names, act type and mode, document title if any, and how each principal’s identity was determined.",
      "option_c": "Only the record’s financial value and the notary’s fee.",
      "option_d": "Only a future date selected by the principal and the journal page number.",
      "correct_option": "B",
      "explanation": "Rule .0302(1)–(5) requires the listed details. The notary must identify each act’s mode because this journal combines modes. A journal that records only one mode may instead identify that mode once at the beginning under .0209.",
      "option_feedback": {
        "A": "Personal knowledge can establish identity, but the entry must still record how the notary determined identity and the other required details.",
        "B": "Correct. The rule lists these core details, and this mixed-mode journal needs an entry-level mode notation.",
        "C": "Financial value and the fee do not supply the required identity or act details. Applicable fees are addressed separately.",
        "D": "The entry records the actual date and time at the notary’s location, not a date chosen by the principal."
      },
      "source_reference": "18 NCAC 07I .0208, .0209, and .0302(1)–(5), North Carolina Office of Administrative Hearings. https://www.sosnc.gov/webfiles/documents/adminrules/18_sos/18_NCAC_07_rules_july_2025.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "nc-094": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "An identified, disinterested nonsubscribing witness appears before a North Carolina notary and testifies under oath that the subscribing witness’s signature is genuine. Under G.S. 10B-40(c1)(2)–(4), what must the certificate include?",
      "option_a": "Only the notary’s own opinion that the handwriting looks familiar.",
      "option_b": "The appearing nonsubscribing witness’s name, the person whose signature is being proven, and the witness’s sworn statements of disinterest and genuine-signature recognition.",
      "option_c": "A statement that the nonsubscribing witness saw the principal sign the record.",
      "option_d": "A statement that the principal personally appeared and acknowledged the signature.",
      "correct_option": "B",
      "explanation": "Under the listed-content option in G.S. 10B-40(c1), the certificate identifies the appearing nonsubscribing witness, identifies the principal or subscribing witness whose signature is being proven, and records the appearing witness’s sworn disinterest and recognition of the genuine signature.",
      "option_feedback": {
        "A": "Verification in this scenario rests on the appearing witness’s sworn recognition, not the notary’s opinion.",
        "B": "Correct. These are the names and statements required by subdivisions (2) through (4).",
        "C": "This statutory route uses recognition of a genuine signature. It does not require the nonsubscribing witness to observe the signing.",
        "D": "That statement describes a different act. This certificate records verification or proof by a nonsubscribing witness."
      },
      "source_reference": "G.S. 10B-40(c1)(2)–(4) and G.S. 10B-3(28)(d)(iii), North Carolina General Assembly. https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_10B/GS_10B-40.html",
      "last_verified_at": "2026-11-19"
    }
  }
};
