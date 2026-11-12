import { shuffle } from "../lib/answer-sequence.ts";
import type { Difficulty, Question, TopicId } from "@/lib/types";
import { nyBatch2 } from "./ny-batch2";
import { nyBatch3 } from "./ny-batch3";
import { nyBatch4 } from "./ny-batch4";
import { nyBatch5 } from "./ny-batch5";
import { nyBatch6 } from "./ny-batch6";
import { nyBatch7 } from "./ny-batch7";
import { nyBatch8 } from "./ny-batch8";
import { nyBatch9 } from "./ny-batch9";
import { nyCardsMore } from "./ny-cards-more";
import { currentQuestionVersion } from "../lib/question-revisions";
import { nyRevisedRows } from './ny-revisions';
import { nyReviewedSources } from './ny-source-review';

export const NY_CHECKED = "2026-11-09";

export const nyTopics = [
  { id: "exam-day", label: "The written exam" },
  { id: "appointment", label: "Appointment and term" },
  { id: "fees", label: "Fees" },
  { id: "journal", label: "Journal" },
  { id: "electronic", label: "Electronic notarization" },
];

type Row = {
  id: string; study: string; topic: TopicId; difficulty: Difficulty; free: boolean; verified?: string;
  text: string; options: [string, string, string, string]; correct: 0 | 1 | 2 | 3;
  why: string; miss: [string, string, string, string]; source: string;
};

const FAQ = "New York Department of State, Notary Public FAQ, checked 2026-11-08";
const EXAM = "New York Department of State, July–December 2026 Notary Public written examination information, updated November 3, 2026, checked 2026-11-08";
const PAGE = "New York Department of State, Notary Public overview, checked 2026-11-08";

