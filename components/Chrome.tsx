"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { resetAnalyticsUser } from "@/lib/analytics";
import { paths } from "@/lib/paths";
import { caPaths, isCaliforniaPath, switchStateHref } from "@/lib/ca-site";
import { isComingSoonPath } from "@/lib/states";
import { AccountMenu, type HeaderUser } from "@/components/AccountMenu";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";
import { ProAccessNote } from "@/components/ProAccessNote";

type AuthStatus = "loading" | "signed-in" | "signed-out";

function active(pathname: string, href: string) {
  if (href === "/arizona-notary-exam/" || href === "/arizona/" || href === "/california/") {
    return pathname === href || pathname === "/arizona" || pathname === "/arizona/" || pathname === "/california" || pathname === "/california/";
  }
  return pathname === href || pathname.startsWith(href);
}

function navFor(pathname: string) {
  if (!isCaliforniaPath(pathname)) return paths;
  return {
    ...paths,
    home: caPaths.home,
    practice: caPaths.practice,
    questions: caPaths.questions,
    study: caPaths.study,
    studyCards: caPaths.studyCards,
    mistakes: caPaths.mistakes,
    daily: caPaths.daily,
    resources: caPaths.resources,
    laws: caPaths.laws,
    become: caPaths.become,
    pricing: caPaths.pricing,
    examPrep: caPaths.examGuide,
    passingScore: caPaths.passingScore,
    guidesIndex: caPaths.examGuide,
    flashcards: caPaths.studyCards,
  };
}

