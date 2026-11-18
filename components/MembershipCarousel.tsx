"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";

const plans = ["60-Day Pro", "Lifetime Pro"];

export function MembershipCarousel({ children }: { children: ReactNode }) {
  const id = useId();
  const track = useRef<HTMLDivElement>(null);
  const pending = useRef<number | null>(null);
  const [current, setCurrent] = useState(0);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let previous = 0;
    function settle() {
      if (!element) return;
      const end = element.scrollWidth - element.clientWidth;
      const next = end > 0 && element.scrollLeft > end / 2 ? 1 : 0;
      pending.current = null;
      if (next === previous) return;
      previous = next;
      setCurrent(next);
      setAnnouncement(`${plans[next]}, ${next + 1} of ${plans.length}`);
    }
    function debounce() {
      clearTimeout(timer);
      timer = setTimeout(settle, 160);
    }
    const event = "onscrollend" in element ? "scrollend" : "scroll";
    const handler = event === "scrollend" ? settle : debounce;
    element.addEventListener(event, handler, { passive: true });
    return () => {
      element.removeEventListener(event, handler);
      clearTimeout(timer);
    };
  }, []);

  function move(index: number) {
    const element = track.current;
    if (!element || index === (pending.current ?? current)) return;
    pending.current = index;
    element.scrollTo({ left: index === 0 ? 0 : element.scrollWidth - element.clientWidth });
  }

  return (
    <section aria-labelledby={`${id}-heading`} aria-roledescription="carousel" className="membership-carousel">
      <div className="membership-heading">
        <h2 id={`${id}-heading`}>Choose your Pro plan</h2>
        <div className="membership-navigation" aria-label="Plan navigation">
          <button type="button" className="btn btn-ghost" aria-label="Previous plan" aria-controls={id} aria-disabled={current === 0} onClick={() => move(0)}>←</button>
          <button type="button" className="btn btn-ghost" aria-label="Next plan" aria-controls={id} aria-disabled={current === 1} onClick={() => move(1)}>→</button>
        </div>
      </div>
      <div id={id} ref={track} className="membership-track" tabIndex={0} role="group" aria-label="Paid plans">
        {children}
      </div>
      <div className="membership-markers" role="group" aria-label="Go to plan">
        {plans.map((name, index) => (
          <button type="button" className="btn btn-ghost" key={name} aria-label={`Go to ${name}`} aria-controls={id} aria-current={current === index ? "true" : undefined} onClick={() => move(index)}>{index + 1}</button>
        ))}
      </div>
      <p className="visually-hidden" role="status">{announcement}</p>
    </section>
  );
}
