"use client";

import { clientStatePro } from "@/lib/state-pro";
import { fetchAccount } from "@/lib/client-account";

import { Fragment, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExamRunner } from "@/components/ExamRunner";
import { examConfig } from "@/data/exam-config";
import { paths } from "@/lib/paths";
import { CA_EXAM, caPaths } from "@/lib/ca-site";
import { HI_EXAM, hiPaths } from "@/lib/hi-site";
import { packFor } from "@/lib/prep-pack";
import { FREE_FULL_EXAMS } from "@/lib/product";
import { clearSitting, openSitting, readSitting, type SittingState } from "@/lib/sitting";
import { readCaAttempt } from "@/lib/ca-attempts";

export function PracticeLaunch({ stateCode = "AZ" }: { stateCode?: SittingState }) {
  const onHi = stateCode === "HI";
  const onCa = stateCode === "CA";
  const pack = packFor(stateCode);
  const anonFullKey = pack ? pack.anonKey : onHi ? "hi-anon-full-started" : onCa ? "ca-anon-full-started" : "az-anon-full-started";
  const site = pack ? pack.paths : onHi ? hiPaths : onCa ? caPaths : paths;

  const fullMinutes = pack ? pack.fullMinutes : onHi ? HI_EXAM.officialTimeLimitMinutes : onCa ? CA_EXAM.timeLimitMinutes : examConfig.timeLimitMinutes;
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"pick" | "quick" | "full" | "weak" | "practice">("pick");
  const [focusArea, setFocusArea] = useState("");
  const [isPro, setIsPro] = useState(false);
  const fullCount = pack ? (pack.fullCountFor?.(isPro) ?? pack.fullCount) : onHi ? HI_EXAM.practiceQuestionCount : onCa ? CA_EXAM.questionCount : examConfig.questionCount;
  const [fullExamCount, setFullExamCount] = useState(0);
  const [signedIn, setSignedIn] = useState(false);
  const [anonFullUsed, setAnonFullUsed] = useState(false);
  const [gateReady, setGateReady] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState(false);
  const [authTry, setAuthTry] = useState(0);
  const [pendingStart, setPendingStart] = useState<"" | "quick" | "full" | "weak">("");
  const [owner, setOwner] = useState("guest");
  const [openModes, setOpenModes] = useState<Record<string, boolean>>({});
  const anonFullThisVisit = useRef(false);

  useEffect(() => {
    const area = searchParams.get("area") || "";
    const requested = searchParams.get("mode");
    if (area && !pack?.freeLaunch) {
      setFocusArea(area);
      setMode("practice");
      return;
    }
    setFocusArea("");
    if (pack?.freeLaunch && requested !== 'quick') setMode('pick');
    else if (requested === "quick" || requested === "full" || requested === "weak") setMode(requested);
    else setMode("pick");
  }, [searchParams, stateCode]);

  useEffect(() => {
    let cancel = false;
    const controller = new AbortController();
    setAuthReady(false);
    setAuthError(false);
    setOpenModes({});
    anonFullThisVisit.current = false;
    try {
      setAnonFullUsed(localStorage.getItem(anonFullKey) === "1");
    } catch {
      setAnonFullUsed(false);
    }
    setGateReady(true);
    fetchAccount({ signal: controller.signal, cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (cancel) return;
        setIsPro(clientStatePro(d.user, stateCode));
        setFullExamCount(Number((pack ? d.user?.packFullExamCount?.[stateCode] : onHi ? d.user?.hiFullExamCount : onCa ? d.user?.caFullExamCount : d.user?.fullExamCount) || 0));
        setSignedIn(Boolean(d.user));
        setOwner(d.user?.id || "guest");
        const nextOwner = d.user?.id || "guest";
        const liveParams = new URLSearchParams(window.location.search);
        const requested = liveParams.get("mode");
        const startFresh = liveParams.get("start") === "1";
        const legacyFull = requested === "full" ? readSitting(sessionStorage, nextOwner, "full", stateCode) : null;
        const legacyFinishedFull = !pack && legacyFull?.done && !readCaAttempt(nextOwner, legacyFull.examId || "", stateCode);
        if (startFresh && !legacyFinishedFull && (requested === "quick" || requested === "full" || requested === "weak") && !openSitting(sessionStorage, nextOwner, requested, stateCode)) {
          clearSitting(sessionStorage, nextOwner, requested, stateCode);
        }
        if (startFresh) {
          const url = new URL(window.location.href);
          url.searchParams.delete("start");
          window.history.replaceState(null, "", url);
        }
        setOpenModes({
          quick: Boolean(openSitting(sessionStorage, nextOwner, "quick", stateCode)),
          full: Boolean(openSitting(sessionStorage, nextOwner, "full", stateCode)),
          weak: Boolean(openSitting(sessionStorage, nextOwner, "weak", stateCode)),
        });
      })
      .catch((error: unknown) => {
        if (cancel || (error instanceof DOMException && error.name === "AbortError")) return;
        setAuthError(true);
      })
      .finally(() => {
        if (!cancel && !controller.signal.aborted) setAuthReady(true);
      });
    return () => {
      cancel = true;
      controller.abort();
    };
  }, [anonFullKey, authTry, onCa, onHi, stateCode]);

  const inThisAnonFull = anonFullThisVisit.current && mode === "full";
  const anonBlocked = !isPro && !signedIn && anonFullUsed && !inThisAnonFull;
  const fullResume = mode === "full" && typeof window !== "undefined" && Boolean(
    openSitting(sessionStorage, owner, "full", stateCode) ||
    (new URLSearchParams(window.location.search).get("start") !== "1" && (
      readSitting(sessionStorage, owner, "full", stateCode)?.done ||
      readCaAttempt(owner, new URLSearchParams(window.location.search).get("attempt") || "", stateCode)?.mode === "full"
    ))
  );
  const fullLocked = !fullResume && !isPro && ((signedIn && fullExamCount >= FREE_FULL_EXAMS) || anonBlocked);

  function consumeAnonFull() {
    anonFullThisVisit.current = true;
    try {
      localStorage.setItem(anonFullKey, "1");
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
      quick: Boolean(openSitting(sessionStorage, owner, "quick", stateCode)),
      full: Boolean(openSitting(sessionStorage, owner, "full", stateCode)),
      weak: Boolean(openSitting(sessionStorage, owner, "weak", stateCode)),
    });
    setMode("pick");
  }

  function enter(next: "quick" | "full" | "weak") {
    const existing = readSitting(sessionStorage, owner, next, stateCode);
    if (existing?.done) clearSitting(sessionStorage, owner, next, stateCode);
    const url = new URL(window.location.href);
    url.searchParams.set("mode", next);
    url.searchParams.delete("attempt");
    window.history.replaceState(null, "", url);
    setMode(next);
  }

  function resume(next: "quick" | "full" | "weak") {
    if (next === "full" && !isPro && !signedIn) anonFullThisVisit.current = true;
    enter(next);
  }

  function beginNew(next: "quick" | "full" | "weak") {
    if (openModes[next] && !window.confirm("Start a new set? This replaces the unfinished one.")) return;
    clearSitting(sessionStorage, owner, next, stateCode);
    setOpenModes((current) => ({ ...current, [next]: false }));
    if (next === "full") startFull();
    else enter(next);
  }

  function startFull() {
    if (!isPro && !signedIn && !anonFullUsed) consumeAnonFull();
    enter("full");
  }

  function requestStart(next: "quick" | "full" | "weak") {
    if (stateCode === "CT" && next === "weak") { document.getElementById("ct-topics")?.scrollIntoView({ behavior: "smooth" }); return; }
    if (pendingStart) return;
    if (!authReady) {
      setPendingStart(next);
      return;
    }
    if (next === "full") startFull();
    else enter(next);
  }

  useEffect(() => {
    if (!authReady || authError || !pendingStart) return;
    const next = pendingStart;
    setPendingStart("");
    if (next === "full") startFull();
    else enter(next);
    // The queued click runs once, after this state's access check resolves.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady, authError, pendingStart]);

  useEffect(() => {
    if (pack?.fullReady === false || !authReady || !gateReady || mode !== "full" || isPro || signedIn || anonFullThisVisit.current) return;
    if (anonFullUsed) return;
    consumeAnonFull();
  }, [authReady, gateReady, mode, isPro, signedIn, anonFullUsed, pack?.fullReady]);

  if (authError) {
    return (
      <div className="card">
        <p className="form-error" role="alert">Could not check exam access. The exam was not started.</p>
        <button className="btn btn-primary" type="button" onClick={() => setAuthTry((n) => n + 1)}>Retry</button>
      </div>
    );
  }

  if (mode !== "pick" && (!authReady || !gateReady)) {
    return <p className="notice" role="status">Loading exam…</p>;
  }

  if (mode === "pick") {
    return (
      <>
      {stateCode === "NC" || (pack && !pack.fullReady && !pack.freeLaunch) ? (
        <section className="card" style={{ marginBottom: 18 }}>
          <h2>Topic Practice</h2>
          <p>Choose a rule to review using questions available to your account.</p>
          <div className="tool-row">
            {pack?.topics.map(topic => (
              <Link className="chip" key={topic.id} href={`${site.practice}?mode=practice&area=${topic.id}`}>
                {topic.label}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <div className="grid grid-3">
        {(pack?.freeLaunch ? ["quick"] as const : stateCode === "IN" ? ["quick", "full"] as const : ["quick", "full", "weak"] as const).filter(id => id !== 'full' || !pack || pack.fullReady).map((id) => {
          const copy = {
            quick: ["Quick 10", "10 questions. The result shows after each answer."],
            full: pack
              ? [pack.fullTitle, pack.practiceNotice ? `${fullCount} questions, ${fullMinutes} minutes. Results show after you submit.` : pack.fullDetail]
              : onHi
              ? ["Comprehensive Practice", `${fullCount} questions. No time limit. This count is this site's practice setting.`]
              : ["Full " + fullCount, `${fullCount} questions, ${fullMinutes ?? examConfig.timeLimitMinutes} minutes. Results show after you submit.`],
            weak: [stateCode === "CT" ? "Topic Practice" : "Weak Areas", stateCode === "CT" ? "Choose a Connecticut topic from the list below." : "Questions you missed. The longer set is part of Pro."],
          }[id];
          return (
            <Fragment key={id}>
              <div className="card">
                <h3>{copy[0]}</h3>
                <p>{copy[1]}</p>
                {openModes[id] ? (
                  <div className="row">
                    <button className="btn btn-primary" type="button" onClick={() => resume(id)}>Resume</button>
                    <button className="btn btn-ghost" type="button" onClick={() => beginNew(id)}>Start new</button>
                  </div>
                ) : (
                  <>
                    <button className="btn btn-primary" type="button" disabled={!gateReady || Boolean(pendingStart) || (id === "full" && !!pack && !pack.fullReady) || (id === "quick" && !!pack && !pack.quickReady)} onClick={() => requestStart(id)}>
                      {!gateReady || pendingStart === id ? "Loading…" : (id === "full" && pack && !pack.fullReady) || (id === "quick" && pack && !pack.quickReady) ? "Not open yet" : "Start"}
                    </button>
                    {id === "full" && pack && !pack.fullReady ? <p className="notice">The published bank cannot fill this practice yet, so it stays closed.</p> : null}
                  </>
                )}
              </div>
              {id === "full" && pack?.practiceNotice ? (
                <section className="practice-mode-note" aria-labelledby={pack.practiceNotice.anchor}>
                  <h2 className="guide-chapter" id={pack.practiceNotice.anchor}>{pack.practiceNotice.title}</h2>
                  <p className="notice">{pack.practiceNotice.body}</p>
                </section>
              ) : null}
            </Fragment>
          );
        })}
        {stateCode === "IN" ? <div className="card"><h3>Topic Practice</h3><p>Choose a topic. Each set shows the number of questions available to your plan.</p>{pack?.topics.map(topic => <p key={topic.id}><Link href={`${site.practice}?mode=practice&area=${topic.id}`}>{topic.label}</Link></p>)}</div> : null}
      </div>
      </>
    );
  }

  if (mode === "full" && pack && !pack.fullReady) {
    return <div className="card"><p>Choose a free practice below.</p><button className="btn btn-primary" onClick={() => enter("quick")}>Start Free Quick 10</button></div>;
  }

  if (mode === "full" && fullLocked) {
    return (
      <div className="card">
        <h2>{pack ? `Free ${pack.fullTitle} already used` : onHi ? "Free Comprehensive Practice already used" : "Free Full 45 already used"}</h2>
        <p>
          {pack ? `This ${signedIn ? "account" : "browser"} has used its free ${pack.fullTitle}. Pro includes more full practices.` : signedIn
            ? (onHi
              ? "This account has used its free Comprehensive Practice. Hawaii Pro includes more of them for 60 days."
              : onCa
                ? "This account has used its free Full 45. California Pro includes more full exams for 60 days."
                : "This account has used its free Full 45. Pro includes more full exams.")
            : (onHi
              ? "This browser has used its free Comprehensive Practice. Hawaii Pro includes more of them for 60 days."
              : onCa
                ? "This browser has used its free Full 45. California Pro includes more full exams for 60 days."
                : "This browser has used its free Full 45. Pro includes more full exams.")}
        </p>
        {pack?.purchaseEnabled !== false ? <Link className="btn btn-primary" href={site.pricing} data-upgrade-source="practice_limit">Unlock Pro</Link> : <Link className="btn btn-primary" href={`${site.practice}?mode=quick`}>Start Free Quick 10</Link>}
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
      <ExamRunner key={`${stateCode}:${mode}:${focusArea}`} mode={mode} practice={mode !== "full"} isPro={isPro} sittingMode={focusArea ? `area-${focusArea}` : mode} stateCode={stateCode} focusArea={focusArea || undefined}
        onRecorded={mode === "full" ? count => setFullExamCount(current => count ?? Math.max(current, FREE_FULL_EXAMS)) : undefined} />
    </div>
  );
}
