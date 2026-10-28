"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { clearSitting, openSitting } from "@/lib/sitting";

const ANON_FULL_KEY = "az-anon-full-started";

export function PracticeLaunch() {
  const [mode, setMode] = useState<"pick" | "quick" | "full" | "weak">("pick");
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [owner, setOwner] = useState("guest");
  const [openModes, setOpenModes] = useState<Record<string, boolean>>({});
  const anonFullThisVisit = useRef(false);

  useEffect(() => {
    try {
      setAnonFullUsed(localStorage.getItem(ANON_FULL_KEY) === "1");
    } catch {
      setAnonFullUsed(false);
    }
    setGateReady(true);
    const q = new URLSearchParams(window.location.search).get("mode");
    if (q === "quick" || q === "full" || q === "weak") setMode(q);
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => {
        setIsPro(Boolean(d.user?.arizonaPro || d.user?.plan === "pro"));
        setFullExamCount(Number(d.user?.fullExamCount || 0));
        setSignedIn(Boolean(d.user));
        setOwner(d.user?.id || "guest");
        const nextOwner = d.user?.id || "guest";
        setOpenModes({
          quick: Boolean(openSitting(sessionStorage, nextOwner, "quick")),
          full: Boolean(openSitting(sessionStorage, nextOwner, "full")),
          weak: Boolean(openSitting(sessionStorage, nextOwner, "weak")),
        });
      })
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
  }, []);

  const inThisAnonFull = anonFullThisVisit.current && mode === "full";
  const anonBlocked = !isPro && !signedIn && anonFullUsed && !inThisAnonFull;
  const fullResume = mode === "full" && typeof window !== "undefined" && Boolean(openSitting(sessionStorage, owner, "full"));
  const fullLocked = !fullResume && !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || anonBlocked);

  function consumeAnonFull() {
    anonFullThisVisit.current = true;
    try {
      localStorage.setItem(ANON_FULL_KEY, "1");
    } catch {
      /* this visit still stays open in memory */
    }
    setAnonFullUsed(true);
  }

  function leaveExam() {
    anonFullThisVisit.current = false;
    const url = new URL(window.location.href);
    url.searchParams.delete("mode");
    window.history.replaceState(null, "", url);
    setOpenModes({
      quick: Boolean(openSitting(sessionStorage, owner, "quick")),
      full: Boolean(openSitting(sessionStorage, owner, "full")),
      weak: Boolean(openSitting(sessionStorage, owner, "weak")),
    });
    setMode("pick");
  }

  function enter(next: "quick" | "full" | "weak") {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", next);
    window.history.replaceState(null, "", url);
    setMode(next);
  }

  function resume(next: "quick" | "full" | "weak") {
    if (next === "full" && !isPro && !signedIn) anonFullThisVisit.current = true;
    enter(next);
  }

  function beginNew(next: "quick" | "full" | "weak") {
    if (openModes[next] && !window.confirm("Start a new set? This replaces the unfinished one.")) return;
    clearSitting(sessionStorage, owner, next);
    setOpenModes((current) => ({ ...current, [next]: false }));
    if (next === "full") startFull();
    else enter(next);
  }

  function startFull() {
    if (!authReady) return;
    if (!isPro && !signedIn && !anonFullUsed) consumeAnonFull();
    enter("full");
  }

  useEffect(() => {
    if (!authReady || !gateReady || mode !== "full" || isPro || signedIn || anonFullThisVisit.current) return;
    if (anonFullUsed) return;
    consumeAnonFull();
  }, [authReady, gateReady, mode, isPro, signedIn, anonFullUsed]);

  if (mode !== "pick" && (!authReady || !gateReady)) {
    return <p className="notice">Loading exam…</p>;
  }

  if (mode === "pick") {
    return (
      <div className="grid grid-3">
        {(["quick", "full", "weak"] as const).map((id) => {
          const copy = {
            quick: ["Quick 10", "10 questions. The result shows after each answer."],
            full: ["Full 45", "45 questions, 60 minutes. Results show after you submit."],
            weak: ["Weak Areas", "Questions you missed. The longer set is part of Pro."],
          }[id];
          return (
            <div className="card" key={id}>
              <h3>{copy[0]}</h3>
              <p>{copy[1]}</p>
              {openModes[id] ? (
                <div className="row">
                  <button className="btn btn-primary" type="button" onClick={() => resume(id)}>Resume</button>
                  <button className="btn btn-ghost" type="button" onClick={() => beginNew(id)}>Start new</button>
                </div>
              ) : (
                <button className="btn btn-primary" type="button" onClick={() => (id === "full" ? startFull() : enter(id))}>Start</button>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (mode === "full" && fullLocked) {
    return (
      <div className="card">
        <h2>Free Full 45 already used</h2>
        <p>
          {signedIn
            ? "This account has used its free Full 45. Pro includes more full exams."
            : "This browser has used its free Full 45. Pro includes more full exams."}
        </p>
        <Link className="btn btn-primary" href={paths.pricing} data-upgrade-source="practice_limit">
          Unlock Pro
        </Link>
        <button className="btn btn-ghost" type="button" onClick={leaveExam} style={{ marginLeft: 8 }}>
          Change mode
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost" type="button" onClick={leaveExam} style={{ marginBottom: 16 }}>
        Change mode
      </button>
      <ExamRunner mode={mode} practice={mode !== "full"} isPro={isPro} sittingMode={mode} />
    </div>
  );
}
