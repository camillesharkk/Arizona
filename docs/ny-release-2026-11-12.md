# NY release checkpoint — 2026-11-12

## Compatible code release review on 2026-11-12

This section supersedes the earlier migration-before-any-release requirement for this compatible release. The original checkout and its four commits remain intact. An isolated worktree starts at freshly fetched origin/main 1cf61ab33263f1c7fe3a046f7bb64c7af842bcc0. The developer skill commit and its gitignore exception are excluded. The NY bank, preview routes, shared state dependencies, revision preservation and production restrictions are included. PA and LA data remain necessary static imports of the existing shared pack module and remain blocked on production. Uncommitted favorite changes and tooling stay in the original checkout.

Read-only Vercel inspection confirms sharkkk/arizona, GitHub camillesharkk/Arizona and main. DATABASE_URL remains sensitive, targets production and preview, and has no integration configuration ID or identifying comment. Its actual runtime endpoint remains unproven. A read-only inspection of the explicitly named Neon candidate on 2026-11-12 found migrations 001 through 015 and neither revision column. This is candidate evidence. It does not identify the production database. No production migration or recovery branch has been created.

The original new pg-store unconditionally wrote the 016 columns. The reviewed release now checks their availability and retains the 001–015 write shape for AZ, CA and HI. NY writes on an old schema fail before claiming an answer attempt. A warm instance rechecks the columns when NY is retried after an operator migration. Actual pg-store tests in isolated PGlite cover legacy live-state inserts and updates, refusal without consuming the NY attempt ID, both additive ALTER statements twice, the deployed old store against the expanded schema, and retry with retained NY version history on the same store instance. This makes 016 unnecessary for releasing the restricted code. NY versioned progress requires 016 before public opening.

016 adds two columns with constant defaults and IF NOT EXISTS. It does not remove existing rows or columns. PostgreSQL ALTER TABLE takes ACCESS EXCLUSIVE unless specified otherwise, so an eventual execution should use a short lock timeout in an explicit transaction with its ledger write. The current runner executes SQL and the ledger separately. A failure can leave additive work pending its ledger entry, and IF NOT EXISTS permits retry. The SQL and ledger are unchanged in this release. Lock behavior follows the PostgreSQL ALTER TABLE documentation at https://www.postgresql.org/docs/current/sql-altertable.html.

Independent review also found missing NY Dashboard state attribution and missing historical exam wrong-ID snapshots. Both are fixed through the shared state and snapshot helpers. Duplicate exam submissions preserve the first saved wrong-ID and skipped snapshot, including an empty snapshot. Existing unprefixed exam modes retain AZ ownership.

Content checks confirm 203 questions, 29 free, 174 Pro, 50 independently authored card records and 10 article records. Question-derived fronts are counted separately and excluded from the 50-card gate. The dated legal/editorial ledger in ny-bank-final-review.md is retained. Structural checks do not establish a fresh legal review.

NY remains unavailable in the state registry and omitted from the public sitemap. The existing pack links for passing-score, laws and become-a-notary have no corresponding preview pages. The full required AI Tutor and two-viewport anonymous/free/active/expired browser acceptance matrix has not been certified for this release. These outstanding public-launch gates keep NY closed. Production must deny preview HTML and RSC requests and NY/PA/LA learning mutations, even with STATE_PREVIEW=1.

Production acceptance of the first deployment found an existing CA/HI study-card serialization error. Server pages passed a function into the client card component, causing a streamed rendering error despite HTTP 200. A follow-up replaces that prop with a serializable practice base path, builds topic links in the client, and supplies NY card navigation paths. The HTTP gate now requires actual study-face markup for CA and HI. The stronger check failed against the first production deployment and passed against the corrected local production build.

The release uses a standard fast-forward update to remote main after final verification. Production deployment SHA, alias assignment and runtime observations are recorded in the final handoff after the deployment completes.

## Latest follow-up: Neon authorized, binding still unproven

Neon browser authorization completed. Read-only platform queries confirm project `Arizona-notary` (`crimson-mouse-71453887`), with one branch named `production` (`br-raspy-fog-a76oj2y2`) and endpoint `ep-twilight-block-a7q49u9i.ap-southeast-2.aws.neon.tech`. Its pooled equivalent adds `-pooler`. A unique candidate and the default/primary flags are not evidence of the deployment's actual DATABASE_URL, as the user explicitly clarified.

The Vercel account-view integration configuration query returned an empty list. DATABASE_URL has no integration configuration ID or comment and was created/last updated at 2026-08-29 21:46:34 +08:00. The sensitive value cannot be read back. The historical `.env.vercel-production` export (2026-09-17) has a Vercel CLI header but contains no parseable PostgreSQL URL. Existing `/admin/operations/probe` only calls analytics providers and cannot report the database host. A production log query for `neon.tech` over the available last 30 minutes returned no hostname; 1-day and 7-day windows were refused as outside runtime-log retention. No raw runtime logs or credentials were printed or saved.

Required remaining evidence: the original configuration/secure deployment record used to create DATABASE_URL on 2026-08-29, identifying only its endpoint hostname, or an existing authorized runtime diagnostic capable of reporting that hostname. The user cannot currently confirm the endpoint. No recovery branch, production migration, push or new deployment has been performed; do not silently substitute the sole Neon candidate or local DATABASE_URL.

### Tooling installed at the user's explicit request

