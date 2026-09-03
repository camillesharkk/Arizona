"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { PasswordField } from "@/components/PasswordField";

const VERIFY_EMAIL_KEY = "az_verify_email";

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
  const [referralCode, setReferralCode] = useState("");
  const [referralHint, setReferralHint] = useState<"idle" | "valid" | "invalid">("idle");
  const [token, setToken] = useState(initialToken);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [limitDevices, setLimitDevices] = useState<{ id: string; deviceLabel: string; lastSeenAt: string }[] | null>(null);
  const [revokeDeviceId, setRevokeDeviceId] = useState("");
  const [registerBlock, setRegisterBlock] = useState<"email-failed" | "unverified-exists" | null>(null);
  const [needVerify, setNeedVerify] = useState(false);

  useEffect(() => {
    if (mode !== "register") return;
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) setReferralCode(ref.toUpperCase());
  }, [mode]);

  useEffect(() => {
    if (mode !== "login") return;
    if (new URLSearchParams(window.location.search).get("verified") === "1") {
      setInfo("Email verified. You can sign in.");
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "register") return;
    const code = referralCode.trim();
    if (!code) {
      setReferralHint("idle");
      return;
    }
    const t = window.setTimeout(() => {
      fetch(`/api/referrals/validate/?code=${encodeURIComponent(code)}`)
        .then((r) => r.json())
        .then((d) => setReferralHint(d.valid ? "valid" : "invalid"))
        .catch(() => setReferralHint("idle"));
    }, 300);
    return () => window.clearTimeout(t);
  }, [mode, referralCode]);

  async function resendVerification() {
    setResendBusy(true);
    setError("");
    setInfo("");
    const res = await fetch("/api/auth/resend-verification/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setResendBusy(false);
    if (res.status === 429) {
      setError(data.error || "Please wait before requesting another email.");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Could not send email. Please try again.");
      return;
    }
    if (typeof window !== "undefined") sessionStorage.setItem(VERIFY_EMAIL_KEY, email.trim().toLowerCase());
    setInfo("If that email still needs verification, a new link is on the way.");
    if (data.verifyToken) setInfo(`Dev verify link token: ${data.verifyToken}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if ((mode === "register" || mode === "reset") && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    setRegisterBlock(null);
    setNeedVerify(false);
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
          : mode === "register"
            ? { email, password, name, referralCode: referralCode.trim() || undefined }
            : { email, password, name, ...(revokeDeviceId ? { revokeDeviceId } : {}) };
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      if (mode === "login" && data.code === "DEVICE_LIMIT_REACHED") {
        setLimitDevices(data.devices || []);
        setError(data.message || "Device limit reached");
        return;
      }
      if (mode === "login" && data.code === "TOO_MANY_DEVICE_CHANGES") {
        setError(data.message || "Too many new devices");
        return;
      }
      if (mode === "login" && data.code === "EMAIL_NOT_VERIFIED") {
        setNeedVerify(true);
        setError("Please verify your email before signing in.");
        return;
      }
      if (mode === "register" && data.code === "VERIFICATION_EMAIL_FAILED") {
        setRegisterBlock("email-failed");
        if (typeof window !== "undefined") sessionStorage.setItem(VERIFY_EMAIL_KEY, email.trim().toLowerCase());
        setError("Your account was created, but we could not send the verification email.");
        return;
      }
      if (mode === "register" && data.code === "ACCOUNT_EXISTS_UNVERIFIED") {
        setRegisterBlock("unverified-exists");
        if (typeof window !== "undefined") sessionStorage.setItem(VERIFY_EMAIL_KEY, email.trim().toLowerCase());
        setError("This account already exists but the email has not been verified.");
        return;
      }
      if (mode === "register" && data.code === "EMAIL_ALREADY_REGISTERED") {
        setError("Email already registered");
        return;
      }
      setError(data.error || "Request failed");
      return;
    }
    setLimitDevices(null);
    setRevokeDeviceId("");
    if (data.verifyToken) setInfo(`Dev verify link token: ${data.verifyToken}`);
    else if (data.resetToken) setInfo(`Dev reset token: ${data.resetToken}`);
    else if (mode === "forgot") setInfo("If that email is registered, a reset link is on the way.");
    if (mode === "login") {
      window.location.href = paths.dashboard;
      return;
    }
    if (mode === "register") {
      if (typeof window !== "undefined") sessionStorage.setItem(VERIFY_EMAIL_KEY, email.trim().toLowerCase());
      window.location.href = `${paths.verify}?sent=1`;
      return;
    }
    if (mode === "reset") setInfo("Password updated. You can sign in.");
  }

  const hideCreate = mode === "register" && registerBlock !== null;

  return (
    <form className="card" onSubmit={submit}>
      {(mode === "login" || mode === "register" || mode === "forgot") && (
        <label className="field">
          Email
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </label>
      )}
      {mode === "register" && !hideCreate && (
        <label className="field">
          Name (optional)
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
      )}
      {mode === "register" && !hideCreate && (
        <label className="field">
          Referral code (optional)
          <input
            value={referralCode}
            onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
            autoComplete="off"
            placeholder="AZ7KQ2MP"
          />
        </label>
      )}
      {mode === "register" && !hideCreate && (
        <p className="notice">
          Use a referral code to receive a one-time 10% discount on an eligible purchase. The discount does not expire,
          but can only be used once.
          {referralHint === "valid" ? " Code looks valid." : ""}
          {referralHint === "invalid" ? " This code is not valid." : ""}
        </p>
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
      {(mode === "register" || mode === "reset") && !hideCreate && (
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
      {mode === "login" && limitDevices && (
        <div className="card" style={{ marginBottom: 12 }}>
          <h2>Device limit reached</h2>
          <p>Your account can be active on up to 3 devices at a time. Remove a device, then sign in on this one.</p>
          {limitDevices.map((d) => (
            <label key={d.id} className="field">
              <input
                type="radio"
                name="revokeDevice"
                checked={revokeDeviceId === d.id}
                onChange={() => setRevokeDeviceId(d.id)}
              />{" "}
              {d.deviceLabel}
              <span className="notice">Last active: {new Date(d.lastSeenAt).toLocaleString()}</span>
            </label>
          ))}
        </div>
      )}
      {error && <p className="form-error">{error}</p>}
      {info && <p className="notice">{info}</p>}
      {registerBlock === "email-failed" && (
        <p className="notice">Do not create another account. Try sending the verification email again.</p>
      )}
      {registerBlock === "unverified-exists" && (
        <p className="notice">Use the verification email for this address instead of creating a new account.</p>
      )}
      {!hideCreate && (
        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy
            ? "Working…"
            : mode === "login"
              ? revokeDeviceId
                ? "Remove device and sign in"
                : "Sign in"
              : mode === "register"
                ? "Create Free Account"
                : mode === "forgot"
                  ? "Send reset link"
                  : "Set new password"}
        </button>
      )}
      {(needVerify || registerBlock) && (
        <button className="btn btn-ghost" type="button" disabled={resendBusy} onClick={resendVerification}>
          {resendBusy ? "Sending…" : "Resend verification email"}
        </button>
      )}
      <p className="notice">
        {mode === "login" && (
          <>
            <Link href={paths.register}>Create account</Link> · <Link href={paths.forgot}>Forgot password</Link>
          </>
        )}
        {mode === "register" && !hideCreate && <Link href={paths.login}>Already have an account?</Link>}
        {mode === "register" && (registerBlock === "unverified-exists" || error === "Email already registered") && (
          <>
            <Link href={paths.login}>Go to sign in</Link>
          </>
        )}
      </p>
    </form>
  );
}
