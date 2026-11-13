# Shared full-practice recovery

## Changes

The baseline is main commit `3c693ace5cbba4b4c454c9c2e1ae78b2aa14d390`. CT and NC candidate acceptance supplied the full-save, metadata, login-initialization and topic-navigation findings.

Before release, the branch fast-forwarded to `0aa92cc4a48a6f03b2b602b3ea40ec2424274d3f`, including the NY/PA/LA shared Study Guide release. The final integrated production build, type check, full/guest/auth regressions, isolated HTTP suites and `guide:verify` passed again. Browser refresh retained the existing AZ full notebook and LA guest-imported full result. LA guide marking, unmarking and both refreshed states persisted, and its topic link opened a fresh question view.

- Full practice for AZ, CA and HI now uses the existing atomic full-submission service alongside NY, PA and LA. One transaction validates, grades, saves answers and the exam, records review identities, and consumes the state's allowance. The response includes authoritative `fullExamCount` for the client gate.
- Legacy per-question attempts are reused when repairing a partially saved classic-state full. This covers an existing metadata-only exam and an interrupted sitting whose summary never saved. Matching historical result rows keep their original score and timestamp. A missing original attempt identifier produces a conflict while the browser retains the source.
- Completed guest full practice is archived and imported through the full endpoint after login. Full results and their missed-question links restore after refresh for classic and pack states. Pending results survive pruning after 35 subsequent acknowledged Quick 10 saves. Excess free full practice remains locally available with the account-allowance message and can sync when Pro is active.
- PracticeLaunch remounts ExamRunner for each state, mode and topic. Client initialization consumes `start=1` across states and recognizes older completed classic full URLs.
- AuthForm exposes credential fields after client initialization and uses POST for native fallback across login, registration and password flows. The server HTML includes JavaScript guidance.
- The Next config uses blocking metadata for all user agents. Each initial response places its current canonical and robots tags in HEAD, supporting the managed metadata lifecycle during client navigation. [Next configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots)

## Executed verification

- Production-mode local build and type checking passed.
- Memory-store regressions passed for six-state guest full import, canonical answer restoration, scored/unscored totals, owner isolation, retries, allowance boundaries and Pro retry. AZ regression also covers a complete free Full 45, existing partial results, missing summary recovery, late rollback, concurrent trials, best score and the ordinary Pro-question permission check.
- Actual pgStore on isolated PGlite commits each AZ/CA/HI full in 14 SQL statements. Existing NY/PA/LA transaction and question-revision regressions passed.
- Actual local HTTP passed free, active-Pro and expired-Pro full grading, immutable replay, allowance counters, account-ID checks and daily history for AZ/CA/HI. Existing-state saves and PA/LA settings, cards, full practice and Tutor fallback regression passed.
- Desktop browser completed AZ Full 45 as a free account. All 45 answers were selected. Submission reached the result in approximately 81 ms on the local file-store server, showing 11/45. Refresh restored the result and its scoped 34-question notebook.
- At a 390 by 844 viewport, a guest completed LA full practice with 10/40, followed the result's notebook link, signed in normally, and saw 30 scoped mistakes. Both the notebook and full result restored after refresh.
- Browser state-picker navigation passed for all six public homes with one current canonical in HEAD and one applicable robots tag. The CT placeholder had one noindex robots tag and one CT canonical in HEAD. The local HTTP suite also checks candidate practice routes return 404.
- Server HTML checks passed for the four auth routes with JavaScript guidance and deferred credential forms. The hydrated browser login used method POST and returned to its requested state page. Slow-initialization protection is covered by the mount regression.
- Existing auth, bound sessions, sittings, mistake mutations, daily review, Quick 10 migration and account-read regressions passed.

## Candidate integration

CT and NC continue from their own worktrees and release gates. Merge their state enums, sync list, question lookup and route guards with this shared version. Preserve CT's specific Pro check and draw validation, and NC's permission-dependent count/draw, free-pool restriction and state Pro receipt mapping. Rebuild their previews to apply the metadata config and rerun the candidate-specific browser, guest full import and cross-state checks.

The database dependency is the existing production structure through migration 016. Full-submission receipts use additive fields inside the existing study-plan JSON document.

## Production verification

Code commit `203caccfc49eff28fb81cbc0b16d444aa9a0dbe0` was pushed normally to main. Vercel deployment `dpl_FHwRWjk4wf7sktPKXkfpcpK4NNez`, `arizona-bi5z9wj7b-sharkkk.vercel.app`, reached READY and the formal domain resolved to that deployment and SHA.

- Actual HTTP on the formal domain passed six-state Pro full submission, server grading, refreshed answer/history reads, immutable duplicate results and Daily Study history. AZ/CA/HI free and expired-Pro accounts each used their first state trial successfully. NY/PA/LA free and expired accounts already had their trial and received 402 with unchanged answers and history.
- Successful production submissions took 4.32 to 7.72 seconds from the test client. Each new full saved all 30, 40, 45 or 50 answers. CA retained a 40-item scored denominator and PA retained 25. Dedicated test accounts were used for every write.
- The production browser refreshed the original NY guest Quick 10 notebook and showed the same original 0/10 result with 10 missed questions. This supplements the earlier desktop/mobile sign-in acceptance. The new complete AZ desktop and LA mobile browser sittings were verified locally. Their production counterparts were exercised through HTTP.
- Public homes and candidate placeholders returned one current canonical and robots tag in HEAD. Auth server HTML deferred credential forms. CT/IN/NC practice and public-state preview routes returned 404. Production `guide:verify` passed AZ/NY/PA/LA chapter content and existing storage-isolation regressions.
- A 30-minute Vercel runtime query scoped to the code deployment returned zero matching error records after acceptance.

After the write suites finished, three sequential authenticated samples per route measured these medians from the same test machine. HTML response headers arrived in 359 to 387 ms for Login, NY Practice, Study Guide, Wrong Answers and Daily Study. The complete HTML responses ranged from 371 to 955 ms. Account, wrong-answer and Daily Study API response medians were 1,236 ms, 1,462 ms and 2,792 ms. The earlier baseline medians were 3,391 ms, 1,558 ms and 3,291 ms respectively. These measurements describe the sampled HTTP responses, with network and warm-instance variation.

The login page's gzip-normalized script payload decreased from 317,178 to 174,878 bytes. The NY guide decreased from 308,591 to 182,041 bytes while incorporating the separately released complete guide. The question-intensive Practice, Wrong Answers and Daily Study payloads remained near their previous size. Raw measurement and acceptance evidence is retained under the isolated worktree's `.tools` directory.
