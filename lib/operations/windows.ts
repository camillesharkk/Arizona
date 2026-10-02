/** America/Phoenix is UTC-7 all year. It does not observe daylight saving time. */

export const REPORT_TIME_ZONE = "America/Phoenix" as const;
const PHOENIX_OFFSET = "-07:00";
const DAY_MS = 24 * 60 * 60 * 1000;

export type ReportWindow = {
  start: string;
  end: string;
  startIso: string;
  endIso: string;
  timezone: typeof REPORT_TIME_ZONE;
  dataAsOf: string;
};

export type ReportWindows = {
  timezone: typeof REPORT_TIME_ZONE;
  generatedAt: string;
  yesterday: ReportWindow;
  trailing7: ReportWindow;
  previous7: ReportWindow;
};

export function phoenixDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: REPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function addPhoenixDays(ymd: string, days: number) {
  const ms = Date.parse(`${ymd}T00:00:00${PHOENIX_OFFSET}`) + days * DAY_MS;
  return phoenixDate(new Date(ms));
}

export function phoenixWindow(start: string, end: string): ReportWindow {
  const startMs = Date.parse(`${start}T00:00:00${PHOENIX_OFFSET}`);
  const endMs = Date.parse(`${end}T00:00:00${PHOENIX_OFFSET}`) + DAY_MS;
  return {
    start,
    end,
    startIso: new Date(startMs).toISOString(),
    endIso: new Date(endMs).toISOString(),
    timezone: REPORT_TIME_ZONE,
    dataAsOf: new Date(endMs).toISOString(),
  };
}

export function reportWindows(now = new Date()): ReportWindows {
  const today = phoenixDate(now);
  const yesterday = addPhoenixDays(today, -1);
  const trailingStart = addPhoenixDays(yesterday, -6);
  const previousEnd = addPhoenixDays(trailingStart, -1);
  const previousStart = addPhoenixDays(previousEnd, -6);
  return {
    timezone: REPORT_TIME_ZONE,
    generatedAt: now.toISOString(),
    yesterday: phoenixWindow(yesterday, yesterday),
    trailing7: phoenixWindow(trailingStart, yesterday),
    previous7: phoenixWindow(previousStart, previousEnd),
  };
}

export function windowsOverlap(a: ReportWindow, b: ReportWindow) {
  return a.start <= b.end && b.start <= a.end;
}

export function containsInstant(iso: string, window: ReportWindow) {
  const time = Date.parse(iso);
  return Number.isFinite(time) && time >= Date.parse(window.startIso) && time < Date.parse(window.endIso);
}
