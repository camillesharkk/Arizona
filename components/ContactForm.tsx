"use client";

import { useState } from "react";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferred, setPreferred] = useState<"Email" | "Phone">("Email");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        phone,
        preferred,
        message,
        website: honeypot,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setBusy(false);
    if (res.status === 429) {
      setError("Too many requests. Please wait a few minutes and try again.");
      return;
    }
    if (!res.ok) {
      setError(data.error || "Could not send your message. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return <p className="notice">Thanks. We received your message and will reply using the contact method you chose.</p>;
  }

  return (
    <form className="card" id="contact-form" onSubmit={submit}>
      <label className="hp-field" aria-hidden="true">
        Website
        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <label className="field">
        Name *
        <input required maxLength={100} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
      </label>
      <label className="field">
        Email *
        <input required type="email" maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      </label>
      <label className="field">
        Phone
        <input type="tel" maxLength={40} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
      </label>
      <label className="field">
        Preferred contact method *
        <select required value={preferred} onChange={(e) => setPreferred(e.target.value as "Email" | "Phone")}>
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
        </select>
      </label>
      <label className="field">
        Message *
        <textarea required maxLength={4000} value={message} onChange={(e) => setMessage(e.target.value)} />
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
