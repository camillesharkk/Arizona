"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { resetAnalyticsUser } from "@/lib/analytics";
import { paths } from "@/lib/paths";
import { AccountMenu, type HeaderUser } from "@/components/AccountMenu";
import { ProAccessNote } from "@/components/ProAccessNote";

type AuthStatus = "loading" | "signed-in" | "signed-out";

function active(pathname: string, href: string) {
  if (href === paths.home || href === paths.hub) return pathname === paths.home || pathname === paths.hub || pathname === "/arizona";
  return pathname === href || pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(true);
  const [me, setMe] = useState<HeaderUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.user) {
          setMe(d.user);
          setAuthStatus("signed-in");
        } else {
          setMe(null);
          setAuthStatus("signed-out");
        }
      })
      .catch(() => {
        if (cancelled) return;
        setAuthStatus((prev) => (prev === "signed-in" ? prev : "signed-out"));
      });
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function logout() {
    await fetch("/api/auth/logout/", { method: "POST" });
    void resetAnalyticsUser();
    setMe(null);
    setAuthStatus("signed-out");
    setOpen(false);
    await resetAnalyticsUser();
    window.location.href = paths.home;
  }

  const onHome = pathname === paths.home || pathname === "/";
  const study = [
    { href: paths.practice, label: "Practice Test" },
    { href: paths.questions, label: "Questions" },
    { href: paths.study, label: "Study Guide" },
    { href: paths.flashcards, label: "Flashcards" },
    { href: paths.resources, label: "Resources" },
  ];
  const exam = [
    { href: paths.examPrep, label: "Exam Guide" },
    { href: paths.laws, label: "Laws" },
    { href: paths.become, label: "Become a Notary" },
  ];

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <div className="header-left">
          <button
            className="menu-btn"
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            <span className={open ? "menu-icon open" : "menu-icon"} />
          </button>
          <Link href={paths.home} className="logo">
            <span className="logo-mark">N</span>
            Arizona Exam
          </Link>
        </div>
        <nav className="nav nav-desktop" aria-label="Primary">
          <Link href={paths.practice} className={active(pathname, paths.practice) ? "active" : ""}>
            Practice
          </Link>
          <Link href={paths.study} className={active(pathname, paths.study) ? "active" : ""}>
            Study Guide
          </Link>
          <Link href={paths.resources} className={active(pathname, paths.resources) ? "active" : ""}>
            Resources
          </Link>
          <Link href={paths.laws} className={active(pathname, paths.laws) ? "active" : ""}>
            Laws
          </Link>
        </nav>
        <div className="header-right">
          {authStatus === "signed-out" && (
            <Link href={paths.login} className={`header-signin ${active(pathname, paths.login) ? "active" : ""}`}>
              Sign in
            </Link>
          )}
          {authStatus === "loading" && <span className="header-auth-placeholder" aria-hidden="true" />}
          {!onHome && (
            <Link className="btn btn-primary header-cta" href={paths.practice}>
              Start Free Test
            </Link>
          )}
          {authStatus === "signed-in" && me && <AccountMenu me={me} onLogout={logout} />}
          {!onHome && (
            <Link className="btn btn-primary bar" href={paths.practice}>
              Practice Test
            </Link>
          )}
        </div>
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <nav id="mobile-nav" className={open ? "nav-drawer open" : "nav-drawer"} aria-label="Mobile">
        {onHome ? null : (
          <Link className="btn btn-primary btn-wide drawer-start" href={paths.practice}>
            Practice Test
          </Link>
        )}
        {authStatus === "signed-in" && me ? (
          <div className="drawer-account">
            <p className="drawer-account-name">{me.name?.trim() || me.email}</p>
            {me.name?.trim() ? <p className="drawer-account-email">{me.email}</p> : null}
            <span className={me.plan === "pro" ? "badge badge-pro" : "badge"}>{me.plan === "pro" ? "Pro" : "Free"}</span>
            {me.plan === "pro" && me.planExpiresAt ? (
              <p className="notice">
                <ProAccessNote plan={me.plan} planExpiresAt={me.planExpiresAt} compact />
              </p>
            ) : null}
          </div>
        ) : authStatus === "loading" ? (
          <p className="kicker">Loading account…</p>
        ) : (
          <p className="kicker">Guest</p>
        )}
        <button className="chip" type="button" onClick={() => setStudyOpen((v) => !v)}>
          Study {studyOpen ? "▾" : "▸"}
        </button>
        {studyOpen &&
          study.map((l) => (
            <Link key={l.href} href={l.href} className={active(pathname, l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        <button className="chip" type="button" onClick={() => setAccountOpen((v) => !v)}>
          Exam & career {accountOpen ? "▾" : "▸"}
        </button>
        {accountOpen &&
          exam.map((l) => (
            <Link key={l.href} href={l.href} className={active(pathname, l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        <Link href={paths.courses}>Arizona Notary Courses</Link>
        {authStatus === "signed-in" && me ? (
          <>
            <Link href={paths.dashboard}>Dashboard</Link>
            <Link href={paths.mistakes}>Wrong Answers</Link>
            <Link href={paths.account}>Account Settings</Link>
            <Link href={paths.referrals}>Invite & Credits</Link>
            <Link href={paths.billing}>Billing & Access</Link>
            <Link href={paths.pricing}>{me.plan === "pro" ? "Pro Access" : "Upgrade to Pro"}</Link>
            <button className="btn btn-ghost btn-wide account-signout" type="button" onClick={logout}>
              Sign out
            </button>
            <Link href={paths.accountDelete} className="account-delete-link">
              Delete Account
            </Link>
          </>
        ) : authStatus === "signed-out" ? (
          <>
            <Link href={paths.login}>Sign in</Link>
            <Link href={paths.register}>Create Free Account</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-bar">
        <p className="footer-brand">Arizona Exam. Independent practice.</p>
        <nav className="footer-links" aria-label="Help and legal">
          <Link href={paths.practice}>Practice Test</Link>
          <Link href={paths.questions}>Questions</Link>
          <Link href={paths.study}>Study Guide</Link>
          <Link href={paths.guidesIndex}>Exam guides</Link>
          <Link href={paths.passingScore}>Passing score</Link>
          <Link href={paths.mistakes}>Wrong Answers</Link>
          <Link href={paths.privacy}>Privacy</Link>
          <Link href={paths.terms}>Terms</Link>
          <Link href={paths.refund}>Refund Policy</Link>
          <Link href={paths.affiliate}>Affiliate Disclosure</Link>
          <Link href={paths.disclaimer}>Disclaimer</Link>
          <Link href={paths.contact}>Contact</Link>
        </nav>
      </div>
    </footer>
  );
}

export function OfficialBadge({ verified, reference }: { verified: string; reference: string }) {
  return (
    <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
      <span className="badge">Official Source</span>
      <span className="badge badge-warn">Last verified {verified}</span>
      <span className="notice">{reference}</span>
    </div>
  );
}
