import type { QuestionEdit } from "../lib/question-version.ts";

export const laQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "la-003": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "According to the Louisiana Secretary of State’s 2026 examination information, which scoring and reference-material rules apply to the statewide notary exam?",
      "option_a": "A passing scaled score is 70 out of 100, and the official 2026 study guide is the only permitted reference material.",
      "option_b": "A raw score of 70 correct answers is required, and the current guide is not allowed.",
      "option_c": "The test gives only a pass-or-fail result without a scaled passing score, and outside legal references are permitted.",
      "option_d": "A scaled score of 70 is required, but any edition of the official study guide is allowed.",
      "correct_option": "A",
      "explanation": "Louisiana’s Secretary of State requires a scaled score of 70 out of 100 and permits only the official 2026 study guide as a reference. The current exam page describes general-knowledge and scenario-based items without publishing the total number of items.",
      "option_feedback": {
        "A": "Correct. The Secretary lists the scaled score and the specific 2026 guide.",
        "B": "The threshold is scaled. The official 2026 guide is allowed.",
        "C": "The Secretary states a scaled passing score and excludes other references.",
        "D": "Earlier editions are not allowed as reference material."
      },
      "source_reference": "Louisiana Secretary of State, Get Exam Information, 2026 examination format and item sources, https://www.sos.la.gov/notary/get-exam-information.",
      "last_verified_at": "2026-11-19"
    }
  },
  "la-004": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A first-time applicant has never held a Louisiana notary commission. Which qualification exempts that applicant from the statewide Louisiana notary examination?",
      "option_a": "A notary commission in another state.",
      "option_b": "Admission to practice law in Louisiana.",
      "option_c": "A college degree.",
      "option_d": "A notary bond that is already on file.",
      "correct_option": "B",
      "explanation": "Louisiana dispenses with the exam for applicants admitted to practice law in the state. The statute also provides a separate exemption for people who already hold a valid Louisiana notarial commission. The applicant here has never held one.",
      "option_feedback": {
        "A": "An out-of-state notary commission does not transfer or waive Louisiana’s exam.",
        "B": "Correct. Louisiana admission to practice law supplies the exemption in this case.",
        "C": "A college degree is not an exam exemption.",
        "D": "A filed bond does not replace the exam."
      },
      "source_reference": "Louisiana Revised Statutes §35:191(C)(3)(c), https://www.legis.la.gov/Legis/Law.aspx?d=92603; Louisiana Secretary of State Notary FAQ.",
      "last_verified_at": "2026-11-19"
    }
  },
  "la-005": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A first-time nonattorney applicant seeks a regular Louisiana notary commission. What is the statutory bond amount as of November 2026?",
      "option_a": "$10,000.",
      "option_b": "$15,000.",
      "option_c": "$50,000.",
      "option_d": "The applicant may use an errors-and-omissions policy instead of posting a bond.",
      "correct_option": "C",
      "explanation": "Act 258 raised the bond requirement to $50,000 and removed errors-and-omissions insurance as a substitute, effective February 1, 2026. An ordinary nonattorney can use an authorized surety bond or a qualifying personal surety. Louisiana attorney-notaries have a separate general bond exemption under §35:72.",
      "option_feedback": {
        "A": "The former $10,000 amount was superseded on February 1, 2026.",
        "B": "The Louisiana statute does not set a $15,000 amount for this applicant.",
        "C": "Correct. Section 35:71 sets the ordinary bond at $50,000.",
        "D": "The amendment removed the option to substitute an errors-and-omissions policy."
      },
      "source_reference": "Louisiana Revised Statutes §§35:71(A), 35:72 and 35:192, as applicable; 2025 Act 258 (effective February 1, 2026), https://www.legis.la.gov/legis/ViewDocument.aspx?d=1425568.",
      "last_verified_at": "2026-11-19"
    }
  },
  "la-089": {
    "version": 2,
    "previousReviewedDate": "2026-11-12",
    "fields": {
      "question_text": "A financial mandatary wants to stop a 74-year-old principal’s adult child from making reasonable visits. The mandate grants general financial authority only, and no court has approved the restriction. What does Louisiana Civil Code article 2995 require?",
      "option_a": "General financial authority alone permits the mandatary to stop the visits.",
      "option_b": "The mandatary needs prior court approval based on good cause unless the principal granted express authority under article 2997(7).",
      "option_c": "The rule depends on the mandatary’s age rather than the principal’s age.",
      "option_d": "A notarial stamp can substitute for the court’s approval.",
      "correct_option": "B",
      "explanation": "For a principal over age 18, article 2995 bars a mandatary from limiting reasonable visits without prior court approval based on good cause unless the mandatary has express authority under article 2997(7). An adult child is within the covered relatives, and general financial authority alone is insufficient.",
      "option_feedback": {
        "A": "General financial authority alone does not authorize this restriction.",
        "B": "Correct. The mandatary needs prior approval on a showing of good cause unless the principal expressly granted the statutory authority.",
        "C": "Article 2995 specifies the principal’s age, not the mandatary’s.",
        "D": "A notarial stamp does not supply a court order."
      },
      "source_reference": "Louisiana Civil Code arts. 2995 and 2997(7), Louisiana State Legislature. https://www.legis.la.gov/legis/Law.aspx?d=110032 and https://www.legis.la.gov/legis/Law.aspx?d=110034.",
      "last_verified_at": "2026-11-19"
    }
  }
};
