export const NC_CHECKED = "2026-11-13";

export const ncOfficial = {
  home: "https://www.sosnc.gov/notary",
  become: "https://www.sosnc.gov/divisions/notary/become_a_notary",
  forms: "https://www.sosnc.gov/forms/by_title/_notary",
  application: "https://www.sosnc.gov/webfiles/documents/forms/notary/initial_Application_for_nc_notary_public.pdf",
  rules: "https://www.sosnc.gov/webfiles/documents/adminrules/18_sos/18_NCAC_07_rules_july_2025.pdf",
  currentRules: "https://reports.oah.state.nc.us/ncac/title%2018%20-%20secretary%20of%20state/chapter%2007%20-%20notary%20public%20division/chapter%2007%20rules.html",
  statutes: "https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_10B/Article_1.html",
  courseLaw: "https://www3.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_10B/GS_10B-8.html",
  manual: "https://www.sog.unc.edu/publications/books/north-carolina-notary-public-manual-2026",
  manualNotice: "https://www.sosnc.gov/online_services/notary_external/notary_manual_home",
  colleges: "https://www.nccommunitycolleges.edu/students/what-we-offer/colleges/",
  counties: "https://www.ncard.us/find-your-register-of-deeds/",
};

/** Legal requirements are separate from NC_PRACTICE in lib/nc-site.ts. */
export const NC_INITIAL_REQUIREMENTS = {
  classroomHoursAtLeast: 6,
  monthsBeforeApplication: 3,
  passingPercent: 80,
  applicationFeeDollars: 50,
  oathDeadlineDays: 45,
  officialQuestionCount: null,
  officialTimeLimitMinutes: null,
  officialQuestionFormat: null,
} as const;

export const ncCourses = [
  {
    name: "Wake Technical Community College",
    url: "https://www.waketech.edu/programs-courses/non-credit/workforce-training/business/notary",
    registration: "Choose a Notary Public Education section and its Register button. Check whether your section includes the manual.",
  },
  {
    name: "Gaston College",
    url: "https://www.gaston.edu/economic-workforce-development/services-business-industry/notary-public-training/",
    registrationUrl: "https://ss-prod-cloud.gaston.edu/Student/InstantEnrollment/Search",
    registration: "Open the registration catalog and search for notary. Select the ordinary Notary Public course.",
  },
  {
    name: "Forsyth Technical Community College",
    url: "https://www.forsythtech.edu/notary-public-training/",
    registrationUrl: "https://my.forsythtech.edu/Student/InstantEnrollment/Search?keyword=SEF-3001PN",
    registration: "Look for Notary Public Education, SEF-3001PN. Follow the college's telephone or in-person instructions for sections that require them.",
  },
  {
    name: "Southwestern Community College",
    url: "https://www.southwesterncc.edu/workforce-innovations/professional-licensure/notary/",
    registrationUrl: "https://ss.southwesterncc.edu/Student/InstantEnrollment",
    registration: "Open Instant Enrollment, search for Notary and select the ordinary Notary Public class.",
  },
];

export const ncApplicationSteps = [
  {
    title: "Check eligibility and get your manual",
    body: "Be at least 18 or legally emancipated, reside or work regularly in North Carolina, reside legally in the United States, read, write and speak English, and hold a high school diploma or equivalent. Review the full eligibility and disqualification rules. Obtain your own current 2026 North Carolina Notary Public Manual before class.",
    links: [{ label: "Eligibility under G.S. 10B-5", url: ncOfficial.statutes + "#10B-5" }, { label: "Buy the 2026 manual from UNC", url: ncOfficial.manual }],
  },
  {
    title: "Enroll in an approved course",
    body: "Use the Secretary of State's ordinary-notary guidance and a college's Notary Public Education enrollment page. Confirm the section meets the initial-appointment requirements and check its current dates, price and delivery arrangements.",
    links: [{ label: "Secretary of State course guidance", url: ncOfficial.become }, { label: "Find a course", url: "/north-carolina/#courses" }],
  },
  {
    title: "Complete the course and written examination",
    body: "G.S. 10B-8(a) generally requires at least six hours of approved classroom instruction within the three months before applying and an approved written examination with at least 80% correct. This course-and-examination requirement does not apply to a licensed member of the North Carolina State Bar.",
    links: [{ label: "G.S. 10B-8", url: ncOfficial.courseLaw }, { label: "Current administrative rules", url: ncOfficial.currentRules }],
  },
  {
    title: "Get the instructor's signature and submit your application",
    body: "Use the initial application supplied through the Secretary of State forms page. Obtain the instructor's course certification, complete the application and sign its declaration before another notary. Submit within three months after the course and exam. The nonrefundable application fee is $50. The linked form instructs payment by check or money order payable to the NC Secretary of State. Mail to Notary Public Section, Department of the Secretary of State, PO Box 29626, Raleigh, NC 27626-0626. Follow the current form for delivery and payment instructions.",
    links: [{ label: "Official forms and instructions", url: ncOfficial.forms }, { label: "Initial application PDF", url: ncOfficial.application }, { label: "G.S. 10B-13 fee", url: ncOfficial.statutes + "#10B-13" }],
  },
  {
    title: "Take your oath at the county Register of Deeds",
    body: "After approval, check your email for the oath notification and contact the Register of Deeds in your county of commission. Take the oath within 45 days of the certificate of appointment issuance date. Complete the oath before performing notarial acts. The linked application lists a $10 oath fee. Confirm payment and identification arrangements with the county office.",
    links: [{ label: "G.S. 10B-10 oath requirement", url: ncOfficial.statutes + "#10B-10" }, { label: "Find your county office", url: ncOfficial.counties }, { label: "Oath instructions on the application", url: ncOfficial.application }],
  },
];
