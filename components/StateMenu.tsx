"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LIVE_STATES, switchStateHref, type LiveState } from "@/lib/ca-site";
import { pathState, writeStateCookie, type LiveCode } from "@/lib/site-state";
import { availableStates, stateByCode, stateLabel } from "@/lib/states";
import { packNavigationFor } from "@/lib/prep-navigation";
import { caPaths } from "@/lib/ca-site";
import { hiPaths } from "@/lib/hi-site";
import { paths } from "@/lib/paths";

function stateHref(pathname: string, code: string) {
  const currentPack = packNavigationFor(pathState(pathname));
  if (currentPack && pathname.startsWith("/preview/")) {
    const feature = Object.entries(currentPack.paths).find(([, value]) => pathname === value || pathname === value.slice(0, -1))?.[0];
    const destination = packNavigationFor(code)?.paths || (code === "CA" ? caPaths : code === "HI" ? hiPaths : paths);
    if (feature && feature in destination) return destination[feature as keyof typeof destination];
  }
  const home = code === "IN" ? "/indiana/" : stateByCode(code)?.homePath || "/";
  if (!pathState(pathname) || !LIVE_STATES.includes(code as LiveState)) return home;
  const next = switchStateHref(pathname, code as LiveState);
  return next.split("#")[0]?.split("?")[0] || home;
}

export function StateMenu({ pathname, current, indianaPreview = false }: { pathname: string; current: LiveCode | null; indianaPreview?: boolean }) {
  const states = availableStates();
  if (indianaPreview && !states.some(state => state.code === "IN")) { const indiana = stateByCode("IN"); if (indiana) states.push({ ...indiana, status: "available", homePath: "/indiana/" }); }
  const currentName = current ? stateByCode(current)?.name : "";
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const items = [...(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [])];
    items[0]?.focus();
    function close(restore: boolean) {
      setOpen(false);
      if (restore) buttonRef.current?.focus();
    }
    function onPointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) close(true);
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return;
      const list = [...(panelRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') || [])];
      if (!list.length) return;
      event.preventDefault();
      const index = list.indexOf(document.activeElement as HTMLElement);
      const next = event.key === "Home" ? 0 : event.key === "End" ? list.length - 1 : event.key === "ArrowDown" ? index + 1 : index - 1;
      list[(next + list.length) % list.length]?.focus();
    }
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const label = current ? `State: ${current} ▾` : "Choose State ▾";
  const name = currentName ? `Choose state, current state ${currentName}` : "Choose state";

  return (
    <div className="state-menu" ref={rootRef}>
      <button
        ref={buttonRef}
        className="state-menu-btn"
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={name}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key !== "ArrowDown") return;
          event.preventDefault();
          setOpen(true);
        }}
      >
        {label}
      </button>
      {open ? (
        <div ref={panelRef} className="state-menu-panel" role="menu" aria-label="States">
          {states.map((state) => (
            <Link
              key={state.code}
              role="menuitem"
              href={stateHref(pathname, state.code)}
              aria-current={state.code === current ? "true" : undefined}
              onClick={() => {
                if (LIVE_STATES.includes(state.code as LiveState)) writeStateCookie(state.code as LiveState);
              }}
            >
              <span>{stateLabel(state)}</span>
              {state.code === current ? <span aria-hidden="true">✓</span> : null}
            </Link>
          ))}
          {pathname.startsWith("/preview/") ? (["PA", "LA"] as const).filter(code => !packNavigationFor(code)?.available).map(code => (
            <Link key={code} role="menuitem" href={stateHref(pathname, code)} onClick={() => writeStateCookie(code)}>
              {packNavigationFor(code)?.name} ({code}) preview
            </Link>
          )) : null}
          <Link role="menuitem" href="/">Choose another state</Link>
        </div>
      ) : null}
    </div>
  );
}
