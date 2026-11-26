# Shared state migration acceptance

## Guest practice survives sign-in

Every state must pass this sequence before release, on desktop and mobile.

1. Start Quick 10 as a guest, answer all ten questions, and record the score, missed question IDs and sitting ID.
2. Open Wrong Answers from the result. Sign in using the ordinary return link, or complete the account creation and email-verification flow.
3. The same ten answers, score, wrong-answer records and history entry must appear under that account. Refresh Wrong Answers, Practice and Daily Study and verify the original sitting remains available.
4. Repeat the import after a timeout or lost response. Count each answer and sitting once, preserve the free full-exam allowance, and show a retry message while browser records remain pending.
5. Switch states and accounts. Preserve state attribution and claim guest work for the first signed-in account only. Previously adopted records must stay with their owner.
6. Keep canonical answer letters, original attempt IDs, sitting IDs, question versions and presentation versions. Archive obsolete question versions intact and exclude them from current regrading. Preserve existing account sittings and favorites.

Use the shared `syncGuestProgress` / `syncCaAttempts` path and authenticated `/api/progress/import/` endpoint. Retain browser data until the server acknowledges it. The default post-login dashboard waits for import completion before reading progress. Cover older homepage Quick 10 sittings as well as the Practice page. Every newly supported state must be included in the shared migration state list and the six-state regression scripts. This import reuses the production schema with migration 016.

## Full practice and completed-result restoration

- Submit the entire full sitting with `kind=pack-full` through `/api/progress/`. Its server transaction validates the state, versions, answer choices and applicable blueprint, grades the answers, writes the review snapshot and exam, and consumes the state's trial together. Ordinary Pro-question authorization stays in effect outside this sitting.
- A retry of the same committed exam returns its original result and authoritative `fullExamCount`. Concurrent new free sittings admit one trial. A late failure rolls back answers, history and trial usage together.
- Retain completed guest full sittings with canonical letters, original seed, question and presentation versions, unscored identities, attempt IDs and timestamp. Login imports them through the same authoritative full endpoint with an account-ID guard. The first imported full consumes the account's free full allowance for that state. An excess full stays on the device with an explanation and can sync after Pro becomes active.
- Preserve every unacknowledged archive row when pruning local history. Limit acknowledged cache rows separately. Verify a pending full survives at least 35 subsequent Quick 10 saves.
- Cover classic AZ/CA/HI metadata-only legacy records whose answers were partially saved. Reuse the original per-question attempt IDs to finish the missing writes once, retain the original matching score and timestamp, and keep the trial consumed. A legacy repair without those identifiers must retain the original browser data and return a conflict instead of duplicating existing counts.
- A completed sitting or matching archive for the current owner may display its result after the trial is used. Viewing that result grants no new trial. Consume `start=1` once for every state, including older classic-state full URLs. After a full result, follow a topic link and verify a fresh question view and separate storage key. Remount the runner when the state, mode or topic changes.
- Daily Study reads, settings updates and card actions preserve each state's full-submission receipt and wrong-ID snapshot, including AZ.

## Login and navigation metadata

