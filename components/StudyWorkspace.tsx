"use client";

import Link from "next/link";
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { AccountMenu, accountTier, type HeaderUser } from "@/components/AccountMenu";
import { StateMenu } from "@/components/StateMenu";
import { stateByCode } from "@/lib/states";
import { isFreeState } from "@/lib/free-state-catalog";
import type { LiveCode } from "@/lib/site-state";
import { paths } from "@/lib/paths";

const glyphs = {
  practice: "M9 5l11 7-11 7z",
  guide: "M4 5h6a2 2 0 012 2v13a3 3 0 00-3-3H4zm16 0h-6a2 2 0 00-2 2v13a3 3 0 013-3h5z",
  questions: "M5 6h14M5 12h14M5 18h14",
  cards: "M5 7h15v12H5zM8 4h10M8 11h8",
  daily: "M4 6h16v14H4zM4 10h16M8 4v4m8-4v4m-8 8 2 2 4-4",
  wrong: "M12 3a9 9 0 100 18 9 9 0 000-18zm-3 6 6 6m0-6-6 6",
  star: "m12 3 2.7 5.5 6 .9-4.4 4.2 1 6L12 17l-5.3 2.6 1-6-4.4-4.2 6-.9z",
  people: "M3 5h18v12H9l-5 4v-4H3zM7 10h10m-10 3h7",
  rules: "M6 3h12v18H6zM9 8h6m-6 4h6m-6 4h4",
  updates: "M12 8v4l3 2M3 12a9 9 0 109-9M3 4v8h8",
  account: "M12 4a4 4 0 100 8 4 4 0 000-8zM4 21a8 8 0 1116 0",
  contact: "M3 5h18v14H3zm0 1 9 7 9-7",
  collapse: "M4 4h16v16H4zm5 0v16m7-11-3 3 3 3",
  menu: "M3 6h18M3 12h18M3 18h18",
  close: "m6 6 12 12M18 6 6 18",
  progress: "M4 19h16M7 16v-4m5 4V8m5 8V4",
} as const;

type IconName = keyof typeof glyphs;
type Item = { href: string; label: string; icon: IconName };
type StudyPaths = Record<"home" | "practice" | "study" | "questions" | "studyCards" | "daily" | "mistakes" | "examPrep" | "become" | "laws" | "resources" | "pricing", string>;
type Props = {
  pathname: string;
  state: LiveCode | null;
  nav: StudyPaths;
  indianaPreview: boolean;
  initialCollapsed: boolean;
  brand: ReactNode;
  user: HeaderUser | null;
  loading: boolean;
  signInHref: string;
  onLogout: () => void;
  onQuestionUpdates: () => void;
  onAnnouncements: () => void;
};

function Icon({ name }: { name: IconName }) {
  return <svg className="study-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={glyphs[name]} /></svg>;
}

export function usesStudyWorkspace(path: string) {
  return path !== "/" && !/^\/(?:admin|login|register|forgot-password|reset-password|verify-email)(?:\/|$)/.test(path);
}

function matches(path: string, href: string) {
  const clean = href.split("?")[0].replace(/\/$/, "");
  if (href === paths.practice && ["/arizona/practice-test", paths.practiceFree.slice(0, -1)].includes(path.replace(/\/$/, ""))) return true;
  if (href === paths.questions && /^\/arizona\/(?:questions\/|exam-questions\/?$)/.test(path)) return true;
  if (href === paths.study && path.replace(/\/$/, "") === "/arizona/study-guide") return true;
  if (href === paths.mistakes && path.replace(/\/$/, "") === "/arizona/wrong-answers") return true;
  if (href === paths.pricing && path.startsWith("/lifetime/")) return true;
  return path.replace(/\/$/, "") === clean || path.startsWith(clean + "/");
}

