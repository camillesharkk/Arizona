"use client";

import { useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { PasswordField } from "@/components/PasswordField";

export function AuthForm({
  mode,
  initialToken = "",
}: {
  mode: "login" | "register" | "forgot" | "reset";
  initialToken?: string;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if ((mode === "register" || mode === "reset") && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
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
    else if (data.resetToken) setInfo(`Dev reset token: ${data.resetToken}`);
    else if (mode === "forgot") setInfo("If that email is registered, a reset link is on the way.");
    if (mode === "login") {
      window.location.href = paths.dashboard;
      return;
    }
    if (mode === "register") {
      if (data.verifyToken) return;
      window.location.href = `${paths.dashboard}?checkEmail=1`;
      return;
    }
    if (mode === "reset") setInfo("Password updated. You can sign in.");
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
      {mode === "reset" && !initialToken && (
        <label className="field">
          Reset token
          <input value={token} onChange={(e) => setToken(e.target.value)} required />
        </label>
      )}
      {mode === "reset" && initialToken && <input type="hidden" value={token} readOnly />}
      {mode === "login" && (
        <PasswordField
          label="Password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          showLabel="Show password"
          hideLabel="Hide password"
        />
      )}
      {(mode === "register" || mode === "reset") && (
        <>
          <PasswordField
            label="Password"
            name="password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            showLabel="Show password"
            hideLabel="Hide password"
          />
          <PasswordField
            label="Confirm Password"
            name="password_confirm"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            showLabel="Show confirm password"
            hideLabel="Hide confirm password"
          />
        </>
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
