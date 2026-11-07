# Hawaii bank. Each row tests a different rule or application. Checked 2026-11-07.
# correct option is always options[0]; hi_emit.py rotates choices.

ROWS: list[dict] = []

AG = "https://ag.hawaii.gov/notaries-public/"
HAR = "https://ag.hawaii.gov/wp-content/uploads/2022/03/HAR-Ch-5-11.pdf"
HRS = "https://www.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/"
FAQ = "https://notary.ehawaii.gov/notary/public/faq.html"
SCHED = "https://notary.ehawaii.gov/notary/public/notary-scheduler.html"
DOCS = "https://ag.hawaii.gov/notaries-public/notaries-public-documents/"


def add(study: str, difficulty: str, text: str, right: str, wrongs: list[str], why: str, miss_right: str, miss_wrong: list[str], source: str) -> None:
    if len(wrongs) != 3 or len(miss_wrong) != 3:
        raise SystemExit(f"bad choices: {text[:60]}")
    ROWS.append({
        "study": study,
        "difficulty": difficulty,
        "text": text,
        "options": [right, *wrongs],
        "correct": 0,
        "why": why,
        "miss": [miss_right, *miss_wrong],
        "source": source,
    })


def src(label: str, url: str) -> str:
    return f"{label}; {url}; checked 2026-11-07"


# --- qualification ---
add("qualification", "easy",
    "Who commissions Hawaii notaries public?",
    "The Department of the Attorney General",
    ["The county clerk alone", "The Office of the Lieutenant Governor", "Any sitting circuit judge, without an application"],
    "HRS §456-1 and the Attorney General's notary page place commissioning with the attorney general.",
    "Correct. The attorney general commissions notaries for the State.",
    ["The clerk files the bond. The clerk does not issue the commission.", "The Lieutenant Governor authenticates documents. That office does not commission notaries.", "A judge approves the bond. The commission comes from the attorney general."],
    src("HRS §456-1; AG Notaries Public", AG))

add("qualification", "easy",
    "What minimum age does the Attorney General's current notary page require?",
    "18",
    ["21", "25", "There is no age minimum"],
    "The Attorney General's notary page, checked 2026-11-07, lists at least 18 years old. HAR §5-11-21 also asks for verification that the applicant is at least 18.",
    "Correct. Both the current AG page and HAR §5-11-21 use 18.",
    ["21 is not the age on the AG page or in HAR §5-11-21.", "25 is not the published minimum.", "The page and the rule both require proof of age 18 or older."],
    src("AG Notaries Public; HAR §5-11-21", AG))

add("qualification", "easy",
    "Which residence fact is stated both on the Attorney General's notary page and in HAR §5-11-21?",
    "The applicant must be a Hawaii resident",
    ["Any U.S. resident may be commissioned for Hawaii", "Residence is required only for remote online notaries", "A neighbor-island resident must instead be commissioned by that county"],
    "The AG page requires a Hawaii resident. HAR §5-11-21(b)(7) says the application may require proof of State residence.",
    "Correct. Hawaii residence is the consistent requirement.",
    ["The commission is for this State, and the published requirement is Hawaii residence.", "Remote online notarization is an extra commission. Residence is part of the underlying notary application.", "The attorney general commissions for the State. Counties do not issue a separate commission."],
    src("AG Notaries Public; HAR §5-11-21(b)(7)", HAR))

add("qualification", "medium",
    "A study item asks you to pick one immigration-status sentence as the only Hawaii qualification. The AG overview page and HAR §5-11-21(b)(5) do not use the same wording. What should you do?",
    "Do not treat either sentence as the single settled test until the two wordings are reconciled",
    ["Use only the older FAQ, because FAQs outrank statutes", "Copy the Arizona citizenship rule", "Treat a work visa and a citizen as identical because both appear somewhere online"],
    "The AG page says a citizen, a national, or a permanent resident alien who diligently seeks citizenship when eligible. HAR §5-11-21(b)(5) asks for proof of citizenship, national status, or that the person is an alien authorized to work. Those are not the same test. This bank does not grade a single immigration answer.",
    "Correct. The conflict is left open. It is not turned into a fake official answer.",
    ["A FAQ does not outrank a current statute or rule, and this conflict is between the AG page and the rule.", "Arizona rules are not Hawaii qualifications.", "The two official wordings are different. They are not a license to merge them."],
    src("AG Notaries Public compared with HAR §5-11-21(b)(5)", AG))

