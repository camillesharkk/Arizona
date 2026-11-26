# Priority practice page source review

Checked November 27, 2026 (Asia/Shanghai). The published questions retain their authored verification dates and the question-bank audit retains its original revisions and checksums.

## Arizona practice

- The live New Notary notice lists 45 questions, 60 minutes, an 80% passing score, and the 2026 manual built into the official exam. The practice page reports its own settings and links to the notice. The October 2026 manual PDF returned HTTP 403 in the source reader. The linked notice was readable and supports the exam-format statements. [Arizona Secretary of State New Notary notice](https://azsos.gov/business/notary-public/new-notary)
- The `/arizona/practice-test/` redirect retains the practice mode query and points to `/arizona-notary-practice-test/`. Existing alternate routes retain their current handling.

## Indiana application

- The May 4, 2026 system FAQ places document submission in Applicant Hub, followed by the course-ready email and Learner Hub course and exam. It lists the eight-year, $25,000 bond, a criminal record report dated within six months, employer consent for qualifying nonresidents, the 30-question exam with 24 correct to pass, and the 24-hour retake wait. It directs active commission holders to My Commission. [Indiana Secretary of State system FAQ](https://www.in.gov/sos/business/files/New-Notary-System-FAQs-5-4-26.pdf)
- The December 13, 2024 SOS overview, PDF page 4, lists $75 for a first application. The May 2026 FAQ quotes $75 for renewal. The first-application amount in the authenticated portal remains unverified, so the guide dates the published amount and directs applicants to the official portal for the live fee. The Applicant Hub URL responded. Its authenticated workflow was outside this check. [Published fee schedule](https://www.in.gov/sboa/files/SOS_Indiana-Notary-Public-Update_NEO_2024.pdf#page=4) [Applicant Hub](https://apphub.notary.sos.in.gov/)
- The indexed official guide revised May 20, 2024 lists the minimum age, citizenship or permanent legal residency, and Indiana residence or primary employment. The current Indiana Code link required JavaScript in the source reader and the direct INBiz guide PDF returned HTTP 403. The public page follows the published SOS requirements and workflow. [Indiana Secretary of State guide](https://inbiz.in.gov/Assets/NotaryGuide.pdf) [Indiana Code Article 33-42](https://iga.in.gov/laws/2026/ic/titles/33#33-42)

## Ohio questions and practice

- The live SOS education and testing page provides a filing-type table. An initial non-attorney applicant needs a three-hour program and test from an authorized provider. The table differentiates attorney, renewal and remote-online filings. The broad introductory wording, which groups all applicants under education and testing, is less specific than the filing-type table. Ohio’s administrative rule effective September 22, 2019 independently supports the non-attorney initial requirement. [Ohio Secretary of State education and testing](https://www.ohiosos.gov/notary/become-a-notary-in-ohio/education-and-testing) [Ohio Administrative Code 111:6-1-03](https://codes.ohio.gov/ohio-administrative-code/rule-111:6-1-03)
- The six original public examples reuse question revisions already approved in the question-bank audit. The oath in a jurat, direct true-copy certification prohibition, incomplete document restriction, corporate acknowledgment, and postapproval oath are supported by the Ohio Revised Code sections effective April 3, 2025. [R.C. 147.011](https://codes.ohio.gov/ohio-revised-code/section-147.011) [R.C. 147.141](https://codes.ohio.gov/ohio-revised-code/section-147.141) [R.C. 147.53](https://codes.ohio.gov/ohio-revised-code/section-147.53) [R.C. 147.01](https://codes.ohio.gov/ohio-revised-code/section-147.01) [Ohio Secretary of State application process](https://www.ohiosos.gov/notary/become-a-notary-in-ohio/application-process)

## New York practice

- The July–December 2026 statewide bulletin, marked updated November 24 on the DOS application page, describes a one-hour multiple-choice exam and pass/fail reporting. It omits a question count and numeric passing score. [DOS application page](https://dos.ny.gov/become-notary-public) [Current exam bulletin, page 4](https://dos.ny.gov/july-december-2026-notary-written-exam-info-and-schedule)
- The five original public examples reuse audited free revisions. The September 2026 License Law, p. 2, and Executive Law §130(1) support the appointment example. The live DOS FAQ supports the current New York bar member’s exam exemption and application fee, the $2 conventional fee limit subject to other law, the ten-year journal requirement, and the separation between registered electronic notarization and discontinued remote ink notarization. [September 2026 License Law](https://dos.ny.gov/system/files/documents/2026/09/notary-public-license-law_09.2026.pdf#page=2) [NYS Executive Law §130](https://www.nysenate.gov/legislation/laws/EXC/130) [DOS Notary Public FAQ](https://dos.ny.gov/notary-public-frequently-asked-questions)

## Reuse and verification

The practice landing and question page use `publicPracticeSamples` from the server-only module. A public entry approves one existing state/question/revision. Keep its bank audit fingerprint, free status, current eligibility, official evidence and option feedback. A later revision needs an explicit public review. Samples are selected and shaped on the server and rendered as HTML. The interactive full bank remains behind its existing APIs.

Run `node scripts/practice-seo-verify.mjs` to check source resolution, sample approval and revision fingerprints. Set `PACK_TEST_BASE_URL` to the isolated server and run `node scripts/public-practice-http-verify.mjs`. Add `--vercel-preview` when the server uses `VERCEL_ENV=preview` to check the existing shared Ohio preview robots policy. Enable `STATE_PREVIEW=1` on that server to verify the separate NY preview route.
