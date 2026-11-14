# RI and TX main-site release

## Scope and baseline

The user authorizes implementation, acceptance and production publication of Rhode Island and Texas in the existing main repository. This task starts from freshly fetched origin/main f4b27a9b0d975a99e166a3e2ec469693769a7648 in the existing clean managed worktree, on feature/ri-tx-main-20261114. The formal domain is bound to Vercel sharkkk/arizona, project prj_yVHKKHXztH54E4rKOJrC7Wa7bV5B. Its baseline deployment is READY. Other local branches, including four unpublished commits on local main, remain preserved.

Current main has RI/TX coming-soon entries and map boundaries. Its remote and local main trees contain no RI/TX content drafts. TX implementation is authored within this repository. The task excludes the old Texas repository, deployment, database, products, accounts and user data.

## Implementation design

Reuse shared state navigation, PracticeLaunch, ExamRunner, QuestionsClient, StudyGuide, StudyCardsClient, CloudMistakes, DailyStudyClient, guest import, account progress and analytics. Per the current migration skill, each state receives203 original questions,50 independent knowledge cards and10 authored articles. Preserve the established60-free/143-Pro access split and existing main-site account-wide Pro semantics.

RI uses official requirements and recommended knowledge assessment. TX uses the current SOS course and its embedded assessment. Public practice uses Quick10, topical practice and question-bank entry points. Independent mock-exam and state purchase capabilities are separately gated. The current main product is account-wide60-day Pro. RI/TX-specific purchasing remains closed until the requested payment configuration and test checkout acceptance exist. Existing active main-site Pro access continues to cover available states.

## Implementation and acceptance checklist

- [x] Verify current repository, remote main, production binding and migration manual. Start isolated branch.
- [ ] Verify both states' primary official sources, transition rules, first application, renewal and RON requirements. Record dated source audits.
- [ ] Add state identity, saved-session/import schemas and content projections. Preserve published-state behavior.
- [ ] Separate learning readiness from full-practice and purchase availability. Enforce corresponding server guards and hide unavailable public links.
- [ ] Deliver both203-question banks,50 independent cards, complete guides and10 articles per state, with60 free questions and a topic-balanced Quick10.
- [ ] Verify state-correct GA4/PostHog events and one emission per completed destination or sitting event.
- [ ] Run existing regressions and production build. Accept both states' desktop/mobile preview learning, login import, refresh/retry, loading, empty/error and cross-state flows.
- [ ] Synchronize latest remote main, publish through the existing main-site workflow and wait for READY.
- [ ] Verify formal-domain directory, free submissions, source links, sitemap and existing-state/account behavior. Record final counts, deployment and SHA.

## Verification commands

Use targeted RI/TX tests alongside the existing state integration, guest storage/import, analytics, quiz, session, study, guide, mistakes, payment and PostgreSQL regression suites. Keep preview and production evidence separate. Use existing test environment and designated main-site test accounts. Raw credentials stay in existing environment configuration and ignored local test inputs.
