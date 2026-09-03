"use client";

import { useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { PasswordField } from "@/components/PasswordField";

export function DeleteAccountClient({
  email,
  arizonaPro,
  planExpiresAt,
}: {
  email: string;
  arizonaPro: boolean;
  planExpiresAt: string | null;
}) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/account/delete/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmation }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not delete account");
      return;
    }
    window.location.href = `${paths.home}?accountDeleted=1`;
  }

  return (
    <div className="card danger-zone">
      <p className="kicker">Danger zone</p>
      <h2>This action is permanent.</h2>
      <p>
        Deleting your account will remove access to your learning profile and end access to account-based features.
        Signed in as <strong>{email}</strong>.
      </p>
      <p>You will lose:</p>
      <ul>
        <li>Learning progress</li>
        <li>Wrong answers</li>
        <li>Favorites</li>
        <li>Device sessions</li>
        <li>Referral Credits</li>
        <li>Referral code</li>
        <li>Current Pro account access</li>
      </ul>
      {arizonaPro && planExpiresAt ? (
        <p>
          Your Pro access is currently active until: <strong>{new Date(planExpiresAt).toLocaleString()}</strong>
          <br />
          Deleting your account will end access to it.
        </p>
      ) : null}
      <p>
        Deleting your account does not automatically create or guarantee a refund. If you have an eligible unused
        purchase, request the refund before deleting your account.
      </p>
      <p>
        <Link href={paths.billing}>View Billing & Refund Eligibility</Link>
      </p>
      <p className="notice">
        New Member and one-time Referral discounts cannot be restored. Unused Referral Credits are forfeited and cannot
        be cashed out. Creating a new account with the same email will not restore those offers.
      </p>
      <p className="notice">
        If you signed in after a password reset and no longer know your current password, use Forgot Password to set a
        new password first, then return here.
      </p>
      <form onSubmit={submit}>
        <PasswordField
          label="Current password"
          name="password"
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
          showLabel="Show password"
          hideLabel="Hide password"
        />
        <label className="field">
          Type DELETE to confirm
          <input
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            placeholder="DELETE"
          />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-danger" type="submit" disabled={busy || confirmation !== "DELETE"}>
          {busy ? "Deleting…" : "Permanently delete account"}
        </button>
      </form>
    </div>
  );
}
