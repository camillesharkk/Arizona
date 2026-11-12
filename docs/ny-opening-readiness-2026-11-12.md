# 纽约正式开放准备记录

## 版本与交付范围

- 核查日期为 2026-11-12，时区 Asia/Shanghai。
- 最新获取的 origin/main 为 `43f4b17a9b9c52f392422fb0a9d3984b5be08863`。
- 独立分支为 `feature/ny-opening-prep-20261112`，工作树为 `C:\Users\20683\.codex\worktrees\ny-opening-prep-1112\web`。最终提交 SHA 随交付消息提供，也可在该工作树运行 `git rev-parse HEAD`。
- 原工作区 `D:\webtest\web` 的 main 保持 `9def076`，领先远程 4 个提交、落后 2 个提交。四个提交分别涉及州上线规范、纽约内容及版本化进度、生产预览限制和平台访问核查记录。本轮从已发布 main 开始整理。
- 原工作区的 CloudMistakes、收藏验证、纽约发布记录修改及未跟踪文件保留。上一发布工作树 `release/ny-compatible-20261112` 保持干净。
- 本轮提交包含三个纽约说明页、纽约 Tutor、完整模拟原子交卷及其必要的存储/导航依赖、迁移执行器恢复保障和相关回归。NY mistakes 接口的改动仅将纽约读改写纳入同账号事务，AZ 收藏行为沿用基线。
- 本轮完成本地提交。生产迁移、main 推送和纽约入口开放等待用户下一条上线指令。

## 新增页面与官方依据

