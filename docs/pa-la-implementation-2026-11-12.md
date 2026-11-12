# PA and LA isolated acceptance

Base: freshly fetched `origin/main` e76376b19d49c45d3b341c27b4fa42cea831423f. Original checkout, its four local commits and unfinished favorite changes are preserved. No main push, deployment or public opening is authorized in this round.

The existing pack routes, HomeStudy, PracticeLaunch, ExamRunner, StudyCardsClient, DailyStudyClient, account-wide Pro and state-scoped records remain the architecture. Shared changes are committed separately. Content files are owned separately by state; the root agent integrates shared routes and performs acceptance.

- [x] Fetch current main; create isolated worktree; read repository and NY release evidence; run baseline quiz/sitting checks.
- [ ] Extend the tested NY atomic full-submission flow to PA/LA, retain PA 25-scored/5-unscored quotas, validate seed and choices, restore completed results, and test duplicate/concurrent/expired-account behavior.
- [ ] Reduce repeated user/plan reads inside full submissions; measure actual isolated saves and document the remaining production latency limit.
- [ ] Add per-pack article/reference/source registries and shared reference routes; keep production PA/LA blocks and sitemap unchanged.
- [ ] PA: official-source review, at least 203 effective unique questions, 50 independent cards, ten articles and three reference pages; preserve the existing 30-question format.
- [ ] LA: verify current official structure and current civil law, implement site-labeled scenario practice, at least 203 questions, 50 independent cards and ten articles. Provider registration is an independent public-release gate.
- [ ] Run content, draw, historical persistence, PostgreSQL, Tutor, account, commerce, type and production-build checks.
- [ ] Use isolated dedicated example.invalid free/active/expired accounts and browser desktop/mobile contexts; complete both full sittings, refresh and retry; distinguish browser observations from HTTP and automation.
- [ ] Stage explicit shared/PA/LA file sets, review diffs, commit separately, and create per-state branches based on the shared commit for independent release.

Release requires a later user instruction. Re-fetch before integration; shared commit first, then only the approved state's content commit and explicit public-route/registry/API/sitemap opening after its remaining gates pass. Existing production migration 016 is confirmed by the user's instruction and committed NY evidence. This round must not change production data/configuration.
