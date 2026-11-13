# Connecticut candidate

## Scope and implementation plan

The requested CT candidate reuses the existing PracticeLaunch, ExamRunner, StudyCardsClient, CloudMistakes, DailyStudyClient and authenticated progress endpoints. The integration base is 3c693ace5cbba4b4c454c9c2e1ae78b2aa14d390, including the shared guest-progress/loading work. Original working trees are preserved.

- [x] Verify current licensing, linked manual, forms and effective statutes.
- [x] Register CT paths, state storage, server validation and candidate-only access.
- [x] Author 203 questions, 60 free and 143 Pro, with at least 50 independent cards.
- [x] Implement handbook-first entry, application checklist and CT result actions.
- [x] Verify content, account access, imports, desktop/mobile and AZ switching.
- [x] Run existing checks, type checking and production build, then commit candidate.

The candidate uses /connecticut/ and CT. Comprehensive Practice has 40 site-configured questions and no timer. Official item count, timing, format and permitted reference materials remain unspecified. Purchase UI is hidden pending CT commercial setup. CT accepts a current CT entitlement or an existing ALL entitlement. Each learning record remains state-specific.

## Official source review

Checked on 2026-11-13. The licensing page links to a PDF whose filename still contains rev2023, but its cover and running header say Rev. 2026-1. The application exam is integrated into eLicense and every question must be correct under manual section 2.2. The licensing page links to https://www.elicense.ct.gov/.

- Licensing https://portal.ct.gov/SOTS/Business-Services/Notary/Notary-Public-Licensing
- Current linked manual https://portal.ct.gov/-/media/sots/business-services/notary/state_of_connecticut_notary_public_manual_rev2023.pdf?hash=16EF7EBB701DFF05F62495C282351BFF&rev=a50b095808bf4eb2a715e864480fe05a
- Forms https://portal.ct.gov/sots/business-services/notary/notary-forms
- Statutes https://www.cga.ct.gov/current/pub/chap_033.htm
- P.A. 26-81 section 13, effective July 1, 2026 https://www.cga.ct.gov/2026/ACT/PA/PDF/2026PA-00081-R00SB-00294-PA.PDF

Current manual sections 2.1–3.2 and current licensing/forms pages agree on age 18, CT residence or principal business, $120 nonrefundable application, handwritten sample, sworn jurat, unrelated character recommender known for a year, oath before acts, and recording within 30 days of receiving appointment. State employees using the appointment for official duties may attest for the application-fee exemption. Section 3-94e special state-police appointments have narrower official-duty authority. The ordinary applicant guide distinguishes those exceptions.

The current licensing page, current manual and P.A. 26-81 supersede the former $5 plus $0.35-per-mile fee. Current act cap is $10 plus mileage capped at the IRS business standard rate. No annual IRS dollar rate is hard-coded.

Manual section 4.2 permits an acknowledgment signed beforehand, while the appendix's generic improper-documents chart suggests every signature must be witnessed. CT acknowledgment content follows the specific section and statutory definition in section 3-94a(1). Remote appearance is a separate process under section 3-95b. Remote exclusions and paper-delivery rules are taught from that section. No old paper application or official examination answer key is used.

## Acceptance evidence

CT independent candidate acceptance passed on 2026-11-13. Desktop and phone-sized browser emulation were executed using headless Microsoft Edge through the repository's existing Playwright installation. Viewports were 1440×1000 and 390×844. This is phone emulation. Physical-phone testing remains outside the observed evidence.

The candidate branch is `feature/connecticut-notary-prep-20261113` in `C:/Users/20683/.codex/worktrees/connecticut-candidate-1113/web`. The local built preview is http://127.0.0.1:3438/connecticut/. The source checkout and every other agent worktree were preserved. Remote main still pointed to 3c693ac at the final fetch. The candidate is a local review branch.

## Delivered content and entry points

- 203 published original scenario questions with explicit stable CT IDs, 60 free and 143 Pro. Each has four authored choices, a reason for the correct answer, specific feedback for every wrong choice, an official reference, verification date and a mapped rule card.
- 51 independent rule cards, 0 question-derived cards and 10 original reading guides. Eight CT topics are available. Every rule has a free practice question.
- The home primary button and Quick 10 use the same `PracticeLaunch` and `ExamRunner` flow. Both start the free ten-question pool directly.
- Comprehensive Practice uses the chosen site setting of 40 questions, without a timer. The existing single free full-practice allowance is inherited, with additional sittings controlled by current Pro access.
- First Application Checklist, Study Guide, Study Cards, Wrong Answers, Daily Study, Questions, resources, current laws, examination instructions and access information are connected.
- CT-only Pro remains CT-scoped. Existing ALL entitlements cover CT. The existing 60-day product and server-side checks are reused. CT purchase links are hidden while commercial setup is pending.
- CT is enabled in the candidate by `NEXT_PUBLIC_CT_PREVIEW=1`. Production rejects CT routes and learning requests. All 23 CT content URLs have direct-request canonical URLs and noindex metadata. CT is excluded from the public sitemap.

