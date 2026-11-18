# Published question evidence review

The inventory checked 5,701 published questions across all 28 available states on November 18, 2026. It found zero missing source IDs, usable HTTPS source URLs, question citations, or recorded verification dates. The questions reference 338 source IDs and resolve to 542 distinct links, including supplemental sources. Archived and unreleased rows are outside the published inventory.

Run `node scripts/source-evidence-audit.mjs` from the repository root to reproduce the totals and list any missing fields by question ID. Pass an optional output path to save the URL-to-question manifest. The audit checks the evidence shown by the UI. It does not update a question's historical verification date or establish that all 542 destinations were independently rechecked.

## What readers see

- Practice and question-bank answers, diagnostics, worked examples in the shared state guide, and Arizona, California and Hawaii sample questions share the same **Official source** and **Last verified** display.
- 1,049 answers use an official URL from the authored question citation. A further 164 California answers link to their cited statute section, and six link to the cited section of the California Secretary of State handbook. The remaining 4,482 use the registered official source, often an individual statute or agency page.
- For California statute links, the official January 2026 handbook is also linked. The link opens the specific PDF page whenever the cited provision appears in that edition. The answer dates and authored citations remain in their underlying records.

## Link access and citation depth

- The targeted HTTP check covered 53 source destinations. Six returned a success response and 47 returned 403 to the automated client. A 403 does not establish that a visitor's browser will be blocked. No URL returned 404 in that targeted set.
- All nine blocked legacy Hawaii legislature URLs were matched to identical provisions on the legislature's current data host, and the replacement section text was opened. [Hawaii Revised Statutes §456-1](https://data.capitol.hawaii.gov/hrscurrent/Vol10_Ch0436-0474/HRS0456/HRS_0456-0001.htm).
- California's statute portal returned 403 to automated requests. A readable official handbook fallback is provided. The California Secretary of State's exam page also supplements the cited CPS HR page. [2026 Notary Public Handbook](https://notary.cdn.sos.ca.gov/forms/notary-handbook-current.pdf) · [Take the Exam](https://www.sos.ca.gov/notary/checklist/take-exam).
- The direct PDF for the New York exam notice returned 403 to the automated client. The official Department of State Notary Public page is provided as an alternate entry. The separate September 2026 License Law PDF resolved successfully. [Department of State](https://dos.ny.gov/notary-public) · [License Law](https://dos.ny.gov/notary-public-license-law-0).
- Indiana's two existing official guide URLs returned 403 to automated requests. The Secretary of State still identifies the live INBiz guide URL, and the indexed official copies refer to the editions already cited. Both addresses and their recorded question dates are preserved. Closing this access gap requires checking the same guides in an ordinary browser or obtaining equivalent official copies. [Indiana Secretary of State material](https://www.in.gov/sboa/files/SOS_Indiana-Notary-Public-Update_NEO_2024.pdf).
- For handbook-only or agency-only references with no recorded subsection, the UI presents the recorded citation and the exact official document or agency page. Missing subsection specificity is different from a missing source. New provision links for those rows require editorial review.
