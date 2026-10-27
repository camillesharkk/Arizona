export function scrollUnderHeader(el: Element | null) {
  if (!el || typeof window === "undefined") return;
  const header = document.querySelector(".site-header");
  const offset = header ? header.getBoundingClientRect().bottom : 0;
  const top = el.getBoundingClientRect().top + window.scrollY - offset - 8;
  window.scrollTo({ top: Math.max(0, top), left: 0, behavior: "auto" });
}

export function scrollUnderHeaderAfterLayout(el: Element | null) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollUnderHeader(el));
  });
}
