# Three-branch SEO integration — 2026-11-27

Base: 43c22cd82a24dbfd34746e86d222b4b0f67fbe4a.
Inputs: 650e8d50bb13ca9ca25eb46b0654084916fe74b6, its ancestor 4cfb0ce16243f9ab261f103b7fa19165431bb7e7, and d17f42e63a199e20e79144d5cdf8c2e8c2c2cc06.

## Resolution decisions

- Preserve the server-graded, state-aware result diagnosis, skip accounting, scored-subset handling, account continuation, entitlement-driven offers, and cross-tab result-event deduplication from practice-seo.
- Keep funnel-seo's shared attempt ID on exam start and completion; remove its overlapping second result_view effect.
- Preserve reviewed NY/OH samples and chapter links; add the three reviewed NC samples and card links. Sample approval fingerprints pass for all three states.
- Keep Ohio Practice focused on the runner and Ohio Questions on worked samples; retain topic navigation and key the question bank by state plus topic so topic changes refresh it.
- Keep the sourced NY official-exam distinction and retake article analytics.
- Include funnel-seo's checkout stages, checkout attempt correlation, committed payment/entitlement reporting, public branding, courses redirects, global 404 handling, contact noindex and sitemap cleanup. Keep the practice-seo law sitemap entry and real source dates.
- Combine both migration-guide additions. No database migration, price, refund policy or environment configuration changes were made during integration.

## Checks on the integrated tree

Passed: npm ci; TypeScript; optimized production build; questions, quiz, sitting, SEO matrix, analytics, Paddle, Lifetime, commerce, practice-result and practice-SEO checks.
HTTP production-build checks passed for 648 routes, 27 purchase entries and 638 sitemap entries. NY/OH HTML, RSC and 294 client chunks exclude 198/197 respective non-sample questions. Focused AZ/IN/OH/NY SSR, metadata, redirects, chapter anchors and sitemap checks pass. Internal NY preview correctly returns 404 in production; preview-mode metadata check remains available with --vercel-preview.

Not revalidated: interactive browser flows on this integrated version, real Paddle checkout/payment, production entitlement database, actual analytics receipt, GSC and registration email. Earlier branch reports remain separate evidence. No production write or deployment occurred.

## Delivery blocker

HTTPS git push has no CLI credentials. Connected GitHub create-blob and create-ref calls returned 403 Resource not accessible by integration. Browser GitHub session is signed out. Integrated local history contains all three source commits; transfer via the accompanying incremental Git bundle to an authenticated local checkout, then use a PR or a normal non-force main push after confirming main has not advanced.
