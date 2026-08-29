"use client";

import { useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";

export function AuthForm({ mode }: { mode: "login" | "register" | "forgot" | "reset" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setInfo("");
    const url =
      mode === "login"
        ? "/api/auth/login/"
        : mode === "register"
          ? "/api/auth/register/"
          : mode === "forgot"
            ? "/api/auth/forgot/"
            : "/api/auth/reset/";
    const payload =
      mode === "reset"
        ? { token, password }
        : mode === "forgot"
          ? { email }
          : { email, password, name };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Request failed");
      return;
    }
    if (data.verifyToken) setInfo(`Dev verify link token: ${data.verifyToken}`);
    if (data.resetToken) setInfo(`Dev reset token: ${data.resetToken}`);
    if (mode === "login" || mode === "register") window.location.href = paths.dashboard;
    else setInfo((info) => info || "Check your email. In development the token is shown here if Resend is not configured.");
  }

  return (
    <form className="card" onSubmit={submit}>
      {(mode === "login" || mode === "register" || mode === "forgot") && (
        <label className="field">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
      )}
      {mode === "register" && (
        <label className="field">
          Name (optional)
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      )}
      {mode === "reset" && (
        <label className="field">
          Reset token
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
        </label>
      )}
      {(mode === "login" || mode === "register" || mode === "reset") && (
        <label className="field">
          Password
          <input type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
      )}
      {error && <p className="form-error">{error}</p>}
      {info && <p className="notice">{info}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Working…" : mode === "login" ? "Sign in" : mode === "register" ? "Create Free Account" : mode === "forgot" ? "Send reset link" : "Set new password"}
      </button>
      <p className="notice">
        {mode === "login" && (
          <>
            <Link href={paths.register}>Create account</Link> · <Link href={paths.forgot}>Forgot password</Link>
          </>
        )}
        {mode === "register" && <Link href={paths.login}>Already have an account?</Link>}
      </p>
    </form>
  );
}
