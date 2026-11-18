"use client";

import Link from "next/link";
import { MessageDialog } from "@/components/MessageDialog";
import { latestSiteUpdate } from "@/data/site-update";
import { paths } from "@/lib/paths";

export function SiteAnnouncementDialog({ onClose }: { onClose: () => void }) {
  return (
    <MessageDialog title="What’s New" onClose={onClose}>
      <ul>
        {latestSiteUpdate.highlights.map(highlight => <li key={highlight}>{highlight}</li>)}
      </ul>
      <p>Thanks for studying with us. Good luck on exam day. We’re rooting for you!</p>
      <p>Have an idea that would make studying easier? <Link href={paths.contact} onClick={onClose}>Contact us</Link>.</p>
      <form method="dialog">
        <button className="btn btn-primary" type="submit" data-dialog-autofocus>Got it</button>
      </form>
    </MessageDialog>
  );
}
