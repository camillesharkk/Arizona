"use client";

import { fullStateSummary } from "@/data/full-state-summary";

import { isFreeState } from "@/lib/free-state-catalog";
import { stateByCode } from "@/lib/states";
import { fetchAccount, invalidateAccountRead } from "@/lib/client-account";
import { syncGuestProgress } from "@/lib/ca-sync";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { resetAnalyticsUser } from "@/lib/analytics";
import { paths } from "@/lib/paths";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { packNavigationFor } from "@/lib/prep-navigation";
import { useResolvedState } from "@/components/SavedState";
import type { LiveCode } from "@/lib/site-state";
import { AccountMenu, type HeaderUser } from "@/components/AccountMenu";
import { StateMenu } from "@/components/StateMenu";
import { WrongAnswersLink } from "@/components/WrongAnswersLink";

type AuthStatus = "loading" | "signed-in" | "signed-out";

function active(pathname: string, href: string) {
  if (href === "/arizona-notary-exam/" || href === "/arizona/" || href === "/california/" || href === "/hawaii/") {
    return pathname === href || pathname === "/arizona" || pathname === "/arizona/" || pathname === "/california" || pathname === "/california/" || pathname === "/hawaii" || pathname === "/hawaii/";
  }
  return pathname === href || pathname.startsWith(href);
}

function navFor(state: LiveCode | null) {
  const source = packNavigationFor(state)?.paths || (state === "CA" ? caPaths : state === "HI" ? hiPaths : null);
  if (!source) return paths;
  return {
    ...paths,
    home: source.home,
    practice: source.practice,
    questions: source.questions,
    study: source.study,
    studyCards: source.studyCards,
    mistakes: source.mistakes,
    daily: source.daily,
    resources: source.resources,
    laws: source.laws,
    become: source.become,
    pricing: source.pricing,
    examPrep: source.examGuide,
    passingScore: source.passingScore,
    guidesIndex: source.examGuide,
    flashcards: source.studyCards,
  };
}

function primaryLinks(nav: ReturnType<typeof navFor>) {
  return [
    { href: nav.practice, label: "Practice" },
    { href: nav.study, label: "Study Guide" },
    { href: nav.mistakes, label: "Wrong Answers" },
    { href: nav.daily, label: "Daily Study" },
    { href: nav.resources, label: "Resources" },
    { href: nav.laws, label: "Laws" },
  ];
}

function moreLinks(nav: ReturnType<typeof navFor>, state: LiveCode) {
  return [
    { href: nav.questions, label: "Questions" },
    { href: nav.flashcards, label: "Study cards" },
    { href: nav.examPrep, label: "Exam guide" },
    { href: nav.become, label: "Become a Notary" },
    ...(state === "AZ" ? [{ href: paths.courses, label: "Courses" }] : []),
  ];
}