add("qualification", "medium",
    "Who may write the character letter for a notary application?",
    "A Hawaii resident who is not a relative and not the employer, and who can speak to honesty, trustworthiness, financial integrity, and moral character",
    ["The applicant's employer", "A relative who lives in Hawaii", "Any customer, with no residence requirement"],
    "HAR §5-11-21(a)(2) requires a letter of character recommendation from a State resident who is not a relative or employer and who can attest to those traits.",
    "Correct. That is the character-letter rule in HAR §5-11-21(a)(2).",
    ["The employer writes the justification letter, not the character letter.", "A relative is excluded.", "The writer must reside in this State."],
    src("HAR §5-11-21(a)(2)", HAR))

add("qualification", "medium",
    "Who prepares the letter of justification when the applicant is self-employed?",
    "The applicant",
    ["A relative", "The circuit court clerk", "The Lieutenant Governor"],
    "HAR §5-11-21(a)(3) says the justification letter comes from the employer or, if the applicant is self-employed, from the applicant, and it must explain in detail why the commission is sought.",
    "Correct. A self-employed applicant writes that letter.",
    ["A relative is not the justification writer.", "The clerk files the bond later. The clerk does not write this letter.", "The Lieutenant Governor is not part of the application letter."],
    src("HAR §5-11-21(a)(3)", HAR))

add("qualification", "medium",
    "An applicant wants a commission only to notarize one employer's private files and says the public will be turned away. What does the Attorney General's application page require the justification letter to state?",
    "The reasons for the commission, the estimated number and type of notarial acts, and that the notary will serve the general public",
    ["That the notary will serve only the employer", "That a remote online commission is already approved", "That no bond will be filed"],
    "The AG notary page says the justification letter should state the reasons, the estimated number of acts, the type of documents, and that the notary will serve the general public.",
    "Correct. Service to the general public is part of that page's instruction.",
    ["An employer-only limit contradicts the page.", "Remote online authority is a later, separate commission.", "The bond is still required before the notary begins the duties of the commission."],
    src("AG Notaries Public, justification letter", AG))

add("qualification", "hard",
    "A person wants to be a notary in government service. What must accompany that application?",
    "A letter of justification from the head of every government department where the applicant is employed, designating the applicant to notarize that entity's business without charge",
    ["Only a personal check for $1,000", "A letter from a relative", "Nothing beyond the ordinary character letter"],
    "HAR §5-11-21(c) requires that government-notary application to include a justification letter from the head of every such department and to designate free notarial service for that government business.",
    "Correct. That is the government-notary letter.",
    ["The bond amount is not a substitute for the department letter.", "A relative cannot supply this designation.", "The government letter is additional."],
    src("HAR §5-11-21(c); HRS §456-18", HAR))

add("qualification", "medium",
    "The application may ask about criminal history. Which convictions does HAR §5-11-21(b)(4) name?",
    "Any felony, and a misdemeanor related to notary duties or involving fraud, false statements, wrongful taking, bribery, perjury, forgery, counterfeiting, extortion, or a conspiracy to commit one of those",
    ["Traffic tickets only", "No conviction may be asked about", "Only felonies committed in Hawaii"],
    "HAR §5-11-21(b)(4) lists those categories and does not limit them to Hawaii offenses.",
    "Correct. That is the disclosure list in the rule.",
    ["The rule is not limited to traffic cases.", "The application may require this history.", "The text is not limited to Hawaii convictions."],
    src("HAR §5-11-21(b)(4)", HAR))

