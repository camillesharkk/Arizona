import type { Question } from "./types.ts";

export function isActiveQuestion(q: Question, asOf = new Date()): boolean {
  if (q.status !== "published") return false;
  const from = new Date(q.effective_from);
  const to = q.effective_to ? new Date(q.effective_to) : null;
  if (Number.isNaN(from.getTime()) || asOf < from) return false;
  if (to && asOf > to) return false;
  return true;
}
