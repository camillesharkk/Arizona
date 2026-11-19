"use client";

import { fullStateReady } from "@/data/full-state-ready";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { packNavigationFor } from "@/lib/prep-navigation";
import { paths } from "@/lib/paths";
import type { LiveCode } from "@/lib/site-state";
import { ProAccessNote } from "@/components/ProAccessNote";
import { freeStateFeatures, isFreeState } from '@/lib/free-state-catalog';

export type HeaderUser = {
  email: string;
  plan: "free" | "pro";
  lifetimePro?: boolean;
  name: string | null;
  indianaPro?: boolean;
  indianaProExpiresAt?: string | null;
  planExpiresAt?: string | null;
  connecticutPro?: boolean;
  connecticutProExpiresAt?: string | null;
  ncPro?: boolean;
  ncPlanExpiresAt?: string | null;
};

export function accountTier(me: HeaderUser) {
  if (me.lifetimePro) return "lifetime";
  return me.plan === "pro" || me.indianaPro || me.connecticutPro || me.ncPro ? "pro" : "starter";
}

export function avatarInitial(name: string | null, email: string): string {
  const source = (name && name.trim()) || email || "?";
  const match = source.match(/\p{L}|\p{N}/u);
  return (match?.[0] || "?").toUpperCase();
}

export function AccountMenu({ me, onLogout, stateCode = null }: { me: HeaderUser; onLogout: () => void; stateCode?: LiveCode | null }) {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuId = "account-menu-dropdown";
  const isPro = Boolean(me.lifetimePro || (stateCode === "IN" ? me.indianaPro : stateCode === "NC" ? me.ncPro : stateCode === "CT" ? me.connecticutPro : me.plan === "pro"));
  const expiresAt = stateCode === "IN" ? me.indianaProExpiresAt : stateCode === "NC" ? me.ncPlanExpiresAt : stateCode === "CT" ? me.connecticutProExpiresAt : me.planExpiresAt;
  const pack = packNavigationFor(stateCode);
  const settingsHref = paths.studySettings + (stateCode ? "?state=" + stateCode : "");
  const pricing = pack ? pack.paths.pricing : stateCode === "HI" ? hiPaths.pricing : stateCode === "CA" ? caPaths.pricing : paths.pricing;
  const mistakes = pack ? pack.paths.mistakes : stateCode === "HI" ? hiPaths.mistakes : stateCode === "CA" ? caPaths.mistakes : paths.mistakes;
  const pricingLabel = stateCode === "HI" ? "Hawaii access" : stateCode === "CA" ? "California access" : isPro ? "Pro Access" : "Upgrade to Pro";
  const tier = accountTier(me);
  const planLabel = tier === "lifetime" ? "Lifetime Pro" : tier === "pro" ? "Pro" : "Free plan";

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
      if (e.key !== "Escape") return;
      if (rootRef.current?.contains(document.activeElement)) triggerRef.current?.focus();
      setOpen(false);
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
        ref={triggerRef}
        className={`avatar-btn avatar-${tier}`}
        type="button"
        aria-label={`Open account menu (${planLabel})`}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((v) => !v)}
      >
        {tier !== "starter" ? <img className="avatar-art" src={`/membership/${tier}-crown.webp`} width={30} height={17} alt="" /> : null}
        <span>{avatarInitial(me.name, me.email)}</span>
      </button>
      {open && (
        <nav className="account-dropdown" id={menuId} aria-label="Account menu">
          <div className="account-dropdown-id">
            {me.name?.trim() ? <p className="account-menu-name">{me.name.trim()}</p> : null}
            <p className="account-dropdown-email">{me.email}</p>
            <p className="account-plan-row">
              <span className={`badge account-tier-${tier}`}>{planLabel}</span>
            </p>
            {isPro && (me.lifetimePro || expiresAt) ? (
              <p className="notice" style={{ margin: "6px 0 0" }}>
                <ProAccessNote plan="pro" lifetimePro={me.lifetimePro} planExpiresAt={expiresAt} compact purchaseEnabled={!isFreeState(stateCode) || freeStateFeatures[stateCode]?.purchase !== false} />
              </p>
            ) : null}
          </div>
          <div className="account-menu-sep" role="separator" />
          <Link href={paths.dashboard} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <Link href={stateCode ? mistakes : "/"} onClick={() => setOpen(false)}>
            Wrong Answers
          </Link>
          <Link href={settingsHref} onClick={() => setOpen(false)}>
            Study Settings
          </Link>
          <Link href={stateCode && stateCode !== "AZ" ? `${paths.account}?state=${stateCode}` : paths.account} onClick={() => setOpen(false)}>
            Account Settings
          </Link>
          <Link href={paths.referrals} onClick={() => setOpen(false)}>
            Invite & Credits
          </Link>
          <Link href={paths.billing} onClick={() => setOpen(false)}>
            Billing & Access
          </Link>
          {(!isFreeState(stateCode) || (fullStateReady[stateCode] && freeStateFeatures[stateCode]?.purchase !== false)) ? <Link href={stateCode ? pricing : "/"} onClick={() => setOpen(false)}>{pricingLabel}</Link> : null}
          <div className="account-menu-sep" role="separator" />
          <button className="account-signout" type="button" onClick={onLogout}>
            Sign out
          </button>
          <Link className="account-delete-link" href={paths.accountDelete} onClick={() => setOpen(false)}>
            Delete Account
          </Link>
        </nav>
      )}
    </div>
  );
}
