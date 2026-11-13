# All requested states release, 2026-11-14

## Public release configuration

The user confirmed that CT, NC and IN use the existing account-wide 60-day Pro product. The nine requested states are AZ, CA, HI, NY, PA, LA, CT, IN and NC. All nine now have available catalog entries in this release. CT/NC/IN public routes, indexable metadata, canonical URLs, sitemap entries and the shared pricing/checkout entry points are enabled. Production `/preview/` remains private.

New purchases from every state use `az_exam_pro_60d` with state `ALL`. Recognized historical CT/IN/NC and AZ/CA/HI grants participate in shared account access. Existing expiry, revocation/refund status, per-order deduplication and queued 60-day renewal behavior apply. Indiana paid answers, extra full practices and Tutor requests beyond the free allowance now record the serving shared order's Pro usage.

The earlier automatic-review rejection was revisited after the user's explicit Pro choice and fresh verification. The isolated public-activation operation was approved and completed. The earlier protected-checkpoint section below is retained as history.

## Production database migration

The current Vercel database value is sensitive. A broad environment retrieval was rejected by automatic review. Production binding was instead established through one unique normal answer request on the designated existing test account and a read-only lookup of that exact attempt in Neon.

- Project `crimson-mouse-71453887`, production branch `br-raspy-fog-a76oj2y2`, database `neondb`, endpoint `ep-twilight-block-a7q49u9i.ap-southeast-2.aws.neon.tech`.
- Correlation attempt `state-launch-binding-e26d650f-cc5c-4a16-9f80-2da9715c6f66`, absent before the production request and present exactly once afterward.
- Recovery branch `br-curly-morning-a7rpqs4x`, named `all-states-pre017-20261114`, parent LSN `0/490FCA8`, created `2026-11-13T17:55:41Z`. Its independent read-only endpoint was connected and the original sixteen migrations, test correlation and pre-migration counts verified.
- Applied only additive `017_guest_exams.sql` and its migration record in one transaction with lock/statement timeouts. Migration SHA-256 `402ebf89bb11c1c31871dbef65638e42b6c297f9a581e5c1fca41786b4f8f1f4`.
- Verified all seventeen migration records and the exact six new columns. Existing counts before/after were users 22, question stats 1320, exams 55 and entitlements 8. Local evidence is `.tools/production-context.json` and `.tools/migration017-result.json`.

## Fresh public-configuration verification

- Optimized Next.js production build passed with `VERCEL_ENV=production`, preview flags disabled and isolated local file storage. Build evidence is `.tools/all-state-public-build.log`.
- All 24 browser cases passed again against this public build, covering CT/NC/IN at 1440px and 390px with guest/free/Pro/expired identities. Quick10, full practice CT40/NC60/IN30, unique questions, read/unread Guide persistence, refresh, guest sign-in import and overflow passed with zero browser runtime errors. Complete matrix is `.tools/all-state-public-browser-result.json`.
- HTTP acceptance passed for nine public directory entries, eighteen new-state pages with indexing/canonical/sitemap checks and nine account-state combinations. Paid access, duplicate answer/full save, favorites, state isolation, Daily Study, settings and Tutor-plan boundaries passed. Evidence is `.tools/all-state-public-http.json`.
- All-state Pro, release catalog, CT content/rights, NC integration, account-read, IN handlers, five integration regressions and the new IN Pro-use regression passed. Existing AZ question/quiz, commerce/Paddle and memory/file/PostgreSQL complete-exam checks passed. Warm PGlite AZ/CA/HI/NY/PA/LA/CT full submissions retain atomic save and retry behavior.
- Shared Guide DOM/progress checks passed for AZ/NY/PA/LA/CT/NC/IN. Independent code review found no remaining P1/P2 in the final public-release changes after the IN usage fix.
- Browser widths emulate mobile and desktop. Physical phones, a real payment and a live payment webhook remain outside the completed checks. Indiana's full-Code/full-guide source-access limitation is detailed in `in-content-source-audit.md`.

## Initial production acceptance

Release commit `29a5a78d4debbf8459a5abc442597fa9f5bc27ab` was ordinarily pushed to `main`. Vercel deployment `dpl_BQ9UMcCCNLqhhtB4dLaJWxzuCe7y` was verified READY with the production alias `arizonanotaryprep.com` and the matching Git SHA at `2026-11-13T18:09:49Z`.

