/**
 * Shared product-metric definitions for a later daily report.
 * This file does not query PostHog, GA4, or Paddle and does not invent funnel results.
 * Denominator 0 is always "N/A", never "0%".
 */

export type MetricDefinition = {
  id: string;
  nameZh: string;
  nameEn: string;
  formula: string;
  numeratorEvent: string;
  denominatorEvent: string;
  dedupe: string;
  window: string;
  source: string;
  zeroDenominator: "N/A";
  smallSampleThreshold: number;
};

export const SMALL_SAMPLE_THRESHOLD = 30;

export const PRODUCT_METRICS: MetricDefinition[] = [
  {
    id: "exam_start_rate",
    nameZh: "答题开始率",
    nameEn: "Exam start rate",
    formula: "Exam Start unique sessions ÷ Practice View unique sessions × 100%",
    numeratorEvent: "exam_start",
    denominatorEvent: "practice_view",
    dedupe: "unique sessions",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "PostHog",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
  {
    id: "exam_complete_rate",
    nameZh: "答题完成率",
    nameEn: "Exam completion rate",
    formula: "Exam Complete unique sessions ÷ Exam Start unique sessions × 100%",
    numeratorEvent: "exam_complete",
    denominatorEvent: "exam_start",
    dedupe: "unique sessions",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "PostHog",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
  {
    id: "register_conversion_rate",
    nameZh: "注册页转化率",
    nameEn: "Register conversion rate",
    formula: "Sign Up unique users/sessions ÷ Register View unique sessions × 100%",
    numeratorEvent: "sign_up",
    denominatorEvent: "register_view",
    dedupe: "unique users or sessions",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "PostHog",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
  {
    id: "pricing_view_rate",
    nameZh: "Pricing 访问率",
    nameEn: "Pricing view rate",
    formula: "Pricing View unique sessions ÷ Exam Start unique sessions × 100%",
    numeratorEvent: "pricing_view",
    denominatorEvent: "exam_start",
    dedupe: "unique sessions",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "PostHog",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
  {
    id: "checkout_open_rate",
    nameZh: "Checkout 打开率",
    nameEn: "Checkout open rate",
    formula: "Checkout Open unique sessions ÷ Pricing View unique sessions × 100%",
    numeratorEvent: "checkout_open",
    denominatorEvent: "pricing_view",
    dedupe: "unique sessions",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "PostHog",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
  {
    id: "payment_success_rate",
    nameZh: "支付成功率",
    nameEn: "Payment success rate",
    formula: "Paddle Completed unique transactions ÷ Checkout Open unique checkouts × 100%",
    numeratorEvent: "purchase_completed",
    denominatorEvent: "checkout_open",
    dedupe: "unique transactions / unique checkouts",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "Paddle Completed 交易数 ÷ 浏览器 checkout_open。purchase_completed 由 Webhook 写入，不与浏览器事件共属同一 PostHog Session。",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
  {
    id: "entitlement_grant_rate",
    nameZh: "权益发放成功率",
    nameEn: "Entitlement grant rate",
    formula: "Entitlement Granted unique completed orders ÷ Paddle Completed unique transactions × 100%",
    numeratorEvent: "entitlement_granted",
    denominatorEvent: "purchase_completed",
    dedupe: "unique completed orders / unique transactions",
    window: "查询窗口；日报默认 America/Phoenix 自然日",
    source: "Neon 权益核对 ÷ Paddle Completed。entitlement_granted 由 Webhook 写入，不与浏览器事件共属同一 PostHog Session。",
    zeroDenominator: "N/A",
    smallSampleThreshold: SMALL_SAMPLE_THRESHOLD,
  },
];

export function ratePercent(
  numerator: number,
  denominator: number,
  smallSampleThreshold = SMALL_SAMPLE_THRESHOLD
): { value: string; smallSample: boolean } {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0 || numerator < 0) {
    return { value: "N/A", smallSample: false };
  }
  const pct = (numerator / denominator) * 100;
  return {
    value: `${pct.toFixed(1)}%`,
    smallSample: denominator < smallSampleThreshold,
  };
}
