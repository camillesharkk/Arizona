"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { currentEmail, loginAccount, logout, registerAccount, subscribeAuth } from "@/lib/account";
import { loadProgress, subscribeProgress } from "@/lib/storage";

export function AccountClient() {
  const [email, setEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<"register" | "login">("register");
  const [formEmail, setFormEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(loadProgress());

  useEffect(() => {
    setEmail(currentEmail());
    setProgress(loadProgress());
    const offAuth = subscribeAuth(() => {
      setEmail(currentEmail());
      setProgress(loadProgress());
    });
    const offProgress = subscribeProgress(() => setProgress(loadProgress()));
    return () => {
      offAuth();
      offProgress();
    };
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const result = mode === "register" ? await registerAccount(formEmail, password) : await loginAccount(formEmail, password);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    if (mode === "register") {
      const { trackEvent } = await import("@/lib/analytics");
      trackEvent("sign_up");
    }
    setPassword("");
  }

  if (email) {
    return (
      <div className="grid grid-2">
        <section className="card">
          <p className="kicker">Free account</p>
          <h2>{email}</h2>
          <p>Study data stays in this browser. Only learning progress is stored—no extra personal profile.</p>
          <div className="row">
            <Link className="btn btn-primary" href="/arizona/wrong-answers/">
              Open Wrong Answers
            </Link>
            <button
              className="btn btn-ghost"
              type="button"
              onClick={() => {
                logout();
                setEmail(null);
                setProgress(loadProgress());
              }}
            >
              Sign out
            </button>
          </div>
        </section>
        <section className="card">
          <h3>Saved progress</h3>
          <p>
            Last score: {progress.lastScore == null ? "—" : `${progress.lastScore}%`}
            {progress.lastMode ? ` · ${progress.lastMode}` : ""}
          </p>
          <p>Wrong answers: {progress.wrongIds.length}</p>
          <p>Flagged / favorites: {progress.flaggedIds.length}</p>
          <p>Answered: {progress.answeredIds.length}</p>
          <p>Resume question: {progress.lastQuestionId ?? "none yet"}</p>
          {progress.scores[0] && (
            <p className="notice">
              Latest attempt {progress.scores[0].score}% on {progress.scores[0].at.slice(0, 10)}
            </p>
          )}
          <Link href="/arizona/exam-questions/">Continue last practice</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-2">
      <form className="card" onSubmit={submit}>
        <div className="filter-row">
          <button className={`chip ${mode === "register" ? "on" : ""}`} type="button" onClick={() => setMode("register")}>
            Create Free Account
          </button>
          <button className={`chip ${mode === "login" ? "on" : ""}`} type="button" onClick={() => setMode("login")}>
            Sign in
          </button>
        </div>
        <label className="field">
          Email
          <input
            type="email"
            required
            autoComplete="email"
            value={formEmail}
            onChange={(e) => setFormEmail(e.target.value)}
          />
        </label>
        <label className="field">
          Password
          <input
            type="password"
            required
            minLength={8}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? "Working…" : mode === "register" ? "Create Free Account" : "Sign in"}
        </button>
        <p className="notice">
          Password is hashed on this device. The account is for saving scores, the wrong-answer list,
          favorites, and your last question—not for sending data to a server.
        </p>
      </form>
      <aside className="card">
        <h3>What a free account keeps</h3>
        <ul>
          <li>Exam scores and last mode</li>
          <li>Wrong-answer notebook</li>
          <li>Flagged favorites</li>
          <li>Continue from the last question</li>
        </ul>
        <p>You can keep practicing without an account. Create one when you want that progress named and easier to reopen.</p>
      </aside>
    </div>
  );
}
