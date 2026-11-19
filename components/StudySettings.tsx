"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { paths } from "@/lib/paths";
import { packNavigationFor } from "@/lib/prep-navigation";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { useSearchParams } from "next/navigation";
import { useResolvedState, useSavedState } from "@/components/SavedState";
import { parseStateCookie } from '@/lib/site-state';

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
  stateCode?: string;
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

  const savedState = useResolvedState(useSavedState());
  const requested = useSearchParams().get("state");
  const state = parseStateCookie(requested) ?? savedState ?? 'AZ';

  const site = packNavigationFor(state)?.paths ?? (state === "CA" ? caPaths : state === "HI" ? hiPaths : paths);
  const [loadStatus, setLoadStatus] = useState<"loading" | "signed-out" | "error">("loading");

  useEffect(() => {
    let cancelled = false;
    setMessage("");
    setLoadStatus("loading");
    fetch(`/api/study-settings/?timeZone=${encodeURIComponent(zone)}&state=${state}`)
      .then(async (response) => {
        if (response.status === 401) {
          if (!cancelled) setLoadStatus("signed-out");
          return;
        }
        if (!response.ok) throw new Error("Could not load study settings.");
        const data = await response.json();
        if (!cancelled) setPayload({ ...data, stateCode: state });
      })
      .catch(() => { if (!cancelled) setLoadStatus("error"); });
    return () => { cancelled = true; };
  }, [zone, state]);

  if (!payload || payload.stateCode !== state) {
    const returnTo = encodeURIComponent(`${paths.studySettings}?state=${state}`);
    return (
      <div className="card">
        {loadStatus === "signed-out" ? <p><Link href={`${site.login}?next=${returnTo}`}>Sign in</Link> to manage your study plan.</p>
          : loadStatus === "error" ? <p role="alert">Could not load your study settings. Refresh the page to try again.</p>
          : <p>Loading study settings…</p>}
      </div>
    );
  }
  const settings = payload.settings;

  async function save(next: Partial<Settings> & { restore?: boolean }) {
    const data = await fetch(`/api/study-settings/?state=${state}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, ...next, timeZone: settings.timeZone || zone }),
    }).then((response) => response.json());
    if (data.error) setMessage(data.error);
    else {
      setPayload({ ...data, stateCode: state });
      setMessage("Saved");
    }
  }

  function toggleDay(day: number) {
    const weekdays = settings.weekdays.includes(day) ? settings.weekdays.filter((item) => item !== day) : [...settings.weekdays, day];
    save({ weekdays });
  }

  return (
    <section id="study-settings" className="card">
      <Link href={site.daily}>Back to Daily Study</Link>
      <h2>Your study plan</h2>
      <p>{payload.introduced} cards introduced · {payload.reviewed} reviews finished.</p>
      <p className="notice">
        Recommended today: {payload.recommended.newCards} new cards, {payload.recommended.newQuestions} new questions, {payload.recommended.reviews} reviews.
        {payload.projectedDate ? ` Estimated finish ${payload.projectedDate}.` : ""}
      </p>
      {payload.reason ? <p className="notice">{payload.reason}</p> : null}
      {payload.projectReason ? <p className="notice">{payload.projectReason}</p> : null}
      <div className="row">
        <button className={`chip ${settings.mode === "recommended" ? "on" : ""}`} type="button" aria-pressed={settings.mode === "recommended"} onClick={() => save({ mode: "recommended" })}>Recommended</button>
        <button className={`chip ${settings.mode === "custom" ? "on" : ""}`} type="button" aria-pressed={settings.mode === "custom"} onClick={() => save({ mode: "custom", newCards: settings.newCards ?? payload.recommended.newCards, newQuestions: settings.newQuestions ?? payload.recommended.newQuestions, reviewTarget: settings.reviewTarget ?? payload.recommended.reviews })}>Custom</button>
      </div>
      <label className="field">Target date
        <input type="date" value={settings.targetDate} onChange={(event) => save({ targetDate: event.target.value })} />
      </label>
      <div className="row">
        {DAYS.map((label, index) => (
          <button key={label} className={`chip ${settings.weekdays.includes(index) ? "on" : ""}`} type="button" aria-pressed={settings.weekdays.includes(index)} onClick={() => toggleDay(index)}>{label}</button>
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
      <p className="notice" role="status">{message}</p>
    </section>
  );
}
