# Full-submission PostgreSQL performance verification

Verified locally on 2026-11-12 with the real `pgStore` SQL executed in an isolated PGlite database after applying repository migrations. The test adapter replaces the PostgreSQL connection and never connects using `DATABASE_URL`.

## Changes

`savePackFullSubmission` retains `recordQuestionAnswer` for answer transformation, revision/history handling, review scheduling and streak calculations. The sitting's existing account-row lock covers all reads and writes.

PostgreSQL now claims the selected answer-attempt IDs in one insert, fetches only the sitting's selected question statistics in one select, and writes their resulting statistics in one upsert. The user and study-plan reads are shared across the sitting, and the final user update runs once. The optional bulk methods leave the existing memory/file store path usable.

`upsertStat` shares the same SQL implementation as the bulk upsert. The SQL continues to support AZ/CA/HI schemas before migration 016 and retains the existing NY migration guard.

## Measurements

`node scripts/pack-performance-verify.mjs` enforces a budget of at most 16 SQL statements per fully answered sitting. Counts include `BEGIN`, the account lock, and `COMMIT`. Schema discovery is already warm. Its comparison path disables batch selection while retaining the shared user/plan cache.

- NY, 40 answers, decreased from 131 to 14 SQL statements. One isolated run measured 74.7 ms for the comparison path and 23.3 ms for batching.
- PA, 30 answers, decreased from 101 to 14 SQL statements. The same run measured 40.3 ms and 15.1 ms.

- LA, 40 answers, decreased from 131 to 14 SQL statements. The integrated run measured 52.4 ms for the comparison path and 22.9 ms for batching. The integrated performance script passed all three states.

The test prints fresh elapsed times on each run. PGlite executes locally in WebAssembly, so these durations describe that isolated environment. The SQL-call count measures the removed serial database operations. Production connection establishment, regional latency, lock waits and commerce usage-marker delivery require production telemetry to measure. The earlier report of a NY submission exceeding 45 seconds remains an observation without an attributed production cause.

## Verified behavior

The isolated performance regression passed the following NY/PA/LA checks. The existing NY full-submission, usage, schema-compatibility and progress scripts each completed successfully.

- All selected answers persist and score through the shared answer implementation.
- NY version-one answer history, prior mastery and favorite flags survive a version-two answer. Current-version counters reset independently.
- Empty selections create neither answer-attempt claims nor question statistics and remain represented in the sitting's skipped count.
- A completed sitting replay returns its existing immutable exam and retains the original usage receipt after entitlement expiry.
- A second free sitting is rejected. Existing concurrent-trial and concurrent ordinary-answer checks still pass.
- A PostgreSQL failure injected after inserting the exam rolls back its attempts, statistics, user streak, study-plan receipt and exam. Retrying the same submission then succeeds exactly once.
- The existing seventh-answer failure test now writes the first six PostgreSQL statistics through the batch method before throwing, proving partial batch work rolls back.

## Commands

```sh
node scripts/pack-performance-verify.mjs
node scripts/ny-full-verify.mjs
node scripts/ny-full-usage-verify.mjs
node scripts/ny-schema-compat-verify.mjs
node scripts/ny-progress-verify.mjs
```

The PGlite package must exist at `.tools/ny-pg/node_modules/@electric-sql/pglite`, matching the existing isolated PostgreSQL verification scripts.
