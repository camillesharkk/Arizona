import type { Difficulty, ExamArea, Question, TopicId } from "@/lib/types";
import { shuffle } from "../lib/answer-sequence.ts";

/** Checked 2026-11-08. Official blanks stay blank in the exam config, not here. */
export const PA_CHECKED = "2026-11-08";

export const paTopics = [
  { id: "eligibility", area: "obtaining" as const, label: "Who may be appointed" },
  { id: "education-exam", area: "obtaining" as const, label: "Education and the exam" },
  { id: "bond-oath", area: "obtaining" as const, label: "Bond, oath, and recording" },
  { id: "identity", area: "performing" as const, label: "Identity and appearance" },
  { id: "acts", area: "performing" as const, label: "Notarial acts" },
  { id: "journal", area: "performing" as const, label: "Journal" },
  { id: "fees", area: "performing" as const, label: "Fees and receipts" },
  { id: "remote", area: "performing" as const, label: "Electronic and remote notarization" },
  { id: "stamp", area: "compliance" as const, label: "Stamp and custody" },
  { id: "prohibited", area: "compliance" as const, label: "Prohibited acts and changes" },
];

type Row = {
  id: string;
  area: ExamArea;
  study: string;
  topic: TopicId;
  difficulty: Difficulty;
  free: boolean;
  text: string;
  options: [string, string, string, string];
  correct: 0 | 1 | 2 | 3;
  why: string;
  miss: [string, string, string, string];
  source: string;
};

const SRC = {
  exam: "Pearson VUE Pennsylvania Notary Examination Candidate Information Bulletin, March 2026, rev. 05/2026, checked 2026-11-08",
  dosExam: "Pennsylvania Department of State, Examination Requirement page, checked 2026-11-08",
  bond: "Pennsylvania Department of State, Bonding Requirement page, and 4 Pa. Code § 167.16, checked 2026-11-08",
  regs: "Pennsylvania Department of State, Notary Regulations Changes, effective March 28, 2026, checked 2026-11-08",
  fees: "Pennsylvania Department of State, Notary Public Fees page, checked 2026-11-08",
  rulona: "57 Pa.C.S. Chapter 3, Department of State PDF revised through November 2022, read 2026-11-08",
};

