import { caStudyTopics } from "@/lib/ca-topics";

export type CaGuideChapter = {
  id: string;
  title: string;
  summary: string;
  rule: string;
  exception: string;
  exampleTitle: string;
  example: string;
  sourceLabel: string;
  sourceUrl: string;
};

/** Checked 2026-11-06 against the SOS handbook page, qualifications page, and CPS HR exam page. */
export const caGuideCheckedOn = "2026-11-06";

const handbook = "https://www.sos.ca.gov/notary/handbook";
const pdf = "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf";
const qualifications = "https://www.sos.ca.gov/notary/qualifications";
const exam = "https://cpshr.us/services/california-notary-exam-2/notary-exam-information/";

function gov(section: string) {
  return `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=${section}.`;
}

function civ(section: string) {
  return `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=${section}.`;
}

export const caGuideChapters: CaGuideChapter[] = [
  {
    id: "qualification",
    title: "Qualifications and appointment",
    summary: "A California commission is a four-year appointment. Age, residency, education, the exam, and a background check are all required.",
    rule: "Government Code section 8201 requires the applicant to be 18 or older, a legal California resident, complete an approved course, pass the written exam, and clear a background check. There is no maximum age and no citizenship requirement. The application must disclose arrests with a trial pending and every conviction, including dismissals under Penal Code sections 1203.4 and 1203.4a. Fingerprints are required for every appointment, including a reappointment.",
    exception: "Failure to disclose is itself a recommended ground for denial. A felony is a recommended denial when fewer than 10 years have passed since probation ended, and a disqualifying misdemeanor when fewer than 5 years have passed. That list is not exhaustive, and a denial recommendation can be appealed. Family Code section 17520 can produce a temporary commission when child-support compliance is the problem.",
    exampleTitle: "Example: a dismissed conviction",
    example: "An applicant leaves off a conviction that was later dismissed under Penal Code section 1203.4. The qualifications page still requires that disclosure. The dismissal does not erase the duty to report it.",
    sourceLabel: "California Secretary of State, qualifications, Government Code section 8201",
    sourceUrl: qualifications,
  },
  {
    id: "education-exam",
    title: "Training and the exam",
    summary: "The course length depends on whether the applicant has already completed the six-hour course. The exam itself is a separate CPS HR test.",
    rule: "A first commission requires a six-hour approved course. The three-hour refresher is available only after that six-hour course. CPS HR gives a closed-book exam of 45 multiple-choice items, with one hour for the test. Forty items are scored and five are not. A scaled score of at least 70 is required. That score is not a percent. A candidate may test once in a calendar month. A second score in the same month is invalid and the fee is forfeited. Results take about 15 to 20 business days and are not given by phone.",
    exception: "A rescore request must be in writing, with a $30 money order payable to CPS HR, received within 45 days at 2450 Del Paso Road, Suite 160, Sacramento, CA 95834. Checks and cash are not accepted. This site’s 8-of-10 suggestion is a study signal, not a scaled score.",
    exampleTitle: "Example: testing twice in March",
    example: "A candidate fails on March 2 and books another seat on March 20. CPS HR says the later score is invalid and the fee is forfeited. The next valid attempt has to wait until the next calendar month.",
    sourceLabel: "CPS HR notary exam information, checked 2026-11-06",
    sourceUrl: exam,
  },
  {
    id: "bond-oath",
    title: "Bond and oath",
    summary: "The commission does not take effect until the oath and the $15,000 bond are filed on time.",
    rule: "Government Code section 8212 requires a $15,000 bond from an admitted surety insurer. A cash deposit in lieu of the bond is not the method in that section. Section 8213(a) gives 30 calendar days to file the oath and bond. If that filing is late, the commission never takes effect. The oath is taken at the county clerk of the business county, or before another notary in that county. If another notary administers the oath, the filing goes by certified mail or another receipted physical delivery. The clerk sends the oath copy to the Secretary of State and the bond to the recorder.",
    exception: "A name change needs an amended oath and bond within 30 days of the amended commission, and a new seal within 30 days of that filing. The county clerk keeps the oath for one year after the term.",
    exampleTitle: "Example: day 31",
    example: "The commission packet says the term starts June 1. The oath and bond reach the clerk on July 2. That is outside the 30 calendar days in section 8213(a), so this commission does not take effect.",
    sourceLabel: "Government Code sections 8212 and 8213",
    sourceUrl: gov("8213"),
  },
  {
    id: "address-records",
    title: "Address and commission records",
    summary: "An address change is a written notice to the Secretary of State. It does not by itself move the county on the seal.",
    rule: "Government Code section 8213.5 requires written notice of an address change within 30 days, by certified mail or receipted delivery. There is no Secretary of State fee for that notice. The notice includes the commission name, commission number, expiration, which address changed, the new address, and the notary’s signature and date. Only the name and address on the application are public under section 8201.5.",
    exception: "Filing a new oath and bond in a new business county is optional. If the notary chooses that filing, a new seal with the new county is required within 30 days. A commissioned notary may still perform acts anywhere in California. Willful failure to give the address notice is an infraction of up to $500.",
    exampleTitle: "Example: a new apartment, same county",
    example: "A notary moves within the same county and wants to know whether a new seal is required. The address notice is required. A new county seal is required only if the notary elects to file a new oath and bond in a different county.",
    sourceLabel: "Government Code section 8213.5",
    sourceUrl: gov("8213.5"),
  },
  {
    id: "authority-conflict",
    title: "Authority and conflicts",
    summary: "The notary cannot notarize a transaction in which the notary is named in one of the listed roles.",
    rule: "Government Code section 8224 prohibits a notarial act when the notary is individually named as a principal, or as grantor, grantee, mortgagor, mortgagee, trustor, trustee, beneficiary, vendor, vendee, lessor, or lessee. Section 8224.1 also says the notary cannot acknowledge or prove the notary’s own instrument, or take the notary’s own affidavit or deposition.",
    exception: "Being an employee, agent, insurer, attorney, escrow holder, or lender for an interested person is not itself the direct interest listed in section 8224. The notary still cannot certify the notary’s own signature.",
    exampleTitle: "Example: the notary is the grantee",
    example: "A deed names the notary as grantee. The signer is present with valid identification. Section 8224 still prohibits the act because the notary is the grantee, not because the identification failed.",
    sourceLabel: "Government Code sections 8224 and 8224.1",
    sourceUrl: gov("8224"),
  },
  {
    id: "acknowledgment",
    title: "Acknowledgments",
    summary: "An acknowledgment certifies personal appearance and an admission that the signature is the signer’s. The notary does not have to have watched the original signing.",
    rule: "Civil Code section 1189 requires the signer to appear and acknowledge the signature. The certificate uses the statutory wording, the venue is the place of the act, and the certificate date is the date of the act. The notary does not attach an acknowledgment to a document that is incomplete, and does not use the seal to cover signatures or printed text.",
    exception: "The notary does not certify that the document is legally sufficient. Watching the original signing is the jurat rule, not the acknowledgment rule. Do not attach both an acknowledgment and a jurat to force one act to do both jobs.",
    exampleTitle: "Example: signed yesterday",
    example: "A signer brings a deed signed yesterday, appears today, and acknowledges the signature. An acknowledgment can be completed today. The certificate is dated today, not yesterday. A jurat would be the wrong certificate because the signer did not sign again in front of the notary.",
    sourceLabel: "Civil Code section 1189",
    sourceUrl: civ("1189"),
  },
  {
    id: "jurat",
    title: "Jurats and oaths",
    summary: "A jurat requires personal appearance, an oath or affirmation, and a signature made in front of the notary.",
    rule: "Government Code section 8202 requires the affiant to sign in the notary’s presence and to take an oath or affirmation. An acceptable form is: “Do you swear or affirm that the statements in this document are true?” The certificate date is the date of that act.",
    exception: "A raised hand is traditional and is not required. An acknowledgment cannot be substituted when the signer already signed elsewhere and will not sign again. The notary does not administer an oath over the phone.",
    exampleTitle: "Example: the affidavit is already signed",
    example: "The signer wants a jurat on an affidavit signed at home. The notary needs a new signature in the notary’s presence and an oath. Completing only an acknowledgment would certify a different act.",
    sourceLabel: "Government Code section 8202",
    sourceUrl: gov("8202"),
  },
  {
    id: "certificates",
    title: "Certificates",
    summary: "The seal and signature belong on a certificate that states the notarial act the notary actually performed.",
    rule: "The venue is the county where the act is performed. The date is the date of the act. The notary completes a California certificate. The seal must be photographically reproducible and must not cover signatures or other printed matter. An incomplete document is not notarized.",
    exception: "Government Code section 66436(c) allows a subdivision map that will not take ink to omit the stamp when the notary’s name, business county, and commission expiration are typed beside the signature. That exception is about the stamp on that map, not about skipping the certificate wording.",
    exampleTitle: "Example: a blank venue",
    example: "The certificate leaves the venue blank and asks the notary to stamp it anyway. The notary completes the venue for the county where the act occurs. The stamp does not replace the venue or the notarial wording.",
    sourceLabel: "Secretary of State handbook, certificate rules",
    sourceUrl: handbook,
  },
  {
    id: "subscribing-witness",
    title: "Subscribing witnesses",
    summary: "A proof by subscribing witness is unavailable for the instruments the statute lists, including powers of attorney and most real-property documents.",
    rule: "Civil Code sections 1195 through 1197 and Government Code section 27287 govern proof of execution by a subscribing witness. The witness’s identity is proved by one credible witness whom the notary knows, and that credible witness also presents paper identification under Civil Code section 1185.",
    exception: "This method cannot be used on a power of attorney, quitclaim, grant deed (except a trustee’s deed from foreclosure or a deed of reconveyance), mortgage, deed of trust, security agreement, any instrument affecting real property, or any instrument that requires a thumbprint.",
    exampleTitle: "Example: a power of attorney",
    example: "The signer is in the hospital and a coworker offers to act as subscribing witness on a power of attorney. The statute does not allow that method for a power of attorney. The signer has to appear, or the act does not happen.",
    sourceLabel: "Civil Code section 1195",
    sourceUrl: civ("1195"),
  },
  {
    id: "copy-cert",
    title: "Copy certification",
    summary: "California notaries do not have a general power to certify copies. The power of attorney copy is the narrow statutory exception.",
    rule: "A notary may certify a copy of a power of attorney under Probate Code section 4307 and Government Code section 8211(e). The fee for that certification is $15. The notary compares the copy with the original.",
    exception: "A request to “certify this passport” or “certify this college diploma” is not that exception. Those copy certifications are not a general notarial act in California.",
    exampleTitle: "Example: a diploma",
    example: "A signer asks for a certified copy of a diploma to mail to an employer. The power-of-attorney statute does not cover a diploma. The notary declines the copy certification.",
    sourceLabel: "Probate Code section 4307 and Government Code section 8211",
    sourceUrl: "https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=PROB&sectionNum=4307.",
  },
  {
    id: "electronic-ron",
    title: "Electronic and remote notarization",
    summary: "In-person electronic notarization is not the same thing as remote online notarization. Remote performance is not open yet.",
    rule: "A notary may perform an electronic notarization in person when the rules for the paper act are met. Government Code section 27391(f) does not require the seal on an electronic real-estate document. The Online Notarization Act was signed on September 30, 2023, and is effective January 1, 2024, but it becomes operative in stages.",
    exception: "Appointment, discipline, and the duty to perform remote acts wait until the Secretary of State finishes Notary Automation Project 2.0 or January 1, 2030, whichever is earlier. Until then, a video image is not personal appearance. A vendor’s claim that a platform is approved does not make a remote act operative. Sections 8232 through 8232.4 and Civil Code sections 1182 and 1183 have earlier operative dates, and the security rules in section 8231.18 are operative, but those dates do not authorize remote acts today.",
    exampleTitle: "Example: a video call",
    example: "A signer is in another county and asks to appear by video. The handbook rule is that a video image is not personal appearance until the remote provisions are operative. The notary does not complete the act.",
    sourceLabel: "Secretary of State handbook, remote notarization status",
    sourceUrl: pdf,
  },
  {
    id: "identification",
    title: "Identification",
    summary: "Satisfactory evidence is one of the methods in Civil Code section 1185. Personal knowledge of the signer is not one of them.",
    rule: "Section 1185 requires no reasonable doubt plus one of these: a listed identification document, one credible witness the notary personally knows, or two credible witnesses the notary does not know. A California driver license or identification card, a U.S. passport, a state-prison inmate card, and a local-detention sheriff inmate identification may be current or issued within five years. A foreign passport, another state’s or a Canadian or Mexican driver license, another state’s identification, a U.S. military identification, a California public-employee identification, and a tribal identification need a photograph, a physical description, a signature, and an identifying number.",
    exception: "A private badge or a birth certificate is not on that list. Knowing the signer from work does not replace the document or the witness methods.",
    exampleTitle: "Example: an expired California license",
    example: "The California driver license expired two years ago and was issued three years ago. It was issued within five years, so it can still be the listed document. A license issued six years ago cannot.",
    sourceLabel: "Civil Code section 1185",
    sourceUrl: civ("1185"),
  },
  {
    id: "credible-witness",
    title: "Credible witnesses",
    summary: "One witness is allowed only when the notary knows that witness. Two witnesses are the method when the notary knows neither.",
    rule: "One credible witness must be personally known to the notary, present paper identification, and swear to the five statutory points: the signer is the person named, the witness knows the signer, identification would be very difficult or impossible to obtain, the signer does not have an authorized identification, and the witness has no financial interest and is not named in the document. Two witnesses each present paper identification and take the same oath. The journal records one witness’s signature or identification details. For two witnesses, the journal records both signatures and the identification details.",
    exception: "A witness who is named in the document, or who has a financial interest, cannot serve. The notary does not skip the oath because the witness showed a driver license.",
    exampleTitle: "Example: two strangers",
    example: "The notary has never met either witness. One witness is not enough. Both must present paper identification and take the oath, and both signatures plus the identification details go in the journal.",
    sourceLabel: "Civil Code section 1185 and Government Code section 8206",
    sourceUrl: civ("1185"),
  },
  {
    id: "advertising-immigration",
    title: "Advertising and immigration limits",
    summary: "A notary who is not an attorney has a specific advertising notice, and cannot translate the title as notario.",
    rule: "Government Code section 8219.5 requires a non-attorney’s non-English written advertisement, other than a single desk plaque, to include this notice in English and in the other language: “I am not an attorney and, therefore, cannot give legal advice about immigration or any other legal matters.” The advertisement also states the statutory fees. The literal Spanish translation “notario” or “notario publico” is prohibited even when the notice is present. A first offense is suspension of at least one year or revocation. A second offense is permanent revocation. Section 8223 says a person who promotes immigration-specialist or consultant services shall not advertise as a notary.",
    exception: "There is no blanket ban on notarizing a signature on an immigration document. Completing immigration forms is limited to an attorney, a representative accredited by the U.S. Department of Justice, or a bonded immigration consultant under Business and Professions Code section 22440. A form-entry fee is at most $15 per individual per set unless the notary is an attorney rendering legal services. A section 8211 fee can be charged in addition when a notarial act is actually performed.",
    exampleTitle: "Example: the word notario",
    example: "A window sign says “notario publico” and also prints the non-attorney notice. The notice does not make that translation lawful. Section 8219.5 still prohibits it.",
    sourceLabel: "Government Code section 8219.5",
    sourceUrl: gov("8219.5"),
  },
  {
    id: "foreign-language",
    title: "Foreign-language documents",
    summary: "The notary may notarize a signature on a foreign-language document without reading the language, under narrow conditions.",
    rule: "The notary must be able to identify the type of document, or write “a document in a foreign language” in the journal. The document must not appear incomplete, and the notary must be able to communicate directly with the signer. The notary completes the California certificate in the notary’s own notarial wording.",
    exception: "The notary does not use an interpreter to communicate with the signer, does not translate the document, and does not explain its legal effect. If direct communication is not possible, the signer is referred to a notary who can communicate with them.",
    exampleTitle: "Example: a friend offers to interpret",
    example: "The signer speaks only a language the notary does not speak, and a friend offers to interpret the oath. The handbook does not allow the interpreter. The act waits for a notary who can communicate directly.",
    sourceLabel: "Secretary of State handbook, foreign-language documents",
    sourceUrl: pdf,
  },
  {
    id: "journal-thumbprint",
    title: "Journal and thumbprint",
    summary: "One active sequential journal stays in the notary’s exclusive control. Some documents also require a thumbprint.",
    rule: "Government Code section 8206 requires one active sequential journal, kept locked and under the notary’s exclusive control. The journal is the notary’s property and is not surrendered to an employer. A thumbprint is required for a deed, quitclaim, deed of trust, other real-property document, or power of attorney. Use the right thumb. If another finger is used, note which one. If no print is physically possible, note that reason.",
    exception: "A trustee’s deed resulting from foreclosure under Civil Code section 2924, and a deed of reconveyance, are excluded from the thumbprint requirement. A line-item copy for a member of the public is due within 15 business days, at no more than $0.30 a page, and the request must name the parties, the document type, and the month and year. A lost, stolen, or destroyed journal requires immediate notice to the Secretary of State by certified or registered mail or receipted delivery. A peace officer with reasonable suspicion receives the journal immediately, or as soon as possible if the notary is not present.",
    exampleTitle: "Example: the employer’s safe",
    example: "The employer wants the journal locked in the office safe over the weekend. Section 8206 keeps exclusive control with the notary. The employer’s safe is not a substitute for that control.",
    sourceLabel: "Government Code section 8206",
    sourceUrl: gov("8206"),
  },
  {
    id: "seal",
    title: "Seal",
    summary: "The seal is photographically reproducible, stays under exclusive control, and is destroyed when the commission ends.",
    rule: "Government Code section 8207 describes the seal. A rubber stamp is the usual form. An embosser may be used only in addition to that stamp. The title and the seal are used only for notarial acts. The notary keeps the seal under exclusive control. Willful loss of control or surrender of the seal is a misdemeanor under section 8228.1.",
    exception: "There is no grace period to keep using the seal after the commission ends. The notary destroys the seal at the end of the commission. A new county filing, when the notary chooses it, requires a seal with the new county within 30 days.",
    exampleTitle: "Example: the day after expiration",
    example: "The commission expired yesterday and a signer is waiting. The expired seal cannot be used while a renewal is processed. There is no grace period.",
    sourceLabel: "Government Code sections 8207 and 8228.1",
    sourceUrl: gov("8207"),
  },
  {
    id: "fees",
    title: "Fees",
    summary: "Section 8211 sets maximum fees. Charging less, or nothing, is allowed when the journal says so.",
    rule: "The maximum is $15 per signature for an acknowledgment or proof, including the seal and certificate, and $15 for an oath and jurat. A deposition is $30, plus $7 for the oath to the witness and $7 for the certificate. A power-of-attorney copy certification is $15. The journal records the fee, or “no fee” or “0” when no fee is charged. Travel fees are entered separately.",
    exception: "There is no fee for vote-by-mail materials, for specified veteran-benefit papers, or for nomination documents under Elections Code section 8080. A notary appointed for a military or naval reservation charges no fee under section 8203.6. A public-entity notary does not charge for pension papers under section 6106, and a public-agency notary’s fees are remitted to the agency under sections 6100 and 8202.5.",
    exampleTitle: "Example: a free acknowledgment",
    example: "A notary charges nothing for a neighbor’s acknowledgment. That is allowed. The journal line says “no fee” or “0”. It does not say the statutory maximum was charged.",
    sourceLabel: "Government Code section 8211",
    sourceUrl: gov("8211"),
  },
  {
    id: "misconduct",
    title: "Misconduct and penalties",
    summary: "The serious penalties attach to specific acts: a false certificate, destruction of notarial records, and loss of the seal.",
    rule: "Government Code section 8221 makes knowing destruction, defacement, or concealment of notarial papers a misdemeanor, and it also allows civil damages. The handbook states a civil penalty of up to $10,000 for a willfully false material statement in a certificate, in addition to criminal and administrative consequences. Willful surrender or loss of control of the seal is a misdemeanor under section 8228.1.",
    exception: "A late address notice is an infraction of up to $500 under section 8213.5, not the $10,000 certificate penalty. The penalty follows the conduct the statute names. A practice score on this site does not create or erase any of these duties.",
    exampleTitle: "Example: a backdated certificate",
    example: "The signer asks for yesterday’s date because the contract deadline passed. Dating the certificate on a day when the act did not occur is a false certificate statement. The civil penalty in the handbook can reach $10,000, separate from discipline.",
    sourceLabel: "Government Code section 8221 and the Secretary of State handbook",
    sourceUrl: gov("8221"),
  },
];

const chapterIds = new Set(caGuideChapters.map((chapter) => chapter.id));
for (const topic of caStudyTopics) {
  if (!chapterIds.has(topic.id)) throw new Error(`Missing California guide chapter ${topic.id}`);
}
