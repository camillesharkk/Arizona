import type { StateArticle } from '@/lib/state-articles';
import { ctSources, ctPaths, CT_CHECKED_ON } from '@/lib/ct-site';

type Guide = [slug: string, title: string, lede: string, sections: [string, string, string][]];
const guides: Guide[] = [
  ['find-the-rule', 'Finding a Connecticut Notary Rule in the Handbook', 'A useful handbook practice session ends with a rule you can locate again. Begin with the act and the facts that matter to the notary’s decision.', [
    ['Identify the requested act', 'Ask whether the signer is acknowledging execution, swearing to contents or requesting a copy certificate. Those acts require different procedures. A document’s business purpose alone does not identify its notarial act.', 'Manual §§4.2, 4.8–4.11'],
    ['Read the boundary', 'After locating the rule, read the exception or limit. For identity, distinguish personal knowledge, the in-person documentary route and the credible-witness route. For copies, review the excluded document categories before beginning the comparison.', 'Manual §§4.4–4.5, 4.11'],
    ['Apply and check', 'Choose an answer based on the scenario’s actual facts. After submitting, compare every option with the cited rule. Save the missed rule and practice another situation that requires the same decision.', 'Manual §§4.2–4.18'],
  ]],
  ['in-person-identity', 'Preparing for an In-Person Identity Check', 'Identity evidence is evaluated for the person appearing before the notary. Prepare for the authorized route you will actually use.', [
    ['Documentary evidence', 'For an unfamiliar in-person signer, the documentary route calls for at least two documents with the individual’s signature. At least one must also contain a photograph or physical description. The manual excludes Social Security cards and birth certificates as identification.', 'Manual §4.4; C.G.S. §3-94a(10)'],
    ['Personal knowledge and witnesses', 'Genuine personal knowledge can establish identity. The ordinary in-person credible witness must personally know the signer and be personally known to the notary, and must take an oath or affirmation. A new introduction does not establish those relationships.', 'Manual §§4.4–4.5'],
    ['Keep the ceremony', 'A strong identity basis does not remove appearance, voluntary acknowledgment or an oath required by the act. Document the identity method in the journal if you maintain one. Resolve deficiencies before certifying the act.', 'Manual §§4.2, 4.9, 4.18'],
  ]],
  ['acknowledgment-and-jurat', 'Working Through an Acknowledgment or Jurat', 'The certificate describes an act the notary performs. Its wording helps identify the ceremony that must actually occur.', [
    ['Acknowledging execution', 'The identified signer appears and admits voluntarily signing for the document’s stated purpose. Under the specific acknowledgment rule in section 4.2, the signature may have been placed earlier. The signature date cannot be later than notarization.', 'Manual §4.2; C.G.S. §3-94a(1)'],
    ['Taking the sworn statement', 'For a jurat, the identified signer signs voluntarily in the notary’s presence and takes an oath or affirmation about the signed document’s truth. Reading the printed words silently does not administer the oath.', 'Manual §§4.8–4.9; C.G.S. §3-94a(3)'],
    ['Resolve uncertainty', 'If a request and certificate conflict, obtain direction before proceeding. A nonattorney notary may explain procedures and should refer legal questions about the proper instrument or legal effect to qualified counsel.', 'Manual Appendix A, assistance with legal forms'],
  ]],
  ['certificate-check', 'Checking a Connecticut Notarial Certificate', 'An accurate certificate makes the completed act understandable to its recipient. Check its facts before returning the document.', [
    ['Match the actual act', 'Use the certificate appropriate to the acknowledgment, jurat or other authorized act performed. A seal on a blank page does not record the ceremony. Resolve missing signer and act information while the relevant facts can be confirmed.', 'Manual §§4.2, 4.9'],
    ['Location and date', 'Use the place where the act occurs. An in-person act’s date is the actual notarial date even when an acknowledgment concerns an earlier signature. A filing deadline does not authorize backdating. Remote acts have the specific date rule in section 3-95b(e).', 'Manual §4.2; C.G.S. §3-95b(e)'],
    ['Signature and identification', 'Sign the notary’s own original signature in the appointment name. Supply expiration and office information as required by section 3-94k. A seal or signature stamp does not replace the required original signature.', 'Manual §§4.12–4.13; C.G.S. §§3-94i–3-94k'],
  ]],
  ['copies-and-records', 'Handling a Request to Certify a Copy', 'A customer’s request for an “official copy” first requires an authority check. Determine what document is presented and what the recipient requires.', [
    ['Check exclusions', 'Connecticut excludes vital records, documents required to be recorded by governmental officials and specified federally restricted documents from notarial copy certification. Direct customers to the official custodian when an official certified record is required.', 'Manual §4.11; C.G.S. §3-94a(2)'],
    ['Compare an eligible original', 'For an eligible document, the notary makes or supervises the copy and compares it with the original. A missing page or paragraph prevents a truthful complete-copy certificate. Comparing two photocopies does not supply the original.', 'Manual §4.11'],
    ['Identify a different sworn act', 'A custodian may make a sworn copy-accuracy statement using the manual’s attestation procedure. The notary executes a jurat for that person’s statement. The receiving agency decides whether that statement meets its filing requirements.', 'Manual §4.11.1'],
  ]],
  ['journal-and-seal', 'Building a Connecticut Journal and Seal Routine', 'Connecticut’s manual strongly recommends a journal and permits an ordinary notary to choose whether to use a seal. Each safeguard has a defined role.', [
    ['Useful records', 'A recommended bound journal records the act date and time, type, document description, signer details and signature, identity method, fee and place. Contemporary entries can help explain proper procedure months later.', 'Manual §4.18'],
    ['Optional equipment', 'If using a seal, match the appointment name and required wording. Place the impression near the signature without covering it. Supply commission-expiration information in the permitted form. Complete the certificate and original signature for every act requiring them.', 'Manual §§4.12–4.13; C.G.S. §3-94k'],
    ['Personal control', 'The seal remains the named notary’s property even when an employer pays. Coworkers cannot use it. Follow the manual’s reporting process for loss or theft, and destroy or deface the seal when the appointment ends as the law directs.', 'Manual §4.14; C.G.S. §3-94j'],
  ]],
  ['current-fees', 'Applying Connecticut’s 2026 Fee Amendment', 'Use the law effective for the act date. The current licensing page and updated manual reflect the July 1, 2026 fee change.', [
    ['Act fee', 'P.A. 26-81 section 13 raises the maximum ordinary notarial-act fee to $10. The maximum limits what can be charged. It does not require charging the maximum or charging every customer.', 'C.G.S. §3-95 as amended by P.A. 26-81 §13'],
    ['Mileage', 'The current mileage ceiling follows the IRS business standard mileage rate. Check the applicable rate when calculating travel. The former fixed $0.35 amount is superseded, so an old handout can produce an incorrect charge.', 'P.A. 26-81 §13; Manual §5.8'],
    ['Different transactions', 'The $120 first-application fee and the manual’s $20 appointment-recording fee belong to separate transactions. Do not use those amounts as the fee for an ordinary act. Review specific exemptions when they apply.', 'Manual §§2.1, 3.2, 5.8'],
  ]],
  ['impartial-service', 'Making an Impartial Service Decision', 'A notary checks the request against authority, identity and the act’s requirements while maintaining the public office’s impartial role.', [
    ['Check personal involvement', 'A signatory of the document is disqualified. The manual separately urges great caution for family and beneficial-interest transactions and recognizes voluntary disqualification. Check actual roles before concluding that a transaction is suitable.', 'Manual §4.16; C.G.S. §3-94g'],
    ['Evaluate a refusal', 'The law prohibits unreasonable refusal of lawful transactions when requirements are met and the statutory fee is tendered. Genuine identity, competence and fraud concerns require attention. The Secretary evaluates reasonableness case by case.', 'Manual §§4.2.1, 4.3, 4.17; C.G.S. §3-94f'],
    ['Refuse deception', 'An employer’s pressure or a customer’s consent cannot authorize a false appearance or oath certificate. Avoid using the title or seal for product endorsements. Refer legal advice requests to properly qualified professionals.', 'C.G.S. §§3-94h, 3-95a'],
  ]],
  ['remote-paper-workflow', 'Following Connecticut’s Remote Paper Workflow', 'Eligible remote acts require a live interaction and an original paper record. Check the whole procedure before accepting the assignment.', [
    ['Location and identity', 'The notary stays physically in Connecticut. Communication technology generally supplies simultaneous sight and sound with applicable accommodation. Identify the signer through a method authorized by section 3-95b, including the remote-specific current government-ID option.', 'Manual §§4.20–4.22; C.G.S. §3-95b(b)'],
    ['Original record and certificate', 'The signer signs while connected and delivers the signed original to the notary. The remote notarization’s date and time are those of the technology-witnessed signing. The certificate describes appearance through communication technology.', 'Manual §4.23; C.G.S. §3-95b(d)–(e)'],
    ['Restrictions and records', 'Check the statutory excluded categories, including wills, powers of attorney, health-care instruments and real-estate closings. The manual strongly recommends a remote recording for at least ten years. Remote service remains optional.', 'Manual §4.24 and Appendix A; C.G.S. §3-95b(i)'],
  ]],
  ['maintaining-appointment', 'Maintaining a Connecticut Notary Appointment', 'The appointment, official name and qualifying Connecticut connection need attention throughout the term.', [
    ['Track authority', 'The ordinary term ends five years later on the last day of the appointment month, subject to earlier ending events. Stop acting during a lapse. A submitted renewal and a missing reminder do not extend authority.', 'Manual §§3.1, 3.4; C.G.S. §3-94c'],
    ['Report changes', 'Use the current eLicense process to report name and address changes within the required period. A name transition follows issuance of the replacement certificate. Review applicable town-recording requirements and obtain matching equipment if using a seal.', 'Manual §3.5; C.G.S. §§3-94n–3-94o'],
    ['Keep the Connecticut connection', 'A notary must maintain Connecticut residence or a principal Connecticut business. If neither continues, resign as the statute directs. Keep official correspondence and the appointment certificate accessible so dates and identity remain verifiable.', 'Manual §3.6; C.G.S. §3-94p'],
  ]],
];

export const ctArticles: StateArticle[] = guides.map(([slug, title, lede, sections]) => ({
  id: `ct-guide-${slug}`, state: 'CT', slug, path: `/connecticut/guides/${slug}/`, keyword: title,
  intent: lede, title, description: lede, h1: title, kicker: 'Connecticut handbook practice', lede,
  checked: `Official sources checked ${CT_CHECKED_ON}. Manual Rev. 2026-1.`, updated: CT_CHECKED_ON,
  ledeCta: { href: `${ctPaths.practice}?mode=quick`, label: 'Practice With the Handbook', placement: 'lede', targetMode: 'quick' },
  sections: sections.map(([heading, body, reference]) => ({ heading, body, link: { href: slug === 'current-fees' ? ctSources.feeAct : ctSources.manual, label: reference, placement: 'section', targetMode: 'official' } })),
  endCta: { href: ctPaths.studyCards, label: 'Review Connecticut Rule Cards', placement: 'end', targetMode: 'guide' },
  related: [{ href: ctPaths.become, label: 'First Application Checklist' }, { href: ctPaths.resources, label: 'Official Sources' }],
}));
