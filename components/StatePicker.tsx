"use client";

import { MemberCopy } from "@/components/MemberCopy";
import {
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { stateEntry } from "@/lib/state-entry";
import { MessageDialog } from "@/components/MessageDialog";
import {
  prepStates,
  recommendStates,
  stateByCode,
  stateLabel,
  statesByName,
  type PrepState,
  type StateRecommendation,
} from "@/lib/states";

type Notice =
  | "denied"
  | "timeout"
  | "unsupported"
  | "failed"
  | "unlisted"
  | "outside"
  | null;

const noticeCopy: Record<Exclude<Notice, null>, string> = {
  denied: "Location permission was blocked. Choose a state below.",
  timeout: "Location lookup timed out. Choose a state below.",
  unsupported: "This browser can't share your location. Choose a state below.",
  failed: "We couldn't read that location. Choose a state below.",
  unlisted:
    "That location is in a state this site doesn't list yet. Choose a state below.",
  outside: "That location isn't in a listed U.S. state. Choose a state below.",
};

export function StatePicker({
  indianaPreview = false,
}: {
  indianaPreview?: boolean;
}) {
  const states = useMemo(
    () =>
      statesByName(
        indianaPreview
          ? prepStates.map((state) =>
              state.code === "IN"
                ? {
                    ...state,
                    status: "available" as const,
                    homePath: "/indiana/",
                  }
                : state,
            )
          : prepStates,
      ),
    [indianaPreview],
  );
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PrepState | null>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectionHint, setSelectionHint] = useState(false);
  const [listHeight, setListHeight] = useState(320);
  const container = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const listId = useId();
  const inputId = "state-selection";
  const [finding, setFinding] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [detected, setDetected] = useState<PrepState | null>(null);
  const [recommendation, setRecommendation] =
    useState<StateRecommendation | null>(null);
  const requestId = useRef(0);
  const filtered = useMemo(() => {
    const term = selected ? "" : query.trim().toLowerCase();
    if (!term) return states;
    const exactCode = states.find((state) => state.code.toLowerCase() === term);
    if (exactCode) return [exactCode];
    return states.filter((state) => state.name.toLowerCase().includes(term));
  }, [query, selected, states]);

  useEffect(() => {
    if (!open) return;
    function outside(event: PointerEvent) {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    }
    function fitList() {
      const field = input.current;
      if (!field) return;
      const viewport = window.visualViewport;
      const viewportBottom =
        (viewport?.height || window.innerHeight) + (viewport?.offsetTop || 0);
      let available =
        viewportBottom - field.getBoundingClientRect().bottom - 12;
      if (window.innerWidth <= 600 && available < 120) {
        field.scrollIntoView({ block: "center", behavior: "instant" });
        available = viewportBottom - field.getBoundingClientRect().bottom - 12;
      }
      setListHeight(
        Math.max(96, Math.min(window.innerWidth <= 600 ? 260 : 320, available)),
      );
    }
    fitList();
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", fitList);
    window.visualViewport?.addEventListener("resize", fitList);
    window.visualViewport?.addEventListener("scroll", fitList);
    return () => {
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", fitList);
      window.visualViewport?.removeEventListener("resize", fitList);
      window.visualViewport?.removeEventListener("scroll", fitList);
    };
  }, [open]);

  useEffect(() => {
    if (open && activeIndex >= 0) {
      list.current?.children[activeIndex]?.scrollIntoView({
        block: "nearest",
        inline: "nearest",
        behavior: "instant",
      });
    }
  }, [open, activeIndex]);

  function selectState(state: PrepState) {
    cancelLocate();
    setSelected(state);
    setQuery(stateLabel(state));
    setOpen(false);
    setSelectionHint(false);
  }

  function editQuery(value: string) {
    cancelLocate();
    setQuery(value);
    setSelected(null);
    setOpen(true);
    setActiveIndex(0);
    setSelectionHint(false);
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing) return;
    if (event.key === "Escape") {
      setOpen(false);
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      const direction = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) =>
        open
          ? Math.max(0, Math.min(filtered.length - 1, index + direction))
          : direction === 1
            ? 0
            : filtered.length - 1,
      );
    } else if (event.key === "Enter" && open) {
      event.preventDefault();
      if (filtered[activeIndex]) selectState(filtered[activeIndex]);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  function start(event: FormEvent) {
    event.preventDefault();
    if (selected) {
      cancelLocate();
      window.location.assign(stateEntry(selected).href);
      return;
    }
    setSelectionHint(true);
    setOpen(true);
    setActiveIndex(filtered.length ? 0 : -1);
    input.current?.focus();
  }

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
        void finishLocate(
          id,
          position.coords.latitude,
          position.coords.longitude,
        );
      },
      (error) => {
        if (id !== requestId.current) return;
        setFinding(false);
        setNotice(
          error.code === 1 ? "denied" : error.code === 3 ? "timeout" : "failed",
        );
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 },
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
      const state = stateByCode(data.code, states);
      if (!state) {
        setNotice("unlisted");
        return;
      }
      if (state.status === "available" && state.homePath) {
        selectState(state);
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
      <form className="home-state-form" onSubmit={start} data-home-enter>
        <div className="home-state-combobox" ref={container}>
          <label className="home-state-label" htmlFor={inputId}>
            Choose your state
          </label>
          <div className="home-state-field">
            <input
              ref={input}
              id={inputId}
              type="text"
              role="combobox"
              autoComplete="off"
              spellCheck={false}
              value={query}
              placeholder="Search states"
              aria-expanded={open}
              aria-haspopup="listbox"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={
                open && filtered[activeIndex]
                  ? listId + "-" + filtered[activeIndex].code
                  : undefined
              }
              aria-describedby={selectionHint ? listId + "-hint" : undefined}
              onFocus={() => {
                setOpen(true);
                setActiveIndex(
                  selected
                    ? filtered.findIndex(
                        (state) => state.code === selected.code,
                      )
                    : 0,
                );
              }}
              onClick={() => setOpen(true)}
              onChange={(event) => editQuery(event.target.value)}
              onKeyDown={onKeyDown}
            />
            {query ? (
              <button
                className="home-state-clear"
                type="button"
                aria-label="Clear state selection"
                onClick={() => {
                  editQuery("");
                  input.current?.focus();
                }}
              >
                ×
              </button>
            ) : (
              <span className="home-state-chevron" aria-hidden="true">
                ⌄
              </span>
            )}
          </div>
          <ul
            className="home-state-list"
            id={listId}
            role="listbox"
            aria-label="States"
            ref={list}
            hidden={!open}
            style={{ maxHeight: listHeight }}
          >
            {filtered.map((state, index) => (
              <li key={state.code} role="presentation">
                <button
                  id={listId + "-" + state.code}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={selected?.code === state.code}
                  className={index === activeIndex ? "is-active" : undefined}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => selectState(state)}
                >
                  <span>
                    {state.name}{" "}
                    <span className="home-state-code">{state.code}</span>
                  </span>
                  <small>{stateEntry(state).task}</small>
                </button>
              </li>
            ))}
            {!filtered.length ? (
              <li className="home-state-empty" role="presentation">
                No matching states found
              </li>
            ) : null}
          </ul>
          <span className="home-sr-only" role="status">
            {open ? filtered.length + " states found" : ""}
          </span>
        </div>
        {selectionHint ? (
          <p id={listId + "-hint"} className="home-state-hint" role="status">
            Select your state to continue
          </p>
        ) : null}
        {selected && selected.status !== "available" ? (
          <p className="home-state-hint" role="status">
            Prep for {selected.name} is coming soon. View the current updates.
          </p>
        ) : null}
        <button className="home-primary" type="submit">
          <MemberCopy member={selected ? stateEntry(selected).label : "Start practice"}>{selected ? stateEntry(selected).label : "Start free"}</MemberCopy>
          <span aria-hidden="true">→</span>
        </button>
        <p className="picker-help">Select a state to find its practice tools.</p>
        <div className="home-location">
          <button type="button" onClick={locate} disabled={finding}>
            {finding ? "Finding your state…" : "Use My Location"}
          </button>
        </div>
        {notice ? (
          <p className="home-state-hint" role="status">
            {noticeCopy[notice]}
          </p>
        ) : null}
      </form>
      {detected && recommendation ? (
        <MessageDialog
          title={`${stateLabel(detected)} Is Coming Soon`}
          onClose={closeDialog}
        >
          <p>
            {hasPrimary
              ? `We’re still building notary prep for ${stateLabel(detected)}. You can explore an available state below.`
              : `We’re still building notary prep for ${stateLabel(detected)}.`}
          </p>
          {hasPrimary ? (
            <div className="recommend-block">
              <h3>
                {recommendation.similar
                  ? "Explore States With a Similar Exam Format"
                  : "Explore an Available State"}
              </h3>
              <div className="recommend-actions">
                {recommendation.primary.map((state) => (
                  <a
                    key={state.code}
                    className="btn btn-primary"
                    href={state.homePath || "/"}
                  >
                    Explore {stateLabel(state)}
                  </a>
                ))}
              </div>
              {recommendation.others.length ? (
                <>
                  <h3>Other Available States</h3>
                  <div className="recommend-actions">
                    {recommendation.others.map((state) => (
                      <a
                        key={state.code}
                        className="btn btn-ghost"
                        href={state.homePath || "/"}
                      >
                        {stateLabel(state)}
                      </a>
                    ))}
                  </div>
                </>
              ) : null}
              <p className="notice">
                Notary laws and exam requirements vary by state. Use these
                materials to preview the learning experience.
              </p>
            </div>
          ) : null}
          <button
            className="btn btn-ghost message-dialog-close"
            type="button"
            onClick={closeDialog}
          >
            Keep Choosing a State
          </button>
        </MessageDialog>
      ) : null}
    </>
  );
}