const rows: Row[] = [
  {
    id: "pa-001", area: "obtaining", study: "eligibility", topic: "commission", difficulty: "easy", free: true,
    text: "A 17-year-old Pennsylvania resident wants a notary commission. The application is otherwise complete. What does 57 Pa.C.S. § 321(a) require?",
    options: ["The Department may appoint a 17-year-old who has finished high school", "The applicant must be at least 18", "Age does not matter if the applicant can read and write English", "A parent may sign the application in place of the age requirement"],
    correct: 1,
    why: "Section 321(a)(1) requires an applicant to be at least 18. Education and English ability are separate requirements and do not replace age.",
    miss: ["A diploma does not lower the age in § 321(a)(1).", "Correct. The applicant must be at least 18.", "Reading and writing English is an additional requirement, not a substitute for age.", "The statute does not let a parent satisfy the age requirement."],
    source: SRC.rulona,
  },
  {
    id: "pa-002", area: "obtaining", study: "eligibility", topic: "commission", difficulty: "medium", free: true,
    text: "An applicant lives in Ohio and has no home, job, or practice in Pennsylvania. May that person be appointed a Pennsylvania notary under § 321(a)?",
    options: ["Yes, any United States resident may be appointed", "Yes, if the person owns land in Pennsylvania", "No. The applicant must live in Pennsylvania or have a place of employment or practice in the Commonwealth", "Yes, after the person passes the exam online from Ohio"],
    correct: 2,
    why: "Section 321(a)(3) requires Pennsylvania residence or a place of employment or practice in the Commonwealth. Passing an exam does not create that connection.",
    miss: ["Citizenship or permanent residence is a separate requirement and is not enough by itself.", "Owning land is not the statutory connection.", "Correct. Residence or a Pennsylvania place of employment or practice is required.", "The exam is only one of the eligibility items."],
    source: SRC.rulona,
  },
  {
    id: "pa-003", area: "obtaining", study: "eligibility", topic: "commission", difficulty: "medium", free: false,
    text: "A permanent legal resident of the United States lives and works in Pennsylvania and can read and write English. A coworker says only United States citizens may be notaries. Which statement matches § 321(a)(2)?",
    options: ["Only citizens may be appointed", "A citizen or a permanent legal resident may meet that requirement", "Any visa holder qualifies", "The statute has no citizenship or immigration rule"],
    correct: 1,
    why: "Section 321(a)(2) allows a citizen or a permanent legal resident. It does not open the office to every immigration status, and it does not limit the office to citizens only.",
    miss: ["Citizens qualify, but they are not the only group named.", "Correct. A citizen or a permanent legal resident can meet § 321(a)(2).", "The statute does not say every visa category qualifies.", "The statute does state this requirement."],
    source: SRC.rulona,
  },
  {
    id: "pa-004", area: "obtaining", study: "education-exam", topic: "commission", difficulty: "medium", free: true,
    text: "Someone whose Pennsylvania commission expired yesterday applies today. Does that person have to pass the examination?",
    options: ["No. A prior commission waives the exam forever", "No, if the lapse is less than 30 days", "Yes. The Department requires the exam when no current, unexpired commission is in hand on the day the application is received", "Only if the person never took the three-hour course"],
    correct: 2,
    why: "The Department of State says the exam applies to first applicants and to anyone whose commission has lapsed, even by one day, when the application arrives.",
    miss: ["A prior commission does not permanently waive the exam.", "The Department's page does not create a 30-day grace period.", "Correct. A lapse of one day puts the applicant in the examination group.", "The course and the exam are separate requirements."],
    source: SRC.dosExam,
  },
  {
    id: "pa-005", area: "obtaining", study: "education-exam", topic: "commission", difficulty: "medium", free: true,
    text: "A notary still holds a current, unexpired Pennsylvania commission and applies for the next term before it ends. Which testing rule applies?",
    options: ["Another exam is required for every reappointment", "The examination requirement is for applicants who do not hold a current, unexpired commission when the application is received", "The exam is waived only for attorneys", "The person must take the exam but not the education course"],
    correct: 1,
    why: "Both the Department page and the March 2026 bulletin tie the exam to applicants who do not hold a current, unexpired commission. Reappointment still requires the approved education course.",
    miss: ["A current commission holder is not in the examination group described by the Department.", "Correct. The exam rule is aimed at applicants without a current, unexpired commission.", "The Department's examination page does not state an attorney exemption.", "Education is still required for reappointment."],
    source: SRC.dosExam,
  },
  {
    id: "pa-006", area: "obtaining", study: "education-exam", topic: "commission", difficulty: "easy", free: false,
    text: "How long is the approved notary education that must be completed in the six months before an application?",
    options: ["One hour", "Three hours", "Six hours", "No education is required after 2017"],
    correct: 1,
    why: "Section 322 requires at least three hours of approved education in the six months before the application, for both the basic course and renewal continuing education.",
    miss: ["The statute says at least three hours, not one.", "Correct. The course is at least three hours.", "Six hours is not the Pennsylvania figure in § 322.", "The old exemption for notaries commissioned on July 1, 2003 was removed. Education remains required."],
    source: SRC.rulona,
  },
  {
    id: "pa-007", area: "obtaining", study: "education-exam", topic: "commission", difficulty: "hard", free: false,
    text: "A practice site gives a user a score of 24 out of 30. Can that user treat 24 as the official passing score?",
    options: ["Yes. 80 percent is the official pass mark", "Yes. The bulletin says 24 correct answers pass", "No. The official passing result is a scaled score of 75, and that scale is not the number or percent correct", "Yes, but only on the five pretest questions"],
    correct: 2,
    why: "The March 2026 bulletin says the reported scaled score is neither the number nor the percentage answered correctly, and the passing scaled score is 75.",
    miss: ["A raw percent is not the scale described in the bulletin.", "The bulletin does not publish a raw number that passes.", "Correct. A site score is practice feedback, not the official scaled result.", "Pretest items are not identified and do not themselves create a passing rule."],
    source: SRC.exam,
  },
  {
    id: "pa-008", area: "obtaining", study: "education-exam", topic: "commission", difficulty: "medium", free: false,
    text: "The March 2026 bulletin describes the official exam. Which description matches that bulletin?",
    options: ["45 questions in 90 minutes, all scored", "30 multiple-choice items, 25 scored and 5 unidentified pretest items, with 60 minutes", "40 questions and a 70 percent raw score", "An open-book essay with no time limit"],
    correct: 1,
    why: "The bulletin's exam table says 30 total items, 25 scored, 5 pretest, 60 minutes. It also says the official item has a question and three answer options.",
    miss: ["Those figures are not in the Pennsylvania bulletin.", "Correct. The bulletin states 30 items, 25 scored, 5 pretest, and 60 minutes.", "The bulletin does not use a 40-question, 70 percent raw rule.", "The bulletin describes a closed, timed, multiple-choice exam."],
    source: SRC.exam,
  },
  {
    id: "pa-009", area: "obtaining", study: "bond-oath", topic: "commission", difficulty: "medium", free: true,
    text: "A person is newly appointed on April 2, 2026. Which bond amount applies?",
    options: ["$10,000, because the statute still lists only that amount", "$25,000. New appointments on or after March 28, 2026 use the bond set in 4 Pa. Code § 167.16", "No bond is required after the regulations", "$15,000, the amount used by another state"],
    correct: 1,
    why: "The statute allows $10,000 or the amount set by regulation. The regulation effective March 28, 2026 sets $25,000 for applicants, with a transition only for someone who already held a commission on that date.",
    miss: ["The statute also allows the amount set by regulation, and the regulation now sets $25,000.", "Correct. A new appointment on or after March 28, 2026 needs the $25,000 bond.", "The regulations raised the bond. They did not remove it.", "Pennsylvania's current rule is not another state's bond amount."],
    source: SRC.bond,
  },
  {
    id: "pa-010", area: "obtaining", study: "bond-oath", topic: "commission", difficulty: "hard", free: false,
    text: "A notary's commission was already in force on March 28, 2026 and does not expire until 2027. What may that notary do about the bond?",
    options: ["The commission ended on March 28, 2026 unless a $25,000 bond was filed that day", "The notary may keep the existing bond until that commission expires", "The notary must buy a second $25,000 bond and keep both", "The bond requirement no longer applies to current notaries"],
    correct: 1,
    why: "4 Pa. Code § 167.16(c) and the Department's regulation summary let a notary who held a commission on March 28, 2026 continue the existing bond until that commission expires.",
    miss: ["The transition rule keeps the current commission in place.", "Correct. The existing bond may continue until that commission expires.", "The rule does not require two bonds.", "Current notaries are not removed from the bond requirement. The amount changes at the next appointment."],
    source: SRC.bond,
  },
  {
    id: "pa-011", area: "obtaining", study: "bond-oath", topic: "commission", difficulty: "medium", free: false,
    text: "An appointee waits 46 days to record the bond, oath, and commission. What does § 321(f) say happens?",
    options: ["The commission remains valid and the recorder may accept a late filing", "The commission is null and void if the signature registration or the recording steps are missed", "Only the bond fee is doubled", "The notary may notarize during the delay and record the papers later"],
    correct: 1,
    why: "Section 321(f)(1) says the commission is null and void if the notary fails to comply with the signature or recording subsections. Those steps are due within 45 days, before the notary begins the duties.",
    miss: ["The statute does not grant a late-filing cure in this sentence.", "Correct. Missing those steps makes the commission null and void.", "The stated consequence is that the commission does not take effect, not a doubled fee.", "The recording must happen before the notary enters on the duties."],
    source: SRC.rulona,
  },
  {
    id: "pa-012", area: "performing", study: "identity", topic: "identification", difficulty: "easy", free: true,
    text: "A deed signer is in another state and wants a Pennsylvania notary to take the acknowledgment by telephone, with no audio-visual session. Does § 306 allow that?",
    options: ["Yes. A phone call is a personal appearance", "Yes, if the notary recognizes the voice", "No. For a signature on a record, the individual must appear personally. A remote act uses communication technology that provides simultaneous sight and sound", "Yes, if the signed deed is mailed overnight"],
    correct: 2,
    why: "Section 306 requires personal appearance for a signature on a record. Section 306.1 allows a remotely located individual to satisfy that requirement only through communication technology, which the statute defines as simultaneous sight and sound.",
    miss: ["A telephone call does not meet the sight-and-sound definition.", "Recognizing a voice is not the appearance rule.", "Correct. Personal appearance is required, and a remote session needs simultaneous sight and sound.", "Mailing a signed document does not create an appearance."],
    source: SRC.rulona,
  },
  {
    id: "pa-013", area: "performing", study: "identity", topic: "identification", difficulty: "medium", free: true,
    text: "A signer presents a driver's license that expired last week. The notary has never met the signer. Is that license satisfactory evidence under § 307(b)(1)(i)?",
    options: ["Yes. Any driver's license is enough", "No. A passport, driver's license, or government nondriver card used under that paragraph must be current and unexpired", "Yes, during a 30-day renewal grace period", "Yes, if the signer also shows a Social Security card from 20 years ago"],
    correct: 1,
    why: "Section 307(b)(1)(i) lists a passport, driver's license, or government-issued nondriver identification card that is current and unexpired.",
    miss: ["The statute adds current and unexpired.", "Correct. An expired license does not meet that paragraph.", "Section 307 does not adopt a grace period.", "An additional old card does not revive an expired license under that paragraph."],
    source: SRC.rulona,
  },
  {
    id: "pa-014", area: "performing", study: "identity", topic: "identification", difficulty: "medium", free: false,
    text: "The signer has no acceptable identification. A coworker who is personally known to the notary is standing at the desk and is willing to make a verification on oath. Can that identify the signer under § 307(b)(2)?",
    options: ["No. Pennsylvania never allows a witness", "Yes, if that credible witness appears personally and is personally known to the notary", "Yes, if the witness sends a text message", "Yes, but only when the signer is outside the United States"],
    correct: 1,
    why: "Section 307(b)(2) allows a verification on oath or affirmation of a credible witness who personally appears and is personally known to the notarial officer.",
    miss: ["The statute does provide this method.", "Correct. A personally appearing, personally known credible witness may supply the verification.", "A text message is not a personal appearance and oath before the notary.", "This method is not limited to signers outside the United States."],
    source: SRC.rulona,
  },
  {
    id: "pa-015", area: "performing", study: "acts", topic: "acknowledgments", difficulty: "medium", free: true,
    text: "A customer asks for an acknowledgment. The signature is already on the deed, and the customer is at the desk. What must the notary determine under § 305(a)?",
    options: ["Only that the document looks complete", "That the person appearing is the person claimed and that the signature is that person's", "That the notary watched the original signing, even if it happened last month", "That a lawyer drafted the deed"],
    correct: 1,
    why: "For an acknowledgment, § 305(a) requires identity and that the signature on the record is the signature of the individual. It does not require the notary to have watched an earlier signing, and it does not require the notary to review legal drafting.",
    miss: ["Completeness alone does not satisfy § 305(a).", "Correct. The notary determines identity and that the signature is the signer's.", "An acknowledgment does not, by this subsection, require the notary to have watched the earlier signing.", "Legal drafting is outside the notary's authority."],
    source: SRC.rulona,
  },
  {
    id: "pa-016", area: "performing", study: "acts", topic: "jurats", difficulty: "medium", free: true,
    text: "A customer wants a verification on oath. The statement is already signed, and the customer will not take an oath or affirmation in front of the notary. What should the notary do?",
    options: ["Complete the verification because the signature matches", "Refuse. A verification requires the individual to appear and make the verification, and the notary must determine identity and that the signature is the signer's", "Change the certificate to an acknowledgment without telling the customer", "Let the customer take the oath by email later"],
    correct: 1,
    why: "Section 305(b) applies when the notary takes a verification of a statement on oath or affirmation. If the customer will not make that verification before the notary, the act requested has not been performed. Section 308 also allows refusal when the notary is not satisfied the signature is knowingly and voluntarily made.",
    miss: ["A matching signature does not replace the oath or affirmation.", "Correct. The notary should not complete a verification the customer will not make.", "Changing the act would not be the act the customer requested.", "A later email is not the appearance and verification in § 305(b)."],
    source: SRC.rulona,
  },
  {
    id: "pa-017", area: "performing", study: "acts", topic: "copy-certification", difficulty: "medium", free: false,
    text: "A customer asks the notary to certify a copy of a birth certificate. The March 28, 2026 regulation summary says certified copies are not allowed for which of these?",
    options: ["A lease", "A birth certificate", "A diploma", "A power of attorney"],
    correct: 1,
    why: "The Department's regulation summary lists vital records, including birth and death certificates, among records for which a notary may not issue a certified copy. Leases, diplomas, and powers of attorney are on the allowed examples.",
    miss: ["A lease is on the Department's list of records a notary may certify.", "Correct. A birth certificate is a vital record on the do-not-certify list.", "A diploma is on the allowed examples.", "A power of attorney is on the allowed examples."],
    source: SRC.regs,
  },
  {
    id: "pa-018", area: "performing", study: "acts", topic: "copy-certification", difficulty: "easy", free: false,
    text: "Before certifying a copy of a contract, what does § 305(d) require the notary to determine?",
    options: ["That the contract is legally enforceable", "That the copy is a complete and accurate transcription or reproduction", "That every party has been paid", "That the contract was signed in Pennsylvania"],
    correct: 1,
    why: "Section 305(d) requires the notary who certifies a copy to determine that the copy is a complete and accurate transcription or reproduction. It does not ask the notary to decide enforceability or payment.",
    miss: ["Enforceability is legal advice.", "Correct. The copy must be a complete and accurate reproduction.", "Payment is not the copy-certification determination.", "Place of signing is not the test in § 305(d)."],
    source: SRC.rulona,
  },
  {
    id: "pa-019", area: "performing", study: "journal", topic: "journals", difficulty: "easy", free: true,
    text: "A Pennsylvania notary performs acknowledgments every day. What does § 319(a) require?",
    options: ["A journal only for real-estate deeds", "A journal of all notarial acts, in chronological order", "No journal if the notary works for a law firm", "A journal only for remote notarization"],
    correct: 1,
    why: "Section 319(a) requires a journal in which the notary records, in chronological order, all notarial acts the notary performs.",
    miss: ["The duty is not limited to deeds.", "Correct. All notarial acts go in the journal, in chronological order.", "Employment does not remove the duty.", "Remote acts are included because the duty covers all notarial acts, not only remote ones."],
    source: SRC.rulona,
  },
  {
    id: "pa-020", area: "performing", study: "journal", topic: "journals", difficulty: "medium", free: true,
    text: "An employer bought the paper journal and says it must stay with the office when the notary resigns. What does § 319(h) say?",
    options: ["The employer owns the journal because the employer paid for it", "The journal is the exclusive property of the notary and may not be surrendered to the employer when employment ends", "The journal is filed with the Department of State on the last day of work", "The notary and employer co-own every entry"],
    correct: 1,
    why: "Section 319(h) says the journal is the exclusive property of the notary and may not be surrendered to an employer when employment ends.",
    miss: ["Payment by the employer does not transfer ownership under this subsection.", "Correct. The journal stays the notary's property.", "Resignation delivery of the journal is to the recorder of deeds, not a same-day Department filing of the book.", "The statute does not create co-ownership."],
    source: SRC.rulona,
  },
  {
    id: "pa-021", area: "performing", study: "journal", topic: "journals", difficulty: "medium", free: false,
    text: "Which item belongs in each journal entry under § 319(c)?",
    options: ["The signer's full Social Security number", "The date and time, a description of the record and act, the full name and address, how identity was determined, and the fee charged", "Only the document title", "A copy of the birth certificate"],
    correct: 1,
    why: "Section 319(c) lists date and time, description and type of act, full name and address, the identity method, and the fee. The 2026 regulations say the journal may not contain a Social Security number or other listed personal identifiers.",
    miss: ["A Social Security number is the kind of identifier the 2026 regulations exclude.", "Correct. Those are the entry items in § 319(c).", "The description is only one of the required items.", "A birth-certificate copy is not a journal entry item."],
    source: SRC.rulona,
  },
  {
    id: "pa-022", area: "performing", study: "journal", topic: "journals", difficulty: "hard", free: false,
    text: "The notary's commission expires and the notary does not apply for another commission. Where, and how soon, must the journal be delivered?",
    options: ["To the employer within 10 days", "To the recorder of deeds in the county of the notary's last office, within 30 days", "To the Pennsylvania Supreme Court within 45 days", "Nowhere. The notary destroys the journal"],
    correct: 1,
    why: "Section 319(e) requires delivery to the recorder of deeds in the county where the notary last maintained an office, within 30 days of expiration, unless the notary applies for a commission within that period.",
    miss: ["The employer is not the recipient.", "Correct. Delivery is to that recorder of deeds within 30 days.", "The Supreme Court is not the office named in § 319(e).", "The statute requires delivery, not destruction, in this situation."],
    source: SRC.rulona,
  },
  {
    id: "pa-023", area: "performing", study: "fees", topic: "seals-fees", difficulty: "easy", free: true,
    text: "Two people are named in one acknowledgment certificate. Using the Department's current fee page, what is the maximum notary fee for that acknowledgment?",
    options: ["$5 total, no matter how many names", "$5 for the first name and $2 for the additional name", "$15 for each name", "$5 for each name"],
    correct: 1,
    why: "The Department's fee page lists $5 for the first individual making the acknowledgment in the certificate and $2 for each additional name in the same certificate.",
    miss: ["The second name has its own maximum.", "Correct. The maximum is $5 plus $2 for the additional name.", "Fifteen dollars is not the Pennsylvania acknowledgment maximum on that page.", "The additional name is $2, not another $5."],
    source: SRC.fees,
  },
  {
    id: "pa-024", area: "performing", study: "fees", topic: "seals-fees", difficulty: "medium", free: true,
    text: "A notary charges the $5 acknowledgment maximum and also $20 for travel. The customer was told about the travel charge before the notarization. How should the receipt treat the travel charge?",
    options: ["Travel must be hidden inside the $5", "Travel is forbidden", "Clerical or administrative charges such as travel are not set by the Department, must be customary and reasonable, and must be itemized separately from the notary fee", "Travel may be charged only for remote notarization"],
    correct: 2,
    why: "The Department's fee page says clerical and administrative fees, including travel, are not the regulated notary-act fees. They must be customary and reasonable, disclosed beforehand, and itemized on the receipt and in the journal.",
    miss: ["The page requires the charges to be stated separately.", "The page allows a customary travel charge. It does not ban it.", "Correct. The travel charge is itemized apart from the notarial fee.", "The travel discussion is not limited to remote notarization."],
    source: SRC.fees,
  },
  {
    id: "pa-025", area: "performing", study: "fees", topic: "seals-fees", difficulty: "medium", free: false,
    text: "An employer tells the notary that every notary fee belongs to the company. The notary never agreed to that. What does § 329.1(d) say?",
    options: ["The fee is always the employer's property", "The notary fee is presumed to be the notary's property and does not belong to the employer unless they agree", "The fee is split equally by statute", "The fee must be sent to the Department"],
    correct: 1,
    why: "Section 329.1(d) says the fee is the property of the notary and, unless the notary and employer agree, does not belong to the employer.",
    miss: ["The presumption runs the other way.", "Correct. Without an agreement, the fee is the notary's.", "The statute does not impose an equal split.", "The fee is not paid to the Department."],
    source: SRC.rulona,
  },
  {
    id: "pa-026", area: "performing", study: "fees", topic: "seals-fees", difficulty: "easy", free: false,
    text: "A notary wants to notarize a neighbor's acknowledgment for no charge. May the notary waive the fee?",
    options: ["No. The posted fee must be collected", "Yes. A notary may waive the fee", "Only if the Department approves the waiver in advance", "Only when the signer is a relative"],
    correct: 1,
    why: "Section 329.1(c)(2) says a notary may waive the right to charge a fee. The Department's fee page repeats that point.",
    miss: ["The statute allows a waiver.", "Correct. The fee may be waived.", "No advance Department approval is stated for a waiver.", "The waiver is not limited to relatives."],
    source: SRC.fees,
  },
  {
    id: "pa-027", area: "performing", study: "remote", topic: "electronic-ron", difficulty: "medium", free: true,
    text: "A Pennsylvania notary is physically in Ohio during a video session with a signer in Pennsylvania. May that notary perform the remote act under § 306.1(b)?",
    options: ["Yes, if both people can see and hear each other", "No. The notary public using that section must be located in this Commonwealth", "Yes, because the signer is in Pennsylvania", "Yes, if the notary's commission county is in Pennsylvania"],
    correct: 1,
    why: "Section 306.1(b) authorizes a notary public located in this Commonwealth to perform the remote act. The notary's physical location during the act is part of the rule.",
    miss: ["Sight and sound are necessary and are not the only condition.", "Correct. The notary must be located in Pennsylvania.", "The signer's location does not move the notary into the Commonwealth.", "The commission county does not replace the notary's location at the time of the act."],
    source: SRC.rulona,
  },
  {
    id: "pa-028", area: "performing", study: "remote", topic: "electronic-ron", difficulty: "medium", free: false,
    text: "A remote notarization is allowed. What must the certificate indicate under § 306.1(c)?",
    options: ["Nothing beyond an ordinary in-person certificate", "That the notarial act was performed by means of communication technology", "The brand of the notary's laptop", "That the signer was outside the United States, even when the signer was in Pennsylvania"],
    correct: 1,
    why: "Section 306.1(c) requires the certificate to indicate that the act was performed by means of communication technology. A sufficient short form includes the statement that the act involved communication technology.",
    miss: ["An ordinary in-person certificate omits the required statement.", "Correct. The certificate must show that communication technology was used.", "The laptop brand is not the statutory statement.", "The outside-the-United-States findings apply only when the signer is outside the United States."],
    source: SRC.rulona,
  },
  {
    id: "pa-029", area: "performing", study: "remote", topic: "electronic-ron", difficulty: "hard", free: false,
    text: "How long must the audio-visual recording of a remote notarial act be retained under § 306.1(e), unless a regulation sets another period?",
    options: ["One year", "Four years, matching the commission term", "At least 10 years after the recording is created", "Until the signer asks for it to be deleted"],
    correct: 2,
    why: "Section 306.1(e)(2) says the recording is retained for at least 10 years after it is created, or as otherwise required by the regulations adopted under subsection (g)(4).",
    miss: ["One year is not the statutory period.", "The commission term is not the recording period.", "Correct. The statute states at least 10 years unless a regulation sets another period.", "The signer's request does not replace the retention rule."],
    source: SRC.rulona,
  },
  {
    id: "pa-030", area: "performing", study: "remote", topic: "electronic-ron", difficulty: "medium", free: false,
    text: "Before the first notarial act on an electronic record, what does § 320(b) require?",
    options: ["Nothing. Any technology may be used without notice", "Notify the Department that the notary will perform electronic acts and identify each technology the notary intends to use", "Ask the signer's employer to approve the technology", "File the technology contract with the recorder of deeds"],
    correct: 1,
    why: "Section 320(b)(1) requires notice to the Department, and identification of each technology, before the first electronic act. If the Department has approval standards, the technology must meet them.",
    miss: ["The section requires notice.", "Correct. The Department must be notified and the technologies identified.", "The signer's employer is not the approving office in this section.", "The filing described here is with the Department, not the recorder."],
    source: SRC.rulona,
  },
  {
    id: "pa-031", area: "performing", study: "acts", topic: "prohibited-acts", difficulty: "medium", free: true,
    text: "The signer is nervous, does not understand the document, and says a relative is forcing the signature. The notary is not satisfied the signature is voluntary. May the notary refuse?",
    options: ["No. A commissioned notary must notarize every document presented", "Yes. Section 308 allows refusal when the notary is not satisfied the signature is knowingly and voluntarily made", "No, unless the document is a deed", "Yes, but only after collecting the fee"],
    correct: 1,
    why: "Section 308(a)(2) allows refusal when the notary is not satisfied the signature is knowingly and voluntarily made. A commission is not a duty to notarize every request.",
    miss: ["The statute gives a specific authority to refuse.", "Correct. Lack of a knowing and voluntary signature is a ground to refuse.", "The refusal authority is not limited to deeds.", "Collecting a fee does not cure an involuntary signature."],
    source: SRC.rulona,
  },
  {
    id: "pa-032", area: "performing", study: "acts", topic: "acknowledgments", difficulty: "hard", free: false,
    text: "The notary owns half of the private company that is buying the property, and the deed personally increases that ownership. May the notary acknowledge the seller's signature?",
    options: ["Yes. An officer of a company may always notarize the company's deal", "No. Section 304(b) bars an act on a record in which the notary has a direct or pecuniary interest. Personal benefit from the transaction is not one of the exceptions", "Yes, if the notary discloses the interest in the journal", "Yes, if another employee watches"],
    correct: 1,
    why: "Section 304(b)(1) prohibits the act when the notary or the notary's spouse has a direct or pecuniary interest. Being an officer or employee is not itself an interest, unless that person personally benefits from the transaction other than by a non-contingent fee.",
    miss: ["The company-officer exception stops where the person personally benefits.", "Correct. This personal benefit is a disqualifying interest.", "A journal note does not remove the prohibition.", "Another employee's presence does not remove the notary's interest."],
    source: SRC.rulona,
  },
  {
    id: "pa-033", area: "compliance", study: "stamp", topic: "seals-fees", difficulty: "easy", free: true,
    text: "A notary appointed after March 28, 2026 is ordering a stamp. Which item did the new regulations add to the stamp?",
    options: ["A photograph of the notary", "The seven-digit commission identification number", "The notary's home street address", "The bond company's name"],
    correct: 1,
    why: "The Department's March 28, 2026 summary says the seven-digit commission number is now required on the official stamp, after the Commonwealth, Notary Seal, name, county, and expiration lines.",
    miss: ["A photograph is not a stamp element.", "Correct. The commission number is the added element.", "The home street address is not part of the stamp lines.", "The bond company is not part of the stamp lines."],
    source: SRC.regs,
  },
  {
    id: "pa-034", area: "compliance", study: "stamp", topic: "seals-fees", difficulty: "medium", free: false,
    text: "The notary's commission is revoked. What happens to the stamping device under § 318(a)(2.1)?",
    options: ["The notary destroys it at home and keeps the pieces", "The notary gives it to the employer", "The individual surrenders possession of the stamping device to the Department", "The device stays valid until the printed expiration date"],
    correct: 2,
    why: "Section 318(a)(2.1) says an individual whose commission has been suspended or revoked shall surrender possession of the stamping device to the Department.",
    miss: ["Home destruction is the rule for resignation or for the date on the device, not for revocation.", "The employer does not receive the device.", "Correct. Revocation requires surrender to the Department.", "A revoked commission does not leave the device in service."],
    source: SRC.rulona,
  },
  {
    id: "pa-035", area: "compliance", study: "stamp", topic: "seals-fees", difficulty: "medium", free: false,
    text: "The stamping device is stolen. What does § 318(b) require?",
    options: ["Wait until the next renewal to mention it", "Notify the Department promptly after discovering the loss or theft", "Post a notice in a newspaper and do nothing else", "Order a replacement and keep using the old number quietly"],
    correct: 1,
    why: "Section 318(b) requires the notary, or the personal representative or guardian, to notify the Department promptly upon discovering that the device is lost or stolen.",
    miss: ["Renewal is not the deadline.", "Correct. The Department is notified promptly.", "A newspaper notice is not the statutory notice.", "Quiet replacement does not satisfy the notice duty."],
    source: SRC.rulona,
  },
  {
    id: "pa-036", area: "compliance", study: "prohibited", topic: "prohibited-acts", difficulty: "easy", free: true,
    text: "A nonlawyer notary wants the website headline to say “notario publico” and to offer immigration advice. What does § 325 say?",
    options: ["Both are allowed if the notary adds a disclaimer in English only", "A nonlawyer notary may not use “notario” or “notario publico,” and a commission does not authorize immigration consulting or legal advice", "The title is allowed because it is a translation", "Immigration advice is allowed when the fee is under $5"],
    correct: 1,
    why: "Section 325(a) says a commission does not authorize drafting, legal advice, or immigration consulting. Section 325(c) bars “notario” and “notario publico” except for an attorney at law.",
    miss: ["An English-only disclaimer does not authorize the prohibited title or the legal work.", "Correct. The title and the immigration advice are both outside a nonlawyer notary's authority.", "The statute treats that translation as prohibited for a nonlawyer.", "A small fee does not create the authority."],
    source: SRC.rulona,
  },
  {
    id: "pa-037", area: "compliance", study: "prohibited", topic: "commission", difficulty: "medium", free: true,
    text: "A notary moves and changes the office address. How soon do the March 28, 2026 regulations say the Department must be notified?",
    options: ["Within 30 days", "Within 45 days", "At the next renewal only", "Notice is optional if the county stays the same"],
    correct: 0,
    why: "The Department's regulation summary requires notice within 30 days of a change in information on file, including office address and phone number.",
    miss: ["Correct. The summary states 30 days.", "Forty-five days is the recording window for a new appointment, not this notice.", "Renewal is not the only time the change is reported.", "The summary lists the office address even when the rest of the commission information is unchanged."],
    source: SRC.regs,
  },
  {
    id: "pa-038", area: "compliance", study: "prohibited", topic: "seals-fees", difficulty: "medium", free: false,
    text: "The application fee on the Department form is $42. The Pearson VUE bulletin lists a separate exam fee. What is that exam fee?",
    options: ["$42, because one payment covers both", "$65, paid through Pearson VUE", "$15", "$100"],
    correct: 1,
    why: "Section 321(b)(2) sets the nonrefundable Department application fee at $42. The March 2026 bulletin lists the examination fee as $65.",
    miss: ["The application fee and the exam fee are different charges.", "Correct. The bulletin lists $65 for the exam.", "Fifteen dollars is not the Pennsylvania exam fee in the bulletin.", "One hundred dollars is not the fee in the bulletin."],
    source: SRC.exam,
  },
  {
    id: "pa-039", area: "performing", study: "journal", topic: "journals", difficulty: "medium", free: false,
    text: "A person asks to look at the journal. The request is spoken, not written. What do the March 28, 2026 regulations say?",
    options: ["Inspection requires a court order", "The notary must permit inspection, the request may be oral or written, and the inspection happens in the notary's presence", "The notary may mail the original journal to the requester", "Only an employer may inspect the journal"],
    correct: 1,
    why: "The Department's summary says any person may request inspection, the request may be oral or written, and the inspection occurs in the notary's presence.",
    miss: ["A court order is not the requirement in that summary.", "Correct. An oral request is enough, and the notary stays with the journal.", "The summary does not say to mail the original book.", "Inspection is not limited to an employer."],
    source: SRC.regs,
  },
  {
    id: "pa-040", area: "performing", study: "acts", topic: "copy-certification", difficulty: "hard", free: false,
    text: "A customer brings a record written in a language the notary does not read and asks the notary to notarize the customer's signature on it. A translator is present. Which statement matches the March 28, 2026 summary?",
    options: ["The notary may never notarize a record the notary cannot read", "The notary may notarize a translation only when the translator makes a verification on oath that the translation is accurate and complete, the translation and verification are attached, and the notarial certificate is in English", "The notary may leave the certificate only in the foreign language", "The translator may sign the notarial certificate"],
    correct: 1,
    why: "The regulation summary allows a notary to notarize a translation the notary does not understand only with the translator's sworn verification of accuracy and completeness, attached to the record. The notarial certificate must be in English.",
    miss: ["The summary does not use an absolute ban once the translation conditions are met.", "Correct. Those attachment and English-certificate conditions are the stated rule.", "The certificate must be in English. Another language may appear beside it only when the notary can read and write that language.", "The translator does not become the notary."],
    source: SRC.regs,
  },
];

