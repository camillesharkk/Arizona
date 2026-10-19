import { expandedGuides } from "@/lib/seo-expansion";
import { examConfig, officialExam, officialExamChecked } from "@/data/exam-config";
import { paths } from "@/lib/paths";
import { pageMeta } from "@/lib/seo";
import { eligibleExamPool } from "@/lib/quiz";

const practiceBank = eligibleExamPool();
const freeBankCount = practiceBank.filter((q) => q.is_free).length;

export type GuideSection = {
  heading: string;
  body: string;
  points?: string[];
  sourceId?: string;
  href?: string;
  hrefLabel?: string;
};

export type SeoGuide = {
  id: string;
  path: string;
  title: string;
  description: string;
  kicker: string;
  h1: string;
  lede: string;
  /** False keeps a draft route out of the index until it has its own answer. */
  index?: boolean;
  checked?: string;
  sections: GuideSection[];
  ctas?: { href: string; label: string }[];
  related: { href: string; label: string }[];
  faqs?: { q: string; a: string }[];
};

const passCount = Math.ceil((examConfig.questionCount * examConfig.passingScorePercent) / 100);

const existingGuides: SeoGuide[] = [
  {
    id: "fees",
    path: paths.fees,
    title: `Arizona Notary Fees and Allowed Charges ${examConfig.year}`,
    description:
      "Arizona notary fees: A.R.S. § 41-316 and R2-12-1102 cap notarial-act charges. The posted maximum is $10. Inform the requestor before the act. Rush is not a loophole.",
    kicker: "Fees",
    h1: "Arizona Notary Fees and Allowed Charges",
    lede: "For an acknowledgment, jurat, or oath, the reprinted fee rule allows no charge, or a charge up to $10. Copy certification is up to $10 per page certified. Tell the signer the fee before you start. Calling it a rush fee does not raise the cap.",
    checked:
      "A.R.S. § 41-316 was read on azleg.gov on 2026-10-19. R2-12-1102 was read on 2026-09-29 on the Cornell reprint (amendment noted there as 24 A.A.R. 137, effective March 5, 2018). On 2026-10-19, https://apps.azsos.gov/public_services/Title_02/2-12.htm returned 404, so the $10 ceilings are not reconfirmed from the official code host. Confirm the rule posted by the Secretary of State before you charge a customer.",
    sections: [
      {
        heading: "The statute sets the fence, not the price list",
        body: "A.R.S. § 41-316(A) tells the Secretary of State to set notary fees by rule. Subsection C says a notary shall not advertise, charge, or receive a fee for a notarial act except as that rule specifically authorizes. A price you saw on a social-media post is not the rule.",
        sourceId: "ars_41_316",
      },
      {
        heading: "What the reprinted rule allows",
        points: [
          "Acknowledgment or jurat: no charge, up to $10 per notary signature.",
          "Copy certification: no charge, up to $10 per page certified.",
          "Oath or affirmation: no charge, up to $10 per notarial act.",
          "Pick one standard fee inside that range and use it consistently.",
          "Post the schedule in a conspicuous place, and tell the requestor the fee before the act if you will charge one.",
        ],
        body: "Those ceilings come from the Cornell reprint of R2-12-1102, subsections B, D, and E. Zero is allowed. Ten dollars is a maximum, not a required price. Travel and per diem under A.R.S. § 41-316(B) are a different payment, tied to the state-employee mileage and subsistence amounts, not an extra notarial-act fee.",
        sourceId: "aac_r2_12_1102",
        href: paths.law("fee-cap-reminders"),
        hrefLabel: "Fee-cap note on the laws page",
      },
      {
        heading: "A common exam trap",
        body: "A signer who is late does not create a new fee category. If the rule does not authorize the charge, § 41-316(C) forbids it. Practice that distinction on the seal-and-fees questions, then read the chapter if you miss one.",
      },
    ],
    ctas: [
      { href: paths.study + "#seals-fees", label: "Seal and fees chapter" },
      { href: paths.topic("seals-fees"), label: "Practice fee questions" },
    ],
    related: [
      { href: paths.bond, label: "Bond vs fees vs E&O" },
      { href: paths.study + "#seals-fees", label: "Seal & fees chapter" },
      { href: paths.mistakesGuide, label: "Mistakes to avoid" },
      { href: paths.practice, label: "Practice test" },
    ],
  },
  {
    id: "bond",
    path: paths.bond,
    title: `Arizona Notary Bond Requirements ${examConfig.year}`,
    description: "Arizona notary bond: A.R.S. § 41-269(D) requires a $5,000 surety bond on file before a commission is issued. The surety is liable to claimants. It is not a substitute for your own insurance.",
    kicker: "Surety bond",
    h1: "Arizona Notary Bond Requirements",
    lede: `Before a commission is issued, A.R.S. § 41-269(D) requires a $5,000 surety bond filed with the Secretary of State. You may perform notarial acts in Arizona only while that assurance is on file. The bond is the surety’s promise to claimants. It is not an insurance policy that pays you.`,
    checked:
      "A.R.S. § 41-269 was read on azleg.gov on 2026-10-19, including subsections B, D, E, F, and G. The SOS Notary Resources page was not re-opened that day, so this page does not quote an SOS slogan about the bond. The $5,000 figure below is the amount in the statute, not a vendor quote.",
    sections: [
      {
        heading: "The filing the statute requires",
        points: [
          "Amount: $5,000, as a surety bond.",
          "Issuer: a surety or other entity licensed or authorized to do business in Arizona.",
          "Form: the form the Secretary of State prescribes.",
          "Coverage: acts during the commission term.",
          "Cancellation: the surety must give the SOS 30 days’ notice before canceling, and must notify the SOS within 30 days after paying a claimant.",
          "While it is missing: you may not perform notarial acts in Arizona.",
        ],
        body: "An employer may not cancel the assurance because the notary leaves that job. A stamp purchase, an association membership, or a practice-test score does not file this assurance. This page does not sell bonds.",
        sourceId: "ars_41_269",
      },
      {
        heading: "Who the bond answers to",
        body: "If the notary violates Arizona notary law, the surety is liable under the assurance. The commission itself gives the notary no immunity and no extra public-official benefit. Errors-and-omissions insurance, if you buy it, is a separate contract. § 41-269 does not say that insurance replaces the bond.",
        sourceId: "ars_41_269",
        href: paths.become,
        hrefLabel: "Where the bond sits in the commission steps",
      },
      {
        heading: "If an employer paid",
        body: "A.R.S. § 41-269(G) says the commission, the stamping device, and a journal that contains only public-record entries stay the notary’s property even when an employer paid the commissioning costs. The employer also may not limit your notarizations to people the employer picks.",
      },
    ],
    ctas: [
      { href: paths.become, label: "Full commission checklist" },
      { href: paths.study + "#commission", label: "Commission chapter" },
    ],
    related: [
      { href: paths.become, label: "How to become a notary" },
      { href: paths.become, label: "Become a notary" },
      { href: paths.fees, label: "Notary fees" },
      { href: paths.study, label: "Study Guide" },
    ],
  },
  {
    id: "ron",
    path: paths.ron,
    title: `Arizona Remote Online Notary Requirements ${examConfig.year}`,
    description:
      "Arizona RON: A.R.S. § 41-263 requires the notary to be in Arizona, notify the SOS before the first remote act, identify the signer, record the session, and use a proper certificate. A casual video call is not RON.",
    kicker: "Remote online notarization",
    h1: "Arizona Remote Online Notary Requirements",
    lede: "You may notarize for someone who is not in the room only if you are in Arizona and you meet A.R.S. § 41-263: prove identity as that section requires, confirm you have the same record, record the session, and say on the certificate that communication technology was used. A video call by itself is not that process. Notify the Secretary of State before the first remote act.",
    checked:
      "A.R.S. §§ 41-263, 41-254, 41-255, and 41-252 were read on azleg.gov on 2026-10-19. The SOS Remote & eNotary page was not re-opened that day, so technology-vendor approval rules are not restated here. Follow the live SOS instructions before the first remote act.",
    sections: [
      {
        heading: "Conditions in § 41-263",
        points: [
          "The notary is located in Arizona. The signer is the remotely located individual.",
          "Identity is personal knowledge, a credible witness under § 41-255, or at least two different types of identity proofing.",
          "The notary can reasonably confirm that the record in front of the notary is the record the signer signed or made a statement on.",
          "The notary, or someone acting for the notary, makes an audiovisual recording.",
          "The certificate states that communication technology was used. A sufficient short form includes: “This notarial act involved the use of communication technology.”",
          "If the signer is outside the United States, the record must have the U.S. connection in § 41-263(B)(4), and the notary must not actually know that the foreign state forbids the act.",
        ],
        body: "“Communication technology” means a device or process that lets you and the signer communicate at the same time by sight and sound. Sight and sound are necessary. They are not sufficient without identity proofing, the recording, the certificate language, and the advance SOS notice.",
        sourceId: "ars_41_263",
      },
      {
        heading: "Notice, and how long to keep the recording",
        body: "Before the first remote act, § 41-263(F) requires notice to the Secretary of State that you will perform remote acts, and it requires you to identify the technologies you intend to use. If the SOS has adopted approval standards, the technology and the identity proofing must meet them. The recording is kept for at least five years, unless a rule sets a different period, and except as § 41-254 provides.",
        sourceId: "ars_41_263",
      },
      {
        heading: "Deeds, powers of attorney, and the thumbprint",
        body: "A.R.S. § 41-254(C) requires a right-thumbprint in the journal, with the stated alternatives, when the document is a deed, quitclaim deed, deed of trust, other document affecting real property, or a power of attorney. Subsection D(3) skips that thumbprint for a remote act that complies with § 41-263 only when the journal includes the signer’s identification credential number and the audiovisual recording is kept for at least seven years. The ordinary recording floor remains five years when that exception does not apply.",
        sourceId: "ars_41_254",
        href: paths.law("sb1479-journal-thumbprint"),
        hrefLabel: "Journal thumbprint details",
      },
    ],
    ctas: [
      { href: paths.study + "#electronic-ron", label: "RON chapter in the Study Guide" },
      { href: paths.topic("electronic-ron"), label: "Practice RON questions" },
    ],
    related: [
      { href: paths.mistakesGuide, label: "Mistakes to avoid" },
      { href: paths.laws, label: "Law updates" },
      { href: paths.questions, label: "Exam questions" },
      { href: paths.practice, label: "Practice test" },
    ],
  },
  {
    id: "cram",
    path: paths.cram,
    title: `Arizona Notary Exam Cram Sheet ${examConfig.year}`,
    description: "A one-page Arizona notary exam cram sheet: eligibility, ID, fees, conflicts, RON, and the practice-test target. Confirm the live SOS exam format before test day.",
    kicker: "Cram sheet",
    h1: "Arizona Notary Exam Cram Sheet",
    lede: "Use this as a last pass, then take a timed practice exam. It is a checklist of rules checked in statute. It is not the SOS manual, and these are not official exam questions.",
    checked: `${officialExamChecked} Eligibility, bond, identification, the fee statute, the stamp, the spouse conflict, remote notarization, the journal, and the deed thumbprint were read on azleg.gov on October 19, 2026. The $10 notarial-act ceilings were not re-opened: the official code URL tried that day returned 404, and the Cornell reprint of R2-12-1102 was last read on 2026-09-29. Confirm that rule before you charge a customer.`,
    sections: [
      {
        heading: "Practice format on this site",
        points: [
          `This site: ${examConfig.questionCount} practice questions, ${examConfig.timeLimitMinutes} minutes, ${examConfig.passingScorePercent}% to mark a practice pass (${passCount} correct).`,
          `SOS exam notice (${officialExam.checkedOn}): ${officialExam.questionCount} questions, ${officialExam.timeLimitMinutes} minutes, ${officialExam.passingScorePercent}% to pass, ${officialExam.provider}, $${officialExam.examFeeUsd} per proctored exam. A.R.S. § 41-270 does not set those figures.`,
          `Filing fee on the SOS notary page: $${officialExam.applicationFeeUsd}. Bond amount in § 41-269(D): $${officialExam.bondUsd}. Those are not the exam fee.`,
          "Quick 10 shows the explanation immediately. Full 45 hides explanations until you submit.",
        ],
        body: `About 80 seconds per item if you split an hour evenly. One free Full 45 in this browser can include Pro questions. Pro is a separate one-time 60-day purchase, not a subscription: the standard price is $22.21, and new members may pay $19.99 during the first 72 hours after registration. Pro unlocks all ${practiceBank.length} practice questions, including the ${practiceBank.length - freeBankCount} that are Pro-only, and later full exams.`,
        href: paths.passingScore,
        hrefLabel: "Why 80% is a practice target",
      },
      {
        heading: "Commission and bond",
        points: [
          "18 or older, U.S. citizen or permanent legal resident, Arizona tax resident who claims Arizona as the primary residence, and able to read, write and understand English.",
          `The SOS notice requires the exam for new and renewing notaries beginning July 1, 2025. Keep a manual the Secretary of State approves. The notice names the ${officialExam.manualTitle}.`,
          "Oath, then a $5,000 surety bond, before the commission is issued. Term: four years.",
          "An employer who pays does not own the commission or the stamp.",
        ],
        body: "Working in Arizona is not the same as claiming Arizona as your primary residence on your tax returns.",
        sourceId: "ars_41_269",
      },
      {
        heading: "Identity, acts, fees, conflicts",
        points: [
          "The signer appears in person, or through a § 41-263 remote session.",
          "Satisfactory ID under § 41-255(B) includes an unexpired U.S. passport, state driver license or nonoperating ID, military ID, or another unexpired U.S., state, or tribal ID with a signature or a photo and physical description.",
          "An acknowledgment is not a verification on oath or affirmation. § 41-253(B) requires you to determine that the individual made that verification and that the record is complete.",
          "Fees: no charge up to $10 for the reprinted acknowledgment, jurat, oath, and per-page copy fees. Say the fee first. Travel is separate under § 41-316(B).",
          "Do not notarize a record you or your spouse is a party to, or in which either of you has a direct beneficial interest. That act is voidable.",
          "Do not put the official stamp over any signature on the record.",
          "Deeds and powers of attorney: right thumbprint in the journal, with the statutory alternatives, unless the remote-act exception in § 41-254(D)(3) applies.",
        ],
        body: "If a credential is not one of those unexpired documents, it is not satisfactory evidence under § 41-255(B)(1). Do not invent a journal note that upgrades it.",
        sourceId: "ars_41_255",
      },
      {
        heading: "Remote acts in one pass",
        points: [
          "Notary in Arizona. SOS notice before the first remote act, naming the technologies.",
          "Identity by personal knowledge, a credible witness, or at least two types of identity proofing.",
          "Audiovisual recording, normally at least five years. Seven years, plus the ID credential number in the journal, if you are using the thumbprint exception for a covered deed or power of attorney.",
          "Certificate states that communication technology was used.",
        ],
        body: "Simultaneous sight and sound is the start of the definition, not the whole test.",
        href: paths.ron,
        hrefLabel: "Remote online notary requirements",
      },
    ],
    ctas: [
      { href: `${paths.practice}?mode=quick`, label: "Try 10 free questions" },
      { href: paths.pricing, label: "Pro price and what it adds" },
    ],
    related: [
      { href: paths.study, label: "Full Study Guide" },
      { href: paths.examPrep, label: "7-step plan" },
      { href: paths.questions, label: "Question bank" },
      { href: paths.flashcards, label: "Flashcards" },
    ],
  },
  {
    id: "mistakes",
    path: paths.mistakesGuide,
    title: `Arizona Notary Exam Mistakes to Avoid ${examConfig.year}`,
    description:
      "Arizona notary exam mistakes tied to statute: the wrong ID, skipping a verification, a video call treated as RON, a fee over the cap, a spouse conflict, and a practice score treated as a commission.",
    kicker: "Mistakes to avoid",
    h1: "Arizona Notary Exam Mistakes to Avoid",
    lede: "These are application errors, not trivia. Each one below is tied to a statute or fee rule checked on 2026-09-29. After you can explain the miss, take a timed 45-question practice exam. The items on this site are practice questions, not official exam forms.",
    checked:
      "A.R.S. §§ 41-252, 41-253, 41-255, 41-263, 41-266, and 41-269, plus § 41-316, were read on azleg.gov on 2026-09-29. The $10 ceilings were read the same day on the Cornell reprint of R2-12-1102.",
    sections: [
      {
        heading: "Using an ID the statute does not list",
        body: "A.R.S. § 41-255(B)(1) lists satisfactory documents: an unexpired U.S. passport, an unexpired state driver license or nonoperating identification license, an unexpired U.S. military ID, another unexpired U.S., state, or tribal government ID that has a signature or a photograph and physical description, and the inmate IDs the section names. A journal note does not turn a different card into one of those documents. Personal knowledge and a credible witness are separate methods in the same section.",
        sourceId: "ars_41_255",
        href: paths.study + "#identification",
        hrefLabel: "Identification chapter",
      },
      {
        heading: "Finishing a verification the signer did not make",
        body: "An acknowledgment under § 41-253(A) is not a verification on oath or affirmation under § 41-253(B). For the verification, you must determine that the individual made the verification, that the signature is theirs, and that the record is complete to the best of your knowledge. If they will not make that verification, completing the certificate anyway is not that notarial act. Do not switch the certificate to an acknowledgment just to get the appointment done.",
        sourceId: "ars_41_253",
        href: paths.study + "#jurats",
        hrefLabel: "Jurats chapter",
      },
      {
        heading: "Treating a video call as remote notarization",
        body: "A.R.S. § 41-263 requires the notary to be in Arizona, identity proofing as that section states, a reasonable confirmation that you have the same record, an audiovisual recording, certificate language that communication technology was used, and notice to the Secretary of State before the first remote act. A consumer video app can supply sight and sound. It does not, by itself, supply the rest.",
        sourceId: "ars_41_263",
        href: paths.ron,
        hrefLabel: "Remote online notary requirements",
      },
      {
        heading: "Adding a charge the fee rule does not authorize",
        body: "The Cornell reprint of R2-12-1102 allows no charge up to $10 for an acknowledgment or jurat per signature, a copy certification per page, and an oath per act. A.R.S. § 41-316(C) forbids advertising or collecting any other fee for the notarial act. Tell the requestor the fee before you begin. Mileage and per diem under § 41-316(B) are not a second notarial fee.",
        sourceId: "ars_41_316",
        href: paths.fees,
        hrefLabel: "Fee rules",
      },
      {
        heading: "Notarizing when you or your spouse is a party",
        body: "A.R.S. § 41-252(B) says you may not perform the act on a record to which you or your spouse is a party, or in which either of you has a direct beneficial interest. The act is voidable. Send them to another notary.",
        sourceId: "ars_41_252",
        href: paths.study + "#prohibited-acts",
        hrefLabel: "Prohibited-acts chapter",
      },
      {
        heading: "Stamping over a signature",
        body: "A.R.S. § 41-266(C) says you may not affix the official stamp over your signature or over any other signature on the record.",
        sourceId: "ars_41_266",
        href: paths.study + "#seals-fees",
        hrefLabel: "Seal and fees chapter",
      },
      {
        heading: "Treating a practice pass as a commission",
        body: "Questions on this site are independent practice items. A.R.S. § 41-269 still requires the oath and the $5,000 surety bond before the Secretary of State issues a commission. Do not stamp a document because Quick 10 went well.",
        sourceId: "ars_41_269",
        href: paths.become,
        hrefLabel: "How to become a notary",
      },
    ],
    ctas: [{ href: `${paths.practice}?mode=full`, label: "Take a full 45-question practice exam" }],
    related: [
      { href: paths.cram, label: "Cram sheet" },
      { href: paths.questions, label: "Practice questions" },
      { href: paths.examPrep, label: "Seven-day study plan" },
      { href: paths.pricing, label: "Pro question bank, after this browser’s free Full 45" },
    ],
  },
];

