# Louisiana release status — November 13, 2026

## Public release condition

Louisiana remains unavailable on arizonanotaryprep.com. Production main is 07f0fcf67674d9596a975a0ff3ee63fd4a7a581a, with Pennsylvania open and Louisiana learning APIs blocked. The LA opening code is retained locally on release/la-public-pending-20261112 at 6cfd963eadee19effb1c9bea6796eaa4951299c2. It has never been pushed to main or deployed to production. Its parent history includes the corrected shared JSON binding once.

The current paid preparatory service falls within R.S.35:191.4. Each instructor needs a Louisiana commission with statewide authority. The provider needs annual registration and a one-year 25000-dollar commercial-surety performance bond, subject to the statutory exemptions. The project's registration acceptance, provider legal identity, instructor Notary IDs and bond evidence remain unverified. The bounded project/mail checks found no usable certificate. The public registry link was broken, so this does not establish that the operator has never registered. [Current statute](https://www.legis.la.gov/Legis/Law.aspx?d=670801)

The owner must supply current registration evidence covering this website, electronic delivery, provider entity and instructors. If it does not exist, complete the official form, obtain the required instructor credentials and surety bond, sign and submit the registration, and obtain confirmation from the Notary Division. The preparation record lists every form field, addresses and contact details. The separate filing fee is unknown. The 25000 dollars is the bond amount, with premium quoted by the insurer. [Provider entry](https://www.sos.la.gov/notary/register-as-an-education-provider), [registration form](https://www.sos.la.gov/media/s2obsoky/notary-education-provider-registration-form.pdf), [bond form](https://www.sos.la.gov/media/30nbkoq1/bond-form-educational-services.pdf), [prepared materials](la-release-preflight-2026-11-12.md)

## Delivered candidate and fresh acceptance

- Retained 203 questions, 29 free and 174 Pro, 54 independent cards, zero question-derived cards, ten articles and three reference articles. The fresh audit reported no structural errors or similarity candidates. The earlier legal/content review remains applicable.
- Added 13 public feature wrappers, the ten-article route, public LA links, selector mapping, learning API admission and 21 indexable sitemap URLs. Daily Study and Wrong Answers remain noindex. These opening changes exist only on the unpublished candidate.
- Preserved the site's 40-question, 90-minute scenario practice and raw study scoring. The official four-hour examination and scaled passing score of 70 remain distinct. The published official item count remains unknown.
- TypeScript and the 240-page production-mode build passed. The shared postgres.js-aware PGlite verification passed. LA retained 14 warm submission statements, compared with 131 before batching, measuring 20.8ms locally. This excludes network latency.
- Built-server HTTP checks passed all 13 feature pages and ten articles, reference headings, canonical URLs and login returns. Free, active-Pro and expired-Pro accounts each completed a 40-item server-graded sitting, recovered score 100, returned the original duplicate and retained exactly one history row. Paid answers returned 402, 200 and 402. PA public checks also passed against this candidate.
- The browser switched PA to LA and entered the LA full practice on one Start click. It answered every one of 40 questions, submitted 10/40 and restored the same result after hydration on refresh. This anonymous sitting stays in browser storage. Signed-in cloud persistence is covered by the actual HTTP tests and the previous desktop/mobile account matrix.
- A 390x844 browser checked the new public card URL and flipped the qualification card. The page showed 54 independent cards and LA navigation. Previous full desktop/mobile practice coverage is retained in the acceptance record.
- NY public routing, progress/legacy-history, entry/settings, Tutor mock boundaries, reference renderers, full grading/trial/concurrency, Quick10 coverage, schema compatibility and migration executor regressions passed. Production-mode preview HTML and RSC URLs returned 404 even with STATE_PREVIEW enabled.

Browser artifacts remain ignored under .tools. They include la-public-browser-result.png and la-public-mobile.png. The local test server was stopped after acceptance. No migration was added or executed.

## Checkout evidence

The sandbox's authenticated root, product read and transaction creation remain provider 403, with the application returning 502/PADDLE_CHECKOUT_HTTP. Account ownership and exact key status/permissions cannot be identified from the rejected response. Current sandbox key/token formats and environment match. [Investigation and owner dashboard steps](paddle-sandbox-preflight-2026-11-12.md)

Under the owner's explicit unpaid-production fallback authorization, the existing dedicated free test account obtained a 1999-cent quote and created a Paddle transaction through the formal production API with sourceState LA. Both API responses were 200. The returned checkout URL displayed the shared Notary Prep Pro — 60-Day All-State Access product with US$19.99 due. The browser exited the checkout, leaving payment fields empty. Billing checks showed zero orders on each dedicated account.

This check used the production API and returned checkout URL. The LA public pricing page remains closed on production. Its actual purchase-button-to-checkout path must be rechecked after registration permits public release. Provider-stored source metadata was not read back through Paddle's API. No real payment, provider callback or payment-created 60-day grant was performed. Existing mocked payment/callback/reconciliation and commerce regressions passed. Production credentials and existing products/prices were preserved.

## Official guide evidence

No authorized full copy or receipt for the 2026 Fundamentals of Louisiana Notarial Law and Practice was available. Full-text review and chapter-by-chapter coverage remain unverified. Current content promises selected statute-based skills and expressly limits coverage. The repository's existing rollout requirement does not establish full-guide coverage as an additional mandatory launch gate for that limited offering.

The owner can purchase the official guide for 100 dollars. The published fee schedule lists a five-dollar credit-card convenience fee, with the exact online total shown at checkout. Supply a lawfully obtained copy for a topic/skill coverage review. This is recorded separately from provider registration and payment testing. [Official preparation page](https://www.sos.la.gov/notary/exam-preparation), [official purchase portal](https://coraweb.sos.la.gov/Notary/OrderStudyGuides.aspx), [order form](https://www.sos.la.gov/media/nkuc2x5a/notary-study-guide-order-form.pdf)

## Resume after registration evidence

Validate the provider's accepted registration, instructors' statewide authority and bond coverage against this service. Then fetch current origin/main into the independent LA branch and integrate any new changes. Rerun the affected checks and build, including la-public-verify.mjs, la-public-http-verify.mjs, PA preservation, schema compatibility and shared payment regressions. Ordinary-push the verified LA descendant to main, follow its exact Vercel SHA to READY and confirm the formal alias. Finish LA production browser/account/submission/Tutor checks and the actual LA pricing-button checkout before reporting LA open. Recover by closing LA entry/API/sitemap changes if a production defect appears, retaining user records.
