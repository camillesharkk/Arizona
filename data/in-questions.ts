import type { Question, TopicId } from "@/lib/types";
import { shuffle } from "../lib/answer-sequence.ts";
import { inTopics } from "./in-bank-summary";
import { inAdditionalGroups } from "./in-question-items";
export { inTopics } from "./in-bank-summary";

const VERIFIED = "2026-11-13";
const GUIDE = "Indiana Secretary of State, Notary Public Guide, revised May 20, 2024; https://inbiz.in.gov/Assets/NotaryGuide.pdf";
const FAQ = "Indiana Secretary of State, New System FAQ, May 4, 2026; https://www.in.gov/sos/business/files/New-Notary-System-FAQs-5-4-26.pdf";
const LAW = "Indiana Code, Article 33-42; https://iga.in.gov/laws/2026/ic/titles/33#33-42";
const SOS = "Indiana Secretary of State, 2025 Recorders Conference presentation; https://www.in.gov/sboa/files/Grosser_SOS-Business-Services-Division_Notary.pdf";

// Each distractor carries its own explanation. Answers are deterministically
// shuffled when published; the authoring order does not expose an answer pattern.
type Item = [text: string, answer: string, rule: string, ...wrong: [string,string][]];
export type Group = { card: number; study: typeof inTopics[number]["id"]; topic: TopicId; source: string; items: Item[] };
const groups: Group[] = [
{card:1,study:"commission",topic:"commission",source:GUIDE+"; Qualifications",items:[
["What minimum age must an Indiana notary applicant have reached?","18 years","An applicant must be at least eighteen years old when applying.",["16 years","Sixteen does not satisfy the minimum age."],["21 years","Indiana does not set the minimum at twenty-one."],["Any age with employer consent","Employer consent does not replace the age requirement."]],
["Which citizenship or immigration status can meet Indiana's applicant qualification?","U.S. citizen or permanent legal resident","Indiana permits a United States citizen or a permanent legal resident to qualify, subject to the other requirements.",["U.S. citizenship only","Permanent legal residents may also qualify."],["Any visitor with a passport","A passport alone does not establish qualifying status."],["Only a natural-born citizen","The qualification does not exclude naturalized citizens."]],
["A permanent legal resident is nineteen and primarily works in Indiana. Is noncitizenship alone disqualifying?","No, permanent legal residents may qualify","Citizenship is not the only qualifying status: permanent legal residents may apply if all other conditions are met.",["Yes; all notaries must be citizens","The eligibility rule also recognizes permanent legal residents."],["Yes; applicants must be twenty-one","The minimum age is eighteen."],["No; employment waives every other condition","Employment does not waive background or other qualifications."]],
["A parent offers written permission for a seventeen-year-old employee to apply. What is missing?","The eighteen-year minimum age","Parental permission does not lower the statutory age required for a notary commission.",["A second parent's consent","Additional parental consent does not satisfy the eighteen-year minimum."],["An employer-sponsored exception","Employer sponsorship does not create an exception to the minimum age."],["A bond covering the extra year","Bond coverage does not lower the applicant's minimum age."]],
]},
{card:2,study:"commission",topic:"commission",source:FAQ+"; Application Requirements, p.5",items:[
["A Kentucky resident primarily employed in Indiana wants an Indiana commission. Which route does the 2026 FAQ describe?","Use the nonresident employment route","A nonresident primarily employed in Indiana can apply using the nonresident residency-and-employment path with an Employer Consent form.",["Purchase an Indiana mailing address","A mailing address does not establish the employment qualification."],["Apply only in the state of residence","The FAQ expressly permits the described nonresident path."],["Skip the residency section","The applicant must complete the employment information."]],
["What additional upload does the 2026 FAQ require from a qualifying nonresident applicant?","An Employer Consent form","Nonresidents using primary Indiana employment must provide employer details and upload the Employer Consent form.",["A consent signed by any customer","The specified consent is from the employer."],["A neighboring state's notary seal","Another state's seal is not the required upload."],["A promise to move within thirty days","The FAQ describes an employment route without that promise."]],
["An Ohio resident occasionally visits Indiana clients but is primarily employed in Ohio. Does occasional Indiana work satisfy the stated nonresident route?","No, employment must be primarily in Indiana","Occasional client visits are not the same as being primarily employed in Indiana.",["Yes; one visit is sufficient","The FAQ uses primary employment, not any visit."],["Yes; owning a car qualifies","Vehicle ownership is unrelated to the employment condition."],["Yes; paying a higher application fee qualifies","Payment does not replace eligibility."]],
["Which selection does the 2026 FAQ tell an eligible nonresident to make in Residency & Employment?","Not IN resident","The FAQ instructs nonresident applicants to select Not IN resident and provide the requested Indiana employment material.",["IN resident because the job is there","An Indiana job does not make an out-of-state home a residence."],["Student exemption","The FAQ does not supply a student exemption."],["Leave residence unanswered","The residence selection must accurately describe the applicant."]],
]},
{card:3,study:"commission",topic:"commission",source:GUIDE+"; Qualifications; "+LAW+"; IC 33-42-12-1",items:[
["Why must an applicant disclose a criminal history rather than assume employer approval is enough?","Criminal history can affect eligibility","The State evaluates the applicant's qualifications and criminal history; an employer cannot grant a commission or waive statutory restrictions.",["Employers alone decide eligibility","An employer does not control the State's eligibility decision."],["Buying insurance erases convictions","Insurance does not erase criminal history."],["Only seal manufacturers review history","Commission eligibility is reviewed through the State process."]],
["An application asks about a prior conviction that may affect eligibility. What is the appropriate response?","Disclose the requested history accurately","Truthful application information allows the Secretary of State to evaluate statutory qualifications and any disqualifying history.",["Omit it if the bond was issued","Bond issuance does not authorize false application answers."],["Ask a coworker to apply in the applicant's name","A commission is personal and cannot be obtained through impersonation."],["Change the applicant's spelling to avoid a match","A name change does not justify concealing the applicant's history."]],
["Does completing a private training class itself resolve an applicant's statutory disqualification?","No, eligibility requirements still apply","Education and eligibility are separate conditions; completing training does not automatically remove a disqualification.",["Yes; a course waives every restriction","A private course cannot waive statutory qualifications."],["Yes; if the course costs more than the application","Price does not change eligibility."],["Yes; when a customer requests the commission","Customer preference cannot override the law."]],
["Who should decide an uncertain eligibility issue before an applicant relies on a commission?","The Secretary of State","The applicant should accurately disclose the issue to the office responsible for commissions rather than invent an exemption.",["The surety issuing the applicant's bond","The surety does not decide the State's applicant eligibility."],["The provider of the applicant's training","A course provider cannot adjudicate the State's eligibility requirements."],["The employer sponsoring the application","Employer sponsorship does not grant a commission or an eligibility exemption."]],
]},
{card:4,study:"commission",topic:"commission",source:FAQ+"; Surety Bond, p.5; "+SOS+"; Bond versus E&O",items:[
["What minimum bond amount does the 2026 Indiana application FAQ require?","$25,000","The uploaded surety bond must have a minimum amount of twenty-five thousand dollars.",["$5,000","Five thousand dollars is below the stated minimum."],["$10,000","Ten thousand dollars does not meet the minimum."],["No bond if insured","Optional insurance does not replace the required bond."]],
["A bond is for $25,000 but lasts one year. What must be corrected for the Indiana application?","An eight-year bond term","The FAQ specifies both a minimum amount and an eight-year term; meeting the amount alone is insufficient.",["Nothing; the amount is all that matters","The FAQ also specifies the term."],["The applicant must shorten the commission","An applicant cannot change the statutory commission term."],["Add a journal entry","A journal entry does not extend a surety bond."]],
["The bond principal's name differs from the application. What does the FAQ require?","Name the applicant exactly as principal","The surety bond must identify the applicant by the exact name used in the application.",["Use the employer's name instead","The principal must be the applicant, not the employer."],["Ignore initials and spelling differences","The FAQ requires an exact match."],["Put the correction only on the stamp","A different stamp does not correct the uploaded bond."]],
["Who is the required notary surety bond intended to protect?","The public","The Secretary of State distinguishes the required public-protection bond from optional errors-and-omissions insurance protecting the notary.",["Only the notary against all loss","The bond's purpose differs from E&O coverage."],["Only the stamp vendor","A seal vendor is not the protected public in this distinction."],["Only the employer's equipment","The bond is not equipment insurance."]],
]},
{card:5,study:"commission",topic:"commission",source:FAQ+"; Background Check, p.5",items:[
["Which criminal-history report does the 2026 FAQ require applicants to upload?","An Indiana State Police Criminal History report","The FAQ specifically identifies the Indiana State Police report as the required background-check material.",["Any internet people-search report","A generic people search is not the specified ISP report."],["A credit score","Credit information is not a criminal-history report."],["A letter from a neighbor","A personal reference does not replace the ISP report."]],
["An applicant's ISP report is seven months old. What should the applicant obtain?","A new ISP report within the six-month limit","The 2026 FAQ limits the age of the required ISP Criminal History report to six months.",["The old report with a current application date","A current application does not make the seven-month-old report recent enough."],["The old report plus an employer reference","An employer reference does not update the ISP report's age."],["The old report with a sworn no-change statement","A no-change statement does not replace the recent ISP report requested by the FAQ."]],
["A report from another state's police department is recent. Does it replace the named Indiana application report?","No, the specified report is from ISP","Both the specified issuer and the six-month timing matter under the FAQ.",["Yes; all police reports are interchangeable","The FAQ expressly names ISP."],["Yes; if a notary stamps it","A notarization does not change the report's issuer."],["Yes; if the applicant pays twice","Additional payment does not substitute an unrequested report."]],
["An applicant wants to upload an expired report and conceal its date. What is the proper course?","Upload a valid recent ISP report","The application requires a valid ISP report dated within six months; concealing the date does not satisfy that requirement.",["Upload only the report's undated result page","Removing the date does not establish that the report is within six months."],["Rename the old file with today's date","The filename does not change when ISP issued the report."],["Substitute the employer's annual screening","The required upload is the valid recent ISP report specified by the FAQ."]],
]},
{card:6,study:"commission",topic:"commission",source:FAQ+"; Signature Sample, p.5; "+SOS+"; Notary Signatures",items:[
["How should the application signature sample be prepared under the 2026 FAQ?","In ink on a clean white background","The FAQ specifies ink and a clean white background for the signature sample.",["In pencil on patterned paper","Pencil and a distracting background do not follow the instructions."],["As a typed name only","The requested sample is a signature, not merely typed text."],["In very light ink on a dark page","Light ink and a dark background can delay review."]],
["The application uses Morgan Lee but the signature sample uses a different surname. What is required?","A signature name matching the application's personal information","The FAQ warns that mismatched names delay the application and requires the signature name to match the personal information.",["Keep the mismatch if the applicant prefers it","Preference does not remove the matching requirement."],["Put the employer's signature underneath","The employer cannot cure the applicant's mismatched signature."],["Remove personal information from the application","The applicant must supply accurate personal information."]],
["After commissioning, how should the notary sign notarial certificates?","Match the signature sample on file","The Secretary of State instructs notaries to sign notarizations consistently with the handwritten sample submitted with the application.",["Use a different style for every customer","Varying the official signature defeats the required consistency."],["Use the signer's signature","The notary signs the notarial certificate in the notary's own official capacity."],["Use only the employer's company name","The commission and official signature are personal to the notary."]],
["Which application problem does the FAQ specifically associate with signature-sample delays?","Pencil or a mismatched signature name","The FAQ identifies these signature problems as reasons an application may be delayed.",["Using white paper","A clean white background is the requested format."],["Signing in ink","Ink is specifically requested."],["Matching the applicant's name","A matching name is required, not a defect."]],
]},
{card:7,study:"commission",topic:"commission",source:FAQ+"; Application and Education, pp.3-6",items:[
["In the 2026 system, when does the FAQ say the education-ready email is sent?","After the application is submitted and approved","The FAQ describes application submission and approval before the email that the education course is ready in the Learner Hub.",["Before any application is started","The FAQ places course readiness after submission and approval."],["Only after a first notarization","An applicant should not perform acts before authorization."],["After purchasing an unrelated private course","A private purchase is not the stated system trigger."]],
["Where does an applicant resume an unfinished application in the new system?","Applicant Hub, then Continue","The Applicant Hub displays application drafts and a Continue button with progress information.",["The Learner Hub's exam tab","The exam tab is for education status, not application drafts."],["A seal manufacturer's account","The official application is not maintained by a seal retailer."],["A county recorder's deed index","The deed index is unrelated to application drafts."]],
["Where should a notified applicant access the assigned course and exam?","The Learner Hub","The FAQ directs applicants to the Learner Hub for required education courses and examinations.",["The Applicant Hub only","The Applicant Hub handles applications; education is in the Learner Hub."],["Any social-media quiz","An unofficial quiz is not the State's assigned course or exam."],["The county clerk's paper docket","The FAQ describes the dedicated online Learner Hub."]],
["What happens if an applicant skips the system's AI document validation?","The application is flagged for staff review","The FAQ allows skipping AI validation or disputing its findings; this triggers staff review rather than an automatic hard stop.",["The applicant is permanently barred","The FAQ does not make skipping AI a permanent bar."],["All uploaded documents become automatically approved","Skipping validation does not guarantee acceptance."],["The applicant is immediately commissioned","Manual review is not a commission grant."]],
]},
{card:8,study:"commission",topic:"commission",source:FAQ+"; Passing Score, pp.7-8",items:[
["How many questions are on the official exam described in the 2026 FAQ?","30 questions","The FAQ states that the notary exam consists of thirty questions.",["10 questions","Ten is not the official question count."],["40 questions","Forty is not the count given in the FAQ."],["50 questions","Fifty is not the official exam length."]],
["What passing percentage does the official Indiana FAQ state?","At least 80 percent","The FAQ requires a score of at least eighty percent on the thirty-question examination.",["At least 60 percent","Sixty percent is below the stated passing threshold."],["At least 70 percent","Seventy percent is not the FAQ threshold."],["Exactly 100 percent","A perfect score is not required."]],
["A candidate answers twenty-three of the thirty official exam questions correctly. Has the stated passing standard been met?","No, twenty-four correct is the minimum","Eighty percent of thirty is twenty-four; twenty-three falls below the FAQ's minimum.",["Yes; twenty-three is the published minimum","The FAQ gives twenty-four, not twenty-three."],["Yes; only half must be correct","Half is below the eighty-percent requirement."],["No; all thirty must be correct","Thirty correct is unnecessary; twenty-four suffices."]],
["A candidate misses six questions on the thirty-question official exam. How does that compare with the FAQ standard?","It meets the passing standard","Thirty minus six is twenty-four, which is the minimum passing number specified by the FAQ.",["It falls one question short","Twenty-four correct meets, rather than misses, the stated threshold."],["It requires a perfect retake","The standard does not require a perfect score."],["The FAQ does not state a passing count","The FAQ expressly states twenty-four correct answers."]],
["Which pair accurately describes the official exam rather than a website's short practice quiz?","Thirty questions, twenty-four correct","The official FAQ states both the thirty-question length and the twenty-four-correct passing requirement; practice formats do not change them.",["Ten questions, eight correct","That may describe a practice set but is not the official exam format."],["Thirty questions, twenty-one correct","Twenty-one is only seventy percent."],["Forty questions, thirty-two correct","Although eighty percent, those numbers are not the stated official format."]],
]},
{card:9,study:"commission",topic:"commission",source:FAQ+"; Failed Exam, p.6",items:[
["How long must a failed candidate wait before another attempt under the 2026 FAQ?","24 hours","The FAQ says a failed candidate must wait twenty-four hours before trying again.",["Ten minutes","Ten minutes is shorter than the required waiting period."],["Thirty days","The FAQ does not impose a thirty-day delay."],["Until the next eight-year term","The retake rule is not tied to a new commission term."]],
["How many exam attempts does the 2026 FAQ permit after failures?","Unlimited attempts after the required wait","The FAQ pairs a twenty-four-hour wait with unlimited examination attempts.",["Only two attempts ever","The FAQ does not impose a two-attempt lifetime limit."],["Exactly three attempts per commission","Three is not the stated limit."],["No retakes","The FAQ expressly permits retakes."]],
["A candidate fails at 2 p.m. and wants another attempt at 3 p.m. that day. What rule applies?","Wait until twenty-four hours have elapsed","Unlimited attempts do not mean immediate retries: the stated wait applies after a failed exam.",["Unlimited attempts waive all waiting","The FAQ includes a waiting period despite unlimited attempts."],["An employer can override the timer","The FAQ does not grant an employer that authority."],["Buying a stamp reopens the exam","A stamp purchase does not change the retake schedule."]],
["What notice does the FAQ say a failed candidate receives when the exam reopens?","An email when the exam reopens","The FAQ says an email is sent after the waiting period when the exam opens again.",["A new physical seal by mail","A seal is unrelated to the reopening notice."],["A court summons","The retake notice is an email, not court process."],["Automatic approval without retesting","A failed attempt does not become a pass after waiting."]],
]},
{card:10,study:"commission",topic:"commission",source:FAQ+"; My Commission, p.8; "+SOS+"; Commission Term",items:[
["Where does the 2026 FAQ direct an approved notary to download the active commission certificate?","Learner Hub, then My Commission","The FAQ places the official certificate and active commission details under the Learner Hub's My Commission icon.",["A private exam-prep account","The official certificate is accessed in the State system."],["The stamp vendor's order history","A purchase receipt is not the State's certificate."],["The public deed-recording index","The FAQ identifies My Commission instead."]],
["How long is an Indiana notary commission term?","Eight years","The Secretary of State describes Indiana notaries as public officials commissioned for eight-year terms.",["One year","The commission term is not one year."],["Four years","Four years is not Indiana's stated term."],["For life","Indiana commissions have a fixed term."]],
["A student passed a commercial practice test but has no active State commission. May the student begin notarizing?","No, an active commission is required","Authority comes from a valid State commission, not an unofficial course, practice score, or stamp purchase.",["Yes; any passing practice score grants authority","Practice performance is not a State commission."],["Yes; after printing a business card","Advertising does not create official authority."],["Yes; if the student charges no fee","A free service still requires authority."]],
["Does downloading a certificate grant an Indiana notary authority to practice law?","No, it grants only notarial authority","A notary commission authorizes notarial functions within its limits; it does not create an attorney license.",["Yes; every commissioned notary is an attorney","Notarial authority and a law license are different."],["Yes; if the certificate has a seal","A seal authenticates the certificate, not an attorney qualification."],["Yes; after the certificate is printed","Printing a certificate does not expand the office's powers."]],
]},
{card:11,study:"commission",topic:"commission",source:SOS+"; Bond versus E&O",items:[
["Is errors-and-omissions insurance the same as the required Indiana surety bond?","No, they protect different interests","The Secretary of State distinguishes the required public-protection bond from optional E&O coverage.",["Yes; either document always replaces the other","Their purposes and mandatory status differ."],["Yes; both are commission certificates","Insurance and bonding documents are not commissions."],["No; the bond is optional and E&O mandatory","That reverses the Secretary of State's distinction."]],
["A new notary buys only E&O insurance. Which mandatory protection is still needed?","The required $25,000 surety bond","Optional E&O coverage does not substitute for the required surety bond.",["No further protection; E&O replaces the bond","The two products are not substitutes for application requirements."],["A customer's life insurance","Customer insurance is unrelated to the bond requirement."],["An employer's vehicle policy","Vehicle coverage does not satisfy notary bonding."]],
["Why should a notary avoid describing the bond as personal malpractice insurance?","The bond protects the public","The SOS presentation describes the bond as public protection and E&O as optional notary protection.",["The bond is required only if a claim is filed","The application requires the bond before any later claim might arise."],["The bond and E&O both protect only the notary","The SOS distinguishes the public-protection bond from notary-protection E&O."],["The bond removes any need to follow notarial safeguards","The required bond does not excuse improper performance."]],
["An employer offers to buy the required bond. Does that make the employer the commissioned public official?","No; the individual remains the notary","Payment by an employer does not transfer the personal commission or independent responsibilities.",["Yes; whoever pays owns the commission","Payment does not determine who holds the office."],["Yes; the employer may notarize using the employee's name","A commission cannot be used by another person."],["No; only a customer may buy the bond","The issue is personal authority, not a customer-payment requirement."]],
]},
{card:12,study:"commission",topic:"commission",source:FAQ+"; Bond and Signature Requirements, p.5",items:[
["Which application names must be coordinated under the 2026 document instructions?","Application, bond, and signature names","The bond must name the exact applicant and the signature name must match the application's personal information.",["Only the employer and the stamp retailer","Those names do not replace the applicant's identity."],["Only the applicant's social-media nickname","A nickname is not the document-matching standard."],["Only the names of two references","The FAQ addresses the applicant's own documents."]],
["A bond uses a business trade name as principal instead of the applicant's name. What is the problem?","The wrong principal is named","The FAQ requires the bond principal to be the applicant's exact name.",["A business name automatically commissions all staff","Commissions are held by individuals."],["No problem if the business bought the bond","The payer does not remove the name requirement."],["Only the bond amount matters","The FAQ also requires the correct principal and term."]],
["An applicant uses one name on the application and another on the signature upload. What should happen before relying on approval?","Correct the applicant-name mismatch","The FAQ warns mismatched names can delay review; consistent accurate documents support the same applicant identity.",["Assume staff will silently change every document","The applicant should not rely on an unexplained mismatch."],["Borrow another person's matching signature","Another person's signature is not the applicant's sample."],["Hide the signature upload's name","Concealment does not make the information accurate."]],
["A document-validation warning identifies inconsistent applicant names. What option does the FAQ provide if the applicant disputes the warning?","Dispute the finding and continue for staff review","AI findings are not a hard stop; the applicant may dispute them and proceed to manual review.",["The warning automatically waives the name rule","Manual review does not erase document requirements."],["Create a false identity to bypass the warning","The application must accurately identify the applicant."],["Begin notarizing while review is pending","A review-pending application does not grant active authority."]],
]},
];

