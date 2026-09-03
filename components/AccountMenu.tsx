"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { paths } from "@/lib/paths";

export type HeaderUser = {
  email: string;
  plan: "free" | "pro";
  name: string | null;
};

export function avatarInitial(name: string | null, email: string): string {
  const source = (name && name.trim()) || email || "?";
  const match = source.match(/\p{L}|\p{N}/u);
  return (match?.[0] || "?").toUpperCase();
}

export function AccountMenu({ me, onLogout }: { me: HeaderUser; onLogout: () => void }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = "account-menu-dropdown";
  const isPro = me.plan === "pro";
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
          </div>
          <div className="account-menu-sep" role="separator" />
          <Link role="menuitem" href={paths.dashboard} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link role="menuitem" href={paths.mistakes} onClick={() => setOpen(false)}>
            Wrong Answers
          </Link>
          <Link role="menuitem" href={paths.account} onClick={() => setOpen(false)}>
            Account Settings
          </Link>
          <Link role="menuitem" href={paths.referrals} onClick={() => setOpen(false)}>
            Invite & Credits
          </Link>
          <Link role="menuitem" href={paths.billing} onClick={() => setOpen(false)}>
            Billing & Access
          </Link>
          <Link role="menuitem" href={paths.pricing} onClick={() => setOpen(false)}>
            {isPro ? "Pro Access" : "Upgrade to Pro"}
          </Link>
          <div className="account-menu-sep" role="separator" />
          <button className="account-signout" type="button" role="menuitem" onClick={onLogout}>
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
