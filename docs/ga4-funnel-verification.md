# GA4 漏斗修复与线上验收

更新：2026-10-28。代码已修复；本文不是生产部署或 DebugView 验收成功的证明。

## 事件与口径

| 行为 | 事件 | 关键参数 |
| --- | --- | --- |
| 页面访问 | `page_view` | `page_path` |
| 开始 / 完成测试 | `exam_start` / `exam_complete` | `mode`, `question_count`, `plan` |
| 看见升级入口（至少 50% 进入视口） | `upgrade_view` | `entry_point` |
| 点击升级入口 | `upgrade_click` | `entry_point` |
| 查看价格 | `pricing_view` | `upgrade_source`, `upgrade_page` |
| 注册成功 | `sign_up` | 同上（同标签页 30 分钟内保留入口归因） |
| 点击结账 | `checkout_click` | `entry_point=pricing` |
| 创建交易，准备进入结账 | `begin_checkout` | `currency`, `value`, `items[]`；保留原 `checkout_start` |
| Paddle 结账加载 | `checkout_open` | 仍取 Paddle `checkout.loaded`，不把创建交易当作界面加载成功 |
| 服务端订单已付款 | `purchase` | Paddle `transaction_id`, USD `value`, `items[]` |
| 对应订单已有权益记录 | `entitlement_granted` | `transaction_id`, `plan=pro` |

入口目前显式区分 `exam_results`、`wrong_answers`、`practice_limit`、`locked_question`、`home_pro`；其他价格链接按 header、footer、page_content 分类，并带当前页面路径。

GA 命令队列在第一个事件时同步初始化，`js`、`config` 先于事件入队；远程 Google 脚本仍延迟加载。入队不等于 GA 服务端确认接收，广告拦截、网络失败仍可能造成数据差异。

## 在 GA4 验收（待生产部署后执行）

1. 确认生产构建配置有效的 `NEXT_PUBLIC_GA_MEASUREMENT_ID`。这是构建时变量，修改后必须重新构建。
2. 在测试浏览器打开网站并加 `?analytics_debug=1`。此开关只保留在该标签页会话内，不会给普通用户开启 debug。
3. GA4 → 管理 → DebugView，选择对应测试设备。
4. 实际开始并完成一次测试，滚动到升级按钮，点击进入定价和注册；逐个检查上表事件。未滚动到的链接不能算曝光。
5. 检查 `begin_checkout` 的 `items` 包含 `az_exam_pro_60d`、quantity 1、实际报价和 USD；不要只看事件名。
6. 使用 Paddle 沙盒执行支付验收；不要为埋点测试自行发起真实收费。浏览器 `checkout.completed` 只触发服务端核验，不直接发送 purchase。
7. 检查 purchase 的 transaction_id 与 Paddle 交易 ID 一致，金额与服务端订单一致；刷新不能重复记录。purchase 金额沿用订单报价，不含 Paddle 另收的税款，不要与含税 grand total 直接比较。
8. 用另一次沙盒交易验证失败回跳：留在原页或返回任一站内页面，应核验该 pending 交易后恢复 purchase。旧的 Pro 订单不能满足这次交易。
9. 使用 `?analytics_debug=0` 关闭当前会话调试，或关闭测试标签页。

不要把完整过程配置成必须每次都经过“注册成功”的闭合漏斗：已有账号不需要再次注册。建议分别建立学习漏斗和购买漏斗；新客注册单独看。本站没有购物车，不应伪造 add_to_cart、add_shipping_info 等事件来填满 GA4 默认模板。使用实际事件构建自定义漏斗；这次修复不自动修改 GA4 报表配置。

## 排除测试流量与时区

