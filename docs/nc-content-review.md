# North Carolina content review

Reviewed on 2026-11-13 for the traditional in-person candidate pack.

## Delivered content

The bank contains 203 original published scenario questions with stable ids `nc-001` through `nc-203`. Exactly 60 are free and 143 require Pro. Every question includes four distinct options, its correct answer, an explanation, a separate explanation for each distractor, an exact section or rule reference, a resolving official source id, verification date, and a matching independent concept card.

The 77 independent knowledge cards are concept summaries written separately from question stems. They consolidate related assessment skills into rule, boundary, and common-mixup explanations. They do not use converted question fronts. The narrower internal skill aliases resolve to the independent card ids in the published questions.

The topic distribution is as follows.

- Identity and personal appearance has 32 questions, with 8 free and 24 Pro.
- Acknowledgments, oaths, and proofs has 36 questions, with 8 free and 28 Pro.
- Certificates and signatures has 36 questions, with 8 free and 28 Pro.
- Conflicts, refusal, and authority has 35 questions, with 8 free and 27 Pro.
- Fees and travel has 18 questions, with 8 free and 10 Pro.
- Seals and security has 16 questions, with 8 free and 8 Pro.
- Journals and confidentiality has 20 questions, with 7 free and 13 Pro.
- Traditional commission foundations has 10 questions, with 5 free and 5 Pro.

Correct-answer locations are balanced across A, B, C, and D with counts of 51, 51, 51, and 50. The rotation is deterministic, so question ids and answer content remain stable.

## Official sources checked

The current enacted Chapter 10B Article 1 was read directly from the General Assembly site. The review covered definitions, qualifications, the initial course and examination, territorial authority, the office oath, powers and limitations, language and improper-record restrictions, testimonials, fees, signatures, seal control and image, voluntary traditional journals, certificate sufficiency, contact-change notices, enforcement, and technical-error provisions. Individual statute source entries resolve to the owning sections. [Current Article 1](https://www.ncleg.gov/EnactedLegislation/Statutes/HTML/ByArticle/Chapter_10B/Article_1.html)

The official OAH Chapter 07 compilation was opened and reviewed for the traditional-service provisions used here, including the July 1, 2025 amendments. Source references identify specific rules and relevant subdivisions. The source registry points to the current HTML compilation and includes the official PDF document URL. The parent agent independently verified the live HTML through the SOS rules link. Direct HTML retrieval in this content task timed out, while the official PDF text was accessible. [Current OAH rules](https://reports.oah.state.nc.us/ncac/title%2018%20-%20secretary%20of%20state/chapter%2007%20-%20notary%20public%20division/chapter%2007%20rules.html) [Official OAH PDF](https://reports.oah.state.nc.us/ncac/title%2018%20-%20secretary%20of%20state/chapter%2007%20-%20notary%20public%20division/chapter%2007%20rules.pdf)

The SOS July 2025 rules compilation was also opened as an official cross-check. Relevant provisions included physical seal content and registered vendors, open vehicle-title assignments, foreign-language communication, travel pricing and written consent, incident reporting, confidentiality, and voluntary-journal standards. [SOS July 2025 rules compilation](https://www.sosnc.gov/webfiles/documents/adminrules/18_sos/18_NCAC_07_rules_july_2025.pdf)

The SOS 2026 Manual availability notice was retrieved through the web index, and the parent agent verified the live notice in the browser. It states that the 2026 edition replaces 2016 and each notary must possess a personal current copy. The full commercial manual text was not used as a source for any substantive rule question. Direct page retrieval in this content task returned 403. The manual question relies on the official availability notice and the statutory current-reference duty. [SOS 2026 Manual notice](https://www.sosnc.gov/online_services/notary_external/notary_manual_home)

## Legal boundaries applied

Traditional personal appearance, personal knowledge, satisfactory government-document identification, and the one-credible-witness route use North Carolina's exact statutory conditions. Credible identity witnesses must be personally known to the notary and personally know the identified person, with reliability and disinterest conditions.

The bank distinguishes acknowledgment of an existing signature, observed signing, oaths, affirmations, subscribing-witness proofs, and nonsubscribing genuine-signature proofs. It includes separate signature-by-mark and physical-inability designee procedures with their required notations, attendance, and witness signatures.

Certificate questions distinguish the act date, venue, commissioned name, legible name, expiration statement, English certificate language, specialized forms, representative-capacity rules, and truthful certification. They preserve the difference between a statutory record-preservation clause and the notary's remaining duty violation.

Fee questions use the current $10 traditional principal-signature cap and the oral-oath per-person rule, including the credible-witness exception. They cover optional fees, the specified absentee-ballot no-fee service, fee schedules, estimates, actual mileage, current IRS rate checks, advance written consent, consent contents, and consent preservation. No numeric federal mileage rate is hard-coded.

Traditional journals remain optional under G.S. 10B-38. Questions about a chosen journal expressly apply the current content, entry-control, canceled-act, privacy, access, and ten-year retention rules. Electronic journal format is discussed only as an available recordkeeping format for traditional acts. The bank does not teach remote or electronic notarization procedures or renewal workflows.

The initial course and examination question uses the published six-hour minimum, preceding-three-month timing, and 80-percent passing requirement, including the statutory North Carolina Bar exception. No official exam question count or time limit is asserted.

## Distinctiveness review

Each scenario was authored for this pack. No existing state bank was copied or converted by substituting names, dates, state names, or amounts. The scenarios test different statutory elements, exceptions, participant roles, timing duties, document defects, and operational decisions.

The audit checks normalized exact stem uniqueness, four distinct choices, complete feedback, contiguous ids, source resolution, concept-card resolution, topic coverage, exact access split, and card fronts independently worded from all question stems. A token-set Jaccard scan found no stem pair at or above 0.50 after common function words were removed. This lexical check supplements the manual review of the scenarios' fact patterns and decision points.

Repeated subject matter is purposeful where the law supplies different conditions. Examples include identity document issuer, currentness, photograph, and signature-or-description features, and the distinct direction, attendance, signing, witness-signature, notation, and notarization stages of a designee execution.

## Metadata and limitations

`last_verified_at` is 2026-11-13 throughout. `effective_from` identifies this authored content snapshot's availability date. All questions have version 1 and published status within the candidate bank.

The source registry contains 23 individual statute sections, the current administrative-rules compilation, and the SOS manual notice. Current official primary text supports all 203 published rows. The work does not claim reproduction of official examination items or independent legal-adviser certification.

## Verification

Run `node scripts/nc-content-verify.mjs` from the candidate web directory. The latest run passed with 203 published, 60 free, 143 Pro, and 77 independent cards. It reported no unresolved sources or concept ids, no duplicate stems or options within a question, and no stem-similarity review candidates at the configured threshold.

The parent agent owns full TypeScript, build, integration, access, browser, and preview acceptance. This content task made no commits. The shell's `git diff --check` reported that its candidate directory was not recognized as a Git work tree, so the parent must perform the final repository diff check in its owning Git context.