## Shared component integration

- Navigation and state resolution use `lib/states.ts`, `lib/prep-navigation.ts`, `lib/ct-site.ts`, `lib/site-state.ts`, `lib/ca-site.ts`, `SavedState`, `Chrome` and `StateMenu`.
- Practice and results reuse `PracticeLaunch`, `ExamRunner`, `QuestionBlock` and `AnswerResult`. `CtResultNext` supplies the requested CT-specific next actions. A general manual link appears before answering, and item-specific references appear with the submitted explanation.
- Cards reuse `StudyCardsClient` with an optional initial card ID. `mistakeTargets` maps each CT item to its exact rule card and topic practice.
- Wrong Answers and Daily Study reuse `CloudMistakes` and `DailyStudyClient`. CT preset question sets, practice attempt and daily date scope the sitting keys. A CT initialization guard prevents an old sitting being written into a newly selected scope.
- Authenticated progress, import, mistakes, study settings and Tutor endpoints accept CT. Existing per-account/per-state storage and transaction paths are reused. No database migration is required.
- `/api/auth/me/` supplies CT rights and CT full counts while preserving one entitlement read and one history read per response.

## Observed browser acceptance

All ten combinations passed for desktop/mobile and guest, signed-in free, CT Pro, expired CT Pro and ALL Pro. The fixture's actual `/api/auth/me/` CT entitlement was asserted for signed-in cases. CT-only Pro was also checked to leave Arizona Pro false.

- Enter CT through the state selector and start Quick 10 in one click.
- Restore the same in-progress question after refresh.
- Finish 7/10 and 10/10 sets. The first result prioritizes Review Missed Questions and topic practice. The perfect result prioritizes Open Official Application. CT summary wording describes the completed practice.
- Open the general handbook link, display the submitted explanation with three wrong-choice explanations and the official pinpoint reference, start the matching topic practice and verify its CT topic/free-pool selection.
- For guest runs, follow the result to CT Wrong Answers, sign in through the ordinary form, return to CT Wrong Answers with the same three missed IDs, and refresh. Repeated imports are independently checked through the real HTTP and shared regression paths.
- Favorite a missed item using the normal first-use confirmation, start the scoped wrong-answer queue and open the exact independent rule card.
- Open the seven-step application checklist and verify the current eLicense destination.
- Switch CT → AZ → CT. Both Quick 10 modes start in one click. AZ Full 45 starts in every tested combination. ALL Pro successfully submits 45/45 on desktop and mobile. The free AZ submission issue is listed below.
- Read CT Daily Study, answer an assigned question, and confirm the next displayed question belongs to the updated pending task set.
- Submit CT Comprehensive Practice at 39/40 without a timer and open its result-scoped notebook containing exactly one missed question.
- Home and results have no document-level horizontal overflow at either viewport. The score and next actions scroll into view after CT submission. Screenshots were visually inspected.

## Observed server, content and build acceptance

- `npm run questions:verify`, `npm run quiz:verify`, `npm run sitting:verify`, `npm run mistakes:verify` and `npm run study:verify` passed. The Arizona bank check retains its existing warning about dedicated exam-day/open-book procedure coverage.
- `node scripts/ct-verify.mjs` and `node scripts/ct-entitlements-verify.mjs` passed. They verify counts, unique IDs/stems/card fronts, sources, card mappings, free topic entry points, 200 Quick/full draws, CT paths, scope and expiry, and the explicitly unknown official examination fields.
- `node scripts/guest-progress-verify.mjs`, `node scripts/guest-browser-storage-verify.mjs`, `node scripts/dashboard-guest-verify.mjs`, `node scripts/account-read-verify.mjs`, `node scripts/ny-entry-verify.mjs` and `node scripts/ny-progress-verify.mjs` passed. CT was added to the applicable state regressions.
- `node scripts/pack-performance-verify.mjs --state CT` passed against isolated PostgreSQL WASM. CT 40-answer submission used 14 SQL statements. Seven-state bulk guest imports used at most 10 statements for 10 answers, preserved retry counts and rolled back late failures. These are local measurements without simulated network latency.
- `node scripts/ct-http-verify.mjs` passed against the built local preview for free, CT Pro, expired, other-state and ALL entitlements. It covers server denial of premium answers, cross-state/stale-version denial, idempotent answer saving, concurrent duplicate imports, favorites, daily card persistence, CT full scoring/retry/allowance and AZ isolation.
- `node scripts/ct-routes-verify.mjs` passed for 23 content URLs, direct canonical/noindex, official application href, purchase suppression, sitemap exclusion and local production page/API gates.
- `npx tsc --noEmit` passed.
- The CT preview production build passed through `node scripts/ct-preview-server.mjs --build`.
- A normal `npm run build` also passed with `NEXT_PUBLIC_CT_PREVIEW=0`, `VERCEL_ENV=production` and a separate `.tools/ct-off-build` directory. Local isolated file storage was used for both builds.

