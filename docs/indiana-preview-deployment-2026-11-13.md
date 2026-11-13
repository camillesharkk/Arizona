# Indiana preview deployment — November 13, 2026

## Deployment

- Project `sharkkk/arizona`, Vercel Preview environment.
- Preview https://arizona-hteaoamys-sharkkk.vercel.app/indiana/
- Deployment `dpl_8bDbP5bEY9BQFnDa9C1cZUExQGP5`.
- Application commit `360949b3b2669d188fb21651eb401bb2096bce51` on `feature/indiana-notary-prep-20261113`.
- Runtime region `syd1`, alongside the Sydney preview database.
- Final status **READY**, verified at 2026-11-13 13:17 UTC.

Vercel Authentication protects this preview. Open it while signed into Vercel with access to the `sharkkk` project. Automated acceptance uses the project's existing automation access, scoped to this deployment's origin.

## Preview data and configuration

The schema-only Neon branch `indiana-preview-20261113` (`br-jolly-unit-a7twu326`) contains the fresh `indiana_preview` database. All 17 migrations, including `017_guest_exams`, were applied to this isolated database. Its data consists of 18 acceptance fixtures and three reviewer accounts.

The user explicitly authorized storing the preview database connection and generated preview authentication secrets in Vercel. This deployment supplies its own runtime and build configuration for `DATABASE_URL`, `AUTH_SECRET`, `ACCOUNT_TOMBSTONE_SECRET` and `STATE_PREVIEW=1`. Tutor uses the local provider. Outbound email and payment provider credentials are empty in this preview, so use the verified reviewer fixtures for account acceptance.

`.vercelignore` excludes `.tools`, local data, environment secrets and generated build files. The upload dry run confirmed that the source manifest excludes the credential files. Credential values are stored locally in ignored files and in the deployment environment.

## Reviewer accounts

Open `/login/` and use the synthetic fixture password `Indiana-local-test-2026!`.

- `in-review-free@example.invalid` has a fresh free Indiana mock allowance.
- `in-review-pro@example.invalid` has a dedicated 60-day Indiana Pro grant.
- `in-review-az-pro@example.invalid` has an Arizona Pro grant for cross-state entitlement checks.

## Deployment verification

The first preview's `iad1` runtime produced successful answer-save requests exceeding the UI's 20-second wait. Moving the preview to `syd1` reduced the diagnostic answer-save responses to approximately 0.36–0.47 seconds and produced the Quick 10 result in 851 ms after submission.

Concurrent cloud acceptance also reproduced an inherited device activation lock leak. `pg_stat_activity` showed an idle backend retaining a session advisory lock while another login waited. Device activation now uses a transaction advisory lock and routes its callback queries through the same transaction. The regression failed against the original code, then passed after the fix. The real Neon pool passed eight same-user concurrent lock operations plus rollback/reacquisition. Two stale connections holding preview-only device locks were released during recovery.

`node scripts/devices-pg-verify.mjs`, `npm run devices:verify`, `npm run auth:verify`, TypeScript, Indiana content validation and result-boundary checks passed for this fix. Vercel's production build passed. The first local default-sandbox build encountered a Windows `EPERM` creating `.next/server/app/api`; the retried local production build completed successfully with normal host access. The local preview also returns 200 at `http://127.0.0.1:3420/indiana/`.

Final checks ran against the exact deployed hostname and the real isolated Neon database.

- All eight desktop/mobile guest, free, IN Pro and other-state Pro cases completed Quick 10 and the 30-question mock. The matrix took 270.9 seconds with zero browser runtime errors and zero horizontal overflow.
- Each mock contained 30 unique questions. Refresh, flags, previous/next, explanations, result recovery, duplicate submission and state switching passed. The free pool returned 60 questions and IN Pro returned 170.
- Both 23/30 and 24/30 result boundaries passed on desktop and mobile. Free second attempts returned 402; IN Pro could start another sitting. Full-mock mistakes, favorites, saved review, daily history and same-day whole-notebook retries passed.
- Arizona Full 45 launched with one Start click, its homepage entry remained available, and switching back to Indiana preserved state separation.
- All eight desktop/mobile account-menu and Dashboard cases passed, including expired IN Pro, expiry display, state return links and hidden purchase controls.
- All 13 Indiana routes passed expected status, canonical, noindex and sitemap checks. Guide pages contained their four ordered steps and adjacent official links.
- Reviewer fixture logins passed. Free and AZ Pro reviewers received 60 Indiana questions; IN Pro received 170. The expired fixture received 60. Indiana checkout returned the intended 503 for every fixture.
- Direct database readback confirmed six account mock results, each with 30 questions, including two 23/30 and four 24/30 results. Six favorites and six saved-review records persisted. There were zero advisory-lock waiters. Reviewer accounts had zero exam records, preserving their review allowances.

Ignored local evidence includes `in-cloud-browser-results.json`, `in-cloud-account-results.json`, `in-cloud-http-preview.json`, `in-cloud-review-results.json`, `in-cloud-db-results.json`, `in-cloud-lock-results.json` and `in-cloud-browser-evidence/` under `.tools/`.

## Content and opening work

The preview exposes 170 published original questions, comprising 60 free and 110 Pro, and 43 independent published cards. The remaining 33 question candidates and seven cards are drafts pending exact official-source verification. Purchases remain hidden while Indiana product and price configuration awaits verification. Official sources were checked on November 13, 2026 and are documented in `indiana-official-review-2026-11-13.md` and `in-content-source-audit.md`.

Public opening requires completion of those content checks, verified Indiana commerce configuration, and a coordinated availability/indexing release. The deployed preview retains Indiana's production release gates and noindex settings.
