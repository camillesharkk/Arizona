import { NextResponse } from "next/server";
import { z } from "zod";
import { editorialUpdates } from "@/data/question-editorial-events";
import { addUpdateReference, claimUpdateBatch, mergeUpdateReceipt, needsUpdatedReview, relatedUpdates, type UpdateReceipts, type UpdateRelation } from "@/lib/editorial-updates";
import { getSession } from "@/lib/session";
import { productionStateBlocked } from "@/lib/state-release";
import { getStore } from "@/lib/store";

const receiptKey = "EDITORIAL_UPDATES";
const activeEvents = () => editorialUpdates.filter(event => !event.silent && !productionStateBlocked(event.state));
const relation = z.enum(["wrong answers", "bookmarks", "flags", "study tasks", "earlier answers"]);
const receiptsSchema = z.array(z.object({
  id: z.string().max(96), shown: z.boolean().optional(), read: z.boolean().optional(), relations: z.array(relation).max(5).optional(),
})).max(256);
const headers = { "Cache-Control": "private, no-store" };

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ account: null, updates: [], receipts: {} }, { headers });
  const store = await getStore();
  const events = activeEvents();
  const states = [...new Set(events.map(event => event.state))];
  const [stats, receiptsRow, plans] = await Promise.all([
    store.listStats(session.id), store.getStudyPlan(session.id, receiptKey),
    Promise.all(states.map(state => store.getStudyPlan(session.id, state))),
  ]);
  const receipts = (receiptsRow?.document ?? {}) as UpdateReceipts;
  const references = new Map<string, Set<UpdateRelation>>();
  const changed = new Set(events.map(event => event.questionId));
  for (const stat of stats) {
    const event = events.find(item => item.questionId === stat.questionId && item.state === stat.state);
    if (!event || (!needsUpdatedReview(event, stat) && !stat.revisionHistory?.some(item => needsUpdatedReview(event, item)))) continue;
    if (stat.lastAt || stat.revisionHistory?.some(item => item.lastAt)) addUpdateReference(references, stat.questionId, "earlier answers");
    if (stat.wrongCount || stat.revisionHistory?.some(item => item.wrongCount)) addUpdateReference(references, stat.questionId, "wrong answers");
    if (stat.favorited) addUpdateReference(references, stat.questionId, "bookmarks");
    if (stat.savedForReview) addUpdateReference(references, stat.questionId, "study tasks");
  }
  for (const row of plans) {
    const plan = row?.document as { checks?: Record<string, { questionVersions?: Record<string, number>; wrongIds?: string[] }>;
      days?: Record<string, { tasks?: { key: string }[] }> } | undefined;
    for (const check of Object.values(plan?.checks ?? {})) {
      for (const id of new Set([...Object.keys(check.questionVersions ?? {}), ...(check.wrongIds ?? [])])) {
        if (changed.has(id)) addUpdateReference(references, id, "earlier answers");
      }
    }
    for (const day of Object.values(plan?.days ?? {})) for (const task of day.tasks ?? []) {
      if (task.key.startsWith("question:") && changed.has(task.key.slice(9))) addUpdateReference(references, task.key.slice(9), "study tasks");
    }
  }
  for (const event of events) for (const kind of receipts[event.id]?.relations ?? []) addUpdateReference(references, event.questionId, kind);
  return NextResponse.json({ account: session.id, updates: relatedUpdates(events, references), receipts }, { headers });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401, headers });
  const body = z.object({ account: z.string(), receipts: receiptsSchema.optional(),
    claim: z.array(z.string().max(96)).max(256).optional() }).safeParse(await request.json().catch(() => null));
  if (!body.success) return NextResponse.json({ error: "Invalid update receipts" }, { status: 400, headers });
  if (body.data.account !== session.id) return NextResponse.json({ error: "Account changed" }, { status: 409, headers });
  const ids = new Set(activeEvents().map(event => event.id));
  const store = await getStore();
  const claimed = await store.learningTransaction(session.id, async tx => {
    const row = await tx.getStudyPlan(session.id, receiptKey);
    const receipts = { ...(row?.document ?? {}) } as UpdateReceipts;
    for (const { id, ...receipt } of body.data.receipts ?? []) {
      if (ids.has(id)) receipts[id] = mergeUpdateReceipt(receipts[id], receipt);
    }
    const claimed = claimUpdateBatch(receipts, (body.data.claim ?? []).filter(id => ids.has(id)), Date.now());
    await tx.saveStudyPlan({ userId: session.id, state: receiptKey, document: receipts });
    return claimed;
  });
  return NextResponse.json({ ok: true, claimed }, { headers });
}