const rows: Row[] = [...nyBatch9, ...nyBatch8, ...nyBatch7, ...nyBatch6, ...nyBatch5, ...nyBatch4, ...nyBatch3, ...nyBatch2].concat([
  { id: "ny-001", study: "exam-day", topic: "commission", difficulty: "easy", free: true,
    text: "The official New York notary exam schedule describes the sitting. Which fact is stated there?",
    options: ["The exam is an essay", "Applicants have one hour after the instructions, and the exam is multiple choice", "The exam has a published raw passing score of 70 percent", "Books and notes are allowed"],
    correct: 1, why: "The Department's 2026 exam information says the exam is multiple choice and applicants have one hour, starting when the instructions end. It does not publish a question count or a numeric passing score. It forbids books and notes.",
    miss: ["The sheet says multiple choice.", "Correct. One hour, multiple choice.", "The sheet reports only pass or fail and does not state 70 percent.", "Books and reference materials are not allowed."], source: EXAM },
  { id: "ny-002", study: "exam-day", topic: "commission", difficulty: "easy", free: true,
    text: "A candidate asks how the New York exam fee may be paid at the center. What does the 2026 exam information allow?",
    options: ["Cash", "A $15 check or money order payable to the Department of State, or MasterCard or Visa. Cash is not accepted", "The fee is refundable if the candidate fails", "No fee is charged"],
    correct: 1, why: "The exam information sets a $15 nonrefundable fee, payable by check or money order to the Department of State or by MasterCard or Visa, and says cash is not accepted.",
    miss: ["Cash is specifically not accepted.", "Correct. The fee is $15 by check, money order, or those cards.", "The fee is nonrefundable.", "A fee is charged."], source: EXAM },
  { id: "ny-003", study: "exam-day", topic: "commission", difficulty: "medium", free: true,
    text: "A candidate passes the written exam and waits 26 months to apply. What does the Department say about the result?",
    options: ["Exam results do not expire", "Results are valid for two years", "Results are valid for four years, the same as a commission", "A pass can be renewed by paying $15"],
    correct: 1, why: "The exam information says examination results are valid for two years. The FAQ says the same about results from before online scheduling.",
    miss: ["The Department states a two-year limit.", "Correct. The result is valid for two years.", "Four years is the commission term, not the exam-result period.", "The sheet does not describe a $15 renewal of an old result."], source: EXAM },
  { id: "ny-004", study: "exam-day", topic: "commission", difficulty: "medium", free: true,
    text: "A candidate fails and asks for the numeric score. What does the 2026 exam information say?",
    options: ["A percentage is printed on the notice", "Results are reported only as passed or failed. No numeric score is given", "The candidate can buy a rescore for $30", "The score is posted online the same day"],
    correct: 1, why: "The exam information says all results are reported as passed or failed and the candidate will not get a numerical score. Notice is by mail.",
    miss: ["A percentage is not provided.", "Correct. The notice is pass or fail only.", "The sheet does not offer a paid rescore.", "The sheet says the candidate is notified by mail, not by a same-day online score."], source: EXAM },
  { id: "ny-005", study: "appointment", topic: "commission", difficulty: "easy", free: true,
    text: "A member of the New York bar applies for a notary commission. Which exemption does the Department's FAQ state?",
    options: ["The attorney is exempt from the exam and from the application fee", "The attorney may be appointed without the exam, but is not exempt from the application fee", "The attorney is exempt from the commission term", "No attorney exemption exists"],
    correct: 1, why: "The FAQ says a current member of the New York bar, and a described court clerk, may be appointed without an examination, but is not exempt from the application fee.",
    miss: ["The FAQ keeps the application fee.", "Correct. The exam can be waived. The fee is not.", "The term is not waived by that answer.", "The FAQ does state an exam exemption for a New York attorney."], source: FAQ },
  { id: "ny-006", study: "appointment", topic: "commission", difficulty: "medium", free: true,
    text: "An attorney admitted only in New Jersey asks to skip the New York exam. Does the FAQ's exemption cover that person?",
    options: ["Yes. Any United States lawyer is exempt", "No. The stated exemption is for a current member of the New York State bar, or the described Unified Court System court clerk", "Yes, if the person lives in New York", "Yes, after one year of practice"],
    correct: 1, why: "The FAQ limits the lawyer exemption to a current member of the New York State bar. A New Jersey admission is not that membership.",
    miss: ["The FAQ does not say any lawyer.", "Correct. The exemption names the New York bar and a specific court-clerk path.", "Residence is not the exemption.", "Years of practice are not the exemption."], source: FAQ },
  { id: "ny-007", study: "appointment", topic: "commission", difficulty: "easy", free: true,
    text: "How long is a New York notary commission, according to the Department's notary overview?",
    options: ["Two years", "Four years", "Life", "One year"],
    correct: 1, why: "The Department's notary overview says the term of commission is four years.",
    miss: ["Two years is the exam-result period, not the commission term.", "Correct. The stated term is four years.", "New York does not describe a lifetime commission on that page.", "One year is not the stated term."], source: PAGE },
  { id: "ny-008", study: "fees", topic: "seals-fees", difficulty: "easy", free: true,
    text: "A signer wants one acknowledgment. What maximum does the Department's FAQ state?",
    options: ["$15", "$5", "$2, unless another law authorizes more", "No fee may be charged"],
    correct: 2, why: "The FAQ says a notary may charge $2 for an oath or affirmation, an acknowledgment, or a proof of execution, and may not exceed that amount unless otherwise authorized by law.",
    miss: ["Fifteen dollars is not the FAQ amount.", "Five dollars is not the FAQ amount.", "Correct. The stated maximum is $2 unless another law authorizes more.", "The FAQ allows a fee up to that maximum."], source: FAQ },
  { id: "ny-009", study: "fees", topic: "seals-fees", difficulty: "medium", free: false,
    text: "During the commission, a notary changes a name for a reason other than marriage and wants the Department's card updated. What does the FAQ say?",
    options: ["The change is free and a new identification card is issued immediately", "A $10 fee applies, and a new identification card is not issued mid-term. The notary keeps using the commissioned name for the rest of the term", "The commission ends", "The notary may sign the new name on certificates the same day"],
    correct: 1, why: "The FAQ sets a $10 fee for a name or address change, with no fee when the name change results from marital status. It also says a new card is not issued for a mid-term name change, and the notary continues to sign the commissioned name for the rest of the term.",
    miss: ["The fee and the card rule are both stated, and this change is not marital.", "Correct. The $10 fee applies, no new card is issued, and the commissioned name stays on certificates.", "The FAQ does not say the commission ends.", "The FAQ says the commissioned name continues for the rest of the term."], source: FAQ },
  { id: "ny-010", study: "journal", topic: "journals", difficulty: "medium", free: true,
    text: "A traditional in-person notary asks whether a journal is required. What starting date and retention period does the FAQ give?",
    options: ["No traditional notary keeps a journal", "Beginning January 25, 2023, all notaries keep a journal, including the type of identification, for 10 years", "A journal is required only for electronic notaries, for one year", "The journal is optional if the county clerk keeps the commission"],
    correct: 1, why: "The FAQ says that beginning January 25, 2023, all notaries, including those who only notarize in person, must keep a journal of all notarial acts, including the type of identification, for 10 years.",
    miss: ["Traditional notaries are included.", "Correct. The duty starts January 25, 2023 and the stated retention is 10 years.", "The FAQ includes traditional notaries and says 10 years.", "The county clerk's commission record does not replace the journal."], source: FAQ },
  { id: "ny-011", study: "electronic", topic: "electronic-ron", difficulty: "medium", free: true,
    text: "A signer asks for remote ink notarization in November 2026. What does the FAQ say?",
    options: ["Remote ink notarization is still allowed", "Remote ink notarization is not permitted after January 31, 2023. Electronic notarization by a registered electronic notary is the remote method described", "Any notary may perform a video notarization without registering", "Remote ink notarization is allowed if the paper is mailed the same day"],
    correct: 1, why: "The FAQ says remote ink notarization is not permitted after January 31, 2023. Electronic notarization under Executive Law section 135-c requires registration, and the notary must be physically in New York.",
    miss: ["The FAQ says it is not permitted after that date.", "Correct. Remote ink notarization ended. Electronic notarization is a separate registered authority.", "Registration is required for electronic notarization.", "Mailing the paper does not revive remote ink notarization."], source: FAQ },
  { id: "ny-012", study: "electronic", topic: "electronic-ron", difficulty: "hard", free: false,
    text: "An electronic notary finishes a remote act. The signer wants a paper copy for a recording office. What fee does the FAQ state for papering out?",
    options: ["$10", "$2", "$0, because papering out is not a notarial act", "$15"],
    correct: 1, why: "The FAQ says papering out is covered by the notarial-act fee and the charge is $2.",
    miss: ["Ten dollars is not the stated fee.", "Correct. The FAQ states $2.", "The FAQ treats the certificate of authenticity as a notarial act.", "Fifteen dollars is the exam fee, not this charge."], source: FAQ },
]);

