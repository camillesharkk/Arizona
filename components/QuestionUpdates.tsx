"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageDialog } from "@/components/MessageDialog";
import { editorialUpdateByQuestion, editorialUpdates } from "@/data/question-editorial-events";
import { listCaAttempts, localMistakeIds } from "@/lib/ca-attempts";
import { loadProgress } from "@/lib/storage";
import { stateByCode } from "@/lib/states";
import { addUpdateReference, mergeUpdateReceipt, needsUpdatedReview, relatedUpdates, type RelatedUpdate, type UpdateReceipts, type UpdateRelation } from "@/lib/editorial-updates";

const page = "/question-updates/";
const guestKey = "notary-editorial-guest";
const guestAccountKey = "notary-editorial-guest-destination";
const receiptsKey = (account: string | null) => account ? `notary-editorial-outbox:${account}` : guestKey;
const states = [...new Set(editorialUpdates.map(event => event.state))];
type View = { account: string | null; updates: RelatedUpdate[]; receipts: UpdateReceipts };

function storedReceipts(key: string): UpdateReceipts {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
}

function localAssociations(account: string | null) {
  const references = new Map<string, Set<UpdateRelation>>();
  const add = (id: string, relation: UpdateRelation, version?: number, lastAt?: string) => {
    const event = editorialUpdateByQuestion.get(id);
    if (event && needsUpdatedReview(event, { questionVersion: version, lastAt })) addUpdateReference(references, id, relation);
  };
  for (const state of states) {
    const owners = account ? [account] : ["guest"];
    for (const owner of owners) for (const attempt of listCaAttempts(owner, state)) {
      for (const id of Object.keys(attempt.answers)) add(id, "earlier answers", attempt.questionVersions?.[id], attempt.finishedAt);
      for (const id of attempt.wrongIds) add(id, "wrong answers", attempt.questionVersions?.[id], attempt.finishedAt);
    }
    for (const id of localMistakeIds(account ?? "guest", state)) add(id, "wrong answers");
    if (!account) {
      const progress = loadProgress(state, null);
      for (const id of progress.answeredIds) add(id, "earlier answers", progress.questionVersions?.[id]);
      for (const id of progress.wrongIds) add(id, "wrong answers", progress.questionVersions?.[id]);
      for (const id of progress.flaggedIds) add(id, "flags", progress.questionVersions?.[id]);
      for (const row of progress.revisionHistory ?? []) {
        if (row.answered) add(row.questionId, "earlier answers", row.version);
        if (row.wrong) add(row.questionId, "wrong answers", row.version);
        if (progress.flaggedIds.includes(row.questionId)) add(row.questionId, "flags", row.version);
      }
    }
  }
  try {
    for (const key of Object.keys(sessionStorage)) {
      if (!key.includes(`-sitting:`) || !key.includes(`:${account ?? "guest"}:`)) continue;
      const sitting = JSON.parse(sessionStorage.getItem(key) || "{}");
      for (const id of sitting.flaggedIds ?? []) add(id, "flags", sitting.questionVersions?.[id]);
      for (const id of Object.keys(sitting.answers ?? {})) add(id, "earlier answers", sitting.questionVersions?.[id]);
    }
  } catch { /* Browser storage can be disabled. */ }
  return relatedUpdates(editorialUpdates, references);
}

function grouped(rows: RelatedUpdate[]) {
  const groups = new Map<string, RelatedUpdate[]>();
  for (const row of rows) groups.set(row.state, [...(groups.get(row.state) ?? []), row]);
  return groups;
}

function unionRows(server: RelatedUpdate[], local: RelatedUpdate[]) {
  const updates = new Map(server.map(row => [row.id, row]));
  for (const row of local) {
    const previous = updates.get(row.id);
    updates.set(row.id, previous ? { ...row, relations: [...new Set([...previous.relations, ...row.relations])] } : row);
  }
  return [...updates.values()];
}