- `analytics_debug=1`、`ops_probe=1`、`ops_acceptance=1` 或 Paddle sandbox 的浏览器事件均标记 `traffic_type=internal`。debug 会额外发送 `debug_mode=true`。
- PostHog 业务查询已经排除 traffic_type=internal；Paddle sandbox webhook 事件也带该标记。
- GA4 的 internal traffic 标记不会自动创建过滤器。后台应先在“测试”状态验证过滤规则，再按运营需要启用排除。启用排除可能影响 DebugView 可见性，应先完成调试验收，或使用独立测试属性。不能宣称历史测试数据已被删除。
- 在 GA4 自定义定义中登记事件维度 `entry_point`、`upgrade_source`、`upgrade_page`，以便在后续探索中分组。DebugView 可以直接检查事件参数。
- 现有运营日报和对账脚本使用 America/Phoenix（全年 UTC-7），按本地自然日，结束边界不包含下一天零点。前端事件无需伪造时间戳。
- 先核实 GA4 属性时区；若不一致，不能直接比较相同日期字符串。调整属性时区需记录生效日期，旧报表不会被简单重写。这次未修改 GA4 时区。
- 使用最近已结束日期，给 GA4 数据处理留出时间；不要把新事件未出现在标准报表中解释为支付失败。

## 购买恢复的边界

- 待核验交易在同一浏览器 localStorage 保存，最长 72 小时。创建交易、Paddle 完成通知、窗口返回焦点和站内页面切换会触发检查；每轮最多 20 次，每 3 秒一次。
- `/api/billing/access/` 使用现有登录鉴权，只返回该用户的订单。只匹配该 pending Paddle transaction ID，不能靠 URL 的 checkout=success 或旧权益判断新交易完成。
- 每笔 purchase 在入队成功后才标记。已标记仅代表浏览器队列接受；跨设备、清除存储、广告拦截等仍须对账。
- Paddle webhook 的 PostHog 事件带同一交易 ID，发送有超时且失败不影响权益发放；GA4 未配置服务端 Measurement Protocol，此次没有伪称 webhook 直接写入 GA4。
- 用户付费后永不返回网站、清除存储或换浏览器时，GA4 仍可能缺失。真实支付以 Paddle 与服务端订单为准。

## 只读对账脚本

脚本使用安全环境变量中的 DATABASE_URL、PADDLE_API_KEY、PADDLE_PRODUCT_ID、PADDLE_ENVIRONMENT。不要把密钥放到命令行或提交到 Git。

```powershell
node --env-file=<有效且未提交的生产配置文件> --experimental-strip-types scripts/analytics-reconcile.ts 2026-09-30 2026-10-27 <ga-export.json>
```

GA 输入文件格式：

```json
{
  "startDate": "2026-09-30",
  "endDate": "2026-10-27",
  "timeZone": "America/Phoenix",
  "transactionIds": ["从 GA4 交易报告导出的实际 transaction_id"]
}
```

必须实际使用一致的日期和时区，不能只改 JSON 标签。省略 GA 文件时输出 gaStatus=unavailable、gaMissing=null，绝不把没有访问权限当作零购买。

脚本在数据库只读事务中读取该窗口的 paid 订单，逐笔 GET Paddle 验证 completed，再匹配 GA transaction_id；兼容旧版使用内部 order ID 的历史数据。它不修改订单、不发送/补造历史事件、不发现数据库中完全缺失的 webhook。后者应使用现有运营报告中的 Paddle 与权益核对。

本次生产对账未完成：仓库中的生产环境快照含脱敏占位符；本地有效 Paddle 配置为 sandbox。没有用沙盒结果冒充生产订单核验。

## 本地检查

```powershell
npm run analytics:verify
npm run operations:verify
npm run paddle:verify
npx tsc --noEmit
node scripts/analytics-browser-verify.mjs
npm run build
```

浏览器脚本使用隔离的本地页面和实际分析模块，验证首屏队列、隐藏/屏外链接、动态结果入口、归因、ecommerce 参数、订单恢复、同页新建支付后自动核验及监听器清理；不访问 Google/Paddle，也不等于 GA4 DebugView 的线上验收。
