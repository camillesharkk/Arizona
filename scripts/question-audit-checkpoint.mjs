import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";

const [inventoryPath, ledgerPath, outputPath] = process.argv.slice(2);
if (!inventoryPath || !ledgerPath || !outputPath) {
  throw Error("Usage: node scripts/question-audit-checkpoint.mjs INVENTORY.jsonl LEDGER.jsonl SUMMARY.json");
}

function readRows(path) {
  const byId = new Map();
  for (const line of readFileSync(path, "utf8").trim().split(/\r?\n/)) {
    const row = JSON.parse(line);
    assert.ok(row.id && !byId.has(row.id), `Missing or duplicate ID in ${path}: ${row.id}`);
    byId.set(row.id, row);
  }
  return byId;
}

const inventory = readRows(inventoryPath);
const ledger = readRows(ledgerPath);
const staleEvidence = [];
const states = new Map();
const nextPendingId = {};
const emptyCounts = () => ({ total: 0, verifiedUnchanged: 0, revisedRechecked: 0, pending: 0, held: 0 });
const total = emptyCounts();
for (const [id, row] of inventory) {
  const evidence = ledger.get(id);
  const currentEvidence = evidence?.contentSha256 === row.contentSha256 && evidence?.version === row.version;
  if (evidence && !currentEvidence) staleEvidence.push(id);
  const byState = states.get(row.state) ?? emptyCounts();
  states.set(row.state, byState);
  let status = "pending";
  if (row.publishedWindowEnd) {
    assert.equal(evidence?.status, "held", `Held item missing its disposition: ${id}`);
    assert.ok(currentEvidence && evidence.checkedSources?.length, `Stale or missing held-item evidence: ${id}`);
    status = "held";
  } else if (currentEvidence && ["verified_unchanged", "revised_rechecked"].includes(evidence.status)) {
    assert.equal(row.reviewedAt, evidence.reviewedAt, `Review timestamp mismatch: ${id}`);
    assert.ok(evidence.checkedSources?.length, `Missing governing evidence: ${id}`);
    status = evidence.status === "verified_unchanged" ? "verifiedUnchanged" : "revisedRechecked";
  }
  if (status === "pending" && (!nextPendingId[row.state] || id < nextPendingId[row.state])) nextPendingId[row.state] = id;
  byState.total++;
  byState[status]++;
  total.total++;
  total[status]++;
}
for (const id of ledger.keys()) assert.ok(inventory.has(id), `Ledger item absent from inventory: ${id}`);
const summary = {
  total,
  byState: Object.fromEntries([...states].sort(([a], [b]) => a.localeCompare(b))),
  nextPendingId: Object.fromEntries(Object.entries(nextPendingId).sort(([a], [b]) => a.localeCompare(b))),
  staleEvidence,
};
writeFileSync(outputPath, JSON.stringify(summary, null, 2) + "\n");
console.log(JSON.stringify(total));
