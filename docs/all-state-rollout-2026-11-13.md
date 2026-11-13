# All requested states — integrated candidate, 2026-11-13

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
- 24 browser cases: three states × desktop/mobile viewport × guest/free/active Pro/expired Pro. Quick10, full practice (CT40/NC60/IN30), unique draws, result refresh, read/unread guide persistence, guest full sign-in import, and overflow checks passed. No browser runtime errors. Evidence: `.tools/all-state-browser-24-result.json` and `.tools/all-state-browser-evidence/`.
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