const letters = ["A", "B", "C", "D"] as const;
const sortedGroups = [...groups, ...inAdditionalGroups].sort((a,b) => a.card-b.card);
// These clauses have corroboration in a statutory mirror but no actually read
// official passage supporting their precise boundary. They remain candidates.
const draftConcepts = new Map<number,string>([
  [17,"Additional-ID statutory discretion not retrieved from an official primary passage"],
  [24,"Designated-signer statutory procedure not retrieved from an official primary passage"],
  [30,"Express no-presigned-certificate provision not retrieved from an official primary passage"],
  [32,"Express prohibition on alteration of seal impressions not retrieved from official primary text"],
  [35,"Seal reproducibility provision not retrieved from official primary text"],
  [37,"Ordinary-device lost/stolen notice provision not retrieved from official primary text"],
  [42,"Per-signature and displayed-fee statute not retrieved; simplified per-act official slides do not resolve its boundaries"],
]);
const guidePages: Record<number,string> = {1:"8",3:"8",13:"20, 26, 54",14:"20",15:"20",16:"20-21",18:"7, 51-52",19:"17, 51-53",20:"54",21:"54",22:"55-56",23:"19, 56",26:"15, 26, 43",27:"25",28:"26",29:"15-17",31:"17",33:"26",34:"17-18",36:"18, 22",38:"18",39:"27-28",40:"26",41:"23",43:"7, 18-19",44:"22",45:"25",46:"21",47:"7, 21",48:"7, 21",49:"7, 22",50:"7, 22"};
const draftItems = new Map<string,string>([
  ["38:2","Ordinary-device representative duty on death not retrieved in official primary text"],
  ["38:3","Expanded statutory device-disabling alternatives not retrieved in ordinary official primary text"],
  ["40:0","Explicit statutory no-immunity clause not retrieved in official primary text"],
  ["46:3","General refusal-unless-prohibited clause not retrieved in official primary text"],
]);
const evidenceFor = (group: Group) => {
  const primary = group.source.startsWith("Indiana Secretary of State, New") ? "in-faq" : group.source.startsWith("Indiana Secretary of State, 2025") ? "in-sos-2025" : "in-guide-2024";
  const accessed = primary === "in-guide-2024" ? `Official indexed Guide passages pp. ${guidePages[group.card] ?? "not established"}; https://inbizqa.soi.in.gov/Assets/NotaryGuide.pdf` : "Official complete PDF text read 2026-11-13";
  return {source_id:primary,source_reference:`${group.source}; ${accessed}. Code links are cross-references, not a claim that the 2026 Code body was opened.`};
};
let nextId = 0;
export const inQuestions: Question[] = sortedGroups.flatMap(group => group.items.map((item, index) => {
  const id = ++nextId;
  const [text, answer, rule, ...wrong] = item;
  const draftReason = draftConcepts.get(group.card) ?? draftItems.get(`${group.card}:${index}`);
  const choices = shuffle([{text:answer,feedback:rule,correct:true},...wrong.map(([text,feedback])=>({text,feedback,correct:false}))], id * 7919);
  return {
    question_id: `in-${String(id).padStart(3,"0")}`, state: "IN", study_topic:group.study, topic:group.topic,
    difficulty: index === 0 ? "easy" : index === 3 ? "hard" : "medium",
    question_text:text, option_a:choices[0].text, option_b:choices[1].text, option_c:choices[2].text, option_d:choices[3].text,
    correct_option:letters[choices.findIndex(c=>c.correct)], explanation:rule,
    option_feedback:{A:choices[0].feedback,B:choices[1].feedback,C:choices[2].feedback,D:choices[3].feedback},
    ...evidenceFor(group), concept_ids:[`in-card-${String(group.card).padStart(3,"0")}`],
    effective_from:VERIFIED, effective_to:null, last_verified_at:draftReason ? "" : VERIFIED, version:1,
    is_free:false, status:draftReason ? "draft" : "published",
  } satisfies Question;
}));

