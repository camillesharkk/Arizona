"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { MessageDialog } from "@/components/MessageDialog";
import { latestSiteUpdate } from "@/data/site-update";
import { paths } from "@/lib/paths";

function storageKey(userId: string) {
  return `notary-site-update:${latestSiteUpdate.version}:${userId}`;
}

function hasSeenUpdate(userId: string) {
  try {
    return localStorage.getItem(storageKey(userId)) === "seen";
  } catch {
    return false;
  }
}

export function SiteAnnouncements({ userId, pathname }: { userId: string | null; pathname: string }) {
  const [dialog, setDialog] = useState<{ userId: string | null } | null>(null);
  const seenInPage = useRef(new Set<string>());
  const isPracticePage = /(?:\/practice(?:-test)?|-practice-test)\/?$/.test(pathname);

  useEffect(() => {
    if (!userId || isPracticePage || seenInPage.current.has(userId) || hasSeenUpdate(userId)) return;
    setDialog({ userId });
  }, [isPracticePage, pathname, userId]);

  function dismiss() {
    if (userId) {
      seenInPage.current.add(userId);
      try {
        localStorage.setItem(storageKey(userId), "seen");
      } catch {
        // Remember this dismissal in the current page when storage is unavailable.
      }
    }
    setDialog(null);
  }

  return (
    <>
      <aside className="site-update-bar" aria-label="Site announcements">
        <div className="wrap site-update-inner">
          <span>Site updates</span>
          <button className="btn btn-ghost" type="button" aria-haspopup="dialog" onClick={() => setDialog({ userId })}>
            What’s new
          </button>
        </div>
      </aside>
      {dialog && dialog.userId === userId && (
        <MessageDialog title="What’s new" onClose={dismiss}>
          <ul>
            {latestSiteUpdate.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}
          </ul>
          <p>We hope you enjoy the updates. Happy studying!</p>
          <p>Have a suggestion? <Link href={paths.contact} onClick={dismiss}>Contact us</Link>.</p>
          <form method="dialog">
            <button className="btn btn-primary" type="submit" data-dialog-autofocus>Got it</button>
          </form>
        </MessageDialog>
      )}
    </>
  );
}
