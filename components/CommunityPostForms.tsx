"use client";

import { useActionState, useCallback, useEffect, useId, useRef, useState } from "react";
import { changeDiscussion, publishDiscussion } from "@/app/community-insights/actions";
import { EnglishForm } from "@/components/EnglishForm";

export function CommunityComposer({
  id, insightId, parentId, author, label,
}: {
  id: string;
  insightId: string | null;
  parentId: string | null;
  author: string;
  label: string;
}) {
  const [error, action, pending] = useActionState(publishDiscussion, "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const formId = useId();
  const needsTitle = insightId === null && parentId === null;
  return (
    <EnglishForm action={action} aria-labelledby={`${formId}-label`} className="community-composer">
      <p className="community-form-caption" id={`${formId}-label`}>{label}</p>
      <p className="community-meta" id={`${formId}-help`}>
        Posting publicly as {author}. Keep personal and exam identifying details private.
      </p>
      <input type="hidden" name="id" value={id} />
      {insightId !== null && <input type="hidden" name="insightId" value={insightId} />}
      {parentId !== null && <input type="hidden" name="parentId" value={parentId} />}
      {needsTitle && (
        <label className="field">
          Title (required)
          <input type="text" name="title" minLength={3} maxLength={100} required data-required-message="Enter a title."
            value={title} onChange={(event) => setTitle(event.target.value)} />
        </label>
      )}
      <label className="field">
        Message (required)
        <textarea name="body" minLength={3} maxLength={1600} rows={3} required data-required-message="Enter a message." aria-describedby={`${formId}-help`}
          value={body} onChange={(event) => setBody(event.target.value)} />
      </label>
      <button className="btn btn-primary" disabled={pending} type="submit">
        {pending ? "Posting…" : needsTitle ? "Post discussion" : label}
      </button>
      {error && <p className="form-error" role="alert">{error}</p>}
    </EnglishForm>
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
