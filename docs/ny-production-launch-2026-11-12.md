# New York production launch

## Scope and production identity

The release starts from main `43f4b17a9b9c52f392422fb0a9d3984b5be08863` and integrates the accepted New York preparation commit `1559663b7e2e3f6c2208b68e970a3793b8a3db41`. Work is isolated from the original checkout and its four local commits and unfinished changes.

The production project is `sharkkk/arizona`, project ID `prj_yVHKKHXztH54E4rKOJrC7Wa7bV5B`, repository `camillesharkk/Arizona`, branch `main`, domain `arizonanotaryprep.com`. Pennsylvania and Louisiana retain their separate preview status.

## Runtime database evidence

The temporary endpoint reused operations administrator authentication and returned only deployment, SHA, hostname and database. Unit checks covered anonymous 401, ordinary-account 403, no-store responses, the exact read-only query and sanitized failures. Production anonymous and dedicated ordinary-account checks also denied access.

The authenticated response at the formal domain identified diagnostic deployment `dpl_AXuXVFg4L2URQbBEgHFQZPip6F3w`, SHA `a02f6ae05f5881b9efebabf2bea41d8fde011719`, hostname `ep-twilight-block-a7q49u9i-pooler.ap-southeast-2.aws.neon.tech`, database `neondb`. Vercel's production target and domain alias both matched that deployment.

Neon endpoint metadata maps direct host `ep-twilight-block-a7q49u9i.ap-southeast-2.aws.neon.tech` to endpoint `ep-twilight-block-a7q49u9i`, project `crimson-mouse-71453887` (`Arizona-notary`), branch `br-raspy-fog-a76oj2y2` (`production`). The runtime hostname is this endpoint's pooled form. The runtime SQL result confirms the selected database.

The diagnostic was removed in `e5328f951aa47b3b0cfb77613560f3a25069ae34`. Cleanup deployment `dpl_GSetYu3nRS2ChrbY3CRWAjhzqnCw` reached READY and received the formal domain alias. The original authenticated administrator session then saw Page not found at the endpoint.

## Recovery point and migration 016

Recovery branch `br-withered-scene-a7qne16r`, named `ny-pre016-20261112`, was created from `br-raspy-fog-a76oj2y2` at parent LSN `0/43B9868`, creation time `2026-11-12T10:51:29Z`. Its read-only compute is `ep-divine-leaf-a7yd5aed`.

An actual connection to the recovery branch verified database `neondb`, migrations 001–015, absence of the two revision columns and readable users, question_stats, exams and entitlements tables. This recovery branch predates the dedicated production acceptance accounts.

Production preflight found only 016 pending, neither revision column, no waiting question_stats locks and no other transactions older than 30 seconds. The accepted executor passed its isolated PostgreSQL rollback/retry/legacy-partial-application checks before production execution.

Migration 016 completed using the accepted per-migration transaction, with SQL and ledger together, lock_timeout 5 seconds and statement_timeout 30 seconds. Verification confirmed the 016 ledger entry and both columns.

- `question_version` is integer, NOT NULL, default 1.
- `revision_history` is jsonb, NOT NULL, default `[]`.
- All 396 existing statistics rows received the expected defaults. Counts of the four checked tables were identical immediately before and after migration.
- AZ, CA and HI answer writes through the previously deployed application each returned 200 using a dedicated test account after migration.

Production credentials remained in the platform and process environment. This record contains only non-sensitive target and recovery identifiers.

## Acceptance accounts and release checks

Three dedicated `example.invalid` production accounts cover free, active Pro and expired Pro. Test Pro access uses a mock entitlement for the existing account-wide `az_exam_pro_60d` product. No purchase is required to seed these identities. Only these identities are used for acceptance writes.

The New York content target remains 203 questions, 29 free, 174 Pro, 50 independent cards and 10 original articles. The three reference pages remain separate from those article records. The earlier preparation report records the source review and isolated browser checks.

Final public-route checks and formal-domain acceptance results are reported with the delivered production SHA and deployment ID. Real payment settlement and payment-webhook delivery require a separate paid or sandbox transaction exercise.

