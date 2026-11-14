# Shared state migration acceptance

## Guest practice survives sign-in

Every state must pass this sequence before release, on desktop and mobile.

1. Start Quick 10 as a guest, answer all ten questions, and record the score, missed question IDs and sitting ID.
2. Open Wrong Answers from the result. Sign in using the ordinary return link, or complete the account creation and email-verification flow.
3. The same ten answers, score, wrong-answer records and history entry must appear under that account. Refresh Wrong Answers, Practice and Daily Study and verify the original sitting remains available.
4. Repeat the import after a timeout or lost response. Count each answer and sitting once, preserve the free full-exam allowance, and show a retry message while browser records remain pending.
5. Switch states and accounts. Preserve state attribution and claim guest work for the first signed-in account only. Previously adopted records must stay with their owner.
6. Keep canonical answer letters, original attempt IDs, sitting IDs, question versions and presentation versions. Archive obsolete question versions intact and exclude them from current regrading. Preserve existing account sittings and favorites.

Use the shared `syncGuestProgress` / `syncCaAttempts` path and authenticated `/api/progress/import/` endpoint. Retain browser data until the server acknowledges it. The default post-login dashboard waits for import completion before reading progress. Cover older homepage Quick 10 sittings as well as the Practice page. Every newly supported state must be included in the shared migration state list and the six-state regression scripts. This import reuses the production schema with migration 016.

## Full practice and completed-result restoration

- Submit the entire full sitting with `kind=pack-full` through `/api/progress/`. Its server transaction validates the state, versions, answer choices and applicable blueprint, grades the answers, writes the review snapshot and exam, and consumes the state's trial together. Ordinary Pro-question authorization stays in effect outside this sitting.
- A retry of the same committed exam returns its original result and authoritative `fullExamCount`. Concurrent new free sittings admit one trial. A late failure rolls back answers, history and trial usage together.
- Retain completed guest full sittings with canonical letters, original seed, question and presentation versions, unscored identities, attempt IDs and timestamp. Login imports them through the same authoritative full endpoint with an account-ID guard. The first imported full consumes the account's free full allowance for that state. An excess full stays on the device with an explanation and can sync after Pro becomes active.
- Preserve every unacknowledged archive row when pruning local history. Limit acknowledged cache rows separately. Verify a pending full survives at least 35 subsequent Quick 10 saves.
- Cover classic AZ/CA/HI metadata-only legacy records whose answers were partially saved. Reuse the original per-question attempt IDs to finish the missing writes once, retain the original matching score and timestamp, and keep the trial consumed. A legacy repair without those identifiers must retain the original browser data and return a conflict instead of duplicating existing counts.
- A completed sitting or matching archive for the current owner may display its result after the trial is used. Viewing that result grants no new trial. Consume `start=1` once for every state, including older classic-state full URLs. After a full result, follow a topic link and verify a fresh question view and separate storage key. Remount the runner when the state, mode or topic changes.
- Daily Study reads, settings updates and card actions preserve each state's full-submission receipt and wrong-ID snapshot, including AZ.

## Login and navigation metadata

- Login, registration and password forms expose credentials only after their client submit handlers are mounted. Native fallback uses POST to the matching auth endpoint. Test server HTML without JavaScript and a slow initialization, and verify no password enters a GET URL.
- Check canonical and robots tags after initial load, client-side state navigation, back/forward, and direct reload. Each completed navigation has one current canonical and one applicable robots tag, including candidate noindex pages. The shared Next config uses blocking metadata for all user agents so metadata stays in the managed head. [Next configuration documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots)

## Reusable loading checks

- Read account entitlements and exam history once per account response. Share concurrent browser account reads and invalidate them on session changes. Recheck later requests against the server.
- Import one completed Quick 10 in one authenticated request and one learning transaction. Use bulk PostgreSQL reads and writes with the existing answer, review and revision rules.
- Keep navigation metadata independent of question-bank modules so login and reference pages can load their own small client bundles.
- Save a Daily Study document when normalization, the day or its tasks change. Preserve settings, card progress and exam checks on repeated reads.
- Measure HTML response time, account/data API response time and delivered JavaScript separately. Record production samples and the network conditions. Repeat free, active-Pro and expired-Pro checks and verify the same state, account and saving behavior.

