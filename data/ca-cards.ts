export type CaCard = {
  id: string; study: string; title: string; front: string; rule: string; boundary: string; mixup: string; source: string; sourceUrl: string;
};

export const caCards: CaCard[] = [
  {
    id: "ca-card-admin", study: "bond-oath", title: "When the commission starts",
    front: "When does a California notary commission take effect?", rule: "After the oath and the $15,000 surety bond are filed with the county clerk.", boundary: "The filing window is 30 calendar days from the commission start date. Filing on day 31 means the commission never takes effect.",
    mixup: "A passing exam score is not a commission, and a cash deposit cannot replace the surety bond.", source: "Gov. Code \u00a7\u00a7 8212, 8213; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-education", study: "education-exam", title: "Six hours, then three",
    front: "Which course is required before a first California commission?", rule: "An approved six-hour course.", boundary: "A three-hour refresher works only for reappointment after a six-hour course was already completed.",
    mixup: "A course from another state, or a three-hour class taken first, does not satisfy section 8201.", source: "Gov. Code \u00a7 8201; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-acts", study: "acknowledgment", title: "Appearance, not the mailing",
    front: "Can a notary acknowledge a deed that arrived by mail?", rule: "No. The signer must personally appear and acknowledge the signature.", boundary: "An acknowledgment does not require the notary to have watched the original signing.",
    mixup: "Knowing the signature, or seeing the signer on video, is not a substitute while remote notarization is not operative.", source: "Civ. Code \u00a7 1189; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-fees", study: "fees", title: "Fifteen dollars a signature",
    front: "What is the maximum fee for one acknowledgment signature?", rule: "$15 for each signature, including the seal and the certificate.", boundary: "The notary may charge less or nothing. The journal still records the amount, including 'no fee.'",
    mixup: "Two signers mean two maximum fees, not one fee for the document.", source: "Gov. Code \u00a7 8211(a)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8211",
  },
  {
    id: "ca-card-id", study: "identification", title: "Three ways to be satisfied",
    front: "How can a signer be identified?", rule: "By a listed identification document, one credible witness the notary knows, or two credible witnesses with proper identification.", boundary: "Personal knowledge of the signer is not its own method.",
    mixup: "A birth certificate or a private badge is not on the list.", source: "Civ. Code \u00a7 1185", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=1185",
  },
  {
    id: "ca-card-journal", study: "journal-thumbprint", title: "The journal stays with the notary",
    front: "Who owns the sequential journal?", rule: "The notary. It is not surrendered to an employer, even if the employer paid for it.", boundary: "Keep one active journal, locked, under the notary's exclusive control.",
    mixup: "Leaving it for the next shift, or keeping a second active book for the employer, breaks that rule.", source: "Gov. Code \u00a7 8206", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206",
  },
  {
    id: "ca-card-seal", study: "seal", title: "Destroy the seal",
    front: "What happens to the seal when the commission ends?", rule: "Destroy it. Do not give it to an employer.", boundary: "The title and the seal are used only for notarial acts.",
    mixup: "An embosser does not replace the photographically reproducible stamp.", source: "Gov. Code \u00a7 8207", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8207",
  },
  {
    id: "ca-card-language", study: "advertising-immigration", title: "Notario is prohibited",
    front: "May a non-attorney notary advertise in Spanish as a notario?", rule: "No. Notary Public may not be translated as notario or notario publico.", boundary: "A first violation is grounds for suspension of at least one year or revocation. A second violation is permanent revocation.",
    mixup: "Posting the required notice does not make the Spanish translation legal.", source: "Gov. Code \u00a7 8219.5", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8219.5",
  },
  {
    id: "ca-card-ron", study: "electronic-ron", title: "Video is not appearance yet",
    front: "Can a California notary perform remote online notarization today?", rule: "Not yet. Performance duties wait until the Secretary of State finishes the technology project or January 1, 2030, whichever is earlier.", boundary: "A signer who is physically present may still notarize an electronic document if the ordinary rules are met.",
    mixup: "A vendor's claim that a platform is approved does not start the remote-online duties.", source: "2026 handbook, January 2026 edition", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-score", study: "education-exam", title: "Scaled 70",
    front: "Is 70 percent the official passing score?", rule: "No. The official exam needs a scaled score of at least 70.", boundary: "A scaled score is not the number correct divided by 45 or by 40.",
    mixup: "The practice site's 8-of-10 suggestion is a study signal, not that official scale.", source: "CPS HR notary exam information, checked 2026-11-05", sourceUrl: "https://cpshr.us/services/california-notary-exam-2/notary-exam-information/",
  },
  {
    id: "ca-card-age", study: "qualification", title: "Age and residence",
    front: "Who may apply?", rule: "A person 18 or older who is a legal California resident, completes an approved course, passes the exam, and clears a background check.", boundary: "There is no maximum age and no citizenship requirement in section 8201.",
    mixup: "Living in Nevada and working in California does not meet the residence rule.", source: "Gov. Code \u00a7 8201", sourceUrl: "https://www.sos.ca.gov/notary/qualifications",
  },
  {
    id: "ca-card-disclose", study: "qualification", title: "Old convictions still count",
    front: "What convictions are disclosed?", rule: "All convictions, and arrests for which trial is pending. A dismissal under Penal Code section 1203.4 or 1203.4a is still disclosed.", boundary: "There is no time limit. Failure to disclose is itself a reason to recommend denial.",
    mixup: "A 25-year-old DUI is not omitted because it is old.", source: "Secretary of State qualifications page", sourceUrl: "https://www.sos.ca.gov/notary/qualifications",
  },
  {
    id: "ca-card-support", study: "qualification", title: "Child support",
    front: "What if child support is unpaid?", rule: "Family Code section 17520 allows a temporary-term commission, and later noncompliance can lead to suspension or revocation.", boundary: "The commission length is not chosen by the county clerk.",
    mixup: "Paying the bond does not cure a support order.", source: "Fam. Code \u00a7 17520", sourceUrl: "https://www.sos.ca.gov/notary/qualifications",
  },
  {
    id: "ca-card-prints", study: "qualification", title: "Fingerprints every time",
    front: "Does reappointment skip Live Scan?", rule: "No. Every appointment, including reappointment, requires fingerprints for a DOJ check, forwarded to the FBI.", boundary: "Only the applicant's name and address on the application are public.",
    mixup: "A continuous commission does not waive the new background check.", source: "Gov. Code \u00a7\u00a7 8201.1, 8201.5; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-month", study: "education-exam", title: "Once a month",
    front: "How often may a candidate test?", rule: "Only once per calendar month. A second score in that month is invalid and the fee is forfeited.", boundary: "Results are mailed in about 15 to 20 business days and are not given by phone.",
    mixup: "A rescore needs a written request and a $30 money order within 45 days.", source: "CPS HR exam information", sourceUrl: "https://cpshr.us/services/california-notary-exam-2/notary-exam-information/",
  },
  {
    id: "ca-card-surety", study: "bond-oath", title: "Surety, not cash",
    front: "What kind of bond is filed?", rule: "A $15,000 bond by an admitted surety insurer. A deposit in lieu of bond is not allowed.", boundary: "The oath is taken at the county clerk of the business county or before another notary in that county.",
    mixup: "If a notary takes the oath, the papers may be filed by certified mail or other receipted delivery.", source: "Gov. Code \u00a7\u00a7 8212, 8213", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8212",
  },
  {
    id: "ca-card-name", study: "bond-oath", title: "Name-change seal",
    front: "When is the new seal due after a name change?", rule: "File the new oath and bond amendment within 30 days of the amended commission, then obtain the new seal within 30 days of that filing.", boundary: "The old seal is not kept until the four-year term ends.",
    mixup: "The county clerk keeps the oath for one year after the term expires.", source: "Gov. Code \u00a7\u00a7 8213, 8213.6; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-address", study: "address-records", title: "Thirty days, no fee",
    front: "How is an address change reported?", rule: "In writing to the Secretary of State within 30 days, by certified mail or other receipted physical delivery. There is no processing fee.", boundary: "Willful failure is an infraction of not more than $500. Include the commission number, expiration, and which address changed.",
    mixup: "A new county filing is optional. A commissioned notary may act anywhere in California.", source: "Gov. Code \u00a7 8213.5", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8213.5",
  },
  {
    id: "ca-card-county-seal", study: "address-records", title: "New county, new seal",
    front: "What if the notary chooses to file in the new county?", rule: "Within 30 days of that filing, obtain a seal that names the new county.", boundary: "The move alone does not end the commission or require a new exam.",
    mixup: "The original filing county remains enough if the notary does not elect a new filing.", source: "Gov. Code \u00a7 8213(b)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8213",
  },
  {
    id: "ca-card-interest", study: "authority-conflict", title: "Named on the deed",
    front: "When is the notary too close to the transaction?", rule: "A notary named individually as a principal, or as grantor, grantee, trustee, beneficiary, or a similar real-property party, shall not notarize that transaction.", boundary: "Acting only as an employee or escrow officer for someone else is not, by itself, a direct interest.",
    mixup: "A coworker watching does not remove the notary's own interest. The notary also cannot acknowledge the notary's own signature.", source: "Gov. Code \u00a7\u00a7 8224, 8224.1", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8224",
  },
  {
    id: "ca-card-advice", study: "authority-conflict", title: "No legal advice",
    front: "May the notary pick the deed form?", rule: "No. The signer chooses the document and the act. The notary identifies the signer and completes the certificate.", boundary: "Explaining which box creates a right of survivorship is legal advice.",
    mixup: "The same limit applies in English and in any other language.", source: "2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-ack-wording", study: "acknowledgment", title: "The certificate is the act",
    front: "What does the acknowledgment verify?", rule: "The identity of the person who appeared and acknowledged the signature, not the truth of the document.", boundary: "The seal cannot sit on a page that has no correct notarial wording.",
    mixup: "The venue is the county where the appearance happened, not the county named in the deed.", source: "Civ. Code \u00a7 1189", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-mark", study: "acknowledgment", title: "A mark is still a signature",
    front: "A signer signs by mark. What changes?", rule: "The signer still appears and is identified. The mark does not skip satisfactory evidence.", boundary: "Two people watching the mark do not replace a driver license or a proper witness method.",
    mixup: "The notary does not sign in place of the marker.", source: "Civ. Code \u00a7 1185; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-jurat", study: "jurat", title: "Oath and a new signature",
    front: "How is a jurat different from an acknowledgment?", rule: "The signer appears, swears or affirms the contents, and signs before the notary.", boundary: "A document already signed at home, with no oath, does not receive a jurat.",
    mixup: "Raising the right hand is traditional, not required. An acceptable question is whether the statements in the document are true.", source: "Gov. Code \u00a7 8202; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-incomplete", study: "certificates", title: "Blanks stop the act",
    front: "What if a blank is obvious?", rule: "Do not notarize a signature on a document that appears incomplete.", boundary: "The notary does not fill the blank.",
    mixup: "This is true for English and foreign-language documents.", source: "2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-date", study: "certificates", title: "Today's date",
    front: "Which date goes on the certificate?", rule: "The date the signer appeared and the act was performed.", boundary: "Backdating to the day the document was drafted is a false statement if the notary knows it.",
    mixup: "The county recorder does not insert the notarial date later.", source: "Civ. Code \u00a7 1189; Gov. Code \u00a7 8202", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-map", study: "certificates", title: "Maps and ink",
    front: "When may a subdivision-map acknowledgment omit the stamp?", rule: "When the map material will not take stamp-pad ink. Type or print the notary's name, business county, and commission expiration beside the signature.", boundary: "Ordinary paper deeds do not get this exception.",
    mixup: "An illegible seal over a signature can be rejected for recording.", source: "Gov. Code \u00a7 66436(c)", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-subwitness", study: "subscribing-witness", title: "When the principal cannot appear",
    front: "What is proof by a subscribing witness?", rule: "Someone who saw the principal sign, or heard the principal acknowledge the signature, proves that execution and signs the journal.", boundary: "A credible witness whom the notary knows must identify the subscribing witness and present paper identification.",
    mixup: "This method cannot be used on a power of attorney, a grant deed, or a deed of trust, with narrow foreclosure exceptions.", source: "Civ. Code \u00a7\u00a7 1195, 1196; Gov. Code \u00a7 27287", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-sub-oath", study: "subscribing-witness", title: "What the witness swears",
    front: "What does the subscribing witness prove?", rule: "That the witness knows the principal, saw the signing or heard the acknowledgment, and was asked to sign as a witness and did so.", boundary: "The notary does not identify the absent principal from a phone call.",
    mixup: "The credible witness also signs the journal or has identification details recorded.", source: "Civ. Code \u00a7 1197; Code Civ. Proc. \u00a7 1935", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-poa", study: "copy-cert", title: "Only a power of attorney",
    front: "Which copy may a notary certify?", rule: "A copy of a power of attorney under Probate Code section 4307. The maximum fee is $15.", boundary: "A birth certificate or an ordinary contract is not that authority.",
    mixup: "A journal photocopy for a member of the public is a different request, capped at $0.30 a page.", source: "Prob. Code \u00a7 4307; Gov. Code \u00a7 8211(e)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8211",
  },
  {
    id: "ca-card-e-doc", study: "electronic-ron", title: "Electronic, in person",
    front: "May the document be electronic?", rule: "Yes, if the signer is physically present and the ordinary identity, journal, certificate, and seal rules are met.", boundary: "A seal is not required on an electronic real-estate document under section 27391(f), or on certain subdivision maps.",
    mixup: "Remote audio-video is a separate, later authority.", source: "Gov. Code \u00a7\u00a7 27391, 66436; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-dl", study: "identification", title: "DMV cards and the five-year rule",
    front: "When does a California driver license work?", rule: "When it is current or was issued within five years, and the notary reasonably relies on it.", boundary: "A license issued six years ago and expired does not meet that branch.",
    mixup: "The journal still records the type, agency, number, and issue or expiration date.", source: "Civ. Code \u00a7 1185(b)(3); Gov. Code \u00a7 8206", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-passport", study: "identification", title: "Passports and other cards",
    front: "Which other photo identifications can qualify?", rule: "A United States passport. A foreign passport or out-of-state license qualifies only with a photograph, description, signature, and identifying number.", boundary: "A military card missing one of those elements should not be treated as sufficient. The handbook warns that some military cards lack them.",
    mixup: "A state-employee card can qualify when all four elements are present. A private badge cannot.", source: "Civ. Code \u00a7 1185(b)(3)\u2013(4)", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-inmate", study: "identification", title: "Identification in custody",
    front: "What may an inmate use?", rule: "A CDCR card while in state prison, or sheriff identification while in a local detention facility.", boundary: "Those cards do not travel with the person after release as a listed category.",
    mixup: "Custody status is part of the statutory permission.", source: "Civ. Code \u00a7 1185(b)(3)", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-one-witness", study: "credible-witness", title: "One witness the notary knows",
    front: "When does one credible witness work?", rule: "The notary personally knows the witness, the witness presents paper identification, and the witness swears to all five statutory statements.", boundary: "The signer must not have an acceptable identification, and getting one must be very difficult or impossible.",
    mixup: "A passport in the signer's hand defeats that oath. The witness cannot be named in the document or have a financial interest.", source: "Civ. Code \u00a7 1185(b)(1)", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-two-witness", study: "credible-witness", title: "Two witnesses the notary does not know",
    front: "When are two credible witnesses required?", rule: "When the notary does not know the witness. Both must have paper identification and take the same oath.", boundary: "One unknown witness is not enough.",
    mixup: "Both sign the journal, and the notary records their identification numbers and dates.", source: "Civ. Code \u00a7 1185(b)(2); Gov. Code \u00a7 8206", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-forms", study: "advertising-immigration", title: "Who may complete immigration forms",
    front: "May every notary fill in an immigration form?", rule: "No. Only an attorney, a DOJ-accredited representative, or a person registered and bonded as an immigration consultant may assist in completing the forms.", boundary: "Notarizing a signature on an immigration document is not itself prohibited.",
    mixup: "A bonded consultant who is a notary may charge no more than $15 per person for each set of forms, unless acting as an attorney.", source: "Gov. Code \u00a7 8223; Bus. & Prof. Code \u00a7 22440", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-notice", study: "advertising-immigration", title: "The posted notice",
    front: "What does a non-English advertisement need?", rule: "A notice, in English and the other language, that the notary is not an attorney and cannot give legal advice, plus the statutory fees.", boundary: "The Secretary of State prescribes the printing and posting. A single English desk plaque is the exception.",
    mixup: "The notice does not authorize the word notario.", source: "Gov. Code \u00a7 8219.5", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8219.5",
  },
  {
    id: "ca-card-8223", study: "advertising-immigration", title: "Consultant and notary ads",
    front: "Can immigration-consultant advertising mention the notary commission?", rule: "No. Someone who promotes immigration-specialist or consultant services shall not advertise as a notary public.", boundary: "That limit is separate from the $15 form-entry cap.",
    mixup: "An English legal-advice slogan is still legal advice even without a foreign-language ad.", source: "Gov. Code \u00a7 8223", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8223",
  },
  {
    id: "ca-card-foreign", study: "foreign-language", title: "A language you do not read",
    front: "May the notary acknowledge a document written in an unfamiliar language?", rule: "Yes, if the notary can communicate with the signer, identify the type or journal it as a foreign-language document, and the document does not appear incomplete.", boundary: "The notary completes the California certificate. An interpreter is not used for the oath or acknowledgment.",
    mixup: "Refer the signer to a notary who shares the signer's language when communication fails.", source: "2026 handbook, Foreign Language", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-translate", study: "foreign-language", title: "Do not translate the deed",
    front: "What is not part of the notarial act?", rule: "Translating the document or explaining its legal effect.", boundary: "The journal can say 'a document in a foreign language' when the type cannot be identified.",
    mixup: "A deed of trust still needs the signer's thumbprint even if the document is not in English.", source: "Gov. Code \u00a7 8206; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-thumb", study: "journal-thumbprint", title: "Right thumb first",
    front: "Which documents need a thumbprint?", rule: "A deed, quitclaim deed, deed of trust, other document affecting real property, or a power of attorney.", boundary: "Use the left thumb or another finger, and say so, if the right thumb cannot be printed. If no finger can be printed, explain the physical condition.",
    mixup: "A deed of reconveyance and a trustee's deed from foreclosure are excluded.", source: "Gov. Code \u00a7 8206(a)(2)(G)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206",
  },
  {
    id: "ca-card-lost", study: "journal-thumbprint", title: "A journal is stolen",
    front: "What notice follows a lost or destroyed journal?", rule: "Immediate notice to the Secretary of State by certified or registered mail, or other receipted physical delivery.", boundary: "Include the period of entries, the commission number, and the expiration date. Include a police-report copy when there is one.",
    mixup: "Starting a new book the same day does not replace the notice.", source: "Gov. Code \u00a7 8206(b)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206",
  },
  {
    id: "ca-card-copy", study: "journal-thumbprint", title: "A request for one line",
    front: "How fast is a journal copy provided?", rule: "Within 15 business days after a written request that names the parties, the document type, and the month and year.", boundary: "The charge is not more than $0.30 a page. The response is a copy of the line or a statement that no line exists.",
    mixup: "This is not the $15 power-of-attorney copy certification.", source: "Gov. Code \u00a7 8206(c)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206",
  },
  {
    id: "ca-card-officer", study: "journal-thumbprint", title: "A peace officer's request",
    front: "When does the journal leave the notary's hands?", rule: "Immediately, to a peace officer investigating a crime who has reasonable suspicion the journal contains evidence. If it is not present, surrender it as soon as possible.", boundary: "The employer does not receive it as a middle step.",
    mixup: "County-clerk delivery at the end of the commission is a different duty.", source: "Gov. Code \u00a7 8206", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206",
  },
  {
    id: "ca-card-travel", study: "fees", title: "Travel is separate",
    front: "How is a travel charge journaled?", rule: "Separately from the notarial fee.", boundary: "The acknowledgment maximum stays $15 per signature.",
    mixup: "Folding travel into the notarial fee hides the statutory charge.", source: "Gov. Code \u00a7\u00a7 8206, 8211; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-zero", study: "fees", title: "Some acts are free",
    front: "When is the fee zero by statute?", rule: "Vote-by-mail materials, a veteran's benefit claim, a military-reservation notary, a nomination paper, and certain public-employee pension papers.", boundary: "A public-agency notary under section 8202.5 charges and remits the fee to the agency.",
    mixup: "Zero does not mean 'no journal line.'", source: "Gov. Code \u00a7\u00a7 8211, 6107, 6106, 8203.6; Elec. Code \u00a7 8080", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-deposition", study: "fees", title: "Deposition math",
    front: "What may a deposition cost?", rule: "Up to $30 for the deposition services, plus $7 for the witness oath and $7 for the certificate.", boundary: "A jurat for one person, outside that deposition schedule, is $15 including the seal.",
    mixup: "The deposition limits are not a flat $15 for the whole proceeding.", source: "Gov. Code \u00a7 8211(b)\u2013(c)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8211",
  },
  {
    id: "ca-card-false", study: "misconduct", title: "A known false line",
    front: "What is a willfully false certificate?", rule: "Stating a material fact the notary knows is false, such as a fake appearance date.", boundary: "The handbook describes a civil penalty not exceeding $10,000, plus criminal and administrative consequences.",
    mixup: "A hurry is not an exception to the certificate wording.", source: "2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-destroy", study: "misconduct", title: "Destroying the journal",
    front: "Who is liable for destroying notarial papers?", rule: "A person who knowingly destroys, defaces, or conceals them commits a misdemeanor and can be liable for damages.", boundary: "That rule is not just an office policy.",
    mixup: "The notary's own duty to keep the journal is separate from this offense.", source: "Gov. Code \u00a7 8221", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8221",
  },
  {
    id: "ca-card-control", study: "misconduct", title: "Willful loss of the seal",
    front: "What if the seal is handed to a coworker?", rule: "Willful failure to keep the seal under exclusive control, or willful surrender to someone not allowed to have it, is a misdemeanor.", boundary: "The employer's payment for the seal does not transfer that control.",
    mixup: "The same control idea applies to the journal.", source: "Gov. Code \u00a7 8228.1", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8228.1",
  },
  {
    id: "ca-card-early", study: "misconduct", title: "Before the filing",
    front: "May the notary act during the 30-day filing window, before filing?", rule: "No. The commission does not take effect until the oath and bond are filed.", boundary: "Acts during that gap are not cured by a later timely filing.",
    mixup: "Day 31 is too late for the filing itself.", source: "Gov. Code \u00a7 8213(a)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8213",
  },
  {
    id: "ca-card-doubt", study: "identification", title: "Reasonable doubt",
    front: "What if the card does not match the person?", rule: "Satisfactory evidence includes the absence of facts that would make a reasonable person doubt the identity.", boundary: "A current license does not overcome an obvious mismatch.",
    mixup: "The notary does not 'give the signer the benefit of the doubt' against that standard.", source: "Civ. Code \u00a7 1185(b)", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-public", study: "qualification", title: "What the public can see",
    front: "What application facts are public?", rule: "The applicant's name and address. The rest is confidential.", boundary: "Exam scores and conviction disclosures are not the public portion.",
    mixup: "Confidentiality does not remove the duty to disclose convictions to the Secretary of State.", source: "Gov. Code \u00a7 8201.5", sourceUrl: "https://www.sos.ca.gov/notary/qualifications",
  },
  {
    id: "ca-card-felony", study: "qualification", title: "Recommended denial windows",
    front: "How do prior crimes affect a recommendation?", rule: "A felony is a recommended denial where less than 10 years have passed since probation ended. A listed misdemeanor uses a five-year window.", boundary: "The list of common disqualifying convictions is not complete. The facts of a case can still warrant denial.",
    mixup: "The applicant can appeal a recommended denial.", source: "Secretary of State qualifications page", sourceUrl: "https://www.sos.ca.gov/notary/qualifications",
  },
  {
    id: "ca-card-oath-file", study: "bond-oath", title: "Where the papers go",
    front: "What does the county clerk send after filing?", rule: "A certificate and a copy of the signed oath go to the Secretary of State, and the bond goes to the county recorder.", boundary: "The copy of the oath on file with the Secretary of State can be read in evidence like the original.",
    mixup: "The clerk does not keep the bond in place of the recorder.", source: "Gov. Code \u00a7 8213(a)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8213",
  },
  {
    id: "ca-card-anywhere", study: "authority-conflict", title: "Anywhere in the state",
    front: "Does the county on the seal limit where the notary works?", rule: "No. After commissioning, the notary may act anywhere in California.", boundary: "The county on the seal is the principal place of business.",
    mixup: "A new-county filing is permissive, not a border.", source: "Gov. Code \u00a7 8213; 2026 handbook", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-compare", study: "jurat", title: "Acknowledgment or jurat",
    front: "Which act fits the facts?", rule: "Choose an acknowledgment when the signer admits a signature already made. Choose a jurat when the signer swears to the contents and signs now.", boundary: "Do not attach both 'so either one works.'",
    mixup: "A jurat fee and an acknowledgment fee are each capped at $15, but they are not the same act.", source: "Civ. Code \u00a7 1189; Gov. Code \u00a7 8202", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-platform", study: "electronic-ron", title: "What is already operative",
    front: "Has any part of the 2023 online act started?", rule: "Yes. Recognition statutes and Civil Code sections 1182 and 1183 were operative January 1, 2024. Security rules in section 8231.18 were operative January 1, 2025.", boundary: "Those sections do not let a California notary perform remote notarizations before the project date or January 1, 2030.",
    mixup: "Do not read 'the act was signed' as 'remote acts are open.'", source: "2026 handbook, pages 1\u20132", sourceUrl: "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf",
  },
  {
    id: "ca-card-journal-fee", study: "fees", title: "Write the fee every time",
    front: "What fee line is required?", rule: "The fee charged for the notarial service, even when it is zero.", boundary: "Travel is a separate line. A public-agency remittance is still entered.",
    mixup: "Skipping the line because the employer keeps the money is not the rule.", source: "Gov. Code \u00a7 8206(a)(2)(F)", sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=8206",
  },
];