add("qualification", "easy",
    "Where does a first-time applicant file the notary application?",
    "Online with the Attorney General's notary system",
    ["By mail only, because mail-in is still required", "At the Lieutenant Governor's office", "At any U.S. post office"],
    "The AG resources page says that effective July 1, 2017, applications are processed online and mail-in applications are not accepted after June 30, 2017. The AG notary page says to apply online.",
    "Correct. The current instruction is the online application.",
    ["Mail-in applications stopped after June 30, 2017.", "The Lieutenant Governor does not take notary applications.", "A post office is not the filing office."],
    src("AG notary resources page", "https://notary.ehawaii.gov/notary/public/resources.html"))

add("qualification", "medium",
    "An application is still missing the required letters 100 days after it was first filed. What may the Attorney General do under HAR §5-11-22(b)?",
    "Treat it as abandoned, decline to act on it, and destroy it",
    ["Issue the commission anyway", "Hold it open for one year with no further papers", "Convert it into a remote online commission"],
    "HAR §5-11-22(b) says an application may be abandoned if it is not completed within 90 days from the first filing. The attorney general need not act on it, and it may be destroyed.",
    "Correct. Ninety days is the abandonment point in that subsection.",
    ["A missing application is not approved by silence.", "The rule uses 90 days, not a one-year hold.", "Remote online authority is a separate application by someone who already holds a notary commission."],
    src("HAR §5-11-22(b)", HAR))

add("qualification", "medium",
    "How long does HAR §5-11-22(a) give the Attorney General to investigate, if needed, and to notify the applicant of the status of a complete commission application?",
    "Six months after the complete application is filed, unless another law provides otherwise",
    ["Ten days", "Thirty days in every case", "There is no time provision"],
    "HAR §5-11-22(a) says that, unless otherwise provided by law, the attorney general shall take those actions within six months after a complete application is filed.",
    "Correct. The rule states six months for a complete application.",
    ["Ten days is not the application-action period.", "Thirty days is the exam-result notice period, not this deadline.", "The subsection states the six-month period."],
    src("HAR §5-11-22(a)", HAR))

add("qualification", "hard",
    "A denial notice under HAR §5-11-22(a)(2) must include which extra information?",
    "The reason for the denial and the right to a hearing under chapter 91, HRS, and chapter 5-1",
    ["Only the exam score", "A promise that the next filing is automatic", "Instructions to obtain an apostille"],
    "If the application is denied, the written notice states the reason and informs the applicant of the hearing right.",
    "Correct. Reason and hearing rights are required in the denial notice.",
    ["Exam results are a later notice, after an approved applicant tests.", "A denial is not an automatic later approval.", "An apostille is unrelated to an application denial."],
    src("HAR §5-11-22(a)(2)", HAR))

add("qualification", "easy",
    "Is a remote online notary commission a substitute for a first notary commission?",
    "No. Only a notary with an active commission may apply for the remote online commission",
    ["Yes. A first-time applicant starts with the remote commission", "Yes, if the person lives on Oahu", "Yes, if the person pays the $1,000 bond twice"],
    "HAR §5-11-62(a) and the AG page both say only a notary public with an active commission may apply for a remote online notary commission.",
    "Correct. Remote authority is additional and comes after an active notary commission.",
    ["A first-time applicant is not eligible for the remote commission.", "Island of residence does not replace the active-commission requirement.", "Paying the bond twice is not the remote-commission path."],
    src("HAR §5-11-62(a); AG Notaries Public", AG))

add("qualification", "medium",
    "What identification must the notary application be able to require under HAR §5-11-21(b)(6)?",
    "A current government-issued photo identification",
    ["A library card", "A business card", "An expired passport of any age"],
    "HAR §5-11-21(b)(6) lists proof of identity by a current government-issued photo identification. Signer-ID rules in HRS §456-1.6 are a different subject and allow some credentials expired no more than three years.",
    "Correct. The application rule asks for current government photo identification.",
    ["A library card is not government photo identification.", "A business card is not a government photo ID.", "The application paragraph says current. Do not import the signer rule into this application item."],
    src("HAR §5-11-21(b)(6)", HAR))

from hi_rows_b import more as more_b
from hi_rows_c import more as more_c
from hi_rows_d import CARDS, CHAPTERS, more as more_d

more_b(add)
more_c(add)
more_d(add)
