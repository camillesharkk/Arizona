"use client";

import { fetchAccount, invalidateAccountRead } from "@/lib/client-account";
import { syncGuestProgress } from "@/lib/ca-sync";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { resetAnalyticsUser } from "@/lib/analytics";
import { paths } from "@/lib/paths";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { packNavigationFor } from "@/lib/prep-navigation";
import { useResolvedState } from "@/components/SavedState";
import type { LiveCode } from "@/lib/site-state";
import { useSetMemberCopy } from "@/components/MemberCopy";
import { AccountMenu, accountTier, type HeaderUser } from "@/components/AccountMenu";
import { SiteAnnouncementDialog } from "@/components/SiteAnnouncements";
import { openQuestionUpdates } from "@/lib/open-question-updates";
import { StudyWorkspace, usesStudyWorkspace } from "@/components/StudyWorkspace";

type AuthStatus = "loading" | "signed-in" | "signed-out";

function BrandMark({ size, lazy = false }: { size: 26 | 36; lazy?: boolean }) {
  return (
    <img
      className="logo-mark"
      src="/images/brand/notary-study-emblem-36.webp"
      srcSet="/images/brand/notary-study-emblem-36.webp 1x, /images/brand/notary-study-emblem-72.webp 2x"
      width={size}
      height={size}
      alt=""
      loading={lazy ? "lazy" : undefined}
    />
  );
}

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

export function SiteHeader({ savedState, indianaPreview = false, initialCollapsed = false }: { savedState: LiveCode | null; indianaPreview?: boolean; initialCollapsed?: boolean }) {
  const pathname = usePathname() || "";
  const state = useResolvedState(savedState);
  const nav = navFor(state);
  const [openMore, setOpenMore] = useState(false);
  const [announcementPath, setAnnouncementPath] = useState<string | null>(null);
  const morePanelId = useId();
  const moreButton = useRef<HTMLButtonElement>(null);
  const setMemberCopy = useSetMemberCopy();
  const [me, setMe] = useState<(HeaderUser & { id: string }) | null>(null);
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
            setMemberCopy(accountTier(d.user) !== "starter");
            setAuthStatus("signed-in");
          } else {
            setMe(null);
            setMemberCopy(false);
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
  }, [pathname, setMemberCopy]);

  useEffect(() => {
    setOpenMore(false);
    setAnnouncementPath(null);
  }, [pathname]);
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
      if (event.key !== "Escape") return;
      setOpenMore(false);
      if (moreButton.current?.parentElement?.contains(document.activeElement)) moreButton.current.focus();
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
    setMemberCopy(false);
    setAuthStatus("signed-out");
    window.location.href = state ? nav.home : "/";
  }

  const signInHref = `${paths.login}?next=${encodeURIComponent(returnTo)}`;
  const isNationalHome = pathname === "/";
  const announcement = announcementPath === pathname && (
    <SiteAnnouncementDialog onClose={() => {
      setAnnouncementPath(null);
      moreButton.current?.focus();
    }} />
  );

  if (usesStudyWorkspace(pathname)) return <>
    <StudyWorkspace pathname={pathname} state={state} nav={nav} indianaPreview={indianaPreview}
      initialCollapsed={initialCollapsed} brand={<BrandMark size={36} />} user={me}
      loading={authStatus === "loading"} signInHref={signInHref} onLogout={logout}
      onQuestionUpdates={openQuestionUpdates} onAnnouncements={() => setAnnouncementPath(pathname)} />
    {announcement}
  </>;
  const moreMenu = (
    <div className="more-menu">
      <button ref={moreButton} className="more-btn" type="button" aria-expanded={openMore}
        aria-controls={morePanelId} onClick={() => setOpenMore(value => !value)}>
        {isNationalHome ? "What’s More" : "More"}
      </button>
      <ul id={morePanelId} className="more-panel" role="list" hidden={!openMore}>
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => {
            setOpenMore(false);
            moreButton.current?.focus();
            openQuestionUpdates();
          }}>
            Question updates
          </button>
        </li>
        <li>
          <button type="button" aria-haspopup="dialog" onClick={() => {
            setOpenMore(false);
            setAnnouncementPath(pathname);
          }}>
            What’s New
          </button>
        </li>
      </ul>
    </div>
  );

  const header = (
    <header className={`site-header${pathname === "/" ? " national-header" : !state && active(pathname, paths.community) ? " community-guest-header" : ""}`}>
      <div className="wrap header-inner">
        <div className="header-left">
          <Link href="/" className="logo" aria-label="Notary Exam Prep">
            <BrandMark size={36} />
            <span className="logo-label">Notary Exam Prep</span>
          </Link>
        </div>
        {isNationalHome ? (
          <nav className="editorial-national-nav" aria-label="Primary">
            <a href="#state-selection">Practice</a>
            <a href="#community">Community Insights</a>
            <a href="#plans">Pro plans</a>
            <a href="#faq">FAQ</a>
          </nav>
        ) : null}
        <div className="header-right">
          {isNationalHome ? moreMenu : null}
          {isNationalHome ? <a className="editorial-state-link" href="#state-selection">Choose your state</a> : null}
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
          {authStatus === "signed-in" && me && <AccountMenu me={me} onLogout={logout} stateCode={state} />}
        </div>
      </div>
    </header>
  );

  return (
    <>
      {header}
      {announcement}
    </>
  );
}

export function SiteFooter({ savedState }: { savedState: LiveCode | null }) {
  const state = useResolvedState(savedState);
  const nav = navFor(state);
  return (
    <footer className="footer">
      <div className="wrap footer-bar">
        <p className="footer-brand"><BrandMark size={26} lazy />Notary Exam Prep. Independent practice.</p>
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
          <Link href={paths.community}>Community Insights</Link>
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
