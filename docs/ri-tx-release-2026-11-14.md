# RI and TX main-site release

## Scope and baseline

The user authorizes implementation, acceptance and production publication of Rhode Island and Texas in the existing main repository. This task starts from freshly fetched origin/main f4b27a9b0d975a99e166a3e2ec469693769a7648 in the existing clean managed worktree, on feature/ri-tx-main-20261114. The formal domain is bound to Vercel sharkkk/arizona, project prj_yVHKKHXztH54E4rKOJrC7Wa7bV5B. Its baseline deployment is READY. Other local branches, including four unpublished commits on local main, remain preserved.

Current main has RI/TX coming-soon entries and map boundaries. Its remote and local main trees contain no RI/TX content drafts. TX implementation is authored within this repository. The task excludes the old Texas repository, deployment, database, products, accounts and user data.

## Implementation design

Reuse shared state navigation, PracticeLaunch, ExamRunner, QuestionsClient, StudyGuide, StudyCardsClient, CloudMistakes, DailyStudyClient, guest import, account progress and analytics. Per the current migration skill, each state receives203 original questions,50 independent knowledge cards and10 authored articles. Preserve the established60-free/143-Pro access split and existing main-site account-wide Pro semantics.

RI uses official requirements and recommended knowledge assessment. TX uses the current SOS course and its embedded assessment. Public practice uses Quick10, topical practice and question-bank entry points. Independent mock-exam and state purchase capabilities are separately gated. The current main product is account-wide60-day Pro. RI/TX-specific purchasing remains closed until the requested payment configuration and test checkout acceptance exist. Existing active main-site Pro access continues to cover available states.

## Implementation and acceptance checklist

- [x] Verify current repository, remote main, production binding and migration manual. Start isolated branch.
- [x] Verify both states' primary official sources, transition rules, first application, renewal and RON requirements. Record dated source audits.
- [x] Add state identity, saved-session/import schemas and content projections. Preserve published-state behavior.
- [x] Separate learning readiness from full-practice and purchase availability. Enforce corresponding server guards and hide unavailable public links.
- [x] Deliver both203-question banks,50 independent cards, complete guides and10 articles per state, with60 free questions and a topic-balanced Quick10.
- [ ] Verify state-correct GA4/PostHog events and one emission per completed destination or sitting event.
- [x] Run existing regressions and production build. Accept both states' desktop/mobile preview learning, login import, refresh/retry, loading, empty/error and cross-state flows.
- [x] Synchronize latest remote main, publish through the existing main-site workflow and wait for READY.
- [x] Verify formal-domain directory, free submissions, source links, sitemap and existing-state/account behavior. Record final counts, deployment and SHA.

## Verification commands

Use targeted RI/TX tests alongside the existing state integration, guest storage/import, analytics, quiz, session, study, guide, mistakes, payment and PostgreSQL regression suites. Keep preview and production evidence separate. Use existing test environment and designated main-site test accounts. Raw credentials stay in existing environment configuration and ignored local test inputs.

## Candidate verification evidence

The first protected Vercel preview is READY at `https://arizona-cjtnbeb2t-sharkkk.vercel.app`, deployment `dpl_F21dwzYTgFDre8j8Co6EpHaRiGp4`, source `e13592644bbc591ede081a120e434313e14c7716`. Both states passed desktop1440 and phone390 Quick10, single Start,7/10 result, explanations, state official link, real main-site test-account login return, original wrong answers and idempotent result/notebook refresh.

The reviewed local production build passed all sixteen combinations of two states, two widths and guest/free/activePro/expiredPro. It verified seven learning routes, independent cards and topic navigation,60or203 authorized bank questions,6/10 saved Quick10 and refresh. Both states passed mocked local-email registration and new-tab verification with0/10 retained and one imported sitting, at both widths. Loading/empty/failure/retry notebook and Daily Study checks, all-chapter completion and closed-mode browser-trial preservation passed at both widths. These mail checks use isolated local data and a local simulated delivery response.

Fresh native checks passed all19complete learning packs, server handlers, guest storage/import,28-state global Pro rights,21-state source checkout policy, analytics18/18, quiz, sitting and session regressions. TypeScript and the reviewed production build passed. Separate capability review corrected unavailable pricing switch destinations, renewal CTAs, guide completion wording and direct-full trial side effects. Source review tightened RI oral-oath/provider-training pointers and TX credential/credible-witness and one-certificate fee scope.

After direct preview acceptance, RI/TX are activated in the state registry for the next candidate. Directory, cross-state client navigation, production indexing and formal-domain checks remain release gates.


## Release candidate checks

The activated preview is READY at https://arizona-gu36so3xn-sharkkk.vercel.app, deployment dpl_G2juymDfGGYT3jbJYrpeU52Sm6KQ, source7770f06ffc9c906cc4143e755234987a3daedebd. Production-config local checks found each state in the directory and verified19public URLs per state, canonical descriptions, production indexing and sitemap, plus thirteen established site/auth routes. Paid-stem inspection checked all286RI/TX Pro-only question texts across283browser chunks with zero matches.

The actual PostgreSQL store passed isolated PGlite imports for RI/TX, including queued concurrent duplicate handler requests, one9/10 sitting, one wrong answer, ten attempts and cross-state injection rejection. PGlite uses one connection and serializes transactions. Multi-connection row-lock contention is outside that test. All existing full-submission and rollback checks also passed.

The protected preview has no configured public GA4 or PostHog browser keys, so its real analytics dispatch is unavailable there. The existing formal California page does configure GA4. Native state/deduplication analytics tests pass18/18. Formal-domain dispatch verification remains pending.

External official-link access from the local automation environment encountered an RI page timeout and a TX HTTP405 human-verification page. The RI official application text was retrieved through the research browser. TX SOS process and final adopted rules were checked through indexed primary passages, alongside fully retrieved current legislative Chapters406and121. Source audits disclose those access limits. The public pages retain the verified official URLs.


## Formal-domain acceptance

Production deployment dpl_GT9itRvge98x1MQqHBkJXJUMe2L1 became READY with apex and www aliases, serving e45cec2f6557c1da15645e2d715b8ac3d99f0926. On the formal domain, all six desktop/mobile CA-to-RI-to-TX-to-AR runs passed a single Start, the correct ten-question bank,7/10result, official next step, guest login to the original notebook, original misses and duplicate-free result refresh. Both states passed all19public URLs each, directory entries, current canonical/description/robots, sitemap, thirteen established routes and production preview isolation. Accepted state count is2.

The final analytics review identified an inherited fixed AZ user-profile property in syncAnalyticsIdentity. It now derives the state from the same current-path-before-cookie resolver as client events. A fail-first regression reproduced AZ instead of RI, then passed RI and TX after the fix. Analytics now passes19/19tests, and the additional production-config build and TypeScript pass. Formal GA4 browser capture observed the correct RI state and one landing, start and completion event. PostHog browser transport is undergoing a separate connectivity check because its remote SDK/config assets did not produce an event POST during the initial QA observation.

Only existing main-site environment configuration and main-site designated test accounts were used. No production schema migration, payment, entitlement grant or old Texas resource access occurred. Registration email delivery was simulated locally. Mobile checks use responsive browser viewports, with physical devices outside the test evidence.