- Login, registration and password forms expose credentials only after their client submit handlers are mounted. Native fallback uses POST to the matching auth endpoint. Test server HTML without JavaScript and a slow initialization, and verify no password enters a GET URL.
- Check canonical and robots tags after initial load, client-side state navigation, back/forward, and direct reload. Each completed navigation has one current canonical and one applicable robots tag, including candidate noindex pages. The shared Next config uses blocking metadata for all user agents so metadata stays in the managed head. [Next configuration documentation](https://nextjs.org/docs/app/api-reference/config/next-config-js/htmlLimitedBots)

## Reusable loading checks

- Read account entitlements and exam history once per account response. Share concurrent browser account reads and invalidate them on session changes. Recheck later requests against the server.
- Import one completed Quick 10 in one authenticated request and one learning transaction. Use bulk PostgreSQL reads and writes with the existing answer, review and revision rules.
- Keep navigation metadata independent of question-bank modules so login and reference pages can load their own small client bundles.
- Save a Daily Study document when normalization, the day or its tasks change. Preserve settings, card progress and exam checks on repeated reads.
- Measure HTML response time, account/data API response time and delivered JavaScript separately. Record production samples and the network conditions. Repeat free, active-Pro and expired-Pro checks and verify the same state, account and saving behavior.

## Regression commands

Run `node scripts/guest-progress-verify.mjs`, `node scripts/guest-browser-storage-verify.mjs`, `node scripts/dashboard-guest-verify.mjs`, `node scripts/account-read-verify.mjs`, `node scripts/ny-entry-verify.mjs`, `node scripts/ny-progress-verify.mjs` and `node scripts/pack-performance-verify.mjs`. Run `node scripts/guest-progress-http-verify.mjs` and the existing HTTP suites against seeded local data, followed by type checking, a production build and browser acceptance through the real sign-in return path. Production verification uses dedicated test accounts.

Full-practice regressions also run `node scripts/legacy-full-verify.mjs`, `node scripts/guest-full-verify.mjs`, `node scripts/practice-restoration-verify.mjs` and `node scripts/auth-entry-verify.mjs`. Run `node scripts/shared-entry-http-verify.mjs` against a fresh isolated directory seeded with `pack-test-utils.mjs --seed`, using `PACK_TEST_BASE_URL` for that server. It deliberately consumes each dedicated free/expired account's first full trial.

## Integrating independent state candidates

Apply shared fixes while retaining the candidate's state enums, question lookup, guest-sync state list and server release gates. Preserve CT's own entitlement check and exact draw validation. Preserve NC's state entitlement check, `fullCountFor`/permission-dependent draw and free-pool restriction. Those candidate extensions are reconciled with the shared atomic submission transaction when integrating. Rebuild after changing Next metadata configuration, then rerun each candidate's guest login, full practice, topic navigation, metadata and existing-state regressions. A shared fix does not open a candidate state.

## Free state launches and the two navigation regressions

The 2026-11-14 launch adds AR, CO, IL, ME, MD, MO, MT, NE, NV, NJ, NM, OH, OR, UT, VT, WI and WY to the shared state paths, state cookie parser, session keys, guest archives, server import schema and question lookup. Their free launch configuration hides full simulations, purchasing, standalone study cards, topic drills and Tutor until those capabilities are accepted.

For each free state, finish Quick 10 as a guest with a recorded sitting ID and score. Open the result's Wrong Answers link, wait for the page's sign-in entry, use the real form and return to the original state and sitting. Wait for the notebook's original score summary and completed sync before reading server counts. Refresh and revisit the return URL. Require one history row for that sitting, stable answer totals and the same missed questions. Retry imports preserve the original account, answers, versions and attempt IDs. Test at 1440px and 390px.

Start at an existing state's Practice page. Use the state menu to enter a new state's Practice page, then switch to another new state. Click Start once on each page, including while its account read is pending. Require questions and session storage belonging to the selected state. Check the same state's notebook, remembered state on login/account pages and saved-review button after refresh. Exercise loading, empty and request-failure states and their retries.

Run `scripts/remaining-states-verify.mjs`, `scripts/remaining-states-browser-verify.mjs`, `scripts/remaining-states-ui-states-verify.mjs` and `scripts/remaining-states-pages-verify.mjs` alongside the existing regression commands. The browser runner accepts `STATE17_BASE`, `STATE17_STAGE`, `STATE17_SWITCH=1` and an ignored local `STATE17_ACCOUNT_FILE` containing designated test credentials. Use `STATE17_HEADER_FILE` only for existing preview automation access. Keep all credentials and raw evidence outside Git. Both guest regression suites and the PostgreSQL performance/rollback suite now include all seventeen new banks.

Registration must retain the same return path across the login/register links, the sent-email page and a verification link opened in another tab of the same browser. A short-lived SameSite return cookie carries only a validated local path. Keep the existing verification token and device-session checks. Clear abandoned return paths when a new login/register entry has no valid next destination, and clear the return cookie after a successful session. Test default dashboard behavior and rejected external redirects. Run `auth-return-verify.mjs`, `auth-return-links-browser-verify.mjs` and `guest-register-browser-verify.mjs`. The registration browser suite uses isolated local accounts and simulated email delivery.

## Full product acceptance for the remaining seventeen states

The user expanded the 2026-11-14 release to the complete product. Reviewed full packs have 203 questions, a balanced-topic pool of 60 free questions, 143 server-authorized Pro questions, 50 independent cards, complete shared StudyGuide chapters and ten separate articles. Keep the original first ten IDs and answers stable. The shared account product remains `az_exam_pro_60d` with `ALL` access for sixty days. Use each state's checkout source attribution with the same server-priced quote and existing provider fulfillment.

The initial Comprehensive Practice configuration has forty unique accessible questions and no time limit. Label it as this site's practice setting and retain independently verified official specifications in the application and exam guides. A signed-in free or expired account receives the existing per-state full trial. Active Pro can draw the full bank and repeat full practices. Validate both a free sitting imported into an existing Pro account and a paid sitting retried after its entitlement expires. Finished scores, answer totals and wrong-answer history remain immutable. Expired accounts can see their saved score and progress, with paid explanations available through Pro. An unfinished paid set retains its answers when access needs renewal.

Generate reviewed projections with `node scripts/build-full-state-content.mjs`. During authoring, `--import-authoring --allow-incomplete` imports completed state files and keeps incomplete packs on their free configuration. The final release runs without `--allow-incomplete` and requires all seventeen full packs to pass `full-state-verify.mjs` and `full-state-server-verify.mjs`. Paid question data is imported exclusively by the server-only registry. Search built browser chunks for paid question stems to verify this boundary.

Run `full-state-browser-verify.mjs` with `FULL_STATE_BASE`, `FULL_STATE_STAGE`, `FULL_STATE_VERIFY_CODES` and `FULL_STATE_SWITCH=1`. The normal matrix covers guest, free, active Pro and expired Pro at desktop and phone widths. Check guide read/unread persistence, card flipping, card-to-topic navigation, current-state question banks, full grading, result refresh, saved history and the Pro practice-readiness dashboard. The isolated-local-only `FULL_STATE_TEST_EXPIRE=1` case verifies entitlement expiry after a paid sitting without changing any production rights. Validate Quick 10 guest login and registration returns with the original sitting and stable counts through the existing dedicated suites.

A preview run and a formal-domain run are separate evidence records. Check every public feature page and article in sitemap, canonical tags and production robots metadata. Private notebooks and Daily Study retain their index restrictions. Recheck the existing nine states' core account, answer, wrong-answer, full-trial and shared billing paths before and after publishing.

New-state progress uses the authored study-topic ID as its chapter metadata. Project older generic chapter IDs from the current server question index when returning progress and notebook rows. Preserve the stored answer counts, dates, favorite flags and revision history. New answers and saved-review changes persist the current chapter. Notebook review sittings include a supplied attempt ID so two results in the same state retain separate review queues.

Daily Study loads the same authorized state bank as the question bank and runner. Accept a paid task, record its answer, then change the pending task set without remounting the page. Require the next task's stem and empty answer state. Preset fingerprints and sitting initialization guards prevent the previous set from being persisted under the new key. The isolated `full-state-daily-browser-verify.mjs` suite exercises this transition and real card-study persistence for all seventeen states at both widths.

After a free or expired account submits its first Comprehensive Practice, verify `/api/auth/me/` returns the current state's full count. Refresh the Practice entry and click Start once. The used-trial gate links to that state's Pro page. `full-state-account-browser-verify.mjs` verifies all seventeen account counts, concurrent retry grading, paid-question authorization and normal-entry gates. Reuse `packFullExamCounts` with the already loaded exam rows so the account read adds no database query.

New-state practice and review completion use the existing sixty-second Quick-save allowance. A controlled twenty-five-second successful history response reproduced an early failure under the previous twenty-second deadline. Run `full-state-save-delay-browser-verify.mjs` on isolated localhost to require the delayed 4/4 result, unchanged original 36/40 score and an idempotent history retry. Original-state non-Quick deadlines retain their existing configuration.

## RI and TX capability-specific release acceptance

RI and TX use the complete shared learning architecture with 203 original questions, 60 free and 143 covered by existing main-site Pro, 50 independent cards, ten chapters and ten articles each. Their current process audits are `full-state-RI-sources-2026-11-14.md` and `full-state-TX-sources-2026-11-14.md`.

Use `freeStateFeatures` to keep complete-learning readiness independent of accepted full-practice and purchase capabilities. RI uses the recommended knowledge assessment. TX uses the SOS course assessment. Both expose Quick 10 and topical practice. Their independent full-exam capability and state-specific purchasing are closed. The shared global Pro entitlement continues to authorize their full question banks.

- Hide closed modes and purchase links on home, guides, articles, account menus, results and notebooks. State switching from a pricing page must land on a usable state page.
- A direct closed full URL offers Quick 10 and preserves its anonymous trial flag. The full-submission endpoint rejects a new closed full before any entitlement or learning write. A previously committed full receipt can still replay its original result.
- A disabled state checkout rejects before commerce access. Exclude unavailable pricing routes from sitemap. Next.js can stream a not-found page with HTTP 200, so also inspect the rendered not-found heading and noindex metadata.
- Finish Quick 10 as a guest, follow Wrong Answers, sign in, and retain the exact sitting, score and original misses. Refresh and repeat the return without adding answer counts or a second exam. Repeat on desktop and phone widths for each state.
- Verify registration and email-link returns in an isolated mail fixture. Keep the test origin consistent throughout the redirect. Localhost and 127.0.0.1 have distinct cookies and browser storage.
- Run `ri-tx-surface-browser-verify.mjs` for notebook loading, empty, failure and retry, Daily Study loading/failure/retry, guide completion and unavailable-mode boundaries. Run `remaining-states-browser-verify.mjs` with `VERIFY_STATES=RI,TX`, and after activation set `STATE17_SWITCH=1` for real client state navigation.
- Shared analytics resolve the current path before the saved state cookie. Verify one product-view event per destination and one sitting event per action in GA4 and PostHog, using the existing internal-acceptance marker for QA traffic.

Both state releases reuse the existing production schema. A state addition alone needs no production migration.

RI/TX purchase acceptance uses the existing account-wide 60-day product. The current sandbox API credential returned authenticated 403 on November 14, 2026. Repair the existing test configuration and rerun provider checkout/callback acceptance before activating these purchase entries. The added signed webhook contract uses a mocked Transactions API, real SDK signature verification and actual in-memory entitlement grants. Treat its successful 60-day ALL and duplicate-callback checks as isolated contract evidence.

## 题库服务端边界、最小下发、Google 可信识别、限流策略、统计兼容、匿名合并、缓存隔离与回滚

后续州复用同一套练习入口，不要把整包题目再放进 Client Component 或公开 JSON。

题库服务端边界：抽题、权益、正确答案和评分在服务端。`lib/practice-draw.ts` 使用既有抽题规则。浏览器只拿当前页或当前场次的题干和选项。即时反馈走 `POST /api/practice/feedback/` 的 `one`；整场提交走 `grade`，之后才带解析。场次令牌不能代替登录或 Pro 校验。`GET /api/state/questions/` 和 `GET /api/indiana/questions/` 不再返回题库。公开样题页仍对所有访客输出同一段 SSR 正文。

最小下发：Quick、完整模拟和 Daily Study 一次领取当前场次，上限 80 题。题目浏览按 15 题分页，同一 seed 保持顺序。Daily Study 和错题练习使用 `purpose: "delivery"` 令牌覆盖预设题目 ID。作答阶段 `correct_option` 为空。包元数据在 `data/client-pack.json`，只含导航、题量和开关；`counts` 不得写入 `freeQuestionIds` 或题干。题量变化后运行 `node --experimental-strip-types scripts/emit-client-pack.mjs`，再用生产构建确认 `.next/static` 客户端包不含题库正文。访客归档走 `POST /api/practice/archive/`，必须同时核对场次令牌与当前登录或 `np_actor` cookie。诊断题由 `mode: "diagnostic"` 在服务端抽取。

Google 可信识别：`lib/googlebot.ts` 只接受反向 DNS 以 `.googlebot.com` 结尾、并且正向解析回到同一 IP 的地址。不接受 User-Agent、Referer 或 `googleusercontent.com`。这个函数目前只在校验脚本里使用，请求路径和 Vercel Firewall 都没有调用它。公开 HTML 不按爬虫分流，伪造 User-Agent 也拿不到额外题库。上线前不要把它接进练习或会员接口。

限流策略：题目领取、新建场次和解析领取使用 Postgres `rate_buckets`（迁移 `023_rate_buckets.sql`，未对生产执行）。编号 023 目前未被其他迁移占用。同一账号或匿名 cookie 每 10 分钟新建 12 个场次，同一可信 IP 150 个；解析每 10 分钟账号 90 次、IP 800 次。题目浏览的每一页也计入新建限额，15 题一批不能当成防遍历。依据是一个人连续做几套题，一个约 30 人的共享网络可以同时开始，单账号不能在一次突发里走完各州。可信 IP 在 Vercel 上取 `x-real-ip`。计数键是前缀加用户 ID、匿名 cookie 或 IP，不写邮箱或令牌。同一条 `insert ... on conflict` 完成窗口重置和加一。过期行由下一次成功计数时、每个实例最多每小时删除 `reset_at` 早于一天前的记录。缺表时日志只打一次 `rate_limit_degraded` / `missing_table`，然后走单实例突发上限。数据库不可用时练习接口降级放行；付费鉴权、管理员和 Webhook 验签不降级。`PRACTICE_LIMITS=off` 只关闭这层限额，改环境变量后需要重新部署该环境才生效，不能关闭鉴权。内部任务用 `Authorization: Bearer` 与 `CRON_SECRET` 做限额例外，不能代替身份校验。登录仍是每 IP 每分钟 12 次的进程内限额，本轮没有改成共享限额，避免把学校网络的成功登录收得更紧。注册、重置、联系、AI Tutor、删号和社区动作在原限额之外再记一笔共享限额。Paddle Webhook 和 Cron 不走练习限额。

统计兼容：不新增 GA4、PostHog 或 Clarity 脚本。CSP 目前是 Report-Only，报告写到 `/api/security/csp-report/`，去掉 URL 查询串并限流。未看到浏览器违规报告前不要改成强制 CSP，也不要为 nonce 把静态页改成动态。不向统计发送邮箱、答案或密钥。

匿名合并：匿名标识是 httpOnly cookie `np_actor`，不是浏览器指纹。登录后沿用现有 `syncGuestProgress` / `/api/progress/import`，同一 attempt ID 可重复提交。匿名场次令牌只在当前匿名 cookie 仍匹配时由该浏览器的登录会话领走。

缓存隔离：练习、错题、Daily Study 和 `/api/:path*` 使用 `private, no-store`。公开 SEO 页不套这层。闪卡页按会话动态输出，免费访客只收到前 8 张。

回滚：预览环境设 `PRACTICE_LIMITS=off` 可停用共享限额，鉴权保持。代码回滚使用分支 `security/content-boundary`，不要把它直接合进未授权的生产发布。删除部署文件不能撤回已经公开过的历史响应或仓库历史。

生产迁移清单：2026-11-19 已在 Neon 项目 Arizona-notary 的默认分支 `production`（`br-raspy-fog-a76oj2y2`）执行 `023_rate_buckets.sql`，并写入 `schema_migrations`。执行前确认缺失的迁移只有 023。恢复点是同项目分支 `pre-023-restore-20261119`（`br-gentle-mountain-a7mi1qwm`，父 LSN `0/670C5B0`）。恢复方式是用该分支的数据恢复生产分支，或把应用暂时指向该分支；不要为了前端故障整库回滚。代码回滚时保留 `rate_buckets`。隔离分支 `security-rate-023-20261119` 上用两个独立连接完成 30 次并发计数，结果连续且无重复。`PRACTICE_LIMITS=off` 仍只停限额，改环境变量后需要重新部署。


### 2026-11-20 练习和安全回归

- 新场次签名保留题目顺序、版本、选项乱序版本和不计分题 ID。恢复和评分使用对应服务端版本。客户端题目不含历次修订快照，提交需覆盖所有场次题目且每题恰好一次，跳题发送该题 ID 并省略选项。新匿名令牌使用 cookie 的摘要标识，旧令牌保留原有时限。继续测试游客登录后导入及换账号隔离。
- 免费完整模拟的首次有效评分复用既有 guest_exams 表，按州及访客或账号原子登记。同场次可重试评分，账号正式保存仍用现有按州和场次的事务。印第安纳继续使用其已有的专项场次流程。代码回滚时保留登记和共享限流表。
- CSP 保持 Report-Only。上报支持 Reporting-Endpoints 及旧浏览器的 report-uri。接收器最多读取 8,000 字节，仅记录已知指令及资源 origin 或资源类型，忽略路径、查询、片段、页面 URL 和脚本片段。正式强制前验证 GA4、Paddle、PostHog 和 Clarity 的实际请求。
- GitHub API 确认仓库为 Public，源代码含完整题库及知识卡。仓库可见性单独处理，变更前核对 Vercel 对私有仓库的构建权限。历史公开版本和已下载的数据无法撤回。
- Vercel → Arizona 项目 → Firewall。先新增 Log 规则，匹配 POST 和正则 ^/api/practice/(batch|feedback|archive)/?$。在 Firewall Observability 核对连续练习、快速切州和共享 IP 高峰后，按套餐支持的 IP 键和窗口配置限额。当前应用每 IP 每 10 分钟 150 次开场、800 次反馈可作观察参照。边缘阈值应覆盖正常共享网络峰值。公开页面、Next 静态资源、Paddle Webhook、Cron 与认证回调不匹配。若公开页另有机器人规则，在该规则核对 Vercel Verified Bots，并通过 Search Console 测试实际网址。应用练习接口不依赖 User-Agent 放行。

## Shared editorial theme and route checks

Use `app/editorial-theme.css` for the current warm-white surface, dark green ink and action colors, sage layers, bookmark accent, focus color, shadow, and marketing container width. Use the shared card, button, field, chip, menu, dialog, loading, and status patterns from `app/globals.css`. Use the system sans-serif for controls and reading text. Reserve the serif for display titles. Keep reading widths and route-specific tool layouts. State configuration controls routes, practice modes and capabilities. It does not define a separate color theme.

For a new state or new route:

- Use the shared root chrome, actual state entry, and existing permission gates. Verify Quick, Full, topic, results, sources, guide, saved review, Daily Study, and pricing only where the state supports them.
- Preserve authored explanations, evidence links and recorded verification dates. Use the shared explanation sections and keyboard-visible states. Exercise loading, empty, success and retry states with an isolated account.
- Use `lib/pricing/membership-benefits.ts` for displayed plan comparisons and the existing catalog and checkout components for eligible quotes and fulfillment. Confirm the board state and plan links without a real charge.
- Use checked-in editorial insights and the existing discussion route. Keep original third-party discussions, official references and on-site posts distinguishable.
- Review the changed route and one existing state at 375 or 390px, 768px and 1440px. Check keyboard navigation, focus, contrast, status text and reduced motion. Capture desktop and mobile evidence separately from any production acceptance.

## Sidebar workspace routing and acceptance

The root header keeps the national marketing navigation at `/`. Other learner pages use the shared `StudyWorkspace`, including state landing pages, study tools, community, pricing, account and legal. Authentication routes and `/admin/*` use the compact standalone header. Keep URL and canonical ownership in the existing routes.

- Practice, Study Guide, Question Bank, Study Cards, Daily Study and Wrong Answers use the current state path catalog. Favorites is the current state's Wrong Answers route with `?view=favorites`, which filters the same authenticated records. Progress links to the shared Dashboard. AI Tutor remains part of the existing question and answer tools where supported.
- Exam Guide, Become a Notary, Laws & Rules and Resources use state paths. Courses appears for Arizona. Question Updates and What’s New open their existing dialogs. Coming-soon states use the national directory. If a state maps a tool to an existing fallback, use that destination and show the state overview label when switching there. Rhode Island and Texas do not show a state-specific Pro checkout.
- The desktop rail scrolls its links independently and remembers its size in `np_sidebar`. At widths under 851px the same navigation data renders in a modal drawer. Verify Escape, backdrop, focus return, outside inertness, page-scroll lock and resize across the breakpoint.
- Use `node scripts/study-workspace-browser-verify.mjs` with `WORKSPACE_VERIFY_BASE`, `WORKSPACE_VERIFY_PLAYWRIGHT` and optional `WORKSPACE_VERIFY_SHOTS`. For production smoke set `WORKSPACE_VERIFY_READ_ONLY=1`. Re-run guest import, state runner, account, pricing and source delivery checks against isolated local data before release.
- Keep protected question draws and scoring in the server endpoints. State navigation drops the old sitting and topic query from the destination URL. Both states keep their independent existing browser and account records. Use the session runner's existing resume and restart flow.

## External Community Insights source updates

Community Insights publishes reviewed external summaries from `data/community-external-sources.json` alongside the existing editorial catalog. Registered member posts and moderation remain in the existing community database. The external list filters on platform, state and topic at the server, using `sourcesPage` independently of member discussion pagination. Home shows up to six states. Add a state guide link only when the state is known and the route already exists.

1. Read the original public contribution in context. A search result excerpt, video description, restricted group or missing comment is insufficient. Record the parent and original URL, platform comment ID where visible, separate publication dates, collection and verification dates, and locator quality. Use `null` for dates without an exact source date and `General` when the state is unclear.
2. Check normalized post and comment links against both catalogs. Compare meaning across threads and combine related replies by the same author within a thread. Keep a concise English summary of the personal experience, with no copied profile details, promotional claims or recalled questions. For any objective exam rule, record a checked state-authority link or omit the claim.
3. Use `node scripts/community-source-import.mjs import <batch.json>` from the repository root. The audited catalog shows the record shape. Use `comment_direct` for a comment locator observed at the source and `parent_only` when only the discussion or video can be linked. The importer validates source URLs and identities, rejects catalog duplicates, and preserves a previously hidden status when a batch is reimported.
4. Use `node scripts/community-source-import.mjs hide <id>` or `restore <id>` for editorial moderation. Review the diff and release via the standard Git/Vercel workflow. The release regenerates the home and public lists without hidden records. Existing member posts and their separate moderation history stay in Postgres. Keep raw collection evidence outside the repo and static assets.
5. Run `node scripts/community-sources-verify.mjs` and verify platform/state/topic filters and pagination, the missing-date UI, direct/parent labels, homepage scope and member posting. Use a local fixture for writes and keep production smoke checks read-only.

## Practice search landing pages and free samples

- Keep one primary practice URL per state: `/new-york/practice/`, `/ohio/practice/`, and `/arizona-notary-practice-test/`. Cover practice test, practice exam, and free-question variants on the relevant primary URL. Arizona’s open-book answer explains the rules and its lookup drill provides practical exercises. Keep question-bank, topic, reference, and existing application guides distinct. Check redirect ownership and breadcrumbs before changing an existing route.
- Practice mode, topic, start, and attempt parameters control the runner. Keep the canonical on the stable practice URL and preserve its parameters for navigation and restoration. Check the canonical and robots tags in the initial response and after state navigation. Add sitemap entries only for eligible canonical URLs.
- `lib/public-practice-samples.ts` is the explicit public approval list for NY and OH. Approve only the current published, active, free question ID and revision after matching it to the editorial audit fingerprint and official evidence. Keep the real rule-check date separate from page edits. `PracticeAfterword` receives only the approved presentation fields, renders them on the server under the mode picker, and links to the same state's topics and study cards. Check that the samples remain visible when scripts are disabled and the route arrives through the loading boundary. If a revision or eligibility changes, re-review it before updating the list.
- Pull counts and practice settings from active questions, `prepPacks`, and the existing entitlement configuration. Report official conditions separately and leave any unpublished official number unstated. Use `PracticeLaunch` and its existing server runner for full sittings, feedback, and saved progress. Generate public result links in the client pack with `scripts/emit-client-pack.mjs`. Do not import the editorial question bank into result components or hydrate additional bank data for SEO.
- Review missed explanations before suggesting another set. Keep Arizona topic links scoped to their topic and pool. Test guest to account with the same original sitting, wrong answers and retry IDs, and verify that changing states cannot reuse an old state's progress. Verify the available trial, repeat full practices, and product status with isolated guest, free, 60-Day Pro, and Lifetime Pro fixtures.
- Use existing article, practice, result and commerce events. Route views exclude attempt IDs and ignore the transient Start query for view deduplication. Full result counts come from the actual sitting. Internal navigation keeps acquisition attribution. Run `node scripts/practice-seo-verify.mjs` and the existing guide, quiz, restoration, source boundary, analytics and offer checks before preview. Set `PRACTICE_SEO_BASE` to the built preview and `NEXT_DIST_DIR` to its build directory to inspect the HTML, RSC and client chunks for additional question text.
