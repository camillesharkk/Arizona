"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DiagnosticFlow, savedDiagnosticKind } from "@/components/DiagnosticFlow";
import { paths } from "@/lib/paths";

export function HomeEntry({ note }: { note: ReactNode }) {
  const router = useRouter();
  const [view, setView] = useState<"entry" | "check" | "result">("entry");
  const [fresh, setFresh] = useState(false);
  const [run, setRun] = useState(0);
  const [kind, setKind] = useState<"none" | "active" | "complete">("none");

  useEffect(() => {
    setKind(savedDiagnosticKind());
  }, [view]);

  function resume() {
    setFresh(false);
    setView(kind === "complete" ? "result" : "check");
  }

  function restart() {
    setFresh(true);
    setRun((n) => n + 1);
    setView("check");
  }

  if (view !== "entry") {
    return (
      <DiagnosticFlow
        key={run}
        fresh={fresh}
        showResult={view === "result"}
        onOpenFull={() => router.push(`${paths.practice}?mode=full`)}
        onOpenCards={() => router.push(paths.flashcards)}
        onExit={() => setView("entry")}
        onRestart={restart}
      />
    );
  }

  return (
    <section className="home-entry">
      <h1>Arizona Notary Exam Prep</h1>
      <p className="home-lead">Find out what to review with 10 questions.</p>
      <div className="home-actions">
        <button className="btn btn-primary" type="button" onClick={kind === "none" ? restart : resume}>
          {kind === "none" ? "Start 10 Questions →" : "Continue"}
        </button>
      </div>
      <p className="home-sub">
        <Link href={paths.flashcards}>Study Flashcards</Link>
        <span aria-hidden="true"> · </span>
        <Link href={paths.practice}>Full Practice Exam</Link>
      </p>
      {kind !== "none" ? (
        <p className="home-restart-row">
          <button className="home-text-btn home-restart" type="button" onClick={restart}>
            Start over
          </button>
        </p>
      ) : null}
      <div className="home-note">{note}</div>
    </section>
  );
}
