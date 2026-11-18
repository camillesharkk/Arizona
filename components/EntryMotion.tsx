"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

/** Animations decorate readable content and never move focus or scroll. */
export function EntryMotion() {
  const pathname = usePathname();
  const visited = useRef(new Set<string>());

  useEffect(() => {
    if (!pathname || visited.current.has(pathname)) return;
    visited.current.add(pathname);
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches) return;
    const main = document.querySelector("main");
    if (!main) return;
    const tools =
      /practice|questions|daily-study|wrong-answers|account|dashboard|login|register/.test(
        pathname,
      );
    const animations: Animation[] = [];
    const homeEntries =
      pathname === "/"
        ? main.querySelectorAll<HTMLElement>("[data-home-enter]")
        : [];
    homeEntries.forEach((element, index) => {
      if (typeof element.animate !== "function") return;
      animations.push(
        element.animate(
          [
            { opacity: 0.8, transform: "translateY(10px)" },
            { opacity: 1, transform: "translateY(0)" },
          ],
          { duration: 500, delay: index * 75, easing: "ease-out" },
        ),
      );
    });
    const target = tools ? main : main.firstElementChild;
    if (target && !homeEntries.length && typeof target.animate === "function")
      animations.push(
        target.animate(
          tools
            ? [{ opacity: 0.9 }, { opacity: 1 }]
            : [
                { opacity: 0.78, transform: "translateY(8px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
          { duration: tools ? 160 : 220, easing: "ease-out" },
        ),
      );
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              if (preference.matches) return;
              entries
                .filter((entry) => entry.isIntersecting)
                .forEach((entry, index) => {
                  const element = entry.target as HTMLElement;
                  if (typeof element.animate !== "function") return;
                  animations.push(
                    element.animate(
                      [
                        { opacity: 0.78, transform: "translateY(8px)" },
                        { opacity: 1, transform: "translateY(0)" },
                      ],
                      {
                        duration: pathname === "/" ? 420 : 220,
                        delay: Math.min(index, 3) * 35,
                        easing: "ease-out",
                      },
                    ),
                  );
                  observer?.unobserve(element);
                });
            },
            { threshold: 0.08 },
          )
        : null;
    const cards = main.querySelectorAll<HTMLElement>(
      "[data-reveal], .feature-card, .guide-card",
    );
    cards.forEach((card) => observer?.observe(card));
    function stopMotion() {
      animations.forEach((animation) => animation.cancel());
      observer?.disconnect();
    }
    function onPreferenceChange() {
      if (preference.matches) stopMotion();
    }
    preference.addEventListener?.("change", onPreferenceChange);
    return () => {
      preference.removeEventListener?.("change", onPreferenceChange);
      stopMotion();
    };
  }, [pathname]);

  return null;
}