## Public release and actual production acceptance

The public implementation was integrated as `2517f21` and deployed by main `cf8d10f52352a427938890224f99d33be2fccbcb`, deployment `dpl_DjhNNTXy6yTkcn9uYQv87XoQ9Nd9`. Vercel reported READY and the formal-domain alias matched this deployment. Subsequent acceptance-record-only commits do not change the tested product implementation.

New York is available at `/new-york/` and `/new-york/practice/`. The selector, public routes, guides, account links, sitemap and production learning APIs include NY. PA/LA practice and all production preview HTML/RSC paths still return 404. Shared-entry review also corrected NY daily question selection, settings state, local progress state and result return links. The Pro usage receipt commits with the learning data; commerce usage records afterward and can replay the original event on a duplicate submission.

Final integrated verification passed: TypeScript, production build, content audit, public/entry checks, production-mode HTTP checks, progress/version compatibility, Tutor boundaries, full submission tests on memory/file/PostgreSQL, durable usage retry checks and commerce regression. A separate reviewer found no remaining confirmed P1/P2 issue. The content remains 203 questions (29 free, 174 Pro), 50 independent cards, zero question-derived cards and 10 original articles.

Actual formal-domain HTTP checks used dedicated accounts, followed by separate reads to verify persistence:

- Free and expired-Pro identities each saved a 40-question sitting with 40 correct answers. Same-ID retries returned duplicate without adding an exam; a new second free sitting returned 402.
- Active Pro saved Pro question answers and a complete NY sitting. Free/expired Pro question writes returned 402; stale question versions returned 409. Mistake lists retained NY ownership and excluded NY entries from CA views.
- All three identities saved NY custom study settings, reread those settings, completed a daily card and reread its done status. NY question IDs, scheduled mistakes and recent NY history persisted. AZ settings were unchanged.
- Anonymous progress/Tutor writes returned 401. Free and expired identities could use Tutor on a free question, while paid-question Tutor calls returned 402. All three actual free-question calls returned DeepSeek responses with limits 75/300/75. An actual Pro paid-question response retained New York context and did not reference Arizona. Simulated provider failures remain covered separately by the Tutor regression suite.
- AZ, CA and HI answer submissions through the final production code each returned 200 with the correct state, using a dedicated test identity.
- The NY purchase flow created a real Paddle checkout transaction for the test free identity at 1,999 cents. The returned checkout URL responded 200. No payment details were entered or payment submitted. Browser checkout display, real settlement and payment-webhook delivery are unverified.

A read-only production snapshot at `2026-11-12T11:34:47Z` verified NY versions, state ownership, scores and receipt-to-sitting associations without errors. Free/expired identities had no Pro usage. The active Pro receipt survived daily/settings writes and its entitlement had the expected earlier `pro_question` usage. All three identities had zero commerce orders, zero recorded paid amount and zero redemption consumption.

Browser observations confirmed New York Available in the public selector, the NY public practice page, a single Start opening a 40-question sitting, and NY-to-CA navigation reaching the correct CA practice page. Further automation repeatedly timed out in the in-app browser and Edge. Native Edge inspection was also blocked by the minimized window. Browser completion of 40 answers, browser refresh/persistence presentation, mobile layout, four-identity visual coverage, checkout display and final cross-state single-Start checks remain unverified in this production round. HTTP persistence and earlier isolated checks are reported separately; they are not substitutes for these missing browser observations.

The first free full-submission request exceeded the acceptance script's 45-second client wait. A separate read confirmed a complete committed 40-question exam. Retrying its original exam ID returned the existing result without consuming another trial. Later acceptance requests used a longer wait. No production learning data was rolled back or deleted.

An additional dedicated active-Pro identity tested its first use through the 40-question endpoint before any ordinary paid-question write. The real production request inserted the stable NY full-exam usage ID; repeating the same exam retained exactly one usage row and one exam. Read-only verification at `2026-11-12T11:37:34Z` also found zero payment orders for that identity. This verifies the new stable-ID insertion separately from the original Pro account's earlier entitlement-level usage deduplication.
