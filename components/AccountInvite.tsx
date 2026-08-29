"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { shouldInviteAccount, subscribeProgress } from "@/lib/storage";
import { paths } from "@/lib/paths";

export function AccountInvite({ compact }: { compact?: boolean }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = async () => {
      const me = await fetch("/api/auth/me/").then((r) => r.json()).catch(() => ({ user: null }));
      setShow(!me.user && shouldInviteAccount());
    };
    sync();
    return subscribeProgress(() => {
      sync();
    });
  }, []);

  if (!show) return null;

  return (
    <div className="card account-invite">
      <h3>Save this progress</h3>
      <p>
        {compact
          ? "Create a free account to keep wrong answers in the cloud."
          : "You have answered enough questions to keep a cloud notebook. Registration is optional until you want progress on every device."}
      </p>
      <Link className="btn btn-primary" href={paths.register}>
        Create Free Account
      </Link>
    </div>
  );
}
