"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { MessageDialog } from "@/components/MessageDialog";
import { latestSiteUpdate } from "@/data/site-update";
import { paths } from "@/lib/paths";

function storageKey(userId: string) {
  return `notary-site-update:${latestSiteUpdate.version}:${userId}`;
}

function claimUpdate(key: string) {
  try {
    if (localStorage.getItem(key) === "seen") return false;
    localStorage.setItem(key, "seen");
    return true;
  } catch {
    // Keep the update manual when the browser can't remember that it was shown.
    return false;
  }
}

export function SiteAnnouncements({ userId, pathname, canAutoOpen }: {
  userId: string | null;
  pathname: string;
  canAutoOpen: boolean;
}) {
  const [dialog, setDialog] = useState<{ userId: string | null } | null>(null);

  useEffect(() => {
    if (!userId || !canAutoOpen) return;
    const key = storageKey(userId);
    let cancelled = false;
    function openIfUnseen() {
      if (cancelled || window.location.pathname !== pathname || document.querySelector("dialog[open]")) return;
      const query = new URLSearchParams(window.location.search);
      if (query.has("_ptxn") || query.has("txn")) return;
      if (claimUpdate(key)) setDialog({ userId });
    }
    // Serialize the check and write across tabs that share this account's storage.
    if (navigator.locks) void navigator.locks.request(key, openIfUnseen).catch(openIfUnseen);
    else openIfUnseen();
    return () => { cancelled = true; };
  }, [canAutoOpen, pathname, userId]);

  function dismiss() {
    setDialog(null);
  }

  const inHeader = pathname === "/";
  const trigger = (
    <button
      className={inHeader ? "btn btn-ghost header-update-trigger" : "btn btn-ghost"}
      type="button"
      aria-haspopup="dialog"
      onClick={() => {
        if (userId) claimUpdate(storageKey(userId));
        setDialog({ userId });
      }}
    >
      What’s new
    </button>
  );

  return (
    <>
      {inHeader ? trigger : (
        <aside className="site-update-bar" aria-label="Site announcements">
          <div className="wrap site-update-inner">
            <span>Site updates</span>
            {trigger}
          </div>
        </aside>
      )}
      {dialog && dialog.userId === userId && (
        <MessageDialog title="What’s new" onClose={dismiss}>
          <ul>
            {latestSiteUpdate.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}
          </ul>
          <p>Thanks for studying with us. Good luck on exam day. We’re rooting for you!</p>
          <p>Have an idea that would make studying easier? <Link href={paths.contact} onClick={dismiss}>Contact us</Link>.</p>
          <form method="dialog">
            <button className="btn btn-primary" type="submit" data-dialog-autofocus>Got it</button>
          </form>
        </MessageDialog>
      )}
    </>
  );
}
