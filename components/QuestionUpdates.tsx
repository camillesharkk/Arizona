"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageDialog } from "@/components/MessageDialog";
import { editorialUpdateByQuestion, editorialUpdates } from "@/data/question-editorial-events";
import { listCaAttempts, localMistakeIds } from "@/lib/ca-attempts";
import { loadProgress } from "@/lib/storage";
import { stateByCode } from "@/lib/states";
import { questionUpdatesEvent } from "@/lib/open-question-updates";
import { addUpdateReference, mergeUpdateReceipt, needsUpdatedReview, relatedUpdates, type RelatedUpdate, type UpdateReceipts, type UpdateRelation } from "@/lib/editorial-updates";

const guestKey = "notary-editorial-guest";
const guestAccountKey = "notary-editorial-guest-destination";
const receiptsKey = (account: string | null) => account ? `notary-editorial-outbox:${account}` : guestKey;
const states = [...new Set(editorialUpdates.map(event => event.state))];
type View = { account: string | null; updates: RelatedUpdate[]; receipts: UpdateReceipts };
type UpdateDialog = { kind: "notice"; rows: RelatedUpdate[] } | { kind: "list" } | { kind: "detail"; id: string };
type Detail = {
  questionId: string;
  reason: string;
  question: {
    stem: string;
    scenario?: string;
    answer: string;
    explanation: string;
    options: { text: string; feedback: string }[];
    evidence: string | null;
  } | null;
};

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
  const [view, setView] = useState<View | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [dialog, setDialog] = useState<UpdateDialog | null>(null);
  const panelFocus = useRef<HTMLDivElement>(null);
  const inflight = useRef<AbortController | null>(null);
  const memoryReceipts = useRef<UpdateReceipts>({});
  const lastAccount = useRef<string | null | undefined>(undefined);
  const isLearningPage = pathname === "/" || /account|practice|study|questions|wrong-answers/.test(pathname);

  const refresh = useCallback(async (requested = false) => {
    if ((!isLearningPage && !requested) || !editorialUpdates.length) return;
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
        if (lastAccount.current !== undefined) setDialog(null);
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
    function open(id?: string) {
      setDialog(id ? { kind: "detail", id } : { kind: "list" });
      void refresh(true);
    }
    const requested = (event: Event) => open((event as CustomEvent<string | undefined>).detail);
    window.addEventListener(questionUpdatesEvent, requested);
    const url = new URL(window.location.href);
    const legacy = url.searchParams.get("question-update");
    if (legacy) {
      url.searchParams.delete("question-update");
      window.history.replaceState(null, "", url);
      open(legacy === "list" ? undefined : legacy);
    }
    return () => window.removeEventListener(questionUpdatesEvent, requested);
  }, [pathname, refresh]);

  useEffect(() => {
    if (dialog && dialog.kind !== "notice") panelFocus.current?.focus();
  }, [dialog]);

  useEffect(() => {
    if (!isLearningPage || !view) return;
    const unseen = view.updates.filter(row => !view.receipts[row.id]?.shown);
    if (!unseen.length) return;
    let cancelled = false;
    let claiming = false;
    const safe = () => !document.querySelector("[data-editorial-quiz-active],dialog[open]");
    const offer = async () => {
      if (claiming || !safe()) return;
      if (!view.account) { setDialog(current => current ?? { kind: "notice", rows: unseen }); return; }
      claiming = true;
      try {
        const response = await fetch("/api/question-updates/", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ account: view.account, claim: unseen.map(row => row.id) }) });
        if (!response.ok || cancelled) return;
        const { claimed } = await response.json() as { claimed: string[] };
        if (safe() && !cancelled && claimed.length) {
          setDialog(current => current ?? { kind: "notice", rows: unseen.filter(row => claimed.includes(row.id)) });
        }
      } catch { /* The next successful refresh can retry the claim. */ }
      finally { claiming = false; }
    };
    if (!/practice|questions\//.test(pathname)) void offer();
    window.addEventListener("notary-quiz-finished", offer);
    return () => { cancelled = true; window.removeEventListener("notary-quiz-finished", offer); };
  }, [view, isLearningPage, pathname]);

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
    if (view.account) void refresh(true);
  }

  if (!dialog) return null;
  const notice = dialog.kind === "notice" ? dialog.rows : [];
  const kinds = [...new Set(notice.flatMap(row => row.relations))];
  const topics = [...new Set(notice.map(row => row.kind === "rule_change" ? "new rules" : row.kind === "replacement" ? "replacement questions" : "corrections"))];
  const count = new Set(notice.map(row => row.questionId)).size;
  const title = dialog.kind !== "notice" ? (dialog.kind === "detail" ? "Updated question" : "Question updates")
    : kinds.length === 1 && kinds[0] === "bookmarks" ? "Some of your saved questions have been updated"
      : "Some questions you’ve used have been updated";
  const unread = view?.updates.filter(row => !view.receipts[row.id]?.read) ?? [];
  const showList = () => setDialog({ kind: "list" });
  return (
    <MessageDialog title={title} className="question-updates-dialog" onShown={() => acknowledge(notice, false)} onClose={() => setDialog(null)}>
      {dialog.kind === "notice" ? <>
        <p>{count} updated {count === 1 ? "question affects" : "questions affect"} your {kinds.join(", ")}. This update includes {topics.join(", ")}. Review the current versions before practicing these topics again.</p>
        <ul>{[...grouped(notice)].map(([state, rows]) => <li key={state}>{stateByCode(state)?.name ?? state} · {rows.length}</li>)}</ul>
        <p>Your earlier attempts and bookmarks are preserved.</p>
        <div className="row">
          <button type="button" className="btn btn-primary" data-dialog-autofocus onClick={showList}>Review updates</button>
          <button type="button" className="btn btn-ghost" onClick={() => setDialog(null)}>Later</button>
        </div>
      </> : <div ref={panelFocus} className="question-updates-content" tabIndex={-1}>
        {dialog.kind === "detail" ? <>
          <button type="button" className="btn btn-ghost" onClick={showList}>Back to updates</button>
          <UpdateDetail key={dialog.id} id={dialog.id} />
        </> : !view ? <>
          <p role="status">{unavailable ? "Updates are temporarily unavailable." : "Loading your question updates…"}</p>
          {unavailable ? <button className="btn btn-ghost" type="button" onClick={() => void refresh(true)}>Retry</button> : null}
        </> : !view.updates.length ? <p>You have no related question updates.</p> : <>
          {unread.length ? <button type="button" className="btn btn-ghost" onClick={() => acknowledge(unread, true)}>Mark updates as read</button> : null}
          {[...grouped(view.updates)].map(([state, rows]) => <section key={state}>
            <h3>{stateByCode(state)?.name ?? state}</h3>
            <ul className="question-update-list">
              {rows.map(row => <li key={row.id}>
                <button type="button" className="question-update-row" onClick={() => {
                  acknowledge([row], true);
                  setDialog({ kind: "detail", id: row.id });
                }}>
                  <strong>{row.questionId.toUpperCase()} · {row.topic.replaceAll("-", " ")}</strong>
                  <time dateTime={row.date}>{row.date}</time>
                  <span>{row.reason}</span>
                </button>
              </li>)}
            </ul>
          </section>)}
        </>}
      </div>}
    </MessageDialog>
  );
}

