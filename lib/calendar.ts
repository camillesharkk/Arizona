const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function localParts(iso: string, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const bag: Record<string, string> = {};
  for (const part of dtf.formatToParts(new Date(iso))) bag[part.type] = part.value;
  if (bag.hour === "24") bag.hour = "00";
  return bag;
}

export function localDate(iso: string, timeZone: string) {
  const part = localParts(iso, timeZone);
  return `${part.year}-${part.month}-${part.day}`;
}

export function shiftDate(day: string, days: number) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date + days)).toISOString().slice(0, 10);
}

export function weekdayIndex(day: string) {
  const [year, month, date] = day.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, date)).getUTCDay();
}

export function weekdayName(day: string) {
  return WEEKDAYS[weekdayIndex(day)];
}

function zonedOffset(utcMs: number, timeZone: string) {
  const part = localParts(new Date(utcMs).toISOString(), timeZone);
  const asUtc = Date.UTC(Number(part.year), Number(part.month) - 1, Number(part.day), Number(part.hour), Number(part.minute), Number(part.second));
  return asUtc - utcMs;
}

/** UTC instant of local midnight on `day` in `timeZone`. */
export function startOfLocalDay(day: string, timeZone: string) {
  const guess = Date.parse(`${day}T00:00:00Z`);
  let utc = guess - zonedOffset(guess, timeZone);
  const got = localDate(new Date(utc).toISOString(), timeZone);
  if (got !== day) utc += (got < day ? 1 : -1) * 60 * 60 * 1000;
  return new Date(utc).toISOString();
}

/** Add calendar days in the user's zone and return the next local midnight. */
export function addCalendarDays(iso: string, days: number, timeZone: string) {
  return startOfLocalDay(shiftDate(localDate(iso, timeZone), days), timeZone);
}

export function isStudyDay(day: string, weekdays: number[]) {
  return weekdays.includes(weekdayIndex(day));
}

export function eachDay(start: string, end: string) {
  const days: string[] = [];
  if (end < start) return days;
  let day = start;
  while (day <= end && days.length < 4000) {
    days.push(day);
    day = shiftDate(day, 1);
  }
  return days;
}
