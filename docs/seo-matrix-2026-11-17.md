# State SEO expansion

## Scope and implementation

- [x] Inventory the current origin/main catalog and article routes. All 28 states are available. Arizona has 14 indexed editorial guides and the other 27 states have 10 independent articles each, totaling 284.
- [x] Read recent Search Console landing pages and queries using the existing read-only service account. Use observed clicks and impressions when available and record access failures explicitly.
- [x] Add two original English preparation articles per state. Keep existing URLs. Match each state's actual examination, training or assessment workflow and current product availability.
- [x] Combine existing and supplemental articles in one public catalog used by routes, resources, sitemap and shared article rendering.
- [x] Add contextual free Quick 10, full practice, Study Guide and Pro question-bank actions to editorial pages. Respect RI/TX capability flags. Keep existing analytics attribution.
- [x] Add reusable verification commands for all states, at least ten distinct articles each, sources, product links, discoverability, metadata and sitemap coverage. The initial check failed because the public expansion catalog was absent.
- [x] Extend both existing add-notary-state Skill locations with the matrix, source, conversion and verification requirements.
- [x] Run the content checks, TypeScript, production build and HTTP/browser checks against the actual public routes.

## Acceptance

Every available state has at least ten independent, indexable editorial articles, separate from core product pages. Each new article answers a distinct preparation question with state-specific examples and official sources. Readers can reach applicable study products and further reading. Production publication follows the current task's authorization and repository release rules.

## Local acceptance evidence

- Base revision is `93ed44e`, fetched from origin/main on November 17, 2026. Work is isolated in `D:\webtest\state-seo-matrix` on `feature/state-seo-matrix-20261117`.
- Added 56 articles. Arizona has 16 editorial articles and every other available state has 12. Total is 340. Core product pages are excluded from these counts.
- `npm run seo:matrix:verify` passed for all 28 states. The catalog checks article count, duplicate paths and titles, supplemental content, official references, contextual guide links, sitemap and capability-aware product actions.
- A simulated unreleased-state regression confirms draft-state articles stay outside the public sitemap. Article availability follows the current state registry when later regions are added.
- `node node_modules/typescript/bin/tsc --noEmit` passed.
- `npm run build` passed and generated 746 static pages. The first sandboxed build encountered Windows EPERM creating a generated directory. Retrying with the required filesystem access succeeded.
- `npm run seo:matrix:http` passed against the local production build on port 3417. It checked all 340 articles, 28 state indices and 426 distinct internal targets, including server-rendered body, one H1, canonical, indexability, BlogPosting data, index discovery and product actions.
- HTTP acceptance found a pre-existing Arizona guide link pointing at a 308 alias. The shared guide component now links directly to the canonical exam-preparation page and the final check passed.
- `npm run analytics:verify` passed, including 19 funnel regressions. `node scripts/full-state-verify.mjs` passed for 19 learning packs. `node scripts/ri-tx-verify.mjs` passed capability and direct-call checks.
- Independent review found no actionable defects in the catalog, route patterns, resources, sitemap or capability gating. Primary-source review spot-checked Indiana, Nebraska and Louisiana numerical or workflow claims.
- Actual Chrome desktop check opened the new Arizona review article and followed its free-practice link to a loaded 10-question session.
- Actual Chrome 390-by-844 responsive checks opened Arkansas, California, Rhode Island and Texas articles. The inspected pages had a document width of 375 pixels inside the 390-pixel viewport. Arkansas's contextual guide link opened its state Study Guide. Rhode Island's free action loaded question 1 of 10. California's full action loaded question 1 of 45 and a running timer, and its Pro action opened California Pro. RI/TX article actions showed free practice, Study Guide and question review.
- Responsive browser emulation was used. Physical phones were outside these checks. The user authorized commit, normal push to main and production publication on November 17, 2026. Production deployment and official-domain acceptance are recorded after the release.

## Search Console selection evidence

Read-only Search Console query used final Web data for October 17 through November 13, 2026, across 54 returned page rows and 26 returned page/query rows. Page totals were 3 clicks and 427 impressions. The Arizona retake article supplied all 3 clicks from 56 impressions, with average position approximately 6.93. FAQ, passing-score, fees, open-book and remote-notary entries also had impressions. These small samples support topic exploration and do not establish a high-volume article.

Direct Google requests failed with network timeout. The existing system proxy provided the authorized read-only connection. Raw response evidence is kept locally in ignored `.tools/seo-traffic.json`.

## Sources and editorial choices

New content is stored by state in `data/seo-articles/`. Each file contains two independently written articles and its dated official references. `data/seo-matrix-articles.ts` supplies the shared article metadata and capability-aware actions. `lib/seo-article-catalog.ts` combines existing and new content for public consumers.

The new topics prioritize practice explanation, readiness, application evidence and sequencing. Existing subject articles retain their URLs and provide coverage of acts, identity, records, fees, bond and remote authority. Arizona already had the requested principal search intents, so its additions address practice-result review and manual retrieval drills.

Official pages were reopened where accessible. Earlier source-review dates are retained for materials carried forward from the existing source audit, including Texas documents that returned HTTP 405 during this review. The full paid Louisiana official guide was unavailable to the original content review. The new roadmap tells readers to use that current prescribed guide alongside the site's selected statutory exercises.

