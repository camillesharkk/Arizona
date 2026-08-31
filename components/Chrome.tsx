"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { paths } from "@/lib/paths";

type Me = { email: string; plan: "free" | "pro"; name: string | null } | null;

function active(pathname: string, href: string) {
  if (href === paths.home || href === paths.hub) return pathname === paths.home || pathname === paths.hub || pathname === "/arizona";
  return pathname === href || pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname() || "";
  const [open, setOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(true);
  const [accountOpen, setAccountOpen] = useState(true);
  const [me, setMe] = useState<Me>(null);

  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setMe(d.user))
      .catch(() => setMe(null));
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
    setMe(null);
    setOpen(false);
    window.location.href = paths.home;
  }

  const study = [
    { href: paths.practice, label: "Practice Test" },
    { href: paths.questions, label: "Questions" },
    { href: paths.study, label: "Study Guide" },
    { href: paths.flashcards, label: "Flashcards" },
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
          <Link href={paths.home} className={active(pathname, paths.home) ? "active" : ""}>
            Arizona Exam
          </Link>
          <Link href={paths.practice} className={active(pathname, paths.practice) ? "active" : ""}>
            Practice
          </Link>
          <Link href={paths.study} className={active(pathname, paths.study) ? "active" : ""}>
            Study Guide
          </Link>
          <Link href={paths.laws} className={active(pathname, paths.laws) ? "active" : ""}>
            Laws
          </Link>
          <Link href={paths.become} className={active(pathname, paths.become) ? "active" : ""}>
            Become a Notary
          </Link>
          {me ? (
            <Link href={paths.dashboard} className={active(pathname, paths.dashboard) ? "active" : ""}>
              {me.plan === "pro" ? "Pro Dashboard" : "Account"}
            </Link>
          ) : (
            <Link href={paths.login} className={active(pathname, paths.login) ? "active" : ""}>
              Sign in
            </Link>
          )}
          {me?.plan === "pro" && <span className="badge">Pro</span>}
          <Link className="btn btn-primary" href={paths.practice}>
            Start Free Test
          </Link>
        </nav>
        <Link className="btn btn-primary bar" href={paths.practice}>
          Practice Test
        </Link>
      </div>
      {open && <div className="nav-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />}
      <nav id="mobile-nav" className={open ? "nav-drawer open" : "nav-drawer"} aria-label="Mobile">
        <p className="kicker">{me ? me.email : "Guest"}{me?.plan === "pro" ? " · Pro" : ""}</p>
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
        {me ? (
          <>
            <Link href={paths.dashboard}>Dashboard</Link>
            <Link href={paths.mistakes}>Wrong Answers</Link>
            <Link href={paths.account}>Account</Link>
            <Link href={paths.pricing}>{me.plan === "pro" ? "Billing" : "Upgrade Pro"}</Link>
            <button className="btn btn-ghost btn-wide" type="button" onClick={logout}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <Link href={paths.login}>Sign in</Link>
            <Link href={paths.register}>Create Free Account</Link>
          </>
        )}
        <Link className="btn btn-primary btn-wide" href={paths.practice}>
          Practice Test
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-grid">
        <div>
          <strong>Arizona Exam</strong>
          <p>
            Independent study tool. This website is not affiliated with, endorsed by, or operated by the Arizona
            Secretary of State.
          </p>
        </div>
        <div>
          <strong>Study</strong>
          <p><Link href={paths.practice}>Practice Test</Link></p>
          <p><Link href={paths.questions}>Questions</Link></p>
          <p><Link href={paths.study}>Study Guide</Link></p>
          <p><Link href={paths.mistakes}>Wrong Answers</Link></p>
        </div>
        <div>
          <strong>Company</strong>
          <p><Link href={paths.privacy}>Privacy</Link></p>
          <p><Link href={paths.terms}>Terms</Link></p>
          <p><Link href={paths.affiliate}>Affiliate Disclosure</Link></p>
          <p><Link href={paths.disclaimer}>Disclaimer</Link></p>
          <p><Link href={paths.contact}>Contact</Link></p>
        </div>
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
