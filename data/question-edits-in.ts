import type { QuestionEdit } from "../lib/question-version.ts";

export const inQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "in-059": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "For an in-person Indiana notarization, a signer you do not know presents an otherwise satisfactory state-issued driver’s license. Under the Indiana Secretary of State’s guide, how long may that license have been expired?",
      "option_a": "No more than three years.",
      "option_b": "No more than three days.",
      "option_c": "Any length of time if the photo is clear.",
      "option_d": "No more than ten years.",
      "correct_option": "A",
      "explanation": "The Indiana Secretary of State’s guide lists a state-issued driver’s license as eligible when current or expired for no more than three years. The guide separately describes an additional category of government-issued photo documents as current. The question concerns a driver’s license presented in person.",
      "option_feedback": {
        "A": "Correct. The guide’s limit for this credential is three years after expiration.",
        "B": "The guide gives the limit in years, not days.",
        "C": "A clear photo does not extend the expiration limit described in the guide.",
        "D": "Ten years exceeds the guide’s three-year limit for a state-issued driver’s license."
      },
      "source_reference": "Indiana Secretary of State, Indiana Notary Public Guide, revised May 20, 2024, printed p. 20, Identification Documents (official state-hosted indexed passage). https://inbizqa.soi.in.gov/Assets/NotaryGuide.pdf#page=20",
      "last_verified_at": "2026-11-19"
    }
  }
};
