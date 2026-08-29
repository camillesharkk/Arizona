"use client";

import { useEffect, useState } from "react";
import { ExamRunner } from "@/components/ExamRunner";

export function PracticeLaunch() {
  const [mode, setMode] = useState<"pick" | "quick" | "full" | "weak">("pick");
  const [isPro, setIsPro] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me/")
      .then((r) => r.json())
      .then((d) => setIsPro(d.user?.plan === "pro"))
      .catch(() => undefined);
  }, []);
  if (mode === "pick") {
    return (
      <div className="grid grid-3">
        <button className="card" type="button" onClick={() => setMode("quick")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Quick 10</h3>
          <p>Warm up with instant explanations. Best first visit.</p>
        </button>
        <button className="card" type="button" onClick={() => setMode("full")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Full 45</h3>
          <p>Timed exam mode. Explanations after you submit.</p>
        </button>
        <button className="card" type="button" onClick={() => setMode("weak")} style={{ textAlign: "left", cursor: "pointer" }}>
          <h3>Weak Areas</h3>
          <p>Retry missed items from this device and your cloud notebook.</p>
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