// Public tiers are selected only from verified published rows, with ten items
// from each study topic. No draft can enter a public practice or exam pool.
for (const topic of inTopics) {
  const eligible = inQuestions.filter(q=>q.status === "published" && q.study_topic === topic.id);
  const concepts = [...new Set(eligible.map(q=>q.concept_ids![0]))];
  const ordered = Array.from({length:5},(_,index)=>concepts.map(concept=>eligible.filter(q=>q.concept_ids![0]===concept)[index]).filter(Boolean)).flat();
  for (const question of ordered.slice(0,10)) question.is_free = true;
}
export const inQuestionReview = inQuestions.map(q=>{
  const card = Number(q.concept_ids![0].slice(-3));
  const group = sortedGroups.find(g=>g.card === card)!;
  const index = inQuestions.filter(item=>item.concept_ids![0]===q.concept_ids![0]).findIndex(item=>item.question_id===q.question_id);
  return {question_id:q.question_id,concept_id:q.concept_ids![0],status:q.status,reason:draftConcepts.get(card) ?? draftItems.get(`${group.card}:${index}`) ?? "Supported by the cited actually read official passage",source_reference:q.source_reference};
});

export function publishedInQuestions(): Question[] {
  return inQuestions.filter(q=>q.status === "published" && q.state === "IN" && q.effective_to === null);
}
export function inQuestionCounts() {
  const published = publishedInQuestions();
  return { candidate:inQuestions.length, draft:inQuestions.filter(q=>q.status === "draft").length, published:published.length, free:published.filter(q=>q.is_free).length, pro:published.filter(q=>!q.is_free).length,
    topics:Object.fromEntries(inTopics.map(t=>[t.id,published.filter(q=>q.study_topic===t.id).length])) };
}
function selectExam(seed: number, count: number, pro: boolean): Question[] {
  const pool = publishedInQuestions().filter(q=>pro || q.is_free);
  const mandatory = inTopics.map((topic,index)=>shuffle(pool.filter(q=>q.study_topic===topic.id),seed+index*101)[0]).filter(Boolean);
  const selected = new Set(mandatory.map(q=>q.question_id));
  return shuffle([...mandatory,...shuffle(pool.filter(q=>!selected.has(q.question_id)),seed+701).slice(0,count-mandatory.length)],seed+1301);
}
export function pickInQuickExam(seed: number): Question[] {
  return selectExam(seed,10,false);
}
export function pickInFullExam(seed: number, pro = false) {
  return {questions:selectExam(seed,30,pro),unscoredIds:[] as string[]};
}