const letters = ["A", "B", "C", "D"] as const;

function publish(row: Row): Question {
  const wrong = [0, 1, 2, 3].filter((index) => index !== row.correct).slice(0, 2);
  const order = [row.correct, ...wrong];
  const options = order.map((index) => row.options[index]);
  const reasons = order.map((index) => row.miss[index]);
  const correct = "A" as const;
  return {
    question_id: row.id,
    state: "PA",
    exam_area: row.area,
    study_topic: row.study,
    topic: row.topic,
    difficulty: row.difficulty,
    question_text: row.text,
    option_a: options[0] || "",
    option_b: options[1] || "",
    option_c: options[2] || "",
    option_d: "",
    correct_option: correct,
    explanation: row.why,
    option_feedback: { A: reasons[0] || row.why, B: reasons[1] || row.why, C: reasons[2] || row.why, D: "" },
    source_id: "pa-official",
    source_reference: row.source,
    effective_from: "2026-03-28",
    effective_to: null,
    last_verified_at: PA_CHECKED,
    version: 1,
    is_free: row.free,
    status: "published",
  };
}

const questions = rows.map(publish);

export function publishedPaQuestions() {
  return questions.filter((question) => question.status === "published" && question.state === "PA");
}

export function paQuestionCounts() {
  const published = publishedPaQuestions();
  return {
    published: published.length,
    free: published.filter((question) => question.is_free).length,
    pro: published.filter((question) => !question.is_free).length,
  };
}

