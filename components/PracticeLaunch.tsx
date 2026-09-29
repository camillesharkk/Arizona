"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";

const ANON_FULL_KEY = "az-anon-full-started";

export function PracticeLaunch() {
  const [mode, setMode] = useState<"pick" | "quick" | "full" | "weak">("pick");
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
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
      })
      .catch(() => undefined)
      .finally(() => setAuthReady(true));
  }, []);

  const inThisAnonFull = anonFullThisVisit.current && mode === "full";
  const anonBlocked = !isPro && !signedIn && anonFullUsed && !inThisAnonFull;
  const fullLocked = !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || anonBlocked);

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
    setMode("pick");
  }

  function startFull() {
    if (!authReady) return;
    if (!isPro && !signedIn && !anonFullUsed) consumeAnonFull();
    setMode("full");
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
        <button className="card" type="button" onClick={() => setMode("quick")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Quick 10</h3>
          <p>Warm up with instant explanations. Best first visit.</p>
        </button>
        <button className="card" type="button" onClick={startFull} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Full 45</h3>
          <p>One free Full 45 in this browser. It can include Pro questions. Another full exam in this browser is Pro.</p>
        </button>
        <button className="card" type="button" onClick={() => setMode("weak")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Weak Areas</h3>
          <p>Free preview of missed items. Unlock Pro to keep training weak topics to a passing score.</p>
        </button>
      </div>
    );
  }

  if (mode === "full" && fullLocked) {
    return (
      <div className="card">
        <h2>Know exactly what to study next.</h2>
        <p>
          {signedIn
            ? "This account already has its free full-length practice test on record. Pro adds unlimited full exams, weak-area training, and exam readiness."
            : "This browser already started its one free Full 45. The reminder is stored in this browser when storage is available. It is not a per-person limit, and another browser does not see it. Pro adds unlimited full exams, weak-area training, and exam readiness."}
        </p>
        <Link className="btn btn-primary" href={paths.pricing}>
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
      <ExamRunner mode={mode} practice={mode !== "full"} isPro={isPro} />
    </div>
  );
}
