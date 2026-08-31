"use client";

import { useState } from "react";
import { validateContactInput, type ContactFieldErrors, type PreferredContact } from "@/lib/contact-validation";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [preferred, setPreferred] = useState<PreferredContact>("Email");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [fields, setFields] = useState<ContactFieldErrors>({});
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  function clearField(key: keyof ContactFieldErrors) {
    setFields((f) => {
      if (!f[key]) return f;
      const next = { ...f };
      delete next[key];
      return next;
    });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const checked = validateContactInput({ name, email, phone, preferred, message });
    if (!checked.ok) {
      setFields(checked.errors);
      setBusy(false);
      return;
    }
    setFields({});
    setBusy(true);
    const res = await fetch("/api/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: checked.data.name,
        email: checked.data.email,
        phone: checked.data.phone,
        preferred: checked.data.preferred,
        message: checked.data.message,
        website: honeypot,
        pageUrl: typeof window !== "undefined" ? window.location.href : "",
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: ContactFieldErrors };
    setBusy(false);
    if (res.status === 429) {
      setError("Too many requests. Please wait a few minutes and try again.");
      return;
    }
    if (!res.ok) {
      if (data.fields) setFields(data.fields);
      setError(data.error || "Could not send your message. Please try again.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return <p className="notice">Thanks. We received your message and will reply using the contact method you chose.</p>;
  }

  return (
    <form className="card" id="contact-form" onSubmit={submit} noValidate>
      <label className="hp-field" aria-hidden="true">
        Website
        <input value={honeypot} onChange={(e) => setHoneypot(e.target.value)} tabIndex={-1} autoComplete="off" />
      </label>
      <label className="field">
        Name *
        <input
          required
          maxLength={100}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearField("name");
          }}
          autoComplete="name"
        />
        {fields.name && <span className="field-error">{fields.name}</span>}
      </label>
      <label className="field">
        Email *
        <input
          required
          type="email"
          maxLength={254}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            clearField("email");
          }}
          autoComplete="email"
        />
        {fields.email && <span className="field-error">{fields.email}</span>}
      </label>
      <label className="field">
        Phone *
        <input
          required
          type="tel"
          maxLength={30}
          value={phone}
          onChange={(e) => {
            setPhone(e.target.value);
            clearField("phone");
          }}
          autoComplete="tel"
        />
        {fields.phone && <span className="field-error">{fields.phone}</span>}
      </label>
      <label className="field">
        Preferred contact method *
        <select
          required
          value={preferred}
          onChange={(e) => {
            setPreferred(e.target.value as PreferredContact);
            clearField("preferred");
            clearField("phone");
          }}
        >
          <option value="Email">Email</option>
          <option value="Phone">Phone</option>
        </select>
        {fields.preferred && <span className="field-error">{fields.preferred}</span>}
      </label>
      <label className="field">
        Message *
        <textarea
          required
          maxLength={4000}
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);
            clearField("message");
          }}
        />
        {fields.message && <span className="field-error">{fields.message}</span>}
      </label>
      {error && <p className="form-error">{error}</p>}
      <button className="btn btn-primary" type="submit" disabled={busy}>
        {busy ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
