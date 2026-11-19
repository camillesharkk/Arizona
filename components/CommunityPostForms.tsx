"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import { changeDiscussion, publishDiscussion, reportDiscussion, saveCommunityNickname } from "@/app/community-insights/actions";
import { EnglishForm } from "@/components/EnglishForm";
import { communityLimits, communityReportReasons, type CommunityReportReason } from "@/lib/community-config";

type Draft = { id: string; title: string; body: string; submitted?: boolean };

function readDraft(key: string): Draft | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (value && typeof value.id === "string" && typeof value.title === "string" && typeof value.body === "string") {
      return { id: value.id, title: value.title, body: value.body, submitted: value.submitted === true };
    }
  } catch {
    // The composer still works if tab storage is unavailable.
  }
  return null;
}

function storeDraft(key: string, value: Draft | null) {
  try {
    if (value && (value.title || value.body)) sessionStorage.setItem(key, JSON.stringify(value));
    else sessionStorage.removeItem(key);
  } catch {
    // Keep the controlled form usable without tab storage.
  }
}

export function CommunityComposer({
  id, insightId, parentId, accountScope, hasNickname, banned, signIn, label,
}: {
  id: string;
  insightId: string | null;
  parentId: string | null;
  accountScope: string | null;
  hasNickname: boolean;
  banned: boolean;
  signIn: string;
  label: string;
}) {
  const router = useRouter();
  const draftTarget = "notary:community-draft:" + JSON.stringify([insightId, parentId]);
  const guestDraftKey = draftTarget + ":guest";
  const draftKey = draftTarget + ":" + (accountScope ?? "guest");
  const [draft, setDraft] = useState<Draft>({ id, title: "", body: "" });
  const initializedDraftKey = useRef<string | null>(null);
  const handled = useRef<Awaited<ReturnType<typeof publishDiscussion>> | null>(null);
  const [result, action, pending] = useActionState(publishDiscussion, { message: "" });
  const formId = useId();
  const needsTitle = insightId === null && parentId === null;
  const canPost = Boolean(accountScope && hasNickname && !banned);
  const completed = Boolean(draft.submitted);
  const [dismissedResult, setDismissedResult] = useState<typeof result | null>(null);

  const [cooldown, setCooldown] = useState<{ result: typeof result; remaining: number } | null>(null);
  const remaining = cooldown?.result === result ? cooldown.remaining : result.retryAfterSeconds ?? 0;

  useEffect(() => {
    if (!result.retryAfterSeconds) return;
    const until = performance.now() + result.retryAfterSeconds * 1000;
    const tick = () => {
      const seconds = Math.max(0, Math.ceil((until - performance.now()) / 1000));
      setCooldown({ result, remaining: seconds });
      if (!seconds) window.clearInterval(timer);
    };
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [result]);

  useEffect(() => {
    if (initializedDraftKey.current === draftKey) return;
    initializedDraftKey.current = draftKey;
    const existing = readDraft(draftKey);
    const guest = accountScope ? readDraft(guestDraftKey) : null;
    setDraft(guest ?? existing ?? { id, title: "", body: "" });
    if (guest) {
      storeDraft(draftKey, guest);
      storeDraft(guestDraftKey, null);
    }
  }, [accountScope, draftKey, guestDraftKey, id]);

  useEffect(() => {
    if (!result.status || handled.current === result) return;
    handled.current = result;
    if (result.status === "published") {
      storeDraft(draftKey, null);
      setDraft({ id: crypto.randomUUID(), title: "", body: "" });
      if (result.href) router.push(result.href);
    } else {
      const retained = { ...draft, submitted: true };
      storeDraft(draftKey, retained);
      setDraft(retained);
    }
    router.refresh();
  }, [draft, draftKey, result, router]);

  function editDraft(changes: Partial<Draft>) {
    const next = { ...draft, ...changes };
    setDraft(next);
    storeDraft(draftKey, next);
  }

  function writeAnother() {
    storeDraft(draftKey, null);
    setDraft({ id: crypto.randomUUID(), title: "", body: "" });
    setDismissedResult(result);
  }

  return (
    <EnglishForm action={action} aria-labelledby={formId + "-label"} className="community-composer"
      onSubmit={(event) => {
        if (!canPost || pending || completed || remaining > 0) event.preventDefault();
      }}>
      <p className="community-form-caption" id={formId + "-label"}>{label}</p>
      <p className="community-meta" id={formId + "-help"}>
        Be respectful. No spam or suspicious links.{" "}
        <Link href="/community-insights/rules/">Community rules</Link>
      </p>
      <input type="hidden" name="id" value={draft.id} />
      {insightId !== null && <input type="hidden" name="insightId" value={insightId} />}
      {parentId !== null && <input type="hidden" name="parentId" value={parentId} />}
      {needsTitle && (
        <label className="field">
          Title (required)
          <input type="text" name="title" minLength={3} maxLength={communityLimits.postTitleMax} required data-required-message="Enter a title."
            value={draft.title} readOnly={completed || pending} onChange={(event) => editDraft({ title: event.target.value })} />
        </label>
      )}
      <label className="field">
        Message (required)
        <textarea name="body" minLength={3} maxLength={communityLimits.postBodyMax} rows={3} required data-required-message="Enter a message."
          aria-describedby={formId + "-help"} value={draft.body} readOnly={completed || pending}
          onChange={(event) => editDraft({ body: event.target.value })} />
      </label>
      {completed ? <button className="btn btn-ghost" type="button" onClick={writeAnother}>Write another message</button>
        : banned ? null
        : !accountScope ? <Link className="btn btn-primary" href={signIn}>Sign in to post</Link>
        : !hasNickname ? <a className="btn btn-primary" href="#community-nickname">Set a nickname to post</a>
        : <button className="btn btn-primary" disabled={pending || remaining > 0} type="submit">
          {pending ? "Posting…" : needsTitle ? "Post discussion" : parentId ? "Post reply" : "Post comment"}
        </button>}
      <p className={result.message && !result.status ? "form-error" : "community-meta"} role="status">
        {result.retryAfterSeconds ? (
          remaining > 0 ? <>
            <span className="visually-hidden">{result.message}</span>
            <span aria-hidden="true">Posting limit reached. Try again in {remaining} {remaining === 1 ? "second" : "seconds"}.</span>
          </> : "You can post again."
        ) : (result !== dismissedResult && result.message) || (completed ? "This draft was submitted for review." : "")}
      </p>
    </EnglishForm>
  );
}

export function CommunityNickname({ nickname }: { nickname: string | null }) {
  const router = useRouter();
  const labelId = useId();
  const [value, setValue] = useState(nickname ?? "");
  const [result, action, pending] = useActionState(async (_previous: { message: string; ok: boolean }, form: FormData) => {
    const message = await saveCommunityNickname("", form);
    if (!message) router.refresh();
    return { message: message || "Nickname saved.", ok: !message };
  }, { message: "", ok: false });
  const form = (
    <EnglishForm action={action} aria-labelledby={labelId} className="community-profile-form">
      <label className="field" id={labelId}>
        {nickname ? "Public nickname" : "Choose a public nickname"}
        <input id="community-nickname" autoComplete="nickname" name="nickname" type="text" minLength={communityLimits.nicknameMin} maxLength={communityLimits.nicknameMax}
          value={value} required readOnly={pending} onChange={(event) => setValue(event.target.value)}
          aria-describedby={labelId + "-hint"} />
      </label>
      <p className="community-meta" id={labelId + "-hint"}>Use {communityLimits.nicknameMin}–{communityLimits.nicknameMax} characters and keep personal details private.</p>
      <button className="btn btn-ghost" type="submit" disabled={pending}>{pending ? "Saving…" : "Save nickname"}</button>
      <p className={result.ok ? "community-meta" : "form-error"} role="status">{result.message}</p>
    </EnglishForm>
  );
  if (!nickname) return form;
  return (
    <details className="community-report">
      <summary>Change nickname ({nickname})</summary>
      {form}
    </details>
  );
}

const reportLabels = {
  spam: "Spam",
  harassment: "Harassment",
  scam: "Suspicious link or scam",
  other: "Other",
} satisfies Record<CommunityReportReason, string>;

export function CommunityReport({ id, initiallyOpen }: { id: string; initiallyOpen: boolean }) {
  const labelId = useId();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [result, action, pending] = useActionState(reportDiscussion, { message: "", ok: false });
  return (
    <details className="community-report" open={initiallyOpen || undefined}>
      <summary>Report</summary>
      {!result.ok && (
        <EnglishForm action={action} aria-labelledby={labelId} className="community-report-form">
          <input type="hidden" name="id" value={id} />
          <fieldset>
            <legend id={labelId}>Why are you reporting this message?</legend>
            {communityReportReasons.map((value) => (
              <label key={value} className="community-report-choice">
                <input type="radio" name="reason" value={value} required checked={reason === value} disabled={pending}
                  data-required-message="Choose a report reason." onChange={() => setReason(value)} />
                {reportLabels[value]}
              </label>
            ))}
          </fieldset>
          <label className="field">
            Additional details (optional)
            <textarea name="note" rows={2} maxLength={communityLimits.reportNoteMax} value={note} readOnly={pending}
              onChange={(event) => setNote(event.target.value)} />
          </label>
          <button type="submit" className="btn btn-ghost" disabled={pending}>{pending ? "Sending…" : "Send report"}</button>
        </EnglishForm>
      )}
      <p className={result.ok ? "community-meta" : "form-error"} role="status">{result.message}</p>
    </details>
  );
}

export function CommunityLike({ id, liked, likes, target, insight = false }: {
  id: string;
  liked: boolean;
  likes: number;
  target: string;
  insight?: boolean;
}) {
  const [error, action, pending] = useActionState(changeDiscussion, "");
  const countId = useId();
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="kind" value={insight ? "insight-like" : "like"} />
      <input type="hidden" name="value" value={liked ? "off" : "on"} />
      <button className={`btn btn-ghost${liked ? " is-on" : ""}`} type="submit" aria-pressed={liked} disabled={pending}
        aria-label={`Like ${target}`} aria-describedby={countId}>
        Like <span aria-hidden="true">· {likes}</span>
      </button>
      <span id={countId} className="visually-hidden">{likes} {likes === 1 ? "like" : "likes"}</span>
      {error && <p className="form-error" role="alert">{error}</p>}
    </form>
  );
}

