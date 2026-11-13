# Indiana local review candidate — November 13, 2026

## Scope and branch

Branch: `feature/indiana-notary-prep-20261113`. Base: `3c693ace5cbba4b4c454c9c2e1ae78b2aa14d390`, fetched `origin/main`. Native managed worktree: `C:/Users/20683/.codex/worktrees/indiana-candidate-1113/web`. The original `D:/webtest/web` checkout and its unrelated New York/mistake changes were left intact. This document records the initial local acceptance checkpoint.

The local acceptance checkpoint below predates the subsequently authorized cloud preview. Its deployment, isolated database migrations, account fixtures and cloud checks are recorded in [the preview deployment record](indiana-preview-deployment-2026-11-13.md).

This is an implemented, locally reviewable candidate with an explicit content-verification shortfall. It is **not ready for public opening**.

## Actual usable content

- 203 original stable `in-001` through `in-203` question candidates.
- 170 primary-supported published questions: 60 free, 110 Pro; 33 drafts excluded from all practice pools and server ID lookup.
- 50 independently authored cards: 43 published, seven drafts. There are no question-derived cards counted toward this total.
- Six topics: commission/education, appearance/identification, notarial acts, certificates, seals/records/fees, conflicts/refusal. Each topic has ten verified free questions.
- Quick 10 covers all six topics. Each mock has exactly 30 unique questions. Free mocks use the 60 free questions; IN Pro uses the 170 published questions. All three practice modes have enough content and remain enabled.
- Publication gap to the requested target: 33 published Pro questions and seven independent cards. Draft reasons and exact source limitations are in `in-content-source-audit.md`, `inCardAudit` and `inQuestionReview`.
- Editorial review reduced longest-correct choices from 136/170 (80%) to 55/170 (32.4%); removed the tautological advertising prompt and diversified four certificate scenarios. Correct answers, option feedback, unique options, IDs and sources remain checked.

## Implementation

`/indiana/` reuses HomeStudy, PracticeLaunch, ExamRunner, StudyCardsClient, CloudMistakes and DailyStudyClient. It includes the requested homepage CTAs, Quick 10, untimed mock, topic drills, application checklist, cards, notebook, daily review and resources. IN is recognized in saved state, state menu, account return routes and study settings. Existing AZ storage keys remain unchanged.

The official exam facts are separate from site settings in `lib/in-site.ts`: official 30 questions/24 correct; official time limit and choice count unknown. Site practice: 30 original questions, four choices, no timer. Results show X/30 and accuracy, with a 24/30 reference comparison and study-only wording. Quick 10 requires at least two answered observations before recommending a topic and shows at most two. Mobile results scroll to the summary after submission.

IN Pro is a dedicated `in_exam_pro_60d` entitlement with state `IN` and the existing 60-day duration. Existing state products do not grant IN, and IN does not grant existing states. Paid IN questions and draft cards are absent from the generated client content modules. Authorized questions are selected on the server. Explicit IN checkout requests return 503 before any old-state price fallback. No IN purchase controls are shown.

Signed-in trials reserve one server-owned sitting under account transaction; duplicate submissions return the first immutable grade. Guests receive a signed HttpOnly browser identity and a durable `guest_exams` reservation/result; clearing localStorage, losing the first response, replaying an old cookie or submitting concurrently does not issue another sitting or replace the grade. Clearing all cookies creates a new anonymous visitor; an anonymous identity cannot establish person-level lifetime limits.

Answers, exams, favorites, notebook and review data use state-specific IDs/state fields. Daily review retains the shared 1→7→14→30 calendar-day schedule. IN usage does not consume or mark unrelated old-state purchases, including accounts owning both products.

## Official evidence and limits

Checked November 13, 2026. See `indiana-official-review-2026-11-13.md` and `in-content-source-audit.md` for per-rule provenance.

- SOS new-system FAQ, published May 4, 2026: Applicant Hub submission/approval, education-ready email, Learner Hub course/exam, 30/24, 24-hour retake wait/unlimited attempts, report/bond/signature requirements and active-commission certificate download.
- Official 2025 SOS Recorders Conference deck and specific indexed official Notary Guide passages (revised May 20, 2024) support the published ordinary-notary instruction.
- Official 2026 Code/IAC pages returned JavaScript shells; direct guide downloads returned 403; browser access also timed out. No complete current statutory currency claim is made, and unsupported exact clauses remain drafts. Proposed 2026 bill wording is excluded.
- The $75 initial fee is labeled as the December 2024 published SOS figure, with instructions to confirm the live Applicant Hub amount. The current FAQ separately restates renewal fees; no live payment screen was inspected.
- Certificate download is described only after commission approval/activation. The current FAQ does not instruct a separate score upload or state a first-applicant proof-retention deadline; the site does not invent either requirement.

## Reproduction

Use the worktree above and Node.js 22.6+ (tested with Node 24.19). Install locked dependencies with `npm ci`.

```powershell
node scripts/in-content-publish.mjs
node scripts/in-content-verify.mjs
node scripts/in-results-verify.mjs
node scripts/in-server-verify.mjs
node scripts/in-seed.mjs
node scripts/in-preview-server.mjs --build
node scripts/in-preview-server.mjs --start
```

