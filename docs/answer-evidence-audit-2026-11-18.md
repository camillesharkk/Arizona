# Published question evidence review

The inventory checked 5,701 published questions across all 28 available states on November 18, 2026. It found zero missing source IDs, usable HTTPS source URLs, question citations, or recorded verification dates. The questions reference 338 source IDs and resolve to 550 distinct links, including supplemental sources. Archived and unreleased rows are outside the published inventory.

Run `node scripts/source-evidence-audit.mjs` from the repository root to reproduce the totals and list any missing fields by question ID. Pass an optional output path to save the URL-to-question manifest. The audit checks the evidence shown by the UI and preserves each question's historical verification date. HTTP destination checks cover a targeted sample.

## What readers see

- Practice and question-bank answers, diagnostics, worked examples in the shared state guide, and Arizona, California and Hawaii sample questions share the same **Official source** and **Last verified** display.
- 1,021 answers use an official URL from the authored question citation. A further 164 California answers link to their cited statute section. Six California answers and 28 Indiana answers link to the cited page in an official handbook or FAQ. The remaining 4,482 use the registered official source, often an individual statute or agency page.
- For California statute links, the official January 2026 handbook is also linked. The link opens the specific PDF page whenever the cited provision appears in that edition. The answer dates and authored citations remain in their underlying records.

## Link access and citation depth

- The targeted HTTP check covered 53 source destinations. Six returned a success response and 47 returned 403 to the automated client. A 403 does not establish that a visitor's browser will be blocked. No URL returned 404 in that targeted set.
- All nine blocked legacy Hawaii legislature URLs were matched to identical provisions on the legislature's current data host, and the replacement section text was opened. [Hawaii Revised Statutes §456-1](https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001.htm).
- California's statute portal returned 403 to automated requests. A readable official handbook fallback is provided. The California Secretary of State's exam page also supplements the cited CPS HR page. [2026 Notary Public Handbook](https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf) · [Take the Exam](https://www.sos.ca.gov/notary/checklist/take-exam).
- The direct PDF for the New York exam notice returned 403 to the automated client. The official Department of State Notary Public page is provided as an alternate entry. The separate September 2026 License Law PDF resolved successfully. [Department of State](https://dos.ny.gov/notary-public) · [License Law](https://dos.ny.gov/notary-public-license-law-0).
- The Indiana Notary Public Guide download returned 403 to an automated request. All 121 questions that cite it show the original PDF and link to the official INBiz notary resources as an alternate starting point. The Indiana New System FAQ also has a verified alternate PDF on the state site, with page links when the citation gives one page. [INBiz Notary Resources](https://inbiz.in.gov/certification/notary) · [Indiana Secretary of State FAQ](https://www.in.gov/dA/93ab6b5f72/New-Notary-System-FAQs-5-4-26.pdf?language_id=1).
- For handbook-only or agency-only references with no recorded subsection, the UI presents the recorded citation and the exact official document or agency page. Missing subsection specificity is different from a missing source. New provision links for those rows require editorial review.