export function QuestionUpdates() {
  const pathname = usePathname();
  const router = useRouter();
  const isList = pathname === "/question-updates" || pathname === page;
  const [view, setView] = useState<View | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [dialog, setDialog] = useState<RelatedUpdate[]>([]);
  const inflight = useRef<AbortController | null>(null);
  const memoryReceipts = useRef<UpdateReceipts>({});
  const lastAccount = useRef<string | null | undefined>(undefined);
  const isLearningPage = pathname === "/" || /account|practice|study|questions|wrong-answers|question-updates/.test(pathname);

  const refresh = useCallback(async () => {
    if (!isLearningPage || !editorialUpdates.length) return;
    inflight.current?.abort();
    const controller = new AbortController();
    inflight.current = controller;
    try {
      const response = await fetch("/api/question-updates/", { cache: "no-store", signal: controller.signal });
      if (!response.ok) { setUnavailable(true); return; }
      const server: View = await response.json();
      if (controller.signal.aborted) return;
      if (lastAccount.current !== server.account) {
        memoryReceipts.current = {};
        if (lastAccount.current !== undefined) setDialog([]);
      }
      const guestDestination = localStorage.getItem(guestAccountKey);
      const fromGuest = server.account && (!guestDestination || guestDestination === server.account) ? storedReceipts(guestKey) : {};
      if (server.account && Object.keys(fromGuest).length) localStorage.setItem(guestAccountKey, server.account);
      lastAccount.current = server.account;
      const key = receiptsKey(server.account);
      const outbox = storedReceipts(key);
      for (const [id, value] of Object.entries(fromGuest)) {
        if (!server.receipts[id]?.shown || (value.read && !server.receipts[id]?.read)) outbox[id] = mergeUpdateReceipt(outbox[id], value);
      }
      const receipts = { ...server.receipts };
      for (const [id, value] of Object.entries({ ...outbox, ...memoryReceipts.current })) receipts[id] = mergeUpdateReceipt(receipts[id], value);
      setView({ account: server.account, updates: unionRows(server.updates, localAssociations(server.account)), receipts });
      setUnavailable(false);
      if (server.account && Object.keys(outbox).length) {
        localStorage.setItem(key, JSON.stringify(outbox));
        const saved = await fetch("/api/question-updates/", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: server.account, receipts: Object.entries(outbox).map(([id, entry]) => ({ id, ...entry })) }) });
        if (saved.ok && localStorage.getItem(key) === JSON.stringify(outbox)) {
          localStorage.removeItem(key);
        }
      }
    } catch { if (!controller.signal.aborted) setUnavailable(true); }
  }, [isLearningPage]);

  useEffect(() => {
    void refresh();
    const visible = () => { if (!document.hidden) void refresh(); };
    document.addEventListener("visibilitychange", visible);
    window.addEventListener("online", visible);
    window.addEventListener("pageshow", visible);
    return () => {
      inflight.current?.abort();
      document.removeEventListener("visibilitychange", visible);
      window.removeEventListener("online", visible);
      window.removeEventListener("pageshow", visible);
    };
  }, [pathname, refresh]);

  useEffect(() => {
    if (!isLearningPage || pathname.startsWith("/question-updates") || !view) return;
    const unseen = view.updates.filter(row => !view.receipts[row.id]?.shown);
    if (!unseen.length) return;
    let cancelled = false;
    let claiming = false;
    const safe = () => !document.querySelector("[data-editorial-quiz-active],dialog[open]");
    const offer = async () => {
      if (claiming || !safe()) return;
      if (!view.account) { setDialog(unseen); return; }
      claiming = true;
      try {
        const response = await fetch("/api/question-updates/", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: view.account, claim: unseen.map(row => row.id) }) });
        if (!response.ok || cancelled) return;
        const { claimed } = await response.json() as { claimed: string[] };
        if (safe() && !cancelled && claimed.length) setDialog(unseen.filter(row => claimed.includes(row.id)));
      } catch { /* The next successful refresh can retry the claim. */ }
      finally { claiming = false; }
    };
    if (!/practice|questions\//.test(pathname)) void offer();
    window.addEventListener("notary-quiz-finished", offer);
    return () => { cancelled = true; window.removeEventListener("notary-quiz-finished", offer); };
  }, [view, isList, isLearningPage, pathname]);

  function acknowledge(rows: RelatedUpdate[], read: boolean) {
    if (!view || !rows.length) return;
    const key = receiptsKey(view.account);
    const stored = storedReceipts(key);
    const receipts = { ...view.receipts };
    for (const row of rows) {
      const receipt = { shown: true, read, relations: row.relations };
      receipts[row.id] = mergeUpdateReceipt(receipts[row.id], receipt);
      stored[row.id] = mergeUpdateReceipt(stored[row.id], receipt);
      memoryReceipts.current[row.id] = stored[row.id];
    }
    try { localStorage.setItem(key, JSON.stringify(stored)); } catch { /* Continue with this tab's receipt. */ }
    setView({ ...view, receipts });
    if (view.account) void refresh();
  }

  if (!isLearningPage) return null;
  if (isList && !view) return <main className="container"><h1>Question updates</h1>
    <p role="status">{unavailable ? "Updates are temporarily unavailable." : "Loading your question updates…"}</p>
    {unavailable ? <button className="btn btn-ghost" type="button" onClick={() => void refresh()}>Retry</button> : null}
  </main>;
  if (!view) return null;
  const unread = view.updates.filter(row => !view.receipts[row.id]?.read);
  if (isList) return (
    <main className="container">
      <h1>Question updates</h1>
      {view.updates.length === 0 ? <p>You have no related question updates.</p> : (
        <>
          {unread.length ? <button type="button" className="btn btn-ghost" onClick={() => acknowledge(unread, true)}>Mark updates as read</button> : null}
          {[...grouped(view.updates)].map(([state, rows]) => <section key={state}>
            <h2>{stateByCode(state)?.name ?? state}</h2>
            {rows.map(row => <article className="card" key={row.id}>
              <h3>{row.questionId.toUpperCase()} · {row.topic}</h3>
              <p><time dateTime={row.date}>{row.date}</time> · {row.kind === "replacement" ? "Replacement" : row.kind === "rule_change" ? "Rule change" : "Correction"}</p>
              <p>{row.reason}</p>
              <p>Related to your {row.relations.join(", ")}.</p>
              <Link href={`${page}${row.id}/`} onClick={() => acknowledge([row], true)}>View {row.kind === "replacement" ? "replacement" : "updated"} question</Link>
            </article>)}
          </section>)}
        </>
      )}
    </main>
  );
  const kinds = [...new Set(dialog.flatMap(row => row.relations))];
  const topics = [...new Set(dialog.map(row => row.kind === "rule_change" ? "new rules" : row.kind === "replacement" ? "replacement questions" : "corrections"))];
  const count = new Set(dialog.map(row => row.questionId)).size;
  const title = kinds.length === 1 && kinds[0] === "bookmarks" ? "Some of your saved questions have been updated" : "Some questions you’ve used have been updated";
  return (
    <>
      {unread.length ? <div className="container"><Link href={page}>Question updates ({new Set(unread.map(row => row.questionId)).size} unread)</Link></div> : null}
      {dialog.length ? <MessageDialog title={title} onShown={() => acknowledge(dialog, false)} onClose={() => setDialog([])}>
        <p>{count} updated {count === 1 ? "question affects" : "questions affect"} your {kinds.join(", ")}. This update includes {topics.join(", ")}. Review the current versions before practicing these topics again.</p>
        <ul>{[...grouped(dialog)].map(([state, rows]) => <li key={state}>{stateByCode(state)?.name ?? state} · {rows.length}</li>)}</ul>
        <p>Your earlier attempts and bookmarks are preserved.</p>
        <div className="row">
          <button type="button" className="btn btn-primary" data-dialog-autofocus onClick={() => { setDialog([]); router.push(page); }}>Review updates</button>
          <button type="button" className="btn btn-ghost" onClick={() => setDialog([])}>Later</button>
        </div>
      </MessageDialog> : null}
    </>
  );
}