const letters = ["A", "B", "C", "D"] as const;
export function publishedNyQuestions(): Question[] {
  return rows.map((original) => nyRevisedRows.find(row => row.id === original.id) ?? original).map((row) => ({
    question_id: row.id, state: "NY" as const, study_topic: row.study, topic: row.topic, difficulty: row.difficulty,
    question_text: row.text, option_a: row.options[0], option_b: row.options[1], option_c: row.options[2], option_d: row.options[3],
    correct_option: letters[row.correct], explanation: row.why,
    option_feedback: { A: row.miss[0], B: row.miss[1], C: row.miss[2], D: row.miss[3] },
    source_id: "ny-official", source_reference: nyReviewedSources[row.id] ?? row.source, effective_from: "2023-01-25", effective_to: null,
    last_verified_at: row.verified ?? NY_CHECKED, version: currentQuestionVersion(row.id), is_free: row.free, status: "published" as const,
  }));
}
export function pickNyFullExam(seed: number) {
  const bank = publishedNyQuestions();
  const unique = [...new Map(bank.map((question) => [question.question_id, question])).values()];
  if (unique.length < 40) return null;
  return { questions: shuffle(unique, seed).slice(0, 40), unscoredIds: [] as string[] };
}

export function nyQuestionCounts() {
  const published = publishedNyQuestions();
  return { published: published.length, free: published.filter((q) => q.is_free).length, pro: published.filter((q) => !q.is_free).length };
}

