# PA and LA isolated acceptance

Base: freshly fetched `origin/main` e76376b19d49c45d3b341c27b4fa42cea831423f. Original checkout, its four local commits and unfinished favorite changes are preserved. No main push, deployment or public opening is authorized in this round.

The existing pack routes, HomeStudy, PracticeLaunch, ExamRunner, StudyCardsClient, DailyStudyClient, account-wide Pro and state-scoped records remain the architecture. Shared changes are committed separately. Content files are owned separately by state; the root agent integrates shared routes and performs acceptance.

- [x] Fetch current main; create isolated worktree; read repository and NY release evidence; run baseline quiz/sitting checks.
- [x] Extend the tested NY atomic full-submission flow to PA/LA, retain PA 25-scored/5-unscored quotas, validate seed and choices, restore completed results, and test duplicate/concurrent/expired-account behavior.
- [x] Reduce repeated user/plan reads inside full submissions; measure actual isolated saves and document the remaining production latency limit.
- [x] Add per-pack article/reference/source registries and shared reference routes; keep production PA/LA blocks and sitemap unchanged.
- [x] PA: official-source review, at least 203 effective unique questions, 50 independent cards, ten articles and three reference pages; preserve the existing 30-question format.
- [x] LA: verify current official structure and current civil law, implement site-labeled scenario practice, at least 203 questions, 50 independent cards and ten articles. Provider registration is an independent public-release gate.
- [x] Run content, draw, historical persistence, PostgreSQL, Tutor, account, commerce, type and production-build checks.
- [x] Use isolated dedicated example.invalid free/active/expired accounts and browser desktop/mobile contexts; complete both full sittings, refresh and retry; distinguish browser observations from HTTP and automation.
- [x] Stage explicit shared/PA/LA file sets, review diffs, commit separately, and create per-state branches based on the shared commit for independent release.

Release requires a later user instruction. Re-fetch before integration; shared commit first, then only the approved state's content commit and explicit public-route/registry/API/sitemap opening after its remaining gates pass. Existing production migration 016 is confirmed by the user's instruction and committed NY evidence. This round must not change production data/configuration.

## Final shared acceptance evidence

The final corrected build passed 16 complete browser sittings (two states, two viewports, four identities), with zero browser page errors. Each state had eight complete sittings; every scored answer was submitted through real browser controls. Mid-sitting and result refreshes passed. Desktop Pro responses were deliberately delayed beyond the 20-second client wait, then retried; both returned their original result and retained one saved exam. Six-state switching and one-click Start passed on desktop and mobile.

HTTP checks separately verified real login, per-state answers/mistakes/favorites, study settings, daily-card completion, history, paid-question permissions and active/expired account-wide Pro. Existing AZ/CA/HI/NY HTTP answer/entitlement checks passed. Local production-mode HTML/RSC, learning APIs and sitemap checks kept PA/LA closed and retained NY/AZ/CA/HI.

A status-only route check initially missed streamed notFound pages behind three static NY reference routes. The final implementation reuses those actual routes and now tests registered article identity, per-state metadata, visible H1 and browser errors. The redundant dynamic route was removed. Independent code review found no remaining confirmed P1/P2 after the archival and quick-plan locking fixes.

Current Paddle sandbox calls returned provider forbidden, exposed as PADDLE_CHECKOUT_HTTP/502. No transaction or payment was created. The configured sandbox product read and API root also returned403, so live product ownership and checkout display are unverified. Code-level PA/LA mapping to the existing all-state product and existing commerce/Paddle regressions passed. Production configuration was not changed.

Actual DeepSeek test-server startup was rejected by automatic approval review because authorization did not explicitly cover sending the question payload to that destination. The user was asked asynchronously for permission for at most one PA and one LA request. No denied request was bypassed. Local/browser grounded fallback, state/source/choice prompt tests, quota and free/Pro permissions passed.

No additional database migration is required. The existing016 columns and account/state schema support both packs. Isolated PGlite tests include actual PA014/040 legacy history/favorite preservation, skipped answers, rollback and receipt replay. Warm full-submission statements are14 for NY/PA/LA; this does not attribute the earlier production45-second delay.

## Explicitly authorized live Tutor follow-up

The user approved exactly one PA and one LA payload to api.deepseek.com after the earlier automatic-review rejection. An isolated server using a separate test dataset was then approved. Through actual in-app-browser Quick10 controls, the PA advertising question returned an AI-generated response citing57Pa.C.S.325(a),(c); the LA bond question returned an AI-generated response citing the Louisiana Secretary of State FAQ. The same account counter advanced0→1→2. No account details were included in the supplied provider prompt. The live-AI test server was stopped immediately after these two delivered requests. This supersedes the earlier pending-authorization status; no rejected action was bypassed.

## Independent candidate builds

The PA-only candidate contains shared code and PA content, with the original LA preview retained. The LA-only candidate contains shared code and LA content/cards, with the original PA preview retained. Each passed its target-state content audit, TypeScript and an independent production build. On Windows, the first C-drive builds exposed cross-drive junction resolution to D-drive dependencies; identical lock-matched local dependency copies resolved that environment issue. No package or lockfile changed. Both candidate worktrees were clean after generated build config was restored.
