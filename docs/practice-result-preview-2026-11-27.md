# 免费练习结果和重点州页面预览验收

2026-11-27，Asia/Shanghai。工作树 `D:/webtest/notary-practice-seo`，分支 `codex/notary-practice-seo`，提交基线 `43c22cd82a24dbfd34746e86d222b4b0f67fbe4a`。已通过 GitHub 核对远端 `main`。预览包含此基线、原有暂存改动和本轮工作区增量。未提交或推送。

## 本机预览

- [Arizona 正式练习路径](http://127.0.0.1:3917/arizona-notary-practice-test/)
- [Indiana 申请指南](http://127.0.0.1:3917/indiana/become-a-notary/#course-exam)
- [Ohio Questions](http://127.0.0.1:3917/ohio/questions/#sample-questions) 和 [Ohio Practice](http://127.0.0.1:3917/ohio/practice/)
- [New York 公共练习](http://127.0.0.1:3917/new-york/practice/) 和 [独立预览路径](http://127.0.0.1:3917/preview/new-york/practice/)
- [已完成的 Arizona 结果](http://127.0.0.1:3917/arizona-notary-practice-test/?mode=quick&ops_acceptance=1&attempt=41780f55-e02d-4f12-90b3-5fd35de96643) 已留在应用内浏览器。该样本答错一题、跳过九题。访客记录随浏览器保存。其他浏览器可从 [Arizona Quick 10](http://127.0.0.1:3917/arizona-notary-practice-test/?mode=quick&start=1&ops_acceptance=1) 生成自己的结果。
- 本地优化构建可从 [3921](http://127.0.0.1:3921/arizona-notary-practice-test/) 打开。两个端口使用各自的文件数据目录。本机预览使用 `DATABASE_URL=local-isolated`，测试账号使用保留的 `.invalid` 邮箱。普通练习预览没有加载支付凭据。

## 核验表

| 项目 | 实际环境与操作 | 结果 | 证据 | 未验证原因 |
| --- | --- | --- | --- | --- |
| 构建、类型检查、空白差异 | 对隔离构建目录运行 Next.js 优化构建、`tsc --noEmit --incremental false` 和 `git diff --check` | 构建退出 0，生成 753 个静态页面，类型和差异检查通过。仓库没有独立 lint 命令或 ESLint 配置 | `.tools/result-final-build-v3.log` | 独立 ESLint 无项目配置 |
| 主题、空记录、缺映射和权益计算 | `scripts/practice-result-verify.ts` 运行真实共享逻辑 | 跳过、全部答对、单题主题、未返回反馈、缺映射、计分题分离与权益判定通过 | [回归脚本](../scripts/practice-result-verify.ts) | 缺失映射由逻辑测试覆盖 |
| Arizona 游客练习及恢复 | Chrome 完成 6/10，打开错题官方证据，刷新、后退、第二标签，再做一套 10/10 | 诊断与判题一致。一套一次 `result_view`，新套另计。3px 键盘焦点可见 | `.tools/result-preview-shots/result-browser-final.json` | 实测范围为同一浏览器配置 |
| Ohio 登录续接 | Chrome 390px，答错一题并跳过九题，经 Wrong Answers 走普通登录表单，再返回原结果 | 州、attempt 和成绩保持一致。云端新增一条记录，未消耗整套免费额度 | `.tools/result-preview-shots/result-browser-final.json` | 测试使用隔离文件存储 |
| 空作答、旧记录、判题中断 | Chrome AZ 整套全跳过。单次判题请求故障注入。模拟存档缺失答案字段 | 45 个未作答且无主题错项。中断保留选项，真实重试返回 200。旧记录保留成绩并提供免费指南 | `.tools/result-preview-shots/edge-browser.json` 与浏览器验证脚本 | 旧字段和网络故障由隔离测试有意制造 |
| 州分支、账号权益 | Chrome 使用游客、有效 60-Day、Lifetime 和过期权益的隔离账号。三个付费状态账号均已有一条完整练习历史 | AZ、IN、OH、NY、CT、NC、CA、HI 和 RI 实测。CA、HI 和 RI 无硬推套餐卡。有效 AZ 60-Day 和 Lifetime 无升级卡且可以再次开练 Full 45。过期账号恢复可升级并沿用已用完免费整套额度的规则 | `.tools/result-flow-browser.mjs` 和 `.tools/result-preview-shots/active-expired-full-access.json` | 权益来自测试夹具，开通链路见支付行 |
| CA、PA 全套计分 | Chrome 对每州各答两题，其中一题为不计分题，再使用实际判题提交 | CA 按 40 道计分题、PA 按 25 道计分题。每套均标注 5 道不计分题，并分开显示跳过与学习诊断 | `.tools/result-preview-shots/edge-browser.json` | 官方成绩由考试机构出具 |
| 登录导入接口 | 隔离 API 并发和重放，AZ、CA、HI、NY、PA、LA、CT | 每州保持一条 7/10 成绩、三条错题和原有整套额度 | `scripts/guest-progress-http-verify.mjs` | 真实 Neon 并发未运行 |
| 发布边界 | 在 3921 逐州调用练习接口，逐套复查首次完整练习和存档 | 28 州首批响应仅有题目与选项，8 州免费完整练习可按原凭据回看，重复开场被拦截 | `scripts/practice-boundary-verify.mjs` | 本机优化构建 |
| SEO、公开样题 | 3921 HTTP、无 JS Chrome 和构建文件检查 | NY 公共页可索引、5 道 SSR 样题，独立 preview 为 noindex/nofollow。OH Questions 有 6 道示例、OH Practice 自成入口。Canonical、sitemap、Arizona 兼容跳转通过。检查 HTML、RSC 和 297 个客户端 chunk，覆盖两州公开样题之外的题库文本 | [HTTP 脚本](../scripts/public-practice-http-verify.mjs)、[官方来源记录](priority-practice-page-sources-2026-11-27.md) | 正式域名发布后才可验证搜索引擎实际收录 |
| 响应式、性能入口 | Chrome 375、390、1440px 五页共 15 次检查，另测结果和键盘入口 | 无横向溢出，目标页和结果 canvas 为纯白，主要免费按钮可触达 | `.tools/result-preview-shots/priority-public-browser.json` 和 `az-result-viewport-*.png` | 实测浏览器为 Chrome |
| 分产品事件 | Chrome 滚动到报价入口，点击实际定价锚点并返回，使用内部流量标记捕获事件 | 2 次独立 `upgrade_view`，2 次独立 `upgrade_click`，两产品各一次。结果回看无重复 `result_view` | `.tools/result-preview-shots/result-browser-plan-events.json`，`npm run analytics:verify` | 验收捕获本地事件，未写入正式转化报表 |
| 60-Day 沙箱支付 | 隔离沙箱，实际提交报价和 checkout 请求 | 报价 HTTP 200，创建交易 HTTP 502，错误码 `PADDLE_CHECKOUT_HTTP`，Paddle 返回 forbidden，测试账号仍是 Free | `.tools/result-preview-shots/sandbox-60day.json` | 需要可创建对应商品交易的 Paddle sandbox 凭据，之后才能测开启、关闭重开、支付和 webhook |
| Lifetime 沙箱支付 | 核对产品配置、定价页和本地隔离存储 | 定价入口有效。付款闭环未验证 | `lib/billing/lifetime-availability.ts` 及本地定价锚点 | 缺 Lifetime sandbox price ID、匹配迁移的隔离 Postgres 和可接收 sandbox webhook 的绑定 |

当前目录中另有若干旧脚本的历史失败。旧 VM 夹具缺少 `TextEncoder` 或 React `createContext`，旧浏览器持久化和 NY 响应断言在相同提交基线也复现。PGlite 专项性能脚本缺本地运行时。受影响功能使用上表所列实际 HTTP、Chrome 和构建验证。No-JS 样题、支付设备无关逻辑、资格与 webhook 的单元夹具结论分开记录。

## 四州定价和练习配置

| 州 | 开放题量 | 整套站内练习 | 价格入口 |
| --- | --- | --- | --- |
| Arizona | 203 已发布，60 免费，143 Pro | 45 题，60 分钟 | `/pricing/#pro-checkout` 和 `#lifetime-checkout` |
| Indiana | 203 已发布，60 免费，143 Pro | 30 题，无计时 | `/indiana/pricing/` 两个同名锚点 |
| Ohio | 203 已发布，60 免费，143 Pro | 40 题，无计时 | `/ohio/pricing/` 两个同名锚点 |
| New York | 203 已发布，29 免费，174 Pro | 40 题，60 分钟 | `/new-york/pricing/` 两个同名锚点 |

60-Day 标准目录价 `$22.21`。Lifetime 目录总价 `$29.99`，其中访问权 `$19.99`，保证金 `$10`。两种套餐的现行优惠资格和实际报价由服务端定价流程计算。

生产未发布。主分支、价格、退款和支付配置未作生产变更。
