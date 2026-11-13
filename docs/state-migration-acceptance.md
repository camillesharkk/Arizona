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

## Reusable loading checks

- Read account entitlements and exam history once per account response. Share concurrent browser account reads and invalidate them on session changes. Recheck later requests against the server.
- Import one completed Quick 10 in one authenticated request and one learning transaction. Use bulk PostgreSQL reads and writes with the existing answer, review and revision rules.
- Keep navigation metadata independent of question-bank modules so login and reference pages can load their own small client bundles.
- Save a Daily Study document when normalization, the day or its tasks change. Preserve settings, card progress and exam checks on repeated reads.
- Measure HTML response time, account/data API response time and delivered JavaScript separately. Record production samples and the network conditions. Repeat free, active-Pro and expired-Pro checks and verify the same state, account and saving behavior.

## Regression commands

Run `node scripts/guest-progress-verify.mjs`, `node scripts/guest-browser-storage-verify.mjs`, `node scripts/dashboard-guest-verify.mjs`, `node scripts/account-read-verify.mjs`, `node scripts/ny-entry-verify.mjs`, `node scripts/ny-progress-verify.mjs` and `node scripts/pack-performance-verify.mjs`. Run `node scripts/guest-progress-http-verify.mjs` and the existing HTTP suites against seeded local data, followed by type checking, a production build and browser acceptance through the real sign-in return path. Production verification uses dedicated test accounts.
