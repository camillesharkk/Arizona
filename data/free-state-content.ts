import type { FreeStateContent } from '../lib/free-state-content';
import type { FreeStateCode } from '../lib/free-state-catalog';

export const freeStateContent: Partial<Record<FreeStateCode, FreeStateContent>> = {
  "AR": {
    "code": "AR",
    "name": "Arkansas",
    "slug": "arkansas",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "An online multiple-choice exam forms part of the traditional commission application. Complete the county oath and state filing before acting.",
    "training": "Traditional applicants must review Arkansas notary law. The Secretary of State offers optional free training. Separate eNotary training is mandatory for electronic commissions.",
    "assessment": "The Secretary of State FAQ describes 30 questions with 24 correct required. The handbook confirms an 80% passing score. No official time limit was verified.",
    "steps": [
      "Review eligibility and obtain a $7,500 surety bond.",
      "Create a BCS portal account, pass the linked exam, and retain the completion certificate.",
      "Complete the online application with matching names, upload the bond and exam certificate, electronically sign, and pay.",
      "After approval, print two oath certificates and take them with the bond to the county recorder of deeds for the oath and recording.",
      "Return the recorded oath to the Secretary of State by mail or in person. Wait until it is processed and the commission is active.",
      "Obtain the official seal before performing acts."
    ],
    "exceptions": [
      "Eligible adjoining-state residents employed or operating a business in Arkansas may apply.",
      "A nonresident military spouse employed or operating a business in Arkansas should contact the Secretary of State about the special application route."
    ],
    "renewal": "Traditional commissions run for ten years. The July 2026 portal guide permits renewal when the commission is expired or within 60 days of expiration. Renewal requires a new bond and exam certificate.",
    "ron": "First hold a traditional commission in good standing, then apply for an electronic commission and complete the separate training and exam. Use an approved RON provider while physically in Arkansas. Electronic notaries complete refresher training every two years.",
    "officialNext": {
      "label": "Arkansas notary instructions and filing portal",
      "url": "https://www.sos.arkansas.gov/business-commercial-services-bcs/notary-e-notary/"
    },
    "sources": [
      {
        "id": "ar-guide",
        "title": "BCS Notary and Apostille Filing Module User Guide, July 2026",
        "url": "https://www.sos.arkansas.gov/uploads/bcs/NOTARYAPOSTILLECustomerManual_(July_2026).pdf",
        "reference": "New application pp. 9–13, renewal pp. 14–18",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ar-handbook",
        "title": "Arkansas Notary Public & eNotary Handbook",
        "url": "https://www.sos.arkansas.gov/uploads/bcs/NotaryHandbook2025.pdf",
        "reference": "Qualification, application, supplies, journals",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ar-faq",
        "title": "Secretary of State notary FAQs",
        "url": "https://www.sos.arkansas.gov/frequently-asked-questions",
        "reference": "Notary FAQs",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ar-ron",
        "title": "Secretary of State eNotary and RON instructions",
        "url": "https://sos.arkansas.gov/business-commercial-services-bcs/enotary/",
        "reference": "RON Act 1047 at a glance, eNotary registration",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ar-entry",
        "title": "Secretary of State notary services",
        "url": "https://www.sos.arkansas.gov/business-commercial-services-bcs/notary-e-notary/",
        "reference": "Military spouse instructions and application links",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 30,
      "minutes": null,
      "passing": "80% (24 of 30)",
      "credential": "Certificate of Arkansas Notary Exam Completion"
    },
    "difference": "The July 2026 portal guide describes electronic application submission and later physical filing of the recorded oath. Older FAQs describe mailing the application and also contain obsolete RON statements. Follow the current portal guide and dedicated RON page.",
    "topics": [
      {
        "id": "commission",
        "label": "Application and activation"
      },
      {
        "id": "identification",
        "label": "Appearance and identity"
      },
      {
        "id": "journals",
        "label": "Records and equipment"
      },
      {
        "id": "seals-fees",
        "label": "Seal requirements"
      },
      {
        "id": "copy-certification",
        "label": "Vital records"
      },
      {
        "id": "prohibited-acts",
        "label": "Impartiality"
      },
      {
        "id": "electronic-ron",
        "label": "Electronic and remote acts"
      }
    ],
    "questions": [
      {
        "id": "ar-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Nora passed the exam and uploaded her bond. May she notarize immediately?",
        "options": [
          "Yes, after payment",
          "Yes, with a receipt",
          "After the recorded oath is processed",
          "After ordering a seal"
        ],
        "answer": "C",
        "explanation": "The commission becomes active after the state processes the recorded oath.",
        "feedback": [
          "Payment alone is insufficient.",
          "A receipt does not activate a commission.",
          "Correct. Complete the county and state oath filings.",
          "Purchasing equipment does not activate authority."
        ],
        "sourceId": "ar-guide",
        "reference": "p. 13, Record and submit oaths"
      },
      {
        "id": "ar-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An applicant has a $5,000 bond. What must change?",
        "options": [
          "Obtain a $7,500 bond",
          "Buy a second seal",
          "Take the exam twice",
          "Pay a journal fee"
        ],
        "answer": "A",
        "explanation": "Arkansas requires a $7,500 surety bond.",
        "feedback": [
          "Correct. Submit the required bond amount.",
          "A seal cannot replace the bond.",
          "Repeat testing does not correct the bond.",
          "A journal fee cannot correct the bond."
        ],
        "sourceId": "ar-guide",
        "reference": "p. 11, Required documents"
      },
      {
        "id": "ar-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A renewing notary assumes experience excuses the exam. What does the renewal guide require?",
        "options": [
          "Only an old seal",
          "An exam completion certificate",
          "Only a driver's license",
          "No supporting documents"
        ],
        "answer": "B",
        "explanation": "Renewal requires an exam certificate and a new qualifying bond.",
        "feedback": [
          "The old seal does not replace documents.",
          "Correct. Upload the exam certificate.",
          "Identification alone is insufficient.",
          "The guide requires supporting documents."
        ],
        "sourceId": "ar-guide",
        "reference": "p. 16, Renewal required documents"
      },
      {
        "id": "ar-004",
        "topic": "identification",
        "studyTopic": "identification",
        "stem": "A stranger presents no convincing evidence of identity. What should the Arkansas notary do?",
        "options": [
          "Trust a business card",
          "Ask the stranger to promise",
          "Stamp first",
          "Establish satisfactory identity before acting"
        ],
        "answer": "D",
        "explanation": "The notary must satisfactorily establish the signer's identity.",
        "feedback": [
          "A business card alone may not prove identity.",
          "A promise alone does not establish identity.",
          "Resolve identity before notarizing.",
          "Correct. Government photo-and-signature ID is recommended."
        ],
        "sourceId": "ar-faq",
        "reference": "What qualifies as proper identification?"
      },
      {
        "id": "ar-005",
        "topic": "copy-certification",
        "studyTopic": "copy-certification",
        "stem": "A parent asks for a notary-certified copy of a child's birth certificate. What is appropriate?",
        "options": [
          "Certify it after comparing",
          "Use a jurat instead",
          "Refer to the vital-records authority",
          "Certify it without a fee"
        ],
        "answer": "C",
        "explanation": "Arkansas notaries cannot certify copies of birth certificates.",
        "feedback": [
          "Comparison does not authorize certification.",
          "Changing the certificate does not create authority.",
          "Correct. Obtain the official copy from vital records.",
          "A free service still requires authority."
        ],
        "sourceId": "ar-faq",
        "reference": "Copied and notarized birth certificate FAQ"
      },
      {
        "id": "ar-006",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "An Arkansas traditional notary wants a record of acts for later testimony. Which statement is accurate?",
        "options": [
          "A journal is recommended",
          "A journal is forbidden",
          "Only employers may keep one",
          "Each entry must go to the state"
        ],
        "answer": "A",
        "explanation": "The handbook recommends a journal for traditional acts.",
        "feedback": [
          "Correct. It can help reconstruct an act.",
          "The handbook encourages it.",
          "The notary may maintain the journal.",
          "Routine submission is not required."
        ],
        "sourceId": "ar-handbook",
        "reference": "p. 8, Notary register or journal"
      },
      {
        "id": "ar-007",
        "topic": "seals-fees",
        "studyTopic": "seals-fees",
        "stem": "A supplier proposes an Arkansas notary seal bearing the state outline. What should the notary do?",
        "options": [
          "Accept if blue",
          "Remove the prohibited outline",
          "Accept if embossed",
          "Add the Great Seal"
        ],
        "answer": "B",
        "explanation": "The official seal may contain neither the state outline nor the Great Seal.",
        "feedback": [
          "Ink color does not cure prohibited content.",
          "Correct. Use only authorized seal content.",
          "Embossing does not cure prohibited content.",
          "The Great Seal is also prohibited."
        ],
        "sourceId": "ar-handbook",
        "reference": "p. 7, Seal of office"
      },
      {
        "id": "ar-008",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "An Arkansas eNotary travels to Tennessee and receives a RON request. What is required?",
        "options": [
          "Use any video app",
          "Use an Arkansas mailing address",
          "Proceed with consent",
          "Be physically in Arkansas"
        ],
        "answer": "D",
        "explanation": "An Arkansas RON notary must be physically within Arkansas.",
        "feedback": [
          "Approved technology is required.",
          "A mailing address cannot establish physical location.",
          "Consent cannot remove the location rule.",
          "Correct. Return to Arkansas before acting."
        ],
        "sourceId": "ar-ron",
        "reference": "RON Act 1047 at a glance"
      },
      {
        "id": "ar-009",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "A traditional Arkansas notary wants an electronic commission. What comes first?",
        "options": [
          "Good-standing traditional commission",
          "A social media profile",
          "A second paper seal",
          "A county exemption"
        ],
        "answer": "A",
        "explanation": "Electronic applicants must first be traditional notaries in good standing.",
        "feedback": [
          "Correct. Then follow electronic application and training.",
          "A profile does not establish eligibility.",
          "Another seal does not create electronic authority.",
          "The published process offers no such exemption."
        ],
        "sourceId": "ar-ron",
        "reference": "eNotary Registration, Step 1"
      },
      {
        "id": "ar-010",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "Owen is asked to notarize his own signature in Little Rock. What should he do?",
        "options": [
          "Charge no fee",
          "Use a different pen",
          "Have another qualified notary act",
          "Record it twice"
        ],
        "answer": "C",
        "explanation": "A notary cannot notarize their own signature.",
        "feedback": [
          "Waiving a fee does not remove the conflict.",
          "A different pen does not create impartiality.",
          "Correct. Another qualified notary must perform the act.",
          "Extra entries do not remove the conflict."
        ],
        "sourceId": "ar-faq",
        "reference": "Can I notarize my own signature?"
      }
    ]
  },
  "CO": {
    "code": "CO",
    "name": "Colorado",
    "slug": "colorado",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "Complete approved training and the Secretary of State's online, open-book exam before filing the commission application.",
    "training": "New applicants complete approved notary training. Free Secretary of State eLearning is available. Training and exam completion must fall within 90 days before application.",
    "assessment": "The Secretary of State administers an online open-book examination. Official question count, time limit and passing score were not verified in the opened public instructions.",
    "steps": [
      "Confirm eligibility and complete approved training.",
      "Pass the Secretary of State examination within 90 days before filing.",
      "Complete and notarize the official affirmation, prepare acceptable identification and training/exam certificates, and apply online with the filing fee.",
      "After approval, print the commission certificate and obtain the required official stamp and journal before performing acts."
    ],
    "exceptions": [
      "A Colorado place of employment or practice can establish the required state connection for a nonresident.",
      "A commission expired for more than 30 days falls within the rules' definition of a new applicant."
    ],
    "renewal": "Commissions last four years. Renewal may be filed up to 90 days before expiration. Complete approved renewal training and the state exam within 90 days before renewal and submit the supporting documents.",
    "ron": "An active Colorado notary completes separate remote-notary training and exam, applies through the notary account, obtains approval, and uses an approved provider. Remote acts require real-time communication and recording.",
    "officialNext": {
      "label": "Colorado official training and exam",
      "url": "https://www.coloradosos.gov/pubs/notary/notaryTraining.html"
    },
    "sources": [
      {
        "id": "co-rules",
        "title": "Colorado Notary Program Rules, 8 CCR 1505-11",
        "url": "https://www.sos.state.co.us/pubs/rule_making/CurrentRules/8CCR1505-11Notary.pdf",
        "reference": "Rules 1.9 and 2.1",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "co-apply",
        "title": "Colorado applying and renewing FAQs",
        "url": "https://www.coloradosos.gov/pubs/notary/FAQ/apply.html",
        "reference": "Q1–Q8",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "co-training",
        "title": "Colorado Notary Public Training",
        "url": "https://www.coloradosos.gov/pubs/notary/notaryTraining.html",
        "reference": "State eLearning and approved vendors",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "co-duties",
        "title": "Colorado powers and duties FAQs",
        "url": "https://www.coloradosos.gov/pubs/notary/FAQ/duties.html",
        "reference": "Q3–Q7",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "co-seals",
        "title": "Colorado official stamps and journals FAQs",
        "url": "https://www.coloradosos.gov/pubs/notary/FAQ/seals.html",
        "reference": "Q4 and Q7–Q8",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "co-fees",
        "title": "Colorado fees FAQs",
        "url": "https://www.coloradosos.gov/pubs/notary/FAQ/fees.html",
        "reference": "Q1–Q4",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "co-remote",
        "title": "Colorado remote notarization FAQs",
        "url": "https://www.coloradosos.gov/pubs/notary/FAQ/remote.html",
        "reference": "Q1–Q7",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": null,
      "credential": "Secretary of State notary exam certificate"
    },
    "difference": "Colorado requires approved training and a state-administered open-book examination before the online application. Remote-notary qualification adds a separate training, exam and approval process.",
    "topics": [
      {
        "id": "commission",
        "label": "Training and application"
      },
      {
        "id": "identification",
        "label": "Identity evidence"
      },
      {
        "id": "acknowledgments",
        "label": "Acknowledgments"
      },
      {
        "id": "journals",
        "label": "Records"
      },
      {
        "id": "seals-fees",
        "label": "Stamps and fees"
      },
      {
        "id": "electronic-ron",
        "label": "Remote acts"
      }
    ],
    "questions": [
      {
        "id": "co-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Elena completed Colorado training 120 days before filing. What should she do?",
        "options": [
          "Reuse it forever",
          "Obtain timely training and exam completion",
          "Only renew her ID",
          "Ask her employer to waive it"
        ],
        "answer": "B",
        "explanation": "Training and examination must be completed within 90 days before application.",
        "feedback": [
          "The rules impose a 90-day window.",
          "Correct. Both qualifications must be timely.",
          "Identification does not renew training.",
          "An employer cannot waive the rule."
        ],
        "sourceId": "co-rules",
        "reference": "Rule 2.1.3"
      },
      {
        "id": "co-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Colorado notary seeks renewal. Which preparation is required?",
        "options": [
          "No training",
          "Only a new stamp",
          "Only an old exam certificate",
          "Renewal training and the state exam"
        ],
        "answer": "D",
        "explanation": "The rules require renewal training and examination within 90 days before renewal.",
        "feedback": [
          "Experience does not waive training.",
          "Equipment alone is insufficient.",
          "The exam must meet the current window.",
          "Correct. Complete both requirements."
        ],
        "sourceId": "co-rules",
        "reference": "Rule 2.1.4"
      },
      {
        "id": "co-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Wyoming resident regularly works in Denver. Can that connection support Colorado eligibility?",
        "options": [
          "Yes, a Colorado employment location qualifies",
          "No, only home ownership qualifies",
          "Only after ten years",
          "Only for RON"
        ],
        "answer": "A",
        "explanation": "A Colorado place of employment or practice can satisfy the state-connection requirement.",
        "feedback": [
          "Correct. Other eligibility conditions still apply.",
          "Home ownership is not the stated requirement.",
          "No ten-year condition is stated.",
          "This applies to ordinary commission eligibility."
        ],
        "sourceId": "co-apply",
        "reference": "Q1, Who can become a notary public?"
      },
      {
        "id": "co-004",
        "topic": "acknowledgments",
        "studyTopic": "acknowledgments",
        "stem": "A signer already signed a deed and now appears before a Colorado notary. What may an acknowledgment involve?",
        "options": [
          "Witnessing yesterday's signing",
          "Backdating the certificate",
          "Identifying the signer and taking acknowledgment",
          "Skipping personal appearance"
        ],
        "answer": "C",
        "explanation": "An acknowledgment can cover an earlier signature when the signer appears and acknowledges it.",
        "feedback": [
          "The notary cannot claim to witness an unseen signing.",
          "Use the actual act date.",
          "Correct. Earlier signing can be acknowledged.",
          "The signer must appear through an authorized method."
        ],
        "sourceId": "co-duties",
        "reference": "Q3, Acknowledgment"
      },
      {
        "id": "co-005",
        "topic": "identification",
        "studyTopic": "identification",
        "stem": "A Colorado signer presents government ID expired eight months ago with a photograph. How does ordinary ID timing apply?",
        "options": [
          "Any expiration defeats it",
          "It can meet the one-year expiration allowance",
          "Only a passport qualifies",
          "It must have both photo and signature"
        ],
        "answer": "B",
        "explanation": "Ordinary Colorado ID may be expired one year or less and contain a photograph or signature.",
        "feedback": [
          "There is a one-year allowance.",
          "Correct. Assess the remaining identity requirements.",
          "Other government-issued ID can qualify.",
          "The rule accepts photograph or signature."
        ],
        "sourceId": "co-duties",
        "reference": "Q6, Satisfactory evidence"
      },
      {
        "id": "co-006",
        "topic": "seals-fees",
        "studyTopic": "seals-fees",
        "stem": "A supplier offers a round embosser for Colorado notarizations. What is required?",
        "options": [
          "Any round seal",
          "Only an embossing seal",
          "A rectangular ink stamp",
          "A handwritten logo"
        ],
        "answer": "C",
        "explanation": "Colorado requires a rectangular ink stamp with a border.",
        "feedback": [
          "A round seal does not meet the requirement.",
          "Embossers cannot serve as the official stamp.",
          "Correct. Include the prescribed information.",
          "A logo cannot replace the stamp."
        ],
        "sourceId": "co-seals",
        "reference": "Q4, Acceptable stamps"
      },
      {
        "id": "co-007",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "Maya's Colorado employer keeps no record containing the required journal information. What must Maya do?",
        "options": [
          "Maintain the required journal",
          "Rely on memory",
          "Wait for a complaint",
          "Keep only receipts"
        ],
        "answer": "A",
        "explanation": "The employer-record exception is unavailable when its conditions are absent.",
        "feedback": [
          "Correct. Record the notarial acts.",
          "Memory cannot replace a required journal.",
          "Recordkeeping applies when the act occurs.",
          "Receipts omit required journal information."
        ],
        "sourceId": "co-seals",
        "reference": "Q7–Q8, Journal requirement"
      },
      {
        "id": "co-008",
        "topic": "seals-fees",
        "studyTopic": "seals-fees",
        "stem": "A Colorado notary proposes a $20 notarial fee for one ordinary paper document. What is the maximum?",
        "options": [
          "$5",
          "$25",
          "$20",
          "$15"
        ],
        "answer": "D",
        "explanation": "The maximum ordinary notarial fee is $15 per document.",
        "feedback": [
          "The published maximum is higher.",
          "$25 applies to electronic or remote notarization.",
          "$20 exceeds the ordinary limit.",
          "Correct. Other service charges require proper disclosure."
        ],
        "sourceId": "co-fees",
        "reference": "Q1, Fees"
      },
      {
        "id": "co-009",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "An active Colorado notary buys RON software. What else is required before remote acts?",
        "options": [
          "A social media announcement",
          "Remote training, exam and state approval",
          "Only the vendor invoice",
          "Only a paper journal"
        ],
        "answer": "B",
        "explanation": "Active notaries must separately qualify and obtain remote-notary approval.",
        "feedback": [
          "Advertising does not authorize RON.",
          "Correct. Follow the remote application process.",
          "Payment to a vendor does not confer approval.",
          "A paper journal alone cannot qualify the notary."
        ],
        "sourceId": "co-remote",
        "reference": "Q1–Q2, Remote approval"
      },
      {
        "id": "co-010",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "A Colorado customer sends a prerecorded signing video. May the remote notary use it to perform the act?",
        "options": [
          "Yes, if clear",
          "Yes, with two witnesses",
          "No, real-time communication is required",
          "Yes, if stored ten years"
        ],
        "answer": "C",
        "explanation": "Remote participants must see and hear one another substantially simultaneously.",
        "feedback": [
          "Video quality does not supply real-time interaction.",
          "Witnesses cannot replace the required interaction.",
          "Correct. Conduct an authorized live session.",
          "Retention cannot cure an invalid appearance."
        ],
        "sourceId": "co-remote",
        "reference": "Q6, Previously taped recordings"
      }
    ]
  },
  "IL": {
    "code": "IL",
    "name": "Illinois",
    "slug": "illinois",
    "group": "courseQuiz",
    "processKind": "Approved course",
    "summary": "Ordinary first applicants complete a certified three-hour course and its final examination before submitting their commission application.",
    "training": "Complete at least 180 instructional minutes with a Secretary of State-certified provider. Confirm the course scope if seeking electronic authority, because a provider may offer a course limited to traditional notarization.",
    "assessment": "The provider final contains 50 randomized questions. Questions may be multiple-choice, true/false, or both, with no more than half true/false. The required score is at least 85%. No uniform exam time limit was verified.",
    "steps": [
      "Confirm resident or qualifying nonresident eligibility.",
      "Complete the certified course and pass the final examination. Apply within two years after the examination.",
      "Obtain the regular $5,000 notary bond and complete the application and required oath of office on the bond form.",
      "Illinois residents apply online with ID, the course completion certificate and bond documents. Qualifying nonresidents apply on paper.",
      "Wait for approval and obtain the official notary seal before acting. Maintain the required journal except for statutory exempt acts."
    ],
    "exceptions": [
      "Residents with an approved hardship exemption may use a paper application.",
      "A renewal-only education/examination exemption is available to qualifying attorneys, judges and employees of qualifying attorneys or courts who submit the prescribed signed statement.",
      "Nonresident eligibility has additional state-connection requirements and uses a paper application."
    ],
    "renewal": "Resident commissions generally last four years and nonresident commissions one year. The online instructions advertise renewal 90 days before expiration, while published Rule 176.350 says 60 days. Confirm the available filing window in the official portal. Education and examination generally apply, with the specified exemption for qualifying renewals. Expiration ends authority without a grace period.",
    "ron": "Illinois distinguishes remote paper acts under §6-102.5 from electronic notarization under Article VI-A. Electronic-record RON requires an electronic-notary commission and approved system provider. The application lists $30,000 bonding for remote audio-video or remote electronic work. Follow the instructions for the intended act type.",
    "officialNext": {
      "label": "Illinois official notary application instructions",
      "url": "https://www.ilsos.gov/departments/index/notary/online-notary.html"
    },
    "sources": [
      {
        "id": "il-rules",
        "title": "Illinois Register, June 16, 2023, adopted Part 176 rules",
        "url": "https://www.ilsos.gov/content/dam/departments/index/register/volume47/register_volume47_24.pdf",
        "reference": "§§176.225, 176.235 and 176.350, printed pp. 8674–8678 and 8687",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "il-2025",
        "title": "Illinois Register, January 10, 2025, adopted notary amendments",
        "url": "https://www.ilsos.gov/content/dam/departments/index/register/volume49/register_volume49_2.pdf",
        "reference": "49 Ill. Reg. 584, §176.205(e), printed p. 594",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "il-apply",
        "title": "Illinois online notary application instructions",
        "url": "https://www.ilsos.gov/departments/index/notary/online-notary.html",
        "reference": "Resident/nonresident filing, certificates and renewal",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "il-services",
        "title": "Illinois Secretary of State notary services",
        "url": "https://www.ilsos.gov/departments/index/notary.html",
        "reference": "Bond, activation and expiration",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "il-handbook",
        "title": "Illinois Notary Public Handbook",
        "url": "https://www.ilsos.gov/publications/pdf_publications/ipub16.pdf",
        "reference": "5 ILCS 312, §§3-107, 6-102, 6-104 and FAQ",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 50,
      "minutes": null,
      "passing": "At least 85%",
      "credential": "Approved provider course/examination completion certificate"
    },
    "difference": "The assessment is the certified course's final examination. A qualifying renewal applicant may use the education exemption effective January 1, 2025. The 180 minutes describe instructional time. The online renewal page advertises a 90-day window while published Rule 176.350 says 60 days.",
    "topics": [
      {
        "id": "commission",
        "label": "Course and commission"
      },
      {
        "id": "identification",
        "label": "Unexpired ID"
      },
      {
        "id": "jurats",
        "label": "Oaths and affirmations"
      },
      {
        "id": "journals",
        "label": "Journal custody and exceptions"
      },
      {
        "id": "prohibited-acts",
        "label": "Self-notarization"
      },
      {
        "id": "electronic-ron",
        "label": "Electronic commission"
      }
    ],
    "questions": [
      {
        "id": "il-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A first-time Illinois applicant works for a lawyer. Does the renewal education exemption excuse the first application?",
        "options": [
          "Yes, all law-firm staff qualify",
          "Only with an employer letter",
          "No, the exception concerns qualifying renewals",
          "Yes, after buying a bond"
        ],
        "answer": "C",
        "explanation": "The specified education exemption applies to qualifying renewal applicants.",
        "feedback": [
          "Employment alone does not waive first-time education.",
          "An employer letter cannot expand the exemption.",
          "Correct. First applicants complete the required course and exam.",
          "The bond is a separate requirement."
        ],
        "sourceId": "il-2025",
        "reference": "§176.205(e), adopted effective January 1, 2025"
      },
      {
        "id": "il-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An Illinois attorney seeks renewal using the education exemption. What must accompany the exemption?",
        "options": [
          "Only a business card",
          "The prescribed signed statement of eligibility and law review",
          "Only an old stamp",
          "Nothing"
        ],
        "answer": "B",
        "explanation": "Qualifying renewals require the designated statement confirming eligibility and current-law understanding.",
        "feedback": [
          "A business card is not the prescribed statement.",
          "Correct. Follow the designated form requirements.",
          "A stamp does not establish the exemption.",
          "The signed statement is required."
        ],
        "sourceId": "il-2025",
        "reference": "§176.205(e)"
      },
      {
        "id": "il-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An Illinois resident has course and bond documents but no hardship exemption. How should the application be filed?",
        "options": [
          "Only in person",
          "Only by fax",
          "Any private training portal",
          "Through the state's online application"
        ],
        "answer": "D",
        "explanation": "Residents generally must use the state's online application.",
        "feedback": [
          "The published general route is online.",
          "Fax is not the stated resident route.",
          "A course provider's portal is not the state application.",
          "Correct. Attach the required documents."
        ],
        "sourceId": "il-apply",
        "reference": "Resident online filing instructions"
      },
      {
        "id": "il-004",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A new Illinois applicant paid the state fee but has no approved commission. When may notarization begin?",
        "options": [
          "After approval and obtaining the official seal",
          "Immediately after payment",
          "After a client's consent",
          "After course registration"
        ],
        "answer": "A",
        "explanation": "Approval and the official seal are prerequisites to acting.",
        "feedback": [
          "Correct. Payment alone does not confer authority.",
          "A payment receipt is insufficient.",
          "Consent cannot grant a commission.",
          "Registration is not qualification or approval."
        ],
        "sourceId": "il-services",
        "reference": "When can I start notarizing documents?"
      },
      {
        "id": "il-005",
        "topic": "identification",
        "studyTopic": "identification",
        "stem": "An Illinois signer relies solely on expired government photo-and-signature ID. What is wrong with that ID route?",
        "options": [
          "The photo must be black and white",
          "The card must be privately issued",
          "The ID must be valid at the act",
          "A signature is never relevant"
        ],
        "answer": "C",
        "explanation": "The documentary-ID route requires valid identification at the time of the act.",
        "feedback": [
          "The rule does not impose that photo style.",
          "The listed route uses governmental or consular documents.",
          "Correct. Seek another authorized identity basis.",
          "A signature is part of this documentary requirement."
        ],
        "sourceId": "il-handbook",
        "reference": "§6-102(d)(3)"
      },
      {
        "id": "il-006",
        "topic": "jurats",
        "studyTopic": "jurats",
        "stem": "An Illinois signer requests verification on oath or affirmation. What must occur beyond affixing the seal?",
        "options": [
          "The signer must make the required oath or affirmation",
          "The notary must guarantee every fact",
          "The employer must approve",
          "The signer must buy a bond"
        ],
        "answer": "A",
        "explanation": "Verification involves the signer's declaration of truth on oath or affirmation.",
        "feedback": [
          "Correct. Complete the act described by the certificate.",
          "The notary does not guarantee the document's factual truth.",
          "Employer approval cannot replace the oath.",
          "The signer does not obtain a commission bond."
        ],
        "sourceId": "il-handbook",
        "reference": "§6-101(c) and §6-102(b)"
      },
      {
        "id": "il-007",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "An Illinois notary leaves a retail employer. The journal includes acts outside employment by any attorney or law firm. The retailer demands the journal. What should the notary do?",
        "options": [
          "Leave it with payroll",
          "Retain custody as required",
          "Destroy it immediately",
          "Sell it to the employer"
        ],
        "answer": "B",
        "explanation": "For this ordinary journal, the notary retains custody after leaving employment. The special rule for journals kept solely within employment by an attorney or law firm has different ownership requirements.",
        "feedback": [
          "This retail employer has no right to take custody under the attorney or law-firm exception.",
          "Correct. The notary retains this journal under the ordinary custody rule.",
          "Termination does not end retention duties.",
          "Selling this ordinary journal to the retail employer does not satisfy the custody rule."
        ],
        "sourceId": "il-2025",
        "reference": "5 ILCS 312/3-107(d)–(e); 14 Ill. Adm. Code 176.900(f)"
      },
      {
        "id": "il-008",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "An Illinois notary notarizes a candidate's qualifying nominating petition. Which journal rule applies?",
        "options": [
          "All journals are now optional",
          "Only electronic entries are exempt",
          "The act is always void without an entry",
          "The specified candidate-document exception may apply"
        ],
        "answer": "D",
        "explanation": "Section 3-107(f) exempts the listed candidate nomination documents from journaling.",
        "feedback": [
          "The exception has a limited subject.",
          "It covers the specified acts under the statutory language.",
          "The statute preserves validity within the exception.",
          "Correct. Confirm it is a listed candidate document."
        ],
        "sourceId": "il-handbook",
        "reference": "§3-107(f)"
      },
      {
        "id": "il-009",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "An Illinois corporate officer wants to notarize the officer's own signature for the company. What is appropriate?",
        "options": [
          "Another qualified notary performs the act",
          "Proceed because it is corporate",
          "Proceed without a fee",
          "Use a second seal"
        ],
        "answer": "A",
        "explanation": "A notary may not notarize their own signature, including a corporate signature.",
        "feedback": [
          "Correct. Corporate capacity does not remove self-notarization.",
          "Corporate capacity does not create impartiality.",
          "A free act still involves the same conflict.",
          "A second seal cannot cure the conflict."
        ],
        "sourceId": "il-handbook",
        "reference": "FAQ, own signature as corporate officer"
      },
      {
        "id": "il-010",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "An active Illinois ordinary notary wants to add electronic notarization. What does the state application provide?",
        "options": [
          "Automatic authority from course attendance",
          "Only a paper-journal purchase",
          "An electronic-notary application with provider and signature information",
          "A change to the client's address"
        ],
        "answer": "C",
        "explanation": "The application supports adding electronic authority and requires provider and electronic-signature information.",
        "feedback": [
          "Training alone does not create electronic authority.",
          "Equipment purchase is insufficient.",
          "Correct. Complete the state's electronic qualification process.",
          "The client's address does not qualify the notary."
        ],
        "sourceId": "il-apply",
        "reference": "To Add an Electronic Notary to Your Commission"
      }
    ]
  },
  "MD": {
    "code": "MD",
    "name": "Maryland",
    "slug": "maryland",
    "group": "courseQuiz",
    "processKind": "Approved course",
    "summary": "New applicants complete an authorized course of study and pass its examination before applying online and taking the Circuit Court oath.",
    "training": "Complete a Maryland course from an authorized provider. The Secretary of State instructs new applicants to review the official handbook. Course delivery and scheduling are arranged with the provider.",
    "assessment": "New applicants submit the course completion certificate and the provider's Certificate of Passing. COMAR 01.02.08.16 requires at least 20 multiple-choice questions, four choices per question and at least 80% correct. Providers give immediate results and qualifying applicants an opportunity to retest. A uniform examination time limit was not verified.",
    "steps": [
      "Review eligibility and the official handbook.",
      "Complete the authorized new-applicant course and pass the examination.",
      "Prepare ID, address documentation if needed, legislative district information, three references, and both certificates.",
      "Submit the online application and pay the state application fee.",
      "After approval, appear before the designated Circuit Court clerk within 30 days of notification, take the oath, pay the clerk's fees and receive the commission.",
      "Obtain the proper stamp and journal for notarial work."
    ],
    "exceptions": [
      "A qualifying nonresident must have employment or practice in Maryland and reside in a state allowing reciprocal eligibility for Maryland residents.",
      "A commission missed by more than 30 days after expiration requires a new application and the new-applicant qualification route."
    ],
    "renewal": "Renewal requires an authorized course of study. State Government §18-102 and the renewal instructions require the examination for initial applicants. Renew from 60 days before through 30 days after expiration, then take the Circuit Court oath again.",
    "ron": "Submit the online remote-notary notification for the intended record type. Electronic-record RON uses a Maryland-authorized vendor and the state's authorization confirmation. The state also publishes a separate tangible-record remote route.",
    "officialNext": {
      "label": "Maryland new-applicant instructions",
      "url": "https://sos.maryland.gov/Notary/Pages/NewApplicant.aspx"
    },
    "sources": [
      {
        "id": "md-eligibility",
        "title": "Maryland State Government §18-102",
        "url": "https://mgaleg.maryland.gov/2026RS/Statute_Web/gsg/18-102.pdf",
        "reference": "Initial course/exam and renewal course",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-new",
        "title": "Maryland Secretary of State new-applicant instructions",
        "url": "https://sos.maryland.gov/Notary/Pages/NewApplicant.aspx",
        "reference": "Course, certificates and application",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-renew",
        "title": "Maryland Secretary of State renewal instructions",
        "url": "https://sos.maryland.gov/Notary/Pages/RenewalApplicant.aspx",
        "reference": "Course certificate and Circuit Court oath",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-providers",
        "title": "Authorized course and examination providers",
        "url": "https://sos.maryland.gov/Documents/NotaryCourseofStudyandExaminationProviders.pdf",
        "reference": "Authorized Maryland-specific courses",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-faq",
        "title": "Maryland Secretary of State notary FAQs",
        "url": "https://sos.maryland.gov/notary/pages/faq.aspx",
        "reference": "Application, oath, county and stamping-device guidance",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-conflicts",
        "title": "Maryland State Government §18-203",
        "url": "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gsg&section=18-203&enactments=false",
        "reference": "Conflict of interest",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-id",
        "title": "Maryland State Government §18-206",
        "url": "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gsg&section=18-206&enactments=false",
        "reference": "Evidence of identity",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-journal",
        "title": "Maryland State Government §18-219",
        "url": "https://mgaleg.maryland.gov/mgawebsite/Laws/StatuteText?article=gsg&section=18-219&enactments=false",
        "reference": "Journal and retention",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-fees",
        "title": "Maryland Secretary of State Notary Division",
        "url": "https://sos.maryland.gov/Notary/Pages/default.aspx",
        "reference": "Fee limits effective January 22, 2024",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-remote",
        "title": "Maryland Secretary of State remote-notary instructions",
        "url": "https://sos.maryland.gov/Notary/Pages/RemoteNotaryInfo.aspx",
        "reference": "Online notification and authorization",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-comar-exam-standards",
        "title": "COMAR 01.02.08.16 Course of Study and Examination Standards",
        "url": "https://regs.maryland.gov/us/md/exec/comar/01.02.08.16",
        "reference": "Sections E-I, provider question bank, minimum examination size, choices, passing result and immediate scoring",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "md-comar-provider",
        "title": "COMAR 01.02.08.15 Authorized Provider Responsibilities",
        "url": "https://regs.maryland.gov/us/md/exec/comar/01.02.08.15",
        "reference": "Sections D-E, completion certificate, passing certificate and retesting",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": "At least 80%",
      "credential": "Course completion certificate and examination passing certificate"
    },
    "difference": "Maryland distinguishes new applicants, who complete a course and examination, from timely renewals, which require the course. One FAQ eligibility paragraph inconsistently adds a renewal examination. The statute and dedicated renewal instructions support the distinction used here. COMAR 01.02.08.16 establishes the minimum of 20 questions and the 80% passing threshold for authorized examinations.",
    "topics": [
      {
        "id": "commission",
        "label": "Course and court oath"
      },
      {
        "id": "identification",
        "label": "Identity evidence"
      },
      {
        "id": "journals",
        "label": "Journal retention"
      },
      {
        "id": "seals-fees",
        "label": "Stamp custody and fees"
      },
      {
        "id": "prohibited-acts",
        "label": "Beneficial interests"
      },
      {
        "id": "electronic-ron",
        "label": "Remote authorization"
      }
    ],
    "questions": [
      {
        "id": "md-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A first-time Maryland applicant completed the course. What additional educational evidence is needed?",
        "options": [
          "Only an attendance receipt",
          "An examination passing certificate",
          "Only a vendor invoice",
          "Only an old out-of-state commission"
        ],
        "answer": "B",
        "explanation": "Initial applicants must pass the examination and submit its certificate.",
        "feedback": [
          "Attendance alone is insufficient.",
          "Correct. Submit both required certificates.",
          "Payment is not proof of passing.",
          "Another state's commission does not replace qualification."
        ],
        "sourceId": "md-new",
        "reference": "New applicant course and examination certificates"
      },
      {
        "id": "md-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A timely Maryland renewal applicant asks which educational step the renewal page requires. What is it?",
        "options": [
          "Only a new journal",
          "A different state's exam",
          "No study",
          "An authorized course of study"
        ],
        "answer": "D",
        "explanation": "The renewal page requires the course completion certificate.",
        "feedback": [
          "A journal is not the educational requirement.",
          "Another state's exam does not satisfy it.",
          "The course is required.",
          "Correct. Follow the dedicated renewal instructions."
        ],
        "sourceId": "md-renew",
        "reference": "How to Renew, step 2"
      },
      {
        "id": "md-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An approved Maryland applicant waits 40 days after the oath notification. What deadline was missed?",
        "options": [
          "The 30-day Circuit Court oath deadline",
          "A two-year deadline",
          "The exam's five-minute limit",
          "A 90-day seal-order deadline"
        ],
        "answer": "A",
        "explanation": "Applicants must appear for the court oath within 30 days after notification.",
        "feedback": [
          "Correct. Late appearance can cause revocation.",
          "The period is 30 days.",
          "No such exam limit was established.",
          "That is not the published oath deadline."
        ],
        "sourceId": "md-renew",
        "reference": "Renewal Application Process, step 8"
      },
      {
        "id": "md-004",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Maryland resident lives in Frederick County and works in Montgomery County. Where is the ordinary commission based?",
        "options": [
          "Either county at choice",
          "The employer's county",
          "Frederick County",
          "Any neighboring state"
        ],
        "answer": "C",
        "explanation": "Maryland residents are commissioned in their county of residence.",
        "feedback": [
          "Employment does not create that choice for a resident.",
          "The residence rule applies.",
          "Correct. The resident's home county controls.",
          "A neighboring state is not the Maryland commission county."
        ],
        "sourceId": "md-faq",
        "reference": "Can I be commissioned in the county where I work?"
      },
      {
        "id": "md-005",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "A Maryland notary's spouse is a party to a record. May that notary notarize it?",
        "options": [
          "Yes, if unpaid",
          "Yes, with a journal",
          "Yes, with a witness",
          "No, the spouse-party rule applies"
        ],
        "answer": "D",
        "explanation": "Section 18-203 prohibits acts on records to which the spouse is a party.",
        "feedback": [
          "A waived fee does not cure the conflict.",
          "A journal does not remove the conflict.",
          "A witness cannot remove the disqualification.",
          "Correct. Use another eligible officer."
        ],
        "sourceId": "md-conflicts",
        "reference": "§18-203(b)(1)"
      },
      {
        "id": "md-006",
        "topic": "identification",
        "studyTopic": "identification",
        "stem": "A Maryland signer lacks documentary ID but brings an eligible credible witness. Which safeguard is required?",
        "options": [
          "A promise by text",
          "The witness's oath or affirmation and appearance",
          "A business card only",
          "An unsigned email"
        ],
        "answer": "B",
        "explanation": "A credible witness must appear and provide verification on oath or affirmation.",
        "feedback": [
          "Text alone does not satisfy the witness route.",
          "Correct. The witness must also meet identification requirements.",
          "A business card does not satisfy the statutory route.",
          "An email cannot replace the required appearance and oath."
        ],
        "sourceId": "md-id",
        "reference": "§18-206(b)(2)"
      },
      {
        "id": "md-007",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "A Maryland notary plans to reconstruct required journal entries next month. What should change?",
        "options": [
          "Make each entry when performing the act",
          "Keep only monthly totals",
          "Wait until renewal",
          "Record only paid acts"
        ],
        "answer": "A",
        "explanation": "Entries must be contemporaneous with the notarial act.",
        "feedback": [
          "Correct. Record each act at the time.",
          "Totals omit the required individual entries.",
          "Renewal does not postpone recordkeeping.",
          "Unpaid acts also belong in the journal."
        ],
        "sourceId": "md-journal",
        "reference": "§18-219(c)(1)"
      },
      {
        "id": "md-008",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "A Maryland journal's last act was performed this week. What retention rule applies?",
        "options": [
          "One year from opening",
          "Until the stamp expires",
          "Ten years after the last recorded act",
          "Until changing jobs"
        ],
        "answer": "C",
        "explanation": "The statute sets ten-year retention from the last recorded act, with approved storage alternatives.",
        "feedback": [
          "Opening the journal does not start this period.",
          "Commission expiration does not end retention.",
          "Correct. Approved repository/storage alternatives remain available.",
          "Employment changes do not end the obligation."
        ],
        "sourceId": "md-journal",
        "reference": "§18-219(a), (f)"
      },
      {
        "id": "md-009",
        "topic": "seals-fees",
        "studyTopic": "seals-fees",
        "stem": "A Maryland notary proposes a $12 fee for one original ordinary notarial act. What is the published maximum?",
        "options": [
          "$4",
          "$8",
          "$25",
          "$30"
        ],
        "answer": "B",
        "explanation": "The original-act maximum is $8 under the current fee notice.",
        "feedback": [
          "$4 concerns additional same-time copies under the stated conditions.",
          "Correct. Apply the appropriate act and copy rules.",
          "That is not the listed original-act maximum.",
          "$30 is the remote-act maximum."
        ],
        "sourceId": "md-fees",
        "reference": "Fee notice effective January 22, 2024"
      },
      {
        "id": "md-010",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "A Maryland notary selects an unauthorized vendor for electronic-record RON. What will the state require?",
        "options": [
          "Proceed after vendor payment",
          "Use a personal video call",
          "Skip notification",
          "Correct the notification using an authorized vendor"
        ],
        "answer": "D",
        "explanation": "An unauthorized vendor results in denial of remote authorization and may be corrected by resubmission.",
        "feedback": [
          "Vendor payment does not create state authorization.",
          "Electronic-record RON follows the authorized-vendor process.",
          "The state requires online notification.",
          "Correct. Follow the state's resubmission instructions."
        ],
        "sourceId": "md-remote",
        "reference": "Process to become authorized, steps 1–4"
      }
    ]
  },
  "ME": {
    "code": "ME",
    "name": "Maine",
    "slug": "maine",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "First applicants pass the state-required examination based on the official course of study and deliver the current application to the Secretary of State.",
    "training": "Study Maine's official course covering laws, rules, procedures and ethics. The statute requires the examination and provides for the course of study. No fixed classroom attendance hours were verified.",
    "assessment": "A person without a current Maine commission must pass the Secretary of State or approved examination. Renewal uses an online examination. Current first-application question count, time limit and passing percentage were not verified.",
    "steps": [
      "Review the current course of study and eligibility rules.",
      "Obtain the current first-commission application and complete its examination and other required sections.",
      "Deliver the completed application and $50 fee to the Secretary of State using the current form instructions.",
      "After appointment, take the oath before a Dedimus Justice within 30 calendar days.",
      "Return the completed certificate of qualification within 45 calendar days of appointment and finish the commission process before acting."
    ],
    "exceptions": [
      "An out-of-state resident may qualify through a Maine place of employment or business.",
      "Maine attorneys and specified judicial officials have statutory authority as notarial officers distinct from an ordinary notary commission."
    ],
    "renewal": "The term is seven years. Use Total Notary Solution within 45 days before expiration or up to 90 days after expiration. Pass its online exam, print the documents, take the Dedimus Justice oath and return the originals. Expiration interrupts authority until qualification is completed.",
    "ron": "Submit the notice for electronic and/or remote notarization and obtain state approval. Use an approved technology provider and complete that provider's technology training. The FAQ says no additional Secretary of State test is required for this approval.",
    "officialNext": {
      "label": "Maine official application and renewal instructions",
      "url": "https://mobile.maine.gov/sos/corporations-commissions/commissions/apply-renew-a-notary"
    },
    "sources": [
      {
        "id": "me-exam",
        "title": "Maine Revised Statutes, Title 4 §1923",
        "url": "https://legislature.maine.gov/statutes/4/title4sec1923.html",
        "reference": "Examination and course of study",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-commission",
        "title": "Maine Revised Statutes, Title 4 §1922",
        "url": "https://legislature.maine.gov/statutes/4/title4sec1922.html",
        "reference": "Qualifications, oath and seven-year term",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-apply",
        "title": "Maine Secretary of State application and renewal instructions",
        "url": "https://mobile.maine.gov/sos/corporations-commissions/commissions/apply-renew-a-notary",
        "reference": "New applications and renewal documents",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-renew",
        "title": "Maine Secretary of State notary resources",
        "url": "https://mobile.maine.gov/sos/corporations-commissions/commissions/notaries-public-and-dedimus-justice/notary-public-resources",
        "reference": "Renewal examination and eligibility window",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-faq",
        "title": "Maine Secretary of State notary FAQs",
        "url": "https://www.maine.gov/sos/cec/notary/faqnp.pdf",
        "reference": "Questions 5–6, 13–19, 23–24",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-conflicts",
        "title": "Maine Revised Statutes, Title 4 §1904",
        "url": "https://legislature.maine.gov/statutes/4/title4sec1904.html",
        "reference": "Conflicts, corporate acts and petition circulators",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-id",
        "title": "Maine Revised Statutes, Title 4 §1907",
        "url": "https://legislature.maine.gov/statutes/4/title4sec1907.html",
        "reference": "Identity evidence",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-acts",
        "title": "Maine Revised Statutes, Title 4 §1905",
        "url": "https://legislature.maine.gov/statutes/4/title4sec1905.html",
        "reference": "Requirements for acts",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "me-journal",
        "title": "Maine Revised Statutes, Title 4 §1920",
        "url": "https://legislature.maine.gov/statutes/4/title4sec1920.html",
        "reference": "Journal scope and retention",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": null,
      "credential": null
    },
    "difference": "Maine's first application is delivered to the state, while renewal begins online and still requires an oath and returned originals. Since July 2023, marriage officiant is a separate office.",
    "topics": [
      {
        "id": "commission",
        "label": "Qualification and oath"
      },
      {
        "id": "identification",
        "label": "Identity evidence"
      },
      {
        "id": "copy-certification",
        "label": "Accurate copies"
      },
      {
        "id": "journals",
        "label": "Paper and remote records"
      },
      {
        "id": "prohibited-acts",
        "label": "Family and petition conflicts"
      },
      {
        "id": "electronic-ron",
        "label": "Remote approval"
      }
    ],
    "questions": [
      {
        "id": "me-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Portland applicant has no current Maine commission. What examination rule applies?",
        "options": [
          "Experience waives it",
          "Only RON applicants test",
          "A qualifying examination is required",
          "Only renewals test"
        ],
        "answer": "C",
        "explanation": "Section 1923 requires an examination for applicants without a current Maine commission.",
        "feedback": [
          "Experience alone is not the statutory exemption.",
          "The ordinary commission requires testing.",
          "Correct. Study the official course material.",
          "First applicants also must pass."
        ],
        "sourceId": "me-exam",
        "reference": "§1923(1)"
      },
      {
        "id": "me-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A New Hampshire resident operates a business in Maine. May that support eligibility?",
        "options": [
          "Yes, subject to the other qualifications",
          "Only after buying Maine property",
          "Only with an existing Maine commission",
          "No nonresident may apply"
        ],
        "answer": "A",
        "explanation": "A Maine place of employment or practice satisfies the state-connection requirement.",
        "feedback": [
          "Correct. The other qualifications still apply.",
          "Property ownership is not the stated condition.",
          "A first applicant can qualify.",
          "The law permits qualifying nonresidents."
        ],
        "sourceId": "me-commission",
        "reference": "§1922(2)(B)"
      },
      {
        "id": "me-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An appointee receives Maine qualification documents. Which oath deadline applies?",
        "options": [
          "90 days",
          "One year",
          "45 days",
          "30 calendar days from appointment"
        ],
        "answer": "D",
        "explanation": "Appear before a Dedimus Justice within 30 calendar days of appointment.",
        "feedback": [
          "That is not the ordinary oath deadline.",
          "The oath cannot wait a year.",
          "45 days is the certificate-return deadline.",
          "Correct. Track the separate return deadline too."
        ],
        "sourceId": "me-faq",
        "reference": "Q5, Certificate of Qualification"
      },
      {
        "id": "me-004",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "A Maine notary's half-sister asks the notary to notarize her signature. What should happen?",
        "options": [
          "Proceed without charging",
          "Use another qualified officer",
          "Proceed if unrelated to money",
          "Add a second witness"
        ],
        "answer": "B",
        "explanation": "Maine's family prohibition includes half relatives.",
        "feedback": [
          "A waived fee does not cure the prohibition.",
          "Correct. The relationship disqualifies this notary.",
          "The family rule is not limited to financial transactions.",
          "A witness cannot cure the conflict."
        ],
        "sourceId": "me-conflicts",
        "reference": "§1904(3)(A)"
      },
      {
        "id": "me-005",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "A Maine notary also promotes an initiative petition. May the notary administer its circulator oath?",
        "options": [
          "Yes, after logging the fee",
          "Yes, if unpaid",
          "No, the promotional role creates the statutory prohibition",
          "Yes, with campaign approval"
        ],
        "answer": "C",
        "explanation": "An officer providing nonnotarial services to promote the initiative cannot administer its circulator oath.",
        "feedback": [
          "Recordkeeping does not cure the prohibition.",
          "The provision is not limited to paid promotion.",
          "Correct. Use an eligible independent officer.",
          "Campaign approval does not override the law."
        ],
        "sourceId": "me-conflicts",
        "reference": "§1904(5)"
      },
      {
        "id": "me-006",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "A Maine notary performs approved remote acts. Which recordkeeping statement is correct?",
        "options": [
          "A journal is required",
          "A journal is prohibited",
          "A journal is optional for RON",
          "Only the signer keeps a journal"
        ],
        "answer": "A",
        "explanation": "Maine requires a journal for electronic and remote notarizations.",
        "feedback": [
          "Correct. Retain it for ten years after the last act.",
          "The law requires this record.",
          "Optional tangible-act journaling does not waive RON journaling.",
          "The officer bears the statutory duty."
        ],
        "sourceId": "me-journal",
        "reference": "§1920(1)"
      },
      {
        "id": "me-007",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "A Maine notary keeps a paper-act journal whose final entry was yesterday. When does the retention period run?",
        "options": [
          "From the first entry",
          "Ten years from the last recorded act",
          "Until the employer closes",
          "Only until renewal"
        ],
        "answer": "B",
        "explanation": "Retain the journal for ten years after its last recorded notarial act.",
        "feedback": [
          "The last act controls the retention period.",
          "Correct. Renewal does not shorten that period.",
          "Employer closure does not define retention.",
          "Renewal does not end the retention duty."
        ],
        "sourceId": "me-journal",
        "reference": "§1920(1)"
      },
      {
        "id": "me-008",
        "topic": "identification",
        "studyTopic": "identification",
        "stem": "A Maine officer doubts a signer's presented identity evidence. What may the officer request?",
        "options": [
          "Only a fee",
          "The document recipient's approval",
          "A blank signature page",
          "Additional information or credentials"
        ],
        "answer": "D",
        "explanation": "The officer may request additional information necessary to establish identity.",
        "feedback": [
          "Payment does not establish identity.",
          "Recipient approval cannot replace identification.",
          "A blank page does not establish identity.",
          "Correct. Resolve the identity concern before acting."
        ],
        "sourceId": "me-id",
        "reference": "§1907(3)"
      },
      {
        "id": "me-009",
        "topic": "copy-certification",
        "studyTopic": "copy-certification",
        "stem": "A Maine officer compares a copy with the record and notices a missing page. What should happen?",
        "options": [
          "Certify the incomplete copy",
          "Certify only if free",
          "Obtain a full, accurate reproduction before certifying",
          "Ignore unnumbered pages"
        ],
        "answer": "C",
        "explanation": "Copy certification requires a full, true and accurate reproduction.",
        "feedback": [
          "An incomplete copy fails the standard.",
          "Charging no fee does not cure missing content.",
          "Correct. The entire copy must meet the standard.",
          "Page numbering does not excuse missing content."
        ],
        "sourceId": "me-acts",
        "reference": "§1905(4)"
      },
      {
        "id": "me-010",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "A Maine notarial officer has ordinary authority and a video-call account. What is required before RON?",
        "options": [
          "Only signer consent",
          "State approval and approved provider technology",
          "Only a new pen",
          "Only a wedding-officiant license"
        ],
        "answer": "B",
        "explanation": "Maine requires approval after notice and approved communication technology.",
        "feedback": [
          "Consent does not replace state approval.",
          "Correct. Complete provider technology training too.",
          "A pen does not provide remote authorization.",
          "A marriage-officiant license serves a different function."
        ],
        "sourceId": "me-faq",
        "reference": "Q13–16, Remote approval and training"
      }
    ]
  },
  "MO": {
    "code": "MO",
    "name": "Missouri",
    "slug": "missouri",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "Read the handbook, complete the online or written training assessment, and qualify before the county clerk after state approval.",
    "training": "The official process directs applicants to read the handbook and complete the online or written training course. The law requires attesting to handbook review or prescribed training and achieving at least 80% on the Secretary of State examination.",
    "assessment": "The online training is an application-linked assessment. The current written alternative, Form Comm. 59 (January 2025), contains 30 questions and is attached to the application. An online question count and timed duration were not verified.",
    "steps": [
      "Confirm eligibility and review the Missouri Notary Public Handbook.",
      "Complete the online assessment or current written training form, meeting the statutory 80% examination standard.",
      "Apply online or by mail using the correct resident or nonresident application and required completion evidence.",
      "After approval, obtain a $10,000 four-year bond matching the commission dates and county.",
      "Within 60 days after approval, appear before the county clerk with the commission letter, bond, photo ID and required fee to take the oath and receive the commission.",
      "Mail the signed oath and bond to the Secretary of State with a postmark within seven days after the oath. Obtain the proper seal and required journal."
    ],
    "exceptions": [
      "A qualifying nonresident works in Missouri and uses the commission in the course of Missouri employment.",
      "A nonresident must authorize the Secretary of State to receive service of process as specified by law."
    ],
    "renewal": "The ordinary term is four years. Reappointment requires a new application and compliance anew with commissioning requirements, including training/assessment, new bond, county qualification and a seal with updated expiration.",
    "ron": "Hold the Missouri commission, register for remote capability, complete additional approved remote instruction and pass its examination. The state process requires approved software selection. The remote notary must be physically in Missouri during the act.",
    "officialNext": {
      "label": "Missouri official commissioning steps",
      "url": "https://s1.sos.mo.gov/business/notary/newnotary"
    },
    "sources": [
      {
        "id": "mo-start",
        "title": "Missouri Secretary of State, How to Become a Notary",
        "url": "https://s1.sos.mo.gov/business/notary/newnotary",
        "reference": "Six commissioning steps",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-exam",
        "title": "Missouri Revised Statutes §486.630",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.630",
        "reference": "Examination and application requirements",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-written",
        "title": "Secretary of State Written Notary Training Course, Form Comm. 59",
        "url": "https://www.sos.mo.gov/CMSImages/Business/Notary/WrittenNotaryTrainingCourse_Comm59.pdf",
        "reference": "January 2025 written alternative",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-faq",
        "title": "Missouri Secretary of State notary FAQs",
        "url": "https://s1.sos.mo.gov/business/notary/notary_faq",
        "reference": "Qualification, bond, journal and reappointment",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-renew",
        "title": "Missouri Revised Statutes §486.625",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.625",
        "reference": "Current/former notaries comply anew",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-eligibility",
        "title": "Missouri Revised Statutes §486.605",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.605",
        "reference": "Qualifications and nonresident applicants",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-acts",
        "title": "Missouri Revised Statutes §486.645",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.645",
        "reference": "Principal requirements, conflicts and signature by mark",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-fees",
        "title": "Missouri Revised Statutes §486.685",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.685",
        "reference": "Ordinary fees, travel and absentee ballots",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-remote-exam",
        "title": "Missouri Revised Statutes §486.1125",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.1125",
        "reference": "Additional RON course and examination",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-remote-location",
        "title": "Missouri Revised Statutes §486.1155",
        "url": "https://revisor.mo.gov/main/OneSection.aspx?section=486.1155",
        "reference": "Remote notary physically in Missouri",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mo-electronic",
        "title": "Missouri Secretary of State electronic notary instructions",
        "url": "https://s1.sos.mo.gov/Business/Notary/ElectronicNotaryInfo",
        "reference": "Registration, training and approved software",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": "At least 80%",
      "credential": "Online completion evidence or completed written training form"
    },
    "difference": "Missouri accepts an online assessment or written training form with the commission application, followed by county qualification. The written form has 30 questions. Remote registration adds another course and examination.",
    "topics": [
      {
        "id": "commission",
        "label": "Assessment and county qualification"
      },
      {
        "id": "journals",
        "label": "Required records"
      },
      {
        "id": "prohibited-acts",
        "label": "Family and willingness"
      },
      {
        "id": "seals-fees",
        "label": "Fees and travel"
      },
      {
        "id": "electronic-ron",
        "label": "Additional remote requirements"
      }
    ],
    "questions": [
      {
        "id": "mo-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Missouri applicant scores 75% on the state examination. What must happen before issuance?",
        "options": [
          "Pay an extra fee",
          "Obtain the required 80% or better",
          "Buy two journals",
          "Ask the county to ignore the score"
        ],
        "answer": "B",
        "explanation": "Section 486.630 requires at least 80% before issuance.",
        "feedback": [
          "Payment does not replace passing.",
          "Correct. Meet the statutory score.",
          "Journals do not correct an examination result.",
          "The county cannot waive state qualification."
        ],
        "sourceId": "mo-exam",
        "reference": "§486.630(3)(2)"
      },
      {
        "id": "mo-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Missouri notary's four-year term is ending. Does an old commission automatically renew?",
        "options": [
          "Yes, with the old seal",
          "Yes, if employed",
          "Only if no fees were charged",
          "No, reapply and meet the requirements anew"
        ],
        "answer": "D",
        "explanation": "Current and former notaries seeking another commission must apply and comply anew.",
        "feedback": [
          "Possession of a seal does not renew authority.",
          "Employment does not make renewal automatic.",
          "Fee history does not remove reapplication.",
          "Correct. Follow reappointment requirements."
        ],
        "sourceId": "mo-renew",
        "reference": "§486.625(2)"
      },
      {
        "id": "mo-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Missouri applicant receives approval but has not appeared before the county clerk. What remains?",
        "options": [
          "County oath and qualification within 60 days",
          "Only a social media announcement",
          "Nothing",
          "A second state's commission"
        ],
        "answer": "A",
        "explanation": "State approval is followed by county qualification with the required documents and bond.",
        "feedback": [
          "Correct. Then return oath and bond timely.",
          "An announcement does not complete qualification.",
          "County qualification still remains.",
          "Another commission cannot substitute."
        ],
        "sourceId": "mo-faq",
        "reference": "Q28 and Q34, Qualifying"
      },
      {
        "id": "mo-004",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Kansas resident works in Missouri and seeks its nonresident commission. What limitation applies?",
        "options": [
          "Only acts at home in Kansas",
          "Only unpaid acts",
          "Use in the course of Missouri employment",
          "Only acts for relatives"
        ],
        "answer": "C",
        "explanation": "The nonresident route connects use of the commission with Missouri employment.",
        "feedback": [
          "Missouri authority does not follow the notary into Kansas.",
          "The rule is about employment connection.",
          "Correct. Meet all other nonresident conditions too.",
          "Relatives remain subject to conflict restrictions."
        ],
        "sourceId": "mo-eligibility",
        "reference": "§486.605(3)"
      },
      {
        "id": "mo-005",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "A Missouri notary's stepbrother requests notarization. Which response follows the family rule?",
        "options": [
          "Proceed after disclosure",
          "Use another qualified notary",
          "Charge the maximum",
          "Let the employer approve"
        ],
        "answer": "B",
        "explanation": "The disqualifying sibling relationship includes step relatives.",
        "feedback": [
          "Disclosure does not waive the statute.",
          "Correct. This notary is disqualified.",
          "A fee does not remove the relationship.",
          "An employer cannot override the conflict rule."
        ],
        "sourceId": "mo-acts",
        "reference": "§486.645(3)(3)"
      },
      {
        "id": "mo-006",
        "topic": "prohibited-acts",
        "studyTopic": "prohibited-acts",
        "stem": "A Missouri signer says a companion is forcing the signature. What condition is missing?",
        "options": [
          "A higher fee",
          "A second stamp",
          "A printed envelope",
          "Appearance of acting freely"
        ],
        "answer": "D",
        "explanation": "A principal must appear to act of their own free will.",
        "feedback": [
          "A larger fee cannot cure coercion.",
          "Another stamp cannot cure coercion.",
          "An envelope is unrelated.",
          "Correct. Do not proceed while this condition fails."
        ],
        "sourceId": "mo-acts",
        "reference": "§486.645(1)(4)"
      },
      {
        "id": "mo-007",
        "topic": "journals",
        "studyTopic": "journals",
        "stem": "A Missouri notary proposes recording the customer's Social Security number in the journal. What should happen?",
        "options": [
          "Omit the Social Security number",
          "Record it if paid",
          "Record it in red",
          "Record only its full numeric value"
        ],
        "answer": "A",
        "explanation": "The official guidance prohibits recording Social Security or credit-card numbers in the journal.",
        "feedback": [
          "Correct. Record the required permissible information.",
          "A fee does not permit prohibited data.",
          "Ink color does not change the restriction.",
          "The full number is prohibited journal content."
        ],
        "sourceId": "mo-faq",
        "reference": "Q5, Journal information"
      },
      {
        "id": "mo-008",
        "topic": "seals-fees",
        "studyTopic": "seals-fees",
        "stem": "A Missouri voter requests notarization of an absentee-ballot signature. What notarial fee is allowed?",
        "options": [
          "$5",
          "$1",
          "No fee",
          "Any agreed amount"
        ],
        "answer": "C",
        "explanation": "Missouri prohibits charging for the absentee-ballot or absentee-registration signature notarization.",
        "feedback": [
          "The ordinary cap does not override this prohibition.",
          "A reduced fee still violates the prohibition.",
          "Correct. This service carries no notarial fee.",
          "Agreement cannot authorize the prohibited fee."
        ],
        "sourceId": "mo-fees",
        "reference": "§486.685(5)"
      },
      {
        "id": "mo-009",
        "topic": "seals-fees",
        "studyTopic": "seals-fees",
        "stem": "A Missouri mobile notary wants to charge travel separately. What is required?",
        "options": [
          "An undisclosed charge after arrival",
          "Advance agreement and explanation of the separate travel fee",
          "Only a handwritten invoice afterward",
          "Only a larger seal"
        ],
        "answer": "B",
        "explanation": "Agree on travel beforehand and explain its separation from the statutory notarial fee.",
        "feedback": [
          "The law requires advance agreement.",
          "Correct. Explain that law neither sets nor mandates the travel fee.",
          "A later invoice does not supply advance agreement.",
          "Equipment is unrelated to disclosure."
        ],
        "sourceId": "mo-fees",
        "reference": "§486.685(3)"
      },
      {
        "id": "mo-010",
        "topic": "electronic-ron",
        "studyTopic": "electronic-ron",
        "stem": "A commissioned Missouri notary wants to register for RON. What educational step is additional?",
        "options": [
          "Only the original ordinary test",
          "Only vendor marketing",
          "No further preparation",
          "Approved remote instruction and its examination"
        ],
        "answer": "D",
        "explanation": "Initial remote registration requires additional approved instruction and an examination.",
        "feedback": [
          "The ordinary test does not replace this requirement.",
          "Marketing is not approved instruction.",
          "The statute requires additional education and testing.",
          "Correct. Complete the remote registration requirements too."
        ],
        "sourceId": "mo-remote-exam",
        "reference": "§486.1125"
      }
    ]
  },
  "MT": {
    "code": "MT",
    "name": "Montana",
    "slug": "montana",
    "group": "formalExam",
    "processKind": "Independent exam",
    "summary": "Approved education and a separate online state examination precede Montana’s commission application.",
    "training": "New applicants complete at least four hours of approved education within the 12 months before applying.",
    "assessment": "New and renewing applicants pass the Montana examination within six months before applying. Passing is 80%. After three unsuccessful attempts, wait three months before another attempt.",
    "steps": [
      "Check qualifications and complete approved education.",
      "Pass the examination and retain both certificates.",
      "Obtain a $25,000 surety bond and complete its statement and oath before another notary.",
      "Upload certificates and bond in the SOS online portal and pay the $25 filing fee.",
      "After approval, download the commission certificate and obtain a compliant stamp and journal."
    ],
    "exceptions": [
      "Montana residency has statutory alternatives for qualifying employment, registered business, professional licensure, and certain military family members.",
      "The online renewal window runs from 30 days before expiration through 30 days after expiration. An expired commission does not authorize acts during that interval."
    ],
    "renewal": "Renewing applicants also take the examination. Education may be four hours in the preceding 12 months or two hours in each of the three years preceding renewal. File online in the permitted renewal window.",
    "ron": "Technology-based practice requires approved instruction, a course examination, provider selection and an information update with completion evidence. IPEN uses physical appearance. RON uses electronic records and audiovisual appearance. Montana also permits a separate remote-paper acknowledgment method. The notary must be in Montana for these technology-based methods.",
    "officialNext": {
      "label": "Montana commission instructions and official portal",
      "url": "https://sosmt.gov/notary/applying-for-a-commission-new-and-renewal/"
    },
    "sources": [
      {
        "id": "mt-process",
        "title": "Montana SOS — Applying for a Commission",
        "url": "https://sosmt.gov/notary/applying-for-a-commission-new-and-renewal/",
        "reference": "Qualifications and ordered application steps",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mt-laws",
        "title": "Montana SOS — Notary Statutes and Administrative Rules",
        "url": "https://sosmt.gov/notary/montana-notary-statutes-and-administrative-rules/",
        "reference": "MCA 1-5-602, 603, 609, 617, 618, 619, 620, 625, 629 and ARM 44.15.101",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mt-tech",
        "title": "Montana SOS — Technology Based Notarization",
        "url": "https://sosmt.gov/notary/technology-based-notarization-remote-r-o-n-ipen/",
        "reference": "Definitions, registration and system requirements",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mt-exam",
        "title": "Montana SOS — Montana Notary Exam",
        "url": "https://sosmt.gov/notary/montana-notary-exam/",
        "reference": "Official outbound examination link",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "mt-title",
        "title": "Montana SOS — Certification & Notary Services",
        "url": "https://sosmt.gov/notary/",
        "reference": "Vehicle Title Transfer Updates, effective October 1, 2025",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": "80%",
      "credential": "Passing examination certificate"
    },
    "difference": "Montana separately permits remote acknowledgments on paper and RON on electronic records, with additional registration requirements.",
    "questions": [
      {
        "id": "mt-001",
        "topic": "commission",
        "studyTopic": "application",
        "stem": "Lena finishes four hours of approved Montana education today. Before filing her first application, what else must she complete?",
        "options": [
          "The state examination and required bond/oath",
          "Only a vendor membership",
          "A county employment interview",
          "A remote-notary license in another state"
        ],
        "answer": "A",
        "explanation": "Education alone does not complete Montana’s application prerequisites.",
        "feedback": [
          "Correct. Exam and bond/oath evidence are application documents.",
          "Membership does not establish qualification.",
          "An interview does not replace the prerequisites.",
          "Another state’s remote authorization does not complete this application."
        ],
        "sourceId": "mt-process",
        "reference": "Application steps — education, examination, bond and online application"
      },
      {
        "id": "mt-002",
        "topic": "commission",
        "studyTopic": "examination",
        "stem": "Drew fails his third Montana examination attempt. What should he do before trying again?",
        "options": [
          "Wait one business day",
          "Submit the failed score as passing",
          "Wait three months",
          "Switch to a renewal application"
        ],
        "answer": "C",
        "explanation": "Three failed attempts trigger a three-month waiting period.",
        "feedback": [
          "One day is too short.",
          "A failed result is insufficient.",
          "Correct. The rule sets three months.",
          "Renewal applicants also take the exam."
        ],
        "sourceId": "mt-process",
        "reference": "Take and pass the Montana notary exam — ARM 44.15.101(4)(a)"
      },
      {
        "id": "mt-003",
        "topic": "identification",
        "studyTopic": "identity",
        "stem": "At a Helena office, an unfamiliar signer presents a passport that expired two years ago. What does Montana’s documentary-identification rule permit?",
        "options": [
          "Use only a passport issued this year",
          "Consider the passport under the three-year expiration allowance",
          "Accept it only for a renewal",
          "Require a birth certificate in every case"
        ],
        "answer": "B",
        "explanation": "A passport expired no more than three years may satisfy the documentary category.",
        "feedback": [
          "There is no same-year issuance requirement.",
          "Correct. Two years falls within the allowance.",
          "The allowance concerns identification for notarial acts.",
          "The rule does not require this extra document in every case."
        ],
        "sourceId": "mt-laws",
        "reference": "MCA 1-5-603(12)(b)(i)(A)"
      },
      {
        "id": "mt-004",
        "topic": "journals",
        "studyTopic": "journal-privacy",
        "stem": "A client asks a Billings notary to record her full driver’s license number in the journal for extra security. What should the notary do?",
        "options": [
          "Record it with permission",
          "Record only the final six digits because the client asked",
          "Photocopy the number into every entry",
          "Omit the prohibited number"
        ],
        "answer": "D",
        "explanation": "Montana prohibits recording driver’s license numbers in the journal.",
        "feedback": [
          "Consent does not remove the restriction.",
          "The request does not authorize recording the number.",
          "Copying it still records prohibited information.",
          "Correct. Record the permitted identification description."
        ],
        "sourceId": "mt-laws",
        "reference": "MCA 1-5-618(4)"
      },
      {
        "id": "mt-005",
        "topic": "seals-fees",
        "studyTopic": "stamp-security",
        "stem": "An employer paid for Mira’s Montana stamp and asks a coworker to use it while Mira is away. What is Mira’s duty?",
        "options": [
          "Let the coworker use it for employer documents",
          "Keep it secure and prevent another person’s use",
          "Allow use after an email instruction",
          "Leave it with blank signed certificates"
        ],
        "answer": "B",
        "explanation": "The notary owns and secures the stamping device and may not let another person use it.",
        "feedback": [
          "Payment does not transfer notarial authority.",
          "Correct. Sole ownership and security duties remain with Mira.",
          "An email does not authorize delegated stamping.",
          "Blank certificates do not make delegated use proper."
        ],
        "sourceId": "mt-laws",
        "reference": "MCA 1-5-617(1)"
      },
      {
        "id": "mt-006",
        "topic": "acknowledgments",
        "studyTopic": "acknowledgment",
        "stem": "A signer arrives in Missoula with a previously signed agreement and requests an acknowledgment. Which fact must the notary establish?",
        "options": [
          "That the signer knowingly and willingly signed it for its intended purpose",
          "That the agreement guarantees a profit",
          "That a lawyer drafted every clause",
          "That the document was signed in the notary’s office yesterday"
        ],
        "answer": "A",
        "explanation": "An acknowledgment requires the identified signer’s acknowledgment of a knowing and willing signature.",
        "feedback": [
          "Correct. This is part of the acknowledgment determination.",
          "Commercial success is outside the acknowledgment.",
          "Attorney drafting is not this act’s requirement.",
          "Prior signing elsewhere does not itself prevent an acknowledgment."
        ],
        "sourceId": "mt-laws",
        "reference": "MCA 1-5-602(1), 1-5-603(1)"
      },
      {
        "id": "mt-007",
        "topic": "jurats",
        "studyTopic": "oath",
        "stem": "A Helena applicant wants a verification on oath but says the notary can skip the oath because the signature is genuine. What is required?",
        "options": [
          "A signature alone",
          "An employer’s approval",
          "The signer’s oath or affirmation",
          "A later email from the signer"
        ],
        "answer": "C",
        "explanation": "A verification includes an oath or affirmation about the statement’s truth.",
        "feedback": [
          "Identity and signature alone do not perform the oath.",
          "Employer approval does not supply an oath.",
          "Correct. Administer the required oath or affirmation.",
          "A later email does not perform the act now."
        ],
        "sourceId": "mt-laws",
        "reference": "MCA 1-5-602(36), 1-5-603(2)"
      },
      {
        "id": "mt-008",
        "topic": "electronic-ron",
        "studyTopic": "technology",
        "stem": "Tessa and her signer sit together in Bozeman and sign an electronic record using digital signatures and a digital seal. Which Montana method fits?",
        "options": [
          "Remote-paper acknowledgment",
          "Traditional wet-ink notarization",
          "RON solely because a computer is used",
          "In-person electronic notarization"
        ],
        "answer": "D",
        "explanation": "IPEN combines electronic records with physical appearance.",
        "feedback": [
          "Remote-paper acknowledgment uses separated participants and paper.",
          "The record and signatures here are electronic.",
          "Physical co-presence distinguishes this scenario.",
          "Correct. The participants are together and the record is electronic."
        ],
        "sourceId": "mt-tech",
        "reference": "Definitions — In-Person Electronic Notarization"
      },
      {
        "id": "mt-009",
        "topic": "new-laws",
        "studyTopic": "vehicle-titles",
        "stem": "Two individuals transfer a Montana vehicle title after October 1, 2025. They ask whether the former statutory notary requirement still applies to that individual-to-individual transfer. What does the SOS update say?",
        "options": [
          "The requirement was eliminated",
          "Only the buyer must notarize",
          "Both signatures now need RON",
          "The requirement applies only on weekends"
        ],
        "answer": "A",
        "explanation": "The SOS reports that HB 165 removed the former notarization requirement for that transfer.",
        "feedback": [
          "Correct. The update identifies the repeal and effective date.",
          "The update does not substitute buyer notarization.",
          "The change does not require RON.",
          "The effective change does not depend on the weekday."
        ],
        "sourceId": "mt-title",
        "reference": "Vehicle Title Transfer Updates — HB 165, effective October 1, 2025"
      },
      {
        "id": "mt-010",
        "topic": "commission",
        "studyTopic": "renewal",
        "stem": "A renewing Montana notary completed two hours of continuing education in each of the last three years. What does the official renewal guidance allow?",
        "options": [
          "Education is invalid unless all six hours occurred this week",
          "This may satisfy the renewal education alternative",
          "An exam is waived automatically",
          "A bond is waived automatically"
        ],
        "answer": "B",
        "explanation": "Two hours in each of the preceding three years is an education alternative for renewal.",
        "feedback": [
          "The guidance recognizes the three-year alternative.",
          "Correct. The timing must match each of the three years.",
          "The education alternative does not waive the examination.",
          "It does not remove the bond requirement."
        ],
        "sourceId": "mt-process",
        "reference": "Complete at least 4 hours of approved training — renewing notaries"
      }
    ],
    "topics": [
      {
        "id": "application",
        "label": "Application"
      },
      {
        "id": "examination",
        "label": "Examination"
      },
      {
        "id": "identity",
        "label": "Identity"
      },
      {
        "id": "journal-privacy",
        "label": "Journal Privacy"
      },
      {
        "id": "stamp-security",
        "label": "Stamp Security"
      },
      {
        "id": "acknowledgment",
        "label": "Acknowledgment"
      },
      {
        "id": "oath",
        "label": "Oath"
      },
      {
        "id": "technology",
        "label": "Technology"
      },
      {
        "id": "vehicle-titles",
        "label": "Vehicle Titles"
      },
      {
        "id": "renewal",
        "label": "Renewal"
      }
    ]
  },
  "NE": {
    "code": "NE",
    "name": "Nebraska",
    "slug": "nebraska",
    "group": "formalExam",
    "processKind": "Independent exam",
    "summary": "Nebraska’s ordinary initial route uses an online state examination before the bond and application.",
    "training": "Study the official statutes, rules and FAQ. Ordinary notary-association courses are optional. Mandatory training belongs to the separate electronic/online registration routes.",
    "assessment": "The initial ClassMarker examination has 20 questions and requires 85%. Complete it without help. The SOS allows three attempts and says applicants unsuccessful after three are no longer eligible. A passing certificate is valid for 90 days.",
    "steps": [
      "Check eligibility, including the minimum age of 19.",
      "Pass the official online examination and save the certificate PDF.",
      "Obtain a $15,000 bond and execute the oath before another notary.",
      "Apply online with the exam certificate and bond and pay the $30 filing fee.",
      "After approval, download the commission and obtain a compliant ink stamp."
    ],
    "exceptions": [
      "A qualifying resident of a bordering state may apply with a regular Nebraska place of work or business.",
      "Ordinary private-association training and errors-and-omissions insurance are optional."
    ],
    "renewal": "A current commission holder follows the separate renewal steps, obtains a new $15,000 bond and files online during the 30 days before expiration. Those steps do not require repeating the initial examination. Expired commissions use the initial/new-commission route.",
    "ron": "Online notary registration requires a current Nebraska commission, the state-approved training course, a separate 20-question examination with 85% passing, and registration. In-person electronic registration is a distinct route that retains physical appearance.",
    "officialNext": {
      "label": "Nebraska official initial-commission steps",
      "url": "https://sos.nebraska.gov/sites/default/files/doc/business-services/Notary/StepstoObtainanInitialNotaryCommission.pdf"
    },
    "sources": [
      {
        "id": "ne-initial",
        "title": "Nebraska SOS — Initial Notary Commission Steps",
        "url": "https://sos.nebraska.gov/sites/default/files/doc/business-services/Notary/StepstoObtainanInitialNotaryCommission.pdf",
        "reference": "Initial qualifications; Steps 1–4",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ne-renew",
        "title": "Nebraska SOS — Renewal Steps",
        "url": "https://sos.nebraska.gov/sites/default/files/doc/business-services/Notary/StepsToRenewaNotaryCommission.pdf",
        "reference": "Current commission; bond; online renewal; 30-day window",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ne-faq",
        "title": "Nebraska SOS — Notary FAQ",
        "url": "https://sos.nebraska.gov/notary-frequently-asked-questions",
        "reference": "FAQ 1–17",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ne-age",
        "title": "Nebraska Legislature — 64-101",
        "url": "https://nebraskalegislature.gov/laws/statutes.php?statute=64-101",
        "reference": "Appointment, qualifications and term",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ne-conflicts",
        "title": "Nebraska Legislature — 64-105.01",
        "url": "https://nebraskalegislature.gov/laws/statutes.php?statute=64-105.01",
        "reference": "Relative disqualification",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ne-ron",
        "title": "Nebraska SOS — Online Notary Registration Steps",
        "url": "https://sos.nebraska.gov/sites/default/files/doc/business-services/Notary/StepstoBecomeanOnlineNotary.pdf",
        "reference": "Training and examination requirements for separate online registration",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ne-hub",
        "title": "Nebraska SOS — Notary Public",
        "url": "https://sos.nebraska.gov/business-services/notary-public",
        "reference": "Electronic and online distinctions; online-only filing",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 20,
      "minutes": null,
      "passing": "85%",
      "credential": "Digital passing examination certificate, valid 90 days"
    },
    "difference": "The ordinary initial exam is separate from online-notary registration. Nebraska’s ordinary journal is recommended, while the ink stamp is required.",
    "questions": [
      {
        "id": "ne-001",
        "topic": "commission",
        "studyTopic": "eligibility",
        "stem": "A Nebraska resident is 18 and wants a commission before her nineteenth birthday. What does Nebraska require?",
        "options": [
          "Age 18 if employed",
          "Age 19 before appointment",
          "Age 21 in every case",
          "No age rule after passing the exam"
        ],
        "answer": "B",
        "explanation": "Nebraska sets the appointment minimum at 19.",
        "feedback": [
          "Employment does not reduce the age.",
          "Correct. Appointment requires age 19.",
          "The statutory minimum is lower.",
          "An exam does not remove age eligibility."
        ],
        "sourceId": "ne-age",
        "reference": "Neb. Rev. Stat. 64-101(7)"
      },
      {
        "id": "ne-002",
        "topic": "commission",
        "studyTopic": "examination",
        "stem": "Omar passes Nebraska’s initial exam and plans to apply four months later. What issue must he address?",
        "options": [
          "His score certificate lasts forever",
          "Only a renewal applicant needs a certificate",
          "The passing result is valid for 90 days",
          "Passing removes the bond requirement"
        ],
        "answer": "C",
        "explanation": "The initial passing score expires after 90 days.",
        "feedback": [
          "The official validity period is limited.",
          "Initial applicants upload it.",
          "Correct. Four months exceeds the stated period.",
          "A passing score does not replace the bond."
        ],
        "sourceId": "ne-initial",
        "reference": "Step 1 — examination certificate validity"
      },
      {
        "id": "ne-003",
        "topic": "prohibited-acts",
        "studyTopic": "relatives",
        "stem": "A Lincoln notary’s half-sister asks him to notarize her signature on an unrelated private agreement. Which response follows Nebraska’s relative rule?",
        "options": [
          "Decline because half-siblings are covered",
          "Proceed if no fee is charged",
          "Proceed if the document is valuable",
          "Proceed with a second stamp"
        ],
        "answer": "A",
        "explanation": "The family prohibition includes half-relatives.",
        "feedback": [
          "Correct. Half-sister is within the prohibited relationship.",
          "Waiving a fee does not cure it.",
          "Document value does not remove the relationship.",
          "A second stamp cannot cure the disqualification."
        ],
        "sourceId": "ne-conflicts",
        "reference": "Neb. Rev. Stat. 64-105.01"
      },
      {
        "id": "ne-004",
        "topic": "journals",
        "studyTopic": "ordinary-records",
        "stem": "A newly commissioned Nebraska notary asks whether an ordinary paper-act journal is mandatory. What is accurate?",
        "options": [
          "It is required only for free acts",
          "It replaces the ink stamp",
          "It must be filed every week",
          "It is optional and recommended by the SOS"
        ],
        "answer": "D",
        "explanation": "Nebraska recommends journals for ordinary notarial acts.",
        "feedback": [
          "Charging no fee does not create that requirement.",
          "A journal does not replace the seal.",
          "The FAQ does not impose weekly filing.",
          "Correct. The FAQ distinguishes recommendation from requirement."
        ],
        "sourceId": "ne-faq",
        "reference": "FAQ 1 and 15"
      },
      {
        "id": "ne-005",
        "topic": "seals-fees",
        "studyTopic": "seal",
        "stem": "A printer offers a Nebraska seal containing only the notary’s name and county. What must be corrected?",
        "options": [
          "Add only the employer’s logo",
          "Use the required state, general-notary wording, commissioned name and expiration date",
          "Remove the expiration date",
          "Replace it with a private membership number"
        ],
        "answer": "B",
        "explanation": "The ink seal needs Nebraska’s required wording and commission information.",
        "feedback": [
          "An employer logo does not supply the required elements.",
          "Correct. These are the FAQ’s listed elements.",
          "The expiration date belongs on the seal.",
          "Membership information does not replace commission details."
        ],
        "sourceId": "ne-faq",
        "reference": "FAQ 3 — required ink stamp contents"
      },
      {
        "id": "ne-006",
        "topic": "identification",
        "studyTopic": "identity",
        "stem": "An unfamiliar customer in Omaha offers only a private gym card. Which alternative is expressly listed in Nebraska’s identification FAQ?",
        "options": [
          "Any card with a first name",
          "An unsigned note from an absent friend",
          "A passport",
          "The customer’s promise alone"
        ],
        "answer": "C",
        "explanation": "A passport is an expressly recognized identification method.",
        "feedback": [
          "A first name alone is insufficient.",
          "An absent friend’s note is not the prescribed witness procedure.",
          "Correct. The FAQ expressly lists a passport.",
          "A promise is not an identification method."
        ],
        "sourceId": "ne-faq",
        "reference": "FAQ 10 — satisfactory evidence"
      },
      {
        "id": "ne-007",
        "topic": "acknowledgments",
        "studyTopic": "venue",
        "stem": "A Colorado form arrives at a Nebraska office with Colorado preprinted in the venue. The notarization occurs in Lancaster County, Nebraska. What should the notary do?",
        "options": [
          "Keep Colorado because it is printed",
          "Use the signer’s birthplace",
          "Leave the venue blank",
          "Correct the venue to the actual state and county"
        ],
        "answer": "D",
        "explanation": "The venue describes where the notarization takes place.",
        "feedback": [
          "Document origin does not control the venue.",
          "Birthplace does not locate the act.",
          "The venue should be completed accurately.",
          "Correct. Nebraska and the actual county belong in the venue."
        ],
        "sourceId": "ne-faq",
        "reference": "FAQ 11 and 17 — venue"
      },
      {
        "id": "ne-008",
        "topic": "commission",
        "studyTopic": "application-documents",
        "stem": "Jules buys optional errors-and-omissions insurance but no Nebraska surety bond. Can that policy complete the ordinary bond prerequisite?",
        "options": [
          "Yes, any insurance is enough",
          "No, obtain the required $15,000 bond",
          "Yes, if the exam score is perfect",
          "Only if the employer pays"
        ],
        "answer": "B",
        "explanation": "Nebraska requires a surety bond and separately describes E&O coverage as optional.",
        "feedback": [
          "The two products have different roles.",
          "Correct. The bond remains required.",
          "An exam score does not replace it.",
          "Who pays does not change the requirement."
        ],
        "sourceId": "ne-initial",
        "reference": "Step 2 — surety bond and optional E&O"
      },
      {
        "id": "ne-009",
        "topic": "electronic-ron",
        "studyTopic": "remote-registration",
        "stem": "A Nebraska general notary plans remote notarizations using a video platform. Which additional path applies?",
        "options": [
          "Complete state online-notary training, pass its separate exam and register",
          "Use the ordinary commission without registration",
          "Mail a stamp impression to a client",
          "Buy a webcam and start immediately"
        ],
        "answer": "A",
        "explanation": "Nebraska has a separate online-notary registration process.",
        "feedback": [
          "Correct. General commissioning is a prerequisite to that process.",
          "The ordinary commission alone is insufficient.",
          "Mailing a stamp does not authorize remote work.",
          "Equipment does not establish registration."
        ],
        "sourceId": "ne-ron",
        "reference": "Online registration Steps 1–3"
      },
      {
        "id": "ne-010",
        "topic": "commission",
        "studyTopic": "renewal",
        "stem": "A current Nebraska notary wants to renew 20 days before expiration. Which official process applies?",
        "options": [
          "Wait until the commission has expired",
          "Repeat the initial exam in every renewal",
          "Obtain the renewal bond and use the online renewal application",
          "Submit only an association membership card"
        ],
        "answer": "C",
        "explanation": "The renewal window opens 30 days before expiration.",
        "feedback": [
          "The renewal instructions allow filing now.",
          "The current-commission renewal steps do not include a repeat exam.",
          "Correct. Twenty days is inside the window.",
          "Membership is not the renewal application."
        ],
        "sourceId": "ne-renew",
        "reference": "Steps 1–2 — bond and 30-day renewal window"
      }
    ],
    "topics": [
      {
        "id": "eligibility",
        "label": "Eligibility"
      },
      {
        "id": "examination",
        "label": "Examination"
      },
      {
        "id": "relatives",
        "label": "Relatives"
      },
      {
        "id": "ordinary-records",
        "label": "Ordinary Records"
      },
      {
        "id": "seal",
        "label": "Seal"
      },
      {
        "id": "identity",
        "label": "Identity"
      },
      {
        "id": "venue",
        "label": "Venue"
      },
      {
        "id": "application-documents",
        "label": "Application Documents"
      },
      {
        "id": "remote-registration",
        "label": "Remote Registration"
      },
      {
        "id": "renewal",
        "label": "Renewal"
      }
    ]
  },
  "NJ": {
    "code": "NJ",
    "name": "New Jersey",
    "slug": "new-jersey",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "New Jersey integrates its online education attestation and examination with the first-time commissioning application.",
    "training": "Follow the current DORES portal by reading the official manual, watching the entire official training-video series and attesting completion. The September 2026 manual requires the Treasurer’s course. An older Treasury announcement describes six initial hours and three continuing hours, while the current manual omits those figures.",
    "assessment": "Start the portal’s New Commissioning Application, pass the online exam, then complete the registration application. The opened official materials do not establish a current question count, time limit or passing percentage.",
    "steps": [
      "Review the official manual and complete the full training-video series.",
      "For an ordinary non-attorney first application, begin the commissioning/exam process and pass the online exam.",
      "Complete the online registration application with the required legislative endorsement and application payment.",
      "Within three months of receiving the commission, take and file the oath before the appropriate county clerk."
    ],
    "exceptions": [
      "The official portal directs attorneys to skip its examination steps and proceed to registration.",
      "A commission expired more than 30 days is treated as a new application for the examination.",
      "Eligible nonresidents may qualify through New Jersey employment or practice, with the additional required information and county-clerk oath route."
    ],
    "renewal": "The active-notary renewal portal does not require an exam. The 2026 manual requires continuing education for the specified renewal category. An older announcement calls it three hours. A lapse over 30 days triggers the portal’s new-applicant examination treatment. Initial and renewed commissions both require timely county-clerk swearing-in.",
    "ron": "Before the first act using communication technology, electronically notify the State Treasurer and identify the technology. The notary must be in New Jersey and meet the separate identification, security, certificate, recording and retention requirements in Chapter 8.",
    "officialNext": {
      "label": "New Jersey official education and online exam process",
      "url": "https://www.njportal.com/DOR/NotaryExam/"
    },
    "sources": [
      {
        "id": "nj-portal",
        "title": "New Jersey DORES — Official Notary Public Exam Portal",
        "url": "https://www.njportal.com/DOR/NotaryExam/",
        "reference": "Initial applicant sequence, attorney skip instruction and expired-commission treatment",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nj-manual",
        "title": "New Jersey Treasury — Notary Public Manual, September 14, 2026",
        "url": "https://www.nj.gov/treasury/revenue/pdf/notarypublicmanual.pdf",
        "reference": "Chapters 3, 4, 6, 7 and 8",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nj-announcement",
        "title": "New Jersey Treasury — Educational and Testing Announcement",
        "url": "https://www.nj.gov/treasury/revenue/notary-education-testing.shtml",
        "reference": "Earlier six-hour initial and three-hour continuing-course announcement",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": null,
      "credential": "Online exam approval recorded for the commission application"
    },
    "difference": "The state portal clears applicants for registration after the exam. The county-clerk oath remains a later commissioning step.",
    "questions": [
      {
        "id": "nj-001",
        "topic": "commission",
        "studyTopic": "initial-process",
        "stem": "A first-time New Jersey non-attorney applicant has read the manual and watched all training videos. Which portal sequence should she follow?",
        "options": [
          "Apply for renewal despite never holding a commission",
          "Skip directly to notarizing",
          "Begin the commissioning process, pass the online exam, then complete registration",
          "Use a private certificate as an automatic commission"
        ],
        "answer": "C",
        "explanation": "The official portal places the online examination before completion of registration.",
        "feedback": [
          "Renewal is for eligible existing commissions.",
          "Training does not confer a commission.",
          "Correct. This is the portal’s listed sequence.",
          "A private certificate does not itself appoint a notary."
        ],
        "sourceId": "nj-portal",
        "reference": "New Notary Applicant Process, steps 1–4"
      },
      {
        "id": "nj-002",
        "topic": "commission",
        "studyTopic": "attorney-exception",
        "stem": "A New Jersey attorney reaches the initial official exam portal. Which instruction applies to attorneys?",
        "options": [
          "Proceed to the registration-application step",
          "Take every exam attempt before registration",
          "Obtain a non-attorney certificate first",
          "Wait until the attorney retires"
        ],
        "answer": "A",
        "explanation": "The portal expressly directs attorneys to skip to step 4.",
        "feedback": [
          "Correct. Step 4 is registration.",
          "The portal provides an attorney skip instruction.",
          "It does not direct attorneys to obtain that certificate.",
          "Retirement is not the listed prerequisite."
        ],
        "sourceId": "nj-portal",
        "reference": "New Notary Applicant Process — attorney instruction"
      },
      {
        "id": "nj-003",
        "topic": "commission",
        "studyTopic": "lapsed-commission",
        "stem": "A former New Jersey notary’s commission expired 45 days ago. What does the examination portal require for this lapse?",
        "options": [
          "Automatic renewal without examination",
          "Permanent ineligibility",
          "Only replacement of the stamp",
          "Treatment as a new applicant with an exam"
        ],
        "answer": "D",
        "explanation": "The portal applies new-applicant examination treatment after more than 30 days.",
        "feedback": [
          "This lapse exceeds the portal’s limit.",
          "The portal specifies a new-application path.",
          "A stamp does not renew authority.",
          "Correct. Forty-five days exceeds 30."
        ],
        "sourceId": "nj-portal",
        "reference": "Expired commissions — more than 30 days"
      },
      {
        "id": "nj-004",
        "topic": "commission",
        "studyTopic": "county-oath",
        "stem": "A Newark applicant receives a new commission and plans to postpone the county-clerk oath for five months. What deadline applies?",
        "options": [
          "One year after the first paid act",
          "Within three months of receiving the commission",
          "Only before the next renewal",
          "No deadline for new applicants"
        ],
        "answer": "B",
        "explanation": "New Jersey requires the oath within three months of receipt.",
        "feedback": [
          "The deadline runs from receipt of the commission.",
          "Correct. The proposed delay is too long.",
          "The oath is a current commissioning step.",
          "The manual sets an explicit deadline."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 4 — Swearing in"
      },
      {
        "id": "nj-005",
        "topic": "prohibited-acts",
        "studyTopic": "conflicts",
        "stem": "A New Jersey notary’s civil union partner is a party to a property agreement. May the notary notarize that agreement?",
        "options": [
          "Yes if no fee is charged",
          "Yes if the partner has photo ID",
          "No, the partner’s status creates the stated prohibition",
          "Yes if a journal entry is made"
        ],
        "answer": "C",
        "explanation": "The prohibition covers records to which the notary’s civil union partner is a party.",
        "feedback": [
          "A free act does not cure this conflict.",
          "Identification does not cure the conflict.",
          "Correct. Use an eligible notarial officer.",
          "A journal cannot cure this disqualification."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 3 — Prohibitions"
      },
      {
        "id": "nj-006",
        "topic": "identification",
        "studyTopic": "identity",
        "stem": "An unfamiliar New Jersey signer presents a driver’s license expired two years ago. Which documentary rule applies?",
        "options": [
          "The listed license may qualify within the three-year expiration allowance",
          "All expired licenses are automatically barred",
          "Only a work badge can be used",
          "The signer must obtain a passport issued that week"
        ],
        "answer": "A",
        "explanation": "The manual permits listed credentials expired no more than three years.",
        "feedback": [
          "Correct. The notary must still be satisfied about identity.",
          "That ignores the stated allowance.",
          "A private work badge is not the listed substitute.",
          "There is no same-week passport requirement."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 7 — Documentation"
      },
      {
        "id": "nj-007",
        "topic": "journals",
        "studyTopic": "record-ownership",
        "stem": "A New Jersey employer bought its employee’s notary journal and demands ownership when she leaves. Who owns that journal under the manual?",
        "options": [
          "The signer of the last record",
          "The employer in every case",
          "The stamp vendor",
          "The notary public"
        ],
        "answer": "D",
        "explanation": "The journal belongs to the notary even when the employer paid.",
        "feedback": [
          "A signer does not own the journal.",
          "Payment does not transfer ownership.",
          "A supplies vendor has no ownership here.",
          "Correct. The manual expressly assigns ownership to the notary."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 6 — Journal Requirement"
      },
      {
        "id": "nj-008",
        "topic": "journals",
        "studyTopic": "records-exception",
        "stem": "A New Jersey title-insurance company’s authorized notary agent asks about the manual’s alternative recordkeeping rule. What does it permit?",
        "options": [
          "No records of any acts",
          "Regular business files in place of a separate journal for the specified category",
          "A public list of signatures only",
          "Discarding all files after the act"
        ],
        "answer": "B",
        "explanation": "The manual permits specified attorneys, employees and title-insurance agents to use regularly maintained files.",
        "feedback": [
          "The exception substitutes records rather than abolishing them.",
          "Correct. The notary must fit the stated category.",
          "A signature list does not describe the permitted file system.",
          "The exception does not authorize immediate destruction."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 6 — In-lieu-of-journal exception"
      },
      {
        "id": "nj-009",
        "topic": "electronic-ron",
        "studyTopic": "technology-notice",
        "stem": "Before her first New Jersey notarial act using communication technology, what notice must a commissioned notary provide?",
        "options": [
          "Notice only to a private membership group",
          "A public social-media post",
          "Electronic notice to the Treasurer identifying the technology",
          "A request to transfer her commission to the signer"
        ],
        "answer": "C",
        "explanation": "Chapter 8 requires advance electronic notice and identification of the intended technology.",
        "feedback": [
          "A private group is not the required recipient.",
          "A public post is not the prescribed filing.",
          "Correct. Follow the Treasurer’s instructions.",
          "The signer does not receive the commission."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 8 — prior electronic notification"
      },
      {
        "id": "nj-010",
        "topic": "copy-certification",
        "studyTopic": "copy-comparison",
        "stem": "A New Jersey client hands the notary a copy of a private letter but will not supply the record it supposedly reproduces. What required determination is missing?",
        "options": [
          "Whether the copy is a full, true and accurate reproduction",
          "Whether the letter will earn money",
          "Whether the paper is a preferred color",
          "Whether the client holds a notary membership"
        ],
        "answer": "A",
        "explanation": "Copy certification requires determining that the reproduction is full, true and accurate.",
        "feedback": [
          "Correct. The proposed certification lacks that foundation.",
          "Profit is outside the copy determination.",
          "Paper color does not establish accuracy.",
          "Membership does not establish the copy’s accuracy."
        ],
        "sourceId": "nj-manual",
        "reference": "Chapter 7 — Copy Certification Requirements"
      }
    ],
    "topics": [
      {
        "id": "initial-process",
        "label": "Initial Process"
      },
      {
        "id": "attorney-exception",
        "label": "Attorney Exception"
      },
      {
        "id": "lapsed-commission",
        "label": "Lapsed Commission"
      },
      {
        "id": "county-oath",
        "label": "County Oath"
      },
      {
        "id": "conflicts",
        "label": "Conflicts"
      },
      {
        "id": "identity",
        "label": "Identity"
      },
      {
        "id": "record-ownership",
        "label": "Record Ownership"
      },
      {
        "id": "records-exception",
        "label": "Records Exception"
      },
      {
        "id": "technology-notice",
        "label": "Technology Notice"
      },
      {
        "id": "copy-comparison",
        "label": "Copy Comparison"
      }
    ]
  },
  "NM": {
    "code": "NM",
    "name": "New Mexico",
    "slug": "new-mexico",
    "group": "courseQuiz",
    "processKind": "Approved course",
    "summary": "Ordinary first-time New Mexico applicants complete the state-required approved course and examination before applying.",
    "training": "Complete the Notary Education Course and examination from the SOS-approved provider. The training page identifies the National Notary Association as the approved provider. Automatic notarial officers also have education requirements.",
    "assessment": "Pass the approved course examination with at least 80% and include the completion certificate with the application. The opened official materials do not establish a fixed question count or examination duration.",
    "steps": [
      "Check eligibility and complete the approved education and exam.",
      "Obtain the $10,000 bond and have the required applicant signature and oath notarized by another authorized officer.",
      "File online with PDF completion certificate, oath and bond and pay the $30 application fee.",
      "After approval, obtain the compliant official stamp. Provide its copy to the Secretary of State within 45 days of receiving the commission and before performing the first notarial act."
    ],
    "exceptions": [
      "Applicants can qualify through New Mexico residency or a place of employment in the state.",
      "Automatic notarial officers have a distinct office/registration basis of authority and still have training and stamp duties. The historical 2023 training grace period is not a current new-applicant exemption."
    ],
    "renewal": "The commission term is four years. Renew online. For the renewed commission, file the stamp copy within 45 days of receipt and before its first act. Under 12.9.3.8(A)(1) NMAC, a recorded prior examination pass can excuse retraining and retesting, unless the commission expired more than one year ago or the Secretary of State determines that substantial legal or rule changes since the last application require them.",
    "ron": "A commissioned notary or qualifying automatic notarial officer completes separate RON education and examination and files the RON application as an amendment. The authorized officer must be physically in New Mexico during remote acts and must comply with separate electronic-stamp, technology, recording and journal requirements. The Secretary of State must receive the electronic-stamp copy within 45 days of RON authorization and before the first remote act.",
    "officialNext": {
      "label": "New Mexico official approved training and exam",
      "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/training-resources/"
    },
    "sources": [
      {
        "id": "nm-initial",
        "title": "New Mexico SOS — Become a Notary",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/become-a-notary/",
        "reference": "Initial qualifications, $10,000 bond and application uploads",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-training",
        "title": "New Mexico SOS — Training Resources",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/training-resources/",
        "reference": "Approved course/exam, 80% threshold and separate RON training",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-hub",
        "title": "New Mexico SOS — Notary Commissions",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/",
        "reference": "Online filing policy effective October 13, 2023",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-handbook",
        "title": "New Mexico SOS — Notarial Officer Handbook, July 2023",
        "url": "https://www.sos.nm.gov/wp-content/uploads/2023/10/Notary-Handbook-100223.pdf",
        "reference": "Commissioning, renewal education exception, notarial acts and copy certification",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-stamp",
        "title": "New Mexico SOS — Stamp Requirements",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/stamp-requirements/",
        "reference": "Official stamp requirements by officer category",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-journal",
        "title": "New Mexico SOS — Journal Requirements",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/journal-requirements/",
        "reference": "Retention, entries, loss notice and RON provider entry",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-renew",
        "title": "New Mexico SOS — Renew a Notary Commission",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/renew-a-notary-commission/",
        "reference": "Four-year term, online renewal and stamp registration",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-ron",
        "title": "New Mexico SOS — Become a Remote Online Notary",
        "url": "https://www.sos.nm.gov/notary-and-apostille/notary-commissions/become-a-remote-online-notary/",
        "reference": "Separate RON application, course and examination",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-procedure-rule",
        "title": "12.9.3 NMAC Notarial Procedures",
        "url": "https://www.srca.nm.gov/parts/title12/12.009.0003.html",
        "reference": "12.9.3.8(A)(1) and (C), renewal education and official stamp filing",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nm-ron-rule",
        "title": "12.9.4 NMAC Remote Online Notarization Standards",
        "url": "https://www.srca.nm.gov/parts/title12/12.009.0004.html",
        "reference": "12.9.4.8(C) and 12.9.4.13(A), electronic stamp receipt before remote work",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": "80%",
      "credential": "Certificate of Completion of Notary Education Course and exam"
    },
    "difference": "New Mexico distinguishes commissioned notaries from automatic notarial officers. Both have education requirements, and RON requires a separate course/exam. Ordinary and electronic stamp-copy deadlines also apply before the first act. Renewal education exceptions depend on both prior examination records and the Secretary of State's determination of substantial changes.",
    "questions": [
      {
        "id": "nm-001",
        "topic": "commission",
        "studyTopic": "initial-process",
        "stem": "A first-time New Mexico applicant finishes an unapproved course advertised on social media. What must she verify before relying on it for the application?",
        "options": [
          "Whether the course is from the SOS-approved provider and includes the required exam",
          "Whether the advertisement has many likes",
          "Whether the vendor sells a stamp",
          "Whether a coworker watched the video"
        ],
        "answer": "A",
        "explanation": "The initial qualification requires the approved course and examination.",
        "feedback": [
          "Correct. Approval and exam completion matter.",
          "Popularity does not establish state approval.",
          "Supply sales do not establish course approval.",
          "A coworker’s viewing does not complete the applicant’s requirement."
        ],
        "sourceId": "nm-training",
        "reference": "Training Resources — approved provider and certificate"
      },
      {
        "id": "nm-002",
        "topic": "commission",
        "studyTopic": "passing-score",
        "stem": "An applicant earns 75% on New Mexico’s required notary course exam. What does the SOS threshold require?",
        "options": [
          "Accept the score if the bond is large",
          "Apply as a renewing notary",
          "Earn at least 80%",
          "Replace the exam with a stamp impression"
        ],
        "answer": "C",
        "explanation": "The required passing score is 80% or higher.",
        "feedback": [
          "A bond does not alter the threshold.",
          "Changing application labels does not make a failing score pass.",
          "Correct. Seventy-five percent is below the requirement.",
          "A stamp impression does not replace the exam."
        ],
        "sourceId": "nm-training",
        "reference": "Training Resources — 80% or higher"
      },
      {
        "id": "nm-003",
        "topic": "prohibited-acts",
        "studyTopic": "applicant-oath",
        "stem": "An active New Mexico notary is renewing and signs her own required applicant oath. Can she notarize that signature herself?",
        "options": [
          "Yes because her existing commission is active",
          "Yes if no fee is charged",
          "Yes if her employer witnesses it",
          "No, another authorized officer must perform it"
        ],
        "answer": "D",
        "explanation": "The SOS explicitly forbids applicants from notarizing their own application signatures.",
        "feedback": [
          "An active commission does not authorize self-notarization.",
          "No fee does not cure it.",
          "An employer’s presence does not make self-notarization proper.",
          "Correct. Arrange the required notarization with another officer."
        ],
        "sourceId": "nm-initial",
        "reference": "Applying for a Commission — signed and notarized Oath of Office"
      },
      {
        "id": "nm-004",
        "topic": "seals-fees",
        "studyTopic": "stamp-content",
        "stem": "A New Mexico stamp maker omits the commission number from a newly commissioned notary’s stamp. What correction is required?",
        "options": [
          "Replace the number with an employer ID",
          "Include the issued commission number and expiration date",
          "Use only the county name",
          "Omit the notary’s legal name too"
        ],
        "answer": "B",
        "explanation": "The official stamp includes the issued commission number and expiration date.",
        "feedback": [
          "An employer ID is not the commission number.",
          "Correct. Use the certificate’s commission information.",
          "County wording alone does not satisfy the requirements.",
          "The legal name is also required."
        ],
        "sourceId": "nm-stamp",
        "reference": "Official Stamp requirements for a Notary Public"
      },
      {
        "id": "nm-005",
        "topic": "commission",
        "studyTopic": "stamp-registration",
        "stem": "A New Mexico notary’s application is approved today. What post-approval filing must she complete within 45 days?",
        "options": [
          "Register the official stamp",
          "Retake every exam attempt",
          "Obtain a second-state commission",
          "Mail her journal to every client"
        ],
        "answer": "A",
        "explanation": "The SOS handbook requires stamp registration within 45 days of approval.",
        "feedback": [
          "Correct. File the official stamp registration.",
          "Approval does not trigger automatic exam repetition.",
          "Another state’s commission is not required.",
          "Client distribution is not the required filing."
        ],
        "sourceId": "nm-handbook",
        "reference": "Applying with the Office of the Secretary of State — 45-day stamp registration"
      },
      {
        "id": "nm-006",
        "topic": "journals",
        "studyTopic": "retention",
        "stem": "A New Mexico notary’s commission expires, but her journal’s last entry is only two years old. Which retention period applies?",
        "options": [
          "Only until the commission expires",
          "Until five years after buying the journal",
          "Ten years after the last notarial act chronicled, subject to authorized transfer",
          "No retention for unpaid acts"
        ],
        "answer": "C",
        "explanation": "Journal retention continues for ten years after the last recorded act.",
        "feedback": [
          "Expiration does not end the retention duty.",
          "The purchase date is not the trigger.",
          "Correct. The official page also provides authorized transfer options.",
          "Free acts do not remove journal duties."
        ],
        "sourceId": "nm-journal",
        "reference": "Journal — retention regardless of officer status"
      },
      {
        "id": "nm-007",
        "topic": "jurats",
        "studyTopic": "oath",
        "stem": "An Albuquerque signer requests a jurat and offers only a previously signed page. Which additional act must the notary obtain as part of the jurat?",
        "options": [
          "A promise from the signer’s employer",
          "The signer’s oath or affirmation and signing in the notary’s presence",
          "A document appraisal",
          "An advertisement for the notary"
        ],
        "answer": "B",
        "explanation": "The handbook’s jurat requires signing before the notary and an oath or affirmation.",
        "feedback": [
          "The signer must perform the required acts.",
          "Correct. The jurat includes both steps.",
          "Value appraisal does not perform a jurat.",
          "Advertising is unrelated to the act."
        ],
        "sourceId": "nm-handbook",
        "reference": "Notarial Acts — Jurats"
      },
      {
        "id": "nm-008",
        "topic": "copy-certification",
        "studyTopic": "copy-limits",
        "stem": "A client asks a New Mexico notary to directly copy-certify a birth certificate. What issue does the handbook identify?",
        "options": [
          "Every photocopy must be certified",
          "Vital records are always treated as private letters",
          "The notary may certify if paid double",
          "The permitted copy-certification procedure excludes vital records"
        ],
        "answer": "D",
        "explanation": "The handbook excludes vital records, public records and publicly recordable records from this copy-certification procedure.",
        "feedback": [
          "A request does not create authority.",
          "A birth certificate is a vital record.",
          "Payment does not change the record category.",
          "Correct. Direct the client to the proper issuing-record process."
        ],
        "sourceId": "nm-handbook",
        "reference": "Notarial Acts — Copy certifications"
      },
      {
        "id": "nm-009",
        "topic": "electronic-ron",
        "studyTopic": "separate-authorization",
        "stem": "A commissioned New Mexico notary wants to begin remote online notarizations. Which education requirement applies?",
        "options": [
          "Only the ordinary course already taken",
          "No training once a camera is purchased",
          "Separate RON education and examination",
          "Training only if a signer lives overseas"
        ],
        "answer": "C",
        "explanation": "RON has a separate course/exam and application requirement.",
        "feedback": [
          "The initial ordinary course does not complete the separate RON route.",
          "Equipment does not establish authorization.",
          "Correct. Follow the SOS’s RON application process.",
          "The requirement is not limited to foreign signers."
        ],
        "sourceId": "nm-ron",
        "reference": "Become a Remote Online Notary — separate training and exam"
      },
      {
        "id": "nm-010",
        "topic": "journals",
        "studyTopic": "lost-journal",
        "stem": "A Santa Fe notary discovers that her journal was stolen. What action does the official journal page require?",
        "options": [
          "Promptly notify the Secretary of State",
          "Wait until the next renewal",
          "Ask the next client to reconstruct all entries",
          "Ignore it if the stamp is safe"
        ],
        "answer": "A",
        "explanation": "The journal page requires prompt notice of a lost or stolen journal.",
        "feedback": [
          "Correct. Notify the SOS promptly.",
          "Renewal may be too late.",
          "A client cannot replace the notification duty.",
          "Stamp security does not eliminate the loss notice."
        ],
        "sourceId": "nm-journal",
        "reference": "Each journal entry shall contain — lost or stolen journal notification"
      }
    ],
    "topics": [
      {
        "id": "initial-process",
        "label": "Initial Process"
      },
      {
        "id": "passing-score",
        "label": "Passing Score"
      },
      {
        "id": "applicant-oath",
        "label": "Applicant Oath"
      },
      {
        "id": "stamp-content",
        "label": "Stamp Content"
      },
      {
        "id": "stamp-registration",
        "label": "Stamp Registration"
      },
      {
        "id": "retention",
        "label": "Retention"
      },
      {
        "id": "oath",
        "label": "Oath"
      },
      {
        "id": "copy-limits",
        "label": "Copy Limits"
      },
      {
        "id": "separate-authorization",
        "label": "Separate Authorization"
      },
      {
        "id": "lost-journal",
        "label": "Lost Journal"
      }
    ]
  },
  "NV": {
    "code": "NV",
    "name": "Nevada",
    "slug": "nevada",
    "group": "courseQuiz",
    "processKind": "Approved course",
    "summary": "Nevada requires its traditional-notary course and course examination before appointment.",
    "training": "Complete the state’s traditional Commission Course. NRS 240.018 calls for at least three instructional hours plus an examination. The official LMS requires separate enrollment and completion of the course and exam.",
    "assessment": "Pass the Commission Exam and save completion evidence. The official LMS states that training, examinations and payment must be completed within 90 days for validity. The question count, exam duration and numerical passing threshold were not confirmed in the official pages opened.",
    "steps": [
      "Check eligibility and complete the Commission Course and Commission Exam.",
      "Obtain the $10,000 bond and take the oath.",
      "File the bond and oath with the appropriate Nevada county clerk and obtain the filing certificate.",
      "Submit the application, county filing evidence, training/exam evidence and fees through SilverFlume.",
      "Wait for the appointment certificate before performing acts and obtain compliant supplies."
    ],
    "exceptions": [
      "Qualifying residents of adjoining states can apply through a registered Nevada business or regular Nevada employment, with additional affidavits and licensing evidence.",
      "A resident of an adjoining state also has an annual business-license reporting obligation under NRS 240.031."
    ],
    "renewal": "Renewing traditional notaries also complete the mandatory course and exam. The traditional appointment term is four years. Complete the renewal application, bond/oath and required county filing evidence.",
    "ron": "Become an active traditional notary first. Then separately enroll in and complete the eRegistration Course and eRegistration Exam and apply for electronic authorization. Remote electronic practice has additional statutory technology, identification, recording and journal duties.",
    "officialNext": {
      "label": "Nevada official Commission Course and Exam",
      "url": "https://training.nvsos-training.com/Default.asp"
    },
    "sources": [
      {
        "id": "nv-training",
        "title": "Nevada SOS — Official Notary Training Site",
        "url": "https://training.nvsos-training.com/Default.asp",
        "reference": "Commission Course and Exam, eRegistration, 90-day validity and SilverFlume payment",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nv-nrs",
        "title": "Nevada Legislature — NRS Chapter 240",
        "url": "https://www.leg.state.nv.us/NRS/NRS-240.html",
        "reference": "NRS 240.015, 018, 020, 030, 065, 075, 120, 155, 1655",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "nv-nac",
        "title": "Nevada Legislature — NAC Chapter 240",
        "url": "https://www.leg.state.nv.us/NAC/NAC-240.html",
        "reference": "NAC 240.270 — course-completion certificate validity",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": null,
      "credential": "Commission Exam completion notification or certificate"
    },
    "difference": "The Nevada LMS treats course and examination as separate enrollments and requires an existing traditional commission before electronic training.",
    "questions": [
      {
        "id": "nv-001",
        "topic": "commission",
        "studyTopic": "training-process",
        "stem": "A Nevada applicant completes the Commission Course in the state LMS but never enrolls in the Commission Exam. What is still needed?",
        "options": [
          "Nothing because course viewing is enough",
          "Separate enrollment and successful completion of the Commission Exam",
          "Only a private association card",
          "An application for another state"
        ],
        "answer": "B",
        "explanation": "The official LMS requires separate completion of course and exam.",
        "feedback": [
          "The course alone does not complete both requirements.",
          "Correct. The exam is a separate portion.",
          "Membership does not supply the state exam.",
          "Another state’s application does not complete this route."
        ],
        "sourceId": "nv-training",
        "reference": "Requirements for Notary Commission — Traditional Notary Commission"
      },
      {
        "id": "nv-002",
        "topic": "commission",
        "studyTopic": "county-filing",
        "stem": "A Nevada resident obtains a $10,000 bond and takes the oath. Where must these be filed before the SOS receives the county filing certificate?",
        "options": [
          "With the resident county clerk",
          "Only with a private training company",
          "With the signer’s employer",
          "With any out-of-state courthouse"
        ],
        "answer": "A",
        "explanation": "The bond and oath are filed and recorded by the proper Nevada county clerk.",
        "feedback": [
          "Correct. The clerk provides the filing evidence.",
          "A training company does not perform that county filing.",
          "An employer is not the filing office.",
          "The statute specifies the appropriate Nevada county clerk."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.030(1)(d), (4)"
      },
      {
        "id": "nv-003",
        "topic": "commission",
        "studyTopic": "start-of-authority",
        "stem": "A Nevada applicant’s bond effective date has arrived, but the SOS has not issued the appointment certificate. May he notarize today?",
        "options": [
          "Yes if the bond agent agrees",
          "Yes for free acts only",
          "Yes if the client signs twice",
          "No, wait for the appointment certificate"
        ],
        "answer": "D",
        "explanation": "A bond effective date alone does not authorize performance.",
        "feedback": [
          "The agent does not issue the appointment.",
          "A free act still requires authority.",
          "Extra signatures do not create authority.",
          "Correct. NRS 240.030 requires issuance of the certificate."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.030(5)"
      },
      {
        "id": "nv-004",
        "topic": "prohibited-acts",
        "studyTopic": "family",
        "stem": "A Nevada notary’s stepchild needs a signature notarized on a private contract. What does the family restriction require?",
        "options": [
          "Proceed if no money changes hands",
          "Proceed after showing the bond",
          "Decline because stepchildren are included relatives",
          "Proceed if the child is an adult"
        ],
        "answer": "C",
        "explanation": "Nevada’s listed relatives include a stepchild.",
        "feedback": [
          "Fee waiver does not remove the relationship.",
          "A bond does not cure this disqualification.",
          "Correct. Use an eligible notary.",
          "The rule does not turn on the stepchild’s age."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.065(1)(d), (4)(b)"
      },
      {
        "id": "nv-005",
        "topic": "identification",
        "studyTopic": "physical-appearance",
        "stem": "For an ordinary paper notarization in Reno, a courier brings an absent signer’s document and a photo of her license. What should the notary do?",
        "options": [
          "Require the signer’s appearance and proper identification",
          "Treat the courier as the signer",
          "Notarize because the license has a photo",
          "Call it RON without electronic authorization"
        ],
        "answer": "A",
        "explanation": "An ordinary notarization requires the person’s presence and identification.",
        "feedback": [
          "Correct. The courier’s delivery is insufficient.",
          "The courier is not the person whose signature is notarized.",
          "An ID image does not supply the missing appearance.",
          "Renaming the act does not establish authorization or compliance."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.155(1)"
      },
      {
        "id": "nv-006",
        "topic": "journals",
        "studyTopic": "entry-timing",
        "stem": "A Las Vegas notary plans to reconstruct this week’s ordinary journal entries on Friday. When does Nevada require the entries?",
        "options": [
          "At the end of the month",
          "At the time each act is performed",
          "Only when payment clears",
          "Only if the client asks"
        ],
        "answer": "B",
        "explanation": "Nevada requires the ordinary journal entry at the time of the act.",
        "feedback": [
          "Monthly reconstruction is too late.",
          "Correct. Enter the act contemporaneously.",
          "Payment timing does not control the entry.",
          "A client request is unnecessary."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.120(1)"
      },
      {
        "id": "nv-007",
        "topic": "journals",
        "studyTopic": "retention",
        "stem": "A Nevada notary stops being a notary and asks when her traditional journals may be discarded under the stated retention rule. What is the period?",
        "options": [
          "Immediately after the last fee is paid",
          "One year after buying the journal",
          "Until seven years after she ceases to be a notary",
          "Only until the stamp expires"
        ],
        "answer": "C",
        "explanation": "Nevada measures this retention period from ceasing to be a notary.",
        "feedback": [
          "Payment does not end retention.",
          "The purchase date is not the trigger.",
          "Correct. The statute uses seven years after cessation.",
          "Stamp expiration alone does not satisfy the period."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.120(9)"
      },
      {
        "id": "nv-008",
        "topic": "electronic-ron",
        "studyTopic": "electronic-sequence",
        "stem": "A first-time Nevada applicant wants to take only the eRegistration Course and skip traditional commissioning. What does the state LMS require?",
        "options": [
          "Electronic authorization automatically supplies a traditional commission",
          "Only an employer’s permission",
          "Only the ordinary bond",
          "Obtain the traditional commission first, then complete eRegistration course and exam"
        ],
        "answer": "D",
        "explanation": "The LMS puts traditional commissioning before eRegistration education/testing.",
        "feedback": [
          "The listed sequence goes the other direction.",
          "Permission does not replace commissioning.",
          "The bond alone does not complete either authorization.",
          "Correct. Both eRegistration portions follow traditional commissioning."
        ],
        "sourceId": "nv-training",
        "reference": "eNotary Commission requirements"
      },
      {
        "id": "nv-009",
        "topic": "commission",
        "studyTopic": "course-validity",
        "stem": "Nevada training completion evidence is 120 days old when an applicant is ready to file. Which issue must be resolved?",
        "options": [
          "The certificate is valid indefinitely",
          "The course-completion certificate’s 90-day validity has passed",
          "It becomes valid again with a new stamp",
          "The county can change the exam score"
        ],
        "answer": "B",
        "explanation": "NAC 240.270 sets 90-day course-certificate validity.",
        "feedback": [
          "The regulation sets an expiration period.",
          "Correct. Check current completion requirements before filing.",
          "A stamp does not revive the certificate.",
          "The county’s filing role does not include altering scores."
        ],
        "sourceId": "nv-nac",
        "reference": "NAC 240.270(2)"
      },
      {
        "id": "nv-010",
        "topic": "prohibited-acts",
        "studyTopic": "truthful-certificate",
        "stem": "A Nevada client asks the notary to certify a fact the notary knows is false and offers an extra payment. What should the notary do?",
        "options": [
          "Refuse the false certification",
          "Accept if the journal mentions the payment",
          "Proceed because the client requested it",
          "Ask a coworker to apply the stamp"
        ],
        "answer": "A",
        "explanation": "Nevada forbids certifying an instrument containing a statement known to be false.",
        "feedback": [
          "Correct. The payment does not authorize false certification.",
          "A journal entry cannot cure a knowingly false statement.",
          "A request does not remove the prohibition.",
          "Delegating the stamp does not make it proper."
        ],
        "sourceId": "nv-nrs",
        "reference": "NRS 240.075(1)(b)"
      }
    ],
    "topics": [
      {
        "id": "training-process",
        "label": "Training Process"
      },
      {
        "id": "county-filing",
        "label": "County Filing"
      },
      {
        "id": "start-of-authority",
        "label": "Start Of Authority"
      },
      {
        "id": "family",
        "label": "Family"
      },
      {
        "id": "physical-appearance",
        "label": "Physical Appearance"
      },
      {
        "id": "entry-timing",
        "label": "Entry Timing"
      },
      {
        "id": "retention",
        "label": "Retention"
      },
      {
        "id": "electronic-sequence",
        "label": "Electronic Sequence"
      },
      {
        "id": "course-validity",
        "label": "Course Validity"
      },
      {
        "id": "truthful-certificate",
        "label": "Truthful Certificate"
      }
    ]
  },
  "OH": {
    "code": "OH",
    "name": "Ohio",
    "slug": "ohio",
    "group": "courseQuiz",
    "processKind": "Approved course",
    "summary": "Ordinary first-time non-attorney applicants complete approved education and testing before applying online.",
    "training": "The ordinary new non-attorney route requires three hours through an SOS-authorized provider. Contact the provider for its delivery and test arrangements. Education must fall within the 12 months before application.",
    "assessment": "The authorized provider administers the required test and issues completion evidence for the application. The opened SOS pages do not establish one statewide question count, duration or passing percentage.",
    "steps": [
      "Check eligibility and obtain the BCI report first, subject to statutory exceptions.",
      "Complete the authorized three-hour course and required test.",
      "Apply online with the BCI report, signature sample and course/test completion evidence.",
      "After approval, personally take the oath before a notary or other authorized official before performing acts."
    ],
    "exceptions": [
      "Ohio attorneys applying after September 20, 2019 take the education but are exempt from the initial test. Attorneys commissioned before that date have the statutory education/test exemption.",
      "Attorneys and peace officers have a statutory BCI-report exemption.",
      "A separate statutory route exists for qualifying notaries from other states under Chapter 4796."
    ],
    "renewal": "Ordinary non-attorney renewal requires one hour of authorized education and no test. A non-attorney commission ordinarily lasts five years. An attorney commission continues while statutory residence/practice and good-standing conditions hold.",
    "ron": "Obtain an Ohio commission first, then complete two hours of approved RON education and testing and apply separately for online authorization. RON renewal requires one hour and no test under the SOS table.",
    "officialNext": {
      "label": "Ohio official education and authorized providers",
      "url": "https://www.ohiosos.gov/notary/become-a-notary-in-ohio/education-and-testing"
    },
    "sources": [
      {
        "id": "oh-process",
        "title": "Ohio SOS — Application Process",
        "url": "https://www.ohiosos.gov/notary/become-a-notary-in-ohio/application-process",
        "reference": "Initial application and additional RON requirements",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-education",
        "title": "Ohio SOS — Education and Testing",
        "url": "https://www.ohiosos.gov/notary/become-a-notary-in-ohio/education-and-testing",
        "reference": "Filing-type table and authorized providers",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-qualifications",
        "title": "Ohio Revised Code — Chapter 147",
        "url": "https://codes.ohio.gov/ohio-revised-code/chapter-147",
        "reference": "147.01 — qualifications, exceptions, electronic filing and oath",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-prohibited",
        "title": "Ohio Revised Code — 147.141",
        "url": "https://codes.ohio.gov/ohio-revised-code/section-147.141",
        "reference": "Prohibited acts, effective April 3, 2025",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-ack",
        "title": "Ohio Revised Code — 147.53",
        "url": "https://codes.ohio.gov/ohio-revised-code/section-147.53",
        "reference": "Taking an acknowledgment, effective April 3, 2025",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-fees",
        "title": "Ohio Revised Code — 147.08",
        "url": "https://codes.ohio.gov/ohio-revised-code/section-147.08",
        "reference": "Current ordinary, online, travel and technology fee rules",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-term",
        "title": "Ohio Revised Code — 147.03",
        "url": "https://codes.ohio.gov/ohio-revised-code/section-147.03",
        "reference": "Ordinary and attorney term rules",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "oh-course-rules",
        "title": "Ohio Administrative Code — 111:6-1-02",
        "url": "https://codes.ohio.gov/ohio-administrative-code/rule-111:6-1-02",
        "reference": "Authorized course and testing requirements",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": null,
      "credential": "Authorized-provider education and testing completion evidence"
    },
    "difference": "Attorney, renewal and RON requirements differ. Ohio’s current fee statute took effect April 3, 2025.",
    "questions": [
      {
        "id": "oh-001",
        "topic": "commission",
        "studyTopic": "application",
        "stem": "A first-time Ohio non-attorney applicant has received her BCI report. What education/testing step follows in the ordinary route?",
        "options": [
          "One hour with no test",
          "Three hours and testing through an authorized provider",
          "Any social-media course",
          "A RON exam instead of ordinary education"
        ],
        "answer": "B",
        "explanation": "The SOS table assigns three hours and a test to this filing type.",
        "feedback": [
          "One hour is the ordinary renewal category.",
          "Correct. Use a listed authorized provider.",
          "The provider must be authorized.",
          "RON has a separate authorization process."
        ],
        "sourceId": "oh-education",
        "reference": "Filing-type table — Non-attorney Initial Application"
      },
      {
        "id": "oh-002",
        "topic": "commission",
        "studyTopic": "attorney-exception",
        "stem": "An Ohio attorney first applies for a commission in 2026. Which initial education/testing requirement applies?",
        "options": [
          "No education under any circumstances",
          "A full non-attorney test only",
          "Three-hour education without the initial test",
          "A county oral interview only"
        ],
        "answer": "C",
        "explanation": "New attorney applicants complete education with an initial-test exemption.",
        "feedback": [
          "The post-2019 route includes education.",
          "The attorney exemption removes the initial test.",
          "Correct. This matches the SOS table.",
          "The statutory education requirement still applies."
        ],
        "sourceId": "oh-education",
        "reference": "Attorney Initial Application; R.C. 147.01(B)(4)(c)"
      },
      {
        "id": "oh-003",
        "topic": "jurats",
        "studyTopic": "oath",
        "stem": "An Ohio client signs an affidavit but asks the notary to omit any oath or affirmation. May the notary execute the jurat anyway?",
        "options": [
          "No, administer the required oath or affirmation",
          "Yes, a signature replaces it",
          "Yes, if the client is an attorney",
          "Yes, if no fee is charged"
        ],
        "answer": "A",
        "explanation": "Ohio prohibits executing a jurat without administering an oath or affirmation.",
        "feedback": [
          "Correct. The jurat requires that step.",
          "A signature does not perform an oath.",
          "The signer’s profession does not waive it.",
          "A free act still requires the oath."
        ],
        "sourceId": "oh-prohibited",
        "reference": "R.C. 147.141(A)(16)"
      },
      {
        "id": "oh-004",
        "topic": "copy-certification",
        "studyTopic": "copy-limits",
        "stem": "A customer asks an Ohio non-attorney notary to certify directly that a diploma photocopy is a true copy. What does the prohibition require?",
        "options": [
          "Compare it and certify directly",
          "Certify it if the school is in Ohio",
          "Certify it for a higher fee",
          "Decline the direct true-copy certification"
        ],
        "answer": "D",
        "explanation": "Ohio prohibits a notary from certifying that a document is a true copy of another record.",
        "feedback": [
          "Comparison does not create this authority.",
          "The school’s location does not remove the prohibition.",
          "A higher fee cannot create authority.",
          "Correct. This request seeks the prohibited certification."
        ],
        "sourceId": "oh-prohibited",
        "reference": "R.C. 147.141(A)(5)"
      },
      {
        "id": "oh-005",
        "topic": "prohibited-acts",
        "studyTopic": "incomplete-records",
        "stem": "A borrower brings an Ohio loan document with blank substantive terms and wants the signature notarized before the lender fills them in. What should the notary do?",
        "options": [
          "Proceed because the lender will finish it",
          "Decline notarization of the incomplete document",
          "Fill in the terms for the lender",
          "Stamp it with tomorrow’s date"
        ],
        "answer": "B",
        "explanation": "Ohio prohibits notarizing a signature on an incomplete or blank document.",
        "feedback": [
          "Later completion does not cure the present problem.",
          "Correct. The document is incomplete.",
          "The notary should not supply the parties’ terms.",
          "A future date does not cure incompleteness."
        ],
        "sourceId": "oh-prohibited",
        "reference": "R.C. 147.141(A)(13)"
      },
      {
        "id": "oh-006",
        "topic": "seals-fees",
        "studyTopic": "ordinary-fees",
        "stem": "An Ohio notary performs one ordinary notarial act involving two signatures. How may the statutory act fee be calculated?",
        "options": [
          "Up to $5 for the act",
          "$5 for each signature automatically",
          "Any amount if both signers agree",
          "The $30 online rate"
        ],
        "answer": "A",
        "explanation": "The ordinary act cap is $5 and fees are not calculated per signature.",
        "feedback": [
          "Correct. The act fee is subject to that cap.",
          "The statute forbids a per-signature calculation.",
          "Agreement does not waive the statutory cap.",
          "This scenario is not an online notarization."
        ],
        "sourceId": "oh-fees",
        "reference": "R.C. 147.08(A)(1), (C)"
      },
      {
        "id": "oh-007",
        "topic": "acknowledgments",
        "studyTopic": "representative-capacity",
        "stem": "A company officer appears before an Ohio notary to acknowledge a company agreement. Which acknowledgment is relevant?",
        "options": [
          "That the notary guarantees company solvency",
          "That the notary becomes a company director",
          "That the officer signed by proper authority for the company’s stated purposes",
          "That the officer has no identification obligation"
        ],
        "answer": "C",
        "explanation": "A representative acknowledgment addresses the officer’s authority and execution for the company.",
        "feedback": [
          "Solvency is outside the acknowledgment.",
          "Notarization does not appoint directors.",
          "Correct. The officer acknowledges representative execution.",
          "Identity still must be established."
        ],
        "sourceId": "oh-ack",
        "reference": "R.C. 147.53(B)(3)(b), (4)"
      },
      {
        "id": "oh-008",
        "topic": "electronic-ron",
        "studyTopic": "remote-authorization",
        "stem": "A new Ohio general notary wants to offer RON next week. What is the additional ordinary authorization route?",
        "options": [
          "Start after buying a camera",
          "Use an employer’s online login",
          "Take only the one-hour renewal class",
          "Complete two-hour RON education/testing and apply for authorization"
        ],
        "answer": "D",
        "explanation": "Ohio requires separate online authorization after commissioning.",
        "feedback": [
          "Equipment does not authorize RON.",
          "Another login does not confer authorization.",
          "Renewal education is a different category.",
          "Correct. Follow the initial RON authorization route."
        ],
        "sourceId": "oh-process",
        "reference": "Additional Application Requirements for Remote Online Notary Authorization; education table"
      },
      {
        "id": "oh-009",
        "topic": "commission",
        "studyTopic": "oath-of-office",
        "stem": "An Ohio applicant receives approval and immediately accepts a notarization before taking the oath of office. What step is missing?",
        "options": [
          "A second BCI report that day",
          "Personal appearance before an authorized officer for the oath",
          "Automatic county employment",
          "A private trade-group membership"
        ],
        "answer": "B",
        "explanation": "Ohio requires the oath before entering notarial duties.",
        "feedback": [
          "The immediate missing step is the oath.",
          "Correct. Approval must be followed by the required oath.",
          "Commissioning does not require that employment.",
          "Membership does not replace the oath."
        ],
        "sourceId": "oh-qualifications",
        "reference": "R.C. 147.01(G)"
      },
      {
        "id": "oh-010",
        "topic": "commission",
        "studyTopic": "renewal",
        "stem": "A non-attorney Ohio notary seeks an ordinary renewal. What does the SOS filing-type table require?",
        "options": [
          "One hour of education and no test",
          "Three hours plus the initial test every time",
          "Two hours of RON education for every renewal",
          "No education because the stamp is unchanged"
        ],
        "answer": "A",
        "explanation": "The ordinary non-attorney renewal category requires one hour and no test.",
        "feedback": [
          "Correct. This is the listed renewal category.",
          "That describes the ordinary initial category.",
          "RON renewal is separately classified.",
          "Keeping a stamp does not waive education."
        ],
        "sourceId": "oh-education",
        "reference": "Filing-type table — Non-attorney Renewal"
      }
    ],
    "topics": [
      {
        "id": "application",
        "label": "Application"
      },
      {
        "id": "attorney-exception",
        "label": "Attorney Exception"
      },
      {
        "id": "oath",
        "label": "Oath"
      },
      {
        "id": "copy-limits",
        "label": "Copy Limits"
      },
      {
        "id": "incomplete-records",
        "label": "Incomplete Records"
      },
      {
        "id": "ordinary-fees",
        "label": "Ordinary Fees"
      },
      {
        "id": "representative-capacity",
        "label": "Representative Capacity"
      },
      {
        "id": "remote-authorization",
        "label": "Remote Authorization"
      },
      {
        "id": "oath-of-office",
        "label": "Oath Of Office"
      },
      {
        "id": "renewal",
        "label": "Renewal"
      }
    ]
  },
  "OR": {
    "code": "OR",
    "name": "Oregon",
    "slug": "oregon",
    "group": "formalExam",
    "processKind": "Independent exam",
    "summary": "Complete Notary Basics, pass the Secretary of State examination, and finish the commission application and notarized oath process.",
    "training": "Every applicant, including a currently commissioned notary seeking another term, must complete Notary Basics. Training must be completed within six months before application. The Secretary of State offers free training, and approved providers are another option.",
    "assessment": "The state examination is open book and available online, with yes/no, true/false and multiple-choice items. An approved provider's course leads back to the Secretary of State examination. The opened official guidance does not establish a current question count, time limit or numeric passing score.",
    "steps": [
      "Confirm eligibility and complete an approved Notary Basics course.",
      "Retrieve the education number and use the official Take the Exam and Apply route.",
      "Pass the examination and complete the application and background-check process.",
      "Have the emailed oath notarized and return it with the $40 processing fee following state instructions.",
      "Wait for the commission documents and obtain the authorized stamp before performing notarial acts."
    ],
    "exceptions": [
      "Living outside Oregon is compatible with eligibility when the applicant has an Oregon place of employment or practice.",
      "Current commission holders must also complete Basics for another commission under the requirement effective January 1, 2025.",
      "Oregon does not currently require a surety bond or errors-and-omissions policy."
    ],
    "renewal": "A subsequent four-year commission requires Basics and the examination again. The current guide says to apply no more than 30 days before expiration. A refresher course does not replace Basics.",
    "ron": "RON requires additional state training, platform training, a qualifying vendor and Secretary of State approval. The notary must be physically in Oregon. RON and in-person electronic notarization have separate application processes.",
    "officialNext": {
      "label": "Oregon commission application and training",
      "url": "https://sos.oregon.gov/business/notary/Pages/commission-application-reapplication.aspx"
    },
    "sources": [
      {
        "id": "or-qualifications",
        "title": "Qualifications for a Commission",
        "url": "https://sos.oregon.gov/business/notary/Pages/notary-qualification.aspx",
        "reference": "List of Qualifications",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "or-admin",
        "title": "Notary Administration FAQs",
        "url": "https://sos.oregon.gov/business/notary/pages/oregon-notary-online-system-faq.aspx",
        "reference": "Tutorial, Education & the Test; Applying for a Commission",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "or-application",
        "title": "Commission Application/Reapplication",
        "url": "https://sos.oregon.gov/business/notary/Pages/commission-application-reapplication.aspx",
        "reference": "Notary Commissions; What's Next",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "or-practice",
        "title": "Notary Practice FAQs",
        "url": "https://sos.oregon.gov/business/notary/Pages/oregon-notary-public-faq.aspx",
        "reference": "Notary Best Practices; The Notary Journal",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "or-guide",
        "title": "Oregon Notary Public Guide",
        "url": "https://sos.oregon.gov/business/notary/Documents/notary-guide.pdf",
        "reference": "Frequently Asked Questions; Education and Exam, pp. 15–16",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "or-ron",
        "title": "Remote Online Notarization",
        "url": "https://sos.oregon.gov/business/notary/Pages/remote-online-notarization.aspx",
        "reference": "Understanding the Process; Find a Vendor",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": null,
      "minutes": null,
      "passing": null,
      "credential": "Secretary of State notary commission"
    },
    "difference": "Oregon requires Basics before the state examination for every new commission, including another term for an active notary.",
    "topics": [
      {
        "id": "commission",
        "label": "Training and commissioning"
      },
      {
        "id": "certificates",
        "label": "Certificates and corrections"
      },
      {
        "id": "records",
        "label": "Journal and stamp custody"
      },
      {
        "id": "remote",
        "label": "Remote authorization"
      }
    ],
    "questions": [
      {
        "id": "or-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Maya's Oregon commission is still active in 2026. She wants another term and completed only a refresher webinar. What must she do about education?",
        "options": [
          "Use her active commission to waive education",
          "Complete Notary Basics before applying",
          "Replace Basics with a bond",
          "Wait until expiration to qualify for Basics"
        ],
        "answer": "B",
        "explanation": "Every applicant for another Oregon commission must take Basics under the current requirement.",
        "feedback": [
          "Active status does not waive Basics.",
          "Correct. Basics is required for another commission.",
          "A bond does not satisfy the education requirement.",
          "Expiration is not a prerequisite for taking Basics."
        ],
        "sourceId": "or-admin",
        "reference": "Tutorial, Education & the Test — Do I have to take the notary training?"
      },
      {
        "id": "or-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An approved private provider gives Ethan an Oregon education number. What is his next examination step?",
        "options": [
          "Take the mandatory Secretary of State test",
          "Ask the provider to issue his state commission",
          "Treat the education number as a commission",
          "Submit an application without an examination"
        ],
        "answer": "A",
        "explanation": "Approved-provider training still leads to the Secretary of State test.",
        "feedback": [
          "Correct. The state test remains mandatory.",
          "The education provider does not issue the state commission.",
          "The number documents education, not appointment.",
          "The training does not waive the test."
        ],
        "sourceId": "or-admin",
        "reference": "Tutorial, Education & the Test — approved providers"
      },
      {
        "id": "or-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An Oregon applicant receives an emailed oath after application approval. How should she complete the next step?",
        "options": [
          "Sign it privately and file it without payment",
          "Let her employer notarize it without a commission",
          "Have a commissioned notary notarize it and send it with the fee",
          "Keep it and start notarizing immediately"
        ],
        "answer": "C",
        "explanation": "The oath must be notarized and submitted with the $40 processing fee.",
        "feedback": [
          "The oath requires notarization and the fee.",
          "An employer needs notarial authority to notarize the oath.",
          "Correct. Follow the state's oath and payment instructions.",
          "An emailed oath alone does not complete commissioning."
        ],
        "sourceId": "or-application",
        "reference": "What's Next — oath of office and processing fee"
      },
      {
        "id": "or-004",
        "topic": "prohibited-acts",
        "studyTopic": "certificates",
        "stem": "A customer hands an Oregon nonattorney notary a document without certificate language and asks which act will best protect his legal interests. What should the notary do?",
        "options": [
          "Choose a jurat for maximum protection",
          "Choose an acknowledgment because it is common",
          "Select whichever certificate fits the blank space",
          "Ask the customer to identify the required act and offer neutral descriptions"
        ],
        "answer": "D",
        "explanation": "Selecting the customer's certificate would give legal advice. The customer must identify the act.",
        "feedback": [
          "The notary cannot select the act for legal protection.",
          "Frequency does not authorize choosing for a customer.",
          "Page layout does not determine the required act.",
          "Correct. Neutral information lets the customer choose."
        ],
        "sourceId": "or-practice",
        "reference": "Notary Best Practices — May I choose a certificate for a customer?"
      },
      {
        "id": "or-005",
        "topic": "journals",
        "studyTopic": "records",
        "stem": "A stranger asks to browse every entry in an Oregon notary's journal. Which response matches the official FAQ?",
        "options": [
          "Allow unrestricted browsing because every journal is public",
          "Provide the entire journal for a copying fee",
          "Explain that disclosure is not required merely on that request",
          "Destroy unrelated entries first"
        ],
        "answer": "C",
        "explanation": "The FAQ identifies Secretary of State requests and subpoenas as required-disclosure situations and requires protecting other signers' information.",
        "feedback": [
          "The FAQ does not classify the journal as an unrestricted public record.",
          "A fee does not create a right to inspect all entries.",
          "Correct. A stranger's general request does not require disclosure.",
          "Destroying entries is not a disclosure procedure."
        ],
        "sourceId": "or-practice",
        "reference": "The Notary Journal — Is my journal a public record?"
      },
      {
        "id": "or-006",
        "topic": "seals-fees",
        "studyTopic": "records",
        "stem": "An Oregon employer paid for Lina's stamp and demands it when she leaves. What should Lina do with the stamp?",
        "options": [
          "Keep it secured in her control",
          "Leave it with the payroll office",
          "Give it to the next employee",
          "Let the employer use it until her term ends"
        ],
        "answer": "A",
        "explanation": "The official FAQ says the notary must retain the stamp and keep it secure.",
        "feedback": [
          "Correct. The stamp stays with the notary.",
          "Payment by the employer does not transfer stamp control.",
          "A successor cannot use Lina's commission stamp.",
          "The employer cannot exercise Lina's notarial authority."
        ],
        "sourceId": "or-practice",
        "reference": "The Notary Journal — leaving an employer"
      },
      {
        "id": "or-007",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Noah lives in Washington and works at an office in Oregon. Which fact supports his eligibility for an Oregon commission?",
        "options": [
          "His Washington driver's license alone",
          "His Oregon place of employment",
          "The customer's Oregon residence",
          "A promise to move to Oregon someday"
        ],
        "answer": "B",
        "explanation": "Oregon permits an applicant with a place of employment or practice in Oregon to qualify without Oregon residency.",
        "feedback": [
          "An out-of-state license alone does not establish the Oregon connection.",
          "Correct. An Oregon workplace is a qualifying connection.",
          "The applicant's connection controls eligibility.",
          "A future plan does not establish present eligibility."
        ],
        "sourceId": "or-qualifications",
        "reference": "List of Qualifications — residency, employment or practice"
      },
      {
        "id": "or-008",
        "topic": "electronic-ron",
        "studyTopic": "remote",
        "stem": "An authorized Oregon RON notary travels to Idaho and receives a request from a signer in Portland. Where must the notary be to perform the Oregon RON act?",
        "options": [
          "Anywhere if the signer is in Oregon",
          "Anywhere in the United States",
          "In the signer's county",
          "Physically in Oregon"
        ],
        "answer": "D",
        "explanation": "The Oregon RON guidance requires the notary to remain physically in Oregon.",
        "feedback": [
          "The signer's location does not replace the notary-location rule.",
          "RON authority does not extend the notary's physical location nationwide.",
          "The signer and notary need not share a county.",
          "Correct. The notary must be in Oregon."
        ],
        "sourceId": "or-ron",
        "reference": "Understanding the Process — notary location"
      },
      {
        "id": "or-009",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A new Oregon applicant is told she must purchase a surety bond before the state can commission her. What does the Secretary of State FAQ say?",
        "options": [
          "A $500 bond is mandatory",
          "A $5,000 bond is mandatory",
          "A bond and E&O insurance are currently optional",
          "Only renewal applicants need a bond"
        ],
        "answer": "C",
        "explanation": "Oregon currently requires neither a bond nor E&O insurance for commissioning.",
        "feedback": [
          "The Oregon FAQ does not require a $500 bond.",
          "The Oregon FAQ does not require a $5,000 bond.",
          "Correct. The FAQ describes these protections as optional.",
          "The FAQ does not create a renewal bond requirement."
        ],
        "sourceId": "or-practice",
        "reference": "Getting your Commission — bonds and E&O insurance"
      },
      {
        "id": "or-010",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Before starting the Oregon examination, Aria wants to keep the official guide beside her. What examination format does the guide describe?",
        "options": [
          "Open book",
          "Closed book with a proctor at every employer",
          "Oral examination only",
          "No examination after training"
        ],
        "answer": "A",
        "explanation": "The official guide describes the state examination as open book.",
        "feedback": [
          "Correct. The guide may be used as a resource.",
          "That is not the format described in the guide.",
          "The guide describes written online item types.",
          "Training does not eliminate the examination."
        ],
        "sourceId": "or-guide",
        "reference": "Education and Exam, pp. 15–16"
      }
    ]
  },
  "UT": {
    "code": "UT",
    "name": "Utah",
    "slug": "utah",
    "group": "formalExam",
    "processKind": "Independent exam",
    "summary": "Study the official materials, take and pay for the online examination, complete the background-check process, and upload a signed bond and notarized oath.",
    "training": "The ordinary application instructions direct applicants to study the official guide, current code and 2026 journal supplement. They do not specify a mandatory classroom course for ordinary first-time applicants.",
    "assessment": "The official study guide linked from the current application page describes 35 multiple-choice questions worth 65 points, with 61 points required to pass. Ten questions carry four points each and 25 carry one point each. No time limit was established in the opened official materials.",
    "steps": [
      "Confirm qualifications and study the current code, guide and 2026 supplement.",
      "Create an account, take the online test and pay the $95 state charge to obtain results.",
      "Submit to the background check and continue the application without waiting for a separate results notice.",
      "Obtain a $5,000 bond matching the application name, sign it as principal and have the oath notarized.",
      "Upload the signed bond and notarized oath. The current instructions say there is no separate Final Submit button.",
      "After approval and receipt of the Certificate of Authority, obtain the stamp and required journal."
    ],
    "exceptions": [
      "A qualifying applicant may lawfully reside in Utah or have been employed in Utah for at least 30 days before application, maintaining the qualifying connection thereafter.",
      "The 2026 journal requirement applies to a commission or new commission received on or after May 6, 2026. The law contains employment-based journal exceptions for acts within the course and scope of work for an attorney, law firm or title agency."
    ],
    "renewal": "Utah describes the next term as reapplication. Applicants take the test again and complete the commissioning requirements. A new commission received on or after May 6, 2026 triggers the updated journal requirements, subject to statutory exceptions.",
    "ron": "Remote notarization requires a separate remote-notary certification and compliance with technology rules. The notary must be physically in Utah. Additional bond coverage and electronic journal and audiovisual recording duties apply.",
    "officialNext": {
      "label": "Utah qualifications and application process",
      "url": "https://notary.utah.gov/qualifications-and-process/"
    },
    "sources": [
      {
        "id": "ut-process",
        "title": "Process and Qualifications",
        "url": "https://notary.utah.gov/qualifications-and-process/",
        "reference": "Qualifications; Required Information Checklist",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ut-guide",
        "title": "Utah Notary Public Study Guide and Handbook",
        "url": "https://notary.utah.gov/wp-content/uploads/UtahNotaryPublicStudyGuideandHandbook-5-16-2022.pdf",
        "reference": "Taking the Test, p. 4",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ut-journal-2026",
        "title": "2026 Study Guide Supplement — Notary Journal",
        "url": "https://notary.utah.gov/wp-content/uploads/Notary-Journal-5-6.pdf",
        "reference": "6 Things to Know; Notary Journals Required Beginning May 6, 2026",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ut-code",
        "title": "Utah Code Title 46 Chapter 1",
        "url": "https://le.utah.gov/xcode/Title46/Chapter1/C46-1_1800010118000101.pdf",
        "reference": "Sections 46-1-2, 46-1-3.5 through 46-1-4, 46-1-10, 46-1-13",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ut-faq",
        "title": "Utah Notary FAQs",
        "url": "https://notary.utah.gov/faqs/",
        "reference": "Notarial Acts & Definitions; Process & Scenarios",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "ut-home",
        "title": "Utah Notary — Reapply",
        "url": "https://notary.utah.gov/",
        "reference": "Manage account — reapplication",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 35,
      "minutes": null,
      "passing": "61 of 65 weighted points",
      "credential": "Certificate of Authority of Notary Public"
    },
    "difference": "Utah uses a weighted examination score. The 2026 journal change makes the commission issuance date important for ordinary notarial recordkeeping.",
    "topics": [
      {
        "id": "commission",
        "label": "Application and weighted examination"
      },
      {
        "id": "acts",
        "label": "Acknowledgments and jurats"
      },
      {
        "id": "copies",
        "label": "Copy certification"
      },
      {
        "id": "journal",
        "label": "2026 journal requirements"
      },
      {
        "id": "remote",
        "label": "Remote authority and limits"
      }
    ],
    "questions": [
      {
        "id": "ut-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An applicant passes Utah's online examination and assumes she can immediately start notarizing. Which additional action is part of completing her application?",
        "options": [
          "Upload her signed bond and notarized oath and complete the background-check process",
          "Use the passing screen as her stamp",
          "Wait for a county clerk to waive the bond",
          "Have her employer issue the state certificate"
        ],
        "answer": "A",
        "explanation": "Passing the test is one step. The state also requires the background check, bond and oath process.",
        "feedback": [
          "Correct. These steps remain necessary.",
          "A passing screen does not replace commissioning or a stamp.",
          "The application requires the bond.",
          "The state issues the Certificate of Authority."
        ],
        "sourceId": "ut-process",
        "reference": "Required Information Checklist, steps 4–8"
      },
      {
        "id": "ut-002",
        "topic": "jurats",
        "studyTopic": "acts",
        "stem": "A Utah signer requests a jurat and is willing to sign, but asks the notary to skip the oath or affirmation. What should the notary require?",
        "options": [
          "Only the signature",
          "An oath or affirmation as well as the required signing and identification",
          "Only payment",
          "An acknowledgment selected by the notary without asking"
        ],
        "answer": "B",
        "explanation": "A jurat includes an oath or affirmation about the document's truthfulness.",
        "feedback": [
          "A signature alone does not complete a jurat.",
          "Correct. The oath or affirmation is essential.",
          "Payment does not replace the ceremony.",
          "The requested act cannot be silently changed."
        ],
        "sourceId": "ut-faq",
        "reference": "Notarial Acts & Definitions — What is a Jurat?"
      },
      {
        "id": "ut-003",
        "topic": "copy-certification",
        "studyTopic": "copies",
        "stem": "A Utah customer brings a birth certificate and asks a notary to certify a photocopy as an official copy. Which response follows the state's copy-certification rule?",
        "options": [
          "Certify it if the customer signs the copy",
          "Certify it after adding a disclaimer",
          "Decline the copy certification because it is a public record",
          "Certify it for a larger fee"
        ],
        "answer": "C",
        "explanation": "Utah copy certification excludes public records and publicly recorded documents.",
        "feedback": [
          "A customer signature does not remove the public-record restriction.",
          "A disclaimer does not authorize the certification.",
          "Correct. A birth certificate falls within the exclusion.",
          "A higher fee does not change the permitted act."
        ],
        "sourceId": "ut-code",
        "reference": "46-1-2(4), definition of copy certification"
      },
      {
        "id": "ut-004",
        "topic": "journals",
        "studyTopic": "journal",
        "stem": "Alex receives his first Utah commission in June 2026 and performs ordinary in-person notarizations outside any exempt employment. What journal format is required?",
        "options": [
          "Any spreadsheet only",
          "No journal until his second term",
          "An audio recording only",
          "A secure physical journal"
        ],
        "answer": "D",
        "explanation": "A commission received on or after May 6, 2026 requires a physical journal for nonremote acts, subject to statutory exceptions.",
        "feedback": [
          "Ordinary acts require the physical journal.",
          "The requirement applies to Alex's first commission.",
          "A recording does not replace the journal.",
          "Correct. Alex falls within the updated requirement."
        ],
        "sourceId": "ut-journal-2026",
        "reference": "Items 1–2; Notary Journals Required Beginning May 6, 2026"
      },
      {
        "id": "ut-005",
        "topic": "journals",
        "studyTopic": "journal",
        "stem": "A Utah notary subject to the 2026 journal requirement refuses a requested notarization. What should she record under the official supplement?",
        "options": [
          "Nothing because no certificate was issued",
          "An entry documenting the refusal",
          "Only the fee she would have charged",
          "Only a note if the customer complains"
        ],
        "answer": "B",
        "explanation": "The supplement requires entries for notarizations, refusals and permitted journal-entry inspections.",
        "feedback": [
          "Refusals are among the events requiring entries.",
          "Correct. The refusal belongs in the journal.",
          "A hypothetical fee alone does not document the refusal.",
          "A complaint is not a condition for recordkeeping."
        ],
        "sourceId": "ut-journal-2026",
        "reference": "6 Things to Know, item 3"
      },
      {
        "id": "ut-006",
        "topic": "journals",
        "studyTopic": "journal",
        "stem": "Nora stops being a Utah notary two years after the last act recorded in her required journal. When does the ordinary retention period end?",
        "options": [
          "On resignation",
          "Four years after the commission began",
          "Ten years after the last recorded act",
          "When the employer changes"
        ],
        "answer": "C",
        "explanation": "The journal must be retained for ten years after its last recorded act even after the notary leaves office.",
        "feedback": [
          "Leaving office does not end retention.",
          "The retention clock uses the last act, not the term's start.",
          "Correct. The last recorded act starts the ten-year period.",
          "A workplace change does not end retention."
        ],
        "sourceId": "ut-journal-2026",
        "reference": "6 Things to Know, item 5"
      },
      {
        "id": "ut-007",
        "topic": "electronic-ron",
        "studyTopic": "remote",
        "stem": "A Utah-certified remote notary is visiting Nevada. A Utah client requests a remote notarization. What location rule controls?",
        "options": [
          "The remote notary must be physically in Utah",
          "The client being in Utah is enough",
          "An employer may authorize notarizing from Nevada",
          "Any U.S. location is allowed after certification"
        ],
        "answer": "A",
        "explanation": "Section 46-1-3.6 requires the remote notary to be physically located in Utah.",
        "feedback": [
          "Correct. Return to Utah before performing the Utah remote act.",
          "Client location does not satisfy the notary-location rule.",
          "An employer cannot expand statutory authority.",
          "Certification does not remove the Utah location requirement."
        ],
        "sourceId": "ut-code",
        "reference": "46-1-3.6(1)"
      },
      {
        "id": "ut-008",
        "topic": "prohibited-acts",
        "studyTopic": "remote",
        "stem": "A Utah notary wants to stamp a supplement advertisement with her official seal to imply state endorsement. Which rule applies?",
        "options": [
          "It is allowed if she owns the business",
          "It is allowed without a fee",
          "It is allowed for products sold only in Utah",
          "Her title or seal cannot be used to promote a product"
        ],
        "answer": "D",
        "explanation": "Utah prohibits using the notarial title or seal to endorse or promote offerings.",
        "feedback": [
          "Ownership does not create an advertising exception.",
          "Free promotion is still promotion.",
          "Local sales do not create an exception.",
          "Correct. The official seal cannot endorse the product."
        ],
        "sourceId": "ut-code",
        "reference": "46-1-10, Testimonials prohibited"
      },
      {
        "id": "ut-009",
        "topic": "acknowledgments",
        "studyTopic": "acts",
        "stem": "A Utah customer signed a lease yesterday and appears today to acknowledge the voluntary signature. Must an acknowledgment always require signing again in front of the notary?",
        "options": [
          "Yes, every acknowledgment requires a new signature",
          "No, the signer may acknowledge a previously made voluntary signature",
          "No appearance is needed if the lease is signed",
          "Only if the landlord is present"
        ],
        "answer": "B",
        "explanation": "For an acknowledgment, the signer must appear but may acknowledge a signature already made.",
        "feedback": [
          "The FAQ permits acknowledgment of an earlier signature.",
          "Correct. The required acknowledgment still occurs before the notary.",
          "The existing signature does not waive appearance.",
          "The landlord's presence does not decide this rule."
        ],
        "sourceId": "ut-faq",
        "reference": "Notarial Acts & Definitions — What is an Acknowledgement?"
      },
      {
        "id": "ut-010",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Jordan's Utah test score is 60 out of 65 weighted points. His employer says that is a passing percentage. What do the official test instructions require?",
        "options": [
          "A simple majority of questions",
          "60 points if an employer approves",
          "At least 61 weighted points",
          "Only the ten four-point questions"
        ],
        "answer": "C",
        "explanation": "The official study guide sets the passing threshold at 61 points out of 65.",
        "feedback": [
          "The published threshold is weighted points.",
          "An employer cannot lower the state threshold.",
          "Correct. Sixty points falls short.",
          "All scored questions contribute to the threshold."
        ],
        "sourceId": "ut-guide",
        "reference": "Taking the Test, p. 4"
      }
    ]
  },
  "VT": {
    "code": "VT",
    "name": "Vermont",
    "slug": "vermont",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "Ordinary applicants complete the OPR jurisprudence examination and submit an online application with a notarized oath. Exemptions depend on profession and official duties.",
    "training": "The opened ordinary first-application instructions require a jurisprudence examination and notarized oath. They do not prescribe a separate general prelicensing classroom course. Continuing education is a renewal requirement.",
    "assessment": "The May 2026 OPR examination is open book. Its answer sheet contains 30 items. Upload only the completed answer sheet to the online application. More than six incorrect answers requires a retake.",
    "steps": [
      "Check age, citizenship or permanent legal residency, Vermont residence or employment/practice, and any applicable exemption.",
      "Complete, sign and have the oath of office notarized before filling out the application.",
      "Complete the jurisprudence examination unless an exemption applies.",
      "Apply through OPR Online Services, upload the oath and required examination answer sheet, and pay the applicable fee.",
      "Wait for commission issuance and follow the separate endorsement process for electronic or remote work."
    ],
    "exceptions": [
      "Vermont attorneys in good standing are exempt from the ordinary examination and commission-renewal CE, while still subject to the remaining requirements.",
      "Judiciary-related employees performing official duties must obtain a commission but have specified exam, fee and CE exemptions.",
      "Town clerks, their assistants and justices of the peace have a fee exemption, with other ordinary requirements continuing to apply.",
      "Law-enforcement-related employees have a commission and endorsement exemption for acts within their official duties. Private work requires the applicable commission and authority."
    ],
    "renewal": "Commissions run on a fixed two-year cycle. The February 2026 renewal instructions require one hour of approved CE unless exempt. The Remote and Electronic Specialty requires one additional relevant hour. Renewal opens six weeks before the printed expiration date.",
    "ron": "A commissioned notary needs a special endorsement for electronic-record or remotely located-individual acts. The endorsed notary must be physically in Vermont, satisfy identity and technology rules, and arrange required audiovisual recording and retention.",
    "officialNext": {
      "label": "Vermont OPR notary application instructions",
      "url": "https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/notary_public/notary_public_application_instructions.pdf"
    },
    "sources": [
      {
        "id": "vt-application",
        "title": "Notary Public Application Instructions, February 2026",
        "url": "https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/notary_public/notary_public_application_instructions.pdf",
        "reference": "Apply by Registration",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-exam",
        "title": "Notaries Public Jurisprudence Examination #1, May 2026",
        "url": "https://outside.vermont.gov/dept/sos/office_professional_regulation/exams/notary_public_state_jurisprudence_exam.pdf",
        "reference": "Directions and Information; answer sheet",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-rules",
        "title": "Administrative Rules for Notaries Public, effective February 26, 2025",
        "url": "https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/notary_public/notary_public_administrative_rules.pdf",
        "reference": "Parts 4-3, 4-4, 4-7 through 4-9, 6, 9-1",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-renewal",
        "title": "Notary Renewal Instructions, February 2026",
        "url": "https://outside.vermont.gov/dept/sos/office_professional_regulation/professions/notary_public/notary_public_renewal_instructions.pdf",
        "reference": "Steps to renew",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-5341",
        "title": "26 V.S.A. § 5341 — Commission and qualifications",
        "url": "https://legislature.vermont.gov/statutes/section/26/103/05341",
        "reference": "Subsections (b)–(e)",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-5364",
        "title": "26 V.S.A. § 5364 — Personal appearance",
        "url": "https://legislature.vermont.gov/statutes/section/26/103/05364",
        "reference": "Subsection (a)",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-5365",
        "title": "26 V.S.A. § 5365 — Identification",
        "url": "https://legislature.vermont.gov/statutes/section/26/103/05365",
        "reference": "Subsection (b)",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-5367",
        "title": "26 V.S.A. § 5367 — Certificate of notarial act",
        "url": "https://legislature.vermont.gov/statutes/section/26/103/05367",
        "reference": "Subsections (a)–(b)",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-5372",
        "title": "26 V.S.A. § 5372 — Authority to refuse",
        "url": "https://legislature.vermont.gov/statutes/section/26/103/05372",
        "reference": "Subsection (a)",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "vt-5379",
        "title": "26 V.S.A. § 5379 — Remotely located individual",
        "url": "https://legislature.vermont.gov/statutes/section/26/103/05379",
        "reference": "Subsections (a), (b), (k)",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 30,
      "minutes": null,
      "passing": "No more than six incorrect answers on the 30-item state examination",
      "credential": "OPR notary public commission"
    },
    "difference": "Vermont uses an open-book jurisprudence answer sheet uploaded with the application and profession-specific exemptions. Remote and electronic work requires a special endorsement.",
    "topics": [
      {
        "id": "commission",
        "label": "Application and examination"
      },
      {
        "id": "exemptions",
        "label": "Professional exemptions"
      },
      {
        "id": "identity",
        "label": "Appearance and identity"
      },
      {
        "id": "certificates",
        "label": "Certificates and voluntary signing"
      },
      {
        "id": "renewal-remote",
        "label": "Renewal and special endorsement"
      }
    ],
    "questions": [
      {
        "id": "vt-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Priya completes the current Vermont open-book jurisprudence exam. What do its directions tell her to upload with the online application?",
        "options": [
          "Only the completed answer sheet",
          "A recording of herself taking it",
          "Every page of her study notes",
          "A commercial training advertisement"
        ],
        "answer": "A",
        "explanation": "The examination directions instruct applicants to upload only the answer sheet.",
        "feedback": [
          "Correct. Submit the answer sheet as directed.",
          "The published directions do not require a video.",
          "Study notes are not the required submission.",
          "An advertisement does not document examination answers."
        ],
        "sourceId": "vt-exam",
        "reference": "Directions and Information, item 2"
      },
      {
        "id": "vt-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A first-time Vermont applicant begins gathering documents. When do the February 2026 instructions say to complete the notarized oath?",
        "options": [
          "After performing her first act",
          "Before filling out the online application",
          "Only when renewing",
          "After her employer requests it"
        ],
        "answer": "B",
        "explanation": "The application instructions direct applicants to complete the notarized oath before filling out the application.",
        "feedback": [
          "Commissioning requirements precede practice.",
          "Correct. Complete the oath first, then upload it.",
          "The oath belongs to the initial application process.",
          "An employer request is not the trigger."
        ],
        "sourceId": "vt-application",
        "reference": "Apply by Registration — Oath of Office"
      },
      {
        "id": "vt-003",
        "topic": "commission",
        "studyTopic": "exemptions",
        "stem": "A Vermont attorney in good standing wants a notary commission. Which ordinary requirement is expressly waived for this applicant by Rule 4-3?",
        "options": [
          "Every requirement, including applying",
          "The obligation to follow notarial law",
          "The ordinary jurisprudence examination",
          "The need for a remote special endorsement"
        ],
        "answer": "C",
        "explanation": "Rule 4-3(b) exempts qualifying Vermont attorneys from the ordinary examination and commission-renewal CE.",
        "feedback": [
          "The exemption does not eliminate the commission application.",
          "Attorneys remain subject to notarial law.",
          "Correct. The ordinary examination is expressly exempted.",
          "This exemption concerns commissions, not special endorsements."
        ],
        "sourceId": "vt-rules",
        "reference": "Rule 4-3(b)"
      },
      {
        "id": "vt-004",
        "topic": "identification",
        "studyTopic": "identity",
        "stem": "At an in-person Vermont appointment, a signer offers a government driver's license that expired two years ago. Which statement matches § 5365?",
        "options": [
          "Every expired license is automatically forbidden",
          "It can fall within the statute's three-year expiration allowance",
          "Any license is acceptable regardless of age",
          "A store membership card must replace it"
        ],
        "answer": "B",
        "explanation": "The statute permits a driver's license current or expired no more than three years before the act.",
        "feedback": [
          "The statute includes a limited expired-ID allowance.",
          "Correct. Two years is within that allowance.",
          "The expiration allowance is limited to three years.",
          "A store card is not the listed government credential."
        ],
        "sourceId": "vt-5365",
        "reference": "26 V.S.A. § 5365(b)(1)(A)"
      },
      {
        "id": "vt-005",
        "topic": "prohibited-acts",
        "studyTopic": "certificates",
        "stem": "A Vermont signer tells the notary she is signing only because a companion is threatening her. What may the notary do?",
        "options": [
          "Rely only on the companion's approval",
          "Ignore voluntariness if the ID is valid",
          "Complete the act because the fee was paid",
          "Refuse when not satisfied that the signature is voluntary"
        ],
        "answer": "D",
        "explanation": "Section 5372 permits refusal when the notary is not satisfied that a signature is knowingly and voluntarily made.",
        "feedback": [
          "The companion cannot supply the signer's voluntariness.",
          "Valid ID does not resolve coercion.",
          "Payment does not cure involuntary signing.",
          "Correct. The statute permits refusal on this ground."
        ],
        "sourceId": "vt-5372",
        "reference": "26 V.S.A. § 5372(a)(2)"
      },
      {
        "id": "vt-006",
        "topic": "acknowledgments",
        "studyTopic": "identity",
        "stem": "A courier brings a signed paper to a Vermont notary for acknowledgment. The signer will neither attend nor use an authorized remote process. What should the notary require?",
        "options": [
          "The signer's required personal appearance",
          "Only the courier's identity",
          "A photocopy of the absent signer's ID",
          "A promise that the signer is nearby"
        ],
        "answer": "A",
        "explanation": "For an act involving a signature, the individual executing it must appear personally before the notary.",
        "feedback": [
          "Correct. An absent signer cannot be replaced by a delivery service.",
          "Identifying the courier does not identify an appearing signer.",
          "An ID copy does not satisfy appearance.",
          "Being nearby does not constitute appearance."
        ],
        "sourceId": "vt-5364",
        "reference": "26 V.S.A. § 5364(a)"
      },
      {
        "id": "vt-007",
        "topic": "seals-fees",
        "studyTopic": "certificates",
        "stem": "A Vermont notary has no physical stamp for a tangible-record certificate. What alternative does § 5367(b)(1) provide, assuming all other certificate requirements are met?",
        "options": [
          "Leave the certificate unsigned",
          "Clearly print or type the notary's name and commission number",
          "Use the customer's business logo",
          "Borrow another notary's stamp"
        ],
        "answer": "B",
        "explanation": "The statute allows the notary's clearly printed or typed name and commission number in place of a physical official stamp for a tangible record.",
        "feedback": [
          "The notary must still sign the certificate.",
          "Correct. This is the statutory alternative.",
          "A logo does not supply the required identification.",
          "Another notary's stamp does not identify the acting notary."
        ],
        "sourceId": "vt-5367",
        "reference": "26 V.S.A. § 5367(a), (b)(1)"
      },
      {
        "id": "vt-008",
        "topic": "electronic-ron",
        "studyTopic": "renewal-remote",
        "stem": "A newly commissioned Vermont notary wants to begin notarizing electronic records for remote signers. What additional authority must she obtain?",
        "options": [
          "Only an ordinary email account",
          "Only permission from the customer",
          "An OPR special commission endorsement",
          "A seal purchased from any vendor"
        ],
        "answer": "C",
        "explanation": "Section 5341 requires the special endorsement for electronic-record and remotely located-individual acts.",
        "feedback": [
          "Email access does not confer authority.",
          "Customer consent does not replace endorsement.",
          "Correct. Obtain the OPR endorsement and meet its requirements.",
          "Purchasing equipment does not expand the commission."
        ],
        "sourceId": "vt-5341",
        "reference": "26 V.S.A. § 5341(d)–(e)"
      },
      {
        "id": "vt-009",
        "topic": "commission",
        "studyTopic": "renewal-remote",
        "stem": "For an ordinary Vermont renewal with no CE exemption, Sam holds no remote or electronic specialty. What CE does the February 2026 renewal instruction require?",
        "options": [
          "Ten hours",
          "No CE for any notary",
          "One hour of approved CE",
          "One hour only after renewal is approved"
        ],
        "answer": "C",
        "explanation": "The current renewal instructions require one hour of approved CE for an ordinary nonexempt renewal.",
        "feedback": [
          "Ten hours is not the stated ordinary requirement.",
          "The general rule requires CE unless an exemption applies.",
          "Correct. The ordinary requirement is one approved hour.",
          "Complete and document CE for the renewal application."
        ],
        "sourceId": "vt-renewal",
        "reference": "Steps to renew — approved continuing education"
      },
      {
        "id": "vt-010",
        "topic": "electronic-ron",
        "studyTopic": "renewal-remote",
        "stem": "A Vermont notary with a special endorsement travels to Massachusetts. Can she use that Vermont authority to perform a remote act while physically there?",
        "options": [
          "Yes, if the signer is in Vermont",
          "Yes, if the platform is based in Vermont",
          "Yes, with the customer's written consent",
          "No, the Vermont remote act requires the notary to be located in Vermont"
        ],
        "answer": "D",
        "explanation": "Section 5379 authorizes an endorsed notary located in Vermont to perform the remote act.",
        "feedback": [
          "The signer's location does not replace the notary's location requirement.",
          "Platform headquarters do not control the notary's location.",
          "Consent cannot expand territorial authority.",
          "Correct. The notary must be located in Vermont."
        ],
        "sourceId": "vt-5379",
        "reference": "26 V.S.A. § 5379(b)"
      }
    ]
  },
  "WI": {
    "code": "WI",
    "name": "Wisconsin",
    "slug": "wisconsin",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "Ordinary four-year applicants pass the DFI online examination, prepare a seal, oath and $500 bond, and finish the commission application.",
    "training": "DFI provides a free seven-chapter tutorial with practice quizzes. Applicants who already know the material may proceed directly to the final examination. The final examination is required for ordinary four-year applicants.",
    "assessment": "The official online final has 30 questions, requires at least 90%, and must be completed in one sitting. Save the passing certificate yourself because DFI's instructions say the system does not retain the score or regenerate the certificate. No numerical time limit was established in the opened instructions.",
    "steps": [
      "Use the DFI commissioning page and create the required online account.",
      "Study the tutorial as needed, pass the examination and save the certificate.",
      "Obtain a Wisconsin-compliant seal or stamp and begin the four-year application.",
      "Complete the oath before a current notarial officer and obtain the required $500 surety bond.",
      "Submit the application, required documents and seal/signature samples with the applicable fee, following current DFI directions.",
      "Wait for notice that the commission has been issued before performing acts."
    ],
    "exceptions": [
      "Wisconsin-licensed attorneys in good standing may apply for a permanent commission through a separate route with a recent certificate of good standing. Permanent commissions do not require the ordinary four-year bond.",
      "The general tutorial readings and chapter quizzes may be skipped by a prepared applicant, but the ordinary four-year final examination remains required.",
      "The official application page announces a new online system for November 16, 2026 at 7 a.m. Central Time. Follow that page for the current filing route."
    ],
    "renewal": "Four-year renewals also require a passing examination of at least 90%, taken no more than one year before the commission or renewal date. Renew the application and required bond and oath materials through DFI.",
    "ron": "Wisconsin notaries use DFI-approved communication technology providers and must be trained and authorized for the chosen system. The notary remains physically in Wisconsin. Follow the current provider requirements before offering remote acts.",
    "officialNext": {
      "label": "Wisconsin DFI commissioning steps",
      "url": "https://dfi.wi.gov/Pages/ConsumerServices/NotaryPublic/NotaryFileOnline.aspx"
    },
    "sources": [
      {
        "id": "wi-file",
        "title": "DFI Notary File Online",
        "url": "https://dfi.wi.gov/Pages/ConsumerServices/NotaryPublic/NotaryFileOnline.aspx",
        "reference": "4-year Notary; Permanent Notary; November 16, 2026 system notice",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wi-intro",
        "title": "DFI Notary Public Tutorial — Introduction",
        "url": "https://apps.dfi.wi.gov/apps/notarytutorialexam/Introduction.aspx",
        "reference": "Required examination, optional tutorial readings and renewals",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wi-exam",
        "title": "DFI Final Exam Instruction Page",
        "url": "https://apps.dfi.wi.gov/apps/notarytutorialexam/FinalExamInstructions.aspx",
        "reference": "Instructions 1–5",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wi-ch1",
        "title": "DFI Tutorial Chapter 1 — General Information",
        "url": "https://apps.dfi.wi.gov/apps/NotaryTutorialExam/Chapter1.aspx",
        "reference": "Four-year commissions; Attorneys; Bonding; Notary Seal; When and Where",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wi-ch5",
        "title": "DFI Tutorial Chapter 5 — Maintenance",
        "url": "https://apps.dfi.wi.gov/apps/notarytutorialexam/Chapter5.aspx",
        "reference": "Changes; Lost or Stolen Notary Seal or Stamp",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wi-handbook",
        "title": "Wisconsin Notary Public Handbook, revised September 2024",
        "url": "https://dfi.wi.gov/Documents/ConsumerServices/NotaryPublic/NotaryHandbook.pdf",
        "reference": "Notarial Acts, pp. 10–15",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wi-ron",
        "title": "DFI Guidance for Seeking Remote Online Notarial Services",
        "url": "https://dfi.wi.gov/Pages/ConsumerServices/NotaryPublic/OnlineNotarialServicesGuidance.aspx",
        "reference": "State-approved communication technology and trained, authorized notaries",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 30,
      "minutes": null,
      "passing": "90% or higher",
      "credential": "Passing examination certificate for four-year commission application"
    },
    "difference": "Wisconsin's free tutorial is optional preparation for the required four-year application examination. Wisconsin attorneys have a separate permanent-commission route.",
    "topics": [
      {
        "id": "commission",
        "label": "Examination and application"
      },
      {
        "id": "supplies",
        "label": "Bond and stamp"
      },
      {
        "id": "acts",
        "label": "Acknowledgments and sworn statements"
      },
      {
        "id": "maintenance",
        "label": "Commission maintenance"
      },
      {
        "id": "remote",
        "label": "Approved remote systems"
      }
    ],
    "questions": [
      {
        "id": "wi-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Taylor already knows Wisconsin notarial duties and wants to apply for an ordinary four-year commission. What may Taylor skip under the DFI tutorial introduction?",
        "options": [
          "The final examination",
          "The chapter readings and practice quizzes",
          "The application itself",
          "The oath and bond"
        ],
        "answer": "B",
        "explanation": "A prepared applicant may go directly to the final, which remains required for ordinary four-year applicants.",
        "feedback": [
          "The four-year final remains required.",
          "Correct. DFI permits direct access to the final.",
          "Knowledge does not replace an application.",
          "The ordinary oath and bond requirements remain."
        ],
        "sourceId": "wi-intro",
        "reference": "Introduction — direct access to the final examination"
      },
      {
        "id": "wi-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "Morgan passes the Wisconsin final and closes the browser without saving the certificate. What instruction should Morgan have followed?",
        "options": [
          "Rely on DFI to regenerate it later",
          "Wait for the school to mail it",
          "Save the certificate from the browser for submission",
          "Use a screenshot of an unanswered test"
        ],
        "answer": "C",
        "explanation": "DFI says the score and certificate are not stored in its system and cannot be regenerated by the office.",
        "feedback": [
          "The instructions expressly say DFI cannot regenerate it.",
          "The instructions direct the applicant to save it.",
          "Correct. Preserve the passing certificate yourself.",
          "An unanswered test does not establish a passing result."
        ],
        "sourceId": "wi-exam",
        "reference": "Final Exam Instruction Page, item 5"
      },
      {
        "id": "wi-003",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Wisconsin four-year renewal applicant passed the online final 18 months before the proposed renewal date. What does the tutorial introduction require?",
        "options": [
          "Use any passing exam forever",
          "Skip the exam because this is a renewal",
          "Submit only an employer's letter",
          "Obtain a passing result within the one-year window"
        ],
        "answer": "D",
        "explanation": "The final must be passed at 90% or better no more than one year before the commission or renewal date.",
        "feedback": [
          "The result has a stated one-year window.",
          "Four-year renewals also require the examination.",
          "An employer letter does not replace the result.",
          "Correct. The 18-month-old result falls outside the window."
        ],
        "sourceId": "wi-intro",
        "reference": "Introduction — examination requirement for new and renewing four-year applicants"
      },
      {
        "id": "wi-004",
        "topic": "seals-fees",
        "studyTopic": "supplies",
        "stem": "A Wisconsin four-year applicant has general workplace insurance and asks if it replaces the notary bond. What is required?",
        "options": [
          "A separate $500 notary surety bond",
          "Only an employer's blanket policy",
          "Only personal health insurance",
          "A bond only if the applicant charges fees"
        ],
        "answer": "A",
        "explanation": "Chapter 1 requires the specific $500 bond and says an employment blanket bond does not fulfill the obligation.",
        "feedback": [
          "Correct. Obtain the required notary bond.",
          "The tutorial excludes an employment blanket bond as a substitute.",
          "Health insurance does not satisfy surety bonding.",
          "The ordinary bond requirement is not conditioned on charging fees."
        ],
        "sourceId": "wi-ch1",
        "reference": "Bonding"
      },
      {
        "id": "wi-005",
        "topic": "seals-fees",
        "studyTopic": "supplies",
        "stem": "A Wisconsin applicant wants to put only her first name on the official stamp. Which naming rule applies?",
        "options": [
          "Any nickname is enough",
          "Only initials are required",
          "Her full current last name must be included",
          "The employer's name replaces her name"
        ],
        "answer": "C",
        "explanation": "DFI permits certain shortened first names or initials but requires the current last name in full.",
        "feedback": [
          "The stamp must satisfy the prescribed naming rule.",
          "Initials cannot replace the full current last name.",
          "Correct. Include the full current last name.",
          "The stamp identifies the notary, not the employer."
        ],
        "sourceId": "wi-ch1",
        "reference": "The Notary Seal"
      },
      {
        "id": "wi-006",
        "topic": "acknowledgments",
        "studyTopic": "acts",
        "stem": "A Wisconsin signer appears with a document signed last night and requests an acknowledgment. Assuming identity, capacity and voluntariness are established, which statement is correct?",
        "options": [
          "A previous signature always prevents acknowledgment",
          "The signer may acknowledge the previously made signature",
          "The signer can stay absent because the document is signed",
          "The notary must swear that every statement in the document is true"
        ],
        "answer": "B",
        "explanation": "An acknowledgment may cover a previously made signature when the signer appears and confirms the required execution.",
        "feedback": [
          "The handbook allows an acknowledgment of an earlier signature.",
          "Correct. The required appearance and acknowledgment still occur.",
          "An existing signature does not eliminate appearance.",
          "An acknowledgment does not make the notary swear to the document's contents."
        ],
        "sourceId": "wi-handbook",
        "reference": "Must I see the person sign the document?, p. 11; Taking an Acknowledgment, pp. 12–13"
      },
      {
        "id": "wi-007",
        "topic": "jurats",
        "studyTopic": "acts",
        "stem": "A Wisconsin customer requests notarization of a sworn affidavit. The notary checks ID and watches the signature but gives no oath or affirmation. What is missing?",
        "options": [
          "A second stamp impression",
          "The employer's approval",
          "A second application fee",
          "The signer's oath or affirmation to the truth of the statements"
        ],
        "answer": "D",
        "explanation": "A sworn or affirmed document requires the signer to swear or affirm the truthfulness of its statements.",
        "feedback": [
          "An extra stamp does not supply the missing ceremony.",
          "Employer approval does not create an oath.",
          "A fee does not complete the sworn act.",
          "Correct. Administer the required oath or affirmation."
        ],
        "sourceId": "wi-handbook",
        "reference": "Notarizing a Sworn or Affirmed Document, pp. 14–15"
      },
      {
        "id": "wi-008",
        "topic": "commission",
        "studyTopic": "maintenance",
        "stem": "A Wisconsin notary changes her contact email. What deadline does the DFI maintenance chapter give for notifying DFI in writing?",
        "options": [
          "Ten days after the change",
          "At the next four-year renewal",
          "One year after the change",
          "Only after mail is returned"
        ],
        "answer": "A",
        "explanation": "DFI's maintenance instructions require written notice within ten days of contact-information changes, including email.",
        "feedback": [
          "Correct. The chapter specifies ten days.",
          "Waiting for renewal misses the stated deadline.",
          "One year exceeds the deadline.",
          "Returned mail is not the trigger."
        ],
        "sourceId": "wi-ch5",
        "reference": "Changes — Change of contact information"
      },
      {
        "id": "wi-009",
        "topic": "seals-fees",
        "studyTopic": "maintenance",
        "stem": "A Wisconsin notary discovers that her stamp was stolen. Which response follows DFI's maintenance instructions?",
        "options": [
          "Say nothing and order an identical stamp",
          "Let a colleague lend her a stamp",
          "Notify DFI immediately in writing and follow its replacement-stamp filing process",
          "Keep notarizing with only the word seal written on the page"
        ],
        "answer": "C",
        "explanation": "DFI directs immediate written notice, a differently appearing replacement, and filing of the replacement sample before use as instructed.",
        "feedback": [
          "The instructions require notice and a different appearance.",
          "A colleague's stamp cannot identify the acting notary.",
          "Correct. Follow DFI's replacement process.",
          "Writing the word seal does not complete the replacement procedure."
        ],
        "sourceId": "wi-ch5",
        "reference": "Lost or Stolen Notary Seal or Stamp"
      },
      {
        "id": "wi-010",
        "topic": "electronic-ron",
        "studyTopic": "remote",
        "stem": "A commissioned Wisconsin notary wants to offer RON using an ordinary video chat app. Which preparation does DFI's guidance identify?",
        "options": [
          "Use any app once the customer consents",
          "Use an approved provider and become trained and authorized for its system",
          "Only buy a webcam",
          "Ask the customer's employer to waive technology requirements"
        ],
        "answer": "B",
        "explanation": "DFI identifies approved communication technology and notaries trained and authorized to use those systems.",
        "feedback": [
          "Consent alone does not establish an approved system.",
          "Correct. Use the approved provider process.",
          "A webcam does not establish system compliance.",
          "An employer cannot waive the state requirements."
        ],
        "sourceId": "wi-ron",
        "reference": "Guidance — Wisconsin notaries utilizing state-approved providers"
      }
    ]
  },
  "WY": {
    "code": "WY",
    "name": "Wyoming",
    "slug": "wyoming",
    "group": "onlineApplicationOrTraining",
    "processKind": "Application assessment",
    "summary": "Review the required education, pass the examination included with the commission application or an approved alternative, and submit the notarized application and fee.",
    "training": "Review the Secretary of State's Notary Education Presentation for each term and certify completion. State-approved entities may provide alternative education and examinations.",
    "assessment": "The Secretary of State's January 2026 paper application includes a 20-item true/false examination. At least 14 correct answers are required. An applicant submitting an approved vendor's completion certificate may skip the form's examination section. No official time limit was established in the opened materials.",
    "steps": [
      "Confirm eligibility and review the Notary Education Presentation or use an approved education and examination provider.",
      "Complete all application sections, including the examination, or attach the approved provider certificate as instructed.",
      "Sign and swear or affirm the oath before another commissioned notary.",
      "Deliver or mail the hard-copy application with the $60 fee, following the current form's payment instructions.",
      "Receive the appointment letter and six-year commission certificate, then obtain the prescribed new stamp.",
      "Set up secure journal records and give the required technology notice before electronic or remote acts."
    ],
    "exceptions": [
      "An approved education/examination provider certificate substitutes for Part III of the Secretary of State application.",
      "A bond or E&O insurance is voluntary and is not filed with the county or state under the current application instructions.",
      "Eligibility can be based on Wyoming residence, employment or practice, or qualifying military-family status. All other qualifications still apply."
    ],
    "renewal": "Every six-year term requires education and an examination. The same application form covers a new commission and renewal, and a new compliant stamp is required for each renewed term.",
    "ron": "Before the first electronic-record or remote act, notify the Secretary of State and identify the intended technology. Wyoming recognizes remote online and remote ink processes with different requirements. All remote acts require an audiovisual recording, and the certificate must identify the technology used.",
    "officialNext": {
      "label": "Wyoming official notary application and education",
      "url": "https://sos.wyo.gov/Services/Notaries.aspx"
    },
    "sources": [
      {
        "id": "wy-home",
        "title": "Wyoming Secretary of State — Notary Public",
        "url": "https://sos.wyo.gov/Services/Notaries.aspx",
        "reference": "Official forms and approved education/examination alternatives",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wy-application",
        "title": "Notary Public Commission Application/Renewal, revised January 2026",
        "url": "https://sos.wyo.gov/Forms/NotariesPublic/WYNotaryApp.pdf",
        "reference": "Instructions; Parts III–IV",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wy-education",
        "title": "Wyoming Notary Education Presentation",
        "url": "https://sos.wyo.gov/Services/Docs/Notary-Education-Presentation_effective-07.01.2021.pdf",
        "reference": "Notarial acts; Commission process; Education & Exam",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wy-code",
        "title": "Wyoming Statutes Title 32 — Notaries Public",
        "url": "https://wyoleg.gov/statutes/compress/title32.pdf",
        "reference": "32-3-104; 32-3-118; 32-3-120 through 32-3-121; 32-3-126",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wy-rules",
        "title": "Wyoming Notary Rules, Chapter 6",
        "url": "https://sos.wyo.gov/Services/Docs/Notary-Rules_current.pdf",
        "reference": "Sections 2–5; effective December 2, 2021 to Current",
        "checkedAt": "2026-11-14"
      },
      {
        "id": "wy-stamp",
        "title": "Notary Public Stamp/Seal Requirements",
        "url": "https://sos.wyo.gov/Services/Docs/Stamp-Requirements-and-Sample.pdf",
        "reference": "New stamp at renewal; prescribed contents",
        "checkedAt": "2026-11-14"
      }
    ],
    "specs": {
      "questions": 20,
      "minutes": null,
      "passing": "At least 14 of 20 correct on the Secretary of State application examination",
      "credential": "Certificate of Commission"
    },
    "difference": "Wyoming's state examination is attached to the paper application. Approved provider completion can replace that section, and education and examination recur each term.",
    "topics": [
      {
        "id": "commission",
        "label": "Application and each-term education"
      },
      {
        "id": "acts",
        "label": "Acknowledgments and copy certification"
      },
      {
        "id": "records",
        "label": "Journals and official stamp"
      },
      {
        "id": "fees",
        "label": "Notarial fees"
      },
      {
        "id": "remote",
        "label": "Remote technology and recording"
      }
    ],
    "questions": [
      {
        "id": "wy-001",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "A Wyoming applicant has completed education and examination through an entity approved by the Secretary of State. What do the January 2026 application instructions allow?",
        "options": [
          "Skip the entire application",
          "Attach the completion certificate and skip Part III",
          "Skip the notarized oath",
          "Have the provider issue the state commission"
        ],
        "answer": "B",
        "explanation": "The approved provider certificate permits skipping the form's Part III examination section.",
        "feedback": [
          "The application is still required.",
          "Correct. Attach the certificate as instructed.",
          "The oath still needs completion and notarization.",
          "The Secretary of State issues the commission."
        ],
        "sourceId": "wy-application",
        "reference": "Application Instructions — approved vendor certificate"
      },
      {
        "id": "wy-002",
        "topic": "commission",
        "studyTopic": "commission",
        "stem": "An experienced Wyoming notary applies for another six-year term and says education was completed years ago. What does Rule Chapter 6 require for the new term?",
        "options": [
          "No further education for experienced notaries",
          "Education only after a complaint",
          "Review the required education for every term",
          "Only an employer's recommendation"
        ],
        "answer": "C",
        "explanation": "Section 5 requires reviewing the Notary Education Presentation for every term and certifying completion on the application.",
        "feedback": [
          "Experience does not create an education exemption.",
          "A complaint is not the trigger for each-term education.",
          "Correct. The requirement recurs each term.",
          "An employer recommendation does not satisfy the rule."
        ],
        "sourceId": "wy-rules",
        "reference": "Chapter 6, Section 5"
      },
      {
        "id": "wy-003",
        "topic": "seals-fees",
        "studyTopic": "records",
        "stem": "A Wyoming notary renews and plans to handwrite the new expiration date beside an old stamp impression. What should the notary do?",
        "options": [
          "Use the old stamp indefinitely",
          "Remove the commission number from the old stamp",
          "Add the county of residence to validate it",
          "Obtain a new compliant stamp for the renewed term"
        ],
        "answer": "D",
        "explanation": "The official stamp requirements require a new stamp at every renewal.",
        "feedback": [
          "The requirements expressly call for a new stamp.",
          "The commission identification number is required content.",
          "County of residence is excluded from the prescribed stamp.",
          "Correct. The new term requires a new compliant stamp."
        ],
        "sourceId": "wy-stamp",
        "reference": "New stamp requirement; prescribed contents"
      },
      {
        "id": "wy-004",
        "topic": "acknowledgments",
        "studyTopic": "acts",
        "stem": "At a Wyoming appointment, a signer acknowledges on Thursday that she voluntarily signed the record on Monday. Which date belongs in the certificate for today's acknowledgment?",
        "options": [
          "Thursday, when the notarial act occurs",
          "Monday, because that is the signature date",
          "The date the document will be filed",
          "The commission expiration date"
        ],
        "answer": "A",
        "explanation": "The education presentation dates the acknowledgment on the day the notary performs it, even when the signature was made earlier.",
        "feedback": [
          "Correct. Use the date of the notarial act.",
          "The earlier signing date does not backdate the certificate.",
          "A later filing date does not date the acknowledgment.",
          "Expiration is separate certificate information."
        ],
        "sourceId": "wy-education",
        "reference": "Acknowledgment — Individual Capacity, slide 10"
      },
      {
        "id": "wy-005",
        "topic": "copy-certification",
        "studyTopic": "acts",
        "stem": "A Wyoming customer asks a notary to certify a photocopy of a birth certificate as a true official copy. What does the education presentation direct?",
        "options": [
          "Certify it if the paper is legible",
          "Certify it if two witnesses attend",
          "Direct the customer to the issuing or holding public entity",
          "Certify it after collecting a technology fee"
        ],
        "answer": "C",
        "explanation": "The presentation says official vital-record copies should come from the public entity holding or issuing them.",
        "feedback": [
          "Legibility does not authorize vital-record copy certification.",
          "Witnesses do not replace the official custodian.",
          "Correct. Obtain the official copy from the proper entity.",
          "A technology fee does not change the record's status."
        ],
        "sourceId": "wy-education",
        "reference": "True & Correct Copy Certification, slide 14"
      },
      {
        "id": "wy-006",
        "topic": "journals",
        "studyTopic": "records",
        "stem": "A Wyoming notary performs a routine paper acknowledgment for a coworker without charging a fee. What journal duty applies?",
        "options": [
          "Only paid acts need entries",
          "All performed notarial acts must be chronicled",
          "Only real-estate acts need entries",
          "An employer may waive the journal"
        ],
        "answer": "B",
        "explanation": "Section 32-3-118(d) requires the notary to maintain a journal chronicling all performed notarial acts.",
        "feedback": [
          "A fee is not a condition of the journal duty.",
          "Correct. Record the coworker's act too.",
          "The statute is not limited to real estate.",
          "An employer cannot waive the statutory duty."
        ],
        "sourceId": "wy-code",
        "reference": "W.S. 32-3-118(d)–(e)"
      },
      {
        "id": "wy-007",
        "topic": "journals",
        "studyTopic": "records",
        "stem": "A Wyoming notary discovers that her journal was stolen from a locked office. What must she do under Chapter 6?",
        "options": [
          "Wait until the next renewal",
          "Notify only the employer",
          "Publish all signer details online",
          "Promptly notify the Secretary of State using the prescribed email or letter route"
        ],
        "answer": "D",
        "explanation": "Chapter 6, Section 3 directs prompt notice to the Secretary of State when a journal is lost or stolen.",
        "feedback": [
          "Renewal is too late for prompt notice.",
          "Employer notice does not replace state notice.",
          "Publicly exposing entries is not the prescribed process.",
          "Correct. Follow the rule's state-notification route."
        ],
        "sourceId": "wy-rules",
        "reference": "Chapter 6, Section 3(a)"
      },
      {
        "id": "wy-008",
        "topic": "electronic-ron",
        "studyTopic": "remote",
        "stem": "A Wyoming notary finishes a remote act and prepares the certificate. What technology detail does Chapter 6 require in that certificate?",
        "options": [
          "The name of the system or communication technology used",
          "The customer's internet password",
          "The brand of the customer's printer",
          "Only the notary's email provider"
        ],
        "answer": "A",
        "explanation": "Section 4(a) requires the certificate to identify the system or communication technology used for the remote act.",
        "feedback": [
          "Correct. Identify the technology used for the act.",
          "A password is not the required certificate detail.",
          "Printer brand does not identify the remote system.",
          "An unrelated email provider does not satisfy the rule."
        ],
        "sourceId": "wy-rules",
        "reference": "Chapter 6, Section 4(a)"
      },
      {
        "id": "wy-009",
        "topic": "seals-fees",
        "studyTopic": "fees",
        "stem": "A Wyoming notary performs one ordinary in-person notarial act for one signer, with no travel or technology charge. What is the maximum notarial fee under § 32-3-126?",
        "options": [
          "$5",
          "$10",
          "$25",
          "Any amount the customer accepts"
        ],
        "answer": "B",
        "explanation": "The statutory maximum for the described notarial act is $10. A notary may charge less or waive it.",
        "feedback": [
          "Five dollars is below the current maximum.",
          "Correct. The described act has a $10 maximum.",
          "Twenty-five dollars exceeds the stated maximum.",
          "Customer agreement does not remove the notarial fee cap."
        ],
        "sourceId": "wy-code",
        "reference": "W.S. 32-3-126(a)–(b)(i)"
      },
      {
        "id": "wy-010",
        "topic": "electronic-ron",
        "studyTopic": "remote",
        "stem": "Before her first remote notarization, a Wyoming notary plans a live video session but intends to keep no audiovisual recording. What requirement applies?",
        "options": [
          "A recording is optional if the signer consents",
          "Only the audio must be recorded",
          "The entire communication must be audiovisually recorded",
          "A journal entry eliminates the recording duty"
        ],
        "answer": "C",
        "explanation": "Section 32-3-118(a) requires an audiovisual recording of the entire remote communication.",
        "feedback": [
          "Consent does not waive the recording requirement.",
          "Audio alone does not satisfy audiovisual recording.",
          "Correct. Record the entire communication.",
          "The journal and recording duties both apply."
        ],
        "sourceId": "wy-code",
        "reference": "W.S. 32-3-118(a)"
      }
    ]
  }
};
