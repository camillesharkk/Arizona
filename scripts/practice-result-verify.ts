import assert from "node:assert/strict";
import { claimResultView, diagnosePractice, resultOffer } from "../lib/practice-result.ts";

const acts = { id: "acts", label: "Notarial acts" };
const rows = [
  { id: "correct", selected: "A", correctOption: "A", topic: acts },
  { id: "missed", selected: "C", correctOption: "A", topic: acts },
  { id: "skipped", topic: acts },
  { id: "unmapped", selected: "B", correctOption: "A" },
  { id: "unscored", selected: "B", correctOption: "A", topic: acts, unscored: true },
];
const mixed = diagnosePractice(rows);
assert.deepEqual(mixed.topics, [{ ...acts, answered: 3, correct: 1, missed: 2 }]);
assert.equal(mixed.skipped, 1);
assert.equal(mixed.unmapped, 1);
assert.equal(mixed.firstMissedId, "missed");
assert.equal(mixed.unscored, 1);
assert.equal(diagnosePractice([rows[0]]).status, "all-correct");
assert.equal(diagnosePractice([rows[2]]).status, "unanswered");
assert.equal(diagnosePractice([{ id: "pending", selected: "A", topic: acts }]).status, "pending");
assert.deepEqual(diagnosePractice([{ id: "pending", selected: "A", topic: acts }]).topics, []);
assert.equal(diagnosePractice([rows[3]]).status, "complete");
assert.equal(diagnosePractice([]).status, "unavailable");

const counts = { published: 100, free: 30, pro: 70 };
assert.deepEqual(resultOffer({ purchaseEnabled: true, isPro: false, counts }), { extraQuestions: 70 });
assert.equal(resultOffer({ purchaseEnabled: false, isPro: false, counts }), null);
assert.equal(resultOffer({ purchaseEnabled: true, isPro: undefined, counts }), null);
assert.equal(resultOffer({ purchaseEnabled: true, isPro: true, counts }), null);
assert.equal(resultOffer({ purchaseEnabled: true, isPro: false, counts: { published: 50, free: 50, pro: 0 } }), null);
assert.equal(resultOffer({ purchaseEnabled: true, isPro: false, counts: { ...counts, pro: 55 } }), null);

const data = new Map<string, string>();
const browser = () => ({ getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => void data.set(key, value) });
assert.equal(claimResultView(browser(), "AZ", "sitting-1"), true);
assert.equal(claimResultView(browser(), "AZ", "sitting-1"), false);
assert.equal(claimResultView(browser(), "IN", "sitting-1"), true);
assert.equal(claimResultView(browser(), "AZ", "sitting-2"), true);
assert.equal(claimResultView(browser(), "AZ", ""), false);
console.log("Practice result regression checks passed.");
