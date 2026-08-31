const TZ = "America/Phoenix";

export function arizonaToday(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function arizonaWeekday(): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: TZ, weekday: "short" }).format(new Date());
}

export function isArizonaMonday() {
  return arizonaWeekday() === "Mon";
}

export function addDays(ymd: string, days: number) {
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}

export function daysBetween(fromYmd: string, toYmd: string) {
  const a = Date.parse(`${fromYmd}T00:00:00Z`);
  const b = Date.parse(`${toYmd}T00:00:00Z`);
  return Math.round((b - a) / 86400000);
}

export function isoWeekPeriodKey(ymd: string) {
  const [y, m, d] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const day = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - day);
  const year = date.getUTCFullYear();
  const yearStart = new Date(Date.UTC(year, 0, 1));
  const week = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `weekly:${year}-W${String(week).padStart(2, "0")}`;
}

export function studiedRecently(user: { lastStudyDate: string | null; lastStudyAt: string | null }, today = arizonaToday()) {
  if (user.lastStudyDate === today) return true;
  if (!user.lastStudyAt) return false;
  return Date.now() - new Date(user.lastStudyAt).getTime() < 24 * 60 * 60 * 1000;
}