Detailed local evidence remains in `.tools/ct-browser-result.json`, `.tools/ct-http-result.json`, `.tools/ct-routes-result.json`, `.tools/ct-browser-evidence/` and `.tools/pack-performance-result.json`. Generated build directories, local test accounts, screenshots, credentials and fixture data are excluded from the candidate commit.

## Shared dependencies requiring retest

These items were handed to the existing shared-fix chat “验收 PA 与 LA+加速网站主要页面”, thread `01a1cf95-d179-7a11-b2ec-814e4aec3141`, on 2026-11-13. The owning branch is `codex/guest-progress-speed-20261113`. Its follow-up was active at the final snapshot and confirmed the AZ root cause. The final remote fetch still showed the original baseline, so the follow-up changes are outside this candidate.

### AZ free Full 45 submission

Reproduce with a signed-in free account. Enter AZ practice after CT, start Full 45, answer all 45 and submit. The UI reports that it could not save the exam. Per-question requests apply ordinary premium-question access while the exam-summary request is separate. One observed isolated account had a 100%/45-question exam row with only 13 AZ answer stats. The shared owner confirmed this partial-save/allowance problem and is implementing transactional submission and recovery.

Related files are `components/ExamRunner.tsx`, `app/api/progress/route.ts` and `lib/entitlements.ts`. Retest guest/free/ALL Pro, retry after partial failure, original answer letters, trial consumption and CT → AZ → CT once the shared fix is integrated. ALL Pro already completed 45/45 on both tested viewports in this candidate.

### Client-navigation metadata remnants

Open `/`, choose CT through the client state selector and wait for the Connecticut title. In affected runs, HEAD has the CT canonical/noindex while BODY retains the previous root canonical/index metadata. Directly opening `/connecticut/` has one correct canonical and noindex. The final browser report records this separately for each run.

Related files are `app/layout.tsx`, `app/page.tsx`, `lib/seo.ts`, `StatePicker`, `StateMenu` and the Next 15.5.24 streaming navigation lifecycle. Recheck root → CT, CT → AZ → CT and direct entry metadata after the shared fix. CT production route gating remains effective.

### Guest comprehensive-history import

The shared durable guest archive and `/api/progress/import/` accept Quick 10 and at most ten questions. A guest can view a CT comprehensive result locally. The forty-question completed sitting is outside that shared import contract, so its subsequent sign-in history/mistake import remains pending. Signed-in CT full submission, local result viewing, and guest Quick 10 sign-in import have passed.

Related files are `lib/ca-attempts.ts`, `lib/ca-sync.ts`, `lib/sitting.ts`, `components/ExamRunner.tsx` and `app/api/progress/import/route.ts`. Retest guest comprehensive → CT notebook → login → refresh after the shared contract is extended. No separate CT import implementation was introduced.

## Local preview and repeatable checks

Run commands from the CT worktree. `npm run ct:preview` starts the candidate development preview at http://127.0.0.1:3436/connecticut/. `npm run ct:verify` checks the CT bank/configuration. The currently delivered built preview uses port 3438.

For a fresh full local browser run, choose a new `CT_TEST_ACCOUNT_SUFFIX`, run `node scripts/ct-http-verify.mjs --seed-ct`, then run `node scripts/ct-browser-verify.mjs` with `PACK_TEST_BASE_URL` pointing to the local candidate. Use the same suffix for seeding and browser execution. The seed is local-only and uses the test password exported by `scripts/pack-test-utils.mjs`. Dedicated test dependencies are reused under ignored `.tools/browser` and `.tools/ny-pg` directories.

The candidate includes production gating and preview indexing controls. Formal release, commercial activation and the shared-flow retests remain subsequent release work.
