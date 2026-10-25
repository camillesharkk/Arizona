"use client";

import { useEffect, useMemo, useState } from "react";

type Settings = {
  mode: "recommended" | "custom";
  targetDate: string;
  weekdays: number[];
  newCards: number | null;
  newQuestions: number | null;
  reviewTarget: number | null;
  timeZone: string;
};

type Payload = {
  settings: Settings;
  recommended: { newCards: number; newQuestions: number; reviews: number };
  projectedDate: string | null;
  projectReason: string | null;
  introduced: number;
  reviewed: number;
  total: number;
  reason: string | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function StudySettings() {
  const zone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone || "America/Phoenix", []);
  const [payload, setPayload] = useState<Payload | null>(null);
  const [message, setMessage] = useState("");

  async function load() {
    const data = await fetch(`/api/study-settings/?timeZone=${encodeURIComponent(zone)}`).then((response) => response.json());
    if (!data.error) setPayload(data);
  }

  useEffect(() => {
    load();
  }, [zone]);

  if (!payload) return <section id="study-settings" className="card"><h2>Study Settings</h2><p className="notice">Sign in to save a study plan.</p></section>;
  const settings = payload.settings;

  async function save(next: Partial<Settings> & { restore?: boolean }) {
    const data = await fetch("/api/study-settings/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, ...next, timeZone: settings.timeZone || zone }),
    }).then((response) => response.json());
    if (data.error) setMessage(data.error);
    else {
      setPayload(data);
      setMessage("Saved");
    }
  }

  function toggleDay(day: number) {
    const weekdays = settings.weekdays.includes(day) ? settings.weekdays.filter((item) => item !== day) : [...settings.weekdays, day];
    save({ weekdays });
  }

  return (
    <section id="study-settings" className="card">
      <h2>Study Settings</h2>
      <p>{payload.introduced} cards introduced · {payload.reviewed} reviews finished.</p>
      <p className="notice">
        Recommended today: {payload.recommended.newCards} new cards, {payload.recommended.newQuestions} new questions, {payload.recommended.reviews} reviews.
        {payload.projectedDate ? ` Estimated finish ${payload.projectedDate}.` : ""}
      </p>
      {payload.reason ? <p className="notice">{payload.reason}</p> : null}
      {payload.projectReason ? <p className="notice">{payload.projectReason}</p> : null}
      <div className="row">
        <button className={`chip ${settings.mode === "recommended" ? "on" : ""}`} type="button" onClick={() => save({ mode: "recommended" })}>Recommended</button>
        <button className={`chip ${settings.mode === "custom" ? "on" : ""}`} type="button" onClick={() => save({ mode: "custom", newCards: settings.newCards ?? payload.recommended.newCards, newQuestions: settings.newQuestions ?? payload.recommended.newQuestions, reviewTarget: settings.reviewTarget ?? payload.recommended.reviews })}>Custom</button>
      </div>
      <label className="field">Target date
        <input type="date" value={settings.targetDate} onChange={(event) => save({ targetDate: event.target.value })} />
      </label>
      <div className="row">
        {DAYS.map((label, index) => (
          <button key={label} className={`chip ${settings.weekdays.includes(index) ? "on" : ""}`} type="button" onClick={() => toggleDay(index)}>{label}</button>
        ))}
      </div>
      {settings.mode === "custom" ? (
        <div className="row">
          <label className="field">New cards<input type="number" min={0} value={settings.newCards ?? 0} onChange={(event) => save({ newCards: Number(event.target.value) })} /></label>
          <label className="field">New questions<input type="number" min={0} value={settings.newQuestions ?? 0} onChange={(event) => save({ newQuestions: Number(event.target.value) })} /></label>
          <label className="field">Review goal<input type="number" min={0} value={settings.reviewTarget ?? 0} onChange={(event) => save({ reviewTarget: Number(event.target.value) })} /></label>
        </div>
      ) : null}
      <label className="field">Time zone
        <input value={settings.timeZone} onChange={(event) => save({ timeZone: event.target.value })} />
      </label>
      <button className="btn btn-ghost" type="button" onClick={() => save({ restore: true })}>Restore recommended amounts</button>
      {message ? <p className="notice">{message}</p> : null}
    </section>
  );
}
