import type { StateArticle } from "@/lib/state-articles";

const root = "/new-york";
const checked = "Official sources checked November 12, 2026.";
const bulletin = "https://dos.ny.gov/july-december-2026-notary-written-exam-info-and-schedule";
const nyc = "https://dos.ny.gov/new-york-city-november-december-2026-notary-public-examination-instructions-and-schedule";
const apply = "https://dos.ny.gov/become-notary-public";
const law = "https://dos.ny.gov/notary-public-license-law-0";
const statute = (chapter: string, section: string) => `https://www.nysenate.gov/legislation/laws/${chapter}/${section}`;
const official = (href: string, label: string) => ({ href, label, placement: "section" as const, targetMode: "official" as const });

function guide(slug: string, title: string, description: string, sections: StateArticle["sections"]): StateArticle {
  return {
    id: `ny-page-${slug}`, state: "NY", slug, path: `${root}/${slug}/`, keyword: title,
    intent: "Official-source study guidance", title, h1: title, description, lede: description,
    kicker: "New York guide", checked, updated: "2026-11-12", sections,
    ledeCta: { href: `${root}/practice/`, label: "Open New York practice", placement: "lede", targetMode: "quick" },
    endCta: { href: `${root}/study-cards/`, label: "Review New York study cards", placement: "end", targetMode: "guide" },
    related: [
      { href: `${root}/passing-score/`, label: "Exam results and passing requirements" },
      { href: `${root}/laws/`, label: "New York notary laws" },
      { href: `${root}/become-a-notary/`, label: "Application and appointment" },
      { href: `${root}/resources/`, label: "Sources and articles" },
    ],
  };
}

// These reference pages are separate from the ten original articles in nyArticles.
export const nyPassingScore = guide("passing-score", "New York exam results and passing requirements",
  "How the Department of State reports exam results, how to retake the exam, and how to read your practice results.", [
    {
      heading: "Official examination and results",
      body: "Applicants who need the examination must pass it before applying. The July–December 2026 bulletin describes a multiple-choice examination with one hour after instructions. Results arrive by mail as passed or failed. The bulletin leaves the item count and numerical passing threshold unspecified, so this guide keeps those official values unknown.",
      link: official(bulletin, "DOS examination bulletin and score reporting"),
    },
    {
      heading: "After a pass or an unsuccessful attempt",
      body: "Keep your passing notice for the commission application. Examination results remain valid for two years. After an unsuccessful attempt, the bulletin permits another examination date and time. Check the current schedule and its admission instructions before traveling. Each examination requires the published $15 fee.",
      link: official(bulletin, "DOS results, retakes and examination fee"),
    },
    {
      heading: "New York City admission",
      body: "The November–December 2026 NYC instructions require an email scheduling request and a confirmation before attending. Follow the requested information and dates in that document. Other examination locations use the arrangements in the statewide bulletin. Schedules can change.",
      link: official(nyc, "Current NYC scheduling instructions"),
    },
    {
      heading: "Reading results on this site",
      body: "Quick 10 reports correct answers out of ten. Eight correct is this site's study recommendation. The complete practice uses 40 questions and a 60-minute timer as site settings. Its result records the number correct and a practice percentage. Use the explanation and topic review to decide what to study next. The Department of State makes the official examination decision.",
    },
  ]);

