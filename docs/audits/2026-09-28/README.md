# Arizona 页面核查与修改记录

核查日期：2026-09-28。修改在本地，未提交、推送或部署。保留本轮开始时已有的运营、法规、站点配置等未提交工作。

## Search Console 实际证据

数据范围：2026-08-28 至 2026-09-25，Web、final 数据。通过项目既有只读服务账号请求 Google Search Console API，未通过受订阅限制的 GSC Wizard。凭证和 token 未写入报告。原始聚合数据与 URL Inspection 结果见 [gsc.json](./gsc.json)。

| 页面 | 点击 | 展示 | 平均排名 |
| --- | ---: | ---: | ---: |
| /arizona-notary-practice-test/ | 2 | 18 | 26.67 |
| /arizona-notary-study-guide/ | 0 | 16 | 25.50 |
| /arizona-notary-exam-prep/ | 0 | 27 | 62.04 |
| /arizona/new-laws/ | 0 | 22 | 10.64 |

法规页在 page + query 明细中仅公开 `new notary laws 2026`：1 次展示、0 点击、排名 8。其余 21 次展示未出现在查询维度中，不能从公开行推断全部流量组成。既不能认定大量来自泛词，也不能认定已有稳定的 Arizona 精准考生流量。应继续看有 Arizona/SB 1479 意图的查询及其持续点击。

Exam Prep 的可见词横跨 practice test、handbook、application、renewal 等主题，其中若干 practice 查询也触发练习页。这支持明确页面职责，但样本很小，不证明重复内容导致排名 62。实际代码和线上 HTML 也不是三篇相同文章：练习页是入口，指南是知识概要，Exam Prep 主要是考试说明。

四页的 URL Inspection 都是 PASS / Submitted and indexed / SUCCESSFUL / INDEXING_ALLOWED，Google canonical 均为既有 HTTPS 非 www 地址。上次抓取：练习页 9 月 20 日、指南与 Prep 9 月 5 日、法规页 9 月 6 日。API 不返回 Google 抓取版本的完整 HTML；本轮另行获取线上原始 HTML 和本地构建 HTML，不能把它们冒充 Google 已抓取的新内容。

## 搜索结果对照与修改

本轮搜索 `Arizona notary practice test free questions`，直接检查同类页面：

