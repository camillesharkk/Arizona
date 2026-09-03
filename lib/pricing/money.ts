/** Integer cents only. Never persist floating-dollar amounts. */

export function applyPercent(cents: number, percent: number): number {
  if (!Number.isInteger(cents) || !Number.isInteger(percent)) {
    throw new Error("cents_and_percent_must_be_integers");
  }
  return Math.round((cents * percent) / 100);
}

export function formatUsd(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  return `${sign}$${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, "0")}`;
}

export function addHours(isoOrDate: string | Date, hours: number): Date {
  const d = isoOrDate instanceof Date ? new Date(isoOrDate.getTime()) : new Date(isoOrDate);
  d.setTime(d.getTime() + hours * 60 * 60 * 1000);
  return d;
}

export function hoursBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (60 * 60 * 1000);
}
