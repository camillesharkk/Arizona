# Louisiana isolated release acceptance — 2026-11-12

## Outcome and inventory

The LA development candidate is complete for local review. Public release remains blocked by missing provider-registration evidence and the existing Paddle sandbox API refusal. Complete coverage of the paid official2026 guide remains unverified and is visibly disclosed. No main push, production migration or public opening occurred.

The preview contains home, practice, question list, independent cards, study guide, wrong answers, Daily Study, resources, examination guide, passing/results, laws, application and pricing pages, with shared account/dashboard/settings and Tutor. Ten original articles and three separate reference pages have working preview routes.

- 203 questions:29free and174Pro, including195new original exercises citing116Civil Code articles. Existing la-001 throughla-008 content and versions remain preserved.
- 54 independent cards; zero question-derived cards counted as independent. Every visible topic has free questions and at least one card.
- Ten original articles plus three references.

[LA content review](la-content-review-2026-11-12.md) records the source decisions, including the2025testament reform and repeal of former1577–1580.1. The current official exam page states a four-hour computer sitting, general-knowledge and scenario-application items, the2026official guide and scaled70/100. Official item count and raw-to-scaled conversion remain unknown. [Official exam information](https://www.sos.la.gov/notary/get-exam-information)

The application reference explains qualification approval, mandatory once-only nonlawyer pre-assessment without a passing cutoff,37-day qualification/pre-assessment and30-day examination-registration deadlines, fees and post-exam commissioning. The public official pages and current statutes were read; the complete paid2026study guide was not obtained. [Application](https://www.sos.la.gov/notary/application-process), [forms and fees](https://www.sos.la.gov/notary/forms-fee-schedule)

## Practice and acceptance

LA comprehensive practice is a site-designed40-question,90-minute set. All40are scored as raw study feedback. Each draw preserves a complete linked scenario and samples across authentic acts, donations, testaments, mandates, property, matrimonial regimes, sales, mortgages, registry, obligations and administration. It is not a full official-exam replica or scaled-score predictor.

The corrected build completed eight LA browser sittings across1440px desktop/390px phone and anonymous/free/active-Pro/expired-Pro identities. Every full sitting was answered through browser controls, reached40-of40, restored in-progress selections and retained results after refresh. Quick10, topics, card reveal, actual reference headings, navigation, signed-in daily history and mistakes were exercised. The combined16-sitting matrix ended with zero page errors.

Normal LA local browser submission waits were29–94ms. A delayed desktop-Pro response crossed the20-second wait; the retry returned the original result after about20.1seconds and retained exactly one exam. Separate HTTP full saves measured21–28ms. These are local FileStore observations, not production database latency measurements.

Authenticated HTTP checks separately verified answer/mistake/favorite retention, attempt deduplication, stale-version and state rejection, settings, daily-card completion, full history, and free/expired versus active-Pro permissions. PA and AZ data were preserved. Free/expired accounts were denied an additional full trial. After adding the final four administration cards, a390px targeted browser check verified their topic filters and reveals; existing settings, completed daily tasks and full histories remained intact.

One user-approved real DeepSeek response was requested through the LA Quick10 explanation button for the bond question. It cited the LA Secretary of State FAQ and the displayed correct choice. The shared account counter advanced from1after PA to2after LA. No account details were included in the provider payload. Local fallback, provider-outage attribution,75/300quotas and paid-question restrictions were verified separately.

Isolated PGlite tested actual PostgreSQL saving, atomic rollback, immutable replay, trial limits, skipped/mixed answer scoring and durable usage receipts. LA full submission uses14warm SQL statements rather than131in the comparison path. This does not explain or retest the earlier NY production45-second delay.

## Database, payment and public-release conditions

No new migration is required beyond the accepted016 schema. Existing state-scoped storage and the account-wide60-day entitlement serve LA. Production Neon was not queried or changed in this round.

LA uses the existing az_exam_pro_60d product. Code mapping, server quote and commerce/Paddle regressions passed. Actual pricing-button sandbox checkout returned502/PADDLE_CHECKOUT_HTTP because the provider returned403forbidden. Product/API-root read probes also returned403. No transaction or charge was created. API access, actual product ownership and visible checkout need successful re-verification; production keys/configuration were preserved.

The Secretary of State requires examination-preparation providers to register under Act80. No registration evidence for this service was available. Keep LA unavailable until that evidence is verified. The bank is explicitly presented as selected statutory practice; complete official-guide coverage is not certified. [Provider requirement](https://www.sos.la.gov/notary/register-as-an-education-provider)

## Independent candidate and release sequence

Branch: acceptance/la-ready-20261112. Separate worktree: C:\Users\20683\.codex\worktrees\la-independent-1112\web. It includes shared changes plus LA content and cards, with no PA content/revision commit. Its LA-only content audit, typecheck and independent production build passed. The delivery message identifies the final receipt commit SHA.

Canonical integration order from freshly fetched main is shared8d46f78, shared766a211, then LA76ce917 and183af43 plus its acceptance record. Shared commits are applied once, even if PA was integrated earlier. After its external gates and an explicit LA release instruction, open only LA public routes, selector/registry, server gates and sitemap; rerun affected acceptance, ordinarily push main and verify the deployed SHA/domain. This round deliberately leaves all those production conditions closed.

Production domain checks retained NYpractice200, PA/LApreviewpractice404 and PA/LApublic-root Under development pages. The original checkout and its four local commits and unfinished favorite work remain preserved. The shared record distinguishes browser, HTTP, structural/editorial and PostgreSQL evidence.