Public-domain HTTP acceptance completed at `2026-11-13T18:20:22Z`. All nine directory entries and homes, eighteen CT/NC/IN core pages, indexing/canonical/sitemap checks and nine combinations of the dedicated free/active-Pro/expired accounts with the three new states passed. Checks covered free/paid boundaries, cross-state/version rejection, answer/full-save idempotency, favorites, state-isolated Daily Study/settings, CT40/NC60/IN30 complete submissions and Tutor plan limits.

Three unpaid Paddle checkouts were created, one from each new state's source, using the existing account product. Repeating each quote returned the same transaction. No payment was submitted. Transactions are `txn_01m7b1wv92hb5vqqkctc85mzen` (CT), `txn_01m7b1ypqx2376vknyysz76v3t` (NC) and `txn_01m7b20rajg1kted0dw86ew2r3` (IN). Evidence is `.tools/all-state-production-http.json`.

Six real-domain guest-browser cases passed, covering CT/NC/IN at 1440px/390px with Quick10, Guide persistence, result refresh, pricing and overflow checks. The 390px IN case also completed an anonymous 30-question sitting and verified its durable production result after refresh. Browser runtime errors were zero. Evidence is `.tools/all-state-production-browser-guest.json`.

Runtime error/fatal and HTTP5xx queries for this deployment returned zero records in the sampled ten-minute windows, most recently checked at `2026-11-13T18:18:50Z`, with no excluded log intervals.

## Quick-save follow-up

Rapid automated answers on the live Pro account exposed the existing 20-second Quick result-save timeout while the preceding per-answer writes were still queued. The server returned no corresponding API error responses. The result stayed on the last question with the retry message and preserved answers.

The shared Quick result wait now allows 60 seconds using the existing `settleSave` timeout parameter. Its retry IDs and answer storage remain preserved. The final UI patch also exposes the IN Tutor upgrade link and removes repeated shared-Pro wording from pricing. A fresh optimized production build passed. The same injected 22-second result-response delay reproduced the old early failure and passed on the patched build, showing the result and surviving refresh with exactly one result-save request. Local evidence is `.tools/quick-save-delay.log`. CT/NC/IN exhausted-Tutor browser checks also passed. Independent review found no P1/P2 in these follow-ups.

## Earlier protected checkpoint, 2026-11-13

## Scope and current production

Requested state work found in the existing chats and candidate branches: AZ, CA, HI, NY, PA, LA, CT, IN and NC. The three outstanding candidates were Connecticut `e06ae62`, North Carolina `0edb4f3`, and Indiana `c7dd289` plus the preview device-lock fix `360949b` and deployment records.

Read-only Vercel verification during this task returned project `sharkkk/arizona`, production deployment `dpl_uAwj18yQiSPqLUfVodpqcjP5obPe`, READY, Git SHA `10a32083446d6b911f674496a56501c0909c6935`. Production practice paths for CT, NC and IN returned 404. Their landing URLs returning 200 do not establish a working state product. Production still exposes six study states.

The missing release work was the integration of separately delivered candidates into production, coupled with retained access/indexing/purchase gates. Indiana also had only 170 published candidate questions and 43 cards before this task.

## Isolated implementation

Managed worktree: `C:/Users/20683/.codex/worktrees/all-state-launch/web`. Based on freshly fetched `origin/main`; the original `D:/webtest/web` local commits and uncommitted work were preserved. No force push, production database change, payment, email or public release occurred.

The three candidates were integrated while preserving the current baseline's atomic full-exam saves, guest archive/import and initialized auth/metadata behavior. Content now present in the gated candidate:

- CT: 203 questions, 60 free / 143 Pro, 51 independent cards, 10 articles, 8 guide chapters.
- NC: 203 questions, 60 free / 143 Pro, 77 independent cards, 10 articles, 8 guide chapters.
- IN: 203 questions, 60 free / 143 Pro, 50 independent cards, 10 articles, 6 guide chapters.

All three Study Guides now use the same `StudyGuide` component as the mature states, through `PrepStudyGuide`, with chapters, full rule explanations, worked scenarios, facts, sources, topic links, read/unread progress and checklist. NC and IN have ten separate study-note articles each, rendered through the existing article component and linked from resources. These are additional to base pages.

Indiana's previously unsupported draft claims were narrowed or replaced using the dated primary passages actually retrieved. See `in-content-source-audit.md` for exact changes and the remaining full-Code/full-guide access limitation. Counts and structural checks are not a claim of a complete independent legal review.

