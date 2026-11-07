import { caPaths } from "@/lib/ca-site";
import type { StateArticle } from "@/lib/state-articles";

const exam = "https://cpshr.us/services/california-notary-exam-2/notary-exam-information/";
const handbook = "https://www.sos.ca.gov/notary/handbook";
const pdf = "https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf";
const gov = (section: string) =>
  `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=GOV&sectionNum=${section}.`;
const civ = (section: string) =>
  `https://leginfo.legislature.ca.gov/faces/codes_displaySection.xhtml?lawCode=CIV&sectionNum=${section}.`;

function item(slug: string, article: Omit<StateArticle, "state" | "slug" | "path" | "updated">): StateArticle {
  return { ...article, state: "CA", slug, path: `/california/${slug}/`, updated: "2026-11-07" };
}

export const caArticles: StateArticle[] = [
  item("exam-retake", {
    id: "ca-retake",
    keyword: "california notary exam retake rules",
    intent: "What happens after a failed California notary exam, and when another sitting is valid.",
    title: "Failed the California Notary Exam? Retake Rules",
    description: "A failed California notary exam can be retaken in a later calendar month. A second score in the same month is invalid and the fee is forfeited.",
    h1: "Failed the California Notary Exam? Retake Rules and Next Steps",
    kicker: "Retake",
    lede: "You may apply and test again after a failing result. CPS HR allows only one valid sitting in a calendar month. A second score in that same month is invalid, and the fee for that sitting is forfeited. The fail notice comes by mail. Results are not given over the phone.",
    checked: "CPS HR notary exam information, read November 7, 2026. Results timing, the once-a-month rule, the mailed fail notice, and the $30 rescore were on that page.",
    ledeCta: { href: `${caPaths.questions}?topic=education-exam`, label: "Practice the exam-rule questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "What the fail notice does and does not do",
        body: "Candidates who do not pass are mailed a fail notice. Passing candidates are forwarded to the Secretary of State. A fail notice is not a commission denial by itself, and it does not waive the six-hour course, the fingerprints, or the later oath and bond. Results take about 15 to 20 business days after the exam date.",
        points: [
          "One valid exam per calendar month. March 2 and March 20 would make the later score invalid.",
          "The next valid month is the following calendar month, not 30 days later.",
          "A written rescore request needs a $30 money order payable to CPS HR, received within 45 days of the test date at 2450 Del Paso Road, Suite 160, Sacramento, CA 95834. Checks and cash are not accepted.",
        ],
      },
      {
        heading: "Where the scored items actually sit",
        body: "The exam is 45 multiple-choice items and one hour. Forty items are scored: administrative procedures 5, notarial acts and documents 12, identification and subscribing-witness notarizations 4, immigration and foreign language 4, and misconduct and fees 15. Five items are not scored. A retake is the same format. It is not a shorter makeup.",
        link: { href: `${caPaths.study}#education-exam`, label: "Training and exam chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "A useful next sitting",
        body: "The largest scored block is misconduct and fees. A second attempt that only rereads the appointment checklist leaves that block untouched. Use the missed-question list from a full practice exam, then reread the handbook section that matches the miss. This site’s practice score is not a CPS HR scaled score.",
      },
    ],
    endCta: { href: `${caPaths.practice}?mode=quick`, label: "Start a free Quick 10", placement: "end", targetMode: "quick" },
    related: [
      { href: "/california/how-hard/", label: "What makes the exam difficult" },
      { href: caPaths.passingScore, label: "Scaled passing score" },
      { href: caPaths.examGuide, label: "Exam format" },
    ],
    faqs: [
      { q: "Can I test again the same month if I failed?", a: "No. CPS HR says a candidate may test only once in a calendar month. A second score that month is invalid and the fee is forfeited." },
      { q: "Will CPS HR tell me the result by phone?", a: "No. The exam page says result information is not discussed over the phone. Expect the mailed result in about 15 to 20 business days." },
    ],
  }),
  item("open-book", {
    id: "ca-open-book",
    keyword: "is the california notary exam open book",
    intent: "Whether the California notary exam allows the handbook or notes in the room.",
    title: "Is the California Notary Exam Open Book?",
    description: "The California notary exam is closed book. Proctors administer 45 multiple-choice items, and the handbook is study material, not a test-day reference.",
    h1: "Is the California Notary Exam Open Book? What to Expect",
    kicker: "Closed book",
    lede: "No. CPS HR states that the notary public examination is a closed-book examination administered by proctors. You do not use the handbook, a printout, or notes to look up an answer during the hour.",
    checked: "CPS HR notary exam information, read November 7, 2026. The page says the exam is closed book, has 45 items, and has a one-hour limit.",
    ledeCta: { href: `${caPaths.practice}?mode=quick`, label: "Try 10 questions without notes", placement: "lede", targetMode: "quick" },
    sections: [
      {
        heading: "What you can use, and when",
        body: "The current handbook is the study source. Government Code section 8201 says exam questions are based on the law in the booklet the Secretary of State distributes. That is a reason to study the booklet before the appointment. It is not permission to open it at the desk. Plan about two to three hours at the center for registration, testing, and proctor instructions. The test itself is one hour.",
      },
      {
        heading: "How to study for a closed book",
        body: "Read a rule, then answer a question with the book shut. If you can find the fee only by scanning section 8211, you do not yet have it. The same is true for the journal thumbprint, the credible-witness oath, and the difference between an acknowledgment and a jurat. Quick 10 shows the explanation after each item so you can check the rule immediately.",
        link: { href: `${caPaths.study}#fees`, label: "Fee chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "What this site is not",
        body: "A practice item on this site is original. It is not a released CPS HR question, and a practice percent is not the scaled score of 70. The official exam remains the proctored closed-book exam.",
      },
    ],
    endCta: { href: `${caPaths.practice}?mode=quick`, label: "Start Quick 10 closed-book", placement: "end", targetMode: "quick" },
    related: [
      { href: caPaths.examGuide, label: "Exam format" },
      { href: "/california/cram-sheet/", label: "Rules to review before test day" },
      { href: handbook, label: "Secretary of State handbook page" },
    ],
  }),
  item("how-hard", {
    id: "ca-how-hard",
    keyword: "how hard is the california notary exam",
    intent: "What the difficulty comes from, without a made-up pass rate.",
    title: "How Hard Is the California Notary Exam?",
    description: "The California notary exam is a one-hour closed-book test. Difficulty comes from the scaled score, the 15 misconduct-and-fee items, and rules that look alike.",
    h1: "How Hard Is the California Notary Exam? Check Your Readiness",
    kicker: "Readiness",
    lede: "It is a one-hour closed-book multiple-choice exam. CPS HR does not publish a pass rate, and this site does not invent one. The hard part is applying a specific rule under a time limit, then clearing a scaled score of 70 that is not a percent of the questions.",
    checked: "CPS HR notary exam information, read November 7, 2026, for the item counts, the hour, the closed-book format, and the scaled score.",
    ledeCta: { href: `${caPaths.practice}?mode=quick`, label: "Check 10 questions", placement: "lede", targetMode: "quick" },
    sections: [
      {
        heading: "Where the 40 scored items go",
        body: "Misconduct and fees account for 15 of the 40 scored items. Notarial acts and documents account for 12. Administration is 5, identification and subscribing-witness work is 4, and immigration and foreign language is 4. Five further items are not scored and do not count against the result. A practice set that ignores fees can feel easy and still miss the largest official block.",
      },
      {
        heading: "A readiness check that stays honest",
        body: "Eight of ten on Quick 10 only chooses the next chapter on this site. It is not a scaled 70. A full practice exam uses 40 scored items and 5 unscored items in 60 minutes. Read the explanations you missed. If the miss is “I would have looked that up,” treat it as unlearned: the official exam is closed book.",
        points: [
          "Personal knowledge does not replace satisfactory evidence.",
          "An acknowledgment does not require you to have watched the original signing. A jurat does require a signature in your presence and an oath.",
          "The maximum acknowledgment or jurat fee is $15. Zero is allowed when the journal says so.",
          "A video appearance is not personal appearance while remote online notarization is not operative.",
        ],
      },
    ],
    endCta: { href: `${caPaths.mistakes}`, label: "Review missed questions", placement: "end", targetMode: "topic" },
    related: [
      { href: caPaths.passingScore, label: "Why 70 is not a percent" },
      { href: "/california/open-book/", label: "Closed-book rule" },
      { href: caPaths.study, label: "Study guide" },
    ],
  }),
  item("study-plan", {
    id: "ca-study-plan",
    keyword: "california notary exam study plan",
    intent: "A seven-day order of study and practice for the California exam.",
    title: "California Notary Exam Study Plan: 7 Days",
    description: "A seven-day California notary study plan: the approved course is separate, and each day pairs one handbook topic with practice questions.",
    h1: "California Notary Exam Study Plan: A 7-Day Schedule",
    kicker: "7-day plan",
    lede: "Use seven days to learn the rules you must recall closed-book. Finish the Secretary of State-approved course on its own schedule. This plan does not replace that course, and this site does not issue the course certificate.",
    checked: "Course length is Government Code section 8201, read November 7, 2026, and the January 2026 handbook, pages 7 and 24–25. Exam format is the CPS HR page read the same day.",
    ledeCta: { href: caPaths.daily, label: "Open daily study", placement: "lede", targetMode: "daily" },
    sections: [
      {
        heading: "Days 1–3: appointment, identity, and the two certificates",
        points: [
          "Day 1. Qualifications, the six-hour course, and the three-hour refresher. The refresher fits only a current commission when the six-hour course was already completed and the new application is filed before expiration.",
          "Day 2. Civil Code section 1185. One credible witness only if you know that witness. Two witnesses if you know neither. Personal knowledge is not enough.",
          "Day 3. Acknowledgment versus jurat. Date the certificate on the day of the act in front of you.",
        ],
        body: "After each day, answer the topic questions with the handbook closed. Daily study keeps the cards in this state only.",
        link: { href: `${caPaths.study}#identification`, label: "Identification chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "Days 4–6: journal, fees, and the acts you must refuse",
        points: [
          "Day 4. One sequential journal under your control, and the thumbprint for deeds, quitclaim deeds, deeds of trust, other real-property documents, and powers of attorney.",
          "Day 5. Section 8211 maximums, the “no fee” journal line, and the papers that take no fee.",
          "Day 6. Immigration advertising, the prohibited “notario” translation, and foreign-language documents you may notarize only when you can communicate directly.",
        ],
        body: "Day 5 is the largest scored area. Do not leave it for the last hour.",
      },
      {
        heading: "Day 7: one timed set",
        body: "Take one 45-question practice exam in 60 minutes. Then read only the items you missed. A second full set the same night mostly repeats stamina. The official sitting is still once in a calendar month, so the practice set is the place to spend the extra attempt.",
      },
    ],
    endCta: { href: `${caPaths.practice}?mode=full`, label: "Take the timed practice exam", placement: "end", targetMode: "full" },
    related: [
      { href: "/california/course-vs-exam-prep/", label: "Course versus this practice site" },
      { href: caPaths.study, label: "Study guide" },
      { href: handbook, label: "Current handbook" },
    ],
  }),
  item("cram-sheet", {
    id: "ca-cram",
    keyword: "california notary exam cram sheet",
    intent: "A last-pass checklist of California rules before a closed-book exam.",
    title: "California Notary Exam Cram Sheet",
    description: "A last-pass California notary checklist: closed book, scaled 70, $15 fees, $15,000 bond, and no remote online notarization yet.",
    h1: "California Notary Exam Cram Sheet: Rules to Review",
    kicker: "Cram sheet",
    lede: "Use this the day before the exam, after you have already studied. It is a checklist of rules in the current handbook and statutes. It is not a CPS HR question list.",
    checked: "CPS HR exam page, Government Code sections 8201, 8211, and 8212, and the January 2026 handbook, read November 7, 2026.",
    ledeCta: { href: `${caPaths.practice}?mode=full`, label: "Take one timed 45-question set", placement: "lede", targetMode: "full" },
    sections: [
      {
        heading: "Exam and appointment",
        points: [
          "Closed book. 45 multiple-choice items. One hour. 40 scored, 5 not scored.",
          "Scaled score of at least 70. Not the number correct divided by 45 or by 40.",
          "One valid sitting per calendar month.",
          "Age 18, California legal residence, approved course, exam, background check.",
          "Six-hour course before a first commission. Three-hour refresher only for a current commission that already completed the six-hour course, when you apply before that commission expires.",
          "Bond: $15,000 from an admitted surety insurer, not a cash deposit. Oath and bond within 30 calendar days or the commission does not take effect.",
        ],
        body: "The course certificate comes from an approved vendor or the Secretary of State. A score on this site is not that certificate.",
      },
      {
        heading: "Acts that get mixed up",
        points: [
          "Acknowledgment: the signer appears and admits the signature. You need not have watched the original signing. Maximum $15 per signature.",
          "Jurat: the signer signs in front of you and takes an oath or affirmation. Maximum $15.",
          "Satisfactory evidence is required. Knowing the signer is not a substitute.",
          "Journal: one active sequential journal, your property, under your control. Thumbprint for the real-property documents and powers of attorney named in section 8206.",
          "Vote-by-mail envelopes and specified veteran-benefit papers: no notary fee.",
          "Remote online notarization: not authorized yet. In-person electronic notarization is a different, currently allowed act.",
        ],
        body: "If two lines feel similar, open the matching chapter and do that topic only. A last pass that rereads every line equally will skip the pair you confuse.",
        link: { href: `${caPaths.questions}?topic=acknowledgment`, label: "Acknowledgment questions", placement: "section", targetMode: "topic" },
      },
    ],
    endCta: { href: `${caPaths.practice}?mode=full`, label: "Start the full practice exam", placement: "end", targetMode: "full" },
    related: [
      { href: "/california/open-book/", label: "Why the handbook stays closed" },
      { href: caPaths.passingScore, label: "Passing score" },
      { href: pdf, label: "2026 handbook PDF" },
    ],
  }),
  item("acknowledgment-vs-jurat", {
    id: "ca-ack-jurat",
    keyword: "california notary acknowledgment vs jurat",
    intent: "Choose the California certificate from the facts of the signing.",
    title: "California Acknowledgment vs. Jurat",
    description: "A California acknowledgment admits a signature. A jurat needs a new signature in front of the notary and an oath. The certificate date is the date of the act.",
    h1: "California Acknowledgment vs. Jurat: Examples and Practice",
    kicker: "Two certificates",
    lede: "Use an acknowledgment when the signer appears and admits that the signature is theirs. Use a jurat when the signer signs in front of you and swears or affirms that the contents are true. The certificate date is the date of that appearance, not the date the person wishes the document had been signed.",
    checked: "Civil Code section 1189 and Government Code section 8202, read November 7, 2026, with the fee ceilings in section 8211.",
    ledeCta: { href: `${caPaths.questions}?topic=acknowledgment`, label: "Practice acknowledgment questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "The facts that decide it",
        body: "A deed signed at home yesterday can take an acknowledgment today if the signer appears, is identified, and admits the signature. It cannot take a jurat unless the signer signs again in front of you and takes the oath. An acceptable jurat question is: “Do you swear or affirm that the statements in this document are true?” A raised hand is traditional and is not required.",
        points: [
          "Do not attach both certificates to make one act do both jobs.",
          "Do not date the certificate yesterday because the contract deadline passed.",
          "Each acknowledgment signature is a separate $15 maximum. A jurat is a $15 maximum. Charging nothing is allowed if the journal says “no fee” or “0”.",
        ],
      },
      {
        heading: "One original situation",
        body: "A signer brings an affidavit already signed at the kitchen table and asks for “the stamp.” The right response is to say a jurat needs a new signature in your presence and an oath. Completing an acknowledgment instead would certify a different act. If the signer will not sign again, you do not complete the jurat.",
        link: { href: `${caPaths.study}#jurat`, label: "Jurat chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "Check yourself",
        body: "Question: the signer signed a deed last week, appears today, and admits the signature. Which certificate fits? Answer: an acknowledgment dated today. A jurat is wrong because there is no new signature and no oath. Dating the certificate last week would state that the act happened on a day it did not. Refusing solely because you did not watch the original signing misunderstands an acknowledgment.",
      },
    ],
    endCta: { href: `${caPaths.questions}?topic=jurat`, label: "Practice jurat questions", placement: "end", targetMode: "topic" },
    related: [
      { href: "/california/notary-fees/", label: "What those acts may cost" },
      { href: `${caPaths.study}#acknowledgment`, label: "Acknowledgment chapter" },
      { href: civ("1189"), label: "Civil Code section 1189" },
    ],
  }),
  item("course-vs-exam-prep", {
    id: "ca-course",
    keyword: "california notary course vs exam prep",
    intent: "Separate the required approved course from practice questions on this site.",
    title: "California Notary Course vs. Exam Prep",
    description: "California requires a Secretary of State-approved course and a separate CPS HR exam. This site is exam practice. It does not issue the course certificate.",
    h1: "California Notary Course vs. Exam Prep: What You Need",
    kicker: "Course and practice",
    lede: "You need both an approved course and a passing CPS HR exam. The course is the education Government Code section 8201 requires. The exam is the closed-book test CPS HR administers. This website is practice for that exam. It is not an approved course, and it does not issue a proof-of-completion certificate.",
    checked: "Government Code sections 8201 and 8201.2, the January 2026 handbook pages 7 and 24–25, and the CPS HR statement that it administers the written exam only, all read November 7, 2026.",
    ledeCta: { href: caPaths.become, label: "See the appointment steps", placement: "lede", targetMode: "guide" },
    sections: [
      {
        heading: "Which course length applies",
        points: [
          "A first appointment needs a six-hour course approved by the Secretary of State.",
          "A three-hour refresher is for someone who holds a current commission, has already completed the six-hour course, and applies for the next commission before the current one expires.",
          "If the commission has expired, the January 2026 handbook says the six-hour course is required again.",
          "A six-hour approved course also satisfies a refresher. The reverse is not true.",
        ],
        body: "The Secretary of State approves vendors and may offer a course itself. A vendor’s certificate is the proof the application needs. A practice score, a flashcard streak, or a Pro purchase on this site is not that proof.",
      },
      {
        heading: "What the exam still requires after class",
        body: "CPS HR says it administers the written examination only and points education questions to the Secretary of State. Passing the class does not enter the scaled score. The exam is closed book, 45 items, one hour, and it may be taken once in a calendar month. Use practice to find the rules you cannot yet recall. Use the approved course to meet section 8201.",
        link: { href: `${caPaths.questions}?topic=education-exam`, label: "Course and exam questions", placement: "section", targetMode: "topic" },
      },
    ],
    endCta: { href: `${caPaths.practice}?mode=quick`, label: "Practice ten exam questions", placement: "end", targetMode: "quick" },
    related: [
      { href: "https://www.sos.ca.gov/notary/qualifications", label: "Official qualifications" },
      { href: exam, label: "CPS HR exam information" },
      { href: "/california/study-plan/", label: "Seven-day practice schedule" },
    ],
  }),
  item("notary-fees", {
    id: "ca-fees",
    keyword: "california notary fees allowed charges",
    intent: "The maximum California notarial fees and the acts that take no fee.",
    title: "California Notary Fees: Allowed Charges",
    description: "California notary fees max out at $15 for an acknowledgment or jurat. Some papers take no fee. Travel is a separate journal line.",
    h1: "California Notary Fees: Allowed Charges and Examples",
    kicker: "Fees",
    lede: "Government Code section 8211 sets maximums, not a required price. An acknowledgment or proof is at most $15 per signature, including the seal and certificate. An oath and jurat is at most $15. Charging less, or nothing, is allowed.",
    checked: "Government Code section 8211, read November 7, 2026. Amended by Stats. 2016, ch. 133, effective January 1, 2017. The journal practice is the January 2026 handbook treatment of section 8206.",
    ledeCta: { href: `${caPaths.questions}?topic=fees`, label: "Practice fee questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "The ceilings",
        points: [
          "Acknowledgment or proof: $15 maximum for each signature.",
          "Oath and jurat, including the seal: $15 maximum.",
          "Deposition: $30, plus $7 for the oath to the witness and $7 for the certificate to the deposition.",
          "Certifying a copy of a power of attorney under Probate Code section 4307: $15.",
          "Vote-by-mail ballot identification envelopes and other voting materials: no fee.",
          "Specified veteran pension, allotment, allowance, compensation, insurance, and other veteran-benefit papers: no fee, under section 6107.",
        ],
        body: "A late signer does not create a rush category above these amounts. Travel may be charged only as its own amount, and the journal records it separately from the notarial fee.",
      },
      {
        heading: "Two charging situations",
        body: "Three people each acknowledge the same deed. The maximum is $15 for each signature, $45, not $15 for the document. A neighbor’s acknowledgment at no charge is lawful. The journal line says “no fee” or “0”. It does not say $15 was charged. A military-reservation notary under section 8203.6, and a public-agency notary whose fees must be remitted, follow those separate limits.",
        link: { href: `${caPaths.study}#fees`, label: "Fee chapter", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: `${caPaths.questions}?topic=fees`, label: "Work the fee situations", placement: "end", targetMode: "topic" },
    related: [
      { href: "/california/bond-vs-insurance/", label: "Bond versus insurance" },
      { href: gov("8211"), label: "Section 8211" },
      { href: caPaths.laws, label: "Source list" },
    ],
  }),
  item("bond-vs-insurance", {
    id: "ca-bond",
    keyword: "california notary bond vs eo insurance",
    intent: "The required California notary bond is not errors-and-omissions insurance.",
    title: "California Notary Bond vs. E&O Insurance",
    description: "California requires a $15,000 notary bond from an admitted surety insurer. Errors-and-omissions insurance is a separate policy and does not replace the bond.",
    h1: "California Notary Bond vs. E&O Insurance: Key Differences",
    kicker: "Bond",
    lede: "The commission requires a $15,000 official bond from an admitted surety insurer. A cash deposit does not replace it. Errors-and-omissions insurance is a private policy. Section 8212 does not say that insurance satisfies the bond.",
    checked: "Government Code section 8212, read November 7, 2026. The 30-day filing rule is section 8213, as used in the January 2026 handbook and this site’s bond chapter.",
    ledeCta: { href: caPaths.become, label: "Where the bond sits in the appointment", placement: "lede", targetMode: "guide" },
    sections: [
      {
        heading: "What the bond does",
        body: "Every appointed notary executes the bond. It is a surety’s undertaking, filed with the oath. Section 8213 gives 30 calendar days after the commission term begins. If the oath and bond are late, the commission does not take effect. The county clerk of the business county handles the filing. This page does not sell bonds.",
        points: [
          "Amount: $15,000.",
          "Issuer: an admitted surety insurer.",
          "Not accepted: a deposit in lieu of the bond.",
          "Deadline: 30 calendar days, or that commission never starts.",
        ],
      },
      {
        heading: "What insurance does instead",
        body: "E&O insurance, if you buy it, pays according to its own contract. It can be aimed at your defense or your own loss. The bond is aimed at the statutory surety obligation. Buying a larger insurance limit does not file the bond, and filing the bond does not mean you hold insurance. An employer who pays the bond premium does not become the notary.",
        link: { href: `${caPaths.study}#bond-oath`, label: "Bond and oath chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "A timing example",
        body: "The commission packet says the term starts June 1. The oath and bond reach the clerk on July 2. That is outside the 30 calendar days. The commission does not take effect, even if an insurance policy was already purchased.",
      },
    ],
    endCta: { href: `${caPaths.questions}?topic=bond-oath`, label: "Practice bond questions", placement: "end", targetMode: "topic" },
    related: [
      { href: gov("8212"), label: "Section 8212" },
      { href: "/california/notary-fees/", label: "Fees, which are not the bond" },
      { href: caPaths.become, label: "Become a notary" },
    ],
  }),
  item("online-notarization", {
    id: "ca-ron",
    keyword: "can california notaries notarize online",
    intent: "Whether a California notary may perform a remote online notarization today.",
    title: "Can California Notaries Notarize Online?",
    description: "California notaries cannot perform remote online notarization yet. The Online Notarization Act is effective in stages. In-person electronic notarization is already allowed.",
    h1: "Can California Notaries Notarize Online? Current Rules",
    kicker: "Online notarization",
    lede: "No. A California notary cannot perform a remote online notarization by audio-video communication today. The person must physically appear. A video image is not personal appearance. In-person electronic notarization is a different act and is already allowed when the paper-act rules are met.",
    checked: "January 2026 Notary Public Handbook, pages 3, 27, and 43, read November 7, 2026. Government Code section 8231, read the same day, is effective January 1, 2024, and does not by itself authorize a remote act today.",
    ledeCta: { href: `${caPaths.questions}?topic=electronic-ron`, label: "Practice the remote-notarization questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "Signed, effective, and operative are three different statements",
        body: "The Online Notarization Act, Chapter 291, Statutes of 2023 (SB 696), was signed on September 30, 2023. The January 2026 handbook says the Act became effective on January 1, 2024, and is operative in stages. Recognition of notarial acts in Government Code sections 8232 through 8232.4, and Civil Code sections 1182 and 1183, were operative January 1, 2024. Section 8231.18, the security requirements, became operative January 1, 2025. Those dates do not let a notary host a remote signing.",
        points: [
          "Appointment, discipline, and the duties for remote online notarization wait until the Secretary of State finishes Notary Automation Project 2.0, or January 1, 2030, whichever is earlier.",
          "The handbook’s question-and-answer page says current law does not give authority to perform remote online notarization.",
          "A platform that says it is approved does not move that date.",
        ],
      },
      {
        heading: "What you can do now",
        body: "You may notarize an electronic record in person if the signer physically appears, you identify the signer, you use the seal as the paper rules require, and you take a thumbprint when the document requires one. You may not complete the act for someone who is only on a video call, even if that person is in another California county.",
        link: { href: `${caPaths.study}#electronic-ron`, label: "Electronic and remote chapter", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: caPaths.laws, label: "Read the source list", placement: "end", targetMode: "guide" },
    related: [
      { href: pdf, label: "January 2026 handbook" },
      { href: gov("8231"), label: "Government Code section 8231" },
      { href: "/california/acknowledgment-vs-jurat/", label: "The in-person certificates" },
    ],
    faqs: [
      { q: "Did the 2024 effective date make remote notarization available?", a: "No. The handbook says the Act is operative in stages. The parts that would let a notary perform remote online notarization wait for the Secretary of State’s technology project or January 1, 2030, whichever is earlier." },
      { q: "Is an in-person electronic document the same as online notarization?", a: "No. The handbook says electronic notarization is allowed now when the signer physically appears and the paper-act requirements are met. Remote audio-video appearance is not." },
    ],
  }),
];
