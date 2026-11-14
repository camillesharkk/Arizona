# RI and TX production release

Checked November 14, 2026. Both states passed acceptance on the formal domain.

## Production status

- Production source is `088d524958e2846636c98675636ae9ce740b1e7c`.
- Vercel deployment `dpl_HYA1eUEWCfpxgPvTamYUYgmucXpD` is READY. Its deployment host is `arizona-iw2fbiepi-sharkkk.vercel.app`.
- The apex `arizonanotaryprep.com` and `www.arizonanotaryprep.com` are bound to that deployment in the existing `sharkkk/arizona` project.
- Formal-domain acceptance passed for 2 of 2 states. Rhode Island is at https://arizonanotaryprep.com/rhode-island/ and Texas is at https://arizonanotaryprep.com/texas/.

## Published content and official routes

Each state has 203 original questions, including 60 free questions and 143 covered by existing main-site Pro. Each has 50 independent knowledge cards, zero additional question-conversion cards, ten authored chapters and ten independent articles. Counts come from the published content registry.

### Rhode Island

Review the official manual, Standards and law. The SOS recommends free training and a Knowledge Assessment score of at least 80 percent. The ordinary application requires an oath before a Rhode Island notary, two original application pages and an $80 fee, followed by physical submission. The ordinary commission lasts four years. The guide separately explains renewal, the statutory 30-day holdover, professional exceptions and approved-provider remote authorization.

The official assessment's item count, time limit and separate credential remain unverified. Their configuration fields are null. Independent full-exam mode is closed. Free Quick 10, topical practice, the question bank, cards, guide, articles, Daily Study and the account notebook are available. [Official application instructions](https://www.sos.ri.gov/Divisions/NotaryPublic/ApplyForNewCommission)

The detailed dated review is [the RI source audit](full-state-RI-sources-2026-11-14.md). It records statutory precedence for identity evidence, fees and directed signatures, along with the specific disagreements among official publications.

### Texas

The current SOS education requirements apply to applications and renewals submitted from January 1, 2026. Complete the appropriate SOS course before applying. The adopted minimum is 70 percent, the course ceiling is two hours, and the course fee is $20 per taking. The official portal guide gives a 30-minute assessment. Its public item count remains unverified. The ordinary route continues through a $10,000 surety bond, application and statutory filing components of $21 plus applicable portal charges, approval and oath. Renewal and online authority have separate applicable education and process instructions.

