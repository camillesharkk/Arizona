# Pennsylvania isolated release acceptance — 2026-11-12

## Outcome and inventory

The PA development candidate is complete for local review. Public opening is not approved in this round and the checkout acceptance gate remains blocked by the existing Paddle sandbox API returning forbidden. No main push or production deployment occurred.

The preview contains home, practice, question list, independent study cards, study guide, wrong answers, Daily Study, resources, examination guide, passing/results, laws, application and pricing pages. Account, dashboard, settings, rights and Tutor reuse the shared system. Ten original articles have their own working preview URLs; the three reference pages are counted separately.

- 203 questions: 30 free and 173 Pro; every published item has three actual choices and option-specific feedback.
- 50 independent cards; zero question-derived cards counted as independent.
- Ten original articles plus three references. All visible topics have free practice and independent cards.
- Existing IDs are preserved. pa-014 and pa-040 are version2, with prior statistics, history and favorites retained.

Official sources and question review are recorded in [PA content review](pa-content-review-2026-11-12.md). Current Pearson VUE March2026/revision05/2026 confirms 30 items,25 scored plus5 unidentified pretest,60minutes, three choices, and passing scaled75. Its scored outline is4/18/3. Only the five pretest items' topical distribution1/3/1 is site-designed. No raw-pass conversion is asserted. [Official bulletin](https://www.pearsonvue.com/content/dam/VUE/vue/en/documents/publications/283980.pdf)

The application/reference content covers approved three-hour education, Department application and42-dollar fee, separate65-dollar examination, six-month authorization, one OnVUE attempt, required bond/oath/recording/signature steps and the45-day deadline. Current statute and2026 regulations support the operative procedure. This site does not issue the required approved education certificate.

## Actual acceptance coverage

The corrected production build completed eight PA browser sittings:1440px desktop and390px phone, each with anonymous, free, active Pro and expired Pro identities. Browser controls answered the entire30-item set, produced25-of25 practice-scored results, restored in-progress answers after refresh and retained results after refresh. Quick10, topic entry, card reveal, navigation and account-specific Daily Study/history were exercised. All16 PA/LA sittings together produced zero page errors after the real reference-route fix.

Normal PA browser submission waits were30–57ms in this local FileStore environment. The desktop Pro response was deliberately withheld beyond the20-second client wait; the displayed retry restored the original result at about20.1seconds total and retained exactly one exam. These are isolated measurements, not production-Neon timings.

Separate authenticated HTTP tests exercised free, active and expired accounts: answer and mistake/favorite persistence, duplicate attempt IDs, stale-version409, wrong-state400, paid-question200/402, settings rereads, daily-card completion rereads and state-specific full histories. PA full HTTP saves measured23–25ms locally. AZ settings and other-state mistakes were preserved. Free/expired accounts could not consume a second full trial; active Pro could.

Actual in-app-browser Tutor entry produced one approved DeepSeek response for the nonlawyer advertising question, citing57Pa.C.S.325(a),(c), with PA context and correct displayed-choice mapping. Only the two user-approved PA/LA requests were sent. Anonymous denial, free/expired paid-question denial,75/300 quotas, source context and attributed provider-failure fallback were verified separately by HTTP, browser and simulated-provider tests.

PostgreSQL tests use the real pgStore against isolated PGlite: atomic rollback, immutable retries, concurrent trial limits, score computation, PA014/040 version1 history and favorite preservation, and usage-receipt replay. Warm PA full submission uses14SQL statements versus101 in the comparison path with cached user/plan reads. Production's earlier NY45-second observation remains unattributed.

## Dependencies and remaining gate

No new migration is required beyond the already accepted016 schema. PA uses existing state-scoped question_stats, exams and study-plan storage and the account-wide60-day entitlement. This round did not query or mutate production Neon.

PA uses the existing az_exam_pro_60d product; no state SKU or price was introduced. Actual sandbox checkout from the pricing button returned PADDLE_CHECKOUT_HTTP/502; provider logs and read-only product/API-root probes returned403forbidden. No transaction or charge was created. Restore sandbox API access, verify the configured product and visually open checkout before marking this gate complete. Existing Paddle/commerce regression and code-level source-state mapping passed; they do not establish a successful live checkout.

## Independent candidate and release order

Branch: acceptance/pa-ready-20261112. Its separate worktree is C:\Users\20683\.codex\worktrees\pa-independent-1112\web. It contains the shared changes and PA content, with no LA content/card commits. Its content audit, typecheck and independent production build passed. The delivery message reports the final receipt commit SHA.

Canonical integration order from a freshly fetched origin/main is shared8d46f78, shared766a211, then PA d4a97f8 and the PA acceptance record. Apply shared commits only once if another state has already integrated them. The branch remains preview-only. After the checkout gate and a PA release instruction, the release task must explicitly open PA public routes, selector/registry, server gates and sitemap, then validate and ordinarily push main and verify the domain's deployment. No such opening or push is part of this acceptance round.

The original D:\webtest\web remains at9def076 with its four local commits, favorite changes and untracked files preserved. Fetched main and the formal-domain deployment were confirmed at e76376b; production PA preview practice remains404 and its public root remains Under development. See the shared acceptance and source-link records for detailed commands and boundaries.
