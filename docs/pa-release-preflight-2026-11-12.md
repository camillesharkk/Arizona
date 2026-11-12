# Pennsylvania release preflight — November 12, 2026

## Candidate and implemented opening

Branch release/pa-public-ready-20261112 starts from the accepted6eeb696358518d893df925bb04edbb17f818c725. A fresh fetch retained origin/main e76376b19d49c45d3b341c27b4fa42cea831423f, which is an ancestor of this candidate. All previously accepted shared changes were already present once in its history and absent from the fetched main. The shared sandbox diagnostic was added as da1fd46, equivalent to LA's9148ea0. Public-opening implementation commit is094f4b44518d2ab2ee04f5727eaa737f3918d1b5.

The candidate adds13public feature pages under /pennsylvania/ and a guide wrapper serving ten articles. Public paths replace PA preview links in the pack and all PA article/reference data. The selector marks PA available, learning APIs admit PA, and the sitemap includes21indexable PA paths. Daily Study and Wrong Answers retain noindex. LA's public root retains its development page, LA learning remains blocked in production mode, and middleware continues to reject all production preview HTML/RSC requests.

A targeted regression exposed an additional selector defect. The legacy live-state list omitted PA, so its matching practice destination fell back to the Arizona path. The fix adds PA to that existing mapping, recognizes PA source paths, writes its state cookie and avoids a duplicate PA preview item. Tests cover both the routing function and the actual rendered menu, including NY practice to PA practice and the reverse.

The bank remains203questions,30free/173Pro,50independent cards,ten articles and three references. The accepted30-question/60-minute/three-choice practice is preserved. This opening requires the existing016 schema and introduces no database migration or new Paddle product.

## Fresh acceptance

- The final sandbox-configured production build passed with Next15.5.24 and218generated pages. The final build includes the selector fix. Generated Next configuration changes were restored.
- TypeScript, PA content audit, PA public registry/routes/selector/sitemap checks,200seeded choice-position checks,500Quick10 seed topic coverage and full-submission regression passed.
- The built candidate served all13PA feature paths and ten guide URLs over HTTP. Tests checked content, canonical URLs, actual reference headings, absence of stale PA preview links and the anonymous Daily Study login return path.
- Fresh dedicated free, active-Pro and expired-Pro accounts each saved a complete PA sitting and recovered its immutable duplicate. Paid answers returned402,200,402respectively. PA learning endpoints returned200 and LA returned404. All production preview HTML/RSC probes returned404.
- Existing AZ/CA/HI/NY HTTP checks passed free/active/expired rights and persisted answer attribution. Updated NY public, progress, entry and Tutor regressions passed with LA isolation retained.
- Isolated PostgreSQL checks retained legacy history/favorites, transaction rollback, trial and replay guarantees. The latest PA measurement was101to14SQL statements and47.5to20.2ms. NY measured131to14statements and80.4to24.9ms in the same isolated run.

The prior16-sitting desktop/mobile browser matrix remains the accepted practice-flow evidence. This round did not rerun that matrix. New public-route/selector browser smoke and actual pricing-button/visible-checkout acceptance remain pending because Computer Use stopped when it could not reliably determine the Windows browser URL. HTTP and rendered-component checks above are recorded separately from browser evidence.

## Payment condition

The PA pricing page and server quote returned200, with1999USD cents for the dedicated newcomer account and standard2221USD cents. The request supplied sourceState PA. The application checkout returned502/PADDLE_CHECKOUT_HTTP and the matching direct provider diagnostic returned403/forbidden. No transaction was created. The configured server key also failed the sandbox root, so account ownership and permissions could not be introspected. The account owner must resolve that credential check before visible checkout, sandbox payment/callback and a resulting60-day entitlement can be verified. [Shared payment investigation](paddle-sandbox-preflight-2026-11-12.md)

PA therefore remains a prepared local public-opening candidate awaiting payment and new public-entry browser acceptance. The original checkout and its unfinished work remain preserved. The accepted PA preview branch remains at6eeb696. The delivery message records the final receipt commit on this release branch.

## Later authorized release commands

Run these only after checkout acceptance and the owner's PA release instruction. The candidate contains the necessary earlier shared and PA commits, so it can be pushed as an ordinary descendant of the current main. A changed remote main requires integration and affected verification first. The commands stop if its ancestry no longer includes the fetched main.

```powershell
Set-Location C:\Users\20683\.codex\worktrees\pa-independent-1112\web
git switch release/pa-public-ready-20261112
git fetch origin
git merge-base --is-ancestor origin/main HEAD
if ($LASTEXITCODE -ne 0) { throw 'Integrate current main and verify the candidate first' }
git push origin HEAD:refs/heads/main
```

Then follow the Vercel deployment for this exact pushed SHA and verify arizonanotaryprep.com PA pages, account saving, checkout, existing states, LA restriction and production preview404s. These production actions await the owner's release instruction.
