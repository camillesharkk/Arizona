"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { packNavigationFor } from "@/lib/prep-navigation";
import { paths } from "@/lib/paths";
import type { LiveCode } from "@/lib/site-state";
import { ProAccessNote, formatProUntil } from "@/components/ProAccessNote";

export type HeaderUser = {
  email: string;
  plan: "free" | "pro";
  name: string | null;
  indianaPro?: boolean;
  indianaProExpiresAt?: string | null;
  planExpiresAt?: string | null;
  connecticutPro?: boolean;
  connecticutProExpiresAt?: string | null;
  ncPro?: boolean;
  ncPlanExpiresAt?: string | null;
};

export function avatarInitial(name: string | null, email: string): string {
  const source = (name && name.trim()) || email || "?";
  const match = source.match(/\p{L}|\p{N}/u);
  return (match?.[0] || "?").toUpperCase();
}

export function AccountMenu({ me, onLogout, stateCode = null }: { me: HeaderUser; onLogout: () => void; stateCode?: LiveCode | null }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = "account-menu-dropdown";
  const isPro = stateCode === "IN" ? Boolean(me.indianaPro) : stateCode === "NC" ? Boolean(me.ncPro) : stateCode === "CT" ? Boolean(me.connecticutPro) : me.plan === "pro";
  const expiresAt = stateCode === "IN" ? me.indianaProExpiresAt : stateCode === "NC" ? me.ncPlanExpiresAt : stateCode === "CT" ? me.connecticutProExpiresAt : me.planExpiresAt;
  const pack = packNavigationFor(stateCode);
  const settingsHref = `${paths.account}${stateCode && stateCode !== "AZ" ? `?state=${stateCode}` : ""}#study-settings`;
  const pricing = pack ? pack.paths.pricing : stateCode === "HI" ? hiPaths.pricing : stateCode === "CA" ? caPaths.pricing : paths.pricing;
  const mistakes = pack ? pack.paths.mistakes : stateCode === "HI" ? hiPaths.mistakes : stateCode === "CA" ? caPaths.mistakes : paths.mistakes;
  const pricingLabel = stateCode === "HI" ? "Hawaii access" : stateCode === "CA" ? "California access" : isPro ? "Pro Access" : "Upgrade to Pro";
  const initial = avatarInitial(me.name, me.email);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="account-menu" ref={rootRef}>
      <button
        className="avatar-btn"
        type="button"
        aria-label="Open account menu"
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {initial}
      </button>
      {open && (
        <div className="account-dropdown" id={menuId} role="menu" aria-label="Account menu">
          <div className="account-dropdown-id">
            {me.name?.trim() ? <p className="account-menu-name">{me.name.trim()}</p> : null}
            <p className="account-dropdown-email">{me.email}</p>
            <p className="account-plan-row">
              {isPro ? <span className="badge badge-pro">Pro</span> : <span className="badge">Free plan</span>}
            </p>
            {isPro && expiresAt ? (
              <p className="notice" style={{ margin: "6px 0 0" }}>
                <ProAccessNote plan={isPro ? "pro" : "free"} planExpiresAt={expiresAt} compact />
              </p>
            ) : null}
          </div>
          <div className="account-menu-sep" role="separator" />
          <Link role="menuitem" href={paths.dashboard} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link role="menuitem" href={stateCode ? mistakes : "/"} onClick={() => setOpen(false)}>
            Wrong Answers
          </Link>
          <Link role="menuitem" href={settingsHref} onClick={() => setOpen(false)}>
            Study Settings
          </Link>
          <Link role="menuitem" href={stateCode && stateCode !== "AZ" ? `${paths.account}?state=${stateCode}` : paths.account} onClick={() => setOpen(false)}>
            Account Settings
          </Link>
          <Link role="menuitem" href={paths.referrals} onClick={() => setOpen(false)}>
            Invite & Credits
          </Link>
          <Link role="menuitem" href={paths.billing} onClick={() => setOpen(false)}>
            Billing & Access
          </Link>
          {stateCode !== "CT" ? <Link role="menuitem" href={stateCode ? pricing : "/"} onClick={() => setOpen(false)}>{pricingLabel}</Link> : null}
          <div className="account-menu-sep" role="separator" />
          <button className="account-signout" type="button" role="menuitem" onClick={onLogout}>
            Sign out
          </button>
          <Link role="menuitem" className="account-delete-link" href={paths.accountDelete} onClick={() => setOpen(false)}>
            Delete Account
          </Link>
        </div>
      )}
    </div>
  );
}