Local preview: `http://127.0.0.1:3420/indiana/`. The launcher supplies non-production `STATE_PREVIEW=1`, a local-only auth secret, local AI fallback and `.tools/indiana-data`; it never loads production credentials. Leave the seeded files out of git. Test login password is intentionally local-only: `Indiana-local-test-2026!`. Accounts: `in-free-desktop@example.invalid`, `in-pro-desktop@example.invalid`, `in-other-pro-desktop@example.invalid`, `in-expired-desktop@example.invalid`; replace `desktop` with `mobile` for the separate mobile fixtures. `in-seed.mjs --fresh` resets only this candidate's isolated store file.

For browser reproduction install Playwright into `.tools/browser` or set `IN_PLAYWRIGHT_MODULE` to its installed `index.mjs`. `IN_BROWSER_CHANNEL` defaults to `msedge`; use an installed supported channel. Run `node scripts/in-browser-verify.mjs`; `in-account-verify.mjs` and `in-guide-verify.mjs` cover the shared account return and four-step guide separately. Optional `IN_PGLITE_MODULE` points at an installed PGlite module for the isolated PostgreSQL migration/atomicity contract. No production URL is used by this test.

## Validation record

- Content validator, result boundary checks and server handler suite pass on 170/60/110 and 43 published cards.
- Server suite covers memory/file and isolated PGlite migration 017, exact start/expiry boundaries, old-state Pro denial, 60-day grants, forged IDs/versions/seeds, rollback, concurrent trial start, immutable duplicate grading, guest cookie replay/lost-response recovery, favorite/save and daily APIs, old-commerce usage isolation, checkout 503 and every IN release gate.
- Existing `questions:verify`, `quiz:verify`, `study:verify`, `sitting:verify`, `mistakes:verify`, `commerce:verify`, `auth:verify` and `ny-progress-verify.mjs` pass. Existing AZ question validation retains one warning: no dedicated exam-day/open-book drill; this candidate does not modify that bank.
- Desktop 1440×1000 and mobile 390×844: guest, free, IN Pro and other-state Pro completed Quick 10 and Full 30. Verified 23/30 and 24/30, options/explanations/source links, topic recommendations, flag/previous/refresh, duplicate submissions, server trial limits, Full 30 wrong-answer persistence, favorites, same-day whole-notebook retry and daily history. AZ Full 45, first Start click, homepage entry, state switching and notebook separation passed. No browser runtime errors or horizontal overflow.
- Preview HTTP checks cover all 13 IN routes, canonical URLs, noindex, alias redirect, free API pool and no IN sitemap entries. Streaming sign-in redirects may have HTTP 200 plus Next redirect metadata; the check verifies redirect semantics.
- Final production build passed (255 generated pages; Next.js 15.5.24). TypeScript and `git diff --check` passed after restoring Next's generated config-only rewrites.
- Final browser core matrix passed all eight desktop/mobile guest/free/IN Pro/other-state Pro cases with no runtime errors (66.2 seconds on the production build); the two expired-IN-Pro desktop/mobile cases also passed. The final account matrix passed all eight free/IN Pro/other-state Pro/expired desktop/mobile cases, including menu badges, expiry, suppressed purchase controls, IN Dashboard plan and return links.
- The final four-step study guide passed desktop/mobile section order, adjacent official links, topic launch and no-overflow checks. Final HTTP preview and production-gate matrices each passed all 13 routes, including RSC access denial and sitemap exclusion.
- The late account review found and fixed an IN Pro Dashboard Free label and AZ readiness wording. A real browser assertion reproduced Free != Pro before the change; the final built page now shows dedicated IN Pro/expiry and Indiana practice history. New IN statistics keep the study-topic chapter; existing-state writes remain unchanged. Old pre-fix records existed only in isolated candidate test data, which is reset for handoff.
- Evidence is retained locally under `.tools/`: `in-final-build.log`, `in-browser-core-results.json`, `in-browser-results.json` (expired matrix), `in-account-results.json`, `in-guide-results.json`, `in-http-preview.json`, `in-http-production.json` and `in-browser-evidence/`. These local artifacts and seeded identities are excluded from the commit.

Resolved during acceptance: Windows cross-drive dependency junction caused Next development-resource resolution failures; installing the locked local dependencies fixed it. Next production route validation rejected an optional GET Request parameter; requiring Request fixed the type contract. These failures are not retained as unresolved defects.

## Opening requirements

1. Resolve exact official primary-source gaps, review the drafts and reach 203 published valid questions / 50 independent cards. Recheck current Code/IAC, current first-application fee and any changed official workflow.
2. The subsequently authorized isolated cloud preview has all 17 migrations, including `017_guest_exams.sql`. A later production release requires confirming its intended database and recovery/compatibility procedure before applying that migration.
3. Configure and verify an IN product/price and dedicated checkout/webhook mapping before enabling purchases. The present 503 is deliberate; an AZ product must never silently sell IN access.
4. In a later explicitly authorized release, review the IN availability registry, production route/API gates, preview banner, robots/canonicals and sitemap together. This branch deliberately leaves IN unavailable publicly and blocks it even if a production STATE_PREVIEW flag is accidentally enabled.