export function SiteHeader({ savedState, indianaPreview = false }: { savedState: LiveCode | null; indianaPreview?: boolean }) {
  const pathname = usePathname() || "";
  const state = useResolvedState(savedState);
  const nav = navFor(state);
  const [openMore, setOpenMore] = useState(false);
  const [me, setMe] = useState<HeaderUser | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [returnTo, setReturnTo] = useState(pathname);

  useEffect(() => {
    let cancelled = false;
    const request = window.setTimeout(() => {
      fetchAccount()
        .then((r) => r.json())
        .then((d) => {
          if (cancelled) return;
          if (d.user) {
            void syncGuestProgress(d.user.id);
            setMe(d.user);
            setAuthStatus("signed-in");
          } else {
            setMe(null);
            setAuthStatus("signed-out");
          }
        })
        .catch(() => {
          if (!cancelled) setAuthStatus((prev) => (prev === "signed-in" ? prev : "signed-out"));
        });
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(request);
    };
  }, [pathname]);

  useEffect(() => setOpenMore(false), [pathname]);
  useEffect(() => setReturnTo(`${pathname}${window.location.search}`), [pathname]);
  useEffect(() => {
    if (state && state !== "AZ") document.documentElement.dataset.state = state;
    else delete document.documentElement.dataset.state;
  }, [state]);
  useEffect(() => {
    if (!openMore) return;
    function close(event: Event) {
      const target = event.target as Node | null;
      if (target && (target as Element).closest?.(".more-menu")) return;
      setOpenMore(false);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpenMore(false);
    }
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [openMore]);

  async function logout() {
    await fetch("/api/auth/logout/", { method: "POST" });
    invalidateAccountRead();
    void resetAnalyticsUser();
    setMe(null);
    setAuthStatus("signed-out");
    window.location.href = state ? nav.home : "/";
  }

  const onHome = Boolean(state) && (pathname === nav.home || pathname === `${nav.home.replace(/\/$/, "")}`);
  const signInHref = `${paths.login}?next=${encodeURIComponent(returnTo)}`;
  const links = state ? primaryLinks(nav) : [];
  const extra = state ? moreLinks(nav, state).filter(item => !isFreeState(state) || fullStateSummary[state]?.ready || item.label !== "Study cards") : [];

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <div className="header-left">
          <Link href={state ? nav.home : "/"} className="logo">
            <span className="logo-mark">{state === "IN" ? "I" : state === "CT" ? "C" : state === "CA" ? "C" : state === "HI" ? "H" : state === "NY" ? "Y" : state === "PA" ? "P" : state === "LA" ? "L" : state === "AZ" ? "A" : "N"}</span>
            {isFreeState(state) ? stateByCode(state)?.name : state === "IN" ? "Indiana" : state === "NC" ? "North Carolina" : state === "CT" ? "Connecticut" : state === "CA" ? "California" : state === "HI" ? "Hawaii" : state === "NY" ? "New York" : state === "PA" ? "Pennsylvania" : state === "LA" ? "Louisiana" : state === "AZ" ? "Arizona Exam" : "Notary Exam Prep"}
          </Link>
          <StateMenu pathname={pathname} current={state} indianaPreview={indianaPreview} />
        </div>
        {links.length ? <nav className="nav nav-desktop" aria-label="Primary">
          <div className="nav-scroll">
            {links.map((item) => item.label === "Wrong Answers" && state ? (
              <WrongAnswersLink key={item.href} href={item.href} stateCode={state} className={active(pathname, item.href) ? "active" : ""} />
            ) : (
              <Link key={item.href} href={item.href} className={active(pathname, item.href) ? "active" : ""}>
                {item.label}
              </Link>
            ))}
          </div>
          {extra.length ? (
            <div className="more-menu">
              <button className="more-btn" type="button" aria-expanded={openMore} onClick={() => setOpenMore((value) => !value)}>
                More
              </button>
              {openMore ? (
                <div className="more-panel" role="menu">
                  {extra.map((item) => (
                    <Link key={item.href} role="menuitem" href={item.href} className={active(pathname, item.href) ? "active" : ""}>
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}
        </nav> : null}
        <div className="header-right">
          {authStatus === "loading" && (
            <span className="header-auth-placeholder" role="status" aria-label="Loading account">
              <span className="spinner" aria-hidden="true" />
            </span>
          )}
          {authStatus === "signed-out" && (
            <Link href={signInHref} className={`header-signin ${active(pathname, paths.login) ? "active" : ""}`}>
              Sign in
            </Link>
          )}
          {state && !onHome && (
            <Link className="btn btn-primary header-cta" href={state === "IN" ? `${nav.practice}?mode=quick` : nav.practice}>
              Start Free Test
            </Link>
          )}
          {authStatus === "signed-in" && me && <AccountMenu me={me} onLogout={logout} stateCode={state} />}
        </div>
      </div>
    </header>
  );
}

export function SiteFooter({ savedState }: { savedState: LiveCode | null }) {
  const state = useResolvedState(savedState);
  const nav = navFor(state);
  return (
    <footer className="footer">
      <div className="wrap footer-bar">
        <p className="footer-brand">{state === "CA" ? "California Exam. Independent practice." : state === "HI" ? "Hawaii Exam. Independent practice." : state === "AZ" ? "Arizona Exam. Independent practice." : "Notary Exam Prep. Independent practice."}</p>
        <nav className="footer-links" aria-label="Help and legal">
          {state ? (
            <>
              <Link href={nav.practice}>Practice Test</Link>
              <Link href={nav.questions}>Questions</Link>
              <Link href={nav.study}>Study Guide</Link>
              <Link href={nav.guidesIndex}>Exam guides</Link>
              <Link href={nav.passingScore}>Passing score</Link>
              <Link href={nav.mistakes}>Wrong Answers</Link>
            </>
          ) : (
            <Link href="/">Choose another state</Link>
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
