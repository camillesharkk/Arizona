"use client";

import { usePathname } from "next/navigation";
import { pathState } from "@/lib/site-state";
import { fetchAccount } from "@/lib/client-account";

import Link from "next/link";
import { useEffect, useState } from "react";
import { shouldInviteAccount, subscribeProgress } from "@/lib/storage";
import { paths } from "@/lib/paths";

export function AccountInvite({ compact }: { compact?: boolean }) {
  const pathname = usePathname();
  const state = pathState(pathname) || "AZ";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const sync = async () => {
      const me = await fetchAccount().then((r) => r.json()).catch(() => ({ user: null }));
      setShow(!me.user && shouldInviteAccount(state));
    };
    sync();
    return subscribeProgress(() => {
      sync();
    });
  }, [state]);

  if (!show) return null;

  return (
    <div className="card account-invite">
      <h3>Save this progress</h3>
      <p>
        {compact
          ? "Create a free account to keep wrong answers in the cloud."
          : "You have answered enough questions to keep a cloud notebook. Registration is optional until you want progress on every device."}
      </p>
      <Link className="btn btn-primary" href={state === "IN" ? `${paths.register}?next=${encodeURIComponent(pathname)}` : paths.register}>
        Create Free Account
      </Link>
    </div>
  );
}