function Group({ label, icon, initialOpen, children }: { label: string; icon: IconName; initialOpen: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(initialOpen);
  useEffect(() => { if (initialOpen) setOpen(true); }, [initialOpen]);
  const id = useId();
  return <div className="study-group">
    <button className="study-item study-disclosure" type="button" aria-expanded={open} aria-controls={id} title={label} onClick={() => setOpen(!open)}>
      <Icon name={icon} /><span className="study-label">{label}</span><span className="study-chevron" aria-hidden="true">⌄</span>
    </button>
    <div className="study-group-content" id={id} hidden={!open}>{children}</div>
  </div>;
}

export function StudyWorkspace(props: Props) {
  const { pathname, state, nav, indianaPreview, brand, user, loading, signInHref } = props;
  const params = useSearchParams();
  const [collapsed, setCollapsed] = useState(props.initialCollapsed);
  const [open, setOpen] = useState(false);
  useLayoutEffect(() => {
    setCollapsed(document.cookie.split("; ").includes("np_sidebar=1"));
  }, []);
  const drawer = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const drawerId = useId();
  const stateName = state ? stateByCode(state)?.name : undefined;
  const favorites = params.get("view") === "favorites";
  const inNotebook = matches(pathname, nav.mistakes);
  const learning: Item[] = state ? [
    { href: nav.practice, label: "Practice", icon: "practice" },
    { href: nav.study, label: "Study Guide", icon: "guide" },
    ...(nav.questions !== nav.practice ? [{ href: nav.questions, label: "Question Bank", icon: "questions" as const }] : []),
    ...(nav.studyCards !== nav.study ? [{ href: nav.studyCards, label: "Study Cards", icon: "cards" as const }] : []),
    { href: nav.daily, label: "Daily Study", icon: "daily" },
  ] : [{ href: "/#state-selection", label: "Choose a state to practice", icon: "practice" }];
  const resources: Item[] = state ? [
    { href: nav.examPrep, label: "Exam Guide", icon: "guide" },
    { href: nav.become, label: "Become a Notary", icon: "account" },
    { href: nav.laws, label: "Laws & Rules", icon: "rules" },
    { href: nav.resources, label: "Resources", icon: "cards" },
    ...(state === "AZ" ? [{ href: paths.courses, label: "Courses", icon: "questions" as const }] : []),
  ] : [];
  const community: Item = { href: paths.community, label: "Community Insights", icon: "people" };
  const contact: Item = { href: paths.contact, label: "Contact Us", icon: "contact" };
  const tier = user ? accountTier(user) : "starter";
  const planHref = tier !== "starter" ? paths.billing : state && (!isFreeState(state) || nav.pricing !== nav.home) ? nav.pricing : paths.pricing;
  const plan: Item = { href: planHref, label: tier === "lifetime" ? "Lifetime Pro" : tier === "pro" ? "Pro access" : "Pro plans", icon: "star" };
  const progress: Item = { href: paths.dashboard, label: "Progress", icon: "progress" };
  const account: Item = { href: user ? paths.account : signInHref, label: user ? "Account" : "Sign in", icon: "account" };
  const activeResource = resources.some(item => matches(pathname, item.href)) || Boolean(state && /\/guides\//.test(pathname));
  const currentResource = resources.find(item => matches(pathname, item.href))?.href ?? (activeResource ? nav.examPrep : "");
  const current = inNotebook ? favorites ? "Favorites" : "Wrong Answers" :
    [...learning, ...resources, community, contact, plan, progress, account].find(item => matches(pathname, item.href))?.label ??
    (pathname.startsWith("/account/") ? "Account" : pathname.startsWith("/legal/") ? "Legal" : "Study workspace");

  function close() { if (drawer.current?.open) drawer.current.close(); }

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 851px)");
    function resize() { if (desktop.matches) close(); }
    desktop.addEventListener("change", resize);
    return () => desktop.removeEventListener("change", resize);
  }, []);
  useEffect(() => { close(); }, [pathname, favorites]);

  function toggleSidebar() {
    const next = !collapsed;
    setCollapsed(next);
    document.cookie = "np_sidebar=" + (next ? "1" : "0") + "; Path=/; Max-Age=31536000; SameSite=Lax";
  }

  function link(item: Item, selected = matches(pathname, item.href), href = item.href) {
    return <Link key={item.href} className="study-item" href={href} prefetch={false} title={item.label}
      aria-current={selected ? "page" : undefined} aria-label={item.label}>
      <Icon name={item.icon} /><span className="study-label">{item.label}</span>
    </Link>;
  }

  const reviewHref = (href: string) => !loading && !user && !inNotebook ? paths.login + "?next=" + encodeURIComponent(href) : href;

  function sidebar(mobile: boolean) {
    return <>
      <div className="study-sidebar-top">
        <div className="study-brand-row">
          <Link className="study-brand" href="/" title="Notary Exam Prep" aria-label="Notary Exam Prep">{brand}<span className="study-label">Notary Exam Prep</span></Link>
          {mobile && <button type="button" className="study-icon-button" aria-label="Close navigation" onClick={close} data-drawer-close><Icon name="close" /></button>}
        </div>
        <StateMenu key={mobile ? String(open) : "desktop"} pathname={pathname} current={state} indianaPreview={indianaPreview} workspace favorites={favorites} />
      </div>
      <nav className="study-menu-list" aria-label="Study navigation" onClick={mobile ? event => {
        const anchor = (event.target as Element).closest("a[href]");
        if (anchor && !event.defaultPrevented && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close();
      } : undefined}>
        {learning.map(item => link(item))}
        {state && <div className="study-nav-section">
          <p className="study-nav-heading">Your review</p>
          {link({ href: nav.mistakes, label: "Wrong Answers", icon: "wrong" }, inNotebook && !favorites, reviewHref(nav.mistakes))}
          {link({ href: nav.mistakes + "?view=favorites", label: "Favorites", icon: "star" }, inNotebook && favorites, reviewHref(nav.mistakes + "?view=favorites"))}
        </div>}
        {link(progress)}
        <div className="study-nav-section"><p className="study-nav-heading">Community</p>{link(community)}</div>
        {resources.length > 0 && <Group label="Exam & resources" icon="rules" initialOpen={activeResource}>{resources.map(item => link(item, currentResource === item.href))}</Group>}
        <Group label="Updates" icon="updates" initialOpen={pathname.startsWith("/question-updates/")}>
          <button className="study-item" type="button" title="Question Updates" aria-haspopup="dialog" onClick={() => { if (mobile) close(); props.onQuestionUpdates(); }}><Icon name="questions" /><span className="study-label">Question Updates</span></button>
          <button className="study-item" type="button" title="What’s New" aria-haspopup="dialog" onClick={() => { if (mobile) close(); props.onAnnouncements(); }}><Icon name="updates" /><span className="study-label">What’s New</span></button>
        </Group>
      </nav>
      <div className="study-sidebar-bottom" onClick={mobile ? event => {
        if ((event.target as Element).closest("a[href]") && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close();
      } : undefined}>
        {link(plan)}
        {loading ? <span className="study-account-loading" role="status"><span className="spinner" aria-hidden="true" /><span className="study-label">Loading account</span></span> : link(account, !matches(pathname, planHref) && matches(pathname, account.href))}
        {user && !mobile && <button className="study-item" type="button" title="Sign out" onClick={props.onLogout}><Icon name="account" /><span className="study-label">Sign out</span></button>}
        {link(contact)}
        {!mobile && <button type="button" className="study-item study-collapse" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} title={collapsed ? "Expand sidebar" : "Collapse sidebar"} aria-expanded={!collapsed} onClick={toggleSidebar}><Icon name="collapse" /><span className="study-label">Collapse sidebar</span></button>}
      </div>
    </>;
  }

  return <>
    <aside className="study-sidebar" data-collapsed={collapsed ? "true" : undefined} aria-label="Study workspace">{sidebar(false)}</aside>
    <header className="study-topbar">
      <button type="button" ref={trigger} className="study-icon-button" aria-label="Open study navigation" aria-haspopup="dialog" aria-controls={drawerId} aria-expanded={open}
        onClick={() => { if (!drawer.current?.open) { drawer.current?.showModal(); drawer.current?.querySelector<HTMLButtonElement>("[data-drawer-close]")?.focus(); setOpen(true); } }}><Icon name="menu" /></button>
      <div className="study-mobile-context"><strong>{current}</strong><span>{stateName ?? "Notary Exam Prep"}</span></div>
      {user ? <AccountMenu me={user} onLogout={props.onLogout} stateCode={state} /> : loading ? <span role="status" aria-label="Loading account" className="spinner" /> : <Link className="header-signin" href={signInHref}>Sign in</Link>}
    </header>
    <dialog ref={drawer} id={drawerId} aria-label="Study navigation" className="study-drawer"
      onClose={() => { setOpen(false); if (trigger.current?.getClientRects().length) trigger.current.focus({ preventScroll: true }); }}
      onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="study-drawer-inner" onClick={event => {
        if (!event.defaultPrevented && (event.target as Element).closest(".study-sidebar-top a[href]") && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close();
      }}>{sidebar(true)}</div>
    </dialog>
  </>;
}
