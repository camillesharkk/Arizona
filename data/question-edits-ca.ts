import type { QuestionEdit } from "../lib/question-version.ts";

export const caQuestionEdits: Readonly<Partial<Record<string, QuestionEdit>>> = {
  "ca-054": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary applicant discloses a felony conviction and completed probation three years ago. What do the Secretary of State’s disciplinary guidelines identify as the recommended action and the time factor for a possible departure?",
      "option_a": "Approve the application because disclosure removes the conviction as a ground for denial.",
      "option_b": "Approve the application because completing probation satisfies the guideline.",
      "option_c": "Recommend denial. Three years does not meet the ten-year time factor for considering a departure.",
      "option_d": "Apply the five-year factor for a lesser disqualifying offense.",
      "correct_option": "C",
      "explanation": "The guidelines recommend denial when an applicant has a felony conviction. At least ten years after completing probation or parole is a factor that may support a departure from that recommendation. If neither was ordered, the period runs from release from incarceration. Meeting the time factor does not guarantee appointment.",
      "option_feedback": {
        "A": "Disclosure does not remove the conviction as a ground for denial.",
        "B": "Finishing probation starts the relevant period in this scenario.",
        "C": "Correct. Three years is short of the guidelines’ ten-year felony time factor.",
        "D": "The five-year factor applies to specified lesser offenses. The applicant’s conviction is a felony."
      },
      "source_reference": "California Secretary of State, Notary Public Disciplinary Guidelines 2012, printed p. 10, Government Code § 8214.1(b); https://notary.cdn.sos.ca.gov/forms/notary-guidelines-2012.pdf#page=14",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-079": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "In November 2026, two people each acknowledge one signature on the same deed. What is the maximum total California notarial fee for the two acknowledgments, including the seal and certificate?",
      "option_a": "$15 total",
      "option_b": "$30 total",
      "option_c": "$45 total",
      "option_d": "$60 total",
      "correct_option": "B",
      "explanation": "For acknowledgments taken in November 2026, California Government Code § 8211(a) caps the fee at $15 for each signature taken, including the seal and certificate. The combined maximum for two signatures is $30. The Secretary of State says the maximum increases to $20 per signature on January 1, 2027.",
      "option_feedback": {
        "A": "$15 is the maximum for one signature. This deed has two acknowledged signatures.",
        "B": "Correct. Two acknowledged signatures at up to $15 each total $30.",
        "C": "$45 would correspond to three signatures at $15 each. The seal and certificate are included.",
        "D": "$60 would correspond to four signatures at $15 each. Only two signatures were acknowledged."
      },
      "source_reference": "California Government Code § 8211(a), reproduced in 2026 California Notary Public Handbook, printed p. 36; https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=36",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-096": {
    "version": 1,
    "replacementId": "ca-204",
    "fields": {
      "question_text": "A client presents an original power of attorney and a photocopy that omits one page. What should the California notary do if the client wants that photocopy certified?",
      "option_a": "Decline to certify the photocopy until it reproduces the complete original.",
      "option_b": "Certify the photocopy if it includes the principal’s signature page.",
      "option_c": "Write the missing text from memory and certify the photocopy.",
      "option_d": "Certify the photocopy if the agent says the missing page is unimportant.",
      "correct_option": "A",
      "explanation": "Probate Code § 4307(c) requires the notary to examine the original power of attorney and the copy and certify that the copy is a true and correct reproduction. A copy missing a page cannot be certified as a true and correct copy of the complete original.",
      "option_feedback": {
        "A": "Correct. The notary cannot certify an incomplete reproduction as a true and correct copy.",
        "B": "The signature page does not establish that the photocopy reproduces the entire original.",
        "C": "The notary must compare the actual documents and cannot supply missing text from memory.",
        "D": "The agent’s opinion does not establish that the copy reproduces the original."
      },
      "source_reference": "California Probate Code § 4307(c), 2026 California Notary Public Handbook, printed pp. 17–18; https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=17",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-115": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A signer personally appears and presents a California DMV driver’s license issued four years ago that expired last month. Assuming no facts call the signer’s identity into question, can this license qualify as documentary evidence under California Civil Code § 1185?",
      "option_a": "Yes. It was issued within the past five years.",
      "option_b": "No. A California DMV license must be unexpired on the day of the act.",
      "option_c": "Yes, but only if a credible witness also identifies the signer.",
      "option_d": "No. California DMV licenses qualify only during the first three years after issuance.",
      "correct_option": "A",
      "explanation": "California Civil Code § 1185(b)(3)(A) allows reasonable reliance on a California DMV driver’s license that is current or was issued within the past five years. This license meets the issuance-date condition even though it recently expired. Satisfactory evidence still requires that no facts cast reasonable doubt on the signer’s identity.",
      "option_feedback": {
        "A": "Correct. The license was issued within the five-year window.",
        "B": "The statute gives a separate route for a California DMV license issued within five years.",
        "C": "A qualifying California DMV license does not also require a credible witness.",
        "D": "The statute uses a five-year issuance window for this credential."
      },
      "source_reference": "California Civil Code § 1185(b)(3)(A), 2026 California Notary Public Handbook, printed pp. 9 and 46; https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=9",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-116": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A signer personally appears with an expired California DMV identification card issued six years ago. Can the notary rely on this card alone as documentary evidence under California Civil Code § 1185?",
      "option_a": "Yes. Any government photo card qualifies regardless of its age.",
      "option_b": "No. The card has expired and was issued more than five years ago.",
      "option_c": "Yes. A credible witness can make the expired card itself qualify.",
      "option_d": "Yes. The card’s printing is legible, so its expiration and issue dates do not matter.",
      "correct_option": "B",
      "explanation": "California Civil Code § 1185(b)(3)(A) allows reliance on a California DMV identification card that is current or was issued within the past five years. This card meets neither condition. The notary may use a separate authorized identity method if its requirements are met.",
      "option_feedback": {
        "A": "Government issuance and a photograph do not override the statutory date requirements.",
        "B": "Correct. The card is neither current nor issued within the past five years.",
        "C": "A qualifying credible witness is a separate method. The witness cannot make this card qualify.",
        "D": "Readable printing does not satisfy the validity or issuance-date requirement."
      },
      "source_reference": "California Civil Code § 1185(b)(3)(A), 2026 California Notary Public Handbook, printed pp. 9 and 46; https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=9",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-008": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A signer asks the notary to complete a jurat. The signer has already signed and does not want to swear or affirm. What should the notary do?",
      "option_a": "Complete the jurat because the signature is already on the page",
      "option_b": "Explain that a jurat requires signing before the notary and taking an oath or affirmation. Decline if the signer will not do either.",
      "option_c": "Use an acknowledgment stamp and label it a jurat",
      "option_d": "Let the signer choose any wording after the notary leaves",
      "correct_option": "B",
      "explanation": "A jurat requires the signer to appear, sign in the notary’s presence, and take an oath or affirmation. A previously signed document does not satisfy those requirements by itself.",
      "option_feedback": {
        "A": "An existing signature does not replace signing before the notary and taking the oath.",
        "B": "Correct. Explain both requirements and decline the jurat if the signer refuses.",
        "C": "An acknowledgment does not provide the oath or affirmation required for a jurat.",
        "D": "Completing wording later cannot substitute for the notarization."
      },
      "source_reference": "California Government Code §8202(a); 2026 California Notary Public Handbook, Jurat, p. 14. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=14",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-027": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A non-attorney California notary advertises notarial services in a Korean-language flyer. What must the notary post with the flyer?",
      "option_a": "Only the notary's commission number",
      "option_b": "A prescribed notice, in English and in that language, that the notary is not an attorney and cannot give legal advice about immigration or other legal matters, plus the statutory fees",
      "option_c": "A promise that the notary can prepare immigration forms",
      "option_d": "Nothing extra if the notary is a California resident",
      "correct_option": "B",
      "explanation": "Written non-English advertising by a non-attorney notary must carry the prescribed notice in English and in the language of the advertisement, including the statutory notarial fees. A single desk plaque is excluded from the posting rule.",
      "option_feedback": {
        "A": "A commission number does not replace the notice and fee information.",
        "B": "Correct. A Korean-language flyer requires the notice in English and Korean and the statutory fees.",
        "C": "Advertising immigration services does not supply the required notice.",
        "D": "California residence does not exempt the notary."
      },
      "source_reference": "California Government Code §8219.5(a)–(b), 2026 California Notary Public Handbook, p. 40. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=40",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-029": {
    "version": 1,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary who is not an attorney advertises both notarial services and immigration-specialist services. The ad offers to choose immigration forms for clients. What rule applies?",
      "option_a": "The advertisement is fine if the statutory notice is posted",
      "option_b": "The notary cannot advertise as a notary while promoting immigration expertise and cannot choose legal forms or give immigration advice.",
      "option_c": "Immigration advice is allowed when the fee is $15 or less",
      "option_d": "The rule applies only to attorneys",
      "correct_option": "B",
      "explanation": "California bars a notary who promotes immigration expertise from advertising as a notary public. A nonattorney notary’s commission also does not authorize selecting a client’s legal forms or giving legal advice.",
      "option_feedback": {
        "A": "A posted notice does not cure the prohibited combination of advertising.",
        "B": "Correct. The advertising ban and restriction on legal advice apply independently.",
        "C": "A low fee does not authorize legal advice or form selection.",
        "D": "The advertising ban applies to a notary who holds themselves out as an immigration specialist."
      },
      "source_reference": "California Government Code §8223(a)–(c); 2026 California Notary Public Handbook, Practice of Law, p. 8. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=41",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-037": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "An employer paid for a California notary’s seal. The notary leaves that job and keeps an active commission. The employer asks for the seal. What should the notary do?",
      "option_a": "Give the seal to the employer",
      "option_b": "Keep the seal under the notary's direct and exclusive control. It is not surrendered to the employer",
      "option_c": "Mail the seal to the Secretary of State on the last work day",
      "option_d": "Leave the seal in an unlocked desk if the employer has a key",
      "correct_option": "B",
      "explanation": "The seal belongs exclusively to the notary. Even if an employer paid for it, the notary keeps it in a locked, secured place under direct and exclusive control.",
      "option_feedback": {
        "A": "An employer’s payment does not transfer ownership.",
        "B": "Correct. Keep the seal secure and do not surrender it to the former employer.",
        "C": "Leaving a job does not require mailing an active seal to the Secretary of State.",
        "D": "An unlocked desk that the employer can access does not provide exclusive control."
      },
      "source_reference": "California Government Code §8207; 2026 California Notary Public Handbook, Notary Public Seal, p. 8. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=34",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-088": {
    "version": 1,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "An acknowledgment form is prefilled with Sacramento County. The signer appears in Alameda County, where the notary takes the acknowledgment. Which county belongs in the venue?",
      "option_a": "The county named in the document, even if the notarization happened elsewhere",
      "option_b": "The county where the notary lives, regardless of where the signer appeared",
      "option_c": "The county where the signer personally appeared",
      "option_d": "The county of the Secretary of State",
      "correct_option": "C",
      "explanation": "The acknowledgment’s venue identifies where the notarial act occurred. Here the notary took it in Alameda County.",
      "option_feedback": {
        "A": "The prefilled venue must reflect the actual location of the acknowledgment.",
        "B": "The notary’s home address does not control venue.",
        "C": "Correct. The signer appeared for this acknowledgment in Alameda County.",
        "D": "The Secretary of State’s office location does not determine the venue."
      },
      "source_reference": "California Civil Code §1189(a)(1), statutory acknowledgment form. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=48",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-108": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "Where may a California notary with a standard statewide commission perform acknowledgments after filing the oath and bond?",
      "option_a": "Anywhere in California, after the oath and bond are filed",
      "option_b": "Only in the county of the bond filing",
      "option_c": "Only in the city named on the seal",
      "option_d": "In any U.S. state",
      "correct_option": "A",
      "explanation": "A standard California commission authorizes acts throughout the state after the oath and bond are filed. The county on the seal reflects where the oath and bond were filed. Filing again after moving business to another county is optional.",
      "option_feedback": {
        "A": "Correct. The notary can perform acknowledgments anywhere in California.",
        "B": "Filing in a particular county does not limit the statewide commission to that county.",
        "C": "The seal identifies a county of filing, and it does not impose a city limit.",
        "D": "The California commission does not confer authority in other states."
      },
      "source_reference": "California Government Code §§8200, 8207, 8213(a)–(b). https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=28",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-110": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "The signer wants a remote online acknowledgment by audio-video from home. The Secretary of State has not announced that the remote-online provisions are operative. What may the notary do?",
      "option_a": "Decline the video-only acknowledgment and explain that the signer must appear in person before a California notary under current rules.",
      "option_b": "Perform it because the Online Notarization Act was signed in 2023",
      "option_c": "Perform it for California signers only",
      "option_d": "Perform it if the signer is in California and shows a passport",
      "correct_option": "A",
      "explanation": "Until California’s remaining online-notarization provisions become operative, a California notary cannot take the acknowledgment over video alone. The statute ties implementation to the Secretary of State’s technology project and includes a January 1, 2030 fallback subject to a written-notice exception.",
      "option_feedback": {
        "A": "Correct. For this California act, a video appearance alone does not meet the current appearance rule.",
        "B": "Signing the law did not by itself activate California notaries’ online authority.",
        "C": "The signer’s location does not activate the online-notarization rules.",
        "D": "A passport can establish identity if it qualifies, but it cannot substitute for personal appearance."
      },
      "source_reference": "California Government Code §8231(a)–(b); Civil Code §1181.1(b); 2026 California Notary Public Handbook, pp. 23, 43, 46. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=23",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-149": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary who is not an attorney advertises notarial services in a Spanish-language flyer. The flyer has the required notice in Spanish only. Does it comply with Government Code §8219.5?",
      "option_a": "Yes. One language is enough",
      "option_b": "No. The notice must be in English and in the other language",
      "option_c": "Yes, if the fees are listed",
      "option_d": "Yes, because the single-desk-plaque exception covers flyers.",
      "correct_option": "B",
      "explanation": "The required notice for this flyer must be posted in English and in Spanish, and it must list the statutory fees. The single-desk-plaque exception does not apply to a flyer.",
      "option_feedback": {
        "A": "The language of the flyer does not replace the English notice.",
        "B": "Correct. For this flyer the notice must be in both English and Spanish.",
        "C": "A fee list does not remove either language requirement.",
        "D": "A flyer is not a single desk plaque."
      },
      "source_reference": "California Government Code §8219.5(a), 2026 California Notary Public Handbook, p. 40. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=40",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-150": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary can identify an apparently complete foreign-language document as a deed but cannot read its text. The signer appears in person, provides satisfactory identification, and acknowledges signing in English. May the notary take the acknowledgment?",
      "option_a": "Yes. The document can be acknowledged when the requirements are met even if the notary cannot read its language.",
      "option_b": "No. The notary must be fluent in the document's language",
      "option_c": "No. Foreign-language documents cannot be acknowledged",
      "option_d": "Yes, and an interpreter must give the oath",
      "correct_option": "A",
      "explanation": "A notary may acknowledge the signature on a complete foreign-language document when able to communicate with the signer and meet the usual requirements. If the notary cannot identify the type, the journal must record that fact.",
      "option_feedback": {
        "A": "Correct. The notary verifies the signer and acknowledgment, without translating the deed.",
        "B": "Fluency in the document’s language is unnecessary when the notary can communicate directly with the signer.",
        "C": "Foreign-language documents are not categorically barred.",
        "D": "The notary can communicate directly, and this acknowledgment does not require a jurat oath."
      },
      "source_reference": "2026 California Notary Public Handbook, Foreign Language, p. 23; California Civil Code §1189(a)(1). https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=23",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-156": {
    "version": 1,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "What does section 8219.5 mean by a literal translation?",
      "option_a": "A translation prepared by an attorney",
      "option_b": "A translation that explains the signer is not getting legal advice",
      "option_c": "A translation made without regard to the true meaning of the word or phrase in the language being translated.",
      "option_d": "Any advertisement in a foreign language",
      "correct_option": "C",
      "explanation": "Government Code §8219.5(c) uses the original word or phrase’s meaning as the reference point. It expressly prohibits translating “notary public” into Spanish as “notario publico” or “notario.”",
      "option_feedback": {
        "A": "The translator’s profession does not define whether a translation is literal.",
        "B": "A required disclaimer is separate from how the title is translated.",
        "C": "Correct. The statute asks whether the translation disregards the original meaning.",
        "D": "Advertising in another language is not itself a literal translation."
      },
      "source_reference": "California Government Code §8219.5(c), 2026 California Notary Public Handbook, p. 40. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=40",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-159": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary cannot read the language of a document. Its pages are numbered one through five, but page three is missing. The signer asks the notary to stamp the last page. What should the notary do?",
      "option_a": "Stamp the last page",
      "option_b": "Decline to notarize while the document appears incomplete. Do not affix the seal by itself.",
      "option_c": "Stamp it and write 'foreign' on the seal",
      "option_d": "Use the signer's translation as the certificate",
      "correct_option": "B",
      "explanation": "The missing page makes the document appear incomplete, so the notary must decline to notarize the signature as presented. Affixing the seal alone does not perform a notarial act.",
      "option_feedback": {
        "A": "The last page does not supply the missing part of the document.",
        "B": "Correct. The missing page requires declining the act as presented.",
        "C": "An extra note on the seal does not cure an incomplete document.",
        "D": "A translation does not restore the missing page or substitute for a completed notarial certificate."
      },
      "source_reference": "2026 California Notary Public Handbook, Foreign Language, p. 23 and certificate guidance, p. 17. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=23",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-161": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "The foreign-language document is a deed of trust. The signer appears and is identified. Which journal fact is required because of the document type, separate from the language?",
      "option_a": "No thumbprint, because the document is not in English",
      "option_b": "A thumbprint of the notary",
      "option_c": "The signer’s right thumbprint, or a left thumbprint or available fingerprint with a journal note if the right thumbprint is unavailable.",
      "option_d": "A translation attached to the journal",
      "correct_option": "C",
      "explanation": "A deed of trust requires the signer’s right thumbprint in the journal. If the right thumbprint is unavailable, use the left thumb or another available finger and indicate that in the journal. If the signer is physically unable to provide any print, note and explain the condition in the journal.",
      "option_feedback": {
        "A": "The document’s language does not remove the thumbprint requirement.",
        "B": "The journal requires the signer’s print.",
        "C": "Correct. Use the right thumbprint first, then an available digit if needed, and record the fallback.",
        "D": "A translation does not meet the fingerprint requirement."
      },
      "source_reference": "California Government Code §8206(a)(2)(G), 2026 California Notary Public Handbook, p. 32. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=32",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-174": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "Under California Government Code §8207, what must the device used to affix a physical notary seal do?",
      "option_a": "It must create a raised impression, even if the seal cannot be read in a photograph.",
      "option_b": "The seal may be lent to the employer overnight",
      "option_c": "It must print or emboss the required seal elements so they reproduce legibly by photographic methods.",
      "option_d": "The seal may omit the commission expiration date",
      "correct_option": "C",
      "explanation": "A seal press or stamp must reproduce the required seal elements legibly by photographic methods. The handbook describes rubber stamps as common and notes that an embosser may also be used.",
      "option_feedback": {
        "A": "An unreadable image does not meet the reproduction requirement.",
        "B": "The notary must keep the seal under direct and exclusive control.",
        "C": "Correct. The law allows a press or stamp that meets the reproduction standard.",
        "D": "The commission expiration date is a required seal element."
      },
      "source_reference": "California Government Code §8207; 2026 California Notary Public Handbook, Notary Public Seal, pp. 8–9. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=34",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-175": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary’s commission has ended and the notary has not been reappointed. What must the notary or their representative do with the seal?",
      "option_a": "Give it to the employer",
      "option_b": "Destroy or deface it.",
      "option_c": "Keep it for souvenirs",
      "option_d": "Send it to CPS HR",
      "correct_option": "B",
      "explanation": "At the end of the commission, the notary or their representative must destroy or deface the seal.",
      "option_feedback": {
        "A": "The employer cannot take the seal, even if it paid for it.",
        "B": "Correct. Section 8207 requires destruction or defacement.",
        "C": "Keeping the usable seal as a souvenir does not meet the legal requirement.",
        "D": "The exam provider does not receive seals."
      },
      "source_reference": "California Government Code §8207, 2026 California Notary Public Handbook, p. 34. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=34",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-182": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A notary appointed under California Government Code §8203.1 performs a notarial act within the military reservation for which the notary was appointed. What may the notary charge for that service?",
      "option_a": "The ordinary statutory rate for the act.",
      "option_b": "Fees are doubled",
      "option_c": "Fees are paid to the Secretary of State",
      "option_d": "No fee for the notarial service performed within the reservation.",
      "correct_option": "D",
      "explanation": "Section 8203.6 prohibits fees for notarial services rendered within the reservation by notaries appointed for military or naval reservations under §8203.1.",
      "option_feedback": {
        "A": "The reservation-specific fee rule applies instead of the ordinary rate.",
        "B": "The Act does not authorize any fee for this service.",
        "C": "The law prohibits collecting a fee; it does not redirect one to the Secretary of State.",
        "D": "Correct. The service falls within the reservation appointment and the no-fee rule."
      },
      "source_reference": "California Government Code §§8203.1 and 8203.6, 2026 California Notary Public Handbook, p. 31. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=31",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-189": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary knowingly and willfully states a false material fact in a certificate of acknowledgment. What civil penalty does Civil Code §1189(a)(4) authorize?",
      "option_a": "A civil penalty not exceeding $10,000",
      "option_b": "A civil penalty of $15",
      "option_c": "No civil penalty",
      "option_d": "A penalty of $0.30 a page",
      "correct_option": "A",
      "explanation": "For the willful false statement addressed by §1189(a)(4), the civil penalty can be as high as $10,000. Other criminal or administrative consequences may also apply.",
      "option_feedback": {
        "A": "Correct. The statutory civil maximum is $10,000.",
        "B": "The notarial service fee is not the penalty.",
        "C": "The statute expressly allows a civil penalty.",
        "D": "The journal copy rate is unrelated to false certificates."
      },
      "source_reference": "California Civil Code §1189(a)(4); 2026 California Notary Public Handbook, Certificate of Acknowledgment, p. 13. https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=48",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-190": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A California notary’s commission ended yesterday and has not been renewed. A signer asks the former notary to take an acknowledgment using the expired seal. What should the former notary do?",
      "option_a": "Notarize during a 30-day grace period",
      "option_b": "Notarize if the bond is still in the file cabinet",
      "option_c": "Decline the acknowledgment and destroy or deface the expired seal.",
      "option_d": "Notarize and notify the Secretary of State within a year",
      "correct_option": "C",
      "explanation": "A former notary cannot perform an acknowledgment under an expired commission. Section 8207 requires the notary or their representative to destroy or deface the old seal.",
      "option_feedback": {
        "A": "The 30-day journal provisions do not extend authority to notarize.",
        "B": "A bond on file does not extend the expired commission.",
        "C": "Correct. Decline the act and destroy or deface the seal.",
        "D": "Notifying the Secretary later does not authorize the acknowledgment."
      },
      "source_reference": "California Government Code §§8204, 8207 and 8209(a). https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf#page=31",
      "last_verified_at": "2026-11-19"
    }
  },
  "ca-200": {
    "version": 2,
    "previousReviewedDate": "2026-11-05",
    "fields": {
      "question_text": "A client asks a California notary to certify a photocopy of a California birth certificate. What should the notary tell the client?",
      "option_a": "The notary can certify the photocopy for the statutory copy fee.",
      "option_b": "Request a certified copy from the appropriate state or county vital-records office.",
      "option_c": "The notary can certify any copy if given the original public record.",
      "option_d": "A journal entry makes the birth-certificate photocopy a certified copy.",
      "correct_option": "B",
      "explanation": "State and local vital-records officials issue certified California birth records. A notary may notarize a sworn statement required for an application but cannot issue the certified copy of the birth record.",
      "option_feedback": {
        "A": "A fee for a different certification does not authorize this one.",
        "B": "Correct. Use the appropriate official vital-records office.",
        "C": "Having the original does not give a notary vital-records issuing authority.",
        "D": "A notarial journal documents acts; an entry does not certify a public birth record."
      },
      "source_reference": "California Department of Public Health, Obtaining Certified Copies of Birth Records; California Government Code §8205. https://www.cdph.ca.gov/Programs/CHSI/Pages/Vital-Records-Obtaining-Certified-Copies-of-Birth-Records.aspx",
      "last_verified_at": "2026-11-19"
    }
  }
};