- Read the official Neon Skill and installed project-local `neon` and `neon-postgres` skills with their references (14 files) under `.agents/skills/`.
- The official installer failed cloning GitHub (connection reset); the fallback fetched the official repository files at commit `5bc1845c9bd436dba9d9c2d389bd6b14bf465354` and verified each Git blob SHA-1.
- Added `.codex/config.toml` with an OAuth-only Neon MCP URL pinned to `crimson-mouse-71453887`. `codex mcp get Neon --json` confirms it is enabled and has no bearer-token environment variable or credential headers. MCP session authentication itself was not tested; CLI authentication works.
- Existing `.agents` skills, global Codex MCP configuration, `skills-lock.json`, `.env.local`, and Vercel variables were preserved. No Neon link/init/env-pull was run, and no application dependency changed. These local tooling files are not included in the production code commit.

Earlier notes below are retained chronologically; their missing-Neon-login statement is superseded here.

## Follow-up: authentication recovered; database prerequisite remains

The official Vercel CLI successfully refreshed the expired OAuth session (`whoami`: `camillesharkk`). No VERCEL_TOKEN override was found in process/user/machine environment or local env files. No existing authentication configuration was deleted. The project API now succeeds: `sharkkk/arizona`, linked GitHub `camillesharkk/Arizona`, production branch `main`, verified domain `arizonanotaryprep.com`. The existing READY deployment is `dpl_9XS1SShxBaXxNwxHaTRmD7MWwFGJ`, commit `1cf61ab33263f1c7fe3a046f7bb64c7af842bcc0`; this is not a new release.

The project's DATABASE_URL is a sensitive variable targeting production and preview. The individual-variable API does not return a usable PostgreSQL value. No Neon API key or standard Neon CLI login configuration was found. Consequently, this run cannot yet establish which actual production branch is bound or create/verify its recovery point. No production query, migration, user write or push has been performed. The user was asked to run `npx --yes neonctl@latest auth` in local PowerShell and identify the production Neon project/branch without sharing secrets. Vercel login/permission repair is no longer required.

Production access protection was strengthened: middleware rejects all `/preview/` requests before HTML/RSC rendering, and the layout independently denies production regardless of STATE_PREVIEW. NY/PA/LA answer/exam writes, wrong-answer reads/mutations and daily-study requests return 404 on production. Existing state behavior and local preview are retained. No state registry or sitemap opening was made.

Verification after this change: production build/type checking passed; the actual progress-route regression passed including production denial, spoofed answer-state denial and existing local six-state compatibility. `ny-release-http-verify.mjs` against a localhost build with VERCEL_ENV=production and STATE_PREVIEW=1 verified NY/PA/LA HTML and RSC 404 responses, AZ/CA/HI home 200 responses, and no preview paths in sitemap. These are isolated build tests, not production login or Start acceptance.

The sections below preserve the earlier checkpoint and its then-current Vercel blocker, superseded by this follow-up.

## Verified scope

Remote main fetched successfully at `1cf61ab33263f1c7fe3a046f7bb64c7af842bcc0`. Local Skill is already tracked in `4dc10672ec94b785ee11c5ce75ed3f45eea730ef`.

The NY bank remains 203 published questions: 29 free and 174 Pro. The bank audit reported no structural errors. The progress verification checked 50 distinct independent-card IDs/fronts, 200 Quick/full draws each, six-state answer saving, wrong-answer history, state isolation, duplicate attempts, stale-version rejection and preservation of prior revision history. These checks do not replace editorial review in `ny-bank-final-review.md`.

Re-run successfully: `ny-bank-audit.mjs`, `ny-progress-verify.mjs`, `ny-pg-verify.mjs`, `sitting:verify`, `study:verify`, `mistakes:verify`, `quiz:verify`, and a production build including TypeScript checking. The build used `.tools/ny-release-build`, `DATABASE_URL=local-verification` and a local `NOTARY_DATA_DIR`; no production user data was accessed. The initial sandbox build failed with EPERM; the permitted retry passed.

## Migration and release order

016 only adds `question_version integer NOT NULL DEFAULT 1` and `revision_history jsonb NOT NULL DEFAULT '[]'`. No rows or existing columns are removed. Old code tolerates the added columns. New pg-store writes require both columns, including writes for existing states, so deploying before migration would break answer persistence.

Required order: verify production project/database binding and a recoverable backup/branch; execute 016 with its migration ledger entry; verify defaults and retained rows; then push main and watch the deployment. PGlite verified two executions and old-row/JSON-history round trips; PGlite is not a production recovery point.

The authenticated Vercel project API request for the linked project and team returned HTTP 403 Forbidden on this run. Therefore production environment binding, recovery point and migration state were not verified. No production migration or push is permitted until these specific prerequisites are satisfied. User authorization is already present; no further general deployment approval is needed.

## Public launch remains closed

NY is not Available, its pack routes remain under `/preview/new-york/`, and no public sitemap addition is made. Fifty cards and ten article records exist, but this run does not certify complete editorial/UI launch acceptance. The preview layout checks STATE_PREVIEW and emits noindex; that alone is not access control. Do not enable it on a public production deployment without separately verified protection. PA/LA dependency data is retained unchanged where the existing shared pack imports it; neither state is opened by this checkpoint.

No new browser acceptance or production smoke test was performed in this release attempt. Earlier browser evidence remains documented separately and is not relabeled as a current production test.

## Resume requirements

Restore Vercel read/deploy access to team `sharkkk`, project `arizona`, for the CLI identity. Confirm the actual production DATABASE_URL binding without printing it and provide or create a verified production recovery point using authorized database access. Then apply 016 before the already-authorized normal main push. Do not use a push-triggered deployment to bypass the missing migration prerequisite.