- [Practice Notary Exam](https://practicenotaryexam.com/arizona-notary-practice-test)：明确 45 题、免费、无需邮箱、解析和依据。
- [EveryExamPrep](https://www.everyexamprep.com/practice/exams/government/az-notary)：搜索结果标明 150 原创题，题目直接出现在检索内容中。
- [ExamByExam](https://www.exambyexam.com/exams/notary-public-exam/arizona/practice/)：结果标明 25 题、解析及列表阅读；直接抓取失败，因此只作为搜索摘要证据。

竞争页面仅用于对比用户需求与信息呈现，不作为 Arizona 法律依据。有的竞品还保留旧供应商/重考说明，未照搬。

### Practice Test

原首屏只说 45 题/60 分钟/80%，没有独立题量、免注册说明、完整结果说明；公开 HTML 没有任何实际例题，且缺少 canonical。

保留 /arizona-notary-practice-test/：

- 首屏明确免费 Quick 10、首个 Full 45、无需注册/邮箱、完成后的成绩与解析。
- 由实际有效题库计算数量：90 独立有效题，53 道免费题；45 是每次完整测试长度。不同次测试可能重复，不将洗牌计为新题。
- 展示 6 道实际题库题，包含选项、答案、解释及官方法条链接，均为服务端正文。
- 付费的无限完整测试和 Pro 功能边界明确；未修改定价或权限。
- 实测发现提交时未答题没有解析，已修正结果组件：未答题也显示正确答案、解析、来源链接。

### Study Guide

保留 /arizona-notary-study-guide/。数据中已有部分案例，但原模板从未渲染 example。现在 12 章全部有案例、可点击官方来源和对应专题练习入口，正文免费且无需登录。

补实身份核验途径与沟通、日志记录及隐私、配偶利益冲突等具体决策；补足委任、复印件、电子/RON、考试日和领证案例。修正“带标记纸质手册参加考试”的误导暗示。指引页的例子是原创教学情境，不冒称实际发生的案件。

当前仓库未找到用户提及的 V1.1 文档，因此免费范围按用户本轮明确要求和现有免费实现执行，并未虚称读过该文档。

### Exam Prep

保留 /arizona-notary-exam-prep/。标题、H1 和正文改为七步学习计划：诊断 → 身份核验 → 公证行为 → 日志/印章/禁止事项 → 补弱 → 计时模拟 → 复习与核对报考。每步有时间建议、验收目标和去指南/练习的入口，不重复复制指南全文。

### 法规

保留 /arizona/new-laws/ 及已有明细地址。只将有依据的 SB 1479 列为变更，签署 2026-04-09，生效 2026-09-12。保留已有未提交工作对三条旧笔记的非变更标记，并进一步隐藏这些笔记上的虚假 2026-01-01 生效日期及 before/after 标签。

补全远程公证的指纹豁免：除符合 § 41-263 外，还必须在日志记录身份凭证号码，且录音录像至少留存七年。不能把所有 RON 都直接写为豁免。

官方核查依据：

- [SOS 当前手册入口](https://azsos.gov/media/143)：下载文件名是 Notary-Manual-Aug-2026.pdf，但封面写 January 2025；已如实修正来源登记。
- [SOS 公证及考试公告](https://azsos.gov/business/notary)：确认 SB 1479 生效日、45 题/60 分钟/80%、考试内置手册及不允许实体手册。页面同时留有新旧供应商公告，因此未武断固定报考费、供应商或重考等待期。
- [SB 1479, Laws 2026 Chapter 31](https://www.azleg.gov/legtext/57leg/2r/laws/0031.htm)，尤其 §§ 41-254、41-263 的修订。
- Arizona Legislature 的 §§ [41-251](https://www.azleg.gov/ars/41/00251.htm)、[41-252](https://www.azleg.gov/ars/41/00252.htm)、[41-253](https://www.azleg.gov/ars/41/00253.htm)、[41-255](https://www.azleg.gov/ars/41/00255.htm)、[41-263](https://www.azleg.gov/ars/41/00263.htm)、[41-264](https://www.azleg.gov/ars/41/00264.htm)、[41-266](https://www.azleg.gov/ars/41/00266.htm)、[41-269](https://www.azleg.gov/ars/41/00269.htm)、[41-273](https://www.azleg.gov/ars/41/00273.htm)、[41-319](https://www.azleg.gov/ars/41/00319.htm)。

## URL 一致性

线上原始响应与重定向链见 [live.json](./live.json)，旁边 HTML 是修改前现场快照。

| 项目 | 核查结果与处理 |
| --- | --- |
| HTTP 非 www | 线上 308 到 HTTPS 同路径，正常 |
| HTTPS www | TLS 主机名不匹配：证书 SAN 仅覆盖 arizonanotaryprep.com；握手在重定向前失败 |
| HTTP www | 308 到 HTTPS www，然后遇到同一证书错误 |
| 旧 practice/study/exam-guide 路径 | 线上 308 到当前正式路径，保留 |
| canonical | 线上 practice/prep/laws 缺少；practice/prep 本轮补上，laws 已有待部署修改；guide 保持正确 |
| practice-test-free | 与主练习页确为全文重复；保持 200 地址，canonical 指向主练习页，从 sitemap 移除重复入口 |
| sitemap / robots | 使用 HTTPS 非 www；新构建检查一致 |
| 站内链接 | 更新仍指向旧 practice/exam-questions/exam-guide 的引用；正文 16 个内部路径直接 200 |

工作区此前已添加 www 重定向，实际用 Host 请求本地构建验证返回 308。现有跳转目标省略末尾斜杠，正式域名再规范化尾斜杠，最终 URL 一致。代码重定向不能修复 TLS 证书。需在正式托管项目核对 www 域名绑定、DNS 和证书覆盖，再部署已验证版本并重新抓取核查；本轮未修改托管平台或生产配置。

## 验证方式

- `npm run questions:verify`：0 failure，1 个已有警告（exam-day 没有独立专项题）。90 个题目 ID/题干无重复。
- `npm run quiz:verify`：0 failure，免费题池、45 题唯一性及随机化检查通过。
- `npm run build`：通过；使用仅对当前进程生效的 `NEXT_PUBLIC_SITE_URL=https://arizonanotaryprep.com` 检查生产 origin，未改 .env。受限沙箱首次 spawn EPERM 后，获准在沙箱外本地构建。
- `node --experimental-strip-types scripts/seo-verify.mjs`：检查未经 JS 处理的响应正文、6 个示例答案、12 个案例、7 个步骤、16 条直达内部路径、canonical、sitemap、robots、旧路径和 www Host 跳转；结果见 [local-verification.json](./local-verification.json)。
- 浏览器查看默认及 390×844 首屏，核心免费/题量/注册/结果信息在顶部可读；实测匿名启动 Quick 10 和提交结果。修复后将 10 题全部跳过并提交，结果仍显示 10 条正确答案和 10 条未答题解析；匿名 Full 45 正常显示 1/45 和 60:00 倒计时。首屏截图见 [practice-first-screen.png](./practice-first-screen.png)。
- `git diff --check`，人工审查变更；没有修改支付、生产数据库或凭证。

部署后才可复核线上新内容；Google 再次抓取和排名变化不在本地验证的证明范围内。
