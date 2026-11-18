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
  const isLearningPage = /(?:\/practice(?:-test)?|-practice-test|\/daily-study)\/?$/.test(pathname);

  useEffect(() => {
    if (!userId || isLearningPage || seenInPage.current.has(userId) || hasSeenUpdate(userId)) return;
    setDialog({ userId });
  }, [isLearningPage, pathname, userId]);

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

  const inHeader = pathname === "/";
  const trigger = (
    <button
      className={inHeader ? "btn btn-ghost header-update-trigger" : "btn btn-ghost"}
      type="button"
      aria-haspopup="dialog"
      onClick={() => setDialog({ userId })}
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
