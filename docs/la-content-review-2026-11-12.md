# Louisiana content review

Reviewed November 12, 2026 in the isolated `D:\webtest\pa-la-acceptance` worktree based on `origin/main` at `e76376b`. This record covers Louisiana content and the local draw function. Shared runtime, database, browser, and release acceptance are recorded by the parent task.

## Delivered content

- 203 published local-bank questions with 203 distinct IDs and normalized stems. The count meets the confirmed current Arizona floor of 203.
- 195 newly authored English exercises across civilian instruments and substantive legal rules, supported by 116 distinct current Civil Code articles. Every option has specific feedback and every question has an official URL and verification date.
- The eight pre-existing `la-001` through `la-008` retain their stems, options, answer keys, explanations, option feedback, versions, free flags, scenarios, and effective dates. Their source URLs and verification date were refreshed after rechecking the official pages.
- 29 free and 174 Pro questions. This distribution retains the existing five free legacy questions and provides 24 free new questions.
- 50 independently authored study cards with distinct IDs and fronts. Each card contains a rule, scope boundary, common mix-up, official source link, and review date. The cards are manually written concept explanations, without conversion from question rows.
- 10 independently authored English articles of 323–345 words each across the lede and section bodies. Each has three substantive sections and primary official links. The additional passing-score, laws, and become-a-notary reference pages are counted separately.

## Question coverage

- Qualification, pre-assessment, bond, commission, and parish authority cover eight retained questions.
- Authentic acts and evidence cover 20 questions.
- Donations and forced heirship cover 27 questions.
- Testaments cover 25 questions.
- Mandate and suretyship cover 28 questions.
- Ownership, usufruct, servitudes, and ordinary indivision cover 20 questions.
- Matrimonial property covers 17 questions.
- Sales and contractual rights cover 18 questions.
- Mortgages cover 18 questions.
- Registry covers 12 questions.
- Obligations, capacity, consent, and nullity cover 10 questions.

The substantive exercises use different legal issues and fact patterns. Names, amounts, and dates are not mechanically varied to manufacture additional questions. Shared scenarios connect execution, gifts, and testament issues, with every grouped question independently answerable from the fact pattern. Two hypothetical changes explicitly say “suppose instead” to avoid contradicting the shared facts.

## Comprehensive practice

Final entry review added four independently written administration cards covering qualification, pre-assessment, continuing bond/status duties, and residence-parish transfer. The catalog now contains 54 independent cards so every visible study topic has at least one card. This supersedes the earlier 50-card content checkpoint.

The 29-question free pool retains the five legacy free questions and distributes 24 new free items across every substantive topic. This prevents empty free-topic entries; free/Pro totals remain 29/174. Free allocation is a site product setting, not an official exam weighting.

`pickLaFullExam(seed)` returns 40 unique scored questions and an empty `unscoredIds` array. Its 90-minute timer is a site study setting configured by the shared pack. Topic quotas are editorial design choices.

Each draw contains five authentic-act questions, four donation questions, five testament questions, five mandate questions, four property questions, three matrimonial-property questions, four sales questions, four mortgage questions, three registry questions, one obligations question, and two administration questions.

One complete original shared scenario is selected per sitting and appears first as a group. The remaining questions are deterministically sampled from the full bank under those topic quotas. The eligible scenario groups concern a two-city closing, a proposed camp donation, and a current-law testament. The retained pre-assessment scenario also remains available in the administration pool.