Both `.cursor/skills/add-notary-state/SKILL.md` and `.agents/skills/add-notary-state/SKILL.md` were updated in the isolated worktree and the original `D:\webtest\web` checkout. Existing instructions and unrelated changes in the original checkout were preserved. A before-and-after scenario review confirmed that the new section rejects single-topic filler, orphan articles, wrong-state product links, invented exam counts and unsupported traffic claims.

Both Skill locations passed the bundled skill-creator validator with Python UTF-8 mode. The original GBK-default invocation could not decode the Chinese text, so validation was rerun with `python -X utf8`.

## New public paths

The following paths are present in the verified local build. Their publication status follows the release record above.

- AZ has 16 articles. Added `/arizona/guides/practice-test-score-review/` and `/arizona/guides/open-book-manual-lookup-drills/`.
- AR has 12 articles. Added `/arkansas/guides/free-notary-exam-practice-review/` and `/arkansas/guides/exam-to-active-commission-checklist/`.
- CA has 12 articles. Added `/california/free-practice-questions-explained/` and `/california/practice-test-review-checklist/`.
- CO has 12 articles. Added `/colorado/guides/free-open-book-practice-questions/` and `/colorado/guides/training-exam-application-timeline/`.
- CT has 12 articles. Added `/connecticut/guides/free-application-exam-practice/` and `/connecticut/guides/first-application-readiness-checklist/`.
- HI has 12 articles. Added `/hawaii/free-practice-questions-explained/` and `/hawaii/application-documents-study-checklist/`.
- IL has 12 articles. Added `/illinois/guides/free-course-exam-practice-questions/` and `/illinois/guides/course-certificate-application-checklist/`.
- IN has 12 articles. Added `/indiana/guides/free-exam-practice-questions-explained/` and `/indiana/guides/failed-exam-review-and-retry-plan/`.
- LA has 12 articles. Added `/louisiana/guides/free-notary-practice-case-review/` and `/louisiana/guides/official-guide-study-roadmap/`.
- MD has 12 articles. Added `/maryland/guides/free-course-exam-practice-review/` and `/maryland/guides/course-certificates-circuit-court-checklist/`.
- ME has 12 articles. Added `/maine/guides/free-notary-practice-study-questions/` and `/maine/guides/first-commission-study-and-oath-plan/`.
- MO has 12 articles. Added `/missouri/guides/free-training-assessment-practice/` and `/missouri/guides/application-to-county-qualification-plan/`.
- MT has 12 articles. Added `/montana/guides/free-exam-practice-questions-review/` and `/montana/guides/education-exam-certificate-timeline/`.
- NC has 12 articles. Added `/north-carolina/guides/free-course-exam-practice-questions/` and `/north-carolina/guides/course-to-application-study-calendar/`.
- NE has 12 articles. Added `/nebraska/guides/free-exam-practice-before-classmarker/` and `/nebraska/guides/passing-certificate-90-day-checklist/`.
- NJ has 12 articles. Added `/new-jersey/guides/free-notary-exam-practice-questions/` and `/new-jersey/guides/manual-videos-exam-application-plan/`.
- NM has 12 articles. Added `/new-mexico/guides/free-course-exam-practice-review/` and `/new-mexico/guides/education-bond-oath-upload-checklist/`.
- NV has 12 articles. Added `/nevada/guides/free-commission-exam-practice/` and `/nevada/guides/course-exam-proof-silverflume-checklist/`.
- NY has 12 articles. Added `/new-york/guides/free-notary-practice-questions-explained/` and `/new-york/guides/exam-day-document-and-review-checklist/`.
- OH has 12 articles. Added `/ohio/guides/free-notary-course-practice-review/` and `/ohio/guides/provider-course-application-readiness/`.
- OR has 12 articles. Added `/oregon/guides/free-open-book-exam-practice/` and `/oregon/guides/notary-basics-exam-oath-timeline/`.
- PA has 12 articles. Added `/pennsylvania/guides/free-exam-practice-questions-explained/` and `/pennsylvania/guides/exam-study-plan-and-appointment-checklist/`.
- RI has 12 articles. Added `/rhode-island/guides/free-knowledge-assessment-practice/` and `/rhode-island/guides/first-application-training-document-plan/`.
- TX has 12 articles. Added `/texas/guides/free-course-review-practice-questions/` and `/texas/guides/education-assessment-review-plan/`.
- UT has 12 articles. Added `/utah/guides/free-notary-exam-practice-review/` and `/utah/guides/test-background-bond-oath-checklist/`.
- VT has 12 articles. Added `/vermont/guides/free-jurisprudence-exam-practice/` and `/vermont/guides/oath-examination-upload-readiness/`.
- WI has 12 articles. Added `/wisconsin/guides/free-four-year-exam-practice/` and `/wisconsin/guides/exam-evidence-oath-bond-application-checklist/`.
- WY has 12 articles. Added `/wyoming/guides/free-application-exam-practice/` and `/wyoming/guides/education-exam-paper-application-checklist/`.
