import type { QuestionEdit } from "../lib/question-version.ts";

export const ctQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "ct-006": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A former Connecticut notary’s commission expired three years ago. Which process should he use to become a notary again?",
      "option_a": "Describe himself as a first-time applicant.",
      "option_b": "Contact the Secretary’s office for reinstatement instructions.",
      "option_c": "Begin notarizing while the site processes his form.",
      "option_d": "Ask a town clerk to extend the old certificate.",
      "correct_option": "B",
      "explanation": "An expired commission can be renewed within 90 days after expiration. After that it is inactive and requires reinstatement. This applicant should email the Secretary of the State’s office for instructions.",
      "option_feedback": {
        "A": "The initial application route is for first-time applicants.",
        "B": "Correct. An inactive commission requires reinstatement.",
        "C": "The applicant cannot notarize while reinstatement is pending.",
        "D": "The Secretary of the State handles reinstatement."
      },
      "source_reference": "Connecticut Notary Public Manual (Rev. 2026-1), §3.4, p. 8; Secretary of the State, Notary Public Licensing. https://portal.ct.gov/sots/business-services/notary/notary-public-licensing",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-033": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "An unfamiliar in-person signer presents a current state-issued driver’s license with a photograph and signature. What else is needed for the documentary identification route?",
      "option_a": "A second current signed identification document from an institution, business, or federal or state government.",
      "option_b": "No second document because there is a photograph.",
      "option_c": "A Social Security card automatically completes the set.",
      "option_d": "A promise to bring another ID next week.",
      "correct_option": "A",
      "explanation": "One current document must be federal- or state-issued and show the signer’s signature and photograph or physical description. Another current document must show the signature and come from an institution, business, or federal or state government.",
      "option_feedback": {
        "A": "Correct. The license qualifies as the first document and a second qualifying document is still needed.",
        "B": "A photo does not remove the second-document requirement.",
        "C": "The manual excludes Social Security cards from identification.",
        "D": "A promise does not establish identity for the current act."
      },
      "source_reference": "Conn. Gen. Stat. §3-94a(10)(A); Connecticut Notary Public Manual (Rev. 2026-1), Appendix B, p. 37 and §4.4, p. 12. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=12",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-034": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A signer presents a current state-issued driver’s license with her photo and signature and a current signed employee ID issued by her company. What does this pair establish if it matches the signer?",
      "option_a": "It eliminates personal appearance.",
      "option_b": "Satisfactory evidence of identity through the in-person documentary route.",
      "option_c": "It proves the contents of her affidavit.",
      "option_d": "It grants the notary authority outside Connecticut.",
      "correct_option": "B",
      "explanation": "The current state-issued license supplies the photo and signature. The signed, current company ID provides the second document from a qualifying business issuer.",
      "option_feedback": {
        "A": "Identification does not replace personal appearance.",
        "B": "Correct. Both current documents meet the issuer and content conditions.",
        "C": "Identification does not verify the affidavit’s contents.",
        "D": "Identity evidence does not change the notary’s jurisdiction."
      },
      "source_reference": "Conn. Gen. Stat. §3-94a(10)(A); Connecticut Notary Public Manual (Rev. 2026-1), Appendix B, p. 37 and §4.4, p. 12. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=12",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-035": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A signer offers a birth certificate and Social Security card as the only evidence of identity. How should the notary handle that set?",
      "option_a": "Accept them because both are official records.",
      "option_b": "Accept only if the fee is doubled.",
      "option_c": "Do not accept those as the required identification. Seek an authorized identity route.",
      "option_d": "Stamp both cards to make them identification.",
      "correct_option": "C",
      "explanation": "The manual excludes birth certificates and Social Security cards from the documentary identification route. That route requires at least two current documents from qualifying issuers, both with signatures and the federal- or state-issued document with a photo or physical description. Another identity method may be available.",
      "option_feedback": {
        "A": "Official issuance alone does not make these records acceptable.",
        "B": "Fees do not change identity rules.",
        "C": "Correct. Reject the pair and use another authorized method.",
        "D": "A seal cannot turn these records into qualifying identity documents."
      },
      "source_reference": "Conn. Gen. Stat. §3-94a(10)(A); Connecticut Notary Public Manual (Rev. 2026-1), Appendix B, p. 37 and §4.4, p. 12. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=12",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-036": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "An in-person signer offers a current signed federal identification document and a current signed business-issued identification document. Neither has a photograph or physical description. What is missing?",
      "option_a": "A character-reference letter from the employer.",
      "option_b": "A practice score of 100%.",
      "option_c": "The notary’s own photograph.",
      "option_d": "The federal identification document must also show a photograph or physical description of the signer.",
      "correct_option": "D",
      "explanation": "The current federal- or state-issued document needs a signature and either the signer’s photo or physical description. The second current document from a qualifying issuer must contain the signer’s signature.",
      "option_feedback": {
        "A": "A reference does not supply the missing photo or description on the government ID.",
        "B": "A practice score does not identify a signer.",
        "C": "The information must identify the signer.",
        "D": "Correct. The federal ID has the signature, but needs the photograph or description."
      },
      "source_reference": "Conn. Gen. Stat. §3-94a(10)(A); Connecticut Notary Public Manual (Rev. 2026-1), Appendix B, p. 37 and §4.4, p. 12. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=12",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-059": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A signer using a mark understands the document and appears before the notary. Which concern remains to be addressed?",
      "option_a": "Only whether the mark looks artistic.",
      "option_b": "Whether the notary can take ownership of the document.",
      "option_c": "Verify the signer’s identity and follow the manual’s guidance for witnesses and documenting the mark.",
      "option_d": "Whether the signer can pay double.",
      "correct_option": "C",
      "explanation": "The signer must still be identified. The manual advises two witnesses in addition to the notary. One writes the signer’s name near the mark and both sign as witnesses. If a journal is kept, the manual recommends that the witnesses sign it too.",
      "option_feedback": {
        "A": "The mark’s appearance does not establish identity or procedure.",
        "B": "The notary does not take ownership as part of the act.",
        "C": "Correct. Understanding and appearance do not replace identity checks or witness safeguards.",
        "D": "A higher fee does not establish identity or address witness guidance."
      },
      "source_reference": "Connecticut Notary Public Manual (Rev. 2026-1), §4.7, pp. 13–14 and §4.18, p. 20. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=13",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-075": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "The certificate says “subscribed and sworn to,” but the customer only wants to confirm having signed. What should happen?",
      "option_a": "Use the jurat language despite performing only an acknowledgment.",
      "option_b": "Cross out the signer’s name and insert the notary’s.",
      "option_c": "Explain the jurat requirements. If the signer declines to sign before the notary and swear or affirm, do not complete the jurat.",
      "option_d": "Treat the certificate as optional decoration.",
      "correct_option": "C",
      "explanation": "The jurat certifies an identified signer’s voluntary signature before the notary and an oath or affirmation. An acknowledgment alone cannot satisfy the jurat. If the appropriate act is unclear, the signer should seek instructions from the recipient or an attorney.",
      "option_feedback": {
        "A": "An acknowledgment does not satisfy a jurat.",
        "B": "Changing the signer’s name does not resolve the choice of act.",
        "C": "Correct. Explain the requirements and decline the jurat if the signer will not perform them.",
        "D": "The certificate must accurately describe the completed act."
      },
      "source_reference": "Conn. Gen. Stat. §3-94a(3); Connecticut Notary Public Manual (Rev. 2026-1), §4.9, p. 15. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=15",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-085": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A customer brings a document with no certificate and asks which act will make it legally enforceable. What should a nonattorney notary do?",
      "option_a": "Ask the signer to confirm the required notarial act with the receiving party and seek legal advice from an attorney about enforceability.",
      "option_b": "Choose the act that gives the customer the most rights.",
      "option_c": "Stamp the margin without a certificate.",
      "option_d": "Guarantee enforceability after payment.",
      "correct_option": "A",
      "explanation": "A nonattorney notary can explain the procedures for different acts. The recipient can confirm which certificate it expects, and an attorney can advise on enforceability.",
      "option_feedback": {
        "A": "Correct. The receiving party can clarify the procedure; enforceability is a question for an attorney.",
        "B": "Selecting an act to change legal rights would be legal advice.",
        "C": "A bare stamp does not provide a completed certificate.",
        "D": "Payment does not authorize the notary to guarantee enforceability."
      },
      "source_reference": "Connecticut Notary Public Manual (Rev. 2026-1), §4.2 p. 10 and Appendix A p. 26. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=26",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-157": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A Connecticut notary changes her surname and files the required notice. When should she start signing notarial certificates using her new name?",
      "option_a": "On the date the Secretary issues the replacement certificate of appointment.",
      "option_b": "The date she orders a new pen.",
      "option_c": "The customer’s preferred date.",
      "option_d": "The end of the next five-year term only.",
      "correct_option": "A",
      "explanation": "Section 3-94o(b) makes replacement-certificate issuance the transition point. Starting on that date, sign the new name and, if using a seal, use one showing the new name.",
      "option_feedback": {
        "A": "Correct. Issuance of the replacement certificate controls.",
        "B": "Ordering a pen does not change the notary’s official name.",
        "C": "The customer does not set the date.",
        "D": "The official name can change during the current term."
      },
      "source_reference": "Conn. Gen. Stat. §3-94o(b); Connecticut Notary Public Manual (Rev. 2026-1), §§3.5 and 4.14. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=8",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-158": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A Connecticut resident notary moves to a different Connecticut town. What are the deadlines to notify the Secretary of the State and record the replacement certificate?",
      "option_a": "Only tell her private seal vendor.",
      "option_b": "Notify the Secretary within 30 days after moving, and record the replacement with the new town clerk within 30 days after issuance.",
      "option_c": "Assume a new address automatically cancels every prior act.",
      "option_d": "Begin a fresh five-year term without applying.",
      "correct_option": "B",
      "explanation": "Section 3-94n requires timely notice of the residence-address change and recording with the new town clerk when the address changes to another municipality. The two 30-day periods start on different events.",
      "option_feedback": {
        "A": "Telling a seal vendor does not file the address change or replacement certificate.",
        "B": "Correct. The first deadline runs from the address change, and the second runs from issuance of the replacement.",
        "C": "The statute does not invalidate earlier acts solely because a replacement was not recorded.",
        "D": "Moving does not start a new commission term."
      },
      "source_reference": "Conn. Gen. Stat. §3-94n; Connecticut Notary Public Manual (Rev. 2026-1), §3.5 and Appendix B, p. 40. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=8",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-159": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A nonresident notary moves her principal Connecticut business to a different Connecticut town. Which filing steps apply to that move?",
      "option_a": "Only her vacation address.",
      "option_b": "Only the customer mailing list.",
      "option_c": "Notify the Secretary within 30 days after the business-address change, then record the replacement certificate with the new town clerk within 30 days after issuance.",
      "option_d": "Nothing until the stamp wears out.",
      "correct_option": "C",
      "explanation": "A nonresident must report a change in the principal Connecticut business address. A move to a new town also requires recording the replacement certificate with that town clerk within 30 days after issuance.",
      "option_feedback": {
        "A": "The vacation address does not report the principal-business move.",
        "B": "A mailing-list update does not notify the Secretary or town clerk.",
        "C": "Correct. This change requires the state notice and new-town recording.",
        "D": "The duties depend on the change and the replacement issuance, irrespective of equipment wear."
      },
      "source_reference": "Conn. Gen. Stat. §3-94n; Connecticut Notary Public Manual (Rev. 2026-1), §3.5 and Appendix B, p. 40. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=8",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-160": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "After receiving a replacement certificate with a new official name, a notary keeps using an old-name seal. What should change?",
      "option_a": "Keep the old name indefinitely if recognized.",
      "option_b": "Let customers choose between both identities.",
      "option_c": "Have the employer notarize under the old seal.",
      "option_d": "If using a seal, use only one showing the new name.",
      "correct_option": "D",
      "explanation": "From the date the Secretary issues the replacement certificate, sign in the new name on notarial certificates. Any seal used must also show that name.",
      "option_feedback": {
        "A": "Recognizing the old name does not allow its continued official use.",
        "B": "The replacement certificate identifies which name to use.",
        "C": "An employer cannot take over the notary’s seal or authority.",
        "D": "Correct. A seal used after the replacement is issued must reflect the new name."
      },
      "source_reference": "Conn. Gen. Stat. §3-94o(b); Connecticut Notary Public Manual (Rev. 2026-1), §4.14 and Appendix B, p. 40. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=8",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-113": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A notary signs a certificate without a seal or stamp. What identifying wording must she include near the official signature?",
      "option_a": "Print or type “Notary Public” and “My commission expires [date]” legibly near the official signature, with the notary’s name legibly shown nearby.",
      "option_b": "Only the customer’s address.",
      "option_c": "Only the act fee.",
      "option_d": "Only the document’s page count.",
      "correct_option": "A",
      "explanation": "When neither a seal nor a stamp is used, §3-94k requires the title and the phrase “My commission expires” with the actual expiration date near the original signature. The manual also advises legibly identifying the notary by name nearby.",
      "option_feedback": {
        "A": "Correct. Enter both prescribed phrases and the actual expiration date, and follow the manual’s printed-name guidance.",
        "B": "The signer’s address does not identify the notary or commission expiration.",
        "C": "The fee is not a substitute for the required wording.",
        "D": "Page count does not identify the office or expiration."
      },
      "source_reference": "Conn. Gen. Stat. §§3-94i and 3-94k; Connecticut Notary Public Manual (Rev. 2026-1), §§4.12–4.13, p. 19. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=19",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-131": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A document custodian signs a copy-accuracy statement in the notary’s presence but refuses to swear or affirm its truth. What prevents the notary from completing the jurat?",
      "option_a": "Only a larger copy of the original.",
      "option_b": "Only the employer’s advertising seal.",
      "option_c": "The custodian has not taken the required oath or affirmation.",
      "option_d": "Nothing, the statement swears itself.",
      "correct_option": "C",
      "explanation": "A jurat records both signing before the notary and an actual oath or affirmation. If the custodian will not swear or affirm, decline the jurat.",
      "option_feedback": {
        "A": "Paper size does not provide the missing oath.",
        "B": "A seal does not administer a solemn commitment.",
        "C": "Correct. The signature does not replace the oath or affirmation.",
        "D": "The words on the statement do not take the oath for its signer."
      },
      "source_reference": "Connecticut Notary Public Manual (Rev. 2026-1), §§4.9 and 4.11.1, pp. 15 and 18. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=18",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-132": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A customer wants to submit a photocopy of a Connecticut birth certificate as an official certified birth record. They ask a notary to notarize an attached affidavit and label the photocopy a certified birth record. What should the notary do?",
      "option_a": "Use the requested label because the customer wrote it.",
      "option_b": "Treat the affidavit as a replacement for every agency’s required record.",
      "option_c": "Omit the signer’s statement and keep only the seal.",
      "option_d": "Decline the request and refer the customer to the official vital-records custodian.",
      "correct_option": "D",
      "explanation": "A Connecticut notary cannot issue a certified copy of a birth record. A jurat certifies a sworn statement and does not turn the photocopy into a certified birth record. The manual advises against notarizing in connection with a photocopy of a vital record.",
      "option_feedback": {
        "A": "A label supplied by the customer does not confer authority to certify the record.",
        "B": "An affidavit cannot replace an official certified birth record as a matter of notarial authority.",
        "C": "A seal without a proper act does not certify the birth record.",
        "D": "Correct. The authorized custodian can provide the certified birth record."
      },
      "source_reference": "Conn. Gen. Stat. §§3-94a(2) and 7-62a; Connecticut Notary Public Manual (Rev. 2026-1), §§4.11 and 4.11.1, pp. 16–18. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=18",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-149": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A bank paid for its employee’s Connecticut notary seal. When she resigns from her bank job, she keeps an active notary commission. The bank asks her to leave the seal for coworkers. What should she do?",
      "option_a": "Keep her seal under her own control. Do not give it to the bank or let coworkers use it.",
      "option_b": "Leave it because the bank paid.",
      "option_c": "Let the manager lend it out.",
      "option_d": "Remove her name and keep the old commission active.",
      "correct_option": "A",
      "explanation": "The seal remains personal to the notary, even if the employer paid for it. Leaving the bank job does not authorize surrender of the seal to the employer or use by a coworker.",
      "option_feedback": {
        "A": "Correct. The seal stays with the active notary who is named on it.",
        "B": "The bank’s payment does not confer ownership or the right to use the seal.",
        "C": "A manager cannot authorize another person to use the notary’s seal.",
        "D": "Altering the seal does not transfer or extend the commission."
      },
      "source_reference": "Conn. Gen. Stat. §3-94j(a), Connecticut Notary Public Manual (Rev. 2026-1), §4.13, p. 19. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=19",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-151": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A Connecticut notary’s official seal is stolen. Which notifications does the Secretary’s current manual recommend?",
      "option_a": "Assume any later impression is a valid act.",
      "option_b": "Publish blank sealed certificates to warn customers.",
      "option_c": "Notify the local police and the Secretary of the State, and notify the Department of Motor Vehicles’ Dealers, Repairers & Emissions Division in writing.",
      "option_d": "Let a coworker use a substitute with the same name.",
      "correct_option": "C",
      "explanation": "The manual advises notifying local police, the Secretary of the State, and the DMV’s Dealers, Repairers & Emissions Division. It specifies written notice to the DMV division. The Secretary records the theft to help protect the notary from misuse.",
      "option_feedback": {
        "A": "An unauthorized impression is not proof of a lawful notarial act.",
        "B": "Do not distribute blank sealed certificates.",
        "C": "Correct. The manual recommends all three notifications and specifies a written DMV notice.",
        "D": "A coworker cannot use the notary’s seal or take over the commission."
      },
      "source_reference": "Connecticut Notary Public Manual (Rev. 2026-1), §4.14, p. 19. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=19",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-152": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A Connecticut notary lets the commission expire. Under Connecticut General Statutes §3-94j(b), what must the notary do with the official seal?",
      "option_a": "Donate it to the replacement employee for use.",
      "option_b": "Keep issuing impressions without signatures.",
      "option_c": "Use it until the rubber wears out.",
      "option_d": "Immediately destroy it.",
      "correct_option": "D",
      "explanation": "Section 3-94j(b) requires a notary to destroy the seal immediately upon resignation, revocation, lapse, or expiration. The expired commission does not authorize any more acts.",
      "option_feedback": {
        "A": "The notary cannot transfer the seal to a replacement employee.",
        "B": "An expired commission does not allow issuing seal impressions.",
        "C": "The seal’s condition does not extend the commission.",
        "D": "Correct. The statute requires immediate destruction."
      },
      "source_reference": "Conn. Gen. Stat. §3-94j(b), Connecticut Notary Public Manual (Rev. 2026-1), Appendix B, p. 39. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=19",
      "last_verified_at": "2026-11-19"
    }
  },
  "ct-184": {
    "version": 2,
    "previousReviewedDate": "2026-11-13",
    "fields": {
      "question_text": "A signer asks the notary to certify a translation the notary personally prepared. What does the manual direct?",
      "option_a": "The notary may swear to herself.",
      "option_b": "The seal proves translation accuracy automatically.",
      "option_c": "The notary’s employer may sign the notary’s name.",
      "option_d": "The translator can swear to the translation’s accuracy before another notary or other person authorized to administer oaths.",
      "correct_option": "D",
      "explanation": "A Connecticut notary has no authority to certify a translation as a notarial act. A translator may instead swear to its accuracy. A different authorized officer must administer that oath and complete the notarial certificate.",
      "option_feedback": {
        "A": "A translator cannot act as the oath administrator for their own statement.",
        "B": "The seal does not establish translation accuracy.",
        "C": "An employer cannot sign the notary’s name or perform the notary’s act.",
        "D": "Correct. A different authorized officer can administer the translator’s oath."
      },
      "source_reference": "Connecticut Notary Public Manual (Rev. 2026-1), §5.3, p. 23. https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf#page=23",
      "last_verified_at": "2026-11-19"
    }
  }
};
