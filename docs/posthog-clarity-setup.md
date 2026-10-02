# PostHog 漏斗与 Microsoft Clarity 配置

代码只负责发送事件。漏斗数字在 PostHog 后台配置，不要在代码里伪造结果。Paddle 仍是收入的权威来源，Neon 仍是订单和 Pro 权益的权威来源。

开发环境默认不发送。要在本机看事件，只在 `.env.local` 设置 `NEXT_PUBLIC_ANALYTICS_DEBUG=1`，并填好下面的 key。不要把真实 key 提交到 git。

## 1. 在哪里创建 PostHog 项目

1. 打开 [https://us.posthog.com/signup](https://us.posthog.com/signup)（美国区）或 [https://eu.posthog.com/signup](https://eu.posthog.com/signup)（欧盟区）。
2. 注册组织后，选择 **Create project**。
3. 项目名称可用 `Arizona Notary Prep`。
4. 创建后进入该项目。以后所有漏斗、路径、留存都在这个项目里看。

区域在注册时决定，创建后再改区域等于换一个项目。美国区用 `https://us.i.posthog.com`，欧盟区用 `https://eu.i.posthog.com`。

## 2. 在哪里复制 Project API Key

1. 左侧 **Project settings**（或右上角项目名 → Settings）。
2. 打开 **Project** → **Project API key**。
3. 复制以 `phc_` 开头的 key。
4. 把它放到 `NEXT_PUBLIC_POSTHOG_KEY`。

这是采集用的项目 key，可以出现在浏览器里。不要把以 `phx_` 开头的 Personal API key 填到这个变量。

## 3. Region 怎么选

| 选择 | 应用地址 | 采集 Host |
| --- | --- | --- |
| US | `https://us.posthog.com` | `https://us.i.posthog.com` |
| EU | `https://eu.posthog.com` | `https://eu.i.posthog.com` |

Host 只通过 `NEXT_PUBLIC_POSTHOG_HOST` 配置。代码不写死项目域名。未填写时按美国区采集地址处理。

## 4. 在 Vercel 添加哪些环境变量

在 Vercel 项目 → **Settings** → **Environment Variables**。Production 先加，Preview 可以先不加，避免预览环境把测试数据打进正式项目。

| 变量 | 谁能读 | 作用 |
| --- | --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | 浏览器 | 已有 GA4。来源、落地页、自然搜索 |
| `NEXT_PUBLIC_POSTHOG_KEY` | 浏览器 + 服务端采集 | PostHog 项目 key（`phc_`） |
| `NEXT_PUBLIC_POSTHOG_HOST` | 浏览器 + 服务端采集 | `https://us.i.posthog.com` 或 `https://eu.i.posthog.com` |
| `POSTHOG_PERSONAL_API_KEY` | 仅服务端 | 以后日报查询用。`phx_`。不要加 `NEXT_PUBLIC_` |
| `POSTHOG_PROJECT_ID` | 仅服务端 | Project settings 里的 Project ID，数字 |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | 浏览器 | Clarity 项目 ID。留空则不加载、不录像 |
| `NEXT_PUBLIC_ANALYTICS_DEBUG` | 浏览器 | 只在本机调试时设为 `1`。Production 不要设 |

Personal API key 的位置：PostHog 头像 → **Settings** → **Personal API keys** → **Create personal API key**。权限给查询（query）即可，不要给写入管理权限。Project ID 在 **Project settings** 顶部。

改完环境变量后重新部署一次，浏览器里的 `NEXT_PUBLIC_` 才会进包。这次实现没有自动部署。

## 5. 如何创建主漏斗

1. 左侧 **Product analytics** → **New insight** → **Funnel**。
2. 名称：`AZ prep main funnel`。
3. 右上角时间范围先选 **Last 14 days**。
4. 计数方式选 **Unique users** 或 **Unique sessions**。和下面指标定义一致时，步骤用 session；注册转化如果要对上账号，Sign Up 那一步可以看 unique users。
5. 保存到一个名为 `Arizona Notary Prep` 的 Dashboard。

代码不会计算漏斗结果。

## 6. 每个漏斗步骤选什么事件

按这个顺序添加步骤，事件名必须完全一致：

1. `landing_view` — Landing View
2. `practice_view` — Practice View
3. `exam_start` — Exam Start
4. `exam_complete` — Exam Complete
5. `register_view` — Register View
6. `sign_up` — Sign Up
7. `pricing_view` — Pricing View
8. `checkout_open` — Checkout Open
9. `purchase_completed` — Purchase Completed
10. `entitlement_granted` — Entitlement Granted

不要用按钮点击代替 `checkout_open`。不要用成功页或 GA4 的 `purchase` 代替 `purchase_completed`。

`checkout_click`、`checkout_create_success`、`checkout_create_failed`、`entitlement_missing` 不要放进这条主漏斗。它们用来分开看“点了购买 / 创建交易失败 / 付了但没发权益”。

旧的 GA4 事件名仍然会发，用来延续历史报表：`quick10_start`、`full45_start`、`page_view`、`checkout_start`、`purchase`。主漏斗不要选这些名字。

## 7. 如何按 state、mode、plan 筛选

在漏斗右侧 **Filters**：

- `state` = `AZ`
- `site` = `arizona_notary_prep`
- `mode` = `quick10`、`full45` 或 `practice`（只对答题步骤有值）
- `plan` = `free` 或 `pro`
- `product_code` = `az_exam_pro_60d`（结账和付款步骤）
- `landing_page` = 第一次进入的路径
- `source` = 广告或链接上的 `utm_source`
- `medium` = `utm_medium`

也可以用 **Breakdown** 按 `mode` 或 `plan` 拆开。没有 UTM 的访问不会带 `source` / `medium`，这是正常的，不是代码补出来的。

## 8. 如何查看用户路径

1. **Product analytics** → **New insight** → **Paths**。
2. 路径类型选自定义事件，不要依赖自动 `$pageview`。当前接入关闭了 PostHog 自动采集和会话录像，避免录到题目、密码和支付页。
3. 起点选 `landing_view` 或 `exam_start`。
4. 把第 6 节的事件加入允许列表。
5. 用同样的 `state`、`mode`、`plan` 做筛选。

页面来源和自然搜索继续看 GA4，不看这条路径。

## 9. 如何查看 Retention

1. **Product analytics** → **New insight** → **Retention**。
2. Cohortizing event（第一次）选 `sign_up` 或 `exam_start`。
3. Returning event 选 `exam_start`。
4. 周期选 Week。
5. Filter：`state = AZ`。

匿名访客在登录前只有随机 ID。登录后才会用内部用户 UUID `identify`。退出登录会 `reset`，下一台共用设备上的下一个人不会接到上一个用户。

## 10. 如何关闭超额收费

1. 组织头像 → **Settings** → **Billing**。
2. 打开 **Billing limits**（或每个产品旁边的限额）。
3. 给 Product analytics 设一个你能接受的月度上限。
4. 选择达到上限后停止采集，而不是自动继续按量计费。
5. Clarity 的免费额度在 Microsoft Clarity 项目的 **Settings** → **Privacy / Data** 里看；不配置 `NEXT_PUBLIC_CLARITY_PROJECT_ID` 就不会加载。

限额的按钮文案会随 PostHog 改版变化。原则是：先设上限，并确认超额后停止采集。

## 11. 如何确认事件确实进入 PostHog

1. Vercel Production 已有 `NEXT_PUBLIC_POSTHOG_KEY` 和 Host，并且重新部署过。
2. 用无痕窗口打开正式站，完成：落地页 → 练习页 → Quick 10 交卷 → 注册页。不要在生产里用真实银行卡做测试。
3. PostHog 左侧 **Activity** → **Live events**。
4. 应看到 `landing_view`、`practice_view`、`exam_start`、`exam_complete`，属性里有 `state=AZ`、`site=arizona_notary_prep`。
5. `exam_start` 的 `mode` 应为 `quick10`，`question_count` 为 `10`。事件里不应出现题目正文、答案、邮箱。
6. 服务端事件 `checkout_create_success`、`purchase_completed`、`entitlement_granted` 只在对应的服务器动作成功后出现。创建交易失败时出现 `checkout_create_failed`。Webhook 确认付款但权益失败时出现 `entitlement_missing`。

本机调试：`.env.local` 写上项目 key、Host 和 `NEXT_PUBLIC_ANALYTICS_DEBUG=1`，重启 `npm run dev`，再看 Live events。不要打开 PostHog 的 debug 日志，避免把事件打到浏览器控制台。

## 12. 如何识别重复事件

客户端对同一事件名 + 页面 + `mode` + `product_code` 有 2 秒去重，用来挡住 React 严格模式的双调用。

服务端 `purchase_completed` 和 `entitlement_granted` 只在订单第一次确认时发送。Paddle 重放同一笔 `transaction.completed` 时，现有幂等逻辑返回 duplicate，不再发这两件事。

在 Live events 里如果仍看到重复：

- 同一个 distinct id、同一个事件、间隔小于 2 秒：多半是去重没盖住的双入口，把事件名和时间发回来。
- 间隔很长的第二次 `exam_start`：用户又开了一次考试，不是重复发送。
- `checkout_click` 和 `checkout_open` 是两步，不是重复。
- GA4 的 `purchase`（仪表盘历史事件）和 PostHog 的 `purchase_completed`（Webhook）不是同一事件，不要拿来对账收入。收入以 Paddle 为准。

漏斗步骤请使用 **Unique users** 或 **Unique sessions**，不要用总次数，这样偶发重复不会直接抬高转化率。
