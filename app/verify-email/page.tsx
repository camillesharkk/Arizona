"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { paths } from "@/lib/paths";

const VERIFY_EMAIL_KEY = "az_verify_email";

function maskEmail(email: string) {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.indexOf("@");
  if (at <= 0) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at);
  return `${local.slice(0, 1)}***${domain}`;
}

function Inner() {
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sent = params.get("sent") === "1";
  const token = params.get("token");

  useEffect(() => {
    if (token) {
      window.location.href = `/api/auth/verify/?token=${encodeURIComponent(token)}`;
      return;
    }
    const stored = sessionStorage.getItem(VERIFY_EMAIL_KEY) || "";
    setEmail(stored);
  }, [token]);

  async function resend() {
    if (!email) {
      setError("Enter the email you used to register, then try again from the sign-in page.");
      return;
    }
    setBusy(true);
    setError("");
    setInfo("");
    const res = await fetch("/api/auth/resend-verification/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (res.status === 429) {
      setError(data.error || "Please wait before requesting another email.");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Could not send email. Please try again.");
      return;
    }
    setInfo("If that email still needs verification, a new link is on the way.");
  }

  if (token) return <p>Verifying email…</p>;

  return (
    <section className="card">
      <h2>Check your email</h2>
      {sent ? (
        <p>
          We sent a verification link to:
          <br />
          <strong>{email ? maskEmail(email) : "your email address"}</strong>
        </p>
      ) : (
        <p>Open the verification link from your email, or request a new one below.</p>
      )}
      <p>Verify your email to finish creating your account.</p>
      <p className="notice">Verification links expire in 24 hours.</p>
      <p>Didn&apos;t get the email?</p>
      {error && <p className="form-error">{error}</p>}
      {info && <p className="notice">{info}</p>}
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn btn-primary" type="button" disabled={busy} onClick={resend}>
          {busy ? "Sending…" : "Resend verification email"}
        </button>
        <Link className="btn btn-ghost" href={paths.register}>
          Back to registration
        </Link>
      </div>
    </section>
  );
}

export default function VerifyEmail() {
  return (
    <main className="wrap hero">
      <h1>Email verification</h1>
      <Suspense fallback={<p>Loading…</p>}>
        <Inner />
      </Suspense>
    </main>
  );
}
