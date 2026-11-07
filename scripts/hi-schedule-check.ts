import { addCalendarDays, localDate } from "../lib/calendar.ts";

const zone = "Pacific/Honolulu";
const beforeMidnight = "2026-11-08T09:30:00.000Z";
const afterMidnight = "2026-11-08T10:30:00.000Z";
if (localDate(beforeMidnight, zone) !== "2026-11-07") throw new Error(`before ${localDate(beforeMidnight, zone)}`);
if (localDate(afterMidnight, zone) !== "2026-11-08") throw new Error(`after ${localDate(afterMidnight, zone)}`);
if (localDate(beforeMidnight, "UTC") === localDate(beforeMidnight, zone)) throw new Error("Honolulu matched UTC");

const gaps = [1, 7, 14, 30];
let from = beforeMidnight;
const seen: string[] = [];
for (const days of gaps) {
  const next = addCalendarDays(from, days, zone);
  const day = localDate(next, zone);
  const start = localDate(from, zone);
  const expected = new Date(Date.UTC(
    Number(start.slice(0, 4)),
    Number(start.slice(5, 7)) - 1,
    Number(start.slice(8, 10)) + days,
  )).toISOString().slice(0, 10);
  if (day !== expected) throw new Error(`${days} got ${day} want ${expected}`);
  seen.push(day);
  from = next;
}
console.log(`hi-schedule-check ok ${seen.join(" ")}`);