export function CommunityShare({ href, label = "Copy insight link" }: { href: string; label?: string }) {
  const link = useRef<HTMLAnchorElement>(null);
  const linkId = useId();
  const [status, setStatus] = useState("");
  const [manual, setManual] = useState(false);
  const copy = useCallback(async () => {
    const url = link.current?.href;
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setStatus("Link copied.");
    } catch {
      setManual(true);
      setStatus("Could not copy automatically. The shareable link is below.");
    }
  }, []);
  useEffect(() => {
    if (!("CommandEvent" in window)) return;
    const target = link.current;
    target?.addEventListener("command", copy);
    return () => target?.removeEventListener("command", copy);
  }, [copy]);
  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(""), 3000);
    return () => clearTimeout(timer);
  }, [status]);
  return (
    <div>
      <button className="btn btn-ghost" type="button" {...{ command: "--copy", commandfor: linkId }}
        onClick={() => { if (!("CommandEvent" in window)) void copy(); }}>
        {label}
      </button>
      <span className="community-meta" role="status">{status}</span>
      <a ref={link} id={linkId} href={href} hidden={!manual}>Open shareable insight link</a>
      <noscript><a href={href}>Open shareable insight link</a></noscript>
    </div>
  );
}

export function CommunityRemove({ id, root }: { id: string; root: boolean }) {
  const [error, action, pending] = useActionState(changeDiscussion, "");
  return (
    <details className="community-remove">
      <summary>Delete my {root ? "post" : "reply"}</summary>
      {root && <p className="community-meta">This removes the post and hides its replies.</p>}
      <form action={action}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="kind" value="remove" />
        <button className="btn btn-danger" type="submit" disabled={pending}>{pending ? "Removing…" : "Confirm deletion"}</button>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </details>
  );
}
