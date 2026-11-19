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
  },
  "hi-121": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii notary’s physical rubber stamp seal is stolen. Under HAR §5-11-18, what must the notary do?",
      "option_a": "Notify the Attorney General in writing within ten days, report the theft to the appropriate law-enforcement agency, and send a copy of that agency’s report to the Attorney General.",
      "option_b": "Notify only the bond surety.",
      "option_c": "Order a replacement stamp and give no notice.",
      "option_d": "Send written notice only to the Lieutenant Governor.",
      "correct_option": "A",
      "explanation": "HAR §5-11-18 requires written notice to the Attorney General within ten days after loss, misplacement, or theft. For theft, the notary must also inform the appropriate law-enforcement agency and send a copy of its report to the Attorney General. Failure to comply carries a $20 administrative fine.",
      "option_feedback": {
        "A": "Correct. Theft triggers the written agency notice, law-enforcement report, and copy requirements.",
        "B": "Notifying the surety alone does not satisfy the required notices.",
        "C": "Ordering a replacement does not satisfy the theft-reporting requirements.",
        "D": "The Attorney General receives the written notice and report copy."
      },
      "source_reference": "HAR §5-11-18 and §5-11-46(b)(3), 2022 compilation, printed pp. 11-14–11-15 and 11-25. https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-137": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii notary charges $5 for a traditional notarial act. What does HRS §456-15(e)(6) require the notary to enter about the fee?",
      "option_a": "Record the $5 fee charged for the act.",
      "option_b": "Leave the fee out because only amounts over $5 are recorded.",
      "option_c": "Record the commission application fee instead.",
      "option_d": "Omit the fee whenever the signer is a relative.",
      "correct_option": "A",
      "explanation": "HRS §456-15(e)(6) requires the journal entry to include any fee actually charged by the notary. The amount charged here is $5.",
      "option_feedback": {
        "A": "Correct. The journal records the actual fee charged for the act.",
        "B": "The statute sets no minimum dollar threshold for recording a charged fee.",
        "C": "This entry records the fee charged for this act, which is separate from the notary’s own application fee.",
        "D": "This provision has no exception for a fee charged to a relative."
      },
      "source_reference": "HRS §456-15(e)(6); HAR §5-11-9(a), printed p. 11-9. https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0015.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-142": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "An agent presents a photocopy of an original Hawaii power of attorney governed by Chapter 551E. No other statute requires a different form for this transaction. How does Hawaii law treat the photocopy when the agent requests a representative-capacity acknowledgment?",
      "option_a": "The photocopy is always ineffective unless a notary certifies it.",
      "option_b": "The agent’s driver’s license supplies legal authority to act for the principal.",
      "option_c": "The photocopy automatically authorizes every act without checking the scope of the power.",
      "option_d": "The photocopy has the same effect as the original. The agent still must have proper authority and make the declarations required for the representative acknowledgment.",
      "correct_option": "D",
      "explanation": "HRS §551E-3(e) gives a photocopy or electronically transmitted copy of the original the same effect as the original unless another statute provides otherwise. That rule does not expand the agent’s powers. For the acknowledgment, the agent must declare that the agent signed with proper authority and as the act of the identified principal.",
      "option_feedback": {
        "A": "Section 551E-3(e) does not impose a categorical certification requirement for the copy.",
        "B": "A driver’s license may establish identity. It does not establish the scope of the agent’s authority.",
        "C": "Legal effect of a copy does not expand what the power of attorney authorizes.",
        "D": "Correct. Apply the statutory copy rule and the separate representative-capacity acknowledgment requirements."
      },
      "source_reference": "HRS §551E-3(e); HRS §456-1.6, definitions of acknowledgment and representative capacity; Hawaii Attorney General, Notary Public Manual, 2026 website version, printed p. 12. https://data.capitol.hawaii.gov/hrscurrent/Vol12_Ch0501-0588/HRS0551E/HRS_0551E-0003.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-143": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A customer needs an official certified copy of a Hawaii birth record. The notary sees that the Attorney General’s older FAQ leaves its question about vital-record copies unanswered. Which answer is supported by Hawaii’s official vital-record guidance?",
      "option_a": "An unanswered FAQ authorizes any notary to issue the official certified copy.",
      "option_b": "The ordinary notarial fee table gives a notary authority to issue the official birth record.",
      "option_c": "Direct the eligible customer to the Hawaii Department of Health’s certified vital-record process.",
      "option_d": "Apply California’s rules because Hawaii’s notary FAQ gives no answer.",
      "correct_option": "C",
      "explanation": "The Hawaii Department of Health publishes an official process for eligible applicants to obtain certified copies of Hawaii birth records. A blank answer in the Attorney General’s FAQ supplies no issuance authority, and the general definition of a notarial copy act does not create authority to issue an official vital record.",
      "option_feedback": {
        "A": "Silence in the FAQ does not confer authority.",
        "B": "A notarial fee schedule does not designate who may issue an official birth record.",
        "C": "Correct. The Department of Health identifies the issuing process and applicant eligibility.",
        "D": "Use Hawaii’s official vital-record rules for a Hawaii birth record."
      },
      "source_reference": "Hawaii Department of Health, Hawaii Birth & Marriage Certificates and State Public Health Regulations ch. 8B, §2.4(B)(3), printed p. 4. https://health.hawaii.gov/vitalrecords/birth-marriage-certificates/",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-173": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii notary’s physical seal or journal is lost, misplaced, or stolen. Which reporting failure carries the $20 administrative fine in HRS §456-9(c)(6)?",
      "option_a": "Failing to notify the Attorney General within ten days, or failing in a theft case to notify law enforcement and send its theft report to the Attorney General.",
      "option_b": "Failing to retain the journal for ten years.",
      "option_c": "Charging the ordinary statutory acknowledgment fee.",
      "option_d": "Filing an approved surety bond.",
      "correct_option": "A",
      "explanation": "The statute specifies a $20 fine for failure to notify the Attorney General within ten days after loss, misplacement, or theft. In a theft case the notary must also inform the appropriate law-enforcement agency and deliver that agency’s report to the Attorney General. HAR §5-11-18 states the corresponding ten-day notice and theft-report requirements.",
      "option_feedback": {
        "A": "Correct. The statute lists prompt agency notification within ten days and the additional steps for theft.",
        "B": "Journal retention is a separate duty with separate enforcement.",
        "C": "The ordinary acknowledgment fee does not trigger this fine.",
        "D": "Filing the bond is a separate commissioning requirement."
      },
      "source_reference": "HRS §456-9(c)(6); HAR §5-11-18, printed pp. 11-14–11-15. https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0009.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-180": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "Before leaving for lunch, a Hawaii notary gives a coworker the official seal and a signed loose notarial certificate. The notary authorizes the coworker to attach the certificate to a customer’s document while the notary is away. Which duties does this violate?",
      "option_a": "The notary’s bond amount alone.",
      "option_b": "The duty to maintain sole control of the official seal and the ban on authorizing someone else to attach a signed certificate outside the notary’s presence.",
      "option_c": "Neither duty, if the coworker makes a journal entry.",
      "option_d": "Neither duty, if the coworker charges no fee.",
      "correct_option": "B",
      "explanation": "HAR §5-11-5(d) requires sole control of the seal. HAR §5-11-4.5(a)(5) separately bars delivering a signed certificate and authorizing someone else to attach it outside the notary’s presence. Giving away the seal and authorizing later attachment violate both rules.",
      "option_feedback": {
        "A": "The question concerns custody of the seal and handling of the signed certificate. The bond amount does not excuse either action.",
        "B": "Correct. The scenario includes both prohibited actions.",
        "C": "A journal entry cannot authorize sharing the seal or attaching the certificate in the notary’s absence.",
        "D": "Charging no fee does not change either requirement."
      },
      "source_reference": "HAR §5-11-4.5(a)(5), printed p. 11-7; HAR §5-11-5(d), printed p. 11-8. https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-188": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A signer asks a Hawaii notary to add an apostille after completing an otherwise lawful acknowledgment on a private document. What can the notary issue in that role?",
      "option_a": "An apostille by completing a second acknowledgment.",
      "option_b": "The acknowledgment certificate. The signer can request an apostille through the Office of the Lieutenant Governor after circuit court authentication.",
      "option_c": "An apostille by printing the word below the notarial seal.",
      "option_d": "An apostille by charging the $25 remote-notarization fee.",
      "correct_option": "B",
      "explanation": "The notary issues the certificate for the acknowledgment actually performed. For a Hawaii-notarized private document, the circuit court authenticates the notary’s signature and seal before the apostille request goes to the Office of the Lieutenant Governor.",
      "option_feedback": {
        "A": "A second acknowledgment would not create an apostille.",
        "B": "Correct. The notary, circuit court, and Lieutenant Governor perform separate steps.",
        "C": "Adding a label to the notarial seal does not create an apostille.",
        "D": "The remote-notarization fee does not authorize apostille issuance."
      },
      "source_reference": "Hawaii Office of the Lieutenant Governor, Apostilles and Certification of Documents, private documents. https://ltgov.hawaii.gov/application-for-apostille-or-certification-of-documents/",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-189": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A customer will submit a Hawaii-notarized private affidavit to the Office of the Lieutenant Governor for an apostille. What must the customer obtain first?",
      "option_a": "Authentication of the notary’s signature and seal from the circuit court where the notary is registered.",
      "option_b": "A second notarial seal issued in another state.",
      "option_c": "A new notary examination result.",
      "option_d": "The notary’s journal.",
      "correct_option": "A",
      "explanation": "The Lieutenant Governor’s current instructions for notarized private documents require the notarization to be certified at the Circuit Court Legal Documents Office where the notary is registered before it goes to the Lieutenant Governor. Different instructions apply to certain state-issued vital records.",
      "option_feedback": {
        "A": "Correct. Circuit court certification precedes this private-document apostille request.",
        "B": "A second out-of-state seal does not authenticate the Hawaii notary.",
        "C": "The examination result does not prove the official signature and seal on this affidavit.",
        "D": "This request does not require surrender of the notary’s journal."
      },
      "source_reference": "HRS §456-4(a); Hawaii Office of the Lieutenant Governor, Apostilles and Certification of Documents, notarized private documents. https://ltgov.hawaii.gov/application-for-apostille-or-certification-of-documents/",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-202": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "Under HRS §456-23(b)(1), which methods may a Hawaii remote online notary use to establish the remotely located signer’s identity?",
      "option_a": "A selfie supplied by the signer.",
      "option_b": "A photocopy of a driver’s license sent by mail.",
      "option_c": "The email address the signer used for the meeting.",
      "option_d": "Personal knowledge, satisfactory evidence from a qualifying credible witness who appears and verifies identity by oath or affirmation, or satisfactory evidence from at least two different types of identity proofing.",
      "correct_option": "D",
      "explanation": "The statute provides three separate routes. The remote notary may personally know the signer, receive sworn or affirmed identity evidence from a credible witness who appears before the notary, or obtain satisfactory identity evidence using at least two different types of proofing.",
      "option_feedback": {
        "A": "A selfie does not by itself provide any of the listed identity routes.",
        "B": "A mailed photocopy does not establish identity through the required remote process.",
        "C": "An email address does not establish the signer’s identity by any of the listed methods.",
        "D": "Correct. The credible-witness route requires an oath or affirmation, and the proofing route requires at least two types."
      },
      "source_reference": "HRS §456-23(b)(1); HAR §5-11-70, printed pp. 11-35–11-36. https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0023.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-203": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii remote online notary does not have satisfactory evidence of a signer’s identity by another method. Which two types of identity proofing does HAR §5-11-69 require for this route?",
      "option_a": "Five separate types of identity proofing.",
      "option_b": "A clear video feed alone.",
      "option_c": "Credential analysis and knowledge-based authentication.",
      "option_d": "Either credential analysis or knowledge-based authentication, at the notary’s choice.",
      "correct_option": "C",
      "explanation": "The rule requires two types of proofing. The process analyzes the signer’s identity credential and uses knowledge-based authentication. The procedure also lets the notary visually compare the signer with the identity credential.",
      "option_feedback": {
        "A": "Five is the minimum number of quiz questions, not the number of proofing types.",
        "B": "Clear video helps visual comparison but does not replace the required proofing.",
        "C": "Correct. The procedure uses both credential analysis and knowledge-based authentication.",
        "D": "One type alone does not meet this rule."
      },
      "source_reference": "HAR §5-11-69(a), (b)(1), (b)(2)(A), printed pp. 11-33–11-34. https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-213": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii notary receives a separate remote online commission. Under HAR §5-11-65(1), what must the notary file within 30 days of receiving it?",
      "option_a": "A literal or photostatic copy of the remote commission with the circuit court clerk for the circuit where the notary resides.",
      "option_b": "Nothing until the commission expires.",
      "option_c": "A copy of the ordinary paper journal with the Attorney General.",
      "option_d": "An apostille for the commission with the Lieutenant Governor.",
      "correct_option": "A",
      "explanation": "The 30-day deadline in §5-11-65(1) applies to filing the remote commission copy with the clerk in the notary’s residence circuit. Subdivision (2) separately requires giving the Attorney General a tangible copy of the electronic seal and electronic signature before the remote commission takes effect.",
      "option_feedback": {
        "A": "Correct. The 30-day filing is the commission copy in the notary’s residence circuit.",
        "B": "Waiting for expiration misses the 30-day filing deadline.",
        "C": "The paper journal does not satisfy the commission filing.",
        "D": "An apostille is not part of this commission filing."
      },
      "source_reference": "HAR §5-11-65(1)–(2), printed p. 11-31. https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-217": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A Hawaii remote online commission expires without renewal. The notary disables the electronic stamping device. What must the notary send to the Attorney General, and what fine does HAR §5-11-46(b)(8) specify for failure to comply?",
      "option_a": "A declaration within 90 days stating when and how the device was disabled. The fine provision specifies $200 for failing to disable the device and submit the declaration as required.",
      "option_b": "Delivery of the device to the signer with no declaration.",
      "option_c": "A $20 fee in lieu of the declaration.",
      "option_d": "No declaration if the device has already been disabled.",
      "correct_option": "A",
      "explanation": "The device must be disabled when the commission expires without renewal. HAR §5-11-72(f) requires a declaration to the Attorney General within 90 days that gives the date and method of disabling. The fine provision in §5-11-46(b)(8) specifies $200 for failure to disable and submit the required declaration.",
      "option_feedback": {
        "A": "Correct. Disabling the device and submitting the declaration are separate steps.",
        "B": "The signer does not receive the device or replace the Attorney General as recipient of the declaration.",
        "C": "Payment of $20 does not replace the declaration.",
        "D": "Disabling the device does not remove the filing duty."
      },
      "source_reference": "HRS §456-3; HAR §5-11-46(b)(8), printed p. 11-25; HAR §5-11-72(f), printed pp. 11-39–11-40. https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0003.htm",
      "last_verified_at": "2026-11-19"
    }
  },
  "hi-218": {
    "version": 2,
    "previousReviewedDate": "2026-11-07",
    "fields": {
      "question_text": "A credible witness will join a Hawaii remote notarial session from a third location. What must be true for the notary to use that witness to verify the signer’s identity?",
      "option_a": "The witness can identify the signer by text message without joining the session.",
      "option_b": "The witness must be the signer’s spouse.",
      "option_c": "The witness need not know the signer if the witness has passed identity proofing.",
      "option_d": "All three people can communicate through the required technology. The witness personally knows the signer and verifies identity under oath or affirmation. The notary personally knows the witness or verifies the witness under §5-11-69.",
      "correct_option": "D",
      "explanation": "A remotely located credible witness must personally know the signer and identify the signer under oath or affirmation. The remote notary must personally know the witness or verify their identity under HAR §5-11-69. The notary, witness and signer must also be able to communicate using the required technology.",
      "option_feedback": {
        "A": "Text messages alone do not satisfy the communication and verification requirements.",
        "B": "Marriage is not a requirement or substitute for the statutory conditions.",
        "C": "Identity proofing of the witness does not replace the witness’s personal knowledge of the signer.",
        "D": "Correct. The requirements cover the technology, the witness’s knowledge and sworn statement, and the witness’s own identity."
      },
      "source_reference": "HRS §456-23(b)(1)(B); HAR §5-11-70, printed pp. 11-35–11-36. https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf",
      "last_verified_at": "2026-11-19"
    }
  }
};