export const seoGuides: SeoGuide[] = [
  ...existingGuides.filter((guide) => !expandedGuides.some((updated) => updated.id === guide.id)),
  ...expandedGuides,
];

export const searchMatrix: { title: string; href: string; blurb: string }[] = [
  { title: "Arizona Notary Exam Practice Test", href: paths.practice, blurb: "Start Quick 10 or a timed Full 45." },
  { title: "Arizona Notary Exam Questions and Answers", href: paths.questions, blurb: "Learn from topic questions, explanations and sources." },
  { title: "Arizona Notary Exam Study Guide", href: paths.study, blurb: "Review rules and worked examples." },
  { title: "How to Become a Notary in Arizona", href: paths.become, blurb: "Follow the application and commission checklist." },
  ...seoGuides.filter((guide) => guide.index !== false).map((guide) => ({ title: guide.h1, href: guide.path, blurb: guide.description })),
  { title: "Seven-day exam plan", href: paths.examPrep, blurb: "Spread review and practice across a week." },
];

export function seoGuideById(id: string) {
  const guide = seoGuides.find((item) => item.id === id);
  if (!guide) throw new Error(`Unknown SEO guide: ${id}`);
  return guide;
}

export function seoGuideMetadata(id: string) {
  const guide = seoGuideById(id);
  return pageMeta({
    title: guide.title,
    description: guide.description,
    path: guide.path,
    index: guide.index !== false,
  });
}