function UpdateDetail({ id }: { id: string }) {
  const [detail, setDetail] = useState<Detail | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/question-updates/${encodeURIComponent(id)}/`, { signal: controller.signal, cache: "no-store" })
      .then(response => {
        if (!response.ok) throw new Error("Update unavailable");
        return response.json() as Promise<Detail>;
      })
      .then(value => setDetail(value))
      .catch(() => { if (!controller.signal.aborted) setFailed(true); });
    return () => controller.abort();
  }, [id]);
  if (!detail) return <p role="status">{failed ? "This update is unavailable right now." : "Loading the updated question…"}</p>;
  const q = detail.question;
  return <article>
    <h3>{detail.questionId.toUpperCase()}</h3>
    <p>{detail.reason}</p>
    {q ? <>
      <p><strong>{q.stem}</strong></p>
      {q.scenario ? <p>{q.scenario}</p> : null}
      <h4>Answer and reasoning</h4>
      <p><strong>{q.answer}</strong></p>
      <p>{q.explanation}</p>
      <h4>Option feedback</h4>
      <ul>{q.options.map(option => <li key={option.text}><strong>{option.text}</strong> {option.feedback}</li>)}</ul>
      {q.evidence ? <p><a href={q.evidence}>Official evidence</a></p> : null}
    </> : <p>This question requires Pro. Your earlier activity remains in your history.</p>}
  </article>;
}
