# Notary Exam Prep 本地预览验收记录

基线为远程 `main` 的 `43c22cd`。正式 Vercel 域名对应生产部署 `dpl_ENVz21rD4pk1Em3jZ2EgV36fBSM6`，观测状态为 Ready。预览来自 `codex/notary-funnel-seo-review`。正式站数据来自只读请求。

## 八个页面

八个页面的 canonical 均在正式基线和本地预览中自指相同路径。下表的链接打开本机预览。

| 页面 | Title 前 → 后 | H1 前 → 后 | 正文前 → 后 | 预览主入口 | Canonical |
| --- | --- | --- | --- | --- | --- |
| [Indiana 申请](http://127.0.0.1:3244/indiana/become-a-notary/) | Apply for an Indiana Notary Commission → How to Become a Notary in Indiana \| Application, Course & Exam | Apply for an Indiana Notary Commission → How to Become a Notary in Indiana | 简短申请指引 → 材料、Applicant Hub、课程考试、任命清单 | Start Free Indiana Practice | `/indiana/become-a-notary/` 自指 |
| [New York 指南](http://127.0.0.1:3244/new-york/study-guide/) | Free New York Notary Study Guide 2026 \| Rules & Examples | Free New York Notary Study Guide 2026 — Rules, Examples & Topic Practice | 完整章节与情境保留 → 开头补短测、查章节、再练习的路线 | Quick 10、各章 Practice This Topic | `/new-york/study-guide/` 自指 |
| [New York 练习](http://127.0.0.1:3244/new-york/practice/) | New York Notary Practice → Free New York Notary Practice Test \| Questions & Explanations | New York practice → New York Notary Practice Test | 练习选择器 → 首屏免费范围、5 道已核验样题和官方考试边界 | Start Free Quick 10 | `/new-york/practice/` 自指 |
| [Ohio 题库](http://127.0.0.1:3244/ohio/questions/) | Ohio Notary Question Bank → Ohio Notary Practice Questions with Answers | Ohio Practice Questions → Ohio Notary Practice Questions with Answers | 标题和客户端加载 → 题目主题导航、6 道已核验样题与解释 | Start Free Ohio Quick 10、按主题浏览 | `/ohio/questions/` 自指 |
| [Ohio 练习](http://127.0.0.1:3244/ohio/practice/) | Ohio Notary Practice Questions → Ohio Notary Practice Test \| Free Questions & Explanations | Ohio Notary Practice → Ohio Notary Practice Test | 通用介绍 → Ohio 短测、综合练习及获批课程边界 | Start Free Quick 10、Ohio 题库 | `/ohio/practice/` 自指 |
| [Arizona 开卷说明](http://127.0.0.1:3244/is-the-arizona-notary-exam-open-book/) | Is the Arizona Notary Exam Open Book? | Is the Arizona Notary Exam Open Book? | 开卷简介 → 内置手册、纸本限制及三步查阅训练 | Start Free Arizona Quick 10、既有查阅练习 | `/is-the-arizona-notary-exam-open-book/` 自指 |
| [Arizona 练习](http://127.0.0.1:3244/arizona-notary-practice-test/) | Arizona Notary Exam Practice Test 2026 \| Free Quick 10 & Full 45 → Arizona Notary Practice Test \| Free Quick 10 & Full 45 | Arizona Notary Exam Practice Test — Free Quick 10 & Full 45 → Arizona Notary Practice Test | 考试入口 → Quick 10 优先，保留 6 道样题，结果显示真实薄弱主题 | Start Free Quick 10、Full 45 | `/arizona-notary-practice-test/` 自指 |
| [North Carolina 练习](http://127.0.0.1:3244/north-carolina/practice/) | North Carolina Notary Practice → North Carolina Notary Practice Questions \| Free Quick 10 | North Carolina practice → North Carolina Notary Practice Questions | 通用练习介绍 → 课前和课后用途、课程资源、3 道已核验样题 | Start Free Quick 10、课程和指南 | `/north-carolina/practice/` 自指 |

## 事件与日志对照

| 阶段与事件 | 触发点与参数 | 去重、平台与查询 |
| --- | --- | --- |
| `landing_view`、`article_view`、`practice_view` | `AnalyticsPageViews` 和文章视图读取真实页面路径。会话保留入口、来源和媒介。练习页附上州和模式。 | 浏览器按访问与页面去重。GA4 和 PostHog 按事件名及州查询。 |
| `exam_start`、`quick10_start`、`full45_start` | `ExamRunner` 有题目并建立或恢复场次后记录。保留历史模式、题量和州字段，并带场次 ID。 | 用 `attempt_id` 去重。`quick10_start` 和 `full45_start` 是 GA4 的细分口径，同一场次只计一次。 |
| `exam_complete`、`result_view` | 交卷保存流程成功后记录完成。结果出现时记录结果页到达。 | 完成按已保存场次和组件防重。GA4 与 PostHog 分别按事件名查询。 |
| `upgrade_view`、`pricing_view` | `AnalyticsFunnel` 保留升级漏斗口径。共享视图组件记录实际到达套餐页。 | 按到达页面去重。GA4 和 PostHog 按州、页面、入口查询。 |
| `checkout_click` | `CheckoutButton` 通过按钮前置校验后记录所选商品、报价、币种、州及 `checkout_attempt_id`。 | 每次有效主动购买操作生成一个 ID。GA4/PostHog 用该 ID 连接收银台。 |
| `checkout_open` | `paddle-browser` 收到 Paddle.js 的 `checkout.loaded`。已绑定的服务端报价和 Paddle 交易 ID 同时可用。 | 按 checkout attempt 去重，缺少 attempt 的恢复流程按交易 ID 去重。GA4/PostHog。 |
| 初始化、加载、关闭、支付失败 | `checkout_init_failed`、`checkout_load_failed`、`checkout_closed`、`checkout_payment_failed`。通用的加载后错误单独记 `checkout_error`。 | 按尝试或交易以及阶段查询。关闭无需产生一条失败付款。浏览器 GA4/PostHog。 |
| `purchase_completed`、GA4 `purchase` | 签名验证后，`transaction.completed` 必须携带已完成状态并符合现有报价绑定。PostHog 从 Webhook 处理后记录。GA4 的 `purchase` 由浏览器读取服务端确认的订单后发送。 | 业务按 Paddle transaction 去重，GA4 保留浏览器交易去重。两个平台使用各自事件，汇总时按交易 ID 对照。 |
| `entitlement_granted`、`entitlement_missing` | Webhook 返回后，按交易和订单关联回读权益，再发送服务端事件。回读日志用 `entitlement_readback_confirmed` 或 `entitlement_readback_missing`。 | PostHog 用交易 ID 对照订单和权益。用同账户下的 `/api/billing/access/` 核对已付款记录、权益 ID 和生效状态。 |
| Webhook 失败 | 签名、报价绑定、业务写入、记录通知及权益回读使用各自 Paddle 日志代码。 | 通过 Vercel 运行日志的 `[paddle]` 前缀及已知交易 ID 查询。同步写入沿用原有错误响应和 Paddle 重试。 |

浏览器模拟使用拦截的 Paddle.js CDN 和 checkout API。分别观察到一次购买点击、一次加载、一次支付失败和一次关闭。SDK 的 `open()` 调用时没有打开事件。重复 `checkout.loaded` 仍只记录一次，原始文章入口和来源经过登录保留，没有生成 GA4 `purchase`。真实 Paddle 沙盒、生产收银台以及 GA4/PostHog 收件情况需要服务权限。

本地签名 HTTP 采用虚拟 Sandbox 配置和隔离文件库。有效通知建立一条付款及一条可回读的 Lifetime 权益。错误签名返回 401。较早发生但延迟到达的完成事件可处理。同通知重送和不同通知重复业务交易仍只有一条订单，随后收到较早的未完成状态也不撤销权益。仓库 Paddle 和 Lifetime 回归另外覆盖部分退费、退款顺序及已有订单规则。

## 索引信号

- `/contact/` 保持 200 和 `noindex, follow`，从 sitemap 删除。
- `/courses/` 从空 200 变为有正文、自指 canonical、已列 sitemap 的课程页。`/arizona-notary-courses/` 和 `/arizona-notary-training/` 直接 308 到该页面，并移出 sitemap。
- `/pricing/lifetime/` 和未匹配的一段、两段及多段路径从空 200 改为 HTTP 404。实际购买页 `/lifetime/` 已列入 sitemap，购买锚点仍在 `/pricing/#lifetime-checkout`。
- 已确认参数入口保持本州 canonical 和参数，公开 Arizona 首测工具、免费范围指引、可读题库和备考计划各自承担不同任务。
- 正式主域的 HTTP 一跳，HTTPS 的 www 一跳，HTTP 的 www 两跳到规范 HTTPS 域。在现有部署配置中确认收敛。
- 正式 sitemap 有 638 条。提交候选的本地 sitemap 有 637 条，逐条检查合规状态。正式路由抓取记录及预览逐条清单保留在本地验收资料中。

## 官方来源

- Indiana 申请后进入 Learner Hub 课程考试以及任命状态。[Indiana Secretary of State 现行系统 FAQ](https://www.in.gov/sos/business/files/New-Notary-System-FAQs-5-4-26.pdf)
- New York 公开公告列出一小时、多选和通过或未通过通知。40 题是本站练习设置。[New York Department of State 公告](https://dos.ny.gov/system/files/documents/2026/06/july-dec-2026-notary-written-exam-info-and-schedule_0.pdf)
- Ohio 新申请人的课程和适用评估由获批提供方负责。[Ohio Secretary of State 课程与评估](https://www.ohiosos.gov/notary/become-a-notary-in-ohio/education-and-testing)
- Arizona 考试内置手册，现场和远程均禁用纸质手册。[Arizona Secretary of State 考试说明](https://azsos.gov/business/notary-public/new-notary)
- North Carolina 课程和书面考试的条件以州申请表和法规为准。[North Carolina Secretary of State 初次申请表](https://www.sosnc.gov/webfiles/documents/forms/notary/initial_Application_for_nc_notary_public.pdf)

## 运行命令

- 类型检查使用 `npx tsc --noEmit`，生产构建使用 `npm run build`。仓库没有单独的 lint 脚本或 ESLint 配置。
- 执行了 `analytics:verify`、`paddle:verify`、`lifetime:verify`、`commerce:verify`、`seo:matrix:verify`、`seo:matrix:http`、`guide:verify`、`quiz:verify`、`sitting:verify`、`auth:verify`、`mistakes:verify` 和公开样题、游客导入及恢复的专项测试。
- 两个旧归档测试在基线与预览都暴露缺口。无有效练习令牌且尚未形成档案的旧游客短测或完整场次，未证明可自动导入。当前浏览器创建的短测与并发导入另有通过证据。
- GSC、真实 Paddle 沙盒、生产付款、生产数据库权益和分析后台接收仍待验证。

## 浏览器与内容边界实测

最终生产构建在 1440px 和 390px 的 Edge 上打开八页，检查了单一 H1、纯白 canvas、横向溢出、侧栏开合、按钮文字和焦点对比度。New York 流程从 Quick 10 出发，经离开后恢复、交卷、查看结果、进入错题、登录并回读同一个场次，最后打开 New York 套餐页。已登录的 Ohio 题库主题切换和刷新在两种屏宽均显示同一主题场次。错题页的已有更新通知可用 Later 关闭，登录页不会继承打开的自动通知。

受控 HTTP 在 AZ、CA、HI、NY、PA、LA、CT 实测两个并发游客导入只保存一次。首次导入后收藏一道错题，重送场次后收藏仍在。公开 HTML 和 RSC 分开核验。New York 与 North Carolina 所有与免费题正文不重复的付费题干均未出现在抽查的页面响应里。Ohio 当前题库配置无付费题干。三个州曾使用的公共整库接口均返回 404。

## 重开本地预览

在本工作树运行 `npm ci`（首次安装依赖）、`npm run build`，再运行 `npm run start -- --hostname 127.0.0.1 --port 3244`。当前验收时没有向生产支付服务发起购买。需要复现实验时，为预览提供隔离的 `NOTARY_DATA_DIR`，使用 `node scripts/pack-test-utils.mjs --seed` 创建测试账户和题库检查数据。
