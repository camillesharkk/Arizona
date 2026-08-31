"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ExamRunner } from "@/components/ExamRunner";
import { paths } from "@/lib/paths";
import { FREE_FULL_EXAMS } from "@/lib/product";

export function PracticeLaunch() {
  const [mode, setMode] = useState<"pick" | "quick" | "full" | "weak">("pick");
  const [isPro, setIsPro] = useState(false);
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);

  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
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

  const fullLocked = !isPro && signedIn && fullExamCount >= FREE_FULL_EXAMS;

  if (mode !== "pick" && !authReady) {
    return <p className="notice">Loading exam…</p>;
  }

  if (mode === "pick") {
    return (
      <div className="grid grid-3">
        <button className="card" type="button" onClick={() => setMode("quick")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Quick 10</h3>
          <p>Warm up with instant explanations. Best first visit.</p>
        </button>
        <button className="card" type="button" onClick={() => setMode("full")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Full 45</h3>
          <p>Timed exam mode. Your first full test is free. Unlimited full exams are Pro.</p>
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
        <p>You already used your free full-length practice test. Pro adds unlimited full exams, weak-area training, and exam readiness.</p>
        <Link className="btn btn-primary" href={paths.pricing}>
          Unlock Pro
        </Link>
        <button className="btn btn-ghost" type="button" onClick={() => setMode("pick")} style={{ marginLeft: 8 }}>
          Change mode
        </button>
      </div>
    );
  }

  return (
    <div>
      <button className="btn btn-ghost" type="button" onClick={() => setMode("pick")} style={{ marginBottom: 16 }}>
        Change mode
      </button>
      <ExamRunner mode={mode} practice={mode !== "full"} isPro={isPro} />
    </div>
  );
}
