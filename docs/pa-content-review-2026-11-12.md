# Pennsylvania content review — November 12, 2026

## Scope and inventory

Content was authored in `D:\webtest\pa-la-acceptance` against the existing Pennsylvania bank. The original `pa-001` through `pa-040` IDs remain present. The active Arizona export was read during this task and contained 203 questions, establishing a Pennsylvania floor of 203.

- Published Pennsylvania questions total 203, with 30 free and 173 Pro questions.
- The bank contains 31 obtaining, 125 performing and 47 compliance questions.
- Independent study cards total 50. Forty new concept cards supplement the ten existing authored cards. Question-to-card conversions contribute zero to this count.
- Ten original English guides each contain 375–405 words in their lede and section bodies.
- Three additional reference articles serve passing score, laws and application routes.
- Every published question has three actual choices, a single correct answer, separate feedback for each choice, an official reference and a verification date of November 12, 2026.

## Official materials read during this task

- The Department's RULONA PDF contains 57 Pa.C.S. Chapter 3 through the November 2022 amendments. The reviewed sections include definitions, conflicts, act requirements, appearance, remote acts, identity, refusal, recognition of other jurisdictions' acts, certificates, stamps, journals, electronic records, appointment, education, sanctions, advertising, validity and fees. [Official statute PDF](https://www.pa.gov/content/dam/copapwp-pagov/en/dos/programs/notary/electronic-notarization/RULONA-Act-73-of-2013-as-amended-11-2022.pdf)
- Current 4 Pa. Code Chapter 167 was read alongside the statute, including sections 167.2–167.45, the act-specific sections 167.61–167.71, electronic and remote notification provisions, and standards of conduct and sanctions. This supplies the operative regulations effective March 28, 2026. [Current Chapter 167](https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/004/chapter167/chap167toc.html)
- The Department's regulation summary was read for the appointment-date transition, bond and stamp changes, journal information and access, fees, identification, language, notification and copy restrictions. [Regulation guidance](https://www.pa.gov/agencies/dos/programs/notaries/notary-regulations-changes)
- The Department's fee page, updated April 6, 2026, was read for receipt implementation, ordinary fee units, the additional technology fee, related administrative charges, waivers and fee ownership. [Fee guidance](https://www.pa.gov/agencies/dos/programs/notaries/notary-public-fees)
- The Department's examination page was read for commission-lapse treatment, six-month authorization, the separate examination fee, reapplication after unsuccessful authorization and the one-attempt online option. [Examination requirement](https://www.pa.gov/agencies/dos/programs/notaries/examination-requirement)
- The Pearson VUE bulletin headed March 2026 and marked revision 05/2026 was read for examination format, content outline, scheduling, the single OnVUE attempt, retake reservation waiting period and scaled-score reporting. Its outline expressly lists 4 obtaining, 18 performing and 3 compliance scored items. [Candidate bulletin](https://www.pearsonvue.com/content/dam/VUE/vue/en/documents/publications/283980.pdf)

## Editorial review and preserved history

All 163 additions were independently authored as distinct situations or operational decisions. They extend the bank across name formats, application timing, bond maintenance, official-signature moves, identification alternatives, credible-witness limitations, signature timing, oaths, copy screening and comparison, protests, certificate completion, journal controls, fee units, remote evidence, foreign-location conditions, custody, conflicts and sanctions. The additions use original stems and distractors. Each incorrect option has feedback addressing its particular mistake.

The original four-choice authoring rows retain their existing three-choice publication transformation. The correct option remains included and the two retained distractors and feedback were reviewed. New items are authored with three choices directly. Their initial correct positions vary by stable numeric ID, before the shared sitting presentation logic runs.

Two existing items received substantive corrections with stable IDs and version 2.

- `pa-014` adds all current credible-witness conditions, including personal knowledge of the signer, contemporaneous appearance, absence of direct or pecuniary interest and the prescribed verification.
- `pa-040` now describes a translated record whose source record is in a language the notary does not understand. It follows the precise scope of section 167.44(b), with the translator verification, attachments and English-certificate rule.

The root implementation must register both version changes in `PA_REVISIONS`, retaining earlier performance through the existing revision-history projection. All other original item versions remain 1. Original IDs and the full-exam selection quotas remain unchanged.

## Examination configuration boundaries

Comprehensive practice remains 30 questions with 25 scored practice items selected at 4 obtaining, 18 performing and 3 compliance. Five additional items use the site's pretest distribution of 1 obtaining, 3 performing and 1 compliance. The bulletin discloses the scored outline and total pretest count. It does not disclose the topical distribution of those five pretest items, so that distribution is identified as a site setting.

The official passing result is scaled 75. The bulletin does not disclose a raw correct-answer threshold or a conversion allowing a practice percentage to be treated as the official scaled result. No such threshold is asserted in the content. The new guides cover substantive practice topics and are counted separately from the three core reference pages and shared exam guide.

## Verification evidence

The following checks were executed against live TypeScript exports on November 12, 2026.

- Direct Node imports of `pa-content.ts` and `pa-articles.ts` succeeded.
- Inventory assertions returned 203 questions, 30 free, 50 independent cards, ten articles and the three reference keys.
- Duplicate question IDs, normalized question stems, card IDs and repeated answer choices all returned zero.
- Every question passed the three-choice, feedback, source and verification-date checks.
- A 1,000-seed full and Quick 10 exercise returned zero errors. Each full sitting had 30 unique questions, five pretest IDs and scored quotas of 4/18/3. Each quick selection contained ten questions.
- A separate lexical review queue using content-word Jaccard similarity at 0.60 returned no candidate pairs. Manual concept and legal review was also performed.
- `npx tsc --noEmit --pretty false` exited 0 after all Pennsylvania content files were complete.
- `git diff --check` returned no whitespace errors at the content checkpoint.

The first shared `pack-content-audit.mjs` run correctly reported pending integration of the new articles and the two revised IDs. The root agent owns those shared registry changes and final route, persistence and browser acceptance. The direct Pennsylvania content checks above had already passed.

## Files in this content change

- `data/pa-content.ts`
- `data/pa-question-additions.ts`
- `data/pa-card-additions.ts`
- `data/pa-articles.ts`
- `docs/pa-content-review-2026-11-12.md`

This content review makes no production deployment or public launch claim. Runtime acceptance, account and entitlement flows, shared persistence compatibility, and protected preview validation are handled by the parent implementation task.