The public content uses Practice Questions and Course Review. Independent full-exam mode is closed. Free Quick 10, topical practice, the question bank, cards, guide, articles, Daily Study and the account notebook are available. [Official SOS entry](https://www.sos.state.tx.us/statdoc/notary-public.shtml), [final adopted education rules](https://www.sos.texas.gov/texreg/archive/December262025/Adopted%20Rules/1.ADMINISTRATION.html)

The detailed dated review is [the TX source audit](full-state-TX-sources-2026-11-14.md). It includes the 2025 record-retention and credible-witness amendments, the one-year completion-proof period, the distinct 90-day fee-to-course deadline, online identity branches and the single-certificate fee examples.

## Pro purchase status and remaining blocker

The existing main-site `az_exam_pro_60d` product grants 60-day account-wide `ALL` access. It covers RI and TX. Existing active main-site Pro authorizes each complete question bank and the shared Tutor allowance. Use this shared product when purchase acceptance is complete.

The current RI/TX purchase entries remain closed because the existing main-site Paddle sandbox credentials failed actual preflight. On November 14 at 14:15 UTC, the public sandbox root returned 200, while the authenticated root and current-product lookup both returned 403 with `forbidden`. The preflight reported `credentialAccepted=false`. Sandbox checkout creation and actual provider-originated callback acceptance remain blocked by the test credentials. Product applicability has been confirmed in the current main repository.

An isolated contract test now exercises each state's source attribution, the actual webhook route, real SDK signature verification, invalid-signature 401, one paid order, exactly 60 days of `ALL` entitlement and duplicate callback idempotency. Its Transactions API is mocked. This is contract evidence. Actual sandbox acceptance requires usable test configuration through the existing secret settings.

## Acceptance evidence

- Protected previews `e135926` and `7770f06` became READY. Both states passed desktop and phone Quick 10, result explanations, official next-step links and real designated main-site test-account login returns before production activation.
- The activated preview and initial production release passed CA to RI to TX to AR at widths 1440 and 390. Each sitting used one Start, the correct state bank, a 7/10 result and three original misses. Result and notebook refresh preserved the original sitting without duplicate writes.
- Final production `088d524` passed four RI/TX desktop and phone runs with the same completion and login-retention checks. Each state passed 19 public URL checks for directory entry, title, description, canonical, production indexing and sitemap. Thirteen established state/auth routes and production preview isolation also passed.
- Actual production account checks verified current RI/TX PostHog profile attributes, purchase and full-mode 403 responses, unchanged account rights, preserved existing-state learning and unconsumed closed-full trials.
- Configured production GA4 and PostHog browser dispatch emitted one landing, start and completion event per state with correct state fields. View events were unique per completed destination. QA captured transports before external ingestion. PostHog intentionally filters automation, so the measurement fixture used an ordinary browser user agent and disabled its local webdriver marker. The fixture exercised ordinary-browser dispatch.
- The reviewed local production build passed all 16 combinations of two states, two widths and guest/free/active-Pro/expired-Pro accounts. It covered learning routes, 60 or 203 authorized questions, independent cards, topic navigation, saved Quick 10 and refresh.
- Both states passed local registration and new-tab email verification at both widths, retaining a 0/10 sitting and one imported history row. Email delivery used an isolated simulated response. Test redirects used one consistent origin.
- Notebook loading, empty, failure and retry, Daily Study loading/failure/retry, all-chapter completion, and closed-full anonymous-trial preservation passed at both widths. Guide read/unread persistence also passed on preview.
- The real PostgreSQL store passed isolated PGlite import, rollback and queued concurrent retry checks. Each RI/TX duplicate pair retained one 9/10 sitting, one wrong answer and ten attempts. Cross-state question injection was rejected. PGlite serializes transactions on one connection. Multi-connection row-lock contention requires a separate test.
- Content verification passed all 19 complete learning packs. Global Pro verification covered 28 states. The existing checkout attribution suite and the added RI/TX signed callback contract passed. Analytics passed 19 tests. Quiz, sitting, session, auth, study, guide, mistakes and Paddle regressions passed.
- TypeScript and the final production-config build passed. All 286 RI/TX Pro-only question texts were absent from 283 built browser chunks.

## Access and test limits

The local automation browser encountered a timeout on RI's official application entry and a 405 human-verification page on the TX SOS entry. The RI primary application text was retrieved through the research browser. TX SOS findings used indexed official passages alongside fully retrieved current legislative Chapters 406 and 121. Both source audits record the access methods and discrepancies.

Mobile evidence uses responsive browser viewports. Physical-device testing, actual sandbox checkout completion and real provider callback delivery are outside the completed evidence. The last two payment checks remain blocked by the recorded sandbox 403.

## Repository and deployment scope

Work started from freshly fetched `origin/main` at `f4b27a9b0d975a99e166a3e2ec469693769a7648` in the managed `remaining-seventeen` worktree on `feature/ri-tx-main-20261114`. Latest remote main was fetched and integrated before each production publication. Other local branches and the original checkout's unpublished work were preserved.

TX was independently implemented inside the current main repository. Research, content and runtime integration used current main-site components and storage. Production used the existing GitHub-to-Vercel main workflow and existing environment configuration. This release reuses the existing database schema. Its production verification used designated main-site test accounts. Existing test-account sessions supported production acceptance.

The final release audit and additional isolated payment contract coverage are retained on the feature branch. The production source SHA above identifies the deployed application.