export function SiteHeader() {
  const pathname = usePathname() || "";
  const nav = navFor(pathname);
  const onCa = isCaliforniaPath(pathname);
  const onPicker = pathname === "/" || isComingSoonPath(pathname);
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
    window.location.href = onPicker ? "/" : nav.home;
  }

  const onHome = pathname === nav.home || pathname === "/";
  const study = [
    { href: nav.practice, label: "Practice Test" },
    { href: nav.questions, label: "Questions" },
    { href: nav.study, label: "Study Guide" },
    { href: nav.flashcards, label: "Flashcards" },
  ];
  const exam = [
    { href: nav.examPrep, label: "Exam Guide" },
    { href: nav.laws, label: "Laws" },
    { href: nav.become, label: "Become a Notary" },
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
          <Link href={onPicker ? "/" : nav.home} className="logo">
            <span className="logo-mark">{onPicker ? "N" : onCa ? "C" : "A"}</span>
            {onPicker ? "Notary Exam Prep" : onCa ? "California" : "Arizona Exam"}
          </Link>
          {onPicker ? null : (
            <nav className="state-switch" aria-label="State">
              <Link href={switchStateHref(pathname, "AZ")} aria-current={onCa ? undefined : "page"}>AZ</Link>
              <Link href={switchStateHref(pathname, "CA")} aria-current={onCa ? "page" : undefined}>CA</Link>
            </nav>
          )}
        </div>
        <nav className="nav nav-desktop" aria-label="Primary">
          {onPicker ? null : <Link href="/">Choose State</Link>}
          {onPicker ? null : (
          <>
          <Link href={nav.practice} className={active(pathname, nav.practice) ? "active" : ""}>
            Practice
          </Link>
          <Link href={nav.study} className={active(pathname, nav.study) ? "active" : ""}>
            Study Guide
          </Link>
          {onCa ? (
            <Link href={nav.mistakes} className={active(pathname, nav.mistakes) ? "active" : ""}>Wrong Answers</Link>
          ) : (
            <WrongAnswersLink className={active(pathname, nav.mistakes) ? "active" : ""} />
          )}
          <Link href={nav.daily} className={active(pathname, nav.daily) ? "active" : ""}>
            Daily Study
          </Link>
          <Link href={nav.resources} className={active(pathname, nav.resources) ? "active" : ""}>
            Resources
          </Link>
          <Link href={nav.laws} className={active(pathname, nav.laws) ? "active" : ""}>
            Laws
          </Link>
          </>
          )}
        </nav>
        <div className="header-right">
          {authStatus === "signed-out" && (
            <Link href={onCa ? `${paths.login}?next=${encodeURIComponent(pathname)}` : paths.login} className={`header-signin ${active(pathname, paths.login) ? "active" : ""}`}>
              Sign in
            </Link>
          )}
          {authStatus === "loading" && <span className="header-auth-placeholder" aria-hidden="true" />}
          {!onHome && !onPicker && (
            <Link className="btn btn-primary header-cta" href={nav.practice}>
              Start Free Test
            </Link>
          )}
          {authStatus === "signed-in" && me && <AccountMenu me={me} onLogout={logout} />}
          {!onHome && !onPicker && (
            <Link className="btn btn-primary bar" href={nav.practice}>
              Practice Test
            </Link>
          )}
        </div>
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <nav id="mobile-nav" className={open ? "nav-drawer open" : "nav-drawer"} aria-label="Mobile">
        {onPicker ? (
          <Link href="/">Choose State</Link>
        ) : (
          <nav className="state-switch state-switch-drawer" aria-label="State">
            <Link href={switchStateHref(pathname, "AZ")} aria-current={onCa ? undefined : "page"}>Arizona</Link>
            <Link href={switchStateHref(pathname, "CA")} aria-current={onCa ? "page" : undefined}>California</Link>
          </nav>
        )}
        {onPicker ? null : <Link href="/">Choose State</Link>}
        {onHome || onPicker ? null : (
          <Link className="btn btn-primary btn-wide drawer-start" href={nav.practice}>
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
        {onPicker ? null : <Link href={nav.daily}>Daily Study</Link>}
        {onPicker ? null : (
          <button className="chip" type="button" onClick={() => setStudyOpen((v) => !v)}>
            Study {studyOpen ? "▾" : "▸"}
          </button>
        )}
        {!onPicker && studyOpen && (
          <>
            {study.map((l) => (
              <Link key={l.href} href={l.href} className={active(pathname, l.href) ? "active" : ""}>
                {l.label}
              </Link>
            ))}
            {onCa ? (
              <Link href={nav.mistakes} className={active(pathname, nav.mistakes) ? "active" : ""}>Wrong Answers</Link>
            ) : (
              <WrongAnswersLink className={active(pathname, nav.mistakes) ? "active" : ""} />
            )}
            <Link href={nav.resources} className={active(pathname, nav.resources) ? "active" : ""}>
              Resources
            </Link>
          </>
        )}
        {onPicker ? null : (
          <button className="chip" type="button" onClick={() => setAccountOpen((v) => !v)}>
            Exam & career {accountOpen ? "▾" : "▸"}
          </button>
        )}
        {!onPicker && accountOpen &&
          exam.map((l) => (
            <Link key={l.href} href={l.href} className={active(pathname, l.href) ? "active" : ""}>
              {l.label}
            </Link>
          ))}
        {onPicker ? null : onCa ? <Link href={nav.examPrep}>Exam guide</Link> : <Link href={paths.courses}>Arizona Notary Courses</Link>}
        {authStatus === "signed-in" && me ? (
          <>
            <Link href={paths.dashboard}>Dashboard</Link>
            <Link href={paths.account}>Account Settings</Link>
            <Link href={paths.referrals}>Invite & Credits</Link>
            <Link href={paths.billing}>Billing & Access</Link>
            <Link href={onCa ? nav.pricing : paths.pricing}>{onCa ? "California access" : me.plan === "pro" ? "Pro Access" : "Upgrade to Pro"}</Link>
            <button className="btn btn-ghost btn-wide account-signout" type="button" onClick={logout}>
              Sign out
            </button>
            <Link href={paths.accountDelete} className="account-delete-link">
              Delete Account
            </Link>
          </>
        ) : authStatus === "signed-out" ? (
          <>
            <Link href={onCa ? `${paths.login}?next=${encodeURIComponent(pathname)}` : paths.login}>Sign in</Link>
            <Link href={onCa ? `${paths.register}?next=${encodeURIComponent(pathname)}` : paths.register}>Create Free Account</Link>
          </>
        ) : null}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const pathname = usePathname() || "";
  const nav = navFor(pathname);
  const onCa = isCaliforniaPath(pathname);
  const onPicker = pathname === "/" || isComingSoonPath(pathname);
  return (
    <footer className="footer">
      <div className="wrap footer-bar">
        <p className="footer-brand">{onPicker ? "Notary Exam Prep. Independent practice." : onCa ? "California Exam. Independent practice." : "Arizona Exam. Independent practice."}</p>
        <nav className="footer-links" aria-label="Help and legal">
          {onPicker ? <Link href="/">Choose State</Link> : (
            <>
          <Link href={nav.practice}>Practice Test</Link>
          <Link href={nav.questions}>Questions</Link>
          <Link href={nav.study}>Study Guide</Link>
          <Link href={nav.guidesIndex}>Exam guides</Link>
          <Link href={nav.passingScore}>Passing score</Link>
          <Link href={nav.mistakes}>Wrong Answers</Link>
            </>
          )}
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
