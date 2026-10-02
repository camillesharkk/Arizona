import { SMALL_SAMPLE_THRESHOLD } from "../analytics-metrics.ts";
import type { ReportWindow } from "./windows.ts";

export type SourceStatus = "available" | "partial" | "delayed" | "unavailable";

export type MetricWindow = {
  start: string;
  end: string;
  timezone: "America/Phoenix";
};

export type RawMetric = {
  name: string;
  kind: "raw";
  value: number | string | null;
  unit: string;
  source: string;
  window: MetricWindow;
  freshness: string | null;
  sourceStatus: SourceStatus;
};

export type MetricSide = {
  label: string;
  value: number | null;
  source: string;
};

export type CalculatedMetric = {
  name: string;
  kind: "calculated";
  value: number | null;
  formattedValue: string;
  formula: string;
  numerator: MetricSide;
  denominator: MetricSide;
  calculation: string;
  window: MetricWindow;
  sampleSize: number;
  sourceStatus: string;
  warning: string | null;
};

export const SMALL_SAMPLE_WARNING = "小样本：不要据此修改 SEO、Pricing 或支付系统。";

export function metricWindow(window: ReportWindow): MetricWindow {
  return { start: window.start, end: window.end, timezone: "America/Phoenix" };
}

export function rawMetric(input: Omit<RawMetric, "kind">): RawMetric {
  return { kind: "raw", ...input };
}

export function calculatedRate(input: {
  name: string;
  formula: string;
  numerator: MetricSide;
  denominator: MetricSide;
  window: MetricWindow;
  sourceStatus: SourceStatus;
  warning?: string | null;
}): CalculatedMetric {
  const num = input.numerator.value;
  const den = input.denominator.value;
  const blocked = input.sourceStatus === "unavailable";
  if (blocked || num == null || den == null || den <= 0) {
    const calculation = den === 0 ? `${num ?? "null"} ÷ 0 × 100% = N/A` : "N/A";
    return {
      name: input.name,
      kind: "calculated",
      value: null,
      formattedValue: "N/A",
      formula: input.formula,
      numerator: input.numerator,
      denominator: input.denominator,
      calculation,
      window: input.window,
      sampleSize: den && den > 0 ? den : 0,
      sourceStatus: input.sourceStatus,
      warning: input.warning ?? null,
    };
  }
  const pct = (num / den) * 100;
  const small = den < SMALL_SAMPLE_THRESHOLD;
  const warning = [input.warning, small ? SMALL_SAMPLE_WARNING : null].filter(Boolean).join(" ") || null;
  return {
    name: input.name,
    kind: "calculated",
    value: pct,
    formattedValue: `${pct.toFixed(1)}%`,
    formula: input.formula,
    numerator: input.numerator,
    denominator: input.denominator,
    calculation: `${num} ÷ ${den} × 100% = ${pct.toFixed(1)}%`,
    window: input.window,
    sampleSize: den,
    sourceStatus: input.sourceStatus,
    warning,
  };
}

export function calculatedAverage(input: {
  name: string;
  formula: string;
  numerator: MetricSide;
  denominator: MetricSide;
  window: MetricWindow;
  sourceStatus: SourceStatus;
  unit: string;
  warning?: string | null;
}): CalculatedMetric {
  const num = input.numerator.value;
  const den = input.denominator.value;
  if (input.sourceStatus === "unavailable" || num == null || den == null || den <= 0) {
    return {
      name: input.name,
      kind: "calculated",
      value: null,
      formattedValue: "N/A",
      formula: input.formula,
      numerator: input.numerator,
      denominator: input.denominator,
      calculation: den === 0 ? `${num ?? "null"} ÷ 0 = N/A` : "N/A",
      window: input.window,
      sampleSize: den && den > 0 ? den : 0,
      sourceStatus: input.sourceStatus,
      warning: input.warning ?? null,
    };
  }
  const value = num / den;
  const small = den < SMALL_SAMPLE_THRESHOLD;
  const warning = [input.warning, small ? SMALL_SAMPLE_WARNING : null].filter(Boolean).join(" ") || null;
  return {
    name: input.name,
    kind: "calculated",
    value,
    formattedValue: `${value.toFixed(1)} ${input.unit}`,
    formula: input.formula,
    numerator: input.numerator,
    denominator: input.denominator,
    calculation: `${num} ÷ ${den} = ${value.toFixed(1)} ${input.unit}`,
    window: input.window,
    sampleSize: den,
    sourceStatus: input.sourceStatus,
    warning,
  };
}

export function calculatedDifference(input: {
  name: string;
  current: MetricSide;
  baseline: MetricSide;
  window: MetricWindow;
  sourceStatus: SourceStatus;
  warning?: string | null;
}): CalculatedMetric {
  const current = input.current.value;
  const baseline = input.baseline.value;
  const missing = input.sourceStatus === "unavailable" || current == null || baseline == null;
  return {
    name: input.name,
    kind: "calculated",
    value: missing ? null : current - baseline,
    formattedValue: missing ? "N/A" : String(current - baseline),
    formula: "绝对变化 = 当前值 - 对比值",
    numerator: input.current,
    denominator: input.baseline,
    calculation: missing ? "N/A" : `${current} - ${baseline} = ${current - baseline}`,
    window: input.window,
    sampleSize: baseline && baseline > 0 ? baseline : 0,
    sourceStatus: input.sourceStatus,
    warning: input.warning ?? null,
  };
}

export function positionChange(input: {
  name: string;
  previous: number | null;
  trailing: number | null;
  window: MetricWindow;
  sourceStatus: SourceStatus;
  warning?: string | null;
}): CalculatedMetric {
  const numerator = { label: "Previous 7 days average position", value: input.previous, source: "Search Console" };
  const denominator = { label: "Trailing 7 days average position", value: input.trailing, source: "Search Console" };
  if (input.sourceStatus === "unavailable" || input.previous == null || input.trailing == null) {
    return {
      name: input.name,
      kind: "calculated",
      value: null,
      formattedValue: "N/A",
      formula: "Previous 7 days average position − Trailing 7 days average position",
      numerator,
      denominator,
      calculation: "N/A",
      window: input.window,
      sampleSize: 0,
      sourceStatus: input.sourceStatus,
      warning: input.warning ?? null,
    };
  }
  const value = input.previous - input.trailing;
  return {
    name: input.name,
    kind: "calculated",
    value,
    formattedValue: value.toFixed(2),
    formula: "Previous 7 days average position − Trailing 7 days average position",
    numerator,
    denominator,
    calculation: `${input.previous} − ${input.trailing} = ${value.toFixed(2)}`,
    window: input.window,
    sampleSize: 2,
    sourceStatus: input.sourceStatus,
    warning: input.warning ?? null,
  };
}
