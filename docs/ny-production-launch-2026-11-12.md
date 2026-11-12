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
