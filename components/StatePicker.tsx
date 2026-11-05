"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MessageDialog } from "@/components/MessageDialog";
import {
  comingSoonPath,
  prepStates,
  recommendStates,
  stateByCode,
  stateLabel,
  statesByName,
  type PrepState,
  type StateRecommendation,
} from "@/lib/states";

type Notice = "denied" | "timeout" | "unsupported" | "failed" | "unlisted" | "outside" | null;

const noticeCopy: Record<Exclude<Notice, null>, string> = {
  denied: "Location permission was blocked. Choose a state below.",
  timeout: "Location lookup timed out. Choose a state below.",
  unsupported: "This browser can't share your location. Choose a state below.",
  failed: "We couldn't read that location. Choose a state below.",
  unlisted: "That location is in a state this site doesn't list yet. Choose a state below.",
  outside: "That location isn't in a listed U.S. state. Choose a state below.",
};

export function StatePicker() {
  const states = statesByName(prepStates);
  const [query, setQuery] = useState("");
  const [finding, setFinding] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [detected, setDetected] = useState<PrepState | null>(null);
  const [recommendation, setRecommendation] = useState<StateRecommendation | null>(null);
  const requestId = useRef(0);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return states;
    return states.filter((state) => state.name.toLowerCase().includes(term) || state.code.toLowerCase() === term);
  }, [query, states]);

  function cancelLocate() {
    requestId.current += 1;
    setFinding(false);
  }

  function locate() {
    if (finding) return;
    if (!navigator.geolocation) {
      setNotice("unsupported");
      return;
    }
    const id = ++requestId.current;
    setFinding(true);
    setNotice(null);
    setDetected(null);
    setRecommendation(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        void finishLocate(id, position.coords.latitude, position.coords.longitude);
      },
      (error) => {
        if (id !== requestId.current) return;
        setFinding(false);
        setNotice(error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "failed");
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
    );
  }

  async function finishLocate(id: number, latitude: number, longitude: number) {
    try {
      const response = await fetch("/api/locate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (id !== requestId.current) return;
      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        setNotice("failed");
        return;
      }
      if (data.match !== "us" || typeof data.code !== "string") {
        setNotice(data.match === "unlisted" ? "unlisted" : "outside");
        return;
      }
      const state = stateByCode(data.code);
      if (!state) {
        setNotice("unlisted");
        return;
      }
      if (state.status === "available" && state.homePath) {
        window.location.assign(state.homePath);
        return;
      }
      setDetected(state);
      setRecommendation(recommendStates(state));
    } catch {
      if (id === requestId.current) setNotice("failed");
    } finally {
      if (id === requestId.current) setFinding(false);
    }
  }

  function closeDialog() {
    setDetected(null);
    setRecommendation(null);
  }

  const hasPrimary = Boolean(recommendation?.primary.length);

  return (
    <>
      <section className="locate-panel" aria-labelledby="find-state-title">
        <h2 id="find-state-title">Find Your State</h2>
        <p>With your permission, we’ll use your location once to find your state. If its prep is available, we’ll open it. Otherwise, we’ll show available options here.</p>
        <button className="btn btn-primary" type="button" onClick={locate} disabled={finding}>
          {finding ? "Finding your state…" : "Use My Location"}
        </button>
        {notice ? <p className="notice" role="status">{noticeCopy[notice]}</p> : null}
        <p className="notice">Or choose a state below.</p>
      </section>
      <label className="state-search">
        <span className="kicker">Search</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by state name or abbreviation"
          aria-label="Search by state name or abbreviation"
        />
      </label>
      {filtered.length ? (
        <div className="state-grid">
          {filtered.map((state) => (
            <Link
              key={state.code}
              className="state-card"
              href={state.status === "available" && state.homePath ? state.homePath : comingSoonPath(state)}
              onClick={cancelLocate}
            >
              <span className="state-card-name">{stateLabel(state)}</span>
              <span className={state.status === "available" ? "badge" : "badge badge-warn"}>
                {state.status === "available" ? "Available" : "Coming soon"}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p role="status">No matching states. Try another name or abbreviation.</p>
      )}
      {detected && recommendation ? (
        <MessageDialog title={`${stateLabel(detected)} Is Coming Soon`} onClose={closeDialog}>
          <p>
            {hasPrimary
              ? `We’re still building notary prep for ${stateLabel(detected)}. You can explore an available state below.`
              : `We’re still building notary prep for ${stateLabel(detected)}.`}
          </p>
          {hasPrimary ? (
            <div className="recommend-block">
              <h3>{recommendation.similar ? "Explore States With a Similar Exam Format" : "Explore an Available State"}</h3>
              <div className="recommend-actions">
                {recommendation.primary.map((state) => (
                  <a key={state.code} className="btn btn-primary" href={state.homePath || "/"}>
                    Explore {stateLabel(state)}
                  </a>
                ))}
              </div>
              {recommendation.others.length ? (
                <>
                  <h3>Other Available States</h3>
                  <div className="recommend-actions">
                    {recommendation.others.map((state) => (
                      <a key={state.code} className="btn btn-ghost" href={state.homePath || "/"}>
                        {stateLabel(state)}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
              <p className="notice">Notary laws and exam requirements vary by state. Use these materials to preview the learning experience.</p>
            </div>
          ) : null}
          <button className="btn btn-ghost message-dialog-close" type="button" onClick={closeDialog}>
            Keep Choosing a State
          </button>
        </MessageDialog>
      ) : null}
    </>
  );
}