- `/preview/new-york/passing-score/` 说明官方通过或未通过结果、邮寄通知、两年成绩有效期及重考安排。官方题数和数值及格线保持未知。本站 Quick 10 的 8/10 学习建议、40 题及 60 分钟模拟设置分别注明。依据为 DOS 2026 年下半年考试公告及 NYC 2026 年 11–12 月安排。[考试公告](https://dos.ny.gov/july-december-2026-notary-written-exam-info-and-schedule) [NYC 安排](https://dos.ny.gov/new-york-city-november-december-2026-notary-public-examination-instructions-and-schedule)
- `/preview/new-york/laws/` 按任命及权限、acknowledgment/oath、身份核验、记录保留、费用和证书信息、电子公证、专业权限整理。链接到适用的具体法规及 DOS September 2026 License Law。[DOS 法规汇编](https://dos.ny.gov/notary-public-license-law-0) [Executive Law §130](https://www.nysenate.gov/legislation/laws/EXC/130) [§135-c](https://www.nysenate.gov/legislation/laws/EXC/135-C) [§136](https://www.nysenate.gov/legislation/laws/EXC/136) [Real Property Law §303](https://www.nysenate.gov/legislation/laws/RPP/303) [§309-a](https://www.nysenate.gov/legislation/laws/RPP/309-A) [Judiciary Law §484](https://www.nysenate.gov/legislation/laws/JUD/484)
- `/preview/new-york/become-a-notary/` 按资格、考试/适用豁免、宣誓、材料、NY Business Express 申请和任命排序。核对 $15 考试费、$60 初次申请及续期费、四年任期、预先完成宣誓和上传 PDF 等要求。[DOS 申请入口](https://dos.ny.gov/become-notary-public) [申请指导](https://dos.ny.gov/notary-public-application-guidance) [宣誓表](https://dos.ny.gov/notary-public-oath-office-dos-2201) [Executive Law §131](https://www.nysenate.gov/legislation/laws/EXC/131) [Public Officers Law §3](https://www.nysenate.gov/legislation/laws/PBO/3)

三个页面复用 StateArticlePage 和纽约现有布局。现有 Laws、Passing score 和相关阅读链接已接通。官方链接的 href 与对应官方文件已核对，核查日期写入页面。三个参考页独立于原有文章数组，原有文章数量保持 10。

## 浏览器验收

浏览器使用本机生产构建、`STATE_PREVIEW=1`、`VERCEL_ENV=preview` 和独立 FileStore 数据目录。账号均为 `example.invalid` 测试账号。PostgreSQL 结构及事务另在 PGlite PostgreSQL 引擎中验证。浏览器使用了 1280×720 和 390×844 两种视口。

- 匿名桌面通过。首页、卡片翻面、练习入口、29 题题库和三个说明页可用。完整模拟允许本浏览器一次试用，结果刷新恢复。Tutor 要求登录并禁用请求按钮。匿名答案和结果保存在该浏览器。
- 匿名手机通过。相同页面及导航可用，Quick 作答刷新恢复，完整模拟结果恢复，Tutor 登录限制有效。
- 免费账号桌面通过。题库为 29 题。实际作答完整 40 题并交卷，结果为 10/40，30 道错题进入纽约场次快照，答案和结果刷新恢复，Daily Study 显示纽约历史。额外完整练习受试用次数限制。
- 免费账号手机通过。首页、卡片翻面、29 题题库、三个说明页及练习导航可用。Quick 新作答刷新恢复，已用完完整试用显示纽约 40 题提示和升级入口。
- 有效 Pro 桌面通过。账号菜单显示有效期，题库为 203 题。完整练习可重复提交。含跳题的提交、结果刷新、纽约专题复习跳转及真实 Tutor 请求通过。
- 有效 Pro 手机通过。首页、卡片、题库和三个说明页可用。Quick 新作答刷新恢复，完整结果恢复，付费题可作答并从正常解释入口使用 Tutor。
- 过期 Pro 桌面通过。菜单显示 Free plan，普通题库降为 29 题，普通付费题保存返回 402。此前未使用的免费完整试用可正常交卷，之后受次数限制。
- 过期 Pro 手机通过。相同访问范围和三个页面可用，Quick 作答刷新恢复，Tutor 使用免费 75 次额度，纽约历史场次刷新保留。

上述首页、独立卡片、练习和题库共 32 项视口/身份检查，加上三个新页面的 24 项检查，共 56 项通过，未观察到横向溢出。完整 40 题逐题实答覆盖免费账号，其余完整交卷还覆盖单题已答、39 题跳过。后者保存一条实际错题及 skipped=39。

最终构建另使用全新账号和数据目录复测。免费完整模拟提交成功后，同页返回模式选择并再次进入完整练习立即显示已用完试用。无需刷新即可生效。服务器快照确认一场 ny-full、一个实际错题、39 道跳过题，跳过题不写答题统计。

### Tutor

- 真实请求通过。免费账号和有效 Pro 从正常题目解释入口调用 DeepSeek，页面显示 AI-generated explanation，额度分别为 75 和 300。真实结果使用纽约上下文、当前显示选项及对应官方引用。
- 模拟配置不可用通过。在无提供方密钥的隔离实例调用正常入口，页面明确显示服务不可用、本地核实材料解释及该次额度消耗，按钮恢复可用。付费题 Pro 路径和免费题路径均实测。
- 模拟服务端边界通过。覆盖 NY 查题、州别伪装、题目版本、选项排列、实时权益、过期 session 缓存、匿名、提供方网络错误/429/500/超时/空结果、额度和生产拒绝。
- 浏览器真实网络断连、真实提供方 429/500/超时尚未实测。故障响应覆盖来自隔离模拟。原有成功交付本地解释扣一次额度的规则保留。

### 生产匿名补测

- AZ 初始单击 Start 进入 Full 45。
- AZ→CA 切州后单击 Start 进入 CA Full 45。
- CA→HI 切州后单击 Start 进入 HI 50 题 Comprehensive Practice。
- HI→AZ 切州后单击 Resume 恢复原 AZ 完整场次及持续计时。
- 生产 `/new-york/` 仍显示 Under development。生产纽约预览的浏览器访问返回 Not found，HTTP 对 practice 和三个新路径的 HTML/RSC 均确认 404。
- AZ/CA/HI 首页 HTTP 200，CA/HI 学习卡正常渲染，公开 sitemap 未包含 preview 学习路径。

## 修复及服务端回归

- 纽约完整模拟改为一个 `ny-full` 请求。服务端验证 40 个唯一纽约题目和当前版本，重算成绩，在同一事务内核对实时权益及已用次数，保存已答题统计、错题/跳题快照和纽约场次。相同 examId 重试返回原结果。
- NY 普通作答、错题标记及 Daily Study 的读改写共享账号事务。PostgreSQL 使用用户行锁及同实例事务作用域，FileStore 使用一次队列修改和原子替换，Memory 使用实例级串行及隔离暂存。
- 三后端均覆盖第七条答案写入失败时完整回滚、重试、重复提交、版本拒绝、两个并发免费提交只有一场成功、普通答案并发及 Pro 过期。另覆盖 1/40 和 39/40 的整数成绩。
- Memory 并发改名、AZ 记录及标记保留，嵌套异常回滚通过。NY Daily 第二次保存失败时第一次写入回滚通过。真实多连接 Neon 锁竞争尚未压测。
- Windows FileStore 原子替换曾遇到短暂 EPERM，增加有限退避重试后，浏览器保存及刷新复验通过。测试还注入 EPERM 验证重试。
- 纽约结果页复习链接和统计使用纽约专题，卡片页接收并校验 topic。`start=1` 在首次消费后移除，已完成纽约结果可刷新查看。
- 旧题版本、历史分数、错题、标记及替换题历史通过既有回归。203/29/174、50 张独立卡、0 张题目转换卡、10 篇原有文章均通过脚本核对。内容结构审查保留其原有法律语义审查边界，203 题法律审查依据仍为 ny-bank-final-review.md。

## 生产 Neon 归属

当前仍未确认正式部署实际连接的 Neon 项目、分支和数据库。

- Vercel 项目为 `prj_yVHKKHXztH54E4rKOJrC7Wa7bV5B`，GitHub 绑定 camillesharkk/Arizona，生产分支 main。
- 当前 production target 和正式域名 alias 均对应 `dpl_HpEvfCnuG23iX3vB4paCj6p4SDgN`，状态 READY，SHA 为基线 43f4b17。
- Vercel DATABASE_URL 记录 ID 为 `c9RPPY7CH3IUUbNo`，类型 sensitive，目标包含 production/preview，configurationId 和 comment 均为空。只读 API 未提供可核验的运行时主机。账户集成配置列表为空。
- 原 `.env.vercel-production` 安全导出带 Vercel CLI 标头，修改日期为 2026-09-17，但 DATABASE_URL 条目无法解析为 PostgreSQL URL。该记录未补齐归属证据。
- 只读候选核查为 `Arizona-notary` / `crimson-mouse-71453887`、`production` / `br-raspy-fog-a76oj2y2`、数据库 `neondb`、端点 `ep-twilight-block-a7q49u9i.ap-southeast-2.aws.neon.tech`。2026-11-12 18:33 核查显示 PostgreSQL 18.6，question_stats 总大小 360448 字节，台账 001–015，两个 revision 列均不存在。以上保留候选标记。
- 本轮生产恢复点未创建，迁移 016 未执行。实际生产目标的迁移状态仍待归属确认。

还缺当前生效部署的运行时数据库主机与 current_database()，或能关联到该项目/production 环境且可核实的原始安全配置记录。

最小运行时诊断方案拟新增 `app/admin/operations/database-target/route.ts` 和对应验证。沿用已有 operations 管理员认证，仅返回 deployment ID/SHA、从运行时配置提取的 hostname、只读查询得到的数据库名。以主机与 Neon endpoints/branch 元数据逐项匹配。该方案等待用户决定是否部署。

## 迁移 016 的准备与执行顺序

实际 SQL 为 question_stats 添加 `question_version integer NOT NULL DEFAULT 1` 和 `revision_history jsonb NOT NULL DEFAULT '[]'::jsonb`，两条 ALTER 均带 IF NOT EXISTS。当前发布代码在旧结构上保留 AZ/CA/HI 读写，纽约版本化保存需要 016。

- 隔离 PostgreSQL 已复核 001–015 的现有州读写、016 后旧生产代码、温实例重探测、纽约新版本写入及历史保留。
- 实际执行器已复核 001–016 全量运行及第二次跳过。注入 SQL 已成功、台账写入失败，确认两列与台账一起回滚。重试正常完成。
- 对旧执行器留下的“两列已存在、台账缺失”状态复测，IF NOT EXISTS 后可补齐台账。执行前仍需核对已有列类型、默认值及 NOT NULL，结构与台账不一致时先诊断。
- 每个迁移的 SQL 与台账写入已纳入同一事务。016 在事务内设置 lock_timeout=5s、statement_timeout=30s。
- ALTER TABLE 需要 ACCESS EXCLUSIVE 锁。PostgreSQL 11 以上常量默认值通常可使用元数据快速路径，仍需等待既有事务释放冲突锁。真实生产表规模和锁等待尚未验证。

下一条上线指令可按以下依赖顺序执行。

1. 重新 fetch，审查远程增量并将本分支整合到最新 main 基线，重跑受影响检查。完成纽约公开路由、入口、州映射与服务端开放配置的发布差异审查，沿用已验收的页面和共享组件。
2. 取得生效部署的数据库主机及数据库名，匹配 Neon 项目、分支和 endpoint。记录非敏感标识与证据来源。
3. 在已确认分支建立命名恢复分支或等效时间点恢复点，记录源分支、时间/LSN 和恢复标识。实际连接恢复点，核对数据库、迁移台账及关键表，确认可读取，验证恢复操作可用。
4. 复核实际待执行列表及生产版本、结构、长事务和锁。使用本次事务执行器执行 016，保留 5s 锁超时和 30s 语句超时。锁超时、SQL 错误或台账写入失败立即回滚并停止本次执行，诊断后重新核查。
5. 核对 016 台账、两个列的类型/默认值/NOT NULL、旧记录默认值及现有州关键读写。只用明确的专用账号验证写路径。若结构已存在而台账缺失，先确认结构完全符合 SQL 再重跑执行器。
6. 普通推送经验证的 main，跟进对应 SHA 的 Vercel 生产部署至 READY，核对正式域名 alias。根据用户上线指令启用已审查的纽约公开路由及入口，更新生产访问条件和 sitemap。
7. 开放后以专用测试账号复测匿名/免费/有效及过期 Pro、题库范围、完整试用、答案/错题/进度/场次刷新、Tutor、跨州启动和运行日志。全程保持真实用户记录完整。
8. 发布异常时先使用已验证的代码回退路径。数据库恢复按实际故障及恢复点之后的写入评估处理，保护上线期间产生的用户数据。

## 开放门槛与待办

- 题库及内容数量通过。203 题、29 免费、174 Pro、50 独立卡、10 原有文章。
- 三个缺失页面及现有导航通过，官方来源已核对。
- 桌面/手机和四类身份的隔离页面验收通过，关键保存和历史兼容通过。
- Tutor 实际成功响应、配置不可用页面提示及模拟错误边界通过，真实提供方错误和浏览器断连保留未验证标记。
- 类型、构建、纽约内容/学习/迁移/事务测试及相关既有回归通过。
- 纽约生产访问限制和公开 sitemap 现状符合本轮要求。
- 正式开放仍受生产数据库归属、可用恢复点、迁移 016 和正式路由/入口发布步骤限制。
- 真实支付与生产 NY 写入尚未验证。本轮使用隔离账号和既有模拟权益/支付回归，无真实付款。

## 可重复检查

运行前安装仓库依赖。PostgreSQL 脚本使用忽略目录 `.tools/ny-pg/node_modules/@electric-sql/pglite` 中的现有测试依赖。

```powershell
node scripts/ny-bank-audit.mjs --export
node scripts/ny-progress-verify.mjs
node scripts/ny-tutor-verify.mjs
node scripts/ny-full-verify.mjs
node scripts/ny-migration-verify.mjs
node scripts/ny-schema-compat-verify.mjs
npx tsc --noEmit --incremental false
npm run build
```

另已运行 ai、study、mistakes、sitting、quiz、questions、auth、session、commerce、devices 共十组既有验证入口。ny-live-verify.mjs 在最终生产构建的 localhost 实例上，以 free/pro/expired 三账号通过真实 HTTP 检查。可通过 NY_TEST_BASE_URL 指定隔离地址，通过 NY_TEST_DATA_DIR 为 seed-preview 指定新的测试目录。
