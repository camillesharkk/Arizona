# New York bank review — 2026-11-09

## Baseline and coverage

The executable bank initially returned 87 consecutive unique IDs, 29 free and 58 Pro. IDs 016, 054 and 055 retain the previous batch's corporate execution, personal participation in a protested instrument, and corporate coworker oath replacements. Their source references and per-row verification dates are present. Batch 5 has 20 individually dated records with section 135-c references and four-option feedback.

Coverage review compared the stems and decisions in all 87 records with the September 2026 DOS handbook table of contents and the official statutes below. The five existing study buckets are broad product categories, not official exam domains or weights. Electronic material already occupies 30 records. No electronic records were added in this batch.

| Area | Baseline finding | Batch decisions |
| --- | --- | --- |
| Appointment | Fees, term, moving and attorney exemptions covered; eligibility decisions and procedural safeguards weak | 088–094: initial location, nonresident process service, ordinary renewal waiver, military waiver, removal hearing, conviction review, attorney county residence |
| Oaths | Depositions and duty to administer present; actual undertaking and form underrepresented | 095, 105–107, 115: attorney-client affidavit, affirmation, outside-state oath certification, oath-of-office scope exclusion, conscious undertaking |
| Certificates and proof | Form selection and placement covered; evidentiary and execution requirements weak | 098, 101–104, 117: rebuttable certificate, witness testimony, acknowledgment of execution, representative capacity, actual subscribing-witness observation, will attestation distinction |
| Fees and authority statement | Single-acknowledgment fee duplicated | 097, 099–100: protest seal surcharge, attorney title, permissible typed statement; replace 017 with foreign-use jurisdiction disclosure |
| Conduct and liability | False certificate, wills drafting, corporate conflicts present; distinct civil and criminal routes weak | 096, 108–114, 116: damages, unappointed holding out, electronic advertising, misleading titles, first-violation civil penalty, affirmative misconduct, deliberate omission, deed forgery, legal fee sharing |

Remaining coverage work includes ordinary identity evidence and Part 182 requirements, journal/reporting duties, certificate authentication, acknowledgment/proof exceptions, and handbook terminology. This is a prioritization list, not a claim that the remaining 86 items can be filled by paraphrasing these rules.

## Duplicate review

- 008/017 asked the same single-person acknowledgment fee. Kept 008; rewrote 017, retaining its ID and free access, to test section 135's required naming of the other jurisdiction when exercising authorized foreign-use powers.
- 005/053 share the attorney exemption but test different decisions: exemption eligibility versus the surviving application fee.
- 009/057 overlap on commissioned name, but 009 tests the combined non-marital update transaction; 057 isolates how to execute during the current term. Flag for further editorial consolidation rather than treating wording differences alone as proof of independence.
- 026/060 overlap on recording retention; 060 additionally tests deletion despite a written journal and the backup obligation. This remains an overlap to monitor in the full-bank audit.
- 112/113 intentionally test the two different statutory routes in Penal Law 195.00: knowingly unauthorized action versus knowing omission of a duty. Both stems supply the required benefit-related intent.
- All new stems were compared against the existing bank. None repeats an existing decision merely by changing a name or amount. No exact duplicate stems were reported.

## Official material actually opened

- DOS, *Notary Public License Law*, September 2026: https://dos.ny.gov/notary-public-license-law-0 — table of contents, professional conduct (printed page 5), appointment and powers sections. The older URL without `-0` returned 403; the PDF was reached through the official Notary Public page's link.
- https://dos.ny.gov/notary-public — official scope and current handbook link.
- Executive Law 130, 135, 135-a, 135-b, 137: https://www.nysenate.gov/legislation/laws/EXC/130 (substitute the section in the final path).
- Real Property Law 306 and 309-a: https://www.nysenate.gov/legislation/laws/RPP/306 and https://www.nysenate.gov/legislation/laws/RPP/309-A.
- CPLR 2309: https://www.nysenate.gov/legislation/laws/CVP/2309.
- Penal Law 195.00 and 170.10: https://www.nysenate.gov/legislation/laws/PEN/195.00 and https://www.nysenate.gov/legislation/laws/PEN/170.10.

Each new record cites its specific clause/location and the actual review date, 2026-11-09. Review checked statutory conditions, one best answer, and the reason each distractor fails. Ordinary and electronic knowledge are distinguished; no official exam percentage or item count is inferred from this allocation.

## Validation

- `node scripts/ny-bank-audit.mjs`: 117 records, 29 free, 88 Pro; only failure is the unchanged 203-record gate. IDs 001–117 are consecutive and unique; required field and exact-stem checks report no errors.
- `npx tsc --noEmit`: exit 0.
- Actual HTTP response from `/preview/new-york/questions/` contained 117 unique question IDs, including 088 and 117. This verifies the rendered page payload, not logged-in entitlement behavior.
- Existing study buckets after this batch: appointment 62, fees 11, electronic 30, exam-day 12, journal 2.
- Cards, login, production build, deployment and full-state acceptance were outside this batch. No claim of 50 independently reviewed cards is made.
- Remaining numerical target: 86 additional questions; existing overlap flags still require full-bank editorial resolution. No commit, push or publication performed.