const DOS = "https://dos.ny.gov/notary-public-license-law";
export const nyCards = nyCardsMore.concat([
  { id: "ny-card-hour", study: "exam-day", title: "One hour, pass or fail", front: "What does the official exam sheet actually state?", rule: "Multiple choice, one hour after the instructions, and a pass or fail result by mail.", boundary: "The sheet does not state a question count or a percent that must be correct.", mixup: "A 40-question practice on this site is a study setting, not the official form.", source: "Department of State July–December 2026 exam information", sourceUrl: "https://dos.ny.gov/notary-public" },
  { id: "ny-card-fee", study: "appointment", title: "Sixty dollars, nonrefundable", front: "What is the commission application fee?", rule: "Executive Law §131 sets a nonrefundable $60 fee. No further fee is charged to issue the commission.", boundary: "Twenty dollars of that fee is sent to the county clerk.", mixup: "The $15 charge is the exam fee, not the application.", source: "Executive Law §131, September 2026 booklet", sourceUrl: DOS },
  { id: "ny-card-term", study: "appointment", title: "Four years", front: "How long is the appointment?", rule: "Four years, under Executive Law §130.", boundary: "Reappointment is a new $60 application and a new oath.", mixup: "New York does not issue a lifetime notary commission.", source: "Executive Law §130", sourceUrl: DOS },
  { id: "ny-card-office", study: "appointment", title: "Keep the New York office", front: "A resident moves away but keeps a New York office. Is the commission vacated?", rule: "No. Section 130 says that notary does not vacate the office.", boundary: "A nonresident who loses the New York office does vacate it.", mixup: "A residence change and the loss of the office are different events.", source: "Executive Law §130", sourceUrl: DOS },
  { id: "ny-card-ack", study: "fees", title: "Two dollars", front: "What is the maximum for one acknowledgment?", rule: "Two dollars, and two dollars for each additional person, under §136.", boundary: "Swearing a witness is another two dollars.", mixup: "The protest fee in §135 is 75 cents, not two dollars.", source: "Executive Law §136", sourceUrl: DOS },
  { id: "ny-card-interest", study: "appointment", title: "Do not notarize your own deed", front: "May a grantee take the grantor's acknowledgment?", rule: "No. A notary who is a party or directly interested is disqualified.", boundary: "A stockholder may acknowledge another officer's signature for the corporation if the notary is not the executing party.", mixup: "Waiving the fee does not remove the interest.", source: "License Law booklet, disqualifications, and Executive Law §138", sourceUrl: DOS },
  { id: "ny-card-ad", study: "exam-day", title: "Not an attorney", front: "What must a non-attorney add to a non-English advertisement?", rule: "A notice in that language that the notary is not an attorney and cannot give legal advice or charge for it.", boundary: "New York attorneys are outside §135-b. Business cards are advertisements.", mixup: "Using a title that implies admission to the bar is prohibited.", source: "Executive Law §135-b", sourceUrl: DOS },
  { id: "ny-card-e", study: "electronic", title: "Register, then notarize", front: "Where is the notary during an electronic act?", rule: "Physically in New York, and registered with the Secretary before the first electronic act.", boundary: "A business cannot require electronic notarization exclusively.", mixup: "Remote ink notarization is not permitted after January 31, 2023.", source: "Executive Law §135-c and the Department FAQ", sourceUrl: "https://dos.ny.gov/notary-public-frequently-asked-questions" },
  { id: "ny-card-journal", study: "journal", title: "Ten years", front: "Who keeps a journal?", rule: "All notaries, including traditional notaries, beginning January 25, 2023, including the type of identification, for 10 years.", boundary: "A remote video recording used to identify a signer is also kept at least 10 years.", mixup: "The county clerk's commission file is not the notary's journal.", source: "Department of State FAQ", sourceUrl: "https://dos.ny.gov/notary-public-frequently-asked-questions" },
  { id: "ny-card-marriage", study: "appointment", title: "No weddings", front: "Can a New York notary perform a marriage?", rule: "No. The license-law booklet cites Domestic Relations Law for the absence of that authority.", boundary: "Oaths, acknowledgments, affidavits, depositions, and protests are the listed powers.", mixup: "Acknowledging a marriage license is not performing the marriage.", source: "License Law booklet", sourceUrl: DOS },
  { id: "ny-card-clerk", study: "exam-day", title: "Free at the county clerk", front: "What does the public pay a county-clerk staff notary?", rule: "Nothing. County Law §534 requires the service during business hours free of charge.", boundary: "That staff notary is also exempt from the exam fee and the application fee.", mixup: "The ordinary $2 schedule still applies to a notary in private practice.", source: "County Law §534", sourceUrl: DOS },
  { id: "ny-card-change", study: "fees", title: "Ten dollars to update", front: "What does a mid-term address change cost?", rule: "A nonrefundable $10, unless the change is made on a reappointment application.", boundary: "A duplicate identification card is also $10 and is stamped duplicate.", mixup: "Reappointment itself is another $60 application.", source: "Executive Law §131", sourceUrl: DOS },
  { id: "ny-card-forms", study: "appointment", title: "Must and may", front: "Do the in-state and out-of-state acknowledgment forms use the same verb?", rule: "Section 309-a says an in-state certificate must conform substantially to its form. Section 309-b says an out-of-state certificate may conform substantially to its form.", boundary: "Putting the place of the act in the body of a §309-b certificate, outside the jurat, is a non-substantial variance.", mixup: "A New York notary taking an acknowledgment in New York uses the in-state rule.", source: "Real Property Law §§309-a and 309-b", sourceUrl: DOS },
  { id: "ny-card-oath-fee", study: "fees", title: "Two different oath fees", front: "Is every oath two dollars?", rule: "Section 136 allows $2 for an ordinary oath. Public Officers Law §69 allows no fee for the oath of office of a legislator, military officer, election inspector, poll clerk, or other public officer or employee.", boundary: "Charging more than a permitted fee exposes the notary to criminal punishment and treble damages under Public Officers Law §67.", mixup: "The protest fee in §135 is 75 cents, not the oath fee.", source: "Executive Law §136 and Public Officers Law §§67 and 69", sourceUrl: DOS },
  { id: "ny-card-marriage-contract", study: "appointment", title: "Ceremony and contract", front: "Which marriage papers are outside a notary's authority?", rule: "A notary cannot solemnize a marriage and cannot acknowledge the parties and witnesses to a written contract of marriage.", boundary: "Acknowledging an unrelated deed for a married person is allowed. Marriage does not disable that signer.", mixup: "Those are two different prohibitions, not one.", source: "Domestic Relations Law §11 and Real Property Law §302", sourceUrl: DOS },
]);
