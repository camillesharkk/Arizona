# Indiana candidate implementation and acceptance

User specification (2026-11-13) is the implementation authority. Local candidate only; no push, production configuration, payment, or database migration. Base: 3c693ace5cbba4b4c454c9c2e1ae78b2aa14d390 (fetched origin/main). The original D:/webtest/web working tree is preserved.

## Design
Reuse PrepPack, PracticeLaunch, ExamRunner, StudyCardsClient, CloudMistakes and DailyStudyClient. Add /indiana/ candidate pages guarded by non-production STATE_PREVIEW=1, server API access gates, noindex and sitemap exclusion. Keep official 30/24 specification separate from untimed four-choice site practice. Indiana is a dedicated 60-day entitlement; legacy state rights stay unchanged. No configured IN checkout means no purchase controls.

## Tasks
1. Official evidence and cards: verify FAQ, current statutes, INBiz and manual; record dated conflicts and unknowns. Author 50 independent in-card-* cards covering six topics.
2. Bank: publish only reviewed original in-* questions, 203 target, 60 free and 143 Pro. Per-option rationale, sources, verification date and concept links. Deterministic cross-topic free Quick 10 and distinct free/Pro 30-question selection. Run scripts/in-content-verify.mjs.
3. Server: dedicated IN entitlement, authoritative trial and selection, state-safe atomic/idempotent full submission, daily review, mistakes, favorites and import. Exclude IN from legacy purchase fallback. Run scripts/in-server-verify.mjs.
4. Integration: add IN routing/navigation/cookie/types/preview guard and shared pages; provide official linked application checklist, three practice modes and result guidance at 23/30 vs 24/30. Unit checks for topic recommendation sample size and score boundary.
5. Acceptance: isolated file store and seeded accounts, guest/free/IN Pro/other-state Pro on desktop/mobile; complete Quick 10/30; refresh, repeats, trial enforcement, mistakes/favorites/daily, AZ Full45 and switching; questions/quiz/study/typecheck/production build; production gate HTTP tests. Capture actual results and independent review, fix material findings.
6. Delivery: inspect staged diff and commit only scoped paths; report branch/SHA/local URL/counts/official evidence/acceptance and opening configuration.

## Coordination ledger
- Tasks 1 and 2 own separate content files; Task 3 owns server files; integration owns client/routing. Shared contract: StateCode and PrepCode add IN; pack.pickFull(seed, pro?) supports full-pool selection; /api/auth/me supplies indianaPro and packFullExamCount.IN.
- User instruction overrides old skill instructions about global Pro, ten articles and production release. Costs: IN intentionally requires independent access; existing states keep their current rights.
- Initial fetch failed sandbox SSH/DNS; Windows OpenSSH elevated fetch succeeded. Native managed worktree created and branch selected.

## Completion ledger

1. Official sources audited;43 of50 independent cards publishable;7 drafts retained with exact reasons.
2.203 original question candidates authored;170 published(60 free/110 Pro);33 drafts gated. Editorial review addressed answer-length cues and repetitive/tautological prompts. Client files generated only from published content.
3. Server rights/trials/persistence completed; memory,file,isolated PostgreSQL and all handler tests pass. Candidate migration017 not applied externally.
4. All requested IN flows and shared state/account navigation implemented; independent review findings fixed. Official and site exam settings remain separate.
5. Desktop/mobile core,expired/account/guide matrices, route/production gates,type checks,existing targeted regressions and final production build pass. Details and limitations in indiana-candidate-2026-11-13.md.
6. Local branch/worktree retained for review; no merge,push,remote deployment or production data changes. Content targets remain a public-opening gate.
