# PA and LA official source-link check

Checked November 12, 2026 from the final isolated-worktree content exports using `scripts/pack-test-utils.mjs` and its `testLoader`.

## Inventory and results

- 130 distinct official URLs were extracted from question `source_reference`, independent-card `sourceUrl`, and official-target links in each state's ten articles and three reference pages.
- Pennsylvania uses seven distinct URLs. Louisiana uses 123.
- All 130 sources were reachable through the official web reader or direct HTTP GET.
- 127 URLs returned official content on the initial direct web read. Two Louisiana URLs required following links from an official index or application page. One Pennsylvania endpoint required direct HTTP verification.
- No confirmed dead links or unresolved source-access failures remain.
- All 406 questions contain an embedded source URL.
- All 116 Louisiana Civil Code article-number checks matched the actual target article. The Pennsylvania statute PDF returned the expected Chapter 3 RULONA text, the examination PDF returned the Pennsylvania Notary Examination Candidate Information Bulletin, and Department pages returned their expected topical titles.

The machine-readable inventory includes every URL, its question/card/article usages, final method, reader reference where available, expected and observed Civil Code article numbers, and numeric HTTP status where directly observed. It is stored in `.tools/pack-source-link-result.json`.

## Recovered access failures

The direct web reader could not initially open the Louisiana examination page. Following the examination link on the official application page returned that same canonical URL with the current examination information. [Official examination page](https://www.sos.la.gov/notary/get-exam-information)

The direct web reader briefly returned an unexpected-status error for Civil Code article 1839. Following its link from the official Civil Code index returned the same canonical URL and article 1839 text. [Article 1839](https://www.legis.la.gov/legis/Law.aspx?d=109078)

The web reader could not open the Pennsylvania Code query endpoint. A direct GET with a browser user agent returned HTTP 200 and the title “4 Pa. Code Chapter 167. Notaries Public.” The official static route also returned HTTP 200 and was readable through the web reader. The existing query URL therefore remains a reachable citation target. [Existing query endpoint](https://www.pacodeandbulletin.gov/Display/pacode?file=/secure/pacode/data/004/chapter167/chap167toc.html), [official static route](https://www.pacodeandbulletin.gov/secure/pacode/data/004/chapter167/chap167toc.html)

## Method and limits

Web reads used at most two simultaneous calls containing eight URLs each. Targeted retries followed the official sites' own links. The final Pennsylvania HTTP test used one request at a time with a 15-second timeout.

The web reader exposes returned content and fetch errors, while withholding numeric successful HTTP status. Accordingly, 129 results are recorded as web-reachable with numeric status unavailable. The Pennsylvania query endpoint has an observed HTTP 200. The alternate static endpoint also has an observed HTTP 200 and is additional recovery evidence outside the 130-URL inventory.

This check confirms source access, document identity, and Louisiana article-number targets. It does not establish complete substantive coverage of every cited statute or the paid Louisiana official guide. The separate content review records cover legal-content decisions and the unavailable-guide limitation.

Only the link-result artifact and this review record were written during this check.