The current official page specifies a four-hour computer sitting, general-knowledge and scenario-application items, the 2026 official guide, and a passing scaled score of 70 out of 100. Its total item count is unpublished. The site's 40-item count, 90-minute study timer, topic quotas, and raw accuracy results are local practice parameters. The reference pages explain the official scoring model and the site's practice results. [Official examination information](https://www.sos.la.gov/notary/get-exam-information)

## Primary sources and current-law decisions

Every new question and card cites its individual current Civil Code article. `data/la-scenarios.ts` contains the official article-to-URL map used by the content. The 116 cited question articles were opened through the Legislature's current index during this review. The article groups include selected provisions on property, donations, testaments, evidence and obligations, matrimonial property, sales, mandates, suretyship, mortgages, and registry. [Louisiana Legislature Civil Code index](https://www.legis.la.gov/legis/Laws_Toc.aspx?folder=67&title=CC)

The review identified material testament changes under Acts 2025 No. 30. Current article 1576 provides the written and dated notarial testament, notary and two witnesses, required signatures, the unable-testator alternatives, and the identification-and-adoption signature standard. The new content follows that consolidated provision. Former articles 1577 through 1580.1 are repealed. [Current article 1576](https://www.legis.la.gov/legis/Law.aspx?d=108901)

The olographic material uses current article 1575, including signature location, date clarification, and handwritten later modifications. Witness competence follows current article 1581. Separate legacy consequences under articles 1582 and 1582.1 are preserved. [Article 1575](https://www.legis.la.gov/legis/Law.aspx?d=108900), [article 1581](https://www.legis.la.gov/legis/Law.aspx?d=108907), [article 1582](https://www.legis.la.gov/legis/Law.aspx?d=108908), [article 1582.1](https://www.legis.la.gov/legis/Law.aspx?d=206060)

Current article 2442 reflects Acts 2025 No. 488 and distinguishes parties bound at the making of the act from third-person effect after filing. The sales and registry content applies the current wording. [Article 2442](https://www.legis.la.gov/legis/Law.aspx?d=109483)

The qualification sequence uses the approved application, mandatory once-only nonlawyer pre-assessment, no pre-assessment passing threshold, and the stated 37-day and 30-day deadlines. The direct examination URL initially failed in the browsing tool and was successfully opened using the official application page's examination link. [Application process](https://www.sos.la.gov/notary/application-process), [examination information](https://www.sos.la.gov/notary/get-exam-information)

The administrative reference page cites the current official fees for qualification, pre-assessment, examination, study guide, commission documents, bond renewal, and credit-card convenience charges. The FAQ supports the lifetime commission, signature as seal, $50,000 bond, bond duration, fee-schedule distinction, attorney exam exemption, and residence-parish transfer rules used by the retained questions. [Forms and fees](https://www.sos.la.gov/notary/forms-fee-schedule), [official FAQ](https://www.sos.la.gov/notary/frequently-asked-questions)

## Verification performed

- Node imported all Louisiana content exports successfully with `--experimental-strip-types`.
- Assertions confirmed the 203-question count, unique IDs and normalized stems, four distinct options per question, official source URL, November 12 verification date, and substantive feedback for all four options.
- Assertions confirmed 50 unique cards, 10 articles, at least three sections per article or reference page, and official-target source links.
- A 1,000-seed draw audit confirmed exactly 40 unique items, deterministic repeated results, all ten substantive topics plus administration, an intact first shared-scenario group, and empty `unscoredIds` for every draw.
- All 203 published questions appeared across that 1,000-seed audit. Negative, zero, and large numeric seed checks also returned 40 items.
- A legacy comparison transpiled the `origin/main` Louisiana content in memory and deeply compared every field except refreshed source references and verification date. All eight existing questions matched.
- `npx tsc --noEmit` passed after the content was integrated in this worktree.
- `git diff --check` passed for the owned Louisiana data files.

The audit assertions were executed directly through Node. Their exact checks are described here for reproducibility. The parent task owns durable cross-pack verification scripts and actual application acceptance.

## Declared limits and external release condition

The complete paid 2026 official study guide was not obtained or read in this review. The Secretary of State identifies that guide as the source of official examination items. This bank is original statutory practice across selected public-law topics and carries that guide limitation in the visible reference pages. Complete guide-to-bank coverage and official item-weight replication remain unverified. The official public page leaves its item count and raw-to-scaled conversion unpublished. [Official exam preparation](https://www.sos.la.gov/notary/exam-preparation)

The Secretary of State states that all examination-preparation providers must register under Act 80 of 2009, effective January 1, 2010. Registration evidence for this service was not supplied to this content task. Public Louisiana availability remains blocked until the applicable registration evidence is verified. Local preview content work and isolated acceptance continue within the user-authorized scope. [Provider registration requirement](https://www.sos.la.gov/notary/register-as-an-education-provider)

No commit, main push, production migration, or public publication was performed by this content task. The original `D:\webtest\web` workspace was preserved.

## Changed paths

- `data/la-content.ts`
- `data/la-scenarios.ts`
- `data/la-cards.ts`
- `data/la-articles.ts`
- `docs/la-content-review-2026-11-12.md`
