import type {StateArticle} from '@/lib/state-articles';
import {prepPacks} from '@/lib/prep-pack';
const outlines = {
  "IN": [
    {
      "slug": "application-before-course",
      "title": "Plan the Indiana Application Before Starting the Official Course",
      "topic": "commission",
      "lede": "Build your preparation around the official application sequence. A commercial practice result is useful feedback, but the state system controls admission to its course and examination.",
      "paragraphs": [
        "Start by collecting the documents named in the current new-system FAQ. Check that each document identifies the same applicant. A bond bought by an employer still needs the correct individual as principal. Keep clear copies so an upload problem does not force you to reconstruct the application.",
        "Applicant Hub and Learner Hub have different purposes. Submit the application through the applicant workflow and wait for the state’s course-access instructions. Finding a commercial quiz or finishing this site’s questions does not open an official course or create a commission.",
        "For example, an applicant finishes Quick 10 before receiving the state’s approval email. The next step is to check the official application status and follow the state’s instructions, rather than treating the practice score as permission to notarize. Save the source links with your application checklist."
      ]
    },
    {
      "slug": "bond-and-background-documents",
      "title": "Check Your Indiana Bond and Background Documents",
      "topic": "commission",
      "lede": "Document checks work best before submission. Treat the bond, background report and signature sample as separate requirements, then confirm that their details agree.",
      "paragraphs": [
        "Read the current FAQ beside the application screen. Check the bond’s principal, term and amount, and compare the applicant name with the signature sample. A correct dollar amount does not cure a bond issued to the wrong person or business.",
        "The background report has its own timing requirements. Order it with the intended application date in mind and check the date on the actual report. Older instructional material may describe a different window; use the current system-specific instructions for submission.",
        "An employer may arrange payment for supplies, but that does not transfer the public office. If an upload warning identifies a mismatch, review the underlying documents before disputing the warning or asking for staff review. Do not begin notarial work while an application is pending."
      ]
    },
    {
      "slug": "official-exam-and-practice",
      "title": "Use Indiana Practice Results Without Confusing Them With the Official Exam",
      "topic": "commission",
      "lede": "A practice score can guide study decisions. It cannot replace the course, examination or commission approval administered by the Indiana Secretary of State.",
      "paragraphs": [
        "The official new-system FAQ describes a 30-question examination with 24 correct required. This site’s 30-question mock uses original questions and its own presentation. Matching the question count does not mean that a practice sitting reproduces the official examination.",
        "After a low practice score, review the decisions behind the missed answers. Separate identity questions from certificate errors and employer-pressure scenarios. Repeating the same answer letter without reading the explanation is less useful than explaining why each alternative fails.",
        "After a strong score, follow the official course and application workflow rather than assuming the practice result grants authority. Check the official account for completion and commission status. A downloaded practice result is a study record, not a state appointment certificate."
      ]
    },
    {
      "slug": "identity-before-certification",
      "title": "Check the Indiana Signer Before Certifying the Act",
      "topic": "identification",
      "lede": "Identification concerns the human appearing for the act. The document’s importance, a familiar employer or an urgent deadline cannot establish that person’s identity.",
      "paragraphs": [
        "Begin with the identification method the guide permits for the circumstances. Personal knowledge requires actual familiarity. When relying on a credential, inspect it carefully and compare the person and signature with the record. Possession of someone else’s card does not identify this signer.",
        "A name inconsistency deserves attention before completing the certificate. The guide’s Robert-and-Bob example directs a signature matching the identification and document name. Do not alter the credential or sign the customer’s name yourself to make the paperwork appear consistent.",
        "Imagine a courier offers a card with the right surname but another person’s photograph. The delivery deadline does not resolve the mismatch. Pause the act until its identity requirements are met, and preserve an accurate record of the method actually used."
      ]
    },
    {
      "slug": "acknowledgment-or-oath",
      "title": "Choose the Procedure That Matches an Indiana Acknowledgment or Oath",
      "topic": "notarial-acts",
      "lede": "An acknowledgment and a sworn statement answer different questions. Reading the certificate carefully helps the notary perform the required ceremony instead of merely applying a seal.",
      "paragraphs": [
        "An acknowledgment involves the signer’s free and willing confirmation of execution. A verification on oath or affirmation adds a commitment about the truth of the statement. A signature on paper does not silently administer that commitment.",
        "For a jurat, complete the required appearance, identification, signing and oath or affirmation procedure. If the customer needs help selecting a legal instrument or deciding the transaction’s legal effect, a nonattorney notary should refer that question to an appropriate professional.",
        "Consider a customer who says, I signed this yesterday, but nobody asked whether its contents were true. An acknowledgment and a jurat should not be treated as interchangeable shortcuts. Determine the requested act from the proper instructions and perform its actual steps before completing the certificate."
      ]
    },
    {
      "slug": "correct-a-certificate",
      "title": "Correct an Indiana Certificate Without Hiding the Change",
      "topic": "certificates",
      "lede": "A visible, accurate correction is more useful than a document that only appears untouched. The official guide separates corrections during an act from corrections made afterward.",
      "paragraphs": [
        "During notarization, the guide directs a line through an incorrect entry, the correct information, and the notary’s initials and date. It says not to use whiteout. A smeared stamp has its own instruction: reapply the stamp and initial the original smeared impression.",
        "After the act, the notary remains responsible for the certificate. The guide warns against sending a completed loose certificate for someone else to attach. Return to the actual document and verify the facts before making a correction.",
        "Suppose a customer points out that the venue is wrong. The notary should check where the act occurred and follow the applicable correction procedure. Rewriting the customer’s contract to match the error would confuse a notarial correction with a substantive legal change."
      ]
    },
    {
      "slug": "stolen-or-retired-stamp",
      "title": "Respond to a Stolen or Retired Indiana Stamp",
      "topic": "seals-records",
      "lede": "Stamp security continues after the office closes for the day. Theft and retirement require different responses, but both concern preventing use without the commissioned notary’s authority.",
      "paragraphs": [
        "For a stolen stamping device, the official FAQ directs a police report followed by reporting the fact to the Secretary of State’s Business Services Division. Ordering replacement equipment is a separate action. It does not notify either office about the theft.",
        "When discontinuing notarizing, the guide directs destruction or disfigurement of the stamp to prevent fraudulent use. Do not leave a retired device where a new employee might mistake it for shared office equipment. The commission is personal to the notary.",
        "If a replacement arrives before a theft report is completed, finish the reporting steps. A new device cannot erase impressions made with the stolen one. Keep the official reporting instructions with the commission records so the response does not depend on finding them during an incident."
      ]
    },
    {
      "slug": "journal-that-explains-the-act",
      "title": "Keep an Indiana Journal That Explains What Happened",
      "topic": "seals-records",
      "lede": "The ordinary-notarization journal is a practical memory aid. Study the Indiana guide’s recommendation without importing a different state’s mandatory journal rules.",
      "paragraphs": [
        "Useful entries describe the act, record, appearing signer, identification method, fee and unusual circumstances. Record facts while they are fresh. A journal entry that says only notarized document may not explain how the signer was identified or what ceremony occurred.",
        "The journal and the certificate serve different functions. The certificate accompanies the record and describes the notarial act. The journal preserves the notary’s account for later reference. Writing in one does not excuse missing steps in the other.",
        "For example, a later request asks why a certificate date differs from the document’s drafting date. An accurate entry can help establish when the signer appeared and what occurred. Do not reconstruct certainty from guesswork or add a false entry to make an inconsistent record appear complete."
      ]
    },
    {
      "slug": "employer-and-independent-judgment",
      "title": "Keep Independent Judgment When Notarizing at Work in Indiana",
      "topic": "conflicts-refusal",
      "lede": "An employer can arrange appointments and buy supplies. Those business arrangements do not replace the notary’s personal judgment about authority, identity and the requested act.",
      "paragraphs": [
        "Pressure often appears as a small procedural shortcut: the signer will come tomorrow, a supervisor already checked the card, or the notary can fill in the certificate later. Identify which required fact is still missing before agreeing to the request.",
        "The guide describes civil liability, possible criminal consequences and commission loss for improper performance. The existence of a bond or an employer instruction is not permission to falsify a certificate. A careful refusal should explain the missing safeguard rather than promise a legal outcome.",
        "Imagine a supervisor asks for an acknowledgment while the signer is away. The notary should explain the personal-appearance requirement and arrange a proper act. A sealed blank certificate would create the appearance of compliance without the actual ceremony."
      ]
    },
    {
      "slug": "copy-affidavit-and-apostille",
      "title": "Distinguish Indiana Copy Affidavits, Official Records and Apostilles",
      "topic": "notarial-acts",
      "lede": "Several documents may carry stamps while proving very different things. Begin by asking what the recipient requires and which official or signer can provide that evidence.",
      "paragraphs": [
        "An officially certified vital record comes from the authorized custodian. A signer’s true-copy affidavit is a sworn statement about a copy. Notarizing that affidavit does not appoint the notary as the issuing records office or guarantee that a recipient will accept the substitute.",
        "An apostille or authentication concerns the public official’s signature and authority. The Secretary of State checks the relevant official information; the guide explains that this does not add weight to the underlying document’s contents.",
        "If a foreign agency requests an official marriage certificate with authentication, do not promise that a photocopy plus a notary seal will suffice. Direct the requester to the issuing custodian and the receiving agency’s instructions, then perform only the notarial act actually requested and authorized."
      ]
    }
  ],
  "NC": [
    {
      "slug": "before-your-notary-course",
      "title": "Prepare for a North Carolina Notary Course",
      "topic": "commission",
      "lede": "Use a short diagnostic to organize your reading before class. The official course and examination remain separate from a commercial practice session.",
      "paragraphs": [
        "Start with the Secretary of State’s ordinary-notary information and the current manual. Confirm that the course is the correct traditional-notary course for a first-time applicant. A remote-notary class or general document workshop should not be assumed to satisfy that purpose.",
        "Review identity, appearance and the main notarial acts before moving into certificate details. Write down questions for the instructor when an exception is unclear. The objective is to understand the rule’s conditions, not to memorize a practice score as an official prediction.",
        "After Quick 10, choose one or two weak topics and read their official sources. If the score is strong, continue with the official course path rather than skipping it. Check the provider’s current enrollment instructions directly before committing to a date."
      ]
    },
    {
      "slug": "application-after-class",
      "title": "Organize the North Carolina First Application After Class",
      "topic": "commission",
      "lede": "The application has several stages. Keep course completion, application submission, approval and the oath as distinct events in your checklist.",
      "paragraphs": [
        "Use the current Secretary of State application and instructions. Check the required signatures and instructor information before submission. A saved practice result cannot replace documentation required by the state, and a submitted application is not the same as approval.",
        "After approval, follow the instructions for the oath at the appropriate Register of Deeds. Check the official notice and current forms for the applicable deadlines and documents. Avoid relying on an old saved checklist when the live form gives different instructions.",
        "An applicant may have completed class successfully but still need to finish the appointment process. Before performing an act, verify active authority and completion of the required steps. Keep a record of the state notices and the source pages used for the application."
      ]
    },
    {
      "slug": "identity-and-credible-witness",
      "title": "Separate North Carolina Identity Methods and Witness Roles",
      "topic": "identity",
      "lede": "A credible witness identifies a person. A subscribing witness has a different role in proving execution. Treating everyone present as the same kind of witness can lead to the wrong procedure.",
      "paragraphs": [
        "Begin with the principal and the notarial act. Determine who must appear and whose identity must be established. When using personal knowledge, ask whether the relationship actually satisfies that standard rather than relying on a new introduction.",
        "Study the statutory credible-witness relationships carefully. Showing identification for an unfamiliar person does not automatically make that person personally known to the notary. Adding more unfamiliar witnesses does not repair a missing required relationship.",
        "Suppose a principal brings a coworker whom the notary has never met. The coworker may know the principal well, but that fact alone does not establish every condition of the credible-witness route. Apply each requirement before deciding that identity has been established."
      ]
    },
    {
      "slug": "language-and-disability-access",
      "title": "Distinguish Language Translation From Disability Access in North Carolina",
      "topic": "identity",
      "lede": "Communication is part of a lawful notarial procedure. North Carolina’s rules distinguish foreign-language translation from specified disability-related communication assistance.",
      "paragraphs": [
        "A bilingual relative should not be treated as an automatic substitute for the notary’s direct communication with the principal. Read the current administrative rule and its separate treatment of interpreters, transliterators and captioning services for disability access.",
        "Do not collapse those distinct rules into either a blanket permission or a blanket prohibition. Identify the actual assistance being requested, the applicable rule and the conditions that must be met. The certificate should describe an act that the notary can truthfully perform.",
        "For example, a person requests compliant disability-related captioning. That should be analyzed under the relevant access provisions rather than rejected merely because ordinary foreign-language interpretation is restricted. When the conditions cannot be established, pause and obtain authoritative guidance before proceeding."
      ]
    },
    {
      "slug": "acknowledgment-oath-and-proof",
      "title": "Compare North Carolina Acknowledgments, Oaths and Proofs",
      "topic": "acts",
      "lede": "The document’s business purpose does not determine every notarial step. Learn what the principal or witness must actually communicate for the act being requested.",
      "paragraphs": [
        "For an acknowledgment, focus on execution and the principal’s confirmation. For an oath or affirmation, the required commitment is itself an act; silently reading printed sworn language is not enough. A proof can involve a subscribing witness whose role differs from an identity witness.",
        "Read the certificate alongside the statutory definition and the actual facts. If a customer needs legal advice about which act will meet a recipient’s demand, refer that decision to an appropriate professional. A nonattorney notary should not invent legal authority to solve uncertainty.",
        "A customer may say that any stamp will do, while the certificate calls for a sworn statement. The notary must still perform the required ceremony, establish the appropriate identity and complete an accurate certificate. Convenience does not make the acts interchangeable."
      ]
    },
    {
      "slug": "certificate-review",
      "title": "Review a North Carolina Certificate Before Completing It",
      "topic": "certificates",
      "lede": "A certificate should record the act that occurred. Work through names, venue, dates and the requested procedure before treating the seal as the final check.",
      "paragraphs": [
        "Separate the underlying record from the notarial certificate. The notary’s role is not to rewrite the parties’ agreement. A certificate discrepancy should be evaluated under the rules governing the notarial act and accurate certification.",
        "Match the certificate to the principal or applicable witness and the actual location of the act. Read any proposed correction carefully. A customer’s assurance that a wrong date is harmless does not make a false statement accurate.",
        "Imagine that a prepared certificate names a different signer. The presence of a complete paragraph and a blank seal space does not cure the mismatch. Resolve the certificate facts and requested act before certifying, then keep any journal entry consistent with what actually happened."
      ]
    },
    {
      "slug": "seal-security",
      "title": "Protect a North Carolina Seal During Everyday Office Work",
      "topic": "seals",
      "lede": "Seal security is easiest to lose through routine office habits. Treat the device as part of the individual notary’s responsibilities, rather than a shared stationery supply.",
      "paragraphs": [
        "Keep the seal under the control required by the applicable statute and administrative rules. A coworker’s access to the office does not give that person authority to make impressions in the notary’s name. Separate equipment storage from general access to paper and files.",
        "Check the impression and the certificate together. A clear seal cannot make an unperformed act valid, and a properly performed ceremony still needs accurate documentation. When commission information changes, follow the official requirements instead of improvising a misleading impression.",
        "Consider a supervisor who asks to borrow the seal while the notary is at lunch. The simplest safe arrangement is to schedule the actual act with the commissioned notary present. Loaning the device would confuse possession of equipment with personal official authority."
      ]
    },
    {
      "slug": "fees-and-travel",
      "title": "Plan North Carolina Notarial Fees and Travel Charges Separately",
      "topic": "fees",
      "lede": "Price a notarial service using the rule that applies to the actual act. Travel is a separate issue, and a label on an invoice cannot make an improper charge lawful.",
      "paragraphs": [
        "Identify the number and kind of acts requested before quoting a price. Check the current statutory fee provisions and any separate travel conditions. Do not substitute the number of pages or the customer’s urgency for the lawful pricing unit.",
        "Explain applicable charges before service and retain the required agreement or record where the rules call for one. The application fee paid to obtain a commission is different from a fee charged to a customer for notarial work.",
        "If a customer adds another act after a mobile appointment is arranged, review what changed and explain any lawful additional charge. Do not silently raise the notarial fee because the document became more valuable. Use the official source linked below to check the specific limits."
      ]
    },
    {
      "slug": "journal-and-confidentiality",
      "title": "Use a North Carolina Journal Without Ignoring Confidentiality",
      "topic": "records",
      "lede": "A useful journal describes what happened without becoming an unnecessary archive of a customer’s private documents. Follow the state’s requirements and distinguish recommended practice from mandatory fields.",
      "paragraphs": [
        "Record the facts needed to explain the notarial act and the identity method used. Avoid importing another state’s thumbprint or document-copy rules simply because they sound thorough. More collected data is not automatically a better record.",
        "Consider access and disclosure before handing journal information to an employer or unrelated requester. A public-facing role does not mean every piece of information can be released without applying the relevant rules. Keep stored records secure.",
        "For example, an office asks to keep copies of every identification card for convenience. The notary should check the actual authority and confidentiality limits instead of treating a workplace preference as a state requirement. Use a focused record of the act and consult the current official guidance."
      ]
    },
    {
      "slug": "conflicts-and-refusal",
      "title": "Recognize Conflicts and Explain a North Carolina Refusal",
      "topic": "conflicts",
      "lede": "A refusal should follow the actual legal problem. Identify whether the issue is authority, identity, willingness, a conflict or a prohibited transaction before explaining what must change.",
      "paragraphs": [
        "Study the disqualifying relationships and interests in their statutory context. Do not assume that every relative is always forbidden or that every business transaction is permitted. The actual role, benefit and applicable exception matter.",
        "Keep a conflict separate from a missing safeguard. An absent principal, unresolved identity or coercion does not become acceptable merely because the notary has no financial interest. Passing one requirement does not satisfy all the others.",
        "Imagine a customer offers a larger fee after the notary identifies a prohibited situation. Payment cannot remove the underlying restriction. Explain the specific obstacle without offering unsupported legal advice, and refer the customer to an appropriate source for the transaction’s next steps."
      ]
    }
  ]
} as const;
function build(code:'IN'|'NC'):StateArticle[]{
 const pack=prepPacks[code];
 return outlines[code].map(item=>{
  const cards=pack.cards.filter(card=>card.study===item.topic);
  const card=cards[0];
  return {id:`${code.toLowerCase()}-${item.slug}`,state:code,slug:item.slug,path:`${pack.paths.home}guides/${item.slug}/`,keyword:item.title,intent:'Practical study guidance',title:item.title,description:item.lede,h1:item.title,kicker:`${pack.name} study notes`,lede:item.lede,checked:'2026-11-13',updated:'2026-11-13',
   ledeCta:{href:`${pack.paths.practice}?mode=quick`,label:'Start Free Quick 10',placement:'lede',targetMode:'quick'},
   sections:[...item.paragraphs.map((body,index)=>({heading:['Start with the right distinction','Apply the rule to the facts','Work through the situation'][index],body})),{heading:'Check the official rule',body:card.rule+' '+card.boundary,link:{href:card.sourceUrl,label:card.source,placement:'section' as const,targetMode:'official' as const}}],
   endCta:{href:`${pack.paths.practice}?mode=practice&area=${item.topic}`,label:'Practice This Topic',placement:'end',targetMode:'topic'},
   related:[{href:pack.paths.study,label:'Study Guide'},{href:pack.paths.resources,label:'Official Resources'},{href:pack.paths.pricing,label:'Practice Access'}]};
 });
}
export const inArticles=build('IN');
export const ncArticles=build('NC');