## Integration defects fixed

- Restore IN `packFor` and daily-state routing without falling back to AZ or losing transactions.
- Preserve current complete-exam atomic save and retry behavior while combining CT/NC/IN APIs.
- Complete IN guest exam sign-in import using a signed browser cookie and immutable original selections. Do not mark guest-server completion as account synchronization. Reject altered selections and account-change races.
- Adopt an unfinished IN guest reservation without redrawing its seed, ordered questions or answers.
- Include queued active IN grants in renewal calculation, so three 60-day grants reach 180 days.
- Scope CT usage attribution and full-exam receipts to the authorized state, protecting unrelated orders' refund eligibility.
- Return CT Pro flags in progress and show the correct Dashboard plan.
- Preserve each candidate's production gates and exclude blocked-state learning records from generic production progress responses.

## Verification evidence

- Content checks for CT, NC and IN pass; unique IDs/stems, card links, 60/143 splits and repeatable draws checked.
- Fresh TypeScript and optimized gated candidate build pass. A separate build under production configuration also passes with all three candidate gates enabled.
- 24 browser cases: three states × desktop/mobile viewport × guest/free/active Pro/expired Pro. Quick10, full practice (CT40/NC60/IN30), unique draws, result refresh, read/unread guide persistence, guest full sign-in import, and overflow checks passed. No browser runtime errors. Evidence: all 24 successful case summaries and exit code 0 in the task execution transcript, plus `.tools/all-state-browser-evidence/`. The later final-IN run reused the JSON output filename; `.tools/all-state-browser-result.json` contains the final eight IN cases rather than the earlier 24-case matrix.
- Final IN changes additionally run the four identities at both widths and two unfinished guest-login preservation cases; final result files are recorded under `.tools/` when the runner completes.
- Seven-state shared Guide DOM parity, explicit account/state progress isolation and legacy AZ progress pass.
- `state-integration-regressions.mjs` covers five originally failing cases: renewal stacking, usage scope, completed guest import/retry/alteration rejection, account switch, and unfinished guest adoption.
- IN actual-handler tests pass for free/Pro/expired, question/version guards, server draws, forged IDs, rollback, concurrent retries, guest cookie storage and production gating.
- Existing memory/file/PostgreSQL full-save regression passes. PGlite CT and existing AZ/CA/HI full submissions commit in 14 statements with stable duplicate/trial behavior. Account reads and repeated Daily Study reads preserve the existing behavior.
- Existing commerce regression passes; no real payment or production webhook was tested.
- HTTP against isolated production configuration confirms nine CT/NC/IN practice/guide/article routes remain 404. Existing main-state production behavior was read, not modified.
- Browser widths emulate desktop and mobile; no physical phone was tested. This is local candidate acceptance, not public production acceptance.

## Release block and exact remaining operations

Automatic approval review rejected a command that combined removing production gates/noindex, opening all three states, and enabling shared purchase access. Its stated reason was public legal-content and billing risk and asserted rollout-scope concerns. The user's request is to deploy every previously requested state; no further generic deployment authorization is needed. The rejection was respected: public availability, middleware protection, noindex, robots/sitemap exclusion and purchase suppression remain in place.

Before actual public release, the blocked operations require the specific user approval demanded by automatic review, followed by fresh verification of the public configuration:

1. Resolve the Pro choice: reuse the live ALL-state 60-day product (recommended) while honoring existing scoped test/legacy grants, or retain state-specific commercial products and configure them explicitly. No live products/prices were created or changed here.
2. Confirm the actual production DB binding and recovery point for additive migration `017_guest_exams`; the migration is included but was not run on production. No guessed local DB target was used.
3. Activate CT/NC/IN availability, metadata, sitemap and production paths, rerun public checks, then ordinary integration/push to latest main and follow its Vercel deployment to READY.
4. Run public-domain acceptance with designated test accounts and inspect the matching production runtime logs. Local screenshots, builds and API tests do not replace this step.

No claim that all nine states are deployed is made by this candidate record.

Final follow-up: IN four-identity browser rerun passed at both widths (8 cases). Two unfinished guest-login browser cases preserved seed, ordered IDs, selected answer and refresh. The follow-up independent code review reported both remaining fixes resolved and no new P1/P2 within that scope.
