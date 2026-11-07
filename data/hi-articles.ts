import { hiPaths } from "@/lib/hi-site";
import type { StateArticle } from "@/lib/state-articles";

const ag = "https://ag.hawaii.gov/notaries-public/";
const har = "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf";
const scheduler = "https://notary.ehawaii.gov/notary/public/notary-scheduler.html";
const hrs = (file: string) => `https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/${file}`;

function item(slug: string, article: Omit<StateArticle, "state" | "slug" | "path" | "updated">): StateArticle {
  return { ...article, state: "HI", slug, path: `/hawaii/${slug}/`, updated: "2026-11-07" };
}

export const hiArticles: StateArticle[] = [
  item("exam-retake", {
    id: "hi-retake",
    keyword: "hawaii notary exam retake rules",
    intent: "The Hawaii retake window after a failed notary exam.",
    title: "Failed the Hawaii Notary Exam? Retake Rules",
    description: "After a first Hawaii notary exam failure, a reexamination without a new application is available only inside 14 days of the notice. A second failure brings a 90-day wait.",
    h1: "Failed the Hawaii Notary Exam? Retake Rules and Next Steps",
    kicker: "Retake",
    lede: "A first failure can be retaken without a new application only if you request the reexamination, pay the exam fee, and schedule it within 14 calendar days of the failure notice. Miss that window and you file a new application. A second failure means a 90-day wait before a new application.",
    checked: "HAR §5-11-32 and the fee lines in HAR §5-11-46, as used in the published study notes checked November 7, 2026. The Attorney General page, read the same day, confirms the written closed-book exam and does not publish a question count.",
    ledeCta: { href: `${hiPaths.questions}?topic=application-exam`, label: "Practice the retake questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "The 14 days are a request window",
        body: "The 14 days run from the failure notice. They are not 14 days to keep studying and then decide. The request, the exam fee, and the new date all have to be handled inside that period. The exam fee on the rule schedule is $10. That is not the $20 application fee and not the $25 no-show fine.",
        points: [
          "More than 48 hours before the sitting, a reschedule is $15.",
          "Less than 48 hours before the sitting, a reschedule is $20.",
          "Missing the exam without a reschedule request received before the exam time is a $25 fine, plus a new application with updated letters.",
        ],
      },
      {
        heading: "What the score does not tell you",
        body: "HAR §5-11-32 sets an 80 percent minimum and written results within 30 days. It does not publish the number of questions, the time limit, or topic weights. A 50-question set on this site is practice. It is not the official form, and 80 percent on that set is not an official result.",
        link: { href: `${hiPaths.study}#application-exam`, label: "Application and exam chapter", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: `${hiPaths.practice}?mode=quick`, label: "Start a free Quick 10", placement: "end", targetMode: "quick" },
    related: [
      { href: hiPaths.passingScore, label: "The 80 percent minimum" },
      { href: "/hawaii/exam-scheduling/", label: "How a seat is booked" },
      { href: har, label: "HAR Chapter 5-11" },
    ],
    faqs: [
      { q: "Can I retake the next morning without a new application?", a: "Only if the request, the exam fee, and the new schedule all fall within 14 calendar days of the failure notice. A same-day unlimited retake is not the rule." },
      { q: "What if I fail twice?", a: "HAR §5-11-32 requires a 90-day wait before a new application after a second failure." },
    ],
  }),
  item("open-book", {
    id: "hi-open-book",
    keyword: "is the hawaii notary exam open book",
    intent: "Whether the Hawaii notary exam allows the manual in the room.",
    title: "Is the Hawaii Notary Exam Open Book?",
    description: "The Hawaii notary exam is a written closed-book exam. The manual is for study. It is not a reference during the test.",
    h1: "Is the Hawaii Notary Exam Open Book? How to Prepare",
    kicker: "Closed book",
    lede: "No. The Attorney General’s notary page says an approved applicant takes a written, closed-book examination on the statutes and rules that apply to Hawaii notaries, and on the practical duties of the office. You do not look answers up in the manual during the exam.",
    checked: "Attorney General Notaries Public page, read November 7, 2026. HAR §5-11-32 supplies the 80 percent minimum. It does not supply a question count or a time limit.",
    ledeCta: { href: `${hiPaths.practice}?mode=quick`, label: "Try 10 questions without notes", placement: "lede", targetMode: "quick" },
    sections: [
      {
        heading: "Study with the book, then close it",
        body: "The page gives an example list, including HRS §§456-1 to 456-21, parts of chapter 502, and HRS §§603-1, 621-12, and 621-13. HAR §5-11-33 names its own subject list and does not assign weights. Neither list is a permission slip to bring the book into the room. Read a section, then answer a question from memory.",
      },
      {
        heading: "Do not import another state’s format",
        body: "Hawaii has not published an official question count, time limit, or item type. This site’s Comprehensive Practice uses 50 questions and no countdown because that is a practice setting. Calling those 50 questions the official exam would be false. Quick 10 shows the explanation after each item so a closed-book miss can be corrected immediately.",
        link: { href: hiPaths.examGuide, label: "What is and is not published", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: `${hiPaths.practice}?mode=quick`, label: "Start Quick 10", placement: "end", targetMode: "quick" },
    related: [
      { href: ag, label: "Attorney General notary page" },
      { href: "/hawaii/cram-sheet/", label: "Rules to review" },
      { href: hiPaths.study, label: "Study guide" },
    ],
  }),
  item("how-hard", {
    id: "hi-how-hard",
    keyword: "how hard is the hawaii notary exam",
    intent: "What makes the Hawaii exam difficult, without a fake pass rate.",
    title: "How Hard Is the Hawaii Notary Exam?",
    description: "The Hawaii notary exam is closed book and requires 80 percent. The published difficulty is rule choice, not a pass rate. No official pass rate is posted.",
    h1: "How Hard Is the Hawaii Notary Exam? A Readiness Guide",
    kicker: "Readiness",
    lede: "It is a written closed-book exam with an 80 percent minimum. The Attorney General does not publish a pass rate, a question count, or a time limit. This page does not invent those numbers. The difficulty that is visible in the rules is choosing the right condition, not recognizing a vocabulary word.",
    checked: "Attorney General notary page and HAR §§5-11-32 and 5-11-33, checked November 7, 2026. Fee contrasts use HRS §456-9 and HAR §5-11-46.",
    ledeCta: { href: `${hiPaths.practice}?mode=quick`, label: "Check 10 questions", placement: "lede", targetMode: "quick" },
    sections: [
      {
        heading: "Pairs that produce wrong answers",
        points: [
          "HRS §456-9 prints $40 for issuance and renewal and allows the rules to adjust the fees. HAR §5-11-46 lists issuance and renewal at $100, the application at $20, and the exam at $10. A question that names the statute is not answered by the rule line.",
          "A Hawaii driver’s license expired two years ago can still identify a signer if it has a photo and a signature. One expired four years ago cannot. The limit is three years, not “must be unexpired.”",
          "An incomplete document the signer plans to finish later is a reason to refuse. Disagreement with the purpose of a completed lawful document is not.",
          "Remote online notarization is a later commission for an active notary. It is not a block of the first exam just because the manual has a chapter.",
        ],
        body: "Eight of ten on Quick 10 only picks the next study step. It is not the official 80 percent. Comprehensive Practice also uses an 80 percent target, on its own 50-question set, and that result is practice feedback.",
      },
      {
        heading: "A readiness sequence",
        body: "Take Quick 10 with no notes. Open the chapter for the topic you missed. Then answer only that topic. A second Quick 10 that repeats the same ten facts does not show that you can handle the fee-statute contrast or the identity exception.",
        link: { href: hiPaths.mistakes, label: "Missed questions", placement: "section", targetMode: "topic" },
      },
    ],
    endCta: { href: hiPaths.mistakes, label: "Review the topics you missed", placement: "end", targetMode: "topic" },
    related: [
      { href: hiPaths.passingScore, label: "Passing score" },
      { href: "/hawaii/open-book/", label: "Closed-book rule" },
      { href: hiPaths.study, label: "Study guide" },
    ],
  }),
  item("study-plan", {
    id: "hi-study-plan",
    keyword: "hawaii notary exam study plan",
    intent: "A seven-day Hawaii study order tied to the manual and practice.",
    title: "Hawaii Notary Exam Study Plan: 7 Days",
    description: "Seven days of Hawaii notary study: the manual and the current statute, then closed-book practice. The 50-question set is this site’s practice, not the official exam.",
    h1: "Hawaii Notary Exam Study Plan: A 7-Day Schedule",
    kicker: "7-day plan",
    lede: "Spend seven days on the rules an approved applicant has to recall closed-book. Read the current statute or rule when the 2023 manual is older. This plan does not guess the official question count, because none is published.",
    checked: "Attorney General page, read November 7, 2026. Topic order follows the duties named there and in HAR §5-11-33. The manual PDF is the April 14, 2023 file linked from the documents page.",
    ledeCta: { href: hiPaths.daily, label: "Open daily study", placement: "lede", targetMode: "daily" },
    sections: [
      {
        heading: "Days 1–3: who may be commissioned, then the exam rules",
        points: [
          "Day 1. Age 18, Hawaii residence, and the citizenship or permanent-resident status on the Attorney General page. The justification letter and the character letter are different documents.",
          "Day 2. Closed book, 80 percent, the 14-day first retake, the 90-day wait after a second failure, and the $10, $15, $20, and $25 exam-day amounts.",
          "Day 3. Four-year term, the $1,000 bond, and the difference between a timely renewal and a restoration.",
        ],
        body: "Daily study on this site stays in the Hawaii card set. It does not mix in another state.",
        link: { href: `${hiPaths.study}#qualification`, label: "Qualifications chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "Days 4–6: the acts",
        points: [
          "Day 4. Identity under HRS §456-1.6, including the three-year expiration window.",
          "Day 5. Acknowledgment versus jurat, and the $5 in-person fee for each.",
          "Day 6. Journal entries, the one rubber stamp, and the fee-schedule contrast between the statute and the rule.",
        ],
        body: "Leave remote online notarization for a short pass at the end of day 6. It is a separate commission, not the spine of the first exam.",
      },
      {
        heading: "Day 7: one comprehensive set",
        body: "Take the 50-question Comprehensive Practice. There is no countdown. Read the misses. Do not treat 40 correct as an official pass. Hawaii’s official minimum is 80 percent of the official exam, and the length of that exam is unpublished.",
      },
    ],
    endCta: { href: `${hiPaths.practice}?mode=full`, label: "Start Comprehensive Practice", placement: "end", targetMode: "full" },
    related: [
      { href: hiPaths.study, label: "Study guide" },
      { href: "/hawaii/cram-sheet/", label: "Last-pass checklist" },
      { href: "https://ag.hawaii.gov/wp-content/uploads/2023/04/Notary-Manual-website-version-2023_AG-website_updated-2023-04-14.pdf", label: "2023 manual" },
    ],
  }),
  item("cram-sheet", {
    id: "hi-cram",
    keyword: "hawaii notary exam cram sheet",
    intent: "A last-pass Hawaii checklist of rules and mix-ups.",
    title: "Hawaii Notary Exam Cram Sheet",
    description: "A Hawaii notary cram sheet: closed book, 80 percent, $1,000 bond, $5 act fees, and the statute-versus-rule commission fees.",
    h1: "Hawaii Notary Exam Cram Sheet: Rules and Common Mistakes",
    kicker: "Cram sheet",
    lede: "Use this after you have studied, not instead of the manual. Every line below is a rule that is easy to swap with a neighboring rule. The official exam’s length and time are still unpublished.",
    checked: "Attorney General page, HRS §§456-1, 456-1.6, 456-5, 456-9, and 456-17, and HAR §§5-11-32 and 5-11-46, checked November 7, 2026.",
    ledeCta: { href: `${hiPaths.practice}?mode=full`, label: "Take Comprehensive Practice", placement: "lede", targetMode: "full" },
    sections: [
      {
        heading: "Appointment and exam",
        points: [
          "Attorney General commissions notaries. Age 18. Hawaii resident. The citizenship or permanent-resident condition is the one on the current Attorney General page.",
          "Written and closed book. Minimum 80 percent. Question count and time: not published.",
          "Exam fee $10. Application fee $20, not refundable. No-show $25. Reschedule $15 if more than 48 hours ahead, $20 if less.",
          "First failure: one reexamination without a new application, inside 14 days of the notice. Second failure: 90 days, then a new application.",
          "Term: four years. Bond: $1,000, State is the obligee, filed with the circuit clerk after a judge approves it.",
          "This site’s 50-question set is practice. It is not the official form.",
        ],
        body: "The character letter is not written by the employer or a relative. The justification letter is written by the employer, or by a self-employed applicant.",
      },
      {
        heading: "Acts and the mistakes next to them",
        points: [
          "Acknowledgment and jurat: $5 each for an in-person act. The acknowledgment admits the signature. The jurat is the oath about the contents.",
          "Identification may be expired, but not by more than three years, and it needs a photo and a signature.",
          "One rubber stamp at a time. A spare stamp in the drawer is not allowed.",
          "Journal: keep the tangible book for the paper acts for 10 years. Do not follow an older FAQ that says to turn the books in within 90 days.",
          "Commission fees: the statute prints $40 and allows a rule adjustment. The rule lists $100 for issuance and for renewal. Name the source the question names.",
          "Remote online notarization: a second commission for an active notary, with its own exam. A phone call is not a remote act.",
        ],
        body: "If a line surprises you, open that chapter before the comprehensive set. A checklist you cannot explain is not yet learned.",
        link: { href: `${hiPaths.study}#fees-bond`, label: "Fees and bond chapter", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: `${hiPaths.practice}?mode=full`, label: "Start the 50-question practice", placement: "end", targetMode: "full" },
    related: [
      { href: hiPaths.examGuide, label: "Exam guide" },
      { href: "/hawaii/open-book/", label: "Closed-book rule" },
      { href: har, label: "HAR Chapter 5-11" },
    ],
  }),
  item("exam-scheduling", {
    id: "hi-scheduling",
    keyword: "hawaii notary exam locations scheduling",
    intent: "How an approved Hawaii applicant finds and books an exam seat.",
    title: "Hawaii Notary Exam Scheduling",
    description: "Schedule the Hawaii notary exam only after the application is approved. Dates are on the live scheduler. Oahu is at least monthly. Neighbor-island dates are periodic.",
    h1: "Hawaii Notary Exam Scheduling: Locations and Booking Steps",
    kicker: "Scheduling",
    lede: "You schedule the exam after the Attorney General approves the application. Dates and places are on the live scheduler at notary.ehawaii.gov. This page does not list a session, because those dates change.",
    checked: "Attorney General notary page and the eHawaii exam scheduler, both read November 7, 2026. The page says exams are on Oahu at least once a month and on the neighbor islands periodically.",
    ledeCta: { href: scheduler, label: "Open the official scheduler", placement: "lede", targetMode: "official" },
    sections: [
      {
        heading: "The order of steps",
        points: [
          "Apply online with the justification letter, the character letter, and the $20 application fee. A government notary also needs the department letter.",
          "Wait for approval. An unapproved application does not have an exam seat.",
          "Use the Exam Scheduler to choose a date and pay the exam fee. The rule schedule lists the exam at $10.",
          "Oahu sessions are at least monthly. Neighbor-island sessions are periodic. Both can change.",
          "The office is the Notary Public Office, Department of the Attorney General, 425 Queen Street, Honolulu, HI 96813, (808) 586-1216.",
        ],
        body: "Follow the scheduler’s own instructions for what to bring to that date. This page does not add a document list the scheduler does not show.",
      },
      {
        heading: "Moving or missing the seat",
        body: "A request more than 48 hours ahead is the $15 reschedule fee. A request less than 48 hours ahead is $20. If you do not appear and did not ask to move the seat before the exam time, the fine is $25 and you file a new application with updated letters. The next date still comes from the scheduler.",
        link: { href: "/hawaii/exam-retake/", label: "If the result is a failure", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: `${hiPaths.practice}?mode=quick`, label: "Practice while you wait for a date", placement: "end", targetMode: "quick" },
    related: [
      { href: ag, label: "Attorney General requirements" },
      { href: hiPaths.become, label: "Become a notary" },
      { href: scheduler, label: "Scheduler" },
    ],
  }),
  item("acknowledgment-vs-jurat", {
    id: "hi-ack-jurat",
    keyword: "hawaii notary acknowledgment vs jurat",
    intent: "Choose the Hawaii act from the signer’s statement and the fee that follows.",
    title: "Hawaii Acknowledgment vs. Jurat",
    description: "A Hawaii acknowledgment admits a signature. A jurat is the signer’s oath that the contents are true. Each in-person act is $5 under the statute.",
    h1: "Hawaii Acknowledgment vs. Jurat: Examples and Practice",
    kicker: "Two acts",
    lede: "An acknowledgment certifies that the signer appeared and admitted the signature. A jurat certifies that the signer swore or affirmed that the contents are true. The certificate has to name the act that happened. The in-person fee for each is $5.",
    checked: "HRS §456-1.6 and §456-17, as used in the study guide checked November 7, 2026. The fee lines are the in-person amounts in the statute, not the remote-act amount.",
    ledeCta: { href: `${hiPaths.questions}?topic=acknowledgment`, label: "Practice acknowledgment questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "Match the certificate to the words the signer says",
        body: "If the signer admits a signature that is already on the paper, the act is an acknowledgment. If the signer swears the contents are true and signs in front of you, the act is a jurat. A certificate that says only that the signature was acknowledged does not describe a jurat. Do not use a loose certificate the signer will attach later, away from you.",
        points: [
          "Three people each acknowledging the same document in person: $5 each, $15, before any duplicate original.",
          "A jurat fee of $5 includes the certificate.",
          "Duplicate originals beyond four are $2.50 each. That line is not the fee for the first act.",
        ],
      },
      {
        heading: "One situation",
        body: "A signer brings a statement already signed at home and asks you to “notarize the oath.” There has been no oath in front of you. Completing a jurat would certify an oath that did not happen. If the signer will admit the existing signature and does not want an oath, the fitting act is an acknowledgment, and the certificate must say that.",
        link: { href: `${hiPaths.study}#jurat-oath`, label: "Jurats and oaths chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "Check yourself",
        body: "Question: the signer swears the contents are true, signs in front of you, and the form is captioned as an acknowledgment only. What is wrong? Answer: the caption does not describe the act. Changing the caption to a jurat, after the oath and the in-person signature, matches the facts. Charging the $25 remote fee would be wrong because nobody appeared remotely. Using a California jurat form would import another state’s certificate.",
      },
    ],
    endCta: { href: `${hiPaths.questions}?topic=jurat-oath`, label: "Practice jurat questions", placement: "end", targetMode: "topic" },
    related: [
      { href: "/hawaii/notary-fees/", label: "Act fees versus filing fees" },
      { href: hrs("HRS_0456-0001_0006.htm"), label: "HRS §456-1.6" },
      { href: `${hiPaths.study}#acknowledgment`, label: "Acknowledgment chapter" },
    ],
  }),
  item("notary-fees", {
    id: "hi-fees",
    keyword: "hawaii notary fees allowed charges",
    intent: "Separate Hawaii notarial-act fees from application and commission fees.",
    title: "Hawaii Notary Fees: Allowed Charges",
    description: "Hawaii notarial acts and commission fees are different schedules. An in-person acknowledgment is $5. The exam fee is $10. The rule’s issuance fee is $100.",
    h1: "Hawaii Notary Fees: Allowed Charges and Examples",
    kicker: "Fees",
    lede: "An in-person acknowledgment is $5 for each signer. An in-person jurat is $5, including the certificate. Those are charges for the act. The application, the exam, and the commission are a different schedule, and the statute and the rule do not print the same commission amount.",
    checked: "HRS §§456-9 and 456-17 and HAR §5-11-46, checked November 7, 2026. The Attorney General page confirms the $20 nonrefundable application fee by citing §5-11-46.",
    ledeCta: { href: `${hiPaths.questions}?topic=fees-bond`, label: "Practice fee questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "Charges for the notarial act",
        points: [
          "Acknowledgment, each signer, in person: $5.",
          "Jurat, including the certificate: $5.",
          "Protest of mercantile paper: $5 under §456-17(1).",
          "A duplicate certificate: $2.50. Extra duplicate originals beyond four use that amount.",
          "A remote online acknowledgment that is not the certificate on a duplicate original: $25 under §456-17(8). That amount is not the in-person fee.",
        ],
        body: "A government notary performs public business without a notarial fee. A private notary may reduce or waive a fee for a lawful reason. Waiving a fee does not change the journal entry.",
      },
      {
        heading: "Charges to become or remain a notary",
        body: "HRS §456-9 prints $40 to issue the commission and $40 to renew it, and it says the rules may adjust those fees. HAR §5-11-46 lists the application at $20, the exam at $10, and issuance and renewal at $100. Restoration on the rule is a $10 application plus $80, not one $90 line from an older FAQ. When you answer a question, use the line it names.",
        link: { href: `${hiPaths.study}#fees-bond`, label: "Fees and bond chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "One bill",
        body: "Two neighbors each acknowledge a deed in your office. The act fee is $5 plus $5. Adding the $20 application fee, the $10 exam fee, or the $100 issuance fee to their bill mixes your commissioning costs into their notarization. Those costs are yours.",
      },
    ],
    endCta: { href: `${hiPaths.questions}?topic=fees-bond`, label: "Work the fee situations", placement: "end", targetMode: "topic" },
    related: [
      { href: hrs("HRS_0456-0017.htm"), label: "HRS §456-17" },
      { href: hrs("HRS_0456-0009.htm"), label: "HRS §456-9" },
      { href: "/hawaii/bond/", label: "The bond, which is not a fee" },
    ],
  }),
  item("bond", {
    id: "hi-bond",
    keyword: "hawaii notary bond requirements",
    intent: "The Hawaii notary bond amount, obligee, and filing step.",
    title: "Hawaii Notary Bond Requirements",
    description: "Hawaii requires a $1,000 notary bond before the duties begin. The obligee is the State. A circuit judge approves it, and the circuit clerk keeps it.",
    h1: "Hawaii Notary Bond Requirements: What Applicants Need",
    kicker: "Bond",
    lede: "Before you perform the duties of the commission, HRS §456-5 requires a $1,000 surety bond at your own expense. The obligee is the State. The bond is not the application fee, and it is not errors-and-omissions insurance.",
    checked: "HRS §456-5, checked November 7, 2026. The commission sequence on the Attorney General page was read the same day.",
    ledeCta: { href: hiPaths.become, label: "See where the bond fits", placement: "lede", targetMode: "guide" },
    sections: [
      {
        heading: "The filing",
        points: [
          "Amount: $1,000.",
          "Surety: a surety company authorized to do business in Hawaii.",
          "Condition: faithful performance of the duties of the commission.",
          "Approval: a circuit judge.",
          "Custody: the clerk of the circuit court in the circuit where the notary resides.",
          "You cannot be your own surety.",
        ],
        body: "The clerk keeps the bond and a bond record. Leaving the original in a desk, with an employer, or with the Lieutenant Governor does not complete the filing. This page does not sell bonds.",
      },
      {
        heading: "Where it sits in the application",
        body: "The online application and the closed-book exam come first. The bond is filed so the commission can be used. A remote online notary commission is later, and only for someone who already holds an active notary commission. The $1,000 bond does not by itself create that remote commission.",
        link: { href: `${hiPaths.study}#fees-bond`, label: "Fees and bond chapter", placement: "section", targetMode: "guide" },
      },
    ],
    endCta: { href: `${hiPaths.questions}?topic=fees-bond`, label: "Practice bond questions", placement: "end", targetMode: "topic" },
    related: [
      { href: hrs("HRS_0456-0005.htm"), label: "HRS §456-5" },
      { href: hiPaths.become, label: "Become a notary" },
      { href: "/hawaii/notary-fees/", label: "Fees" },
    ],
  }),
  item("remote-online-notary", {
    id: "hi-ron",
    keyword: "hawaii remote online notary requirements",
    intent: "The separate Hawaii remote-online commission, not the first-exam weight.",
    title: "Hawaii Remote Online Notary Requirements",
    description: "A Hawaii remote online notary commission is a second step for an active notary. It has its own application, fee, and exam. A phone call is not a remote act.",
    h1: "Hawaii Remote Online Notary Requirements: A Practical Guide",
    kicker: "Remote online",
    lede: "An ordinary first commission does not authorize remote online notarization. Only a notary with an active commission may apply. The remote application, the remote exam, and the technology notice are separate. A telephone call, with no remote commission and no simultaneous sight and sound, is not a remote act.",
    checked: "Attorney General notary page, read November 7, 2026, for the active-commission requirement and the $20 remote application fee. The act rules are HRS §456-23 and HAR §§5-11-62 to 5-11-71, as summarized in the study guide checked the same day.",
    ledeCta: { href: `${hiPaths.questions}?topic=remote-online`, label: "Practice remote-notarization questions", placement: "lede", targetMode: "topic" },
    sections: [
      {
        heading: "Two commissions",
        points: [
          "First commission: the ordinary application, the closed-book exam at 80 percent, the $1,000 bond, and the four-year term.",
          "Remote commission: a further application by an active notary, a $20 fee, and a separate exam. HAR §5-11-64 uses the 80 percent minimum. The question count and time for that exam are not published.",
          "The remote commission ends with the underlying notary commission.",
          "The five-question identity quiz used in remote identity proofing is not either exam.",
        ],
        body: "The Attorney General page describes the remote application as available to active notaries. That is the application path. It does not mean every notary may notarize by video, and it does not assign the remote chapter a share of the first exam.",
      },
      {
        heading: "What the act itself requires",
        body: "The notary is in Hawaii. The signer appears by communication technology with simultaneous sight and sound. The notary notifies the Attorney General of the technology. The remote commission is filed with the circuit clerk within 30 days. The certificate states that communication technology was used. The recording is kept at least ten years. A signer outside the United States also has to meet the statute’s territorial limits.",
        link: { href: `${hiPaths.study}#remote-online`, label: "Remote chapter", placement: "section", targetMode: "guide" },
      },
      {
        heading: "A request to refuse",
        body: "An active notary who has not received the remote commission is asked to acknowledge a deed over the phone. There is no simultaneous sight and sound and no remote authority. The act is not performed. Offering the $25 remote fee does not create the authority.",
      },
    ],
    endCta: { href: `${hiPaths.study}#remote-online`, label: "Read the remote chapter", placement: "end", targetMode: "guide" },
    related: [
      { href: ag, label: "Attorney General remote application note" },
      { href: hrs("HRS_0456-0023.htm"), label: "HRS §456-23" },
      { href: "/hawaii/exam-retake/", label: "The ordinary exam’s retake rule" },
    ],
    faqs: [
      { q: "Is remote notarization part of the first Hawaii exam?", a: "No. The first exam follows approval of the ordinary application. Remote authorization is a later application for someone who already holds an active commission." },
      { q: "Does the handbook chapter set the exam weight?", a: "No. Hawaii has not published exam weights. A chapter in the manual is not a quota." },
    ],
  }),
];
