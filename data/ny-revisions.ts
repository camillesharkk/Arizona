import type { NyRow } from './ny-batch2';
// Substantive replacements retain IDs and access levels; see question-revisions.ts.
export const nyRevisedRows: NyRow[] = [
  {
    "id": "ny-053",
    "study": "exam-day",
    "topic": "commission",
    "difficulty": "hard",
    "free": true,
    "text": "A Unified Court System clerk obtained the position through the specified Civil Service promotional examination in the court-clerk title series. Which qualifying route does the FAQ recognize?",
    "options": [
      "Appointment without the notary examination, while the application fee remains",
      "Automatic commissioning of every court employee",
      "Waiver only after the clerk becomes an attorney",
      "A lifetime commission without application"
    ],
    "correct": 0,
    "why": "The exemption covers the described court clerk and appointment route, not all court staff.",
    "miss": [
      "Correct. The exemption covers the described court clerk and appointment route, not all court staff.",
      "The FAQ requires the specified clerk qualification; it does not automatically appoint court employees.",
      "This is a separate qualifying route from New York bar membership.",
      "The exemption does not remove the application or commission term."
    ],
    "source": "New York DOS, FAQ, General FAQs: Who is exempt for taking the notary public examination?; https://dos.ny.gov/notary-public-frequently-asked-questions; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-057",
    "study": "appointment",
    "topic": "commission",
    "difficulty": "hard",
    "free": false,
    "text": "An applicant is concerned that the residence address on the application may be disclosed under FOIL. What option does the FAQ describe?",
    "options": [
      "Also supply a business address for disclosure purposes",
      "Omit every address from the application",
      "Demand that a notary commission make all records confidential",
      "Use a fictitious residence address"
    ],
    "correct": 0,
    "why": "The FAQ allows an additional business address for disclosure purposes when the applicant does not want the residence address released.",
    "miss": [
      "Correct. The FAQ allows an additional business address for disclosure purposes when the applicant does not want the residence address released.",
      "The disclosure option does not eliminate application address requirements.",
      "Appointment does not create blanket confidentiality.",
      "The FAQ does not authorize false application information."
    ],
    "source": "New York DOS, FAQ, General FAQs: In addition to my residence address, should I provide you with my business address on my notary application?; https://dos.ny.gov/notary-public-frequently-asked-questions; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-060",
    "study": "electronic",
    "topic": "journals",
    "difficulty": "hard",
    "free": false,
    "text": "An electronic-session recording includes a spoken credential-type description but also displays personally identifiable information. What does Part 182.8(b) require about that recording?",
    "options": [
      "Include the required act and credential-type description without discussion or display of personally identifiable information",
      "Publish the identification document in the recording",
      "Omit the entire notarial act to protect privacy",
      "Replace the recording with only a written journal"
    ],
    "correct": 0,
    "why": "The rule requires the complete act, required signatures and verbal credential-type description, while excluding discussion or display of personally identifiable information. The workflow must satisfy both the recording and identity-verification duties.",
    "miss": [
      "Correct. The rule requires the complete act, required signatures and verbal credential-type description, while excluding discussion or display of personally identifiable information. The workflow must satisfy both the recording and identity-verification duties.",
      "The rule does not authorize recording or publishing personally identifiable information.",
      "Privacy must be handled without omitting the required act.",
      "A journal does not replace the required recording."
    ],
    "source": "New York DOS, 19 NYCRR 182.8(b), p.18; https://dos.ny.gov/notary-public-license-law-0; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-062",
    "study": "appointment",
    "topic": "jurats",
    "difficulty": "hard",
    "free": false,
    "text": "During an ordinary in-person act, the notary is not satisfied that the principal has capacity or is signing knowingly and voluntarily. Is refusal authority limited to electronic notaries?",
    "options": [
      "No; Part 182.3(b) permits refusal on these grounds for ordinary notaries too",
      "Yes; an ordinary notary must proceed despite these concerns",
      "No; every refusal for any reason is automatically authorized",
      "Yes; only a court may stop the act"
    ],
    "correct": 0,
    "why": "Part 182.3(b) permits a notary to refuse when not satisfied of capacity or knowing, voluntary signing. Section 182.3(a)(6) separately requires refusal when its requirements are unmet. The handbook's general request-to-officiate note is not an instruction to ignore these safeguards. Criminal liability under Penal Law 195.00 requires its knowledge and benefit-related intent elements; refusal alone does not establish every element.",
    "miss": [
      "Correct. Part 182.3(b) permits a notary to refuse when not satisfied of capacity or knowing, voluntary signing. Section 182.3(a)(6) separately requires refusal when its requirements are unmet. The handbook's general request-to-officiate note is not an instruction to ignore these safeguards. Criminal liability under Penal Law 195.00 requires its knowledge and benefit-related intent elements; refusal alone does not establish every element.",
      "The general regulation also applies to ordinary notaries.",
      "Specific refusal grounds do not authorize arbitrary refusal of every proper request.",
      "The regulation gives the notary refusal authority on the stated grounds."
    ],
    "source": "New York DOS, 19 NYCRR 182.3(a)(6),(b), p.16; Penal Law 195.00 and request-to-officiate note, p.15; https://dos.ny.gov/notary-public-license-law-0; verified 2026-11-09",
    "verified": "2026-11-09"
  },
  {
    "id": "ny-064",
    "study": "exam-day",
    "topic": "commission",
    "difficulty": "medium",
    "free": true,
    "text": "A candidate arrives for the written exam with a current IDNYC card bearing a photograph and signature. What does the published 2026 examination information say about that credential?",
    "options": [
      "IDNYC is among the listed acceptable current photo/signature identification documents",
      "Only a New York driver's license is accepted",
      "Any expired card is equally acceptable",
      "The exam fee receipt replaces identification"
    ],
    "correct": 0,
    "why": "The examination sheet lists IDNYC among acceptable current government-issued photo/signature credentials. Exam admission requirements are distinct from identification alternatives for a notarial act.",
    "miss": [
      "Correct. IDNYC is expressly listed, subject to the current photo/signature requirement.",
      "The list includes several credentials besides a driver's license.",
      "The sheet requires current identification.",
      "A fee receipt does not identify the candidate."
    ],
    "source": "New York DOS, July-December 2026 examination information, What to Bring item 1; https://dos.ny.gov/system/files/documents/2026/06/july-dec-2026-notary-written-exam-info-and-schedule_0.pdf; reviewed 2026-11-09",
    "verified": "2026-11-09"
  }
];