const SCORED = [
  { area: "obtaining" as const, count: 4 },
  { area: "performing" as const, count: 18 },
  { area: "compliance" as const, count: 3 },
];
const UNSCORED = [
  { area: "obtaining" as const, count: 1 },
  { area: "performing" as const, count: 3 },
  { area: "compliance" as const, count: 1 },
];

export function pickPaQuickExam(seed: number, pool = publishedPaQuestions().filter((question) => question.is_free)) {
  const areas = ["obtaining", "performing", "compliance"] as const;
  const used = new Set<string>();
  const picked: Question[] = [];
  for (let round = 0; round < 4 && picked.length < 10; round += 1) {
    areas.forEach((area, index) => {
      if (picked.length === 10) return;
      const hit = shuffle(pool.filter((question) => question.exam_area === area && !used.has(question.question_id)), seed + round * 10 + index)[0];
      if (!hit) return;
      used.add(hit.question_id);
      picked.push(hit);
    });
  }
  return picked.length === 10 ? shuffle(picked, seed + 99) : [];
}

export function pickPaFullExam(seed: number, pool = publishedPaQuestions()) {
  const used = new Set<string>();
  const take = (area: ExamArea, count: number, salt: number) => {
    const picked = shuffle(pool.filter((question) => question.exam_area === area && !used.has(question.question_id)), seed + salt).slice(0, count);
    picked.forEach((question) => used.add(question.question_id));
    return picked;
  };
  const scored = SCORED.flatMap((quota, index) => take(quota.area, quota.count, index * 17));
  if (scored.length !== 25) return null;
  const unscored = UNSCORED.flatMap((quota, index) => take(quota.area, quota.count, 200 + index));
  if (unscored.length !== 5) return null;
  return { questions: shuffle([...scored, ...unscored], seed + 87), unscoredIds: unscored.map((question) => question.question_id) };
}