export const nyLaws = guide("laws", "New York notary laws",
  "Study the applicable rule, its conditions and the distinctions that change how a notarial act is performed.", [
    {
      heading: "Appointment and authority",
      body: "Executive Law §130 establishes a four-year commission and statewide jurisdiction. A New York resident can retain the commission after moving away while maintaining a New York office or business. A nonresident who ceases to maintain that connection vacates the office. Appointment, examination and renewal requirements should be checked for the applicant's circumstances.",
      link: official(statute("EXC", "130"), "Executive Law §130"),
    },
    {
      heading: "Acknowledgment and oath",
      body: "An acknowledgment involves the signer's acknowledgment of executing the instrument. An oath or affirmation adds a present commitment to the truth of a statement. The required personal appearance and the correct certificate matter in each procedure. For real-property acknowledgments, review the statutory form and complete its particulars for the actual transaction.",
      link: official(statute("RPP", "309-A"), "Real Property Law §309-a"),
    },
    {
      heading: "Evidence of identity",
      body: "Real Property Law §303 requires personal knowledge or satisfactory identity evidence for an acknowledgment. Part 182.5 lists the applicable identity methods. Traditional appearance and remote appearance have different conditions. Read the full rule before selecting a credential or credible-witness method.",
      link: official(statute("RPP", "303"), "Real Property Law §303"),
    },
    {
      heading: "Journals and retained records",
      body: "Part 182.9 requires records for traditional and electronic acts, with ten-year retention. Review the required entry fields, identity method and service details. Electronic acts also require the prescribed audio-video record. A journal entry and an electronic recording serve separate recordkeeping duties.",
      link: official(law, "DOS License Law, Part 182.9"),
    },
    {
      heading: "Fees and certificate information",
      body: "Executive Law §136 sets $2 fees for the specified traditional oaths, affirmations, acknowledgments and proofs, subject to the statute's conditions. Electronic-service fees are established by regulation. Separately, §137 specifies the commission information beneath the notary's signature. Read the applicable act and certificate requirements together.",
      link: official(statute("EXC", "136"), "Executive Law §136"),
    },
    {
      heading: "Electronic notarization",
      body: "Executive Law §135-c requires electronic-notary registration and an electronic notary physically in New York. Communication technology connects the parties by sight and sound. Check Part 182 for identity, technology, certificate and recordkeeping conditions before performing the act.",
      link: official(statute("EXC", "135-C"), "Executive Law §135-c"),
    },
    {
      heading: "Legal documents and professional limits",
      body: "Judiciary Law §484 restricts preparing the listed legal instruments and practicing as an attorney without admission, subject to its exceptions. A request for a notarization can include a separate request for legal drafting or advice. Identify the requested service and stay within the authority you hold.",
      link: official(statute("JUD", "484"), "Judiciary Law §484"),
    },
    {
      heading: "Read the complete rule",
      body: "The DOS booklet brings statutes, Part 182 and defined terms together. Use it to review the identity alternatives and journal fields in full. A question's cited section identifies the rule being tested. Recheck current official material before performing a transaction.",
      link: official(law, "September 2026 DOS License Law booklet"),
    },
  ]);

export const nyApplication = guide("become-a-notary", "How to become a New York notary",
  "Follow the qualification, examination, oath, application and appointment steps for a New York commission.", [
    {
      heading: "1. Check your qualifications",
      body: "Applicants must be at least 18 under Public Officers Law §3. Confirm your New York residence or office/business connection. Executive Law §130 also addresses character, education and knowledge of notarial duties. Read the application questions and disclose required background information for the Department's determination.",
      link: official(statute("PBO", "3"), "Public Officers Law §3"),
    },
    {
      heading: "2. Pass the examination or establish an exemption",
      body: "Study the DOS License Law booklet and use the current examination instructions. The examination fee is $15. New York-admitted attorneys and qualifying Unified Court System clerks have statutory examination exemptions. Keep the passing slip for your application. Confirm the exemption that applies to you in Executive Law §130.",
      link: official(statute("EXC", "130"), "Executive Law §130 examination provisions"),
    },
    {
      heading: "3. Complete the oath before applying",
      body: "Use DOS-2201 and sign in the presence of a commissioned notary. Complete the oath before beginning the application and prepare its scan for upload. The name for the commission must match the signature as directed on the form.",
      link: official("https://dos.ny.gov/notary-public-oath-office-dos-2201", "DOS-2201 oath and instructions"),
    },
    {
      heading: "4. Prepare your application documents",
      body: "The application guidance calls for a passing-slip copy or examination exemption, a completed oath in PDF form, a personal NY.gov account and the required personal and address information. Online filings accept credit or debit card payment. Keep the names consistent across the application, affirmation and oath.",
      link: official("https://dos.ny.gov/notary-public-application-guidance", "DOS application guidance"),
    },
    {
      heading: "5. Apply through New York Business Express",
      body: "Start from the DOS application page and follow its New York Business Express link. Sign in or create the NY.gov account, select the commission type and submit the requested documents and payment. The initial application fee is $60. Track the application in your account and respond to any request for further information.",
      link: official(apply, "DOS application steps and fees"),
    },
    {
      heading: "6. Wait for appointment and check your commission",
      body: "Under Executive Law §131, the Secretary of State approves the appointment and issues the commission and identification card. The oath and signature record go to the appropriate county clerk. Check the name, county and commission dates when approval arrives. Executive Law §130 sets the term at four years.",
      link: official(statute("EXC", "131"), "Executive Law §131 appointment procedure"),
    },
    {
      heading: "Plan the examination and application separately",
      body: "The DOS lists $15 for an examination, $60 for an initial application and $60 for renewal. Use the current exam bulletin for admission arrangements and the application page for filing. New York City has separate scheduling instructions. Recheck the current documents when choosing your examination date.",
      link: official(apply, "DOS requirements, fees and current exam documents"),
    },
  ]);