## Regression commands

Run `node scripts/guest-progress-verify.mjs`, `node scripts/guest-browser-storage-verify.mjs`, `node scripts/dashboard-guest-verify.mjs`, `node scripts/account-read-verify.mjs`, `node scripts/ny-entry-verify.mjs`, `node scripts/ny-progress-verify.mjs` and `node scripts/pack-performance-verify.mjs`. Run `node scripts/guest-progress-http-verify.mjs` and the existing HTTP suites against seeded local data, followed by type checking, a production build and browser acceptance through the real sign-in return path. Production verification uses dedicated test accounts.

Full-practice regressions also run `node scripts/legacy-full-verify.mjs`, `node scripts/guest-full-verify.mjs`, `node scripts/practice-restoration-verify.mjs` and `node scripts/auth-entry-verify.mjs`. Run `node scripts/shared-entry-http-verify.mjs` against a fresh isolated directory seeded with `pack-test-utils.mjs --seed`, using `PACK_TEST_BASE_URL` for that server. It deliberately consumes each dedicated free/expired account's first full trial.

## Integrating independent state candidates

Apply shared fixes while retaining the candidate's state enums, question lookup, guest-sync state list and server release gates. Preserve CT's own entitlement check and exact draw validation. Preserve NC's state entitlement check, `fullCountFor`/permission-dependent draw and free-pool restriction. Those candidate extensions are reconciled with the shared atomic submission transaction when integrating. Rebuild after changing Next metadata configuration, then rerun each candidate's guest login, full practice, topic navigation, metadata and existing-state regressions. A shared fix does not open a candidate state.

## Free state launches and the two navigation regressions

The 2026-11-14 launch adds AR, CO, IL, ME, MD, MO, MT, NE, NV, NJ, NM, OH, OR, UT, VT, WI and WY to the shared state paths, state cookie parser, session keys, guest archives, server import schema and question lookup. Their free launch configuration hides full simulations, purchasing, standalone study cards, topic drills and Tutor until those capabilities are accepted.

For each free state, finish Quick 10 as a guest with a recorded sitting ID and score. Open the result's Wrong Answers link, wait for the page's sign-in entry, use the real form and return to the original state and sitting. Wait for the notebook's original score summary and completed sync before reading server counts. Refresh and revisit the return URL. Require one history row for that sitting, stable answer totals and the same missed questions. Retry imports preserve the original account, answers, versions and attempt IDs. Test at 1440px and 390px.

Start at an existing state's Practice page. Use the state menu to enter a new state's Practice page, then switch to another new state. Click Start once on each page, including while its account read is pending. Require questions and session storage belonging to the selected state. Check the same state's notebook, remembered state on login/account pages and saved-review button after refresh. Exercise loading, empty and request-failure states and their retries.

Run `scripts/remaining-states-verify.mjs`, `scripts/remaining-states-browser-verify.mjs`, `scripts/remaining-states-ui-states-verify.mjs` and `scripts/remaining-states-pages-verify.mjs` alongside the existing regression commands. The browser runner accepts `STATE17_BASE`, `STATE17_STAGE`, `STATE17_SWITCH=1` and an ignored local `STATE17_ACCOUNT_FILE` containing designated test credentials. Use `STATE17_HEADER_FILE` only for existing preview automation access. Keep all credentials and raw evidence outside Git. Both guest regression suites and the PostgreSQL performance/rollback suite now include all seventeen new banks.

Registration must retain the same return path across the login/register links, the sent-email page and a verification link opened in another tab of the same browser. A short-lived SameSite return cookie carries only a validated local path. Keep the existing verification token and device-session checks. Clear abandoned return paths when a new login/register entry has no valid next destination, and clear the return cookie after a successful session. Test default dashboard behavior and rejected external redirects. Run `auth-return-verify.mjs`, `auth-return-links-browser-verify.mjs` and `guest-register-browser-verify.mjs`. The registration browser suite uses isolated local accounts and simulated email delivery.