export type PaCard = { id: string; study: string; title: string; front: string; rule: string; boundary: string; mixup: string; source: string; sourceUrl: string };

export const paCards: PaCard[] = [
  { id: "pa-card-exam", study: "education-exam", title: "30 items, scaled 75", front: "What is the official Pennsylvania notary exam?", rule: "30 multiple-choice items, 25 scored and 5 unidentified pretest items, in 60 minutes.", boundary: "A scaled score of 75 is the passing score. It is not the number or percent correct.", mixup: "A practice score on this site is not that official scale.", source: "Pearson VUE bulletin, March 2026", sourceUrl: "https://www.pearsonvue.com/content/dam/VUE/vue/en/documents/publications/283980.pdf" },
  { id: "pa-card-course", study: "education-exam", title: "Three hours, then the exam", front: "Does this website replace the required course?", rule: "No. Pennsylvania requires at least three hours of Department-approved education in the six months before the application.", boundary: "This site does not issue that course certificate.", mixup: "A current commission holder still needs the education even when the exam is not required.", source: "57 Pa.C.S. § 322", sourceUrl: "https://www.pa.gov/agencies/dos/programs/notaries/examination-requirement" },
  { id: "pa-card-bond", study: "bond-oath", title: "Which bond amount", front: "Is every Pennsylvania notary on a $25,000 bond today?", rule: "New and reappointed notaries on or after March 28, 2026 obtain a $25,000 bond.", boundary: "A notary who already held a commission on that date may keep the existing bond until that commission expires.", mixup: "The bond protects the customer. It is not errors-and-omissions insurance.", source: "4 Pa. Code § 167.16", sourceUrl: "https://www.pa.gov/agencies/dos/programs/notaries/bonding-requirement" },
  { id: "pa-card-45", study: "bond-oath", title: "45 days", front: "When does the commission become void?", rule: "If the oath, bond, and commission are not recorded, or the official signature is not registered, within 45 days.", boundary: "The notary does not begin notarizing before those steps.", mixup: "A late start does not keep the appointment alive.", source: "57 Pa.C.S. § 321", sourceUrl: "https://www.pa.gov/agencies/dos/programs/notaries/bonding-requirement" },
  { id: "pa-card-fee", study: "fees", title: "Five dollars, then two", front: "What is the maximum for an acknowledgment?", rule: "$5 for the first name in the certificate and $2 for each additional name in that certificate.", boundary: "The notary may charge less or nothing. A travel charge is separate and must be itemized.", mixup: "The fee is presumed to belong to the notary, not the employer, unless they agree.", source: "Department fee page", sourceUrl: "https://www.pa.gov/agencies/dos/programs/notaries/notary-public-fees" },
  { id: "pa-card-journal", study: "journal", title: "The book stays with the notary", front: "Who owns the journal?", rule: "The notary. It is not surrendered to an employer when the job ends.", boundary: "Every notarial act is entered at the time of the act. A Social Security number does not go in the book.", mixup: "Paying for the book does not make the employer its owner.", source: "57 Pa.C.S. § 319", sourceUrl: "https://www.pa.gov/agencies/dos/programs/notaries/notary-regulations-changes" },
  { id: "pa-card-id", study: "identity", title: "Current identification", front: "Can an expired driver's license identify a stranger?", rule: "No. A license used under § 307(b)(1)(i) must be current and unexpired.", boundary: "A personally known credible witness who appears and takes an oath is a different method.", mixup: "A telephone call is not personal appearance.", source: "57 Pa.C.S. §§ 306, 307", sourceUrl: "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/programs/notary/electronic-notarization/RULONA-Act-73-of-2013-as-amended-11-2022.pdf" },
  { id: "pa-card-remote", study: "remote", title: "The notary stays in Pennsylvania", front: "Where is the notary during a remote act?", rule: "In Pennsylvania, using communication technology that provides simultaneous sight and sound.", boundary: "The certificate says communication technology was used. The recording is kept at least 10 years unless a regulation sets another period.", mixup: "A phone call without video does not meet the definition.", source: "57 Pa.C.S. § 306.1", sourceUrl: "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/programs/notary/electronic-notarization/RULONA-Act-73-of-2013-as-amended-11-2022.pdf" },
  { id: "pa-card-stamp", study: "stamp", title: "Commission number on the stamp", front: "What changed on the stamp on March 28, 2026?", rule: "New and reappointed notaries use a stamp that includes the seven-digit commission number.", boundary: "A notary who already held a commission that day may keep the old seal until that commission expires.", mixup: "An embosser remains optional. The rubber stamp is still required.", source: "Department regulation summary", sourceUrl: "https://www.pa.gov/agencies/dos/programs/notaries/notary-regulations-changes" },
  { id: "pa-card-notario", study: "prohibited", title: "Not a law office", front: "May a nonlawyer notary advertise as a notario?", rule: "No. A commission also does not authorize legal advice or immigration consulting.", boundary: "The advertising statement required by § 325 must be prominent and in each language used.", mixup: "A disclaimer does not make the prohibited title lawful.", source: "57 Pa.C.S. § 325", sourceUrl: "https://www.pa.gov/content/dam/copapwp-pagov/en/dos/programs/notary/electronic-notarization/RULONA-Act-73-of-2013-as-amended-11-2022.pdf" },
];
