import type { EditorialUpdate } from "../data/question-editorial-events.ts";

export type UpdateRelation = "wrong answers" | "bookmarks" | "flags" | "study tasks" | "earlier answers";
export type RelatedUpdate = EditorialUpdate & { relations: UpdateRelation[] };
export type UpdateReceipts = Record<string, { shown?: boolean; read?: boolean; relations?: UpdateRelation[]; leaseUntil?: number }>;

export function relatedUpdates(events: readonly EditorialUpdate[], references: ReadonlyMap<string, Set<UpdateRelation>>) {
  return events.flatMap(event => {
    const relations = references.get(event.questionId);
    return relations?.size ? [{ ...event, relations: [...relations] }] : [];
  });
}

export function addUpdateReference(references: Map<string, Set<UpdateRelation>>, id: string, relation: UpdateRelation) {
  const relations = references.get(id) ?? new Set<UpdateRelation>();
  relations.add(relation);
  references.set(id, relations);
}

export function mergeUpdateReceipt(previous: UpdateReceipts[string] | undefined, incoming: UpdateReceipts[string]) {
  return {
    shown: previous?.shown || incoming.shown || incoming.read || false,
    read: previous?.read || incoming.read || false,
    relations: [...new Set([...(previous?.relations ?? []), ...(incoming.relations ?? [])])],
    leaseUntil: incoming.shown || incoming.read ? undefined : previous?.leaseUntil,
  };
}

export function claimUpdateBatch(receipts: UpdateReceipts, ids: string[], now: number) {
  const eligible = [...new Set(ids)].filter(id => !receipts[id]?.shown && (receipts[id]?.leaseUntil ?? 0) <= now);
  for (const id of eligible) receipts[id] = { ...receipts[id], leaseUntil: now + 30_000 };
  return eligible;
}

export function needsUpdatedReview(event: EditorialUpdate, record: {
  questionVersion?: number; lastAt?: string | null; lastReviewedAt?: string | null;
  revisionHistory?: { questionVersion?: number }[];
}) {
  if (event.silent) return false;
  if (event.replacementId) return true;
  if (event.previousVersion !== undefined) return (record.questionVersion ?? 1) < event.version ||
    (!record.lastAt && Boolean(record.revisionHistory?.some(item => (item.questionVersion ?? 1) < event.version)));
  return !record.lastAt || Date.parse(record.lastAt) < Date.parse(event.occurredAt);
}
