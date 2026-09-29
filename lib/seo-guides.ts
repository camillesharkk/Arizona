import { examConfig } from "@/data/exam-config";
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

export const seoGuides: SeoGuide[] = [
  {
    id: "how-hard",
    index: false,
    path: paths.howHard,
    title: `How Hard Is the Arizona Notary Exam? ${examConfig.year}`,
    description:
      "How hard the Arizona notary exam feels depends on applying the statutes under a time limit. This site’s Full 45 is a practice setting, not a fresh SOS exam bulletin.",
    kicker: "Exam difficulty",
    h1: `How Hard Is the Arizona Notary Exam?`,
    lede: `A.R.S. § 41-270 does not set the question count, time limit, or cut score. This site’s Full 45 uses ${examConfig.questionCount} questions, ${examConfig.timeLimitMinutes} minutes, and ${examConfig.passingScorePercent}% as practice settings. Those figures are not a re-check of the SOS exam page.`,
    sections: [
      {
        heading: "What the official format actually tests",
        body: "Older SOS notices described a timed exam with the manual on screen and no physical book. azsos.gov did not load on 2026-09-29, so this page does not treat the format, time limit, vendor, or fee as re-checked. The scored skills are still the statute: identification, the notarial act, the journal, fees, and prohibited acts. Read the live SOS page before you pay.",
        sourceId: "sos_new_notary",
        href: examConfig.officialExamUrl,
        hrefLabel: "Arizona SOS notary exam page",
      },
      {
        heading: "Why people fail an open-book test",
        body: "Common misses are damaged identification, mixing acknowledgments with jurats, informal video calls treated as remote notarization, conflicts of interest, and charging more than the fee rule allows. Those are application errors. A high practice score that you cannot explain is not readiness.",
        href: paths.mistakesGuide,
        hrefLabel: "Mistakes to avoid on the exam",
      },
      {
        heading: "How to measure difficulty for yourself",
        body: "Start with the free Quick 10. Write down every topic you miss. Study that chapter, then take the one free Full 45 in this browser. If you cannot finish or cannot explain the official source on missed items, you are not guessing your way to 80%. Another full exam in that browser, and the rest of the bank, are Pro.",
        href: `${paths.practice}?mode=quick`,
        hrefLabel: "Start the free Quick 10",
      },
    ],
    related: [
      { href: paths.passingScore, label: "Passing score" },
      { href: paths.practice, label: "Practice test" },
      { href: paths.examPrep, label: "Seven-day study plan" },
      { href: paths.cram, label: "Cram sheet" },
    ],
  },
  {
    id: "passing-score",
    path: paths.passingScore,
    title: `Arizona Notary Exam Passing Score ${examConfig.year}`,
    description: `Arizona statute does not set the notary exam cut score. This site marks a practice pass at ${examConfig.passingScorePercent}% (${passCount} of ${examConfig.questionCount}). Confirm the live SOS instructions before you book.`,
    kicker: "Passing score",
    h1: "Arizona Notary Exam Passing Score",
    lede: `The statute does not set a passing percent. This site’s Full 45 marks a practice pass at ${examConfig.passingScorePercent}% — ${passCount} of ${examConfig.questionCount}. That is a study target, not an SOS score report and not a commission.`,
    checked:
      "A.R.S. § 41-270 was read on azleg.gov on 2026-09-29. It lets the Secretary of State require an exam and charge a fee. It does not state the question count, the time limit, or the cut score. azsos.gov did not load that day because of a Cloudflare check. A local audit dated 2026-09-28 reported 45 questions, 60 minutes, and 80% on the SOS notary page, and also reported older and newer vendor notices on that same page. Read the live SOS page before you pay for the official exam.",
    sections: [
      {
        heading: "What the statute says",
        body: "A.R.S. § 41-270(A) says the Secretary of State may require a new applicant, a renewing notary, or a notary with a suspended commission to pass an exam based on the laws, rules, procedures, and ethics of notarial acts. Subsection C lets the SOS set and collect a fee for the course and exam. None of that text is a passing score.",
        sourceId: "ars_41_270",
      },
      {
        heading: "The number this practice test uses",
        body: `Full 45 on this website uses ${examConfig.questionCount} questions, ${examConfig.timeLimitMinutes} minutes, and ${examConfig.passingScorePercent}% to show PASS. ${passCount} correct answers meet that practice target. These are the format fields stored for practice. They are not a printout of today’s SOS bulletin, and the questions are original practice items, not official exam forms.`,
        sourceId: "sos_new_notary",
      },
      {
        heading: "A practice pass still is not a commission",
        body: "A.R.S. § 41-269(C) and (D) still require the oath of office and a $5,000 surety bond on file before the Secretary of State issues a commission. A green score on this site does not file either one.",
        sourceId: "ars_41_269",
        href: paths.become,
        hrefLabel: "Commission steps after the exam",
      },
    ],
    ctas: [{ href: `${paths.practice}?mode=quick`, label: "Try 10 free questions" }],
    related: [
      { href: paths.practice, label: "Practice test" },
      { href: paths.examPrep, label: "Seven-day study plan" },
      { href: paths.bond, label: "Bond requirements" },
      { href: paths.study, label: "Study Guide" },
    ],
  },
  {
    id: "question-count",
    index: false,
    path: paths.questionCount,
    title: `How Many Questions Are on the Arizona Notary Exam? ${examConfig.year}`,
    description: `A.R.S. § 41-270 does not set the official question count. This site’s Full 45 draws ${examConfig.questionCount} practice questions. Quick 10 draws 10 from the free pool.`,
    kicker: "Exam length",
    h1: "How Many Questions Are on the Arizona Notary Exam?",
    lede: `A.R.S. § 41-270 lets the Secretary of State require an exam. It does not set the question count, and this page does not treat an SOS count as re-checked. On this site, Quick 10 draws 10 questions from the free pool. Full 45 draws ${examConfig.questionCount} practice questions from the bank.`,
    sections: [
      {
        heading: "Official exam length",
        body: `This site’s Full 45 uses ${examConfig.questionCount} questions and ${examConfig.timeLimitMinutes} minutes as practice settings. A.R.S. § 41-270 does not set those numbers, and the SOS exam page was not re-read for this sentence. Confirm the live exam before booking.`,
        sourceId: "sos_new_notary",
        href: examConfig.officialExamUrl,
        hrefLabel: "Arizona SOS exam page",
      },
      {
        heading: "How this site’s tests map to that length",
        body: "Quick 10: ten free items with instant explanations. Full 45: forty-five distinct questions, timer on, explanations after you submit. Topic practice is study, not the exam length. One free Full 45 in this browser; a later full exam in that same browser is Pro. Repeated questions on later attempts can inflate a score, so explain the source, not just the letter.",
        href: `${paths.practice}?mode=quick`,
        hrefLabel: "Start Quick 10",
      },
      {
        heading: "After you know the count, practice the acts",
        body: "Length is the easy fact. The hard part is choosing the right notarial act and citing the statute. Use exam questions by topic when you miss identification, journals, or fees, then return to a full timed set.",
        href: paths.questions,
        hrefLabel: "Arizona notary exam questions",
      },
    ],
    related: [
      { href: paths.passingScore, label: "Passing score" },
      { href: paths.practice, label: "Practice test" },
      { href: paths.examPrep, label: "Study plan" },
      { href: paths.study, label: "Study Guide" },
    ],
  },
  {
    id: "exam-requirements",
    index: false,
    path: paths.examRequirements,
    title: `Arizona Notary Exam Requirements ${examConfig.year}`,
    description:
      "Arizona notary exam and commission requirements: eligibility under A.R.S. § 41-269, the exam if required, oath, $5,000 bond, and SOS issuance.",
    kicker: "Exam & commission requirements",
    h1: "Arizona Notary Exam Requirements",
    lede: "The exam is one qualification if the Secretary of State requires it. A commission still needs eligibility, an oath, a $5,000 surety-bond assurance on file, and issuance by the SOS.",
    sections: [
      {
        heading: "Who may apply",
        body: "Under A.R.S. § 41-269(B), an applicant must be at least 18, a U.S. citizen or permanent legal resident, an Arizona resident for income-tax purposes who claims Arizona as the primary residence on tax returns, and able to read, write, and understand English. The applicant must also meet disqualification, examination, and SOS-approved reference-manual requirements. Working in Arizona without that residency is not enough.",
        sourceId: "ars_41_269",
        href: paths.study + "#commission",
        hrefLabel: "Study the commission chapter",
      },
      {
        heading: "What the exam is for",
        body: "A.R.S. § 41-269(B)(6) treats passing the examination in § 41-270 as one qualification if the Secretary of State requires it. This website is independent practice, not the official exam. Check SOS New Notary for current scheduling, identification at the test center, remote options, and fees. Full 45 on this site uses this site’s practice settings of 45 questions, 60 minutes, and 80%. Those three figures were not re-read from the SOS page on 2026-09-29.",
        sourceId: "sos_new_notary",
        href: `${paths.practice}?mode=full`,
        hrefLabel: "Take a Full 45 practice exam",
      },
      {
        heading: "After a passing official score",
        body: "A.R.S. § 41-269(C)–(E) still require the oath of office and the $5,000 surety-bond assurance before the Secretary of State issues the commission. Buying a stamp because a practice test went well is not commissioning. Use the become-a-notary checklist for bond, oath, and supplies.",
        href: paths.become,
        hrefLabel: "Commission checklist",
      },
    ],
    related: [
      { href: paths.bond, label: "Bond requirements" },
      { href: paths.become, label: "How to become a notary" },
      { href: paths.passingScore, label: "Passing score" },
      { href: paths.study, label: "Study Guide" },
    ],
  },
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
      "A.R.S. § 41-316 was read on azleg.gov on 2026-09-29. R2-12-1102 was read the same day on the Cornell reprint of the Arizona Administrative Code (amendment noted there as 24 A.A.R. 137, effective March 5, 2018). The official code host at apps.azsos.gov did not load. Confirm the rule posted by the Secretary of State before you charge a customer.",
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
      "A.R.S. § 41-269 was read on azleg.gov on 2026-09-29, including subsections D, E, F, and G. The SOS Notary Resources page did not load that day, so this page does not quote an SOS slogan about the bond. The $5,000 figure below is the amount in the statute, not a vendor quote.",
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
      "A.R.S. §§ 41-263 and 41-254 were read on azleg.gov on 2026-09-29. The SOS Remote & eNotary page did not load that day, so technology-vendor rules are not restated here. Follow the live SOS instructions before the first remote act.",
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
    id: "faq",
    index: false,
    path: paths.examFaq,
    title: `Arizona Notary Exam FAQ ${examConfig.year}`,
    description: `Answers to Arizona notary exam questions: length, passing score, open book, free practice, Full 45, Study Guide, and Pro. Independent of the SOS.`,
    kicker: "FAQ",
    h1: "Arizona Notary Exam FAQ",
    lede: "Short answers to the searches people use before they book the official exam. Then take a practice test so the answers are not just trivia.",
    sections: [
      {
        heading: "Use the list, then prove it under a timer",
        body: "If you only needed a number, you already have it. The remaining risk is applying the rule. Take Quick 10, open the matching Study Guide chapter, then run Full 45.",
        href: `${paths.practice}?mode=quick`,
        hrefLabel: "Start the free 10-question test",
      },
    ],
    related: [
      { href: paths.examPrep, label: "Study plan" },
      { href: paths.practice, label: "Practice test" },
      { href: paths.cram, label: "Cram sheet" },
      { href: paths.guidesIndex, label: "All exam guides" },
    ],
    faqs: [
      {
        q: "How many questions are on the Arizona notary exam?",
        a: `A.R.S. § 41-270 does not set the official count. This site’s Full 45 draws ${examConfig.questionCount} practice questions. Quick 10 draws 10 from the free pool.`,
      },
      {
        q: "What is the passing score?",
        a: `This site uses ${examConfig.passingScorePercent}% (${passCount} of ${examConfig.questionCount}) as the practice cut score. Confirm the official exam on the Arizona SOS site. A practice PASS is not a commission.`,
      },
      {
        q: "Is the exam open book?",
        a: "Older SOS notices described an on-screen manual and no physical manual. azsos.gov did not load on 2026-09-29, so this page does not treat that format, the time limit, or the vendor as re-checked. This site’s Full 45 hides explanations until you submit and uses a 60-minute practice timer.",
      },
      {
        q: "Is this the official SOS exam?",
        a: "No. This website is independent practice. The official exam and commission are on the Arizona Secretary of State site.",
      },
      {
        q: "What can I do for free?",
        a: `Quick 10 and topic practice use ${freeBankCount} free questions. One free Full 45 in this browser draws ${examConfig.questionCount} questions from the ${practiceBank.length}-question bank and can include Pro items. That browser reminder is not a per-person limit. The Study Guide stays free. No registration is required to start.`,
      },
      {
        q: "What does Pro add?",
        a: `Arizona Notary Exam Prep Pro is a one-time 60-day purchase. It unlocks all ${practiceBank.length} practice questions, including the ${practiceBank.length - freeBankCount} that are not free, plus unlimited full exams and weak-area training. It is not a subscription.`,
      },
      {
        q: "Does passing the exam make me a notary that day?",
        a: "No. A.R.S. § 41-269 still requires the oath and a $5,000 surety-bond assurance, among other steps, before the SOS issues a commission.",
      },
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
    checked:
      "Eligibility, bond, ID, fee statute, stamp, spouse conflict, RON, and the deed thumbprint were read on azleg.gov on 2026-09-29. The $10 ceilings were read the same day on the Cornell reprint of R2-12-1102. The SOS exam page did not load, so the 45-question practice format is labeled as this site’s setting, not as a figure re-read from SOS on that date.",
    sections: [
      {
        heading: "Practice format on this site",
        points: [
          `${examConfig.questionCount} practice questions, ${examConfig.timeLimitMinutes} minutes, ${examConfig.passingScorePercent}% to mark a practice pass (${passCount} correct).`,
          "A.R.S. § 41-270 does not state those three numbers. Confirm them on the live SOS page before the official exam.",
          "Quick 10 shows the explanation immediately. Full 45 hides explanations until you submit.",
        ],
        body: `About 80 seconds per item if you split an hour evenly. One free Full 45 in this browser can include Pro questions. Pro is a separate one-time 60-day purchase, not a subscription: the standard price is $22.21, and new members may pay $19.99 during the first 72 hours after registration. Pro unlocks all ${practiceBank.length} practice questions, including the ${practiceBank.length - freeBankCount} that are Pro-only, and later full exams.`,
        href: paths.passingScore,
        hrefLabel: "Why 80% is a practice target",
      },
      {
        heading: "Commission and bond",
        points: [
          "18 or older, U.S. citizen or permanent legal resident, Arizona tax resident who claims Arizona as the primary residence, and able to read and write English.",
          "Pass the exam if the SOS requires it, and keep an SOS-approved manual.",
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

export const searchMatrix: { title: string; href: string; blurb: string }[] = [
  { title: "Arizona Notary Exam Practice Test", href: paths.practice, blurb: "Free Quick 10 and one free Full 45 in this browser. No second “free test” article." },
  { title: "Arizona Notary Exam Questions and Answers", href: paths.questions, blurb: "Topic practice with explanations and official sources." },
  { title: "Arizona Notary Exam Study Guide", href: paths.study, blurb: "Rules, worked examples, and a link into each topic." },
  { title: "How to Become a Notary in Arizona", href: paths.become, blurb: "Eligibility, exam, oath, and the $5,000 bond." },
  { title: "Arizona Notary Exam Passing Score", href: paths.passingScore, blurb: "The statute does not set the percent. This site uses 80% for practice." },
  { title: "Arizona Notary Fees and Allowed Charges", href: paths.fees, blurb: "No charge up to $10, said out loud before the act." },
  { title: "Arizona Notary Bond Requirements", href: paths.bond, blurb: "$5,000 surety bond on file before you notarize." },
  { title: "Arizona Remote Online Notary Requirements", href: paths.ron, blurb: "§ 41-263. A video call is only the start." },
  { title: "Arizona Notary Exam Cram Sheet", href: paths.cram, blurb: "One-page checklist, then Quick 10." },
  { title: "Arizona Notary Exam Mistakes to Avoid", href: paths.mistakesGuide, blurb: "ID, verification, RON, fees, and conflicts." },
  { title: "Seven-day exam plan", href: paths.examPrep, blurb: "Where “how hard is it?” goes until that page is more than a restatement." },
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
