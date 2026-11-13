# North Carolina candidate

## Delivery

Verified on 2026-11-13. Integration base is `origin/main` at `3c693ace5cbba4b4c454c9c2e1ae78b2aa14d390`. Candidate branch is `feature/north-carolina-notary-prep-20261113`. The commit accompanying this document is the candidate delivery.

Worktree is `C:\Users\20683\.codex\worktrees\north-carolina-candidate-1113\web`. The original `D:\webtest\web` work was preserved.

Local preview is [North Carolina](http://127.0.0.1:3431/north-carolina/). Run these commands from the candidate web directory to recreate isolated fixtures and start the preview.

```powershell
node scripts/nc-seed.mjs
node scripts/nc-preview-server.mjs
```

Seeding creates missing disposable `.tools/nc-data` fixtures and preserves existing local progress. Existing test password `TEST_PASSWORD` is imported from `scripts/pack-test-utils.mjs`. Accounts include `nc-free-desktop@example.invalid`, `nc-pro-desktop@example.invalid`, `nc-expired-http@example.invalid` and `nc-azpro-http@example.invalid`, with desktop, mobile and HTTP variants for each account kind. The preview uses the isolated file store and local grounded Tutor. Database transaction checks use local PGlite. Production service integration remains release acceptance work.

## Implemented scope

- NC home, Quick 10, Topic Practice, Comprehensive Practice, questions, Study Cards, Wrong Answers, Daily Study, study guide, resources, laws, first-application guide, exam guide and informational pricing routes.
- Existing navigation, typography, loading components, sitting persistence, favorites, guest import and 1→7→14→30-day review schedule.
- Stable NC bank key `north-carolina-notary-practice`, state-isolated data and server-side access checks.
- 203 published original questions, exactly 60 free and 143 Pro, across eight topics. There are 77 independent cards and zero question-derived cards. Each question has distinct choices, distractor feedback, official references, verification date and resolving concept cards. See [content review](nc-content-review.md).
- Free-only Quick 10 and free topic draws. Comprehensive Practice draws up to 60 accessible unique questions and is untimed. NC Pro draws from all 203 published questions. Site practice settings live in `lib/nc-site.ts`. Official requirements live separately in `data/nc-resources.ts`.
- Quick 10 shows correct counts and topic performance. A clear weak topic has at least two missed answers. Up to two weak topics link directly to cards and topic practice. A score of at least 8/10 provides course-finder and continued-practice actions. This threshold is a site guidance choice. Comprehensive results show raw performance, wrong answers and topic review.
- State-specific 60-day NC Pro uses product code `nc_exam_pro_60d` and state `NC`. NC-only Pro preserves existing states' free access. Historical entitlements retain their existing-state coverage. Three consecutive NC grants preserve all 180 days, and duplicate provider orders are idempotent.

## Official sources and enrollment checks

All source checks were completed on 2026-11-13. General initial applicants need at least six hours of approved classroom instruction within the three months before applying and at least 80% on the approved written examination. A licensed member of the North Carolina State Bar is exempt from that course-and-examination requirement. Official examination count, time and question format remain unset because the checked primary material did not establish them. [G.S. 10B-8](https://www3.ncleg.gov/EnactedLegislation/Statutes/HTML/BySection/Chapter_10B/GS_10B-8.html)

The live SOS ordinary-notary page links courses, community colleges, manual information and county offices. Its legacy community-college link was followed to the current system directory. [SOS initial appointment](https://www.sosnc.gov/divisions/notary/become_a_notary) [Current college directory](https://www.nccommunitycolleges.edu/students/what-we-offer/colleges/)

- Wake Technical Community College has ordinary Notary Public Education sections and per-section Register buttons. A live Register destination reached the student registration form requesting name and email. The site links the stable course page so applicants choose the current section. [Wake Tech](https://www.waketech.edu/programs-courses/non-credit/workforce-training/business/notary)
- Gaston College identifies the ordinary course and Instant Enrollment catalog. Search for notary. [Gaston](https://www.gaston.edu/economic-workforce-development/services-business-industry/notary-public-training/)
- Forsyth Technical Community College identifies ordinary course SEF-3001PN and its enrollment search. Follow telephone or in-person instructions where a section requires them. [Forsyth Tech](https://www.forsythtech.edu/notary-public-training/)
- Southwestern Community College identifies ordinary notary training and its Instant Enrollment system. Search for Notary and select the ordinary class. Catalog entry shells were reachable for these three colleges. Actual enrollment and payment were outside this link verification. [Southwestern](https://www.southwesterncc.edu/workforce-innovations/professional-licensure/notary/)

The checklist covers qualifications and the applicant's personal 2026 manual, course enrollment, completion, instructor certification and application submission, then the county oath. The live SOS forms index still links the supplied initial application PDF, marked Revised April 2018. Its $50 check-or-money-order fee, notarized applicant declaration, instructor certification and mailing address were read from the downloaded form. The live forms page specifies emailed oath notification. The oath is due within 45 days of certificate issuance. The form lists the $10 county oath fee. Each checklist step has official links. [Current forms index](https://www.sosnc.gov/forms/by_title/_notary) [Initial application](https://www.sosnc.gov/webfiles/documents/forms/notary/initial_Application_for_nc_notary_public.pdf)

The live SOS rules page points to the current OAH Chapter 07 HTML. The July 2025 SOS PDF is a supplementary reference. The live manual announcement and UNC book page confirm the 2026 edition. [Current rules](https://reports.oah.state.nc.us/ncac/title%2018%20-%20secretary%20of%20state/chapter%2007%20-%20notary%20public%20division/chapter%2007%20rules.html) [July 2025 PDF](https://www.sosnc.gov/webfiles/documents/adminrules/18_sos/18_NCAC_07_rules_july_2025.pdf) [SOS manual notice](https://www.sosnc.gov/online_services/notary_external/notary_manual_home) [UNC manual purchase](https://www.sog.unc.edu/publications/books/north-carolina-notary-public-manual-2026)

## Automated verification

These checks passed against the candidate runtime source.

- `node scripts/nc-content-verify.mjs` and `node scripts/nc-integration-verify.mjs`, covering 100 seeded draws, unique accessible questions, source/card resolution, answer distribution, no exact duplicate stems, no configured similarity candidates, result links, expiry and grant stacking.
- `node scripts/nc-http-verify.mjs` for guest-facing routes, free, NC Pro, expired NC and historical AZ Pro accounts, canonical/noindex, paid-question authorization, cross-state rejection, concurrent import/replay deduplication, favorites, Daily Study, settings, Tutor and server-scored comprehensive submissions.
- `node scripts/nc-production-gates-verify.mjs` against the production build on port 3432. NC routes and state mutations return 404, AZ/NY remain accessible, and the sitemap excludes NC.
- Existing `questions:verify`, `quiz:verify`, `sitting:verify`, `study:verify`, `mistakes:verify`, `commerce:verify` and `paddle:verify`. Question verification retains one pre-existing AZ exam-day coverage warning and reports zero failures.
- Existing guest progress, browser storage, account read, dashboard guest, NY entry/progress and plan-race scripts. Seven-state import tests cover repeated/concurrent replay. PGlite checks cover transaction rollback/retry and keep the seven-state ten-answer import within ten SQL calls.
- Existing-state HTTP entitlement regression for AZ, CA, HI and NY with free, active and expired accounts.
- `npx tsc --noEmit` and `node scripts/nc-preview-server.mjs --build`. Next 15.5.24 built 253 pages successfully. Dependency manifests and lockfiles are preserved.

## Browser observations

Desktop testing used the local application. Mobile testing used a 390×844 browser viewport. Some mobile actions used keyboard activation after pointer automation selected an adjacent control. Physical handheld testing remains pending.

- State selection opened NC. The course CTA scrolled to the course list. Homepage Quick 10 started with one activation.
- Desktop guest Quick 10 completed at 3/10. Wrong Answers led through normal login to NC, showing seven wrong-answer cards. Refresh retained each item with Wrong 1. Study This Rule opened the matching topic deck.
- Mobile guest Quick 10 completed at 5/10. Login returned to NC Wrong Answers with five cards. Refresh retained the records without duplicate counts. A later mobile Quick 10 completed at 10/10 and exposed course-finder and continued-practice actions. The course action reached `#courses`.
- Free Comprehensive Practice started 60 unique questions with no timer. Refresh retained the first selection. Completing all 60 produced 15/60 and 45 wrong answers. Topic recommendations targeted the matching NC topic and card routes.
- NC Pro Comprehensive Practice included paid questions, retained its selection after refresh, completed all 60 and produced 15/60 with 45 wrong answers. A wrong answer was favorited and scheduled for Daily Study. Daily Study loaded cards, a paid-question preset and next-day review.
- NC Pro→AZ Daily Study displayed the AZ free set. Returning to NC restored the NC daily question position. Free account NC→AZ→NC preserved the practice destination. AZ Full 45 started with its normal timer and survived refresh. Its free-account submission encountered the shared save failure below.

## Shared integration handoff

These findings were delivered to chat `01a1cf95-d179-7a11-b2ec-814e4aec3141`, titled “验收 PA 与 LA+加速网站主要页面”, on branch `codex/guest-progress-speed-20261113`. Fixes and integration retests remain pending.

The owning chat acknowledged the handoff and reported work in progress on explicit POST/hydration handling and practice remounting. Its final repair SHA and integrated acceptance results were still pending at candidate delivery.

1. A cold login page accepted input before hydration and submitted a native GET once, putting the disposable local fixture password into the query string. `components/AuthForm.tsx` uses an onSubmit handler without a form method, and PasswordField has a password field name. Reproduce with delayed/disabled hydration, inspect the method, then confirm NC return and import after the shared fix. Hydrated login passed the NC guest-import cases.
2. A free signed-in NC account switched to AZ, started Full 45, refreshed, completed it and hit 402 while saving individual paid-question answers. The exam record can persist while `ExamRunner.finish` waits on a rejected progress save. Inspect `components/ExamRunner.tsx` and `app/api/progress/route.ts` trial authorization. Recheck AZ completion, NC return and state isolation after the shared fix.
3. Switching a completed result to another practice mode could retain an old runner result. NC now remounts by state/mode/focus using a narrowly scoped key in `components/PracticeLaunch.tsx`. Shared-state mode transitions were handed off to their owning branch.

After integrating shared fixes, rerun guest NC Quick 10→Wrong Answers→login→NC Wrong Answers→refresh/replay, plus NC→AZ→NC, AZ Full 45 completion and NC Practice, Study Guide, Wrong Answers, Daily Study and login return on desktop and mobile.

## Formal opening configuration

The candidate is preview-only. `NEXT_PUBLIC_NC_PREVIEW=1` enables local selection and `STATE_PREVIEW=1` enables server preview. Production middleware and state guards deny NC pages and writes. NC metadata uses noindex/nofollow and the public sitemap omits NC.

Formal opening requires the NC product and price, NC-specific checkout/webhook mapping to `nc_exam_pro_60d` with state NC, paid-order entitlement acceptance, and a deliberate release change to state registration, production guards, robots metadata and sitemap. Free study is usable in this candidate while the purchase entry remains informational. Real payment and production entitlement issuance remain release acceptance work.
