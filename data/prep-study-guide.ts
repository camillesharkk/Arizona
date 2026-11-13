import type { PrepCode } from "../lib/prep-navigation.ts";

export type PrepGuideTopic = {
  summary: string;
  sections?: { heading: string; body: string }[];
  example: { heading: string; body: string };
  keyFacts: string[];
};

/** Chapter introductions and worked scenarios complement the reviewed concept explanations. */
export const prepGuideTopics: Partial<Record<PrepCode, Record<string, PrepGuideTopic>>> = {
  NY: {
    "exam-day": {
      summary: "Prepare for the written examination, recognize the limits of a practice result, and keep professional-conduct rules in your study routine.",
      sections: [
        { heading: "Build a study sequence", body: "Read the Department of State License Law booklet before drilling questions. Start with appointment and authority, then compare acknowledgments, affidavits, oaths and affirmations. Work through the journal and electronic-notary rules separately. When reviewing a question, explain the rule and why each alternative fails. Revisit an uncertain correct answer alongside your mistakes." },
        { heading: "Official examination and site practice", body: "The current Department bulletin describes a multiple-choice examination with one hour after instructions. It reports results as passed or failed and leaves the item count and numerical passing threshold unspecified. This site's 40-question, 60-minute full practice and Quick 10 study target are preparation settings. Check the Department's current schedule and your location's admission arrangements before traveling." },
      ],
      example: { heading: "Worked example — a practice percentage", body: "Maya gets 28 of 40 questions right in this site's practice and calls it an official passing score. The Department bulletin does not publish that numerical rule. She should use the missed topics to plan review, follow the official admission instructions, and wait for the Department's actual pass-or-fail notice. A practice result also does not grant a commission." },
      keyFacts: ["Official examination time is one hour after instructions.", "A passing examination result is valid for two years.", "The site's 40-question practice is a study setting."],
    },
    appointment: {
      summary: "Follow qualification, appointment, statewide authority and certificate requirements through the whole commission term.",
      sections: [
        { heading: "Application and active authority", body: "Executive Law §§130 and 131 govern appointment and the four-year commission. Establish the required New York residence or office/business connection, satisfy examination or exemption requirements, complete the oath and application, and wait for appointment. Keep the commission information and actual venue accurate when completing a certificate. A purchase, examination pass or submitted application does not authorize immediate work." },
        { heading: "Identity and the act requested", body: "An acknowledgment concerns the person's acknowledgment of executing the instrument. An affidavit requires an actual oath or affirmation about its statements. Real Property Law §303 requires personal knowledge or satisfactory identity evidence for an acknowledgment. Apply Part 182.5 to the appearance and identity method being used. The signer must participate in the required procedure, and a certificate must describe what actually occurred." },
      ],
      example: { heading: "Worked example — the office closes", body: "Jordan lives in New Jersey and holds a New York commission through a New York business office. The office closes, and Jordan has no remaining New York office or business connection. Under Executive Law §130, that nonresident connection is a continuing condition. An expiration date still printed on the card does not preserve the office after the qualifying connection ends." },
      keyFacts: ["A New York commission lasts four years.", "The county of original qualification differs from the venue of a particular act.", "Check both authority and the transaction's required notarial procedure."],
    },
    fees: {
      summary: "Identify the particular service before choosing a fee. Application, notarial-act and county-clerk charges have separate rules.",
      sections: [
        { heading: "Choose the correct fee category", body: "Executive Law §136 sets $2 for the specified traditional oaths, affirmations, acknowledgments and proofs, subject to applicable statutory exceptions. Section 135 separately addresses protests. An electronic notarial act and a paper certificate of authenticity have their own fee rules. Count the service actually performed and consult the governing provision before quoting the charge." },
        { heading: "Keep filing charges separate", body: "The Department's application, examination and personal-information-change fees pay for licensing services. County-clerk certifications are another service. A customer paying one of those charges has not paid a universal fee for any later notarial act. Identify which office performs the service and what certificate or filing the customer needs." },
      ],
      example: { heading: "Worked example — papering out", body: "A registered electronic notary has completed an electronic act. The customer later requests its permitted paper certificate of authenticity. The Department states a $2 fee for that certificate. The notary should identify the papering-out service and apply its fee rule, even though an electronic notarial act can carry a different maximum." },
      keyFacts: ["The specified traditional acts generally have a $2 fee under §136.", "An electronic act may carry up to $25 under Part 182.", "Papering out carries the Department's stated $2 fee."],
    },
    journal: {
      summary: "Create the required record for each act and preserve the information needed to reconstruct identity verification and services.",
      sections: [
        { heading: "Record the actual procedure", body: "Part 182.9 and the Department FAQ require records for traditional and electronic acts. Record the date, approximate time, act type, name and address, number and type of services, identity credential or applicable witness information, and verification procedures. A familiar customer still receives the required record. Check the complete rule for the particular identification method." },
        { heading: "Retention and electronic evidence", body: "The Department states ten-year retention. An electronic act also needs its prescribed technology information and audio-video record, with the required backup. The written journal and recording serve distinct purposes. Arrange storage that keeps both accessible for the required period, including after an account or technology provider changes." },
      ],
      example: { heading: "Worked example — a regular customer", body: "A repeat customer says that the notary already knows their name and asks to omit the journal entry. Familiarity does not remove Part 182.9 recordkeeping. The notary records the actual act, its timing, services and identity procedure. If the act is electronic, the required recording and technology details must also be retained." },
      keyFacts: ["Traditional in-person notaries also keep a journal.", "The Department states ten-year retention.", "An electronic recording supplements the required journal."],
    },
    electronic: {
      summary: "Register for electronic authority, verify the remote signer through an allowed method, and preserve the electronic record and recording.",
      sections: [
        { heading: "Authority before technology", body: "Executive Law §135-c and Part 182 govern electronic notarization. The notary must first register the electronic capability and be physically in New York while performing the act. Select technology that supports the applicable identity, security, signature, record and recording requirements. A familiar video application alone does not establish compliance." },
        { heading: "Complete the whole remote act", body: "Use an authorized identity method and interact with the signer in real time by sight and sound. Confirm the record before the notary is the one the signer executed. Apply the required electronic signature and certificate wording, including the communication-technology statement. Retain the journal, recording and backup. A signer outside the United States also requires the statutory United States connection." },
      ],
      example: { heading: "Worked example — working while traveling", body: "An electronic notary registered in New York travels to Pennsylvania and receives a remote request from a New York customer. The customer's location does not satisfy the notary-location requirement. The electronic notary must be physically in New York when performing the act, so the requested session cannot proceed from Pennsylvania under that New York authority." },
      keyFacts: ["The electronic notary must be physically in New York.", "Electronic authority requires registration and compliant procedures.", "Remote ink notarization ended after January 31, 2023."],
    },
  },
  PA: {
    eligibility: {
      summary: "Check every statutory qualification and maintain the Pennsylvania connection that supports the appointment.",
      sections: [{ heading: "Apply the qualifications together", body: "Under 57 Pa.C.S. §321, an applicant must meet the age, citizenship or permanent-residence, English-language, Pennsylvania connection, character, education and applicable examination requirements. Complete the Department's application using an allowed commissioned name. A nonresident's place of employment or practice must satisfy the applicable office requirements. Passing the examination does not replace a missing qualification." }],
      example: { heading: "Worked example — a mailing address", body: "A New Jersey resident rents a Pennsylvania mailbox and assumes that the address qualifies as a place of practice. Section 321 and 4 Pa. Code §167.11 require the actual Pennsylvania connection and applicable ongoing-office conditions. The applicant must establish that connection, then satisfy the remaining qualifications before appointment." },
      keyFacts: ["Applicants must be at least 18.", "Pennsylvania residence, employment or practice supplies the required state connection.", "Each qualification must be satisfied independently."],
    },
    "education-exam": {
      summary: "Plan the education window, examination and renewal dates separately so an expired commission does not interrupt authority.",
      sections: [{ heading: "Education and examination sequence", body: "New and renewing applicants complete three hours of approved education within the six months before application. First-time applicants and applicants whose prior commission has expired must satisfy the examination requirement. Pearson's current bulletin describes 30 items in 60 minutes, including five unscored items, and a scaled passing score of 75. A raw practice percentage does not calculate the official scaled result." }],
      example: { heading: "Worked example — renewal arrives late", body: "Casey completes education and mails a renewal, but the Department receives it after the commission expires. Under the current regulations, that lapse brings the examination requirement back. Course completion alone does not preserve continuous authority. Casey must follow the applicable lapsed-commission process before resuming work." },
      keyFacts: ["Approved education totals three hours within six months before application.", "A lapsed commission brings the examination requirement back.", "Official passing uses a scaled score of 75."],
    },
    "bond-oath": {
      summary: "Complete the bond, oath and county registrations within the appointment deadline and keep the required bond valid throughout the term.",
      sections: [{ heading: "Finish commissioning before working", body: "Follow the Department's appointment notice for the required $25,000 bond for new and reappointed notaries on or after March 28, 2026, oath, recording and official-signature registration. A notary already commissioned on March 28, 2026 may keep the existing bond until that commission expires. The initial recording and registration steps have a 45-day appointment window. A valid required bond must remain on file during the term. A later office move to another county has its own reporting and signature-registration requirements." }],
      example: { heading: "Worked example — the stamp arrives first", body: "An appointee receives a new stamp before completing the bond and county filing steps. A customer requests an immediate notarization. The stamp does not complete commissioning. The appointee should finish the required oath, bond, recording and registration within the stated deadline before exercising the commission." },
      keyFacts: ["New and reappointed notaries obtain a $25,000 bond under the 2026 rule.", "Initial county completion has a 45-day window.", "A valid bond must remain on file for the commission term."],
    },
    identity: {
      summary: "Establish personal appearance, identity and voluntary participation through the statutory method that actually fits the signer.",
      sections: [{ heading: "Resolve identity before certifying", body: "Use personal knowledge or an allowed satisfactory-evidence route under §307 and §167.43. Read the conditions for the particular credential or credible witness. A current card alone does not resolve a mismatch in the person's appearance or doubts about capacity and willingness. In-person and authorized remote procedures have their own appearance conditions." }],
      example: { heading: "Worked example — a friend as witness", body: "A signer brings a friend who knows the signer but has never met the notary. The friend proposes to show a driver's license and serve as the ordinary credible witness. Section 167.43(b) requires the specified personal-knowledge connections, appearance, lack of interest and sworn verification. The notary must use a qualifying identity route before proceeding." },
      keyFacts: ["Check the conditions for the precise identity method.", "Capacity and voluntary signing remain part of the decision.", "A credible witness has specific knowledge and disinterest requirements."],
    },
    acts: {
      summary: "Distinguish acknowledgments, verifications, signature witnessing and copy certification before completing the matching certificate.",
      sections: [{ heading: "Let the act determine the procedure", body: "An acknowledgment may address a signature made earlier when the signer acknowledges it as their own under the applicable rule. A verification requires the individual to sign in the notary's presence and swear or affirm the truth of the statement. Signature witnessing requires signing in the notary's presence. Copy certification requires the permitted comparison and screening for excluded records. Complete the certificate contemporaneously with the act." }],
      example: { heading: "Worked example — a pre-signed verification", body: "A signer brings a statement signed yesterday with a verification certificate. The notary cannot simply use the acknowledgment signing rule. For the verification, the individual must sign in the notary's presence and make the oath or affirmation as §167.63 requires. Complete the requested lawful procedure and a certificate that accurately records it." },
      keyFacts: ["A verification includes a present oath or affirmation.", "Certificate venue follows where the act occurs.", "Screen copy certifications for excluded records."],
    },
    journal: {
      summary: "Make a separate contemporaneous entry, protect restricted identifiers and handle access and custody under the journal rules.",
      sections: [{ heading: "A complete entry for every act", body: "Section 319 and Chapter 167 govern journal format, required fields, custody and access. Paper journals require permanent binding and consecutive preprinted page and entry numbers. Record the actual identity evidence and fee, including a no-charge notation when waived. Observe restrictions on sensitive identifiers. A free act or repeat customer still requires a complete record." }],
      example: { heading: "Worked example — collecting too much ID", body: "An employer proposes scanning every customer's full driver's-license number into the journal. Pennsylvania's journal rules restrict the identifiers that may be recorded. The notary should record the required credential description and permitted details, protect the journal, and avoid prohibited full numbers or Social Security-number parts." },
      keyFacts: ["Each act needs a separate complete entry.", "A waived fee still receives a no-charge notation.", "Protect the journal and follow the statutory access procedure."],
    },
    fees: {
      summary: "Use the correct statutory unit, distinguish technology and related charges, and provide the required itemized receipt.",
      sections: [{ heading: "Calculate the particular act", body: "Section 167.3 sets ordinary notarial maxima and the additional fee for qualifying electronic or remote acts. An acknowledgment is $5 for the first name and $2 for each additional name. Other acts use their prescribed individual, signature, copy or page units. A qualifying technology fee may add up to $20 per act. Apply the related-charge rules and itemize charged notarial, technology and applicable related services." }],
      example: { heading: "Worked example — fee waived, travel charged", body: "A mobile notary waives the notarial-act fee but charges an agreed travel fee. Because fees related to the notarization were charged, the itemized-receipt requirement still applies. The notary should identify the waived act fee and charged travel service under the applicable rules." },
      keyFacts: ["Use the fee unit for the actual act.", "The qualifying technology addition is up to $20 per act.", "Charged related services require an itemized receipt."],
    },
    remote: {
      summary: "Follow Pennsylvania's electronic and remote authorization, identity, record and certificate requirements before using communication technology.",
      sections: [{ heading: "Technology supports the statutory act", body: "Section 306.1 requires an allowed remote-identity route, reasonable certainty about the record being signed, and the required audio-visual evidence. Follow the Department notification and technology-provider process. The notary remains physically in Pennsylvania. A signer outside the United States triggers additional statutory connection and local-law conditions. Include the required communication-technology certificate statement." }],
      example: { heading: "Worked example — the wrong record", body: "A remote signer's identity checks succeed, but the document visible to the notary differs from the record the signer says they signed. Identity verification alone does not resolve that discrepancy. The notary must establish the statutory reasonable certainty about the actual record before completing the act." },
      keyFacts: ["The notary remains physically in Pennsylvania.", "Verify both the person and the record.", "A signer abroad triggers additional statutory conditions."],
    },
    stamp: {
      summary: "Keep the official stamp under the commissioned notary's control and pair a legible impression with a truthful certificate.",
      sections: [{ heading: "Custody and legibility", body: "The stamp identifies the commissioned officer and must contain the required information. Keep the stamping device secure, use the commissioned name, and follow the rules for loss, theft and end-of-commission handling. An employer's purchase does not transfer control. A readable impression must accompany a properly completed certificate for the act actually performed." }],
      example: { heading: "Worked example — a coworker borrows the stamp", body: "A coworker offers to stamp completed papers while the notary is away. The stamping device belongs under the notary's required control. The notary must perform the actual act and complete its certificate personally. Lending the device does not delegate the commission." },
      keyFacts: ["Keep the stamping device secure.", "Use the commissioned identifying information.", "A stamp impression accompanies the required notarial procedure."],
    },
    prohibited: {
      summary: "Recognize conflicts, unauthorized legal services, false certificates and reportable changes before a deadline creates pressure to proceed.",
      sections: [{ heading: "Authority has continuing limits", body: "RULONA and Chapter 167 govern disqualifying interests, unauthorized services and truthful certificates. A notary may not certify their own signature or bypass the applicable interest rules. Stay within the authority held when a customer requests document selection or legal advice. Report changes and disciplinary events through the required process and within the applicable deadline." }],
      example: { heading: "Worked example — yesterday's date", body: "A customer signed yesterday and asks the notary to use yesterday's certificate date to meet a filing deadline. The certificate must report the act actually performed and its actual timing. The notary should complete any lawful current act accurately, and refer the customer's filing problem to the appropriate recipient or adviser." },
      keyFacts: ["Apply the conflict rules before proceeding.", "Certificates must reflect the actual act.", "Information changes have their own reporting deadlines."],
    },
  },
  LA: {
    qualify: {
      summary: "Establish eligibility and obtain approval before following the nonlawyer assessment and examination sequence.",
      sections: [{ heading: "Work through the official application", body: "Begin with the Secretary of State Application to Qualify and its current instructions. Louisiana attorney status has its specified examination exemption. An out-of-state commission does not transfer into Louisiana. Allow time for qualification approval, the mandatory nonlawyer pre-assessment and examination registration, each with its own deadline." }],
      example: { heading: "Worked example — another state's commission", body: "A Texas notary moves to Louisiana and expects to exchange the existing commission for a Louisiana one. The Secretary of State says commissions do not transfer. The applicant must establish Louisiana eligibility and follow the applicable qualification, assessment, examination and commissioning steps." },
      keyFacts: ["Start with an approved Application to Qualify.", "Another state's commission does not transfer.", "Louisiana attorney status has its specified examination exemption."],
    },
    preassessment: {
      summary: "Use the reading assessment to plan preparation and keep its result distinct from the statewide examination and commission.",
      sections: [
        { heading: "Assessment and registration", body: "The pre-assessment is mandatory once for nonlawyer applicants. It evaluates reading comprehension and does not impose a passing threshold that prevents examination registration. Follow the current Secretary of State deadlines and allow for approval and score transmission. Examination registration remains a separate action." },
        { heading: "Official guide and practice settings", body: "The Secretary of State describes a four-hour computer examination with a scaled passing score of 70 out of 100 and the permitted 2026 official study guide. The official item count is unspecified. This site's 40-question, 90-minute scenario practice provides raw study feedback. Use the official guide for full examination preparation and its current admission rules." },
      ],
      example: { heading: "Worked example — a low assessment level", body: "An applicant receives a low reading-assessment level and assumes registration is prohibited. The Secretary of State says the assessment result does not prevent taking the examination. The applicant should use that feedback to plan reading practice, then complete the separate registration process by its deadline." },
      keyFacts: ["Nonlawyers complete the pre-assessment once.", "The official examination uses a scaled passing score of 70.", "The site's 40-question scenario practice is a study setting."],
    },
    bond: {
      summary: "Complete commissioning and keep bond obligations current throughout the life of the commission.",
      sections: [{ heading: "Maintain active commissioning requirements", body: "The Secretary of State describes a lifetime commission and a $50,000 bond requirement. A surety bond renews every five years, while a personal surety has its specified termination conditions. Follow the current instructions for the oath, bond, signature and commission filings. Maintain required records and reports after appointment." }],
      example: { heading: "Worked example — lifetime commission, expiring bond", body: "A commissioned notary sees the surety bond approaching its five-year renewal date and assumes a lifetime commission removes the need to renew it. Commission duration and bond maintenance are separate requirements. The notary must keep the required bond current and follow the Secretary of State filing instructions." },
      keyFacts: ["Louisiana commissions are for life.", "The required bond amount is $50,000.", "A surety bond renews every five years."],
    },
    parish: {
      summary: "Determine the notary's actual territorial authority and update the commission when residence changes.",
      sections: [{ heading: "Check the authority held", body: "Read the Secretary of State guidance for the notary's parish commission, reciprocal authority and any qualifying statewide authority. A reciprocal practice arrangement does not eliminate the residence-parish commission requirement. When moving, complete the applicable transfer and filing process before assuming the previous commission details still fit." }],
      example: { heading: "Worked example — moving to a reciprocal parish", body: "A notary regularly works in a reciprocal parish, then moves there permanently. The notary assumes the reciprocity arrangement makes a transfer unnecessary. The Secretary of State says the commission must still be changed to the new parish of residence. Practice authority and residence administration need separate attention." },
      keyFacts: ["Check the individual notary's territorial authority.", "Reciprocity does not remove residence-parish administration.", "Complete the applicable transfer process after a move."],
    },
    acts: {
      summary: "Distinguish an authentic act from an act under private signature and evaluate the formalities and evidence separately.",
      sections: [{ heading: "Begin with the required form", body: "Civil Code article 1833 describes an authentic writing executed before the authorized officer and two witnesses with the required signatures. It permits the specified separate execution arrangements. Articles 1834 through 1837 address other evidentiary and private-signature consequences. A failure of authentic form requires analysis under those rules and the transaction's own form requirement." }],
      example: { heading: "Worked example — a missing witness", body: "A writing intended as an authentic act has only one witness for a party's execution. Article 1833's two-witness requirement has not been met for that execution. Before assuming the writing has no possible effect, analyze article 1834 and the transaction's required form. A transaction that itself requires authentic form needs that additional scrutiny." },
      keyFacts: ["Authentic form includes the article 1833 execution requirements.", "Each party's execution must meet the applicable formalities.", "Analyze form and evidentiary consequences separately."],
    },
    donations: {
      summary: "Check donative intent, present divestment, required form and acceptance, then consider the limits that protect heirs and donors.",
      sections: [{ heading: "Trace the donation from donor to donee", body: "The Civil Code distinguishes a donation inter vivos from a donation mortis causa. Identify the property and the donor's present intent, apply the required form and acceptance rules, and examine applicable exceptions. Capacity, reserved benefits, forced-heirship and reduction questions need their own analysis. Use the particular article before treating every gift alike." }],
      example: { heading: "Worked example — a promised future gift", body: "A donor signs a paper saying a house may be given to a relative later while keeping the decision entirely open. Before treating this as a completed donation inter vivos, examine article 1468's present and irrevocable divestment requirement and the immovable donation's form and acceptance rules. A future intention alone does not complete those steps." },
      keyFacts: ["Identify whether the transfer is inter vivos or mortis causa.", "Apply the property's donation form and acceptance rules.", "Check capacity and forced-heirship issues separately."],
    },
    testaments: {
      summary: "Apply the current testament form, execution and witness requirements, and evaluate capacity separately.",
      sections: [{ heading: "Match the form to the testator", body: "Louisiana recognizes the Code's testament forms and imposes specific formalities. An olographic testament and a notarial testament have different writing and execution requirements. Current article 1576 requires a written, dated testament executed before a notary and two witnesses, with the prescribed signatures. If the testator cannot sign, the article permits a mark or a directed signature under its conditions. The 2025 revision replaced the former special-form framework. Examine the current article and witness qualifications together. Capacity and revocation remain separate questions." }],
      example: { heading: "Worked example — a typed olographic will", body: "A customer types a will, signs it and calls it olographic. Article 1575 requires the olographic testament to be entirely written, dated and signed in the testator's handwriting. A typed document does not satisfy that route. Consider the applicable lawful testament form and its complete execution requirements." },
      keyFacts: ["An olographic testament requires the testator's handwriting.", "Current article 1576 governs notarial testament form after the 2025 revision.", "Capacity and execution formalities each require attention."],
    },
    mandates: {
      summary: "Read the scope and required form of authority before an agent signs, and distinguish representation from a surety's undertaking.",
      sections: [{ heading: "Authority must cover the particular act", body: "A mandate authorizes another to transact affairs for the principal. The Code gives some powers only through express authority and can require a form matching the contemplated act. Read the instrument for the precise transaction and any limits. Suretyship is a separate undertaking with its own express and written requirements. A signature as representative does not automatically create every power or a personal guarantee." }],
      example: { heading: "Worked example — a broad management clause", body: "An agent presents a mandate authorizing general management and proposes to donate the principal's property. Article 2997 lists transactions needing express authority, including donation inter vivos. The agent and recipient must resolve the missing transaction-specific authority and required form before relying on the general clause." },
      keyFacts: ["Read the authority for the specific transaction.", "Some transactions require express authority under article 2997.", "Suretyship has its own express and written requirements."],
    },
    property: {
      summary: "Separate ownership, usufruct, co-ownership and servitudes to identify which right a party can transfer or burden.",
      sections: [{ heading: "Identify the right being exercised", body: "Ownership includes the Code's rights to use, enjoy and dispose, within legal limits. Usufruct separates use and enjoyment from naked ownership and applies different duties to consumable and nonconsumable things. Co-owners have undivided interests with rules governing use and management. Predial servitudes involve estates and their utility. Identify each legal relationship before selecting the controlling article." }],
      example: { heading: "Worked example — usufruct of a home", body: "A usufructuary of a house assumes the right to use it includes unrestricted authority to sell full ownership. The Code separates usufruct from naked ownership. Read the instrument and applicable rules for the nonconsumable property and the proposed disposition before treating the usufructuary as the sole full owner." },
      keyFacts: ["Identify the precise property right.", "Usufruct differs from naked ownership.", "Co-ownership and predial servitudes have distinct rules."],
    },
    matrimonial: {
      summary: "Classify the property and identify management or concurrence requirements before spouses transfer, donate or encumber it.",
      sections: [{ heading: "Classification comes before signatures", body: "The Civil Code distinguishes community and separate property and supplies classification presumptions. Acquisition timing alone may not settle every case. Trace the property's source and applicable rule, then check who may manage it and which transactions require both spouses' concurrence. The signature authority question follows that classification." }],
      example: { heading: "Worked example — one spouse's signature", body: "One spouse proposes to sell community immovable property alone because only that spouse negotiated the deal. Article 2347 requires concurrence for the listed transactions involving community property. Establish classification and the applicable authority before treating one negotiated signature as sufficient." },
      keyFacts: ["Classify the asset as community or separate.", "Trace the source and governing presumption.", "Check concurrence for the particular transaction."],
    },
    sales: {
      summary: "Check the thing, price, consent and required form, then distinguish a completed sale from a promise, option or right of first refusal.",
      sections: [{ heading: "Read the transaction the parties made", body: "A sale transfers ownership for a price in money under article 2439. Identify the thing, price and consent, then apply the required form for the property. A bilateral promise, option and right of first refusal create different obligations and do not share every effect of a completed sale. Third-person effects and recordation require a separate public-records analysis." }],
      example: { heading: "Worked example — an option becomes a deed", body: "A buyer holds an option to purchase and assumes the signed option already transferred the house. The Code distinguishes the option's contractual rights from a completed sale and its required form. Review exercise of the option and the documents needed for the resulting transaction before recording a claim of ownership." },
      keyFacts: ["A sale requires the thing, price and consent.", "Immovable transfers have writing and form requirements.", "Options and promises have distinct legal effects."],
    },
    mortgages: {
      summary: "Identify the secured obligation, affected property, required form and registry effects before relying on a mortgage instrument.",
      sections: [{ heading: "Security and the underlying obligation", body: "A mortgage secures an obligation through the property described by the governing rules. It is accessory to the obligation and generally indivisible. A conventional mortgage needs its required written form and property identification. Authority to grant the security and its effect against third persons require separate review, including the applicable recordation rules." }],
      example: { heading: "Worked example — partial payment", body: "A debtor pays half the secured balance and assumes half the mortgaged property is automatically released. Article 3280 describes the mortgage's indivisibility. Examine the instrument and any valid release or cancellation procedure before treating partial debt payment as a partial property release." },
      keyFacts: ["A mortgage secures an obligation.", "The Code generally treats the mortgage as indivisible.", "Review form, authority and third-person effect separately."],
    },
    registry: {
      summary: "Separate an agreement's effect between the parties from the recorded instrument's effect against third persons.",
      sections: [{ heading: "Locate the relevant public record", body: "Civil Code article 3338 addresses the specified instruments affecting immovables and their third-person effects through registry. Apply the relevant conveyance or mortgage records and property location. Other articles define third persons and the effect of knowledge. A valid agreement between its parties does not by itself answer the priority or opposability question." }],
      example: { heading: "Worked example — an unrecorded transfer", body: "A buyer has a signed immovable transfer and assumes that telling a later creditor about it gives the same protection as registry. Analyze article 3338 and the related public-records provisions for third-person effect. Private awareness does not simply replace the statutory recordation analysis." },
      keyFacts: ["Identify the instrument and affected immovable.", "Determine the applicable registry and property location.", "Analyze third-person effects in addition to validity between parties."],
    },
    obligations: {
      summary: "Examine capacity, consent and defects such as error, fraud or duress before deciding an obligation's enforceability and nullity consequences.",
      sections: [{ heading: "Trace formation and any defect", body: "Article 1906 defines the contract as an agreement creating, modifying or extinguishing obligations. Evaluate capacity and consent under their particular provisions. Error, fraud and duress have different elements. Articles 2029 through 2031 distinguish nullity consequences, including absolute and relative nullity. Identify whose interest the rule protects before assuming who can invoke or confirm the defect." }],
      example: { heading: "Worked example — pressure to sign", body: "A party says a signature was obtained through threats. The notary should identify the actual facts and the Code's duress conditions, then distinguish the appropriate nullity analysis. The mere presence of a signature does not settle capacity, free consent or the available remedy." },
      keyFacts: ["A contract creates, modifies or extinguishes obligations.", "Error, fraud and duress have different legal elements.", "Absolute and relative nullity have distinct consequences."],
    },
  },
};
