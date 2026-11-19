import "server-only";
import type { QuestionEdit } from "../lib/question-version.ts";

export const serverQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "ri-039": {
    "version": 1,
    "replacementId": "ri-204",
    "fields": {
      "question_text": "A signer presents another type of current government ID with both a photo and a signature. The photo does not look like the signer. What may the Rhode Island notary do?",
      "option_a": "Ask for additional identification to resolve the mismatch",
      "option_b": "Accept the ID because the two printed features settle identity",
      "option_c": "Compare the customer’s signature to the fee receipt instead",
      "option_d": "Ask the document recipient to waive the identity check",
      "correct_option": "A",
      "explanation": "The notary must be satisfied that the ID identifies the person who appears. Rhode Island law allows the notary to request more information or identification when the first credential leaves reasonable doubt.",
      "option_feedback": {
        "A": "Additional evidence can resolve the mismatch before the notary proceeds.",
        "B": "A photo and signature do not make an unexplained mismatch acceptable.",
        "C": "A fee receipt does not resolve who is presenting the credential.",
        "D": "Recipient consent cannot waive the notary’s identity determination."
      },
      "source_reference": "R.I. Gen. Laws § 42-30.1-6(b)(1)(ii), (c). Rhode Island Notary Public Manual, p. 19. https://webserver.rilegislature.gov/Statutes/TITLE42/42-30.1/42-30.1-6.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "ri-106": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A customer brings an eligible private document and a photocopy made at home. Which procedure follows the Rhode Island Secretary of State’s published copy-certification instructions?",
      "option_a": "Certify the home copy after the customer promises every page is present",
      "option_b": "Certify a copy based on its matching page numbers",
      "option_c": "Make or supervise a fresh copy, then compare it with the original for accuracy and completeness",
      "option_d": "Use the customer’s receipt as proof the copy matches",
      "correct_option": "C",
      "explanation": "The Secretary of State’s published procedure calls for the notary to make or supervise the copy and compare it with the original. The notary must determine that the reproduction is full, true, and accurate.",
      "option_feedback": {
        "A": "The notary must make an independent copy determination.",
        "B": "Page numbers alone cannot establish the accuracy of the contents.",
        "C": "Making or supervising the copy and checking it against the original follows the published procedure.",
        "D": "A receipt does not show that the copy reproduces the original."
      },
      "source_reference": "R.I. Gen. Laws § 42-30.1-4(d). Standards of Conduct § 2(c)(2)–(4). Rhode Island Notary Public Manual, p. 14. SOS Quick Reference Guide, PDF p. 7. https://webserver.rilegislature.gov/Statutes/TITLE42/42-30.1/42-30.1-4.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "ri-183": {
    "version": 1,
    "replacementId": "ri-205",
    "fields": {
      "question_text": "A person is physically unable to sign and needs someone to sign on their behalf. Before anyone signs under Rhode Island’s directed-signature procedure, whose instruction must authorize the signing?",
      "option_a": "The document recipient’s instruction",
      "option_b": "The instruction of the person who is unable to sign",
      "option_c": "The proposed signer’s independent decision",
      "option_d": "The notary’s independent decision",
      "correct_option": "B",
      "explanation": "The direction must come from the person who is physically unable to sign. The remaining rules determine who may sign and what the notary must record.",
      "option_feedback": {
        "A": "Receiving the document does not make someone the principal.",
        "B": "The principal must direct the signing on their behalf.",
        "C": "The person doing the signing needs the principal’s direction.",
        "D": "The notary cannot substitute their decision for the principal’s direction."
      },
      "source_reference": "R.I. Gen. Laws § 42-30.1-8. Standards of Conduct § 3(h)(1). Rhode Island Notary Public Manual, p. 15. https://webserver.rilegislature.gov/Statutes/TITLE42/42-30.1/42-30.1-8.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "ri-184": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A person who is physically unable to sign directs someone else to sign the person’s name. The applicable assisted-signing procedure requires a note on the record. What fact must the note accurately reflect?",
      "option_a": "The principal personally wrote the signature",
      "option_b": "The signature was only witnessed and no one signed for the principal",
      "option_c": "The signature was affixed on the principal’s behalf",
      "option_d": "The identity of the person signing can be replaced with the fee amount",
      "correct_option": "C",
      "explanation": "The required note documents that the signature was affixed for the principal. Follow the wording and details required by the applicable procedure, and do not describe the signature as the principal’s unaided act.",
      "option_feedback": {
        "A": "That wording would misstate who physically affixed the signature.",
        "B": "Witnessing by itself does not describe someone else signing for the principal.",
        "C": "The note must truthfully record the assisted signing.",
        "D": "The amount charged does not explain how the signature was affixed."
      },
      "source_reference": "R.I. Gen. Laws § 42-30.1-8. Standards of Conduct § 3(h)(6). Rhode Island Notary Public Manual, p. 15. https://webserver.rilegislature.gov/Statutes/TITLE42/42-30.1/42-30.1-8.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "ri-200": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A signer in another country asks a Rhode Island notary for an online notarization. Which fact satisfies the required U.S. connection for the record, assuming all other conditions are met?",
      "option_a": "The signer has selected an English-language video interface",
      "option_b": "The signer previously held a U.S. mailing address",
      "option_c": "The record concerns property located in the United States",
      "option_d": "The customer pays through a U.S. payment processor",
      "correct_option": "C",
      "explanation": "A record involving property in the United States meets the U.S.-connection condition. Other conditions still apply to the remote act.",
      "option_feedback": {
        "A": "The language of the software does not connect the record to the United States.",
        "B": "The signer’s former address does not establish the required connection for the record.",
        "C": "Property in the United States supplies the specified connection.",
        "D": "Payment processing is not a U.S. connection for the record."
      },
      "source_reference": "R.I. Gen. Laws § 42-30.1-12.1(b)(4)(i)(B). Standards of Conduct § 8(a)(2)(iii)(a). https://webserver.rilegislature.gov/Statutes/TITLE42/42-30.1/42-30.1-12.1.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-056": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A homeowner appears for a paper acknowledgment of a deed that transfers their home to a buyer. What does Texas law allow the notary to use to establish the homeowner’s identity?",
      "option_a": "A photocopy of an expired foreign passport",
      "option_b": "An employee badge issued by a private company",
      "option_c": "An oral statement from the buyer who has not sworn to the seller’s identity",
      "option_d": "The homeowner’s current passport issued by a foreign country",
      "correct_option": "D",
      "explanation": "Texas law lists a current foreign passport as satisfactory identity evidence for a deed relating to a residential real estate transaction. This deed transfers the homeowner’s residence, and the homeowner must still complete the acknowledgment.",
      "option_feedback": {
        "A": "The passport in this route must be current.",
        "B": "A private badge does not qualify as the listed government-issued credential.",
        "C": "An unsworn statement does not satisfy the credible-witness route.",
        "D": "The current foreign passport fits the residential transfer in the question."
      },
      "source_reference": "Tex. Civ. Prac. & Rem. Code § 121.005(a)(1)–(3). 1 Tex. Admin. Code § 87.1(1). https://tcss.legis.texas.gov/resources/CP/htm/CP.121.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-102": {
    "version": 1,
    "replacementId": "tx-204",
    "fields": {
      "question_text": "A Texas notary’s journal entry properly records the signer’s address and identification method for a paper acknowledgment. Which name must the same entry include?",
      "option_a": "The document courier’s name",
      "option_b": "The name of the person whose signature is acknowledged",
      "option_c": "The name of the notary’s employer",
      "option_d": "The name of the equipment vendor",
      "correct_option": "B",
      "explanation": "The journal must identify the signer, grantor, or maker. Recording the signer’s address and identification method does not replace the signer’s name.",
      "option_feedback": {
        "A": "The courier’s name does not identify the person whose signature was acknowledged.",
        "B": "The signer’s name is a separate entry required by § 406.014(a)(3).",
        "C": "The employer does not substitute for the signer in this field.",
        "D": "The equipment vendor has no part in this identification entry."
      },
      "source_reference": "Tex. Gov’t Code § 406.014(a)(3)–(5). https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-104": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A credible witness swears to a signer’s identity in a Texas paper acknowledgment. The journal identifies the introduction method and includes the witness’s required address. What additional detail about the witness must the notary record?",
      "option_a": "The witness’s initials only",
      "option_b": "The witness’s credit card number",
      "option_c": "The witness’s job title",
      "option_d": "The name of the witness who introduced the signer",
      "correct_option": "D",
      "explanation": "When the signer is introduced to the notary, the record must identify the person who made the introduction. The witness’s address alone does not provide the required name.",
      "option_feedback": {
        "A": "Initials alone do not record the witness’s name.",
        "B": "A credit card number is not the required name field.",
        "C": "An occupation does not identify the person who introduced the signer.",
        "D": "Enter the introducing witness’s name in addition to the other required information."
      },
      "source_reference": "Tex. Gov’t Code § 406.014(a)(5). https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-105": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A witness proves a written instrument before a Texas notary. The journal already contains the required names and addresses. What must the notary record about how the witness was identified?",
      "option_a": "Whether the notary personally knew the witness or the witness was introduced",
      "option_b": "Whether the notary had previously notarized a different instrument for the grantor",
      "option_c": "Whether the witness is related to the document’s recipient",
      "option_d": "Whether the principal sent the instrument by mail",
      "correct_option": "A",
      "explanation": "When a witness proves the instrument, the statute calls for recording whether the notary personally knew the witness or the witness was introduced. The entry still has to contain the separately required participant details.",
      "option_feedback": {
        "A": "That documents how the notary knew or was introduced to the proof witness.",
        "B": "Prior work for the grantor does not state how the proof witness was identified.",
        "C": "A relationship to the recipient does not establish how the notary knew the witness.",
        "D": "The delivery method does not identify the witness."
      },
      "source_reference": "Tex. Gov’t Code § 406.014(a)(6). https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-106": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Texas notary records an acknowledgment for a deed conveying land. The journal includes the grantor’s name, the required addresses, and the county where the land is located. Whose name must also appear as the person receiving the interest conveyed?",
      "option_a": "The person who delivered the deed",
      "option_b": "The grantee",
      "option_c": "The buyer’s mortgage broker",
      "option_d": "The grantor’s real estate agent",
      "correct_option": "B",
      "explanation": "The journal must name the grantee. For an instrument conveying or charging land, the statute also calls for the name of the original grantee and the county where the land is located.",
      "option_feedback": {
        "A": "Delivering the deed does not make a person the grantee.",
        "B": "The grantee is the person receiving the interest conveyed.",
        "C": "A broker does not substitute for the person named as grantee.",
        "D": "The agent’s role does not make the agent the grantee."
      },
      "source_reference": "Tex. Gov’t Code § 406.014(a)(7)–(8). https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-119": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Texas notary renews their commission and opens a new journal. What should they do with paper-notarization records from the prior term that are still within the applicable retention period?",
      "option_a": "Move the records to the new journal and replace each act date with the renewal date",
      "option_b": "Keep only the cover page of the old journal",
      "option_c": "Keep the records and their original entries for the remainder of the applicable retention period",
      "option_d": "Destroy the records on the renewal date",
      "correct_option": "C",
      "explanation": "Renewing a commission does not erase the obligation to keep records that are still within the retention period. Preserve the actual entries and their dates.",
      "option_feedback": {
        "A": "A renewal date does not replace the date of an earlier notarization.",
        "B": "The cover page does not preserve the notarial records.",
        "C": "Retention continues for each record as required even when the notary opens a new journal.",
        "D": "The renewal date does not end the required retention period."
      },
      "source_reference": "Tex. Gov’t Code § 406.014(a)(2), (g). 1 Tex. Admin. Code § 87.54(a). https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-143": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "At an in-person notarization, one acknowledgment certificate covers two signatures on the same deed. After the fee for the first signature, how much more may the Texas notary charge for the second signature?",
      "option_a": "$25",
      "option_b": "Any amount disclosed before the act",
      "option_c": "$1",
      "option_d": "$10",
      "correct_option": "C",
      "explanation": "When one acknowledgment certificate covers both signatures, the maximum is $10 for the first signature and $1 for the additional signature. The listed fees include the certificate and seal.",
      "option_feedback": {
        "A": "$25 is the separate maximum supplement for an online notarization, which is outside this in-person scenario.",
        "B": "Disclosure does not remove the statutory limit.",
        "C": "The additional signature on this one certificate adds a maximum of $1.",
        "D": "$10 is the maximum for the first signature on the certificate."
      },
      "source_reference": "Tex. Gov’t Code § 406.024(a)(5), (b), and § 406.111. Texas SOS Online Notary Public Educational Information, FAQ 9. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-190": {
    "version": 1,
    "replacementId": "tx-205",
    "fields": {
      "question_text": "A Texas online notary backs up the electronic record. The storage system still lets someone alter the original record without detection. What additional duty should the notary address?",
      "option_a": "Keep only the name of the storage provider",
      "option_b": "Take reasonable steps to protect the integrity, security, and authenticity of the electronic record",
      "option_c": "Assume the backup makes untracked changes to the original acceptable",
      "option_d": "Let the signer approve changes to the record after the session",
      "correct_option": "B",
      "explanation": "Backup protection is one duty. Texas law also requires reasonable steps to ensure the integrity, security, and authenticity of online notarizations. An electronic record that can be silently changed calls for additional protection.",
      "option_feedback": {
        "A": "The provider’s name does not protect the electronic record.",
        "B": "The notary must address the integrity, security, and authenticity of the online notarization.",
        "C": "A backup does not excuse allowing undetectable changes to the original.",
        "D": "The signer’s permission does not replace the statutory protection."
      },
      "source_reference": "Tex. Gov’t Code § 406.108(a), (b)(1)–(3), and § 406.109(b). Texas SOS Record-Keeping Requirements for Online Notaries. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-006": {
    "version": 1,
    "replacementId": "tx-206",
    "fields": {
      "question_text": "A Texas notary entered a no-fee paper acknowledgment in the journal. The entry is still within the applicable retention period. May the notary discard it because no fee was charged?",
      "option_a": "Yes, if the same signer has other entries",
      "option_b": "No. Keep it for the remainder of the applicable retention period",
      "option_c": "Yes, if the signer no longer needs a copy",
      "option_d": "Yes, if the notary keeps only the date of the act",
      "correct_option": "B",
      "explanation": "An ordinary paper acknowledgment must be recorded even when the notary charges no fee. Preserve the complete entry while its applicable retention period continues.",
      "option_feedback": {
        "A": "Other acts involving the same signer do not replace this record.",
        "B": "A waived fee does not shorten the retention obligation for the entry.",
        "C": "Retention does not depend on a signer’s later need for a copy.",
        "D": "Keeping only the date does not preserve the required entry."
      },
      "source_reference": "Tex. Gov’t Code § 406.014(a), (g). Texas SOS Notary Public Educational Information, Record Book and Public Records. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-036": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Texas notary applicant has filled out the application form. Which constitutional statement must the applicant also execute to qualify?",
      "option_a": "A waiver of the duties of public office",
      "option_b": "A declaration that the employer will supervise every notarization",
      "option_c": "A statement from the applicant’s first customer",
      "option_d": "The Statement of Officer",
      "correct_option": "D",
      "explanation": "In addition to completing the form, an applicant must execute the Statement of Officer required by the Texas Constitution. The statement is a separate qualification step.",
      "option_feedback": {
        "A": "Applicants do not waive their public duties through the qualification process.",
        "B": "Employer supervision is not the constitutional statement required for appointment.",
        "C": "The applicant, rather than a customer, must execute the statement.",
        "D": "The Statement of Officer is the constitutional statement required by § 406.005(b)."
      },
      "source_reference": "Tex. Gov’t Code §§ 406.005(a)–(b), 406.006(1)–(2). Tex. Const. art. XVI, § 1. Texas SOS Traditional Notary Application Guide, printed p. 7. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "ar-035": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "Your Arkansas notary commission expired ten days ago. You can see your expired record in the state’s online portal. What should you do if you want to renew?",
      "option_a": "Open the renewal amendment for your record and wait until the renewed commission is active before notarizing.",
      "option_b": "Keep notarizing for sixty days after expiration while you complete the renewal.",
      "option_c": "Start a new application solely because your commission already expired.",
      "option_d": "Begin notarizing immediately after you pay the renewal fee.",
      "correct_option": "A",
      "explanation": "The Secretary of State’s portal guide lists an online renewal route for an expired record. Ten days after expiration also falls within the renewal window described in the office’s FAQ. Find your existing record and choose the renewal amendment. The office must receive and process your recorded oath before the renewed commission is active.",
      "option_feedback": {
        "A": "Correct. Apply through the renewal amendment and wait for the state to activate the commission.",
        "B": "The filing window does not extend the expired commission.",
        "C": "Both instructions allow renewal at ten days after expiration.",
        "D": "Payment does not activate the commission. The state must process the recorded oath."
      },
      "source_reference": "Arkansas SOS BCS Online Filing Portal User Guide (July 2026), pp. 14, 18, Web-Filed Notary Renewal; Arkansas SOS Notary FAQ, How early may I submit my renewal application? https://www.sos.arkansas.gov/uploads/bcs/NOTARYAPOSTILLECustomerManual_%28July_2026%29.pdf#page=14",
      "last_verified_at": "2026-11-19"
    }
  },
  "ar-117": {
    "version": 1,
    "replacementId": "ar-204",
    "fields": {
      "question_text": "You are applying for your first Arkansas electronic notary commission. Before any online convenience fee, what is the state application fee?",
      "option_a": "$5",
      "option_b": "$25",
      "option_c": "$30",
      "option_d": "$20",
      "correct_option": "D",
      "explanation": "21 CAR § 20-109(c) sets the electronic notary application fee at $20. The Secretary of State’s eNotary registration page lists a $25 online payment because it includes a $5 convenience fee. The designated training and exam are billed separately.",
      "option_feedback": {
        "A": "Five dollars is the online convenience fee listed by the Secretary of State.",
        "B": "Twenty-five dollars includes the online convenience fee.",
        "C": "Thirty dollars is the separately listed training and exam cost.",
        "D": "Correct. The base state application fee is twenty dollars."
      },
      "source_reference": "21 CAR § 20-109(c); Arkansas Secretary of State, eNotary Registration, steps 1 and 2. https://codeofarrules.arkansas.gov/Rules/Rule?chapterID=137&levelType=section&partID=591&sectionID=28297&subChapterID=179&subPartID=4490&titleID=21",
      "last_verified_at": "2026-11-19"
    }
  },
  "ar-203": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "During an Arkansas remote online notarization, the signer says, “I’m in a rush. Can we just use the video recording instead of checking my identity or completing the certificate?” What should the notary do?",
      "option_a": "Use the recording as the only evidence needed for the act.",
      "option_b": "Verify the signer’s identity through an allowed method and complete the electronic certificate with the required online notarization notation.",
      "option_c": "Create the recording and complete the certificate, but skip identification.",
      "option_d": "Check identity and send a receipt instead of a notarial certificate.",
      "correct_option": "B",
      "explanation": "Arkansas requires the online notary to verify the signer’s identity under A.C.A. § 21-14-309(b). The electronic notarial certificate must indicate that the notarization was performed online. The audiovisual recording is a separate requirement and cannot replace either step.",
      "option_feedback": {
        "A": "Recording the act does not establish identity by itself or complete the certificate.",
        "B": "Correct. Use an authorized identity method and complete the electronic certificate with the online notation.",
        "C": "The recording and certificate do not replace identity verification.",
        "D": "A receipt is not the electronic notarial certificate."
      },
      "source_reference": "A.C.A. § 21-14-309(a)(2)(C), (b), and (d); Arkansas Act 1047 of 2021, §7, pp. 6–7. https://www.arkleg.state.ar.us/Home/FTPDocument?path=%2FACTS%2F2021R%2FPublic%2FACT1047.pdf#page=6",
      "last_verified_at": "2026-11-19"
    }
  },
  "ar-189": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "The Arkansas Secretary of State revokes an eNotary’s traditional notary commission. Which fact gives the Secretary grounds to revoke the electronic commission under 21 CAR § 20-111?",
      "option_a": "The eNotary’s annual software subscription is about to end.",
      "option_b": "The eNotary wants to change approved solution providers.",
      "option_c": "A customer asks the eNotary about a scheduled appointment.",
      "option_d": "The eNotary’s traditional Arkansas notary commission was revoked.",
      "correct_option": "D",
      "explanation": "21 CAR § 20-111(a)(3) lists revocation of the traditional commission as a ground for the Secretary of State to revoke the electronic commission. A platform subscription does not confer notarial authority. The rule describes the Secretary’s authority; the question does not ask when a provider will cut off access.",
      "option_feedback": {
        "A": "The software subscription does not establish the status of either commission.",
        "B": "Changing approved providers is different from losing the traditional commission.",
        "C": "A customer’s scheduling inquiry is unrelated to this ground.",
        "D": "Correct. Revocation of the traditional commission is an express ground for electronic commission revocation."
      },
      "source_reference": "21 CAR § 20-111(a)(3), Denial or Revocation of Electronic Notary Public Commission. https://codeofarrules.arkansas.gov/Rules/Rule?chapterID=137&levelType=section&partID=591&sectionID=28299&subChapterID=179&subPartID=4490&titleID=21",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-140": {
    "version": 2,
    "previousReviewedDate": "2026-11-19",
    "fields": {
      "question_text": "A Texas notary completes an online notarization of an electronic document that the signer signed electronically. What should the notarial certificate indicate about the act and signature?",
      "option_a": "Only that the signer’s electronic signature appears on the document",
      "option_b": "Only that the signer used a private device",
      "option_c": "That the signer appeared in person and signed in ink",
      "option_d": "That the notarization was online and the signer used an electronic signature",
      "correct_option": "D",
      "explanation": "The certificate must say that the act was an online notarization and identify the form of signature actually used. That was an electronic signature in this scenario.",
      "option_feedback": {
        "A": "The certificate must also identify the online act.",
        "B": "Device ownership does not supply the required information.",
        "C": "That would misstate both the appearance method and the signature.",
        "D": "Both statements accurately describe the online act in this scenario."
      },
      "source_reference": "Tex. Gov’t Code § 406.110(d). Texas SOS How to Perform an Online Notarization, 8:42–9:11. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-176": {
    "version": 1,
    "replacementId": "tx-207",
    "fields": {
      "question_text": "A commissioned traditional Texas notary applies for appointment as an online notary. Which requirement still applies when qualifying for the online appointment?",
      "option_a": "Permission from a private video platform in place of state appointment",
      "option_b": "A study certificate in place of meeting the state’s qualifications",
      "option_c": "A waiver of the ordinary notary qualifications because the act is remote",
      "option_d": "Satisfying the requirements for appointment as a traditional Texas notary",
      "correct_option": "D",
      "explanation": "The online commission does not replace the ordinary threshold qualifications. The applicant must satisfy the traditional appointment requirements, along with the separate online requirements.",
      "option_feedback": {
        "A": "A provider cannot supply state appointment or replace its requirements.",
        "B": "A private certificate does not substitute for statutory qualifications.",
        "C": "The online provision expressly incorporates Subchapter A qualifications.",
        "D": "The traditional qualifications remain part of online eligibility."
      },
      "source_reference": "Tex. Gov’t Code § 406.105(b)(1)–(3). 1 Tex. Admin. Code §§ 87.11, 87.14(a)(1). Texas SOS Online Notary Application Guide, p. 2. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-194": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Texas online notary attaches an electronic signature and seal to the certificate for an electronic document. A recipient cannot verify the attachment independently or tell whether the document changed. What standard does the attachment need to meet?",
      "option_a": "A written promise that nobody will edit the document",
      "option_b": "Independent verification and the ability to detect any later change to the electronic document",
      "option_c": "A signature image with no verification method",
      "option_d": "A hidden text box that can be edited after the act",
      "correct_option": "B",
      "explanation": "For this online act, the attachment must be capable of independent verification and must make any later change to the electronic document evident.",
      "option_feedback": {
        "A": "A promise does not make the attachment independently verifiable or show later changes.",
        "B": "Both independent verification and evidence of later changes are required.",
        "C": "An image alone does not provide the required protections.",
        "D": "A hidden editable box is not a method to detect changes."
      },
      "source_reference": "Tex. Gov’t Code §§ 406.102, 406.109(d). 1 Tex. Admin. Code § 87.41(j). https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "tx-197": {
    "version": 1,
    "replacementId": "tx-208",
    "fields": {
      "question_text": "A Texas online notary is authenticating an online notarization of a document that was signed and notarized electronically. Which seal does § 406.109(f) require for this document?",
      "option_a": "The online notary’s electronic seal",
      "option_b": "A seal press applied only to a separate printout",
      "option_c": "The signer’s business seal",
      "option_d": "No seal if the online session was recorded",
      "correct_option": "A",
      "explanation": "The online notary must use the electronic seal to authenticate an online notarization of an electronic document. The recording fulfills a separate duty.",
      "option_feedback": {
        "A": "The statute expressly requires the electronic seal for this electronic document.",
        "B": "A paper printout’s stamp does not authenticate the electronic original.",
        "C": "The required seal belongs to the online notary, not the signer.",
        "D": "Recording the session does not remove the duty to authenticate the online act."
      },
      "source_reference": "Tex. Gov’t Code § 406.109(d), (f)(1). Texas SOS Online Notary Public Educational Information, Electronic Notary Seal. https://tcss.legis.texas.gov/resources/GV/htm/GV.406.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "or-059": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "For a traditional Oregon notarization, a signer presents a clearly legible U.S. passport book that expired three years and one month ago. The notary does not know the signer, and there is no credible witness. What should the notary do?",
      "option_a": "Accept the passport book because it has a legible photograph.",
      "option_b": "Ask for another qualifying credential because the book is outside the three-year expiration limit.",
      "option_c": "Accept the passport book if the customer signs an additional statement.",
      "option_d": "Treat the passport book as current if the document being signed is less than three years old.",
      "correct_option": "B",
      "explanation": "Oregon allows a U.S. passport book as identification when it is current or expired no more than three years before the notarial act. This passport falls outside that window, so the notary needs another qualifying form of identity evidence before proceeding.",
      "option_feedback": {
        "A": "A clear photograph does not extend the time window.",
        "B": "Correct. The passport expired more than three years before the act, and the signer needs another permitted credential.",
        "C": "The signer’s additional statement does not make the expired credential eligible or supply the missing independent evidence.",
        "D": "The relevant date is the date of the notarial act, independent of the document’s age."
      },
      "source_reference": "ORS 194.240(2)(a)(A) and (3), 2025 Oregon Revised Statutes. https://www.oregonlegislature.gov/bills_laws/ors/ors194.html?ID=17795",
      "last_verified_at": "2026-11-19"
    }
  },
  "or-166": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Oregon notary resigns two years after recording the last act in a journal. There is no employer retention agreement. What is the minimum retention period for that journal?",
      "option_a": "Two years from the day the notary resigned.",
      "option_b": "Ten years from the day the notary purchased it.",
      "option_c": "Ten years from the date of the last recorded notarial act.",
      "option_d": "Only until the state accepts the resignation.",
      "correct_option": "C",
      "explanation": "ORS 194.300 requires keeping the journal for ten years after its last recorded act. Resignation does not restart or shorten that period.",
      "option_feedback": {
        "A": "Resignation does not start a two-year period.",
        "B": "Purchase is not the event that starts the retention period.",
        "C": "Correct. The last recorded act starts the ten-year clock.",
        "D": "Acceptance of the resignation leaves the retention duty in place."
      },
      "source_reference": "ORS 194.300(1), (6); OAR 160-100-0310(2). https://www.oregonlegislature.gov/bills_laws/ors/ors194.html?ID=17795",
      "last_verified_at": "2026-11-19"
    }
  },
  "or-183": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Oregon RON signer is relying on the platform’s credential-based identity-proofing workflow. The signer asks to use only a social media profile instead. What should the notary do?",
      "option_a": "Accept the profile if the transaction is time-sensitive.",
      "option_b": "Follow the platform’s required credential analysis and knowledge-based authentication, including visual comparison with the live signer.",
      "option_c": "Treat a high follower count as proof of identity.",
      "option_d": "Let the recipient waive the identity check.",
      "correct_option": "B",
      "explanation": "Under OAR 160-100-0805, the credential-based workflow uses credential analysis and knowledge-based authentication. The notary compares the identification with the live signer. Some platforms also use biometrics. A social profile alone does not satisfy this workflow.",
      "option_feedback": {
        "A": "Urgency does not change the prescribed identification method.",
        "B": "Correct. Follow the vendor’s compliant workflow and make the live comparison.",
        "C": "Follower counts do not establish identity under the credential-based procedure.",
        "D": "A recipient may not waive the notary’s identification duty."
      },
      "source_reference": "OAR 160-100-0805(2)–(4); ORS 194.277(3)(a). https://secure.sos.state.or.us/oard/viewSingleRule.action?ruleVrsnRsn=276236",
      "last_verified_at": "2026-11-19"
    }
  },
  "co-029": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A lawful permanent resident is applying for a Colorado notary commission using a valid permanent resident card. What does the state’s registration checklist tell the applicant to upload?",
      "option_a": "A scan of the front of the card only",
      "option_b": "The applicant’s Social Security card",
      "option_c": "Clear scans of both sides of the permanent resident card",
      "option_d": "A new visa in place of the permanent resident card",
      "correct_option": "C",
      "explanation": "The Colorado Secretary of State’s checklist accepts a permanent resident card for this filing. When you use that card, upload legible scans of both sides.",
      "option_feedback": {
        "A": "The checklist asks for both sides of the card.",
        "B": "A Social Security card does not satisfy the application’s ID requirement.",
        "C": "Both sides are required when using a permanent resident card.",
        "D": "The permanent resident card is an accepted credential for this applicant."
      },
      "source_id": "co-apply-checklist",
      "source_reference": "Colorado SOS Notary Public Registration or Renewal Checklist, p. 1, non-U.S. citizens. C.R.S. § 24-21-521(4)(a)(VII). https://www.coloradosos.gov/pubs/notary/files/PrintableAttachmentInfo.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "co-046": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "For an in-person Colorado notarization, a signer presents another form of government-issued identification rather than a passport, driver’s license, or government-issued nondriver ID card. The credential is current and has the signer’s photograph but no signature. Does it meet the statutory photo-or-signature requirement?",
      "option_a": "No. The credential must show both a photograph and a signature.",
      "option_b": "Yes. A photograph or a signature is enough for that requirement.",
      "option_c": "No. Only a passport can meet the requirement.",
      "option_d": "Yes, but only if a copy of the credential has been notarized.",
      "correct_option": "B",
      "explanation": "For this category of government-issued ID, either a photograph or a signature satisfies the feature requirement. The notary still has to be satisfied that the credential identifies the signer.",
      "option_feedback": {
        "A": "The statute requires either feature for this category.",
        "B": "The photograph satisfies the feature requirement. The notary must still establish identity.",
        "C": "Colorado law also allows other qualifying government-issued identification.",
        "D": "A notarized copy is not the statutory test for the credential’s features."
      },
      "source_id": "co-rulona",
      "source_reference": "C.R.S. § 24-21-507(2)(a)(II), (3). https://www.coloradosos.gov/pubs/info_center/laws/RULONA.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "co-047": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "At an in-person Colorado notarization, a signer presents current government-issued identification that is neither a passport, driver’s license, nor government-issued nondriver ID card. It shows the signer’s signature but no photograph. Which statement is correct?",
      "option_a": "The signature meets the feature requirement for this type of identification.",
      "option_b": "This type of identification must always include a photograph.",
      "option_c": "A signature can count only at a remote notarization.",
      "option_d": "A receipt for the notarial fee can serve as identification instead.",
      "correct_option": "A",
      "explanation": "Another form of government-issued identification can meet the feature requirement with a signature or a photograph. The notary must still determine that the credential identifies the person presenting it.",
      "option_feedback": {
        "A": "Either feature can satisfy this requirement for alternate government-issued ID.",
        "B": "A signature can satisfy the requirement without a photograph.",
        "C": "Colorado’s in-person rule also allows a signature as the qualifying feature.",
        "D": "A fee receipt does not establish the signer’s identity."
      },
      "source_id": "co-rulona",
      "source_reference": "C.R.S. § 24-21-507(2)(a)(II), (3). https://www.coloradosos.gov/pubs/info_center/laws/RULONA.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "co-058": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "At an in-person Colorado notarization, a signer presents another form of government-issued identification, outside the statute’s passport, driver’s license, and government-issued nondriver ID card category. The credential has neither a photograph nor a signature. What requirement does it fail?",
      "option_a": "It must show either the signer’s photograph or signature.",
      "option_b": "It must include a gold seal.",
      "option_c": "It must state the signer’s bank balance.",
      "option_d": "It must show that the signer lives in the county.",
      "correct_option": "A",
      "explanation": "For this category of government identification, the credential must show either the signer’s photograph or signature. With neither feature, the notary needs another satisfactory way to establish identity.",
      "option_feedback": {
        "A": "A photograph or signature is required for this category of government-issued credential.",
        "B": "Colorado law does not require a gold seal for this category.",
        "C": "A balance is unrelated to this identity rule.",
        "D": "County residence is not a credential requirement under this provision."
      },
      "source_id": "co-rulona",
      "source_reference": "C.R.S. § 24-21-507(2)(a)(I)–(II), (3). https://www.coloradosos.gov/pubs/info_center/laws/RULONA.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "co-103": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Colorado notary is asked to notarize a record that names the notary’s grandmother as a beneficiary. The signature to be notarized belongs to someone else. What does Colorado law require?",
      "option_a": "Proceed because the grandmother’s signature is not being notarized.",
      "option_b": "Proceed if the notary waives the fee.",
      "option_c": "Decline because the record names the notary’s ancestor.",
      "option_d": "Decline only if the notary also receives a direct financial benefit.",
      "correct_option": "C",
      "explanation": "A Colorado notary cannot perform an act on a record that names the notary’s ancestor or makes that ancestor a party. The grandmother is named, so the restriction applies regardless of whose signature is being notarized.",
      "option_feedback": {
        "A": "The statute looks at who is named in or a party to the record.",
        "B": "Waiving the fee does not remove the conflict.",
        "C": "A grandmother is an ancestor, and the record names her.",
        "D": "A personal financial benefit is unnecessary when an ancestor is already named."
      },
      "source_id": "co-rulona",
      "source_reference": "C.R.S. § 24-21-504(2)(a)–(b). https://www.coloradosos.gov/pubs/info_center/laws/RULONA.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-080": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah notary commissioned on June 1, 2026 identifies a signer through the sworn testimony of a credible individual the notary personally knows. Which statement about the witness belongs in the journal?",
      "option_a": "That the notary personally knows the credible individual",
      "option_b": "That every office employee knows the signer",
      "option_c": "That the notary knows the document recipient",
      "option_d": "That the witness knows only the employer",
      "correct_option": "A",
      "explanation": "The post-May-6 journal rule requires a statement that the notary personally knows the credible individual. It separately requires the oath or affirmation, the witness’s signature, printed name and address.",
      "option_feedback": {
        "A": "Correct. The post-May-6 journal rule requires a statement that the notary personally knows the credible individual. It separately requires the oath or affirmation, the witness’s signature, printed name and address.",
        "B": "That is not the required connection.",
        "C": "The recipient is a different role.",
        "D": "That does not establish the route."
      },
      "source_reference": "Utah Code § 46-1-14.1(2)(b)(v)(B). https://le.utah.gov/xcode/Title46/C46_2018050820190101.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-082": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah notary commissioned on June 1, 2026 relies on a credible witness who knows the signer but whom the notary has never met. The witness gives sworn testimony and presents qualifying identification. What additional identification information must the journal contain?",
      "option_a": "Only the principal's phone number",
      "option_b": "A copy of the witness's employment contract",
      "option_c": "The prescribed credential description including last four digits and dates",
      "option_d": "Nothing because the witness took an oath",
      "correct_option": "C",
      "explanation": "The journal must describe the witness’s identification, including its type, issuer, number’s last four digits, date issued and expiration date.",
      "option_feedback": {
        "A": "That does not identify the witness credential.",
        "B": "That is not the specified credential description.",
        "C": "Correct. The journal must describe the witness’s identification, including its type, issuer, number’s last four digits, date issued and expiration date.",
        "D": "The oath does not eliminate credential detail."
      },
      "source_reference": "Utah Code § 46-1-14.1(2)(b)(vi)(C). https://le.utah.gov/xcode/Title46/C46_2018050820190101.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-083": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah remote notary commissioned in June 2026 verifies an unfamiliar signer through qualifying ID and secondary authentication. What must the electronic journal include beyond the usual identification details?",
      "option_a": "The vendor's marketing slogan",
      "option_b": "The record of secondary authentication used for the remote act",
      "option_c": "A travel mileage estimate",
      "option_d": "A second paper stamp",
      "correct_option": "B",
      "explanation": "The post-May-6 journal rule separately calls for recording the secondary authentication of identity used in this remote act.",
      "option_feedback": {
        "A": "Marketing is not the authentication record.",
        "B": "Correct. The post-May-6 journal rule separately calls for recording the secondary authentication of identity used in this remote act.",
        "C": "Mileage does not document authentication.",
        "D": "A stamp does not record the proofing method."
      },
      "source_reference": "Utah Code § 46-1-14.1(2)(b)(vii). https://le.utah.gov/xcode/Title46/C46_2018050820190101.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-084": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah notary commissioned in June 2026 administers an affirmation for a jurat. The journal entry already contains the identity details and signature. What additional notation is required?",
      "option_a": "The fact that the oath or affirmation was administered",
      "option_b": "A statement that no ceremony was needed",
      "option_c": "Only the payment method",
      "option_d": "Only the recipient's name",
      "correct_option": "A",
      "explanation": "The post-May-6 journal rule requires the notary to indicate that an oath or affirmation was administered when one was given.",
      "option_feedback": {
        "A": "Correct. The post-May-6 journal rule requires the notary to indicate that an oath or affirmation was administered when one was given.",
        "B": "That misstates a jurat.",
        "C": "Payment does not establish the oath.",
        "D": "That does not document the administered oath."
      },
      "source_reference": "Utah Code § 46-1-14.1(2)(b)(viii). https://le.utah.gov/xcode/Title46/C46_2018050820190101.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-177": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah nonattorney notary advertises notarial services on a Spanish-language radio station. How may the required nonattorney warning be presented in the ad?",
      "option_a": "Omit the warning because the ad is on the radio.",
      "option_b": "Give only a website address where listeners can find the warning.",
      "option_c": "Say the notary can give immigration advice if asked.",
      "option_d": "Use wording suited to radio that conveys substantially the same warning.",
      "correct_option": "D",
      "explanation": "Utah requires notice for a nonattorney's non-English notarial advertisement. Radio and television wording may be modified when it conveys substantially the same message. The notice requirements also cover language and the applicable notarial fees.",
      "option_feedback": {
        "A": "The broadcast medium does not remove the warning requirement.",
        "B": "A bare website address does not communicate the required message.",
        "C": "A nonattorney notary cannot offer immigration legal advice.",
        "D": "Correct. The law permits wording suited to broadcast when it conveys substantially the same warning."
      },
      "source_reference": "Utah Code § 46-1-11(2)(a)–(b). https://le.utah.gov/xcode/Title46/C46_2018050820190101.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-167": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah notary is reviewing the remote identity definition in Utah Code § 46-1-2. If a credible witness whom the notary does not personally know is the signer’s identity witness under that definition, whose identity must receive secondary authentication for this route?",
      "option_a": "Only the document recipient’s identity.",
      "option_b": "The credible witness’s identity.",
      "option_c": "The platform salesperson’s identity.",
      "option_d": "No one’s identity, because the testimony is sworn.",
      "correct_option": "B",
      "explanation": "The definition requires secondary authentication of the unfamiliar credible witness for this route. Utah’s separate remote procedure provision also specifies an identity-image requirement for an unfamiliar signer, so do not treat this rule as permission to skip the rest of the required process.",
      "option_feedback": {
        "A": "The recipient does not supply the witness’s secondary authentication.",
        "B": "Correct. The definition assigns this authentication to the unfamiliar credible witness.",
        "C": "The salesperson is not the credible witness.",
        "D": "The oath does not replace secondary authentication."
      },
      "source_reference": "46-1-2(25)(a)(i)(D), (ii)(B); 46-1-3.6(2)(b) https://le.utah.gov/xcode/Title46/Chapter1/C46-1-S2_2026050620260506.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "ut-173": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A Utah remote notary’s commission expires. The former notary destroys the credentials that enabled use of the electronic signature and seal. What written step must follow within ten days after expiration?",
      "option_a": "Send the account password to every customer.",
      "option_b": "Renew the vendor advertisement.",
      "option_c": "Wait for the first customer complaint.",
      "option_d": "Certify the destruction in writing to the lieutenant governor.",
      "correct_option": "D",
      "explanation": "The former remote notary must certify in writing to the lieutenant governor within ten days after expiration that the enabling credentials were destroyed. The same deadline applies after resignation or revocation.",
      "option_feedback": {
        "A": "Do not distribute former credentials. The state requires written certification of destruction.",
        "B": "A vendor advertisement does not satisfy the state requirement.",
        "C": "The deadline runs from the end of authority regardless of customer contact.",
        "D": "Correct. Certify destruction of the electronic signing and sealing credentials to the lieutenant governor."
      },
      "source_reference": "46-1-16(9)(a)(ii), (b) https://le.utah.gov/xcode/Title46/Chapter1/C46-1-S16_2026050620260506.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-110": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Illinois law firm keeps copies of documents its employee notarizes at work. Which statement accurately describes the two official journal provisions?",
      "option_a": "The Act exempts every employee whose employer keeps a copy.",
      "option_b": "The administrative rule describes a law-firm exception, while the Act says an employer’s records do not relieve the notary’s journal duties.",
      "option_c": "The administrative rule exempts the employee’s unrelated weekend notarizations.",
      "option_d": "The Act requires only electronic notaries to keep a journal.",
      "correct_option": "B",
      "explanation": "Rule 176.900(f) describes an exception for notarizations performed during employment by an attorney or law firm that keeps copies. Section 3-107 separately requires notarial journals and says an employer’s records do not relieve the notary’s statutory duties. Apply the statute and seek the Secretary of State’s guidance before omitting an entry solely because the firm kept a copy.",
      "option_feedback": {
        "A": "The Act expressly says the employer’s records do not relieve the statutory duties.",
        "B": "This describes both official texts and the difference in their wording.",
        "C": "The administrative language concerns notarizations performed during qualifying employment.",
        "D": "The statutory duty applies to ordinary and electronic notaries."
      },
      "source_id": "il-2025",
      "source_reference": "14 Ill. Adm. Code § 176.900(f), 49 Ill. Reg. 608–609; 5 ILCS 312/3-107(a), (d). https://www.ilsos.gov/content/dam/departments/index/register/volume49/register_volume49_2.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-112": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Illinois notary is leaving a law firm. A journal contains only notarizations the notary performed in that job. Which statement reflects both Illinois provisions?",
      "option_a": "The journal automatically belongs to the firm’s clients.",
      "option_b": "The stamp vendor owns the journal after the notary leaves.",
      "option_c": "The law expressly requires the county recorder to take this journal.",
      "option_d": "The rule describes firm ownership of work-only journals, but the Act bars surrender to or retention by the employer when employment ends.",
      "correct_option": "D",
      "explanation": "Rule 176.900(f) describes a journal kept solely for the law-firm job as the firm’s property. Section 3-107(d) separately states that a notary must not surrender the journal to the employer and that the employer must not retain it when employment ends. The ownership language alone does not authorize a handover after employment.",
      "option_feedback": {
        "A": "Neither provision assigns ownership to clients.",
        "B": "Neither provision gives the seal seller control of the journal.",
        "C": "There is no county-recorder handover under either cited provision.",
        "D": "The rule addresses ownership and the Act governs the stated custody restriction at departure."
      },
      "source_id": "il-2025",
      "source_reference": "14 Ill. Adm. Code § 176.900(f), 49 Ill. Reg. 608–609; 5 ILCS 312/3-107(d). https://www.ilsos.gov/content/dam/departments/index/register/volume49/register_volume49_2.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-139": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Illinois notary discovers a journal was stolen. When should the notary file the written or electronic notice to meet both the administrative rule and the statute?",
      "option_a": "At the next commission renewal",
      "option_b": "At any time within one year",
      "option_c": "By the next business day after discovery",
      "option_d": "On the tenth business day after discovery",
      "correct_option": "C",
      "explanation": "Rule 176.940(b) calls for written or electronic notice the next business day after discovery. This complies with the Act’s outside limit of ten business days. Waiting until the tenth business day misses the earlier reporting requirement.",
      "option_feedback": {
        "A": "Renewal appointment timing does not set the notification deadline.",
        "B": "A year would miss both deadlines.",
        "C": "Reporting by the next business day satisfies the rule and the statutory limit.",
        "D": "This is the statutory outside limit, but it does not satisfy the earlier administrative rule."
      },
      "source_id": "il-rules",
      "source_reference": "14 Ill. Adm. Code § 176.940(b), 47 Ill. Reg. 8731; 5 ILCS 312/3-107(e). https://www.ilsos.gov/content/dam/departments/index/register/volume47/register_volume47_24.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "me-036": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A first-time Maine notary applicant wants to find the examination included in the state’s current paper application. Where should the applicant look?",
      "option_a": "In the commission profile update screen",
      "option_b": "In the Secretary of State’s Application for a Notary Public Commission",
      "option_c": "In the marriage officiant license surrender form",
      "option_d": "In the state’s Notary Public and Dedimus Justice search directory",
      "correct_option": "B",
      "explanation": "The Maine Secretary of State links the current Application for a Notary Public Commission on its Apply/Renew a Notary page. The application contains the initial Notary Public Examination. The separate online examination is for commission renewal.",
      "option_feedback": {
        "A": "The profile update screen is for existing commission information. The initial examination is in the new-commission application.",
        "B": "Correct. The application includes the initial Notary Public Examination.",
        "C": "The surrender form serves a separate marriage officiant license process.",
        "D": "The directory lists notaries and Dedimus Justices. It is not the new-commission application."
      },
      "source_reference": "4 M.R.S. § 1923(1); Maine Secretary of State, Application for a Notary Public Commission, pp. 2–4 https://legislature.maine.gov/statutes/4/title4ch39.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-157": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Illinois notary is neither an attorney nor an accredited immigration representative. The notary advertises notarial services in Spanish in an online ad. What must the ad include?",
      "option_a": "Only a link to the notary’s website",
      "option_b": "The required conspicuous nonattorney notice in English and Spanish",
      "option_c": "A promise to provide immigration legal advice",
      "option_d": "A statement that the notary is a government lawyer",
      "correct_option": "B",
      "explanation": "A covered online ad in Spanish must display the prescribed nonattorney notice conspicuously in English and Spanish.",
      "option_feedback": {
        "A": "A link does not display the required notice in the ad.",
        "B": "The notice must appear in English and in the language used in the ad.",
        "C": "The notice explains the limits on legal advice and services.",
        "D": "The advertisement must not falsely imply that the notary is a lawyer."
      },
      "source_id": "il-handbook",
      "source_reference": "5 ILCS 312/3-103(a), Illinois Notary Public Handbook p. 11. https://www.ilga.gov/legislation/ILCS/details?ActID=107&ActName=Illinois+Notary+Public+Act.&ChapAct=5+ILCS+312%2F&Chapter=GENERAL+PROVISIONS&ChapterID=2&MajorTopic=GOVERNMENT&Print=True&SeqEnd=2850000&SeqStart=2000000",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-199": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "An Illinois electronic notary’s electronic seal is compromised today, and the notary learns about it that day. What notice does the Act require?",
      "option_a": "Notify appropriate law enforcement, the technology vendor, and the Secretary of State no later than the next business day",
      "option_b": "Wait until the next commission renewal to notify the Secretary of State",
      "option_c": "Notify only the technology vendor within three years",
      "option_d": "Notify someone only if a customer complains",
      "correct_option": "A",
      "explanation": "The Act requires notice to appropriate law enforcement, the electronic-notary technology vendor, and the Secretary of State no later than the next business day after theft, compromise, or vandalism of the electronic signature or seal.",
      "option_feedback": {
        "A": "These are the three required recipients and the statutory deadline.",
        "B": "Renewal does not set this reporting deadline.",
        "C": "The notice goes to all three recipients by the next business day.",
        "D": "The duty arises from the security incident, regardless of customer complaints."
      },
      "source_id": "il-handbook",
      "source_reference": "5 ILCS 312/3-101(d)(2). https://www.ilga.gov/legislation/ILCS/details?ActID=107&ActName=Illinois+Notary+Public+Act.&ChapAct=5+ILCS+312%2F&Chapter=GENERAL+PROVISIONS&ChapterID=2&MajorTopic=GOVERNMENT&Print=True&SeqEnd=2850000&SeqStart=2000000",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-018": {
    "version": 1,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "After three unsuccessful final examinations, a candidate asks to keep buying unlimited retests under the same completed course. What applies?",
      "option_a": "Unlimited attempts are guaranteed",
      "option_b": "The Secretary must issue a commission",
      "option_c": "The surety can certify competence",
      "option_d": "Three failures constitute failure of the course",
      "correct_option": "D",
      "explanation": "Failure to pass the final after three attempts constitutes failure of the course.",
      "option_feedback": {
        "A": "The rule limits unsuccessful attempts under that course.",
        "B": "A failed course does not qualify the applicant.",
        "C": "The surety does not certify course completion.",
        "D": "Correct. Three failures mean the course has been failed."
      },
      "source_id": "il-rules",
      "source_reference": "§176.235(c)(4), printed p. 8678 https://www.ilsos.gov/content/dam/departments/index/register/volume47/register_volume47_24.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-019": {
    "version": 1,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A first applicant completed the certified examination more than two years ago and never applied. What should the applicant do?",
      "option_a": "Obtain current qualifying completion before applying",
      "option_b": "Reuse the old result indefinitely",
      "option_c": "File an employer statement instead",
      "option_d": "Assume a purchased seal extends the result",
      "correct_option": "A",
      "explanation": "The application must be submitted within two years after passing the examination.",
      "option_feedback": {
        "A": "Correct. The old result falls outside the application period.",
        "B": "Examination results do not remain usable indefinitely.",
        "C": "An employer statement does not renew a first applicant's result.",
        "D": "A seal purchase cannot extend an examination result."
      },
      "source_id": "il-2025",
      "source_reference": "§176.205(a), printed p. 593 https://www.ilsos.gov/content/dam/departments/index/register/volume49/register_volume49_2.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-052": {
    "version": 1,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "For an ordinary paper act, a signer brings a witness whom the notary has never met. The parties want to rely solely on that witness's oath. What does §6-102(d)(2) require?",
      "option_a": "Any witness accepted by the signer",
      "option_b": "A witness with a large professional following",
      "option_c": "A witness who pays the fee",
      "option_d": "A credible witness personally known to the notary",
      "correct_option": "D",
      "explanation": "The ordinary statutory credible-witness route requires a witness personally known to the notary.",
      "option_feedback": {
        "A": "The signer's preference does not establish the statutory connection.",
        "B": "Popularity does not meet the personal-knowledge requirement.",
        "C": "Paying a fee does not qualify the witness.",
        "D": "Correct. The specified personal knowledge is required."
      },
      "source_id": "il-in-person-identity-statute",
      "source_reference": "5 ILCS 312/6-102(d)(2) https://www.ilga.gov/documents/legislation/ilcs/documents/000503120K6-102.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "il-174": {
    "version": 2,
    "previousReviewedDate": "2026-11-14",
    "fields": {
      "question_text": "A regular private employer asks for the notary's journal at termination. The journal contains ordinary business and private acts and no special law-firm exception applies. What is required?",
      "option_a": "Leave it with payroll because the employer paid",
      "option_b": "Give it to whichever employee requests it",
      "option_c": "Do not surrender the journal to the employer on termination",
      "option_d": "Destroy it so neither party holds it",
      "correct_option": "C",
      "explanation": "Section 3-107(d) tells the notary not to surrender the journal to the employer when employment ends. The employer cannot retain it. These facts concern an ordinary journal that includes business and private notarizations.",
      "option_feedback": {
        "A": "Payment does not transfer ordinary journal custody.",
        "B": "An employee's request does not authorize transfer.",
        "C": "Correct. Apply the ordinary custody rule to these facts.",
        "D": "Termination does not authorize destruction."
      },
      "source_reference": "5 ILCS 312/3-107(d) https://www.ilga.gov/legislation/ILCS/details?ActID=107&ActName=Illinois+Notary+Public+Act.&ChapAct=5+ILCS+312%2F&Chapter=GENERAL+PROVISIONS&ChapterID=2&MajorTopic=GOVERNMENT&Print=True&SeqEnd=2850000&SeqStart=2000000",
      "last_verified_at": "2026-11-19"
    }
  }
};
